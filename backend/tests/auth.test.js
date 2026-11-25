import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, startDB, stopDB } from './setup.js';
import { registerCustomer } from './helpers.js';

before(startDB);
after(stopDB);

describe('auth', () => {
    test('register returns a token and never the password', async () => {
        const { token, user } = await registerCustomer({ phone: '9800000001' });
        assert.ok(token);
        assert.equal(user.role, 'customer');
        assert.equal(user.passwordHash, undefined);
    });

    test('same phone cannot register twice', async () => {
        await registerCustomer({ phone: '9800000002' });
        const res = await request(app)
            .post('/api/users/register')
            .send({ name: 'Again', phone: '9800000002', password: 'password123' })
            .expect(409);
        assert.equal(res.body.error.code, 'CONFLICT');
    });

    test('validation: bad phone and short password', async () => {
        const res = await request(app)
            .post('/api/users/register')
            .send({ name: 'X Y', phone: '12345', password: 'short' })
            .expect(400);
        const fields = res.body.error.details.map((d) => d.field);
        assert.ok(fields.includes('body.phone'));
        assert.ok(fields.includes('body.password'));
    });

    test('login works; wrong password and unknown phone give the same error', async () => {
        await registerCustomer({ phone: '9800000003' });
        await request(app).post('/api/users/login').send({ phone: '9800000003', password: 'password123' }).expect(200);

        const wrong = await request(app)
            .post('/api/users/login')
            .send({ phone: '9800000003', password: 'nope-nope' })
            .expect(401);
        const unknown = await request(app)
            .post('/api/users/login')
            .send({ phone: '9811111111', password: 'password123' })
            .expect(401);
        assert.equal(wrong.body.error.message, unknown.body.error.message);
    });

    test('/me needs a valid token', async () => {
        const { auth, phone } = await registerCustomer({ phone: '9800000004' });
        const res = await request(app).get('/api/users/me').set(auth).expect(200);
        assert.equal(res.body.data.phone, phone);
        await request(app).get('/api/users/me').expect(401);
        await request(app).get('/api/users/me').set({ Authorization: 'Bearer garbage' }).expect(401);
    });
});
