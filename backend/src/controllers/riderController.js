import mongoose from 'mongoose';
import { z } from 'zod';
import { Order } from '../models/OrderModel.js';
import { changeStatus, riderCanMove } from '../services/orderStatusService.js';
import { ApiError } from '../utils/ApiError.js';

// GET /api/rider/orders   (my assigned orders still to deliver, plus today's delivered)
export const listMyDeliveries = async (req, res) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const orders = await Order.find({
        rider: req.user._id,
        $or: [
            { status: { $in: ['confirmed', 'preparing', 'out_for_delivery'] } },
            { status: 'delivered', updatedAt: { $gte: startOfDay } },
        ],
    })
        .sort({ createdAt: 1 })
        .populate('user', 'name phone')
        .populate('rider', 'name phone');
    res.json({ data: orders });
};

export const riderStatusSchema = {
    params: z.object({ id: z.string().refine((v) => mongoose.isValidObjectId(v), 'must be a valid id') }),
    body: z.object({ status: z.enum(['out_for_delivery', 'delivered']) }),
};

// POST /api/rider/orders/:id/status   { status: "out_for_delivery" | "delivered" }
export const updateDeliveryStatus = async (req, res) => {
    const order = await Order.findById(req.valid.params.id).populate('rider', 'name phone');
    // Same answer for "not yours" and "doesn't exist".
    if (!order || !order.rider?._id.equals(req.user._id)) throw ApiError.notFound('Order not found');

    const { status } = req.valid.body;
    if (!riderCanMove(order, req.user._id, status)) {
        throw ApiError.conflict(
            status === 'out_for_delivery'
                ? 'You can pick the order up once the shop has it ready (Preparing)'
                : 'Mark it picked up before delivering'
        );
    }
    res.json({ data: await changeStatus(order, status, { by: req.user._id }) });
};
