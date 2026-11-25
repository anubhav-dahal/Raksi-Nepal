// CLI: npm run seed
// Seeds the database in MONGO_URI. With MONGO_URI=memory the server seeds
// itself on start, so this is mainly for a real (persistent) database.
import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from './seedDatabase.js';

await connectDB();
const counts = await seedDatabase();
console.log(`Seeded ${counts.categories} categories and ${counts.products} products`);
await disconnectDB();
