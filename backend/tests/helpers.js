import request from 'supertest';
import { app } from './setup.js';

let counter = 0;

/** Registers a fresh customer and returns { token, user, phone, auth }. */
export const registerCustomer = async (overrides = {}) => {
    counter += 1;
    const phone = overrides.phone ?? `98${String(10000000 + counter * 7919).slice(-8)}`;
    const res = await request(app)
        .post('/api/users/register')
        .send({ name: 'Test Customer', phone, password: 'password123', ...overrides })
        .expect(201);
    const { token, user } = res.body.data;
    return { token, user, phone, auth: { Authorization: `Bearer ${token}` } };
};

export const address = {
    name: 'Ram Thapa',
    phone: '9812345678',
    address: 'Ward 5, Dhamboji Chowk, Nepalgunj',
    landmark: 'Near the bus park',
};

/** First in-stock variant of a seeded product, by product slug. */
export const variantOf = async (slug) => {
    const res = await request(app).get('/api/products');
    const product = res.body.data.find((p) => p.slug === slug);
    return { product, variant: product.variants.find((v) => v.stock > 0) ?? product.variants[0] };
};

export const newKey = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Logs in a demo staff account ('admin' or 'rider'). */
export const loginStaff = async (role) => {
    const { DEMO_STAFF } = await import('../src/seed/staff.js');
    const { phone, password } = DEMO_STAFF.find((s) => s.role === role);
    const res = await request(app).post('/api/users/login').send({ phone, password }).expect(200);
    return { token: res.body.data.token, user: res.body.data.user, auth: { Authorization: `Bearer ${res.body.data.token}` } };
};

/** Places an order for `customer` and returns it. */
export const placeOrder = async (customer, { slug = 'fanta', quantity = 1, paymentMethod = 'cod' } = {}) => {
    const { variant } = await variantOf(slug);
    const res = await request(app)
        .post('/api/orders')
        .set(customer.auth)
        .set('Idempotency-Key', newKey())
        .send({ items: [{ sku: variant.sku, quantity }], address, paymentMethod })
        .expect(201);
    return res.body.data;
};
