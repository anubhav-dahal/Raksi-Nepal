// Must be the first import: ES modules run imports before the file body,
// so calling dotenv.config() below the imports would be too late for config/env.js.
import 'dotenv/config';

import app from './app.js';
import { env } from './config/env.js';
import { connectDB, isMemoryDB } from './config/db.js';
import { seedDatabase } from './seed/seedDatabase.js';

const startServer = async () => {
    await connectDB();

    if (isMemoryDB() && env.SEED_ON_START) {
        const counts = await seedDatabase();
        console.log(`Seeded ${counts.categories} categories and ${counts.products} products`);
    }

    // 0.0.0.0 so a phone on the same Wi-Fi can reach the API.
    app.listen(env.PORT, '0.0.0.0', () => {
        console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
};

startServer();
