// Shared test setup: in-memory MongoDB, freshly seeded for each test file.
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'memory';
process.env.JWT_SECRET = 'test-secret-at-least-16-chars';

const { connectDB, disconnectDB } = await import('../src/config/db.js');
const { seedDatabase } = await import('../src/seed/seedDatabase.js');
const { default: app } = await import('../src/app.js');

export { app };

export const startDB = async () => {
    await connectDB();
    await seedDatabase();
};

export const stopDB = disconnectDB;
