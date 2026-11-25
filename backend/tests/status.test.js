import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, startDB, stopDB } from './setup.js';
import { loginStaff, placeOrder, registerCustomer, variantOf } from './helpers.js';

before(startDB);
after(stopDB);

const setStatus = (admin, id, status) =>
    request(app).patch(`/api/orders/${id}/status`).set(admin.auth).send({ status });

describe('order status', () => {
    test('happy path to delivered; COD becomes paid on delivery', async () => {
        const customer = await registerCustomer();
        const admin = await loginStaff('admin');
        const order = await placeOrder(customer);

        for (const status of ['confirmed', 'preparing', 'out_for_delivery']) {
            const res = await setStatus(admin, order.id, status).expect(200);
            assert.equal(res.body.data.status, status);
            assert.equal(res.body.data.payment.status, 'pending');
        }
        const done = await setStatus(admin, order.id, 'delivered').expect(200);
        assert.equal(done.body.data.payment.status, 'paid');
        assert.deepEqual(
            done.body.data.statusHistory.map((h) => h.status),
            ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']
        );
    });

    test('invalid transitions are rejected', async () => {
        const customer = await registerCustomer();
        const admin = await loginStaff('admin');
        const order = await placeOrder(customer);

        const skip = await setStatus(admin, order.id, 'delivered').expect(409);
        assert.match(skip.body.error.message, /Cannot change/);
        await setStatus(admin, order.id, 'cancelled').expect(200);
        await setStatus(admin, order.id, 'confirmed').expect(409);
    });

    test('only admins can change status', async () => {
        const customer = await registerCustomer();
        const rider = await loginStaff('rider');
        const order = await placeOrder(customer);
        await setStatus(customer, order.id, 'confirmed').expect(403);
        await setStatus(rider, order.id, 'confirmed').expect(403);
    });

    test('customer can cancel a pending order and stock comes back', async () => {
        const customer = await registerCustomer();
        const before = await variantOf('sprite');
        const order = await placeOrder(customer, { slug: 'sprite', quantity: 4 });

        const res = await request(app).post(`/api/orders/${order.id}/cancel`).set(customer.auth).expect(200);
        assert.equal(res.body.data.status, 'cancelled');
        const after = await variantOf('sprite');
        assert.equal(after.variant.stock, before.variant.stock);

        // Cancelling again does not give stock back twice.
        await request(app).post(`/api/orders/${order.id}/cancel`).set(customer.auth).expect(409);
        assert.equal((await variantOf('sprite')).variant.stock, before.variant.stock);
    });

    test('customer cannot cancel once confirmed, or cancel someone else\'s order', async () => {
        const customer = await registerCustomer();
        const other = await registerCustomer();
        const admin = await loginStaff('admin');
        const order = await placeOrder(customer);

        await request(app).post(`/api/orders/${order.id}/cancel`).set(other.auth).expect(404);
        await setStatus(admin, order.id, 'confirmed').expect(200);
        await request(app).post(`/api/orders/${order.id}/cancel`).set(customer.auth).expect(409);
    });

    test('admin can look an order up by its number', async () => {
        const customer = await registerCustomer();
        const admin = await loginStaff('admin');
        const order = await placeOrder(customer);
        const res = await request(app).get(`/api/orders/by-number/${order.orderNumber}`).set(admin.auth).expect(200);
        assert.equal(res.body.data.id, order.id);
        await request(app).get(`/api/orders/by-number/${order.orderNumber}`).set(customer.auth).expect(403);
    });
});
