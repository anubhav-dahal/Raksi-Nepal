import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';
import {
    login,
    loginSchema,
    me,
    pushTokenSchema,
    register,
    registerSchema,
    removePushToken,
    savePushToken,
} from '../controllers/userController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { ApiError } from '../utils/ApiError.js';

const router = Router();

// Slow down password guessing: 10 attempts per 15 minutes per IP in production.
// Looser in development so testing on a phone doesn't lock you out.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.NODE_ENV === 'production' ? 10 : 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => env.NODE_ENV === 'test',
    handler: (_req, _res, next) =>
        next(new ApiError(429, 'TOO_MANY_REQUESTS', 'Too many attempts. Please wait a few minutes and try again.')),
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', requireAuth, me);
router.post('/me/push-token', requireAuth, validate(pushTokenSchema), savePushToken);
router.delete('/me/push-token', requireAuth, validate(pushTokenSchema), removePushToken);

export default router;
