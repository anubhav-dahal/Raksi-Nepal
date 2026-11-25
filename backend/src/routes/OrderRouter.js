import { Router } from 'express';
import {
    createOrder,
    createOrderSchema,
    getOrder,
    listMyOrders,
    orderIdSchema,
    quoteOrder,
    quoteSchema,
} from '../controllers/orderController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/quote', validate(quoteSchema), quoteOrder);
router.post('/', requireAuth, validate(createOrderSchema), createOrder);
router.get('/', requireAuth, listMyOrders);
router.get('/:id', requireAuth, validate(orderIdSchema), getOrder);

export default router;
