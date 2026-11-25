import mongoose from 'mongoose';
import { localizedText } from './CategoryModel.js';

// Prices are whole NPR (integers). There are no paisa in shop prices,
// and integers avoid floating point errors in totals.
const variantSchema = new mongoose.Schema({
    sku: { type: String, required: true, uppercase: true, trim: true },
    label: { type: String, required: true, trim: true }, // e.g. "650 ml bottle"
    price: {
        type: Number,
        required: true,
        min: 0,
        validate: { validator: Number.isInteger, message: 'price must be whole NPR' },
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        validate: { validator: Number.isInteger, message: 'stock must be an integer' },
    },
});

const productSchema = new mongoose.Schema(
    {
        name: localizedText,
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        description: localizedText,
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
        image: { type: String, required: true },
        alcoholic: { type: Boolean, default: false },
        variants: {
            type: [variantSchema],
            validate: { validator: (v) => v.length > 0, message: 'a product needs at least one variant' },
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ 'variants.sku': 1 }, { unique: true });

export const Product = mongoose.model('Product', productSchema);
