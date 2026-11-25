import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { addressSchema } from './UserModel.js';

export const ORDER_STATUSES = [
    'pending',
    'confirmed',
    'preparing',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'payment_failed',
];

// Payment status is kept separate from order status.
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
export const PAYMENT_METHODS = ['cod', 'esewa'];

// Snapshot of the product at order time, so later price changes don't alter old orders.
const orderItemSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        sku: { type: String, required: true },
        name: { type: String, required: true },
        label: { type: String, required: true },
        image: { type: String, default: '' },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        lineTotal: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const statusEventSchema = new mongoose.Schema(
    {
        status: { type: String, enum: ORDER_STATUSES, required: true },
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        note: { type: String, default: '' },
    },
    { _id: false }
);

const paymentSchema = new mongoose.Schema(
    {
        method: { type: String, enum: PAYMENT_METHODS, required: true },
        status: { type: String, enum: PAYMENT_STATUSES, default: 'pending' },
        // eSewa: our transaction_uuid and their transaction_code / ref id.
        transactionUuid: { type: String, default: null },
        reference: { type: String, default: null },
        paidAt: { type: Date, default: null },
    },
    { _id: false }
);

const newOrderNumber = () => {
    const d = new Date();
    const ymd = `${d.getFullYear() % 100}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    return `RC-${ymd}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

const orderSchema = new mongoose.Schema(
    {
        orderNumber: { type: String, unique: true, default: newOrderNumber },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: {
            type: [orderItemSchema],
            validate: { validator: (v) => v.length > 0, message: 'an order needs at least one item' },
        },
        subtotal: { type: Number, required: true, min: 0 },
        deliveryFee: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 },
        address: { type: addressSchema, required: true },
        status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
        statusHistory: { type: [statusEventSchema], default: () => [{ status: 'pending' }] },
        payment: { type: paymentSchema, required: true },
        rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        // Same key from the same user returns the first order instead of creating a second one.
        idempotencyKey: { type: String, required: true },
        // True once stock has been returned (cancel / payment failure), so it's never returned twice.
        stockRestored: { type: Boolean, default: false },
    },
    { timestamps: true }
);

orderSchema.index({ user: 1, idempotencyKey: 1 }, { unique: true });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ rider: 1, status: 1 });

export const Order = mongoose.model('Order', orderSchema);
