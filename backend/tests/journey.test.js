// The 9-step MVP journey from PROJECT_PLAYBOOK.md section 2, through the API.
// (The on-phone version is the checklist in docs/MVP_TEST_CHECKLIST.md.)
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, startDB, stopDB } from './setup.js';
import { address, assignDemoRider, loginStaff, newKey } from './helpers.js';

before(startDB);
after(stopDB);

test('MVP journey: browse -> choose -> cart -> checkout -> login -> pay (COD) -> confirmed -> on the way', async () => {
    // 2. Products grouped by category
    const categories = (await request(app).get('/api/categories').expect(200)).body.data;
    const snacks = categories.find((c) => c.slug === 'snacks');
    const products = (await request(app).get(`/api/products?category=${snacks.slug}`).expect(200)).body.data;

    // 3. Select a product and quantity
    const product = (await request(app).get(`/api/products/${products[0].id}`).expect(200)).body.data;
    const variant = product.variants.find((v) => v.stock >= 2);
    const items = [{ sku: variant.sku, quantity: 2 }];

    // 4-5. Add to cart and go to checkout: server-priced summary
    const quote = (await request(app).post('/api/orders/quote').send({ items }).expect(200)).body.data;
    assert.equal(quote.total, variant.price * 2 + quote.deliveryFee);

    // 6. Register during checkout
    const reg = await request(app)
        .post('/api/users/register')
        .send({ name: 'Sita Sharma', phone: '9845000001', password: 'journey123' })
        .expect(201);
    const auth = { Authorization: `Bearer ${reg.body.data.token}` };

    // 7. Pay with Cash on Delivery
    const order = (
        await request(app)
            .post('/api/orders')
            .set(auth)
            .set('Idempotency-Key', newKey())
            .send({ items, address, paymentMethod: 'cod', expectedTotal: quote.total })
            .expect(201)
    ).body.data;

    // 8. Order confirmed (customer sees it)
    const seen = (await request(app).get(`/api/orders/${order.id}`).set(auth).expect(200)).body.data;
    assert.equal(seen.orderNumber, order.orderNumber);

    // 9. Shop moves it along; customer sees "on the way"
    const admin = await loginStaff('admin');
    for (const status of ['confirmed', 'preparing']) {
        await request(app).patch(`/api/orders/${order.id}/status`).set(admin.auth).send({ status }).expect(200);
    }
    const rider = await assignDemoRider(admin, order.id);
    await request(app)
        .post(`/api/rider/orders/${order.id}/status`)
        .set(rider.auth)
        .send({ status: 'out_for_delivery' })
        .expect(200);
    const onTheWay = (await request(app).get(`/api/orders/${order.id}`).set(auth).expect(200)).body.data;
    assert.equal(onTheWay.status, 'out_for_delivery');
    assert.equal(onTheWay.rider.name, 'Demo Rider');
});
