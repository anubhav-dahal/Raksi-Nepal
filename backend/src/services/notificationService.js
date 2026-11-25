import { env } from '../config/env.js';
import { User } from '../models/UserModel.js';

// Push notifications through Expo's push service (works for Android and iOS).
// The app registers its Expo push token with POST /api/users/me/push-token.
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const MESSAGES = {
    confirmed: 'The shop confirmed your order.',
    preparing: 'Your order is being packed.',
    out_for_delivery: 'Your order is on the way!',
    delivered: 'Delivered. Enjoy!',
    cancelled: 'Your order was cancelled.',
    payment_failed: 'Payment failed, so your order was not placed.',
};

/** Sends a push for a status change. Never throws: a failed push must not fail the request. */
export const notifyStatusChange = (order) => {
    const body = MESSAGES[order.status];
    if (!body || env.NODE_ENV === 'test') return;

    (async () => {
        const user = await User.findById(order.user).select('pushTokens');
        const tokens = user?.pushTokens ?? [];
        if (!tokens.length) return;

        const res = await fetch(EXPO_PUSH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(
                tokens.map((to) => ({
                    to,
                    title: `Order ${order.orderNumber}`,
                    body,
                    data: { orderId: order.id },
                    sound: 'default',
                }))
            ),
            signal: AbortSignal.timeout(10_000),
        });

        // Forget tokens Expo says are no longer valid (app uninstalled).
        const result = await res.json().catch(() => null);
        const dead = (result?.data ?? [])
            .map((ticket, i) => (ticket?.details?.error === 'DeviceNotRegistered' ? tokens[i] : null))
            .filter(Boolean);
        if (dead.length) await User.updateOne({ _id: order.user }, { $pull: { pushTokens: { $in: dead } } });
    })().catch((error) => console.error('Push notification failed:', error.message));
};
