import mongoose from 'mongoose';
import { z } from 'zod';
import { ORDER_STATUSES, Order } from '../models/OrderModel.js';
import { Product } from '../models/ProductModel.js';
import { StockMovement } from '../models/StockMovementModel.js';
import { ROLES, User } from '../models/UserModel.js';
import { phoneField } from '../utils/phone.js';
import { ACTIVE_STATUSES } from '../services/orderStatusService.js';
import { changeStock } from '../services/stockService.js';
import { ApiError } from '../utils/ApiError.js';

const objectId = z.string().refine((v) => mongoose.isValidObjectId(v), 'must be a valid id');
const LOW_STOCK = 5;

// ---- Dashboard -------------------------------------------------------------

// GET /api/admin/summary
export const getSummary = async (_req, res) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [activeByStatus, todayOrders, todayRevenue, lowStock, awaitingPayment] = await Promise.all([
        Order.aggregate([{ $match: { status: { $in: ACTIVE_STATUSES } } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
        Order.countDocuments({ createdAt: { $gte: startOfDay } }),
        Order.aggregate([
            { $match: { 'payment.status': 'paid', 'payment.paidAt': { $gte: startOfDay } } },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Product.countDocuments({ isActive: true, 'variants.stock': { $lte: LOW_STOCK } }),
        Order.countDocuments({ status: 'pending', 'payment.method': 'esewa', 'payment.status': { $ne: 'paid' } }),
    ]);

    res.json({
        data: {
            active: Object.fromEntries(activeByStatus.map((s) => [s._id, s.count])),
            todayOrders,
            todayRevenue: todayRevenue[0]?.total ?? 0,
            lowStockProducts: lowStock,
            awaitingPayment,
        },
    });
};

// ---- Orders ----------------------------------------------------------------

export const listOrdersSchema = {
    query: z.object({
        status: z.enum(['active', 'all', ...ORDER_STATUSES]).default('active'),
        limit: z.coerce.number().int().min(1).max(100).default(50),
    }),
};

// GET /api/admin/orders?status=active
export const listOrders = async (req, res) => {
    const { status, limit } = req.valid.query;
    const filter = status === 'all' ? {} : status === 'active' ? { status: { $in: ACTIVE_STATUSES } } : { status };

    const orders = await Order.find(filter)
        .sort({ createdAt: status === 'active' ? 1 : -1 }) // active: oldest first, it's the queue
        .limit(limit)
        .populate('user', 'name phone')
        .populate('rider', 'name phone');
    res.json({ data: orders });
};

// GET /api/admin/riders
export const listRiders = async (_req, res) => {
    const riders = await User.find({ role: 'rider', isActive: true }).sort({ name: 1 });
    const busy = await Order.aggregate([
        { $match: { rider: { $in: riders.map((r) => r._id) }, status: { $in: ACTIVE_STATUSES } } },
        { $group: { _id: '$rider', count: { $sum: 1 } } },
    ]);
    res.json({
        data: riders.map((r) => ({
            ...r.toJSON(),
            activeOrders: busy.find((b) => b._id.equals(r._id))?.count ?? 0,
        })),
    });
};

export const assignRiderSchema = {
    params: z.object({ id: objectId }),
    body: z.object({ riderId: objectId }),
};

// POST /api/admin/orders/:id/assign
export const assignRider = async (req, res) => {
    const rider = await User.findOne({ _id: req.valid.body.riderId, role: 'rider', isActive: true });
    if (!rider) throw ApiError.badRequest('Choose an active rider');

    const order = await Order.findOneAndUpdate(
        { _id: req.valid.params.id, status: { $in: ['confirmed', 'preparing'] } },
        { $set: { rider: rider._id } },
        { returnDocument: 'after' }
    )
        .populate('user', 'name phone')
        .populate('rider', 'name phone');
    if (!order) throw ApiError.conflict('Riders can be assigned once the order is confirmed and before it leaves');
    res.json({ data: order });
};

// ---- Products, prices, stock --------------------------------------------------

// GET /api/admin/products   (includes hidden products)
export const listProducts = async (_req, res) => {
    const products = await Product.find().sort({ 'name.en': 1 }).populate('category', 'name slug');
    res.json({ data: products });
};

export const updateProductSchema = {
    params: z.object({ id: objectId }),
    body: z
        .object({
            name: z.string().trim().min(2).max(80).optional(),
            description: z.string().trim().max(500).optional(),
            image: z.string().url().optional(),
            isActive: z.boolean().optional(),
        })
        .refine((b) => Object.keys(b).length > 0, 'nothing to update'),
};

// PATCH /api/admin/products/:id
export const updateProduct = async (req, res) => {
    const { name, description, ...rest } = req.valid.body;
    const set = { ...rest };
    if (name) set['name.en'] = name;
    if (description !== undefined) set['description.en'] = description;

    const product = await Product.findByIdAndUpdate(req.valid.params.id, { $set: set }, { returnDocument: 'after', runValidators: true });
    if (!product) throw ApiError.notFound('Product not found');
    res.json({ data: product });
};

const variantParams = z.object({ id: objectId, sku: z.string().trim().toUpperCase().min(1) });

export const updatePriceSchema = {
    params: variantParams,
    body: z.object({ price: z.number().int().min(0).max(1_000_000) }),
};

// PATCH /api/admin/products/:id/variants/:sku   (price; past orders keep their price snapshot)
export const updateVariantPrice = async (req, res) => {
    const { id, sku } = req.valid.params;
    const product = await Product.findOneAndUpdate(
        { _id: id, 'variants.sku': sku },
        { $set: { 'variants.$.price': req.valid.body.price } },
        { returnDocument: 'after' }
    );
    if (!product) throw ApiError.notFound('Product or variant not found');
    res.json({ data: product });
};

export const adjustStockSchema = {
    params: variantParams,
    body: z.object({
        delta: z
            .number()
            .int()
            .refine((d) => d !== 0, 'must not be 0'),
        reason: z.enum(['restock', 'adjustment', 'damaged']),
        note: z.string().trim().max(200).optional().default(''),
    }),
};

// POST /api/admin/products/:id/variants/:sku/stock   { delta: +24, reason: "restock" }
export const adjustStock = async (req, res) => {
    const { id, sku } = req.valid.params;
    const { delta, reason, note } = req.valid.body;

    if (!(await Product.exists({ _id: id, 'variants.sku': sku }))) throw ApiError.notFound('Product or variant not found');

    const stock = await changeStock({ product: id, sku, delta, reason, note, by: req.user._id });
    if (stock === null) throw ApiError.conflict('Stock cannot go below 0');
    res.json({ data: { sku, stock } });
};

export const movementsSchema = { params: z.object({ id: objectId }) };

// GET /api/admin/products/:id/stock-movements   (latest 50)
export const listStockMovements = async (req, res) => {
    const movements = await StockMovement.find({ product: req.valid.params.id })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('by', 'name role')
        .populate('order', 'orderNumber');
    res.json({ data: movements });
};

// ---- Staff -------------------------------------------------------------------

export const setRoleSchema = {
    body: z.object({
        phone: phoneField(),
        role: z.enum(ROLES),
    }),
};

// POST /api/admin/staff   { phone, role }   (the person registers in the app first)
export const setRole = async (req, res) => {
    const { phone, role } = req.valid.body;
    if (phone === req.user.phone && role !== 'admin') throw ApiError.badRequest('You cannot remove your own admin role');

    const user = await User.findOneAndUpdate({ phone }, { $set: { role } }, { returnDocument: 'after' });
    if (!user) throw ApiError.notFound('No account with this phone number. Ask them to register in the app first.');
    res.json({ data: user });
};
