import { Router } from 'express';
import {
    getProduct,
    listProducts,
    listProductsSchema,
    productIdSchema,
} from '../controllers/productController.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', validate(listProductsSchema), listProducts);
router.get('/:id', validate(productIdSchema), getProduct);

export default router;
