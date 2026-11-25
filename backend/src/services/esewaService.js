import crypto from 'node:crypto';
import { env } from '../config/env.js';

// eSewa ePay v2: https://developer.esewa.com.np/pages/Epay
// 1. We POST a signed form to eSewa (from a page the phone's browser opens).
// 2. eSewa redirects to our success URL with ?data=<base64 JSON, signed>.
// 3. We check that signature AND ask eSewa's status API before marking paid.

export const sign = (message) =>
    crypto.createHmac('sha256', env.ESEWA_SECRET_KEY).update(message).digest('base64');

/**
 * Fields for the payment form. Amounts are whole NPR. The order's amounts are
 * filled in for the customer (they can't change them on eSewa): `amount` is the
 * items, `deliveryCharge` the delivery fee, shown separately under "Details".
 * eSewa checks that amount + tax + service + delivery = total.
 */
export const buildPaymentForm = ({ amount, deliveryCharge = 0, transactionUuid, successUrl, failureUrl }) => {
    const fields = {
        amount: String(amount),
        tax_amount: '0',
        total_amount: String(amount + deliveryCharge),
        transaction_uuid: transactionUuid,
        product_code: env.ESEWA_PRODUCT_CODE,
        product_service_charge: '0',
        product_delivery_charge: String(deliveryCharge),
        success_url: successUrl,
        failure_url: failureUrl,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
    };
    fields.signature = sign(
        `total_amount=${fields.total_amount},transaction_uuid=${fields.transaction_uuid},product_code=${fields.product_code}`
    );
    return { action: env.ESEWA_FORM_URL, fields };
};

/** eSewa sends amounts like "1,040.0". */
export const parseAmount = (value) => Number(String(value).replace(/,/g, ''));

/**
 * Decodes and checks the ?data= payload eSewa sends to the success URL.
 * Returns the payload, or null if it is malformed or the signature is wrong.
 */
export const decodeCallback = (data) => {
    let raw;
    let payload;
    try {
        raw = Buffer.from(String(data), 'base64').toString('utf8');
        payload = JSON.parse(raw);
    } catch {
        return null;
    }
    if (!payload?.signed_field_names || !payload.signature) return null;

    // eSewa signs the values exactly as written in its JSON. A number like
    // 1000.0 becomes 1000 after JSON.parse, so read numbers from the raw text.
    const literal = (field) => {
        const value = payload[field];
        if (typeof value !== 'number') return value ?? '';
        const match = raw.match(new RegExp(`"${field}"\\s*:\\s*(-?[0-9.eE+-]+)`));
        return match ? match[1] : String(value);
    };

    const message = payload.signed_field_names
        .split(',')
        .map((field) => `${field}=${literal(field)}`)
        .join(',');
    const expected = Buffer.from(sign(message));
    const given = Buffer.from(String(payload.signature));
    if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;

    return payload;
};

/** Asks eSewa directly whether the transaction is complete. */
export const checkStatus = async ({ transactionUuid, amount }) => {
    const url = new URL(env.ESEWA_STATUS_URL);
    url.searchParams.set('product_code', env.ESEWA_PRODUCT_CODE);
    url.searchParams.set('total_amount', String(amount));
    url.searchParams.set('transaction_uuid', transactionUuid);

    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`eSewa status API returned ${res.status}`);
    const body = await res.json();
    // { product_code, transaction_uuid, total_amount, status: "COMPLETE" | "PENDING" | ..., ref_id }
    return { status: body.status, refId: body.ref_id ?? null, totalAmount: parseAmount(body.total_amount) };
};
