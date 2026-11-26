import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { UPLOAD_DIR } from './middleware/upload.js';
import { BUILDS_DIR, downloadLatestApk } from './controllers/appVersionController.js';
import AdminRouter from './routes/AdminRouter.js';
import AppRouter from './routes/AppRouter.js';
import CategoryRouter from './routes/CategoryRouter.js';
import OrderRouter from './routes/OrderRouter.js';
import PaymentRouter from './routes/PaymentRouter.js';
import ProductRouter from './routes/ProductRouter.js';
import RiderRouter from './routes/RiderRouter.js';
import UserRouter from './routes/UserRouter.js';

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const app = express();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',') }));
app.use(express.json({ limit: '100kb' }));

// Admin uploads (may live outside the repo, see UPLOAD_DIR), then bundled images: /static/images/<file>
app.use('/static/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', immutable: true }));
app.use('/static', express.static(publicDir, { maxAge: '7d' }));

// Local app builds (npm run build:local): APKs for sideloading and the in-app update prompt.
app.get('/downloads/android/latest.apk', downloadLatestApk);
app.use('/downloads', express.static(BUILDS_DIR, { index: false, dotfiles: 'deny' }));

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Raksi Nepal API is active' });
});

app.use('/api/categories', CategoryRouter);
app.use('/api/products', ProductRouter);
app.use('/api/users', UserRouter);
app.use('/api/orders', OrderRouter);
app.use('/api/payments', PaymentRouter);
app.use('/api/admin', AdminRouter);
app.use('/api/app', AppRouter);
app.use('/api/rider', RiderRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
