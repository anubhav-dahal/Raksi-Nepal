import { User } from '../models/UserModel.js';
import { normalizePhone } from '../utils/phone.js';

// The shop has exactly ONE admin, set by ADMIN_PHONE / ADMIN_PASSWORD.
// For local development without those, a demo admin is used instead.
export const DEMO_STAFF = [
    { role: 'admin', name: 'Admin', phone: '9800000000', password: 'admin12345' },
    { role: 'rider', name: 'Demo Rider', phone: '9800000099', password: 'rider12345' },
];

const upsertUser = async ({ role, name, phone, password, resetPassword = false }) => {
    const existing = await User.findOne({ phone }).select('+passwordHash');
    if (existing) {
        existing.role = role;
        if (resetPassword) existing.passwordHash = await User.hashPassword(password);
        await existing.save();
        return existing;
    }
    return User.create({ name, phone, role, passwordHash: await User.hashPassword(password) });
};

/** Makes `phone` the only admin: anyone else who is admin becomes a customer. */
const makeOnlyAdmin = async (admin) => {
    await User.updateMany({ role: 'admin', _id: { $ne: admin._id } }, { $set: { role: 'customer' } });
    return admin;
};

/** The admin from env (any database). Returns null if ADMIN_PHONE / ADMIN_PASSWORD aren't set. */
export const seedAdminFromEnv = async () => {
    const phone = process.env.ADMIN_PHONE ? normalizePhone(process.env.ADMIN_PHONE) : '';
    const password = process.env.ADMIN_PASSWORD;
    if (!phone || !password) return null;
    if (password.length < 8) throw new Error('ADMIN_PASSWORD must be at least 8 characters');
    // The env password always wins, so changing ADMIN_PASSWORD and restarting resets it.
    const admin = await upsertUser({ role: 'admin', name: 'Admin', phone, password, resetPassword: true });
    return makeOnlyAdmin(admin);
};

/** Dev (MONGO_URI=memory): the env admin if set, else the demo admin; plus a demo rider. */
export const seedDevStaff = async () => {
    const admin = (await seedAdminFromEnv()) ?? (await makeOnlyAdmin(await upsertUser(DEMO_STAFF[0])));
    await upsertUser(DEMO_STAFF[1]);
    return admin;
};

/** Kept for tests: demo admin + rider. */
export const seedDemoStaff = async () => {
    for (const staff of DEMO_STAFF) await upsertUser(staff);
    return DEMO_STAFF.length;
};
