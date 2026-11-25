import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, startDB, stopDB } from './setup.js';
import { address, newKey, registerCustomer, variantOf } from './helpers.js';

before(startDB);
after(stopDB);

describe('orders', () => {
    test('quote uses server prices and adds the delivery fee', async () => {
        const { variant } = await variantOf('gorkha-premium');
        const res = await request(app)
            .post('/api/orders/quote')
            .send({ items: [{ sku: variant.sku, quantity: 2 }] })
            .expect(200);
        assert.equal(res.body.data.subtotal, variant.price * 2);
        assert.equal(res.body.data.deliveryFee, 100);
        assert.equal(res.body.data.total, variant.price * 2 + 100);
        assert.deepEqual(res.body.data.problems, []);
    });

    test('placing an order needs login', async () => {
        await request(app).post('/api/orders').send({}).expect(401);
    });

    test('order is priced on the server and stock goes down', async () => {
        const { auth } = await registerCustomer();
        const { product, variant } = await variantOf('fanta');

        const res = await request(app)
            .post('/api/orders')
            .set(auth)
            .set('Idempotency-Key', newKey())
            .send({ items: [{ sku: variant.sku, quantity: 3 }], address, paymentMethod: 'cod' })
            .expect(201);

        const order = res.body.data;
        assert.match(order.orderNumber, /^RC-\d{6}-[0-9A-F]{6}$/);
        assert.equal(order.items[0].price, variant.price);
        assert.equal(order.total, variant.price * 3 + 100);
        assert.equal(order.status, 'pending');
        assert.equal(order.payment.status, 'pending');

        const after = await request(app).get(`/api/products/${product.id}`);
        assert.equal(after.body.data.variants[0].stock, variant.stock - 3);
    });

    test('tampered total is rejected', async () => {
        const { auth } = await registerCustomer();
        const { variant } = await variantOf('sprite');
        const res = await request(app)
            .post('/api/orders')
            .set(auth)
            .set('Idempotency-Key', newKey())
            .send({ items: [{ sku: variant.sku, quantity: 1 }], address, paymentMethod: 'cod', expectedTotal: 1 })
            .expect(409);
        assert.equal(res.body.error.code, 'PRICE_CHANGED');
    });

    test('out of stock is rejected and stock is unchanged', async () => {
        const { auth } = await registerCustomer();
        const soldOut = await variantOf('nepal-ice');
        const low = await variantOf('barahsinghe-pilsner');

        const res = await request(app)
            .post('/api/orders')
            .set(auth)
            .set('Idempotency-Key', newKey())
            .send({
                items: [
                    { sku: low.variant.sku, quantity: 1 },
                    { sku: soldOut.variant.sku, quantity: 1 },
                ],
                address,
                paymentMethod: 'cod',
            })
            .expect(409);
        assert.equal(res.body.error.details[0].code, 'OUT_OF_STOCK');

        const again = await variantOf('barahsinghe-pilsner');
        assert.equal(again.variant.stock, low.variant.stock);
    });

    test('same Idempotency-Key creates one order', async () => {
        const { auth } = await registerCustomer();
        const { product, variant } = await variantOf('wai-wai-quick');
        const key = newKey();
        const body = { items: [{ sku: variant.sku, quantity: 2 }], address, paymentMethod: 'cod' };

        const first = await request(app).post('/api/orders').set(auth).set('Idempotency-Key', key).send(body).expect(201);
        const second = await request(app).post('/api/orders').set(auth).set('Idempotency-Key', key).send(body).expect(200);
        assert.equal(first.body.data.id, second.body.data.id);

        const after = await request(app).get(`/api/products/${product.id}`);
        assert.equal(after.body.data.variants[0].stock, variant.stock - 2, 'stock taken once');
    });

    test('customers only see their own orders', async () => {
        const alice = await registerCustomer();
        const bob = await registerCustomer();
        const { variant } = await variantOf('lays-classic');

        const res = await request(app)
            .post('/api/orders')
            .set(alice.auth)
            .set('Idempotency-Key', newKey())
            .send({ items: [{ sku: variant.sku, quantity: 1 }], address, paymentMethod: 'cod' })
            .expect(201);
        const id = res.body.data.id;

        await request(app).get(`/api/orders/${id}`).set(alice.auth).expect(200);
        await request(app).get(`/api/orders/${id}`).set(bob.auth).expect(404);

        const mine = await request(app).get('/api/orders').set(bob.auth).expect(200);
        assert.equal(mine.body.data.length, 0);
    });

    test('address is saved for next time', async () => {
        const { auth } = await registerCustomer();
        const { variant } = await variantOf('kurkure');
        await request(app)
            .post('/api/orders')
            .set(auth)
            .set('Idempotency-Key', newKey())
            .send({ items: [{ sku: variant.sku, quantity: 1 }], address, paymentMethod: 'cod' })
            .expect(201);
        const me = await request(app).get('/api/users/me').set(auth);
        assert.equal(me.body.data.lastAddress.address, address.address);
    });
});
