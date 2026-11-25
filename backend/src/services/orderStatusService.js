import { Order } from '../models/OrderModel.js';
import { ApiError } from '../utils/ApiError.js';
import { notifyStatusChange } from './notificationService.js';
import { restoreStock } from './orderService.js';

// Allowed moves. Anything else is rejected.
//   pending -> confirmed -> preparing -> out_for_delivery -> delivered
//   pending / confirmed / preparing -> cancelled
//   pending -> payment_failed (eSewa)
export const TRANSITIONS = {
    pending: ['confirmed', 'cancelled', 'payment_failed'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered'],
    delivered: [],
    cancelled: [],
    payment_failed: [],
};

export const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery'];

export const canMove = (from, to) => TRANSITIONS[from]?.includes(to) ?? false;

/**
 * Moves an order to a new status, enforcing the rules above plus payment rules.
 * `by` is the user making the change (null for system events).
 */
export const changeStatus = async (order, to, { by = null, note = '' } = {}) => {
    if (!canMove(order.status, to)) {
        throw ApiError.conflict(`Cannot change an order from "${order.status}" to "${to}"`);
    }
    if (to === 'confirmed' && order.payment.method === 'esewa' && order.payment.status !== 'paid') {
        throw ApiError.conflict('This order is waiting for eSewa payment and cannot be confirmed yet');
    }
    if (to === 'out_for_delivery' && !order.rider) {
        throw ApiError.conflict('Assign a rider before sending the order out');
    }

    // Conditional update: if someone else changed the status a moment ago, this fails.
    const update = {
        $set: { status: to },
        $push: { statusHistory: { status: to, at: new Date(), by, note } },
    };
    if (to === 'delivered' && order.payment.method === 'cod') {
        update.$set['payment.status'] = 'paid';
        update.$set['payment.paidAt'] = new Date();
    }
    if (to === 'payment_failed') update.$set['payment.status'] = 'failed';

    const updated = await Order.findOneAndUpdate({ _id: order._id, status: order.status }, update, {
        returnDocument: 'after',
    }).populate('rider', 'name phone');
    if (!updated) throw ApiError.conflict('The order was updated by someone else. Refresh and try again.');

    if (to === 'cancelled' || to === 'payment_failed') await restoreStock(updated);

    notifyStatusChange(updated);
    return updated;
};

// What a rider may do with an order assigned to them.
export const RIDER_TRANSITIONS = { preparing: ['out_for_delivery'], out_for_delivery: ['delivered'] };

export const riderCanMove = (order, riderId, to) =>
    !!order.rider && order.rider._id.equals(riderId) && (RIDER_TRANSITIONS[order.status]?.includes(to) ?? false);
