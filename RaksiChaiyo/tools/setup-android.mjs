#!/usr/bin/env node
// npm run setup:android  (once per PC)
//
// Sets up this app's own build tools, without admin rights and without
// touching the Java already installed: a portable JDK 17 and the Android SDK
// (command-line tools, platform 37, build-tools 37, the NDK and CMake that
// React Native 0.88 compiles with), all in ~/.nepalgunj-sips-android.
//
// If another app on this PC already set up the same tools
// (~/.personal-hub-android), they are copied from there: no 3 GB download.
// Running it again only adds what is missing.
import { execFileSync } from 'node:child_process';
import { cpSync, createWriteStream, existsSync, mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export const TOOLS = path.join(os.homedir(), '.nepalgunj-sips-android');
export const JDK = path.join(TOOLS, 'jdk17');
export const SDK = path.join(TOOLS, 'sdk');
const SHARED = path.join(os.homedir(), '.personal-hub-android');
const PACKAGES = [
  'platform-tools',
  'platforms;android-37.0',
  'build-tools;37.0.0',
  'ndk;27.1.12297006',
  'cmake;3.22.1',
  'cmake;3.31.6', // its ninja handles Windows paths over 260 characters (React Native's generated C++)
];
const isWindows = process.platform === 'win32';
const say = (m) => console.log(`[setup] ${m}`);

if (!isWindows) {
  console.error('[setup] This script sets up Windows tools. On macOS/Linux install JDK 17 and Android Studio, or use `eas build --local`.');
  process.exit(1);
}

async function download(url, file) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok || !res.body) throw new Error(`download failed (${res.status}): ${url}`);
  const total = Number(res.headers.get('content-length')) || 0;
  let got = 0;
  let shown = -1;
  const body = Readable.fromWeb(res.body);
  body.on('data', (chunk) => {
    got += chunk.length;
    const pct = total ? Math.floor((got / total) * 10) * 10 : -1;
    if (pct !== shown && pct >= 0) {
      shown = pct;
      process.stdout.write(`\r[setup]   ${path.basename(file)} ${pct}%   `);
    }
  });
  await pipeline(body, createWriteStream(file));
  process.stdout.write('\n');
}

// Windows' own tar opens zips (Git Bash's GNU tar, found first on PATH there, cannot).
const TAR = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe');
const unzip = (zip, into) => {
  mkdirSync(into, { recursive: true });
  execFileSync(TAR, ['-xf', zip, '-C', into], { stdio: 'inherit' });
};

mkdirSync(TOOLS, { recursive: true });

// 1. JDK 17 (Eclipse Temurin), portable
if (!existsSync(path.join(JDK, 'bin', 'java.exe'))) {
  if (existsSync(path.join(SHARED, 'jdk17', 'bin', 'java.exe'))) {
    say(`copying JDK 17 from ${SHARED}…`);
    cpSync(path.join(SHARED, 'jdk17'), JDK, { recursive: true });
  } else {
    say('downloading JDK 17 (Eclipse Temurin)…');
    const zip = path.join(TOOLS, 'jdk17.zip');
    if (!existsSync(zip)) await download('https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse', zip);
    const tmp = path.join(TOOLS, 'jdk-unpack');
    rmSync(tmp, { recursive: true, force: true });
    unzip(zip, tmp);
    renameSync(path.join(tmp, readdirSync(tmp).find((d) => d.startsWith('jdk'))), JDK);
    rmSync(tmp, { recursive: true, force: true });
    rmSync(zip, { force: true });
  }
}
say(`JDK 17: ${JDK}`);

// 2. The Android SDK: copied from the other app's tools, or the newest command-line tools from Google
const sdkmanager = path.join(SDK, 'cmdline-tools', 'latest', 'bin', 'sdkmanager.bat');
if (!existsSync(sdkmanager)) {
  if (existsSync(path.join(SHARED, 'sdk', 'cmdline-tools', 'latest', 'bin', 'sdkmanager.bat'))) {
    say(`copying the Android SDK from ${SHARED} (a few GB, a few minutes)…`);
    cpSync(path.join(SHARED, 'sdk'), SDK, { recursive: true });
  } else {
    say('finding the newest Android command-line tools…');
    const xml = await (await fetch('https://dl.google.com/android/repository/repository2-3.xml')).text();
    const builds = [...xml.matchAll(/commandlinetools-win-(\d+)_latest\.zip/g)].map((m) => Number(m[1]));
    if (!builds.length) throw new Error("the command-line tools were not found in Google's list");
    const zip = path.join(TOOLS, 'cmdline-tools.zip');
    if (!existsSync(zip)) await download(`https://dl.google.com/android/repository/commandlinetools-win-${Math.max(...builds)}_latest.zip`, zip);
    const tmp = path.join(TOOLS, 'cmdline-unpack');
    rmSync(tmp, { recursive: true, force: true });
    unzip(zip, tmp);
    mkdirSync(path.join(SDK, 'cmdline-tools'), { recursive: true });
    renameSync(path.join(tmp, 'cmdline-tools'), path.join(SDK, 'cmdline-tools', 'latest'));
    rmSync(tmp, { recursive: true, force: true });
    rmSync(zip, { force: true });
  }
}

// 3. The licence, then the SDK parts the app builds with (already-installed ones are skipped)
const env = { ...process.env, JAVA_HOME: JDK, ANDROID_HOME: SDK, ANDROID_SDK_ROOT: SDK };
say('accepting the Android SDK licence…');
execFileSync(`"${sdkmanager}"`, ['--licenses'], { env, shell: true, input: 'y\n'.repeat(40), stdio: ['pipe', 'ignore', 'inherit'] });
say(`checking ${PACKAGES.join(', ')} (the NDK is about 1 GB if it has to be downloaded)…`);
// Each name quoted: the shell would split "platforms;android-37.0" at the ";".
execFileSync(`"${sdkmanager}"`, PACKAGES.map((p) => `"${p}"`), { env, stdio: 'inherit', shell: true });
say(`done. Android SDK: ${SDK}`);
say('Next: npm run build:local');
