import os from 'node:os';
import { readLatest } from '../controllers/appVersionController.js';

/** This PC's Wi-Fi/LAN address, the one phones on the same network use. */
const lanIp = () => {
    const addresses = Object.values(os.networkInterfaces())
        .flat()
        .filter((a) => a && a.family === 'IPv4' && !a.internal)
        .map((a) => a.address);
    return addresses.find((a) => a.startsWith('192.168.')) ?? addresses.find((a) => a.startsWith('10.')) ?? addresses[0] ?? 'localhost';
};

/** Startup instructions for installing / updating the local Android build. */
export const printAppBuildBanner = (port, publicUrl) => {
    const base = publicUrl ?? `http://${lanIp()}:${port}`;
    const latest = readLatest('android');

    if (!latest) {
        console.log('\nNo local app build yet. Build one with: cd RaksiChaiyo && npm run build:local\n');
        return;
    }

    const { version, versionCode, apiUrl } = latest.info;
    const lines = [
        `Android app build v${version} (build ${versionCode}) is being served.`,
        `  First install: on the phone (same Wi-Fi), open ${base}/downloads/android/latest.apk`,
        '                 and allow "Install unknown apps" for the browser when asked.',
        '  Update:        phones with an older build get an "Update available" prompt when',
        '                 they open the app. Tap "Update now", then tap the downloaded file.',
        '  New build:     cd RaksiChaiyo && npm run build:local  (restart not needed)',
    ];
    if (apiUrl && !apiUrl.startsWith(base)) {
        lines.push(`  Warning:       that build talks to ${apiUrl}, but this server is at ${base}.`);
        lines.push('                 Phones can\'t reach it or see updates. Rebuild, or pass --api-url.');
    }
    console.log(`\n${lines.join('\n')}\n`);
};
