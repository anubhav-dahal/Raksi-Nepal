import { after, afterEach, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, startDB, stopDB } from './setup.js';
import { loginStaff, placeOrder, registerCustomer, variantOf } from './helpers.js';
import { sign } from '../src/services/esewaService.js';
import { Order } from '../src/models/OrderModel.js';

before(startDB);
after(stopDB);

// Fake eSewa's status API; everything else goes to the real fetch.
const realFetch = globalThis.fetch;
let esewaStatus = 'COMPLETE';
globalThis.fetch = async (url, options) => {
    if (String(url).includes('esewa.com.np')) {
        const u = new URL(url);
        return new Response(
            JSON.stringify({
                product_code: u.searchParams.get('product_code'),
                transaction_uuid: u.searchParams.get('transaction_uuid'),
                total_amount: Number(u.searchParams.get('total_amount')),
                status: esewaStatus,
                ref_id: 'REF123',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    }
    return realFetch(url, options);
};
afterEach(() => {
    esewaStatus = 'COMPLETE';
});

const RETURN = 'exp://192.168.1.5:8081/--/payment-result';

/** The ?data= value eSewa would send back, signed like eSewa does. */
const callbackData = (fields) => {
    const payload = {
        transaction_code: '000AWEO',
        status: 'COMPLETE',
        product_code: 'EPAYTEST',
        signed_field_names: 'transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names',
        ...fields,
    };
    const message = payload.signed_field_names
        .split(',')
        .map((f) => `${f}=${payload[f]}`)
        .join(',');
    payload.signature = sign(message);
    return Buffer.from(JSON.stringify(payload)).toString('base64');
};

const startSession = async (customer, order) => {
    const res = await request(app)
        .post(`/api/payments/esewa/${order.id}/session`)
        .set(customer.auth)
        .send({ returnUrl: RETURN })
        .expect(200);
    const token = res.body.data.url.split('/pay/')[1];
    const fresh = await Order.findById(order.id);
    return { token, url: res.body.data.url, tx: fresh.payment.transactionUuid };
};

describe('eSewa payments', () => {
    test('pay page posts a signed form to eSewa', async () => {
        const customer = await registerCustomer();
        const order = await placeOrder(customer, { paymentMethod: 'esewa' });
        const { token, tx } = await startSession(customer, order);

        const page = await request(app).get(`/api/payments/esewa/pay/${token}`).expect(200);
        assert.match(page.text, /action="https:\/\/rc-epay\.esewa\.com\.np\/api\/epay\/main\/v2\/form"/);
        assert.match(page.text, new RegExp(`name="transaction_uuid" value="${tx}"`));
        assert.match(page.text, new RegExp(`name="total_amount" value="${order.total}"`));
        // Amounts are filled in for the customer: items and delivery shown separately, adding up to the total.
        assert.match(page.text, new RegExp(`name="amount" value="${order.subtotal}"`));
        assert.match(page.text, new RegExp(`name="product_delivery_charge" value="${order.deliveryFee}"`));
        assert.equal(order.subtotal + order.deliveryFee, order.total);
        const signature = sign(`total_amount=${order.total},transaction_uuid=${tx},product_code=EPAYTEST`);
        assert.ok(page.text.includes(`value="${signature}"`));
    });

    test('verified success marks the order paid and returns to the app', async () => {
        const customer = await registerCustomer();
        const order = await placeOrder(customer, { paymentMethod: 'esewa' });
        const { token, tx } = await startSession(customer, order);

        const data = callbackData({ transaction_uuid: tx, total_amount: `${order.total.toLocaleString('en-US')}.0` });
        const res = await request(app).get(`/api/payments/esewa/success/${token}?data=${encodeURIComponent(data)}`).expect(302);
        assert.equal(res.headers.location, `${RETURN}?orderId=${order.id}&result=success`);

        const paid = await Order.findById(order.id);
        assert.equal(paid.payment.status, 'paid');
        assert.equal(paid.payment.reference, 'REF123');

        // Now the shop may confirm it.
        const admin = await loginStaff('admin');
        await request(app).patch(`/api/orders/${order.id}/status`).set(admin.auth).send({ status: 'confirmed' }).expect(200);
    });

    test('a forged callback (bad signature) is not accepted', async () => {
        const customer = await registerCustomer();
        const order = await placeOrder(customer, { paymentMethod: 'esewa' });
        const { token, tx } = await startSession(customer, order);

        const forged = JSON.parse(Buffer.from(callbackData({ transaction_uuid: tx, total_amount: '1.0' }), 'base64'));
        forged.total_amount = String(order.total); // changed after signing
        const data = Buffer.from(JSON.stringify(forged)).toString('base64');

        const res = await request(app).get(`/api/payments/esewa/success/${token}?data=${encodeURIComponent(data)}`).expect(302);
        assert.match(res.headers.location, /result=failed/);
        assert.equal((await Order.findById(order.id)).payment.status, 'pending');
    });

    test('eSewa status API: PENDING stays pending, NOT_FOUND fails', async () => {
        const customer = await registerCustomer();
        const order = await placeOrder(customer, { paymentMethod: 'esewa' });
        const { token, tx } = await startSession(customer, order);
        const data = callbackData({ transaction_uuid: tx, total_amount: String(order.total) });
        const url = `/api/payments/esewa/success/${token}?data=${encodeURIComponent(data)}`;

        esewaStatus = 'PENDING';
        const pending = await request(app).get(url).expect(302);
        assert.match(pending.headers.location, /result=pending/);
        assert.equal((await Order.findById(order.id)).payment.status, 'pending');

        esewaStatus = 'NOT_FOUND';
        const failed = await request(app).get(url).expect(302);
        assert.match(failed.headers.location, /result=failed/);
        assert.equal((await Order.findById(order.id)).payment.status, 'failed');
    });

    test('unpaid eSewa order cannot be confirmed', async () => {
        const customer = await registerCustomer();
        const admin = await loginStaff('admin');
        const order = await placeOrder(customer, { paymentMethod: 'esewa' });
        const res = await request(app)
            .patch(`/api/orders/${order.id}/status`)
            .set(admin.auth)
            .send({ status: 'confirmed' })
            .expect(409);
        assert.match(res.body.error.message, /waiting for eSewa payment/);
    });

    test('cancel on eSewa: failure URL, then retry or switch to cash', async () => {
        const customer = await registerCustomer();
        const order = await placeOrder(customer, { paymentMethod: 'esewa' });
        const first = await startSession(customer, order);

        const res = await request(app).get(`/api/payments/esewa/failure/${first.token}`).expect(302);
        assert.equal(res.headers.location, `${RETURN}?orderId=${order.id}&result=cancelled`);
        assert.equal((await Order.findById(order.id)).payment.status, 'failed');

        // Retry gets a new transaction id.
        const second = await startSession(customer, order);
        assert.notEqual(second.tx, first.tx);

        const cod = await request(app).post(`/api/orders/${order.id}/pay-on-delivery`).set(customer.auth).expect(200);
        assert.equal(cod.body.data.payment.method, 'cod');
        assert.equal(cod.body.data.payment.status, 'pending');
    });

    test('session rules: own order, eSewa only, app return links only', async () => {
        const customer = await registerCustomer();
        const other = await registerCustomer();
        const esewa = await placeOrder(customer, { paymentMethod: 'esewa' });
        const cod = await placeOrder(customer, { paymentMethod: 'cod' });

        await request(app).post(`/api/payments/esewa/${esewa.id}/session`).set(other.auth).send({ returnUrl: RETURN }).expect(404);
        await request(app).post(`/api/payments/esewa/${cod.id}/session`).set(customer.auth).send({ returnUrl: RETURN }).expect(409);
        await request(app)
            .post(`/api/payments/esewa/${esewa.id}/session`)
            .set(customer.auth)
            .send({ returnUrl: 'https://evil.example.com' })
            .expect(400);
        await request(app).get('/api/payments/esewa/pay/not-a-token').expect(400);
    });

    test('stock is returned when an eSewa order is cancelled', async () => {
        const customer = await registerCustomer();
        const before = await variantOf('coca-cola');
        const order = await placeOrder(customer, { slug: 'coca-cola', quantity: 2, paymentMethod: 'esewa' });
        await request(app).post(`/api/orders/${order.id}/cancel`).set(customer.auth).expect(200);
        assert.equal((await variantOf('coca-cola')).variant.stock, before.variant.stock);
    });
});

describe('eSewa signature (real sample from eSewa docs)', () => {
    test('accepts eSewa\'s signed sample, including the numeric total 1000.0', async () => {
        const { decodeCallback } = await import('../src/services/esewaService.js');
        const raw =
            '{"transaction_code":"000AWEO","status":"COMPLETE","total_amount":1000.0,"transaction_uuid":"250610-162413",' +
            '"product_code":"EPAYTEST","signed_field_names":"transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names",' +
            '"signature":"62GcfZTmVkzhtUeh+QJ1AqiJrjoWWGof3U+eTPTZ7fA="}';
        assert.ok(decodeCallback(Buffer.from(raw).toString('base64')), 'numeric total');
        assert.ok(decodeCallback(Buffer.from(raw.replace('1000.0', '"1000.0"')).toString('base64')), 'string total');
        assert.equal(decodeCallback(Buffer.from(raw.replace('1000.0', '1.0')).toString('base64')), null, 'tampered');
    });
});
