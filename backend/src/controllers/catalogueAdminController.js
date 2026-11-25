import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Category } from '../models/CategoryModel.js';
import { Product } from '../models/ProductModel.js';
import { StockMovement } from '../models/StockMovementModel.js';
import { ApiError } from '../utils/ApiError.js';

const objectId = z.string().refine((v) => mongoose.isValidObjectId(v), 'must be a valid id');

// "" (no image), an image uploaded to this API (/static/...), or an https URL.
const image = z
    .string()
    .trim()
    .refine((v) => v === '' || v.startsWith('/static/') || /^https:\/\/\S+$/.test(v), 'must be an uploaded image or an https URL');

const slugify = (text) =>
    text
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50) || 'item';

/** A slug not used yet in the collection ("gorkha", "gorkha-2", ...). */
const uniqueSlug = async (Model, text, exceptId) => {
    const base = slugify(text);
    for (let i = 1; ; i += 1) {
        const slug = i === 1 ? base : `${base}-${i}`;
        const taken = await Model.exists({ slug, ...(exceptId ? { _id: { $ne: exceptId } } : {}) });
        if (!taken) return slug;
    }
};

/** Readable, unique SKU: BEER-GORKHA-PREMIUM-650ML-3F2A. */
const makeSku = (categorySlug, productSlug, label) =>
    [categorySlug.split('-')[0], productSlug, label.replace(/\s+/g, '').slice(0, 10), crypto.randomBytes(2).toString('hex')]
        .join('-')
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, '')
        .slice(0, 60);

// ---- Uploads -------------------------------------------------------------------

// POST /api/admin/uploads   multipart field "image"  ->  { url: "/static/uploads/..." }
export const uploadImageFile = (req, res) => {
    if (!req.file) throw ApiError.badRequest('Choose an image to upload');
    res.status(201).json({ data: { url: `/static/uploads/${req.file.filename}` } });
};

// ---- Categories -------------------------------------------------------------------

// GET /api/admin/categories   (all, with how many products each has)
export const listAllCategories = async (_req, res) => {
    const [categories, counts] = await Promise.all([
        Category.find().sort({ sortOrder: 1, 'name.en': 1 }),
        Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);
    res.json({
        data: categories.map((c) => ({
            ...c.toJSON(),
            productCount: counts.find((x) => x._id.equals(c._id))?.count ?? 0,
        })),
    });
};

const categoryBody = z.object({
    name: z.string().trim().min(2).max(40),
    image,
    alcoholic: z.boolean().default(false),
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().min(0).max(999).optional(),
});

export const createCategorySchema = { body: categoryBody };

// POST /api/admin/categories
export const createCategory = async (req, res) => {
    const { name, image: img, alcoholic, isActive, sortOrder } = req.valid.body;
    const last = await Category.findOne().sort({ sortOrder: -1 });
    const category = await Category.create({
        name: { en: name },
        slug: await uniqueSlug(Category, name),
        subtitle: { en: '' },
        image: img,
        alcoholic,
        isActive,
        sortOrder: sortOrder ?? (last?.sortOrder ?? 0) + 1,
    });
    res.status(201).json({ data: category });
};

export const updateCategorySchema = {
    params: z.object({ id: objectId }),
    body: categoryBody.partial().refine((b) => Object.keys(b).length > 0, 'nothing to update'),
};

// PATCH /api/admin/categories/:id   (alcoholic changes are copied to its products)
export const updateCategory = async (req, res) => {
    const { name, ...rest } = req.valid.body;
    const set = { ...rest };
    if (name) set['name.en'] = name;

    const category = await Category.findByIdAndUpdate(req.valid.params.id, { $set: set }, { returnDocument: 'after', runValidators: true });
    if (!category) throw ApiError.notFound('Category not found');
    if (rest.alcoholic !== undefined) await Product.updateMany({ category: category._id }, { $set: { alcoholic: rest.alcoholic } });
    res.json({ data: category });
};

// ---- Products ---------------------------------------------------------------------

const variantInput = z.object({
    label: z.string().trim().min(1).max(40),
    price: z.number().int().min(0).max(1_000_000),
    stock: z.number().int().min(0).max(100_000),
});

export const createProductSchema = {
    body: z.object({
        categoryId: objectId,
        name: z.string().trim().min(2).max(80),
        description: z.string().trim().max(500).default(''),
        image,
        variants: z.array(variantInput).min(1, 'add at least one size').max(10),
    }),
};

// POST /api/admin/products
export const createProduct = async (req, res) => {
    const { categoryId, name, description, image: img, variants } = req.valid.body;
    const category = await Category.findById(categoryId);
    if (!category) throw ApiError.badRequest('Choose an existing category');

    const slug = await uniqueSlug(Product, name);
    const product = await Product.create({
        name: { en: name },
        slug,
        description: { en: description },
        category: category._id,
        image: img,
        alcoholic: category.alcoholic,
        variants: variants.map((v) => ({ ...v, sku: makeSku(category.slug, slug, v.label) })),
    });

    // Opening stock goes into the audit trail.
    const opening = product.variants.filter((v) => v.stock > 0);
    if (opening.length) {
        await StockMovement.insertMany(
            opening.map((v) => ({
                product: product._id,
                sku: v.sku,
                delta: v.stock,
                stockAfter: v.stock,
                reason: 'restock',
                note: 'Opening stock',
                by: req.user._id,
            }))
        );
    }
    res.status(201).json({ data: product });
};

export const addVariantSchema = {
    params: z.object({ id: objectId }),
    body: variantInput,
};

// POST /api/admin/products/:id/variants   (a new size)
export const addVariant = async (req, res) => {
    const product = await Product.findById(req.valid.params.id).populate('category', 'slug');
    if (!product) throw ApiError.notFound('Product not found');
    if (product.variants.length >= 10) throw ApiError.badRequest('A product can have at most 10 sizes');

    const { label, price, stock } = req.valid.body;
    const sku = makeSku(product.category?.slug ?? 'item', product.slug, label);
    product.variants.push({ sku, label, price, stock });
    await product.save();
    if (stock > 0) {
        await StockMovement.create({ product: product._id, sku, delta: stock, stockAfter: stock, reason: 'restock', note: 'Opening stock', by: req.user._id });
    }
    res.status(201).json({ data: product });
};

export { image as imageField, objectId as objectIdField };
