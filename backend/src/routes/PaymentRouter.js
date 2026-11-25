import { Router } from 'express';
import { orderIdSchema } from '../controllers/orderController.js';
import {
    createEsewaSession,
    esewaFailure,
    esewaPayPage,
    esewaSuccess,
    sessionSchema,
} from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/esewa/:id/session', requireAuth, validate({ ...orderIdSchema, ...sessionSchema }), createEsewaSession);

// Opened by the phone's browser / eSewa redirects: authenticated by the signed session token.
router.get('/esewa/pay/:token', esewaPayPage);
router.get('/esewa/success/:token', esewaSuccess);
router.get('/esewa/failure/:token', esewaFailure);

export default router;
