#!/usr/bin/env node
// Local Android release build: `npm run build:local`
//
// 1. Bumps the version in app.json (patch by default, versionCode +1 always).
// 2. Bakes the backend address into the app (your PC's Wi-Fi IP, port 5000).
// 3. Runs `expo prebuild` + Gradle `assembleRelease` on this machine
//    (what `eas build --local` does, but it also works on Windows).
// 4. Copies the APK to ../builds/android/v<version>-b<code>/ and updates
//    ../builds/android/latest.json, which the backend serves so installed
//    apps prompt to update.
//
// Options:
//   --minor | --major      bump that part instead of the patch number
//   --no-bump              rebuild the current version (same versionCode)
//   --notes "text"         "What's new" text shown in the update prompt
//   --required             the update prompt has no "Later" button
//   --api-url <url>        backend address (default: EXPO_PUBLIC_API_URL or this PC's LAN IP)
//   --clean                regenerate the android/ folder from scratch
//
// Env: BUILDS_DIR (default ../builds), JAVA_HOME, ANDROID_HOME.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appJsonPath = path.join(appDir, 'app.json');
const buildsDir = path.resolve(process.env.BUILDS_DIR ?? path.join(appDir, '..', 'builds'));
const isWindows = process.platform === 'win32';

// ---------- arguments ----------
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const fail = (message) => {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
};
const step = (message) => console.log(`\n▶ ${message}`);

// ---------- toolchain ----------
const javaMajor = (javaHome) => {
  const release = path.join(javaHome, 'release');
  if (!fs.existsSync(release)) return null;
  const match = fs.readFileSync(release, 'utf8').match(/JAVA_VERSION="(\d+)(?:\.(\d+))?/);
  if (!match) return null;
  return match[1] === '1' ? Number(match[2]) : Number(match[1]);
};

/** A JDK 17+ for Gradle. Prefers 17/21 (what React Native tests with). */
const findJdk = () => {
  const candidates = [];
  if (process.env.JAVA_HOME) candidates.push(process.env.JAVA_HOME);
  const roots = isWindows
    ? [
        'C:/Program Files/Android/Android Studio/jbr',
        'C:/Program Files/Eclipse Adoptium',
        'C:/Program Files/Java',
        'C:/Program Files/Microsoft',
        'C:/Program Files/Zulu',
      ]
    : ['/Applications/Android Studio.app/Contents/jbr/Contents/Home', '/usr/lib/jvm', '/Library/Java/JavaVirtualMachines'];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    if (fs.existsSync(path.join(root, 'release'))) candidates.push(root);
    for (const entry of fs.readdirSync(root)) {
      const home = path.join(root, entry);
      candidates.push(home, path.join(home, 'Contents', 'Home'));
    }
  }
  const jdks = candidates
    .map((home) => ({ home, major: javaMajor(home) }))
    .filter((j) => j.major && j.major >= 17 && fs.existsSync(path.join(j.home, 'bin', isWindows ? 'javac.exe' : 'javac')));
  const rank = (major) => (major === 17 || major === 21 ? 0 : 1);
  jdks.sort((a, b) => rank(a.major) - rank(b.major) || a.major - b.major);
  return jdks[0] ?? null;
};

const findAndroidSdk = () => {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    isWindows && process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk'),
    path.join(os.homedir(), 'Library', 'Android', 'sdk'),
    path.join(os.homedir(), 'Android', 'Sdk'),
  ].filter(Boolean);
  return candidates.find((dir) => fs.existsSync(path.join(dir, 'platform-tools')) || fs.existsSync(path.join(dir, 'platforms'))) ?? null;
};

/** This PC's Wi-Fi/LAN address, so a phone on the same network can reach the backend. */
const lanIp = () => {
  const addresses = Object.values(os.networkInterfaces())
    .flat()
    .filter((a) => a && a.family === 'IPv4' && !a.internal)
    .map((a) => a.address);
  return addresses.find((a) => a.startsWith('192.168.')) ?? addresses.find((a) => a.startsWith('10.')) ?? addresses[0] ?? null;
};

const run = (command, commandArgs, options) => {
  const result = spawnSync(command, commandArgs, { stdio: 'inherit', shell: isWindows, ...options });
  if (result.status !== 0) throw new Error(`${command} ${commandArgs.join(' ')} failed (exit ${result.status})`);
};

// ---------- preflight ----------
const jdk = findJdk();
if (!jdk) {
  fail(
    'No JDK 17 or newer found. Install JDK 17 (https://adoptium.net/temurin/releases/?version=17) or Android Studio,\n' +
      '  or set JAVA_HOME to a JDK 17+ folder.'
  );
}
const sdk = findAndroidSdk();
if (!sdk) {
  fail(
    'Android SDK not found. Install Android Studio (https://developer.android.com/studio), open it once so it\n' +
      '  downloads the SDK, or set ANDROID_HOME to the SDK folder (usually %LOCALAPPDATA%\\Android\\Sdk).'
  );
}

const apiUrl = (option('--api-url') ?? process.env.EXPO_PUBLIC_API_URL ?? (lanIp() ? `http://${lanIp()}:5000` : null))?.replace(/\/$/, '');
if (!apiUrl) fail('Could not detect this PC\'s network address. Pass --api-url http://<ip>:5000');

// ---------- version bump ----------
const originalAppJson = fs.readFileSync(appJsonPath, 'utf8');
const appJson = JSON.parse(originalAppJson);
const expo = appJson.expo;
const previous = { version: expo.version, versionCode: expo.android.versionCode ?? 1 };

if (!flag('--no-bump')) {
  const [major, minor, patch] = expo.version.split('.').map(Number);
  expo.version = flag('--major') ? `${major + 1}.0.0` : flag('--minor') ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
  expo.android.versionCode = previous.versionCode + 1;
  if (expo.ios) expo.ios.buildNumber = String(Number(expo.ios.buildNumber ?? 0) + 1);
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
}
const { version } = expo;
const versionCode = expo.android.versionCode;
const tag = `v${version}-b${versionCode}`;

console.log(`
Nepalgunj Sips local build
  version     ${previous.version} (${previous.versionCode}) → ${version} (${versionCode})
  backend     ${apiUrl}
  JDK         ${jdk.major} (${jdk.home})
  Android SDK ${sdk}
  output      ${path.join(buildsDir, 'android', tag)}`);

const buildEnv = {
  ...process.env,
  JAVA_HOME: jdk.home,
  ANDROID_HOME: sdk,
  ANDROID_SDK_ROOT: sdk,
  PATH: `${path.join(jdk.home, 'bin')}${path.delimiter}${process.env.PATH}`,
  EXPO_PUBLIC_API_URL: apiUrl,
  // Read by plugins/withLocalBuild.js: lets this build talk to the http:// backend.
  LOCAL_BUILD: '1',
  EXPO_NO_GIT_STATUS: '1',
};

const startedAt = Date.now();
try {
  const androidDir = path.join(appDir, 'android');
  step('Generating the native Android project (expo prebuild)');
  const clean = flag('--clean') || !fs.existsSync(androidDir);
  run('npx', ['expo', 'prebuild', '--platform', 'android', '--no-install', ...(clean ? ['--clean'] : [])], {
    cwd: appDir,
    env: buildEnv,
  });

  step('Building the release APK (Gradle). The first build takes a while.');
  run(isWindows ? 'gradlew.bat' : './gradlew', ['assembleRelease'], { cwd: androidDir, env: buildEnv });

  const apk = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
  if (!fs.existsSync(apk)) throw new Error(`Gradle finished but ${apk} is missing`);

  // ---------- copy to builds/ ----------
  const outDir = path.join(buildsDir, 'android', tag);
  fs.mkdirSync(outDir, { recursive: true });
  const fileName = `NepalgunjSips-${tag}.apk`;
  fs.copyFileSync(apk, path.join(outDir, fileName));

  const info = {
    version,
    versionCode,
    file: `${tag}/${fileName}`,
    sizeBytes: fs.statSync(apk).size,
    apiUrl,
    notes: option('--notes') ?? '',
    required: flag('--required'),
    builtAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(outDir, 'build.json'), JSON.stringify(info, null, 2) + '\n');
  fs.writeFileSync(path.join(buildsDir, 'android', 'latest.json'), JSON.stringify(info, null, 2) + '\n');

  const minutes = ((Date.now() - startedAt) / 60000).toFixed(1);
  console.log(`
✔ Built ${fileName} in ${minutes} min
  ${path.join(outDir, fileName)}

  Start the backend (cd backend && npm run dev). Phones running an older build
  will be asked to update the next time they open the app. First install:
  open ${apiUrl}/downloads/android/latest.apk on the phone.
`);
} catch (error) {
  // Undo the version bump so a failed build doesn't skip a number.
  fs.writeFileSync(appJsonPath, originalAppJson);
  fail(`${error.message}\n  app.json restored to ${previous.version} (${previous.versionCode}).`);
}
