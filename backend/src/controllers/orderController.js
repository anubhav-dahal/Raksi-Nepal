import mongoose from 'mongoose';
import { z } from 'zod';
import { ORDER_STATUSES, Order, PAYMENT_METHODS } from '../models/OrderModel.js';
import { phoneField } from '../utils/phone.js';
import { changeStatus } from '../services/orderStatusService.js';
import { placeOrder, quote } from '../services/orderService.js';
import { ApiError } from '../utils/ApiError.js';

const itemsSchema = z
    .array(
        z.object({
            sku: z.string().trim().min(1).max(60),
            quantity: z.number().int().min(1).max(99),
        })
    )
    .min(1, 'add at least one item')
    .max(50);

const addressSchema = z.object({
    name: z.string().trim().min(2).max(80),
    phone: phoneField(),
    address: z.string().trim().min(5, 'please enter your full address').max(200),
    landmark: z.string().trim().max(120).optional().default(''),
    note: z.string().trim().max(200).optional().default(''),
});

export const quoteSchema = { body: z.object({ items: itemsSchema }) };

export const createOrderSchema = {
    body: z.object({
        items: itemsSchema,
        address: addressSchema,
        paymentMethod: z.enum(PAYMENT_METHODS),
        // The total the customer saw. If the server's total differs, the order is refused.
        expectedTotal: z.number().int().min(0).optional(),
    }),
};

export const orderIdSchema = {
    params: z.object({ id: z.string().refine((v) => mongoose.isValidObjectId(v), 'must be a valid id') }),
};

// POST /api/orders/quote  (no login needed: used by the checkout summary)
export const quoteOrder = async (req, res) => {
    res.json({ data: await quote(req.valid.body.items) });
};

// POST /api/orders   header: Idempotency-Key
export const createOrder = async (req, res) => {
    const idempotencyKey = req.get('idempotency-key');
    if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 100) {
        throw ApiError.badRequest('Idempotency-Key header is required (8-100 characters)');
    }

    const { order, created } = await placeOrder({ user: req.user, idempotencyKey, ...req.valid.body });

    if (created) {
        req.user.lastAddress = req.valid.body.address;
        await req.user.save();
    }

    res.status(created ? 201 : 200).json({ data: order });
};

// GET /api/orders  (the logged-in customer's orders, newest first)
export const listMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ data: orders });
};

/** Loads an order the current user may see: their own, any for admin, assigned ones for riders. */
export const findVisibleOrder = async (user, id) => {
    const order = await Order.findById(id).populate('rider', 'name phone');
    const allowed =
        order &&
        (user.role === 'admin' ||
            order.user.equals(user._id) ||
            (user.role === 'rider' && order.rider?._id.equals(user._id)));
    // 404 rather than 403, so order ids can't be probed.
    if (!allowed) throw ApiError.notFound('Order not found');
    return order;
};

// GET /api/orders/:id
export const getOrder = async (req, res) => {
    res.json({ data: await findVisibleOrder(req.user, req.valid.params.id) });
};

const ownOrder = async (user, id) => {
    const order = await findVisibleOrder(user, id);
    if (!order.user.equals(user._id)) throw ApiError.notFound('Order not found');
    return order;
};

// POST /api/orders/:id/cancel   (customer, only before the shop confirms it)
export const cancelOrder = async (req, res) => {
    const order = await ownOrder(req.user, req.valid.params.id);
    if (order.status !== 'pending') {
        throw ApiError.conflict('This order is already being handled. Please contact the shop to cancel.');
    }
    if (order.payment.status === 'paid') {
        throw ApiError.conflict('This order is already paid. Please contact the shop to cancel and get a refund.');
    }
    res.json({ data: await changeStatus(order, 'cancelled', { by: req.user._id, note: 'Cancelled by customer' }) });
};

// POST /api/orders/:id/pay-on-delivery   (customer: eSewa failed, pay cash instead)
export const switchToCod = async (req, res) => {
    const order = await ownOrder(req.user, req.valid.params.id);
    if (order.status !== 'pending' || order.payment.status === 'paid') {
        throw ApiError.conflict('The payment method can no longer be changed');
    }
    const updated = await Order.findOneAndUpdate(
        { _id: order._id, status: 'pending', 'payment.status': { $ne: 'paid' } },
        { $set: { 'payment.method': 'cod', 'payment.status': 'pending', 'payment.transactionUuid': null } },
        { returnDocument: 'after' }
    ).populate('rider', 'name phone');
    if (!updated) throw ApiError.conflict('The payment method can no longer be changed');
    res.json({ data: updated });
};

export const statusSchema = {
    ...orderIdSchema,
    body: z.object({
        status: z.enum(ORDER_STATUSES),
        note: z.string().trim().max(200).optional().default(''),
    }),
};

export const orderNumberSchema = {
    params: z.object({ number: z.string().trim().toUpperCase().regex(/^RC-\d{6}-[0-9A-F]{6}$/, 'not an order number') }),
};

// GET /api/orders/by-number/:number   (admin)
export const getOrderByNumber = async (req, res) => {
    const order = await Order.findOne({ orderNumber: req.valid.params.number }).populate('rider', 'name phone');
    if (!order) throw ApiError.notFound('Order not found');
    res.json({ data: order });
};

// PATCH /api/orders/:id/status   (admin)
export const updateStatus = async (req, res) => {
    const order = await findVisibleOrder(req.user, req.valid.params.id);
    const { status, note } = req.valid.body;
    res.json({ data: await changeStatus(order, status, { by: req.user._id, note }) });
};
