// Temporary testing tool: moves an order to its next status through the API.
//
//   npm run order:next -- RC-261125-A1B2C3              (next step on the happy path)
//   npm run order:next -- RC-261125-A1B2C3 cancelled    (a specific status)
//
// Logs in as ADMIN_PHONE / ADMIN_PASSWORD, or the demo admin when using MONGO_URI=memory.
// The API must be running (npm run dev). Admins can do the same from the app (Phase 6).
import 'dotenv/config';
import { DEMO_STAFF } from '../seed/staff.js';

const NEXT = { pending: 'confirmed', confirmed: 'preparing', preparing: 'out_for_delivery', out_for_delivery: 'delivered' };

const [number, wanted] = process.argv.slice(2);
if (!number) {
    console.error('Usage: npm run order:next -- <order number> [status]');
    process.exit(1);
}

const api = process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 5000}`;
const demo = DEMO_STAFF.find((s) => s.role === 'admin');
const phone = process.env.ADMIN_PHONE ?? demo.phone;
const password = process.env.ADMIN_PASSWORD ?? demo.password;

const call = async (path, options = {}) => {
    const res = await fetch(`${api}/api${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error?.message ?? `HTTP ${res.status}`);
    return body.data;
};

try {
    const { token } = await call('/users/login', { method: 'POST', body: JSON.stringify({ phone, password }) });
    const auth = { Authorization: `Bearer ${token}` };

    const order = await call(`/orders/by-number/${encodeURIComponent(number)}`, { headers: auth });
    const to = wanted ?? NEXT[order.status];
    if (!to) {
        console.log(`${order.orderNumber} is "${order.status}". Nothing comes after that.`);
        process.exit(0);
    }

    const updated = await call(`/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: auth,
        body: JSON.stringify({ status: to, note: 'Changed with order:next tool' }),
    });
    console.log(`${updated.orderNumber}: ${order.status} -> ${updated.status} (payment ${updated.payment.status})`);
} catch (error) {
    console.error(`Failed: ${error.message}`);
    process.exit(1);
}
