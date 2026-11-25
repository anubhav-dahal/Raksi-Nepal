import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, startDB, stopDB } from './setup.js';

before(startDB);
after(stopDB);

describe('catalogue API', () => {
    test('GET /api/health', async () => {
        const res = await request(app).get('/api/health').expect(200);
        assert.equal(res.body.status, 'OK');
    });

    test('GET /api/categories returns sorted active categories', async () => {
        const res = await request(app).get('/api/categories').expect(200);
        assert.deepEqual(
            res.body.data.map((c) => c.slug),
            ['beer', 'soft-drinks', 'snacks', 'hard-drinks']
        );
        assert.ok(res.body.data[0].id, 'exposes id');
        assert.equal(res.body.data[0]._id, undefined, 'hides _id');
    });

    test('GET /api/products?category=<slug> filters', async () => {
        const res = await request(app).get('/api/products?category=beer').expect(200);
        assert.ok(res.body.data.length >= 5);
        assert.ok(res.body.data.every((p) => p.alcoholic === true));
    });

    test('catalogue has 20+ products', async () => {
        const res = await request(app).get('/api/products').expect(200);
        assert.ok(res.body.data.length >= 20);
    });

    test('GET /api/products/:id returns detail with category', async () => {
        const list = await request(app).get('/api/products?category=snacks');
        const id = list.body.data[0].id;
        const res = await request(app).get(`/api/products/${id}`).expect(200);
        assert.equal(res.body.data.category.slug, 'snacks');
        assert.ok(res.body.data.variants[0].sku);
    });

    test('unknown product id gives 404, bad id gives 400', async () => {
        const missing = await request(app).get('/api/products/507f1f77bcf86cd799439011').expect(404);
        assert.equal(missing.body.error.code, 'NOT_FOUND');
        const bad = await request(app).get('/api/products/not-an-id').expect(400);
        assert.equal(bad.body.error.code, 'BAD_REQUEST');
        assert.equal(bad.body.error.details[0].field, 'params.id');
    });

    test('unknown category gives 404, unknown route gives 404', async () => {
        await request(app).get('/api/products?category=wine').expect(404);
        const res = await request(app).get('/api/nope').expect(404);
        assert.equal(res.body.error.code, 'NOT_FOUND');
    });
});
