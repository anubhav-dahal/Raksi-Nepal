import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Order } from '../models/OrderModel.js';
import { Product } from '../models/ProductModel.js';
import { ApiError } from '../utils/ApiError.js';
import { changeStock } from './stockService.js';

// Same SKU twice in a request counts as one line.
const mergeItems = (items) => {
    const bySku = new Map();
    for (const { sku, quantity } of items) {
        const key = sku.toUpperCase();
        bySku.set(key, (bySku.get(key) ?? 0) + quantity);
    }
    return [...bySku].map(([sku, quantity]) => ({ sku, quantity }));
};

/**
 * Prices a basket from the database (never from the app).
 * Returns the lines, totals, and any problems (unknown SKU, not enough stock).
 */
export const quote = async (items) => {
    const wanted = mergeItems(items);
    const products = await Product.find({ 'variants.sku': { $in: wanted.map((i) => i.sku) }, isActive: true });

    const lines = [];
    const problems = [];

    for (const { sku, quantity } of wanted) {
        const product = products.find((p) => p.variants.some((v) => v.sku === sku));
        const variant = product?.variants.find((v) => v.sku === sku);

        if (!variant) {
            problems.push({ sku, code: 'NOT_AVAILABLE', message: 'This item is no longer available' });
            continue;
        }
        if (variant.stock < quantity) {
            problems.push({
                sku,
                code: 'OUT_OF_STOCK',
                available: variant.stock,
                message: variant.stock > 0 ? `Only ${variant.stock} left` : 'Out of stock',
            });
        }

        lines.push({
            product: product._id,
            sku,
            name: product.name.en,
            label: variant.label,
            image: product.image,
            price: variant.price,
            quantity,
            lineTotal: variant.price * quantity,
        });
    }

    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const deliveryFee = lines.length ? env.DELIVERY_FEE : 0;
    return { items: lines, subtotal, deliveryFee, total: subtotal + deliveryFee, problems };
};

// Every stock change goes through changeStock, which also writes the audit trail.
const takeStock = (line, orderId) =>
    changeStock({ product: line.product, sku: line.sku, delta: -line.quantity, reason: 'order', order: orderId });

const returnStock = (line, orderId, reason = 'order_cancelled') =>
    changeStock({ product: line.product, sku: line.sku, delta: line.quantity, reason, order: orderId });

/**
 * Places an order. Prices and stock are checked on the server; stock is taken
 * atomically per line (conditional $inc) and given back if any line fails.
 */
export const placeOrder = async ({ user, items, address, paymentMethod, expectedTotal, idempotencyKey }) => {
    const existing = await Order.findOne({ user: user._id, idempotencyKey });
    if (existing) return { order: existing, created: false };

    const priced = await quote(items);
    if (priced.problems.length) {
        throw ApiError.conflict('Some items are not available in the quantity you asked for', priced.problems);
    }
    if (expectedTotal !== undefined && expectedTotal !== priced.total) {
        throw new ApiError(409, 'PRICE_CHANGED', 'Prices have changed. Please review your order.', {
            total: priced.total,
        });
    }

    // Id chosen up front so the stock records can point at the order.
    const orderId = new mongoose.Types.ObjectId();
    const giveBack = (lines) => Promise.all(lines.map((l) => returnStock(l, orderId, 'adjustment')));

    const taken = [];
    for (const line of priced.items) {
        if ((await takeStock(line, orderId)) === null) {
            await giveBack(taken);
            throw ApiError.conflict('Some items are not available in the quantity you asked for', [
                { sku: line.sku, code: 'OUT_OF_STOCK', message: 'Just sold out' },
            ]);
        }
        taken.push(line);
    }

    try {
        const order = await Order.create({
            _id: orderId,
            user: user._id,
            items: priced.items,
            subtotal: priced.subtotal,
            deliveryFee: priced.deliveryFee,
            total: priced.total,
            address,
            payment: { method: paymentMethod },
            idempotencyKey,
        });
        return { order, created: true };
    } catch (error) {
        await giveBack(taken);
        // Two identical requests at the same moment: the other one won.
        if (error?.code === 11000) {
            const winner = await Order.findOne({ user: user._id, idempotencyKey });
            if (winner) return { order: winner, created: false };
        }
        throw error;
    }
};

/** Gives an order's stock back once (cancel, reject, payment failure). */
export const restoreStock = async (order) => {
    const claimed = await Order.updateOne({ _id: order._id, stockRestored: false }, { $set: { stockRestored: true } });
    if (claimed.modifiedCount !== 1) return;
    await Promise.all(order.items.map((line) => returnStock(line, order._id)));
};
