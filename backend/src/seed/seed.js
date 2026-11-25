// CLI: npm run seed [-- --replace]
// Loads the shop catalogue (public/catalog) into the database in MONGO_URI.
// With MONGO_URI=memory the server seeds itself on start, so this is for a
// real (persistent) database.
//   --replace   also hide categories/products that aren't in the catalogue
//               (e.g. old demo items). Nothing is deleted.
// Set ADMIN_PHONE and ADMIN_PASSWORD to also create/update the one admin.
import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from './seedDatabase.js';
import { seedAdminFromEnv } from './staff.js';

const replace = process.argv.includes('--replace');

await connectDB();
const result = await seedDatabase(undefined, { replace });
console.log(`Catalogue: ${result.categories} categories, ${result.products} products`);
if (replace) console.log(`Hidden (not in catalogue): ${result.hidden.categories} categories, ${result.hidden.products} products`);
if (result.review.length) {
    console.log('Same size listed twice in catalog.json (first price used):');
    for (const line of result.review) console.log(`  - ${line}`);
}
const admin = await seedAdminFromEnv();
if (admin) console.log(`Admin account ready: ${admin.phone}`);
await disconnectDB();
