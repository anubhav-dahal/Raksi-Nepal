import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { Order } from '../models/OrderModel.js';
import { buildPaymentForm, checkStatus, decodeCallback, parseAmount } from '../services/esewaService.js';
import { ApiError } from '../utils/ApiError.js';
import { findVisibleOrder } from './orderController.js';

const SESSION_AUDIENCE = 'esewa-session';

// Only send the browser back into our app (no open redirects).
const ALLOWED_RETURN = /^(raksichaiyo|exp|exps):\/\//;

export const sessionSchema = {
    body: z.object({
        returnUrl: z.string().max(300).regex(ALLOWED_RETURN, 'returnUrl must be an app link'),
    }),
};

const baseUrl = (req) => env.PUBLIC_URL ?? `${req.protocol}://${req.get('host')}`;

const withParams = (url, params) => `${url}${url.includes('?') ? '&' : '?'}${new URLSearchParams(params)}`;

const readSession = (token) => {
    try {
        return jwt.verify(token, env.JWT_SECRET, { audience: SESSION_AUDIENCE });
    } catch {
        throw ApiError.badRequest('This payment link has expired. Go back to the app and try again.');
    }
};

const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// POST /api/payments/esewa/:id/session   (customer, own order)
// Returns a short-lived link the app opens in the browser.
export const createEsewaSession = async (req, res) => {
    const order = await findVisibleOrder(req.user, req.valid.params.id);
    if (!order.user.equals(req.user._id)) throw ApiError.notFound('Order not found');
    if (order.payment.method !== 'esewa') throw ApiError.conflict('This order is not paid with eSewa');
    if (order.payment.status === 'paid') throw ApiError.conflict('This order is already paid');
    if (order.status !== 'pending') throw ApiError.conflict('This order can no longer be paid');

    // A new transaction id for each attempt (eSewa rejects reused ids).
    const transactionUuid = `${order.orderNumber}-${crypto.randomBytes(3).toString('hex')}`;
    await Order.updateOne(
        { _id: order._id },
        { $set: { 'payment.transactionUuid': transactionUuid, 'payment.status': 'pending' } }
    );

    const token = jwt.sign(
        { oid: order.id, tx: transactionUuid, ret: req.valid.body.returnUrl },
        env.JWT_SECRET,
        { audience: SESSION_AUDIENCE, expiresIn: '15m' }
    );
    res.json({ data: { url: `${baseUrl(req)}/api/payments/esewa/pay/${token}` } });
};

// GET /api/payments/esewa/pay/:token   (opened in the phone's browser)
// A page that immediately posts the signed form to eSewa.
export const esewaPayPage = async (req, res) => {
    const session = readSession(req.params.token);
    const order = await Order.findById(session.oid);
    if (!order || order.payment.transactionUuid !== session.tx || order.payment.status === 'paid') {
        throw ApiError.badRequest('This payment link is no longer valid. Go back to the app and try again.');
    }

    const base = `${baseUrl(req)}/api/payments/esewa`;
    const form = buildPaymentForm({
        amount: order.total,
        transactionUuid: session.tx,
        successUrl: `${base}/success/${req.params.token}`,
        failureUrl: `${base}/failure/${req.params.token}`,
    });

    const nonce = crypto.randomBytes(12).toString('base64');
    const inputs = Object.entries(form.fields)
        .map(([name, value]) => `<input type="hidden" name="${name}" value="${escapeHtml(value)}">`)
        .join('');

    res.set(
        'Content-Security-Policy',
        `default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; form-action ${new URL(form.action).origin}`
    );
    res.type('html').send(`<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Redirecting to eSewa</title></head>
<body style="font-family:sans-serif;background:#0b132b;color:#f8f9fa;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
<form id="f" method="POST" action="${escapeHtml(form.action)}">${inputs}
<p>Taking you to eSewa to pay NPR ${order.total}…</p><button type="submit">Continue</button></form>
<script nonce="${nonce}">document.getElementById('f').submit();</script></body></html>`);
};

// GET /api/payments/esewa/success/:token?data=...   (eSewa redirects here)
export const esewaSuccess = async (req, res) => {
    const session = readSession(req.params.token);
    const back = (result) => res.redirect(302, withParams(session.ret, { orderId: session.oid, result }));

    const payload = decodeCallback(req.query.data);
    const order = await Order.findById(session.oid);
    if (!payload || !order || payload.transaction_uuid !== order.payment.transactionUuid) return back('failed');
    if (order.payment.status === 'paid') return back('success');

    // Never trust the redirect alone: confirm with eSewa server-to-server.
    let verified;
    try {
        verified = await checkStatus({ transactionUuid: payload.transaction_uuid, amount: order.total });
    } catch (error) {
        console.error('eSewa status check failed:', error.message);
        return back('pending');
    }

    const amountOk = verified.totalAmount === order.total && parseAmount(payload.total_amount) === order.total;
    // PENDING / AMBIGUOUS: eSewa hasn't decided yet. Don't fail it; the app shows "checking".
    if (amountOk && ['PENDING', 'AMBIGUOUS'].includes(verified.status)) return back('pending');
    if (verified.status !== 'COMPLETE' || !amountOk) {
        await Order.updateOne({ _id: order._id, 'payment.status': 'pending' }, { $set: { 'payment.status': 'failed' } });
        return back('failed');
    }

    await Order.updateOne(
        { _id: order._id, 'payment.status': { $ne: 'paid' } },
        {
            $set: {
                'payment.status': 'paid',
                'payment.reference': verified.refId ?? payload.transaction_code ?? null,
                'payment.paidAt': new Date(),
            },
        }
    );
    return back('success');
};

// GET /api/payments/esewa/failure/:token   (user cancelled or eSewa failed)
// The order stays pending so the customer can retry, switch to cash, or cancel.
export const esewaFailure = async (req, res) => {
    const session = readSession(req.params.token);
    await Order.updateOne(
        { _id: session.oid, 'payment.transactionUuid': session.tx, 'payment.status': 'pending' },
        { $set: { 'payment.status': 'failed' } }
    );
    res.redirect(302, withParams(session.ret, { orderId: session.oid, result: 'cancelled' }));
};
