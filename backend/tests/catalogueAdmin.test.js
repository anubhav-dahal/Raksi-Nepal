import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { app, startDB, stopDB } from './setup.js';
import { loginStaff, registerCustomer } from './helpers.js';
import { UPLOAD_DIR } from '../src/middleware/upload.js';

before(startDB);
after(stopDB);

// Smallest valid PNG (1x1).
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

describe('image uploads', () => {
    test('admin uploads a PNG and it is served back', async () => {
        const admin = await loginStaff('admin');
        const res = await request(app)
            .post('/api/admin/uploads')
            .set(admin.auth)
            .attach('image', PNG, { filename: 'logo.png', contentType: 'image/png' })
            .expect(201);
        assert.match(res.body.data.url, /^\/static\/uploads\/[0-9a-f]{24}\.png$/);
        await request(app).get(res.body.data.url).expect(200).expect('Content-Type', /image\/png/);
        fs.rmSync(path.join(UPLOAD_DIR, path.basename(res.body.data.url)), { force: true });
    });

    test('rejects non-images and non-admins', async () => {
        const admin = await loginStaff('admin');
        const customer = await registerCustomer();
        await request(app)
            .post('/api/admin/uploads')
            .set(admin.auth)
            .attach('image', Buffer.from('hello'), { filename: 'a.txt', contentType: 'text/plain' })
            .expect(400);
        await request(app).post('/api/admin/uploads').set(admin.auth).expect(400);
        await request(app)
            .post('/api/admin/uploads')
            .set(customer.auth)
            .attach('image', PNG, { filename: 'x.png', contentType: 'image/png' })
            .expect(403);
    });
});

describe('admin categories and products', () => {
    test('create a category, add a product with sizes, and it shows in the shop', async () => {
        const admin = await loginStaff('admin');

        const cat = await request(app)
            .post('/api/admin/categories')
            .set(admin.auth)
            .send({ name: 'Wine & Cider', image: '/static/uploads/abc.jpg', alcoholic: true })
            .expect(201);
        assert.equal(cat.body.data.slug, 'wine-cider');
        assert.equal(cat.body.data.sortOrder, 5, 'goes after the 4 seeded categories');

        const prod = await request(app)
            .post('/api/admin/products')
            .set(admin.auth)
            .send({
                categoryId: cat.body.data.id,
                name: 'Divine Red',
                description: 'Nepali red wine.',
                image: '/static/uploads/red.jpg',
                variants: [
                    { label: '750 ml bottle', price: 1450, stock: 12 },
                    { label: '375 ml bottle', price: 800, stock: 0 },
                ],
            })
            .expect(201);
        const p = prod.body.data;
        assert.equal(p.alcoholic, true, 'copied from the category');
        assert.match(p.variants[0].sku, /^WINE-DIVINE-RED-750MLBOTTL-[0-9A-F]{4}$/);

        const shop = await request(app).get('/api/products?category=wine-cider').expect(200);
        assert.deepEqual(shop.body.data.map((x) => x.name.en), ['Divine Red']);

        // Opening stock is in the audit trail.
        const moves = await request(app).get(`/api/admin/products/${p.id}/stock-movements`).set(admin.auth).expect(200);
        assert.equal(moves.body.data.length, 1);
        assert.equal(moves.body.data[0].note, 'Opening stock');

        // A size can be added later, and the product can be ordered by its new SKU.
        const more = await request(app)
            .post(`/api/admin/products/${p.id}/variants`)
            .set(admin.auth)
            .send({ label: '1.5 L', price: 2700, stock: 4 })
            .expect(201);
        assert.equal(more.body.data.variants.length, 3);
        const quote = await request(app)
            .post('/api/orders/quote')
            .send({ items: [{ sku: more.body.data.variants[2].sku, quantity: 1 }] })
            .expect(200);
        assert.equal(quote.body.data.subtotal, 2700);
    });

    test('edit a category (photo, hide) and move a product to another category', async () => {
        const admin = await loginStaff('admin');
        const cats = (await request(app).get('/api/admin/categories').set(admin.auth).expect(200)).body.data;
        const snacks = cats.find((c) => c.slug === 'snacks');
        const beer = cats.find((c) => c.slug === 'beer');
        assert.ok(snacks.productCount > 0);

        await request(app)
            .patch(`/api/admin/categories/${snacks.id}`)
            .set(admin.auth)
            .send({ image: '/static/uploads/new-snacks.jpg', name: 'Snacks & Nuts' })
            .expect(200);
        const shopCats = (await request(app).get('/api/categories')).body.data;
        assert.equal(shopCats.find((c) => c.slug === 'snacks').name.en, 'Snacks & Nuts');

        const products = (await request(app).get('/api/admin/products').set(admin.auth)).body.data;
        const chips = products.find((x) => x.slug === 'lays-classic');
        const moved = await request(app)
            .patch(`/api/admin/products/${chips.id}`)
            .set(admin.auth)
            .send({ categoryId: beer.id, image: '/static/uploads/lays.png' })
            .expect(200);
        assert.equal(moved.body.data.alcoholic, true);
        assert.equal(moved.body.data.image, '/static/uploads/lays.png');

        await request(app).patch(`/api/admin/categories/${snacks.id}`).set(admin.auth).send({ isActive: false }).expect(200);
        const after = (await request(app).get('/api/categories')).body.data;
        assert.ok(!after.some((c) => c.slug === 'snacks'));
    });

    test('validation: images must be uploads or https, a product needs a size', async () => {
        const admin = await loginStaff('admin');
        await request(app).post('/api/admin/categories').set(admin.auth).send({ name: 'Bad', image: 'javascript:alert(1)' }).expect(400);
        const cats = (await request(app).get('/api/admin/categories').set(admin.auth)).body.data;
        await request(app)
            .post('/api/admin/products')
            .set(admin.auth)
            .send({ categoryId: cats[0].id, name: 'No sizes', image: '', variants: [] })
            .expect(400);
    });
});

describe('one admin', () => {
    test('nobody can be made admin through the API, and the admin cannot be demoted', async () => {
        const admin = await loginStaff('admin');
        const person = await registerCustomer();
        await request(app).post('/api/admin/staff').set(admin.auth).send({ phone: person.phone, role: 'admin' }).expect(400);
        await request(app).post('/api/admin/staff').set(admin.auth).send({ phone: admin.user.phone, role: 'rider' }).expect(400);
    });

    test('ADMIN_PHONE becomes the only admin', async () => {
        const { seedAdminFromEnv } = await import('../src/seed/staff.js');
        const { User } = await import('../src/models/UserModel.js');
        process.env.ADMIN_PHONE = '+977 985-1112223';
        process.env.ADMIN_PASSWORD = 'owner-password-1';
        try {
            const admin = await seedAdminFromEnv();
            assert.equal(admin.phone, '9851112223');
            const admins = await User.find({ role: 'admin' });
            assert.deepEqual(admins.map((a) => a.phone), ['9851112223']);
            await request(app).post('/api/users/login').send({ phone: '9851112223', password: 'owner-password-1' }).expect(200);
        } finally {
            delete process.env.ADMIN_PHONE;
            delete process.env.ADMIN_PASSWORD;
        }
    });
});
