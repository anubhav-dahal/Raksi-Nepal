import { User } from '../models/UserModel.js';

// Demo staff for local development with MONGO_URI=memory.
// Never created in production or in a real database unless asked for via env.
export const DEMO_STAFF = [
    { role: 'admin', name: 'Demo Admin', phone: '9800000000', password: 'admin12345' },
    { role: 'rider', name: 'Demo Rider', phone: '9800000099', password: 'rider12345' },
];

const upsertStaff = async ({ role, name, phone, password }) => {
    const existing = await User.findOne({ phone });
    if (existing) {
        if (existing.role !== role) {
            existing.role = role;
            await existing.save();
        }
        return existing;
    }
    return User.create({ name, phone, role, passwordHash: await User.hashPassword(password) });
};

/** Dev only: the demo admin and rider above. */
export const seedDemoStaff = async () => {
    for (const staff of DEMO_STAFF) await upsertStaff(staff);
    return DEMO_STAFF.length;
};

/** Real databases: creates/promotes one admin from ADMIN_PHONE / ADMIN_PASSWORD if both are set. */
export const seedAdminFromEnv = async () => {
    const { ADMIN_PHONE: phone, ADMIN_PASSWORD: password } = process.env;
    if (!phone || !password) return null;
    if (password.length < 8) throw new Error('ADMIN_PASSWORD must be at least 8 characters');
    return upsertStaff({ role: 'admin', name: 'Admin', phone, password });
};
