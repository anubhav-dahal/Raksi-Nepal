// Must be the first import: ES modules run imports before the file body,
// so calling dotenv.config() below the imports would be too late for config/env.js.
import 'dotenv/config';

import app from './app.js';
import { env } from './config/env.js';
import { connectDB, isMemoryDB } from './config/db.js';
import { seedDatabase } from './seed/seedDatabase.js';
import { DEMO_STAFF, seedAdminFromEnv, seedDevStaff } from './seed/staff.js';

const startServer = async () => {
    await connectDB();

    if (isMemoryDB() && env.SEED_ON_START) {
        const counts = await seedDatabase();
        console.log(`Seeded ${counts.categories} categories and ${counts.products} products`);
        const admin = await seedDevStaff();
        console.log(`Admin login: ${admin.phone}${process.env.ADMIN_PASSWORD ? '' : ` / ${DEMO_STAFF[0].password} (demo)`}`);
        console.log(`Demo rider:  ${DEMO_STAFF[1].phone} / ${DEMO_STAFF[1].password}`);
    } else {
        // Real database: keep the single admin in sync with ADMIN_PHONE / ADMIN_PASSWORD.
        const admin = await seedAdminFromEnv();
        if (admin) console.log(`Admin login: ${admin.phone}`);
        else if (env.NODE_ENV === 'production') console.warn('ADMIN_PHONE / ADMIN_PASSWORD not set: no admin account.');
    }

    // 0.0.0.0 so a phone on the same Wi-Fi can reach the API.
    app.listen(env.PORT, '0.0.0.0', () => {
        console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
};

startServer();
