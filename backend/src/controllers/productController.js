import mongoose from 'mongoose';
import { z } from 'zod';
import { Category } from '../models/CategoryModel.js';
import { Product } from '../models/ProductModel.js';
import { ApiError } from '../utils/ApiError.js';

const objectId = z.string().refine((v) => mongoose.isValidObjectId(v), 'must be a valid id');

export const listProductsSchema = {
    query: z.object({
        // Category slug ("beer") or id.
        category: z.string().trim().min(1).optional(),
    }),
};

export const productIdSchema = {
    params: z.object({ id: objectId }),
};

// GET /api/products?category=beer
export const listProducts = async (req, res) => {
    const filter = { isActive: true };
    const { category } = req.valid.query;

    if (category) {
        const found = await Category.findOne(
            mongoose.isValidObjectId(category) ? { _id: category } : { slug: category.toLowerCase() }
        );
        if (!found) throw ApiError.notFound(`Category "${category}" not found`);
        filter.category = found._id;
    }

    const products = await Product.find(filter).sort({ 'name.en': 1 });
    res.json({ data: products });
};

// GET /api/products/:id
export const getProduct = async (req, res) => {
    const product = await Product.findOne({ _id: req.valid.params.id, isActive: true }).populate(
        'category',
        'name slug alcoholic'
    );
    if (!product) throw ApiError.notFound('Product not found');
    res.json({ data: product });
};
