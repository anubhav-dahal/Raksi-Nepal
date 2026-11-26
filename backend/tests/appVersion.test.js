import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';

// Point the server at a throwaway builds folder before the app loads its config.
const buildsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'builds-'));
process.env.APP_BUILDS_DIR = buildsDir;
const { app } = await import('./setup.js');

after(() => fs.rmSync(buildsDir, { recursive: true, force: true }));

describe('app version (local builds)', () => {
    test('no build yet: data is null', async () => {
        const res = await request(app).get('/api/app/version').expect(200);
        assert.equal(res.body.data, null);
    });

    test('returns the latest build and serves its APK', async () => {
        const dir = path.join(buildsDir, 'android', 'v1.0.1-b2');
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'NepalgunjSips-v1.0.1-b2.apk'), 'apk-bytes');
        fs.writeFileSync(
            path.join(buildsDir, 'android', 'latest.json'),
            JSON.stringify({ version: '1.0.1', versionCode: 2, file: 'v1.0.1-b2/NepalgunjSips-v1.0.1-b2.apk', notes: 'New wines', required: false })
        );

        const res = await request(app).get('/api/app/version').expect(200);
        assert.equal(res.body.data.versionCode, 2);
        assert.equal(res.body.data.notes, 'New wines');
        assert.match(res.body.data.downloadUrl, /\/downloads\/android\/v1\.0\.1-b2\/NepalgunjSips-v1\.0\.1-b2\.apk$/);

        const apk = await request(app).get(new URL(res.body.data.downloadUrl).pathname).expect(200);
        assert.equal(apk.headers['content-type'], 'application/vnd.android.package-archive');
        assert.equal(Number(apk.headers['content-length']), 'apk-bytes'.length);
        await request(app).get('/downloads/android/latest.apk').expect(200);
    });
});
