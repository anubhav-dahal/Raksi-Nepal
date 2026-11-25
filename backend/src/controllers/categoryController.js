import { Category } from '../models/CategoryModel.js';

// GET /api/categories
export const listCategories = async (_req, res) => {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, 'name.en': 1 });
    res.json({ data: categories });
};
