import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';
import { login, loginSchema, me, register, registerSchema } from '../controllers/userController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { ApiError } from '../utils/ApiError.js';

const router = Router();

// Slow down password guessing: 10 attempts per 15 minutes per IP.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => env.NODE_ENV === 'test',
    handler: (_req, _res, next) =>
        next(new ApiError(429, 'TOO_MANY_REQUESTS', 'Too many attempts. Please wait a few minutes and try again.')),
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', requireAuth, me);

export default router;
