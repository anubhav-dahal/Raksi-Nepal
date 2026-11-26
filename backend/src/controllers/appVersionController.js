import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

// Folder written by `npm run build:local` in the app (RaksiChaiyo/tools/build-local.mjs).
export const BUILDS_DIR = path.resolve(
    env.APP_BUILDS_DIR ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'builds')
);

const baseUrl = (req) => env.PUBLIC_URL ?? `${req.protocol}://${req.get('host')}`;

/** latest.json for a platform, or null when nothing has been built yet. */
export const readLatest = (platform) => {
    try {
        const info = JSON.parse(fs.readFileSync(path.join(BUILDS_DIR, platform, 'latest.json'), 'utf8'));
        const file = path.join(BUILDS_DIR, platform, info.file);
        return fs.existsSync(file) ? { info, file } : null;
    } catch {
        return null;
    }
};

/** GET /api/app/version: the newest local Android build, so installed apps can prompt to update. */
export const getLatestVersion = (req, res) => {
    const latest = readLatest('android');
    if (!latest) return res.json({ data: null });
    const { version, versionCode, notes, required, sizeBytes, builtAt } = latest.info;
    res.set('Cache-Control', 'no-store');
    res.json({
        data: {
            version,
            versionCode,
            notes: notes || null,
            required: !!required,
            sizeBytes,
            builtAt,
            downloadUrl: `${baseUrl(req)}/downloads/android/${latest.info.file.split('/').map(encodeURIComponent).join('/')}`,
        },
    });
};

/** GET /downloads/android/latest.apk: easy link for the first install. */
export const downloadLatestApk = (req, res, next) => {
    const latest = readLatest('android');
    if (!latest) return next();
    res.download(latest.file, path.basename(latest.file));
};
