import { Router } from 'express';
import {
    adjustStock,
    adjustStockSchema,
    assignRider,
    assignRiderSchema,
    getSummary,
    listOrders,
    listOrdersSchema,
    listProducts,
    listRiders,
    listStockMovements,
    movementsSchema,
    setRole,
    setRoleSchema,
    updatePriceSchema,
    updateProduct,
    updateProductSchema,
    updateVariantPrice,
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Every admin route: logged in AND admin.
router.use(requireAuth, requireRole('admin'));

router.get('/summary', getSummary);

router.get('/orders', validate(listOrdersSchema), listOrders);
router.post('/orders/:id/assign', validate(assignRiderSchema), assignRider);
router.get('/riders', listRiders);

router.get('/products', listProducts);
router.patch('/products/:id', validate(updateProductSchema), updateProduct);
router.patch('/products/:id/variants/:sku', validate(updatePriceSchema), updateVariantPrice);
router.post('/products/:id/variants/:sku/stock', validate(adjustStockSchema), adjustStock);
router.get('/products/:id/stock-movements', validate(movementsSchema), listStockMovements);

router.post('/staff', validate(setRoleSchema), setRole);

export default router;
