import { Router } from 'express';
import { listMyDeliveries, riderStatusSchema, updateDeliveryStatus } from '../controllers/riderController.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth, requireRole('rider'));

router.get('/orders', listMyDeliveries);
router.post('/orders/:id/status', validate(riderStatusSchema), updateDeliveryStatus);

export default router;
