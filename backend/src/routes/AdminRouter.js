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
import {
    addVariant,
    addVariantSchema,
    createCategory,
    createCategorySchema,
    createProduct,
    createProductSchema,
    listAllCategories,
    updateCategory,
    updateCategorySchema,
    uploadImageFile,
} from '../controllers/catalogueAdminController.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import { handleUpload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Every admin route: logged in AND admin.
router.use(requireAuth, requireRole('admin'));

router.get('/summary', getSummary);

router.get('/orders', validate(listOrdersSchema), listOrders);
router.post('/orders/:id/assign', validate(assignRiderSchema), assignRider);
router.get('/riders', listRiders);

router.post('/uploads', handleUpload, uploadImageFile);

router.get('/categories', listAllCategories);
router.post('/categories', validate(createCategorySchema), createCategory);
router.patch('/categories/:id', validate(updateCategorySchema), updateCategory);

router.get('/products', listProducts);
router.post('/products', validate(createProductSchema), createProduct);
router.post('/products/:id/variants', validate(addVariantSchema), addVariant);
router.patch('/products/:id', validate(updateProductSchema), updateProduct);
router.patch('/products/:id/variants/:sku', validate(updatePriceSchema), updateVariantPrice);
router.post('/products/:id/variants/:sku/stock', validate(adjustStockSchema), adjustStock);
router.get('/products/:id/stock-movements', validate(movementsSchema), listStockMovements);

router.post('/staff', validate(setRoleSchema), setRole);

export default router;
