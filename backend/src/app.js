import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import CategoryRouter from './routes/CategoryRouter.js';
import ProductRouter from './routes/ProductRouter.js';

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const app = express();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',') }));
app.use(express.json({ limit: '100kb' }));

// Product images and other files the app loads: /static/images/<file>
app.use('/static', express.static(publicDir, { maxAge: '7d' }));

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Raksi Nepal API is active' });
});

app.use('/api/categories', CategoryRouter);
app.use('/api/products', ProductRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
