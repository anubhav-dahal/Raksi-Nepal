// CLI: npm run seed
// Seeds the database in MONGO_URI. With MONGO_URI=memory the server seeds
// itself on start, so this is mainly for a real (persistent) database.
// Set ADMIN_PHONE and ADMIN_PASSWORD to also create the first admin account.
import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from './seedDatabase.js';
import { seedAdminFromEnv } from './staff.js';

await connectDB();
const counts = await seedDatabase();
console.log(`Seeded ${counts.categories} categories and ${counts.products} products`);
const admin = await seedAdminFromEnv();
if (admin) console.log(`Admin account ready: ${admin.phone}`);
await disconnectDB();
