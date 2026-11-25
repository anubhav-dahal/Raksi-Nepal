import { Router } from 'express';
import {
    cancelOrder,
    createOrder,
    createOrderSchema,
    getOrder,
    getOrderByNumber,
    listMyOrders,
    orderNumberSchema,
    orderIdSchema,
    quoteOrder,
    quoteSchema,
    statusSchema,
    switchToCod,
    updateStatus,
} from '../controllers/orderController.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/quote', validate(quoteSchema), quoteOrder);
router.post('/', requireAuth, validate(createOrderSchema), createOrder);
router.get('/', requireAuth, listMyOrders);
router.get('/by-number/:number', requireAuth, requireRole('admin'), validate(orderNumberSchema), getOrderByNumber);
router.get('/:id', requireAuth, validate(orderIdSchema), getOrder);
router.post('/:id/cancel', requireAuth, validate(orderIdSchema), cancelOrder);
router.post('/:id/pay-on-delivery', requireAuth, validate(orderIdSchema), switchToCod);
router.patch('/:id/status', requireAuth, requireRole('admin'), validate(statusSchema), updateStatus);

export default router;
