import mongoose from 'mongoose';
import { env } from './env.js';

let memoryServer = null;

// Expose `id` instead of `_id` and hide `__v` in every JSON response.
mongoose.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret._id;
        return ret;
    },
});

const resolveUri = async () => {
    if (env.MONGO_URI !== 'memory') return env.MONGO_URI;

    if (env.NODE_ENV === 'production') {
        throw new Error('MONGO_URI=memory is not allowed in production');
    }

    // Dev/test only: start a throwaway MongoDB. Data resets on every start.
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    return memoryServer.getUri('raksi_nepal');
};

export const connectDB = async () => {
    try {
        const uri = await resolveUri();
        const conn = await mongoose.connect(uri);
        const where = memoryServer ? 'in-memory' : conn.connection.host;
        console.log(`MongoDB Connected: ${where}`);
        return conn;
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export const disconnectDB = async () => {
    await mongoose.disconnect();
    if (memoryServer) {
        await memoryServer.stop();
        memoryServer = null;
    }
};

export const isMemoryDB = () => memoryServer !== null;
