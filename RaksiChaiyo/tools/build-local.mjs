#!/usr/bin/env node
// Local Android release build: `npm run build:local`
// (run `npm run setup:android` once first: it sets up this app's own JDK 17 + Android SDK)
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
//   --all-abis             build for every processor type, not only 64-bit ARM phones
//
// Env: BUILDS_DIR (default ../builds). JAVA_HOME + ANDROID_HOME (both) to use other tools.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const androidDir = path.join(appDir, 'android');
const appJsonPath = path.join(appDir, 'app.json');
const buildsDir = path.resolve(process.env.BUILDS_DIR ?? path.join(appDir, '..', 'builds'));
const isWindows = process.platform === 'win32';
// This app's own tools, from `npm run setup:android`.
const TOOLS = path.join(os.homedir(), '.nepalgunj-sips-android');

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
const findTools = () => {
  const own = { jdk: path.join(TOOLS, 'jdk17'), sdk: path.join(TOOLS, 'sdk') };
  const javac = (jdk) => path.join(jdk, 'bin', isWindows ? 'javac.exe' : 'javac');
  if (fs.existsSync(javac(own.jdk)) && fs.existsSync(path.join(own.sdk, 'platforms'))) return own;
  const { JAVA_HOME, ANDROID_HOME } = process.env;
  if (JAVA_HOME && ANDROID_HOME && fs.existsSync(javac(JAVA_HOME))) return { jdk: JAVA_HOME, sdk: ANDROID_HOME };
  return null;
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
  const result = spawnSync(command, commandArgs, { stdio: 'inherit', ...options });
  if (result.status !== 0) throw new Error(`${path.basename(command)} ${commandArgs[0] ?? ''} failed (exit ${result.status})`);
};

/** Edit generated Gradle files; stops if the template changed so a fix is not silently skipped. */
const patch = (file, edits) => {
  let text = fs.readFileSync(file, 'utf8');
  for (const [from, to] of edits) {
    if (typeof from === 'string' && !text.includes(from)) throw new Error(`${path.basename(file)} changed (looked for "${from.trim().slice(0, 50)}"): update tools/build-local.mjs`);
    text = text.replace(from, to);
  }
  fs.writeFileSync(file, text);
};

// ---------- preflight ----------
const tools = findTools();
if (!tools) fail(`This app's build tools are not set up yet. Run once:  npm run setup:android\n  (installs JDK 17 + the Android SDK in ${TOOLS})`);

const apiUrl = (option('--api-url') ?? process.env.EXPO_PUBLIC_API_URL ?? (lanIp() ? `http://${lanIp()}:5000` : null))?.replace(/\/$/, '');
if (!apiUrl) fail("Could not detect this PC's network address. Pass --api-url http://<ip>:5000");

// ---------- version bump ----------
const originalAppJson = fs.readFileSync(appJsonPath, 'utf8');
const appJson = JSON.parse(originalAppJson);
const expo = appJson.expo;
const previous = { version: expo.version, versionCode: expo.android.versionCode ?? 1 };

if (!flag('--no-bump')) {
  const [major, minor, patchNo] = expo.version.split('.').map(Number);
  expo.version = flag('--major') ? `${major + 1}.0.0` : flag('--minor') ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patchNo + 1}`;
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
  JDK         ${tools.jdk}
  Android SDK ${tools.sdk}
  output      ${path.join(buildsDir, 'android', tag)}`);

const buildEnv = {
  ...process.env,
  JAVA_HOME: tools.jdk,
  ANDROID_HOME: tools.sdk,
  ANDROID_SDK_ROOT: tools.sdk,
  EXPO_PUBLIC_API_URL: apiUrl,
  // Read by plugins/withLocalBuild.js: lets this build talk to the http:// backend.
  LOCAL_BUILD: '1',
  EXPO_NO_GIT_STATUS: '1',
  CI: '1',
};
// JDK first on the search path. Windows names it "Path" (any case), so change that same key.
const pathKey = Object.keys(buildEnv).find((k) => k.toLowerCase() === 'path') ?? 'PATH';
buildEnv[pathKey] = `${path.join(tools.jdk, 'bin')}${path.delimiter}${buildEnv[pathKey] ?? ''}`;

const startedAt = Date.now();
try {
  // Prebuild only when settings or libraries changed: a code-only change keeps android/ and its compiled C++ (minutes, not ten).
  const fingerprint = createHash('sha256')
    // app.json without its version numbers, so a version bump alone doesn't regenerate android/.
    .update(originalAppJson.replace(/"(version|versionCode|buildNumber)": [^,\n]+/g, ''))
    .update(['package.json', 'package-lock.json'].map((f) => fs.readFileSync(path.join(appDir, f), 'utf8')).join('\n'))
    .update(fs.readFileSync(fileURLToPath(import.meta.url)))
    .digest('hex');
  const stamp = path.join(androidDir, '.build-fingerprint');
  const fresh = flag('--clean') || !fs.existsSync(stamp) || fs.readFileSync(stamp, 'utf8').trim() !== fingerprint;
  const gradleFile = path.join(androidDir, 'app', 'build.gradle');

  if (fresh) {
    step('Generating the native Android project (expo prebuild)');
    // Prebuild rewrites the "android"/"ios" scripts in package.json to `expo run:*`: keep ours.
    const packageJson = fs.readFileSync(path.join(appDir, 'package.json'), 'utf8');
    try {
      run('npx', ['expo', 'prebuild', '--platform', 'android', '--no-install', '--clean'], { cwd: appDir, env: buildEnv, shell: isWindows });
    } finally {
      fs.writeFileSync(path.join(appDir, 'package.json'), packageJson);
    }
    patch(gradleFile, [
      // React Native's generated C++ has paths over 260 characters: CMake 3.31's ninja handles them, the default 3.22 stops.
      // Release lint checks are for store builds: skipped (about a minute).
      [
        'android {\n    ndkVersion rootProject.ext.ndkVersion\n',
        'android {\n    ndkVersion rootProject.ext.ndkVersion\n    externalNativeBuild {\n        cmake {\n            version "3.31.6"\n        }\n    }\n    lint {\n        checkReleaseBuilds false\n    }\n',
      ],
    ]);
    patch(path.join(androidDir, 'gradle.properties'), [
      [/^org\.gradle\.jvmargs=.*$/m, 'org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m'],
      [/$/, '\n# added by tools/build-local.mjs (faster local builds)\norg.gradle.caching=true\norg.gradle.daemon.idletimeout=600000\n'],
    ]);
    fs.writeFileSync(stamp, fingerprint);
  } else {
    step('Settings and libraries unchanged: keeping android/ and its compiled parts');
  }
  // The SDK, and CMake 3.31 for EVERY native module (react-native-worklets etc. too, not only the app):
  // its ninja handles Windows paths over 260 characters; 3.22's stops with "mkdir ... No such file or directory".
  const cmake = path.join(tools.sdk, 'cmake', '3.31.6');
  if (!fs.existsSync(cmake)) throw new Error(`CMake 3.31.6 is missing from ${tools.sdk}: run npm run setup:android`);
  const slash = (p) => p.replaceAll('\\', '/');
  fs.writeFileSync(path.join(androidDir, 'local.properties'), `sdk.dir=${slash(tools.sdk)}\ncmake.dir=${slash(cmake)}\n`);

  // Version from app.json (prebuild is skipped when only the version changed).
  patch(gradleFile, [
    [/versionCode \d+/, `versionCode ${versionCode}`],
    [/versionName "[^"]*"/, `versionName "${version}"`],
  ]);

  // Gradle takes ~4 GB, each parallel job ~0.5 GB, and Windows keeps ~1.5 GB.
  const freeGB = os.freemem() / 1024 ** 3;
  const workers = Math.max(2, Math.min(os.cpus().length, Math.floor((freeGB - 4 - 1.5) / 0.5)));
  step(`Building the release APK (Gradle, ${workers} jobs, ${freeGB.toFixed(1)} GB free). The first build takes 10-20 min.`);
  // 64-bit ARM only (nearly every Android phone since 2017): about 3x faster.
  const abis = flag('--all-abis') ? [] : ['-PreactNativeArchitectures=arm64-v8a'];
  const gradleArgs = ['assembleRelease', ...abis, `--max-workers=${workers}`, '--console=plain'];
  if (isWindows) run('cmd', ['/c', path.join(androidDir, 'gradlew.bat'), ...gradleArgs], { cwd: androidDir, env: buildEnv });
  else run('./gradlew', gradleArgs, { cwd: androidDir, env: buildEnv });

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
✔ Built ${fileName} (${(info.sizeBytes / 1e6).toFixed(1)} MB) in ${minutes} min
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
