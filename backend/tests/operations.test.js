import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, startDB, stopDB } from './setup.js';
import { assignDemoRider, loginStaff, placeOrder, registerCustomer, variantOf } from './helpers.js';

before(startDB);
after(stopDB);

const setStatus = (admin, id, status) => request(app).patch(`/api/orders/${id}/status`).set(admin.auth).send({ status });

describe('staff roles', () => {
    test('admin routes refuse customers and riders', async () => {
        const customer = await registerCustomer();
        const rider = await loginStaff('rider');
        await request(app).get('/api/admin/orders').set(customer.auth).expect(403);
        await request(app).get('/api/admin/orders').set(rider.auth).expect(403);
        await request(app).get('/api/admin/orders').expect(401);
    });

    test('rider routes refuse customers and admins', async () => {
        const customer = await registerCustomer();
        const admin = await loginStaff('admin');
        await request(app).get('/api/rider/orders').set(customer.auth).expect(403);
        await request(app).get('/api/rider/orders').set(admin.auth).expect(403);
    });

    test('admin can make a registered user a rider', async () => {
        const admin = await loginStaff('admin');
        const person = await registerCustomer();
        const res = await request(app).post('/api/admin/staff').set(admin.auth).send({ phone: person.phone, role: 'rider' }).expect(200);
        assert.equal(res.body.data.role, 'rider');
        await request(app).post('/api/admin/staff').set(admin.auth).send({ phone: '9811122233', role: 'rider' }).expect(404);
    });
});

describe('admin orders and riders', () => {
    test('order queue lists active orders with the customer', async () => {
        const customer = await registerCustomer();
        const admin = await loginStaff('admin');
        const order = await placeOrder(customer);
        const res = await request(app).get('/api/admin/orders?status=active').set(admin.auth).expect(200);
        const found = res.body.data.find((o) => o.id === order.id);
        assert.equal(found.user.name, 'Test Customer');
    });

    test('a rider can only be assigned to a confirmed or preparing order', async () => {
        const customer = await registerCustomer();
        const admin = await loginStaff('admin');
        const rider = await loginStaff('rider');
        const order = await placeOrder(customer);

        await request(app).post(`/api/admin/orders/${order.id}/assign`).set(admin.auth).send({ riderId: rider.user.id }).expect(409);
        await setStatus(admin, order.id, 'confirmed').expect(200);
        const res = await request(app).post(`/api/admin/orders/${order.id}/assign`).set(admin.auth).send({ riderId: rider.user.id }).expect(200);
        assert.equal(res.body.data.rider.name, 'Demo Rider');

        // Not a rider:
        await request(app).post(`/api/admin/orders/${order.id}/assign`).set(admin.auth).send({ riderId: admin.user.id }).expect(400);
    });

    test('riders list shows how many active orders each has', async () => {
        const admin = await loginStaff('admin');
        const res = await request(app).get('/api/admin/riders').set(admin.auth).expect(200);
        assert.ok(res.body.data.some((r) => r.name === 'Demo Rider' && typeof r.activeOrders === 'number'));
    });

    test('summary counts', async () => {
        const admin = await loginStaff('admin');
        const res = await request(app).get('/api/admin/summary').set(admin.auth).expect(200);
        assert.equal(typeof res.body.data.todayOrders, 'number');
        assert.ok(res.body.data.lowStockProducts >= 1);
    });
});

describe('rider deliveries', () => {
    test('rider picks up and delivers their own order; COD becomes paid', async () => {
        const customer = await registerCustomer();
        const admin = await loginStaff('admin');
        const order = await placeOrder(customer);
        await setStatus(admin, order.id, 'confirmed').expect(200);
        const rider = await assignDemoRider(admin, order.id);

        const mine = await request(app).get('/api/rider/orders').set(rider.auth).expect(200);
        assert.ok(mine.body.data.some((o) => o.id === order.id));

        // Too early: still "confirmed".
        await request(app).post(`/api/rider/orders/${order.id}/status`).set(rider.auth).send({ status: 'out_for_delivery' }).expect(409);
        await setStatus(admin, order.id, 'preparing').expect(200);

        await request(app).post(`/api/rider/orders/${order.id}/status`).set(rider.auth).send({ status: 'out_for_delivery' }).expect(200);
        const done = await request(app).post(`/api/rider/orders/${order.id}/status`).set(rider.auth).send({ status: 'delivered' }).expect(200);
        assert.equal(done.body.data.status, 'delivered');
        assert.equal(done.body.data.payment.status, 'paid');
    });

    test('a rider cannot touch an order assigned to someone else', async () => {
        const customer = await registerCustomer();
        const admin = await loginStaff('admin');
        const other = await registerCustomer();
        await request(app).post('/api/admin/staff').set(admin.auth).send({ phone: other.phone, role: 'rider' }).expect(200);
        const otherRider = { auth: other.auth };

        const order = await placeOrder(customer);
        await setStatus(admin, order.id, 'confirmed').expect(200);
        await setStatus(admin, order.id, 'preparing').expect(200);
        await assignDemoRider(admin, order.id);

        await request(app).post(`/api/rider/orders/${order.id}/status`).set(otherRider.auth).send({ status: 'out_for_delivery' }).expect(404);
        await request(app).get(`/api/orders/${order.id}`).set(otherRider.auth).expect(404);
    });
});

describe('products, prices and stock audit', () => {
    test('price change does not alter existing orders', async () => {
        const customer = await registerCustomer();
        const admin = await loginStaff('admin');
        const { product, variant } = await variantOf('dalmoth');
        const order = await placeOrder(customer, { slug: 'dalmoth' });

        await request(app)
            .patch(`/api/admin/products/${product.id}/variants/${variant.sku}`)
            .set(admin.auth)
            .send({ price: variant.price + 50 })
            .expect(200);

        const after = await variantOf('dalmoth');
        assert.equal(after.variant.price, variant.price + 50);
        const old = await request(app).get(`/api/orders/${order.id}`).set(customer.auth).expect(200);
        assert.equal(old.body.data.items[0].price, variant.price);
    });

    test('restock and adjustments are recorded with who and why; stock never goes below 0', async () => {
        const admin = await loginStaff('admin');
        const { product, variant } = await variantOf('pringles');
        const url = `/api/admin/products/${product.id}/variants/${variant.sku}/stock`;

        const up = await request(app).post(url).set(admin.auth).send({ delta: 24, reason: 'restock', note: 'Weekly delivery' }).expect(200);
        assert.equal(up.body.data.stock, variant.stock + 24);
        await request(app).post(url).set(admin.auth).send({ delta: -1000, reason: 'damaged' }).expect(409);

        const moves = await request(app).get(`/api/admin/products/${product.id}/stock-movements`).set(admin.auth).expect(200);
        const restock = moves.body.data.find((m) => m.reason === 'restock');
        assert.equal(restock.delta, 24);
        assert.equal(restock.note, 'Weekly delivery');
        assert.equal(restock.by.name, 'Demo Admin');
    });

    test('orders and cancellations appear in the stock audit', async () => {
        const customer = await registerCustomer();
        const admin = await loginStaff('admin');
        const { product } = await variantOf('cheese-balls');
        const order = await placeOrder(customer, { slug: 'cheese-balls', quantity: 1 });
        await request(app).post(`/api/orders/${order.id}/cancel`).set(customer.auth).expect(200);

        const moves = await request(app).get(`/api/admin/products/${product.id}/stock-movements`).set(admin.auth).expect(200);
        const reasons = moves.body.data.map((m) => `${m.reason}:${m.delta}:${m.order?.orderNumber}`);
        assert.ok(reasons.includes(`order:-1:${order.orderNumber}`));
        assert.ok(reasons.includes(`order_cancelled:1:${order.orderNumber}`));
    });

    test('hiding a product removes it from the shop but not from admin', async () => {
        const admin = await loginStaff('admin');
        const { product } = await variantOf('mineral-water');
        await request(app).patch(`/api/admin/products/${product.id}`).set(admin.auth).send({ isActive: false }).expect(200);

        const shop = await request(app).get('/api/products').expect(200);
        assert.ok(!shop.body.data.some((p) => p.id === product.id));
        const all = await request(app).get('/api/admin/products').set(admin.auth).expect(200);
        assert.ok(all.body.data.some((p) => p.id === product.id && p.isActive === false));
    });

    test('push token registration validates the token', async () => {
        const customer = await registerCustomer();
        await request(app).post('/api/users/me/push-token').set(customer.auth).send({ token: 'ExponentPushToken[abc123]' }).expect(204);
        await request(app).post('/api/users/me/push-token').set(customer.auth).send({ token: 'nope' }).expect(400);
    });
});
