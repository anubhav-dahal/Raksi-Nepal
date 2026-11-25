import { Product } from '../models/ProductModel.js';
import { StockMovement } from '../models/StockMovementModel.js';

/**
 * Changes one variant's stock atomically and records why.
 * A negative delta only succeeds if enough stock is left (never below 0).
 * Returns the new stock, or null if there wasn't enough.
 */
export const changeStock = async ({ product, sku, delta, reason, note = '', by = null, order = null }) => {
    const filter =
        delta < 0
            ? { _id: product, variants: { $elemMatch: { sku, stock: { $gte: -delta } } } }
            : { _id: product, 'variants.sku': sku };

    const updated = await Product.findOneAndUpdate(
        filter,
        { $inc: { 'variants.$.stock': delta } },
        { returnDocument: 'after', projection: { variants: 1 } }
    );
    if (!updated) return null;

    const stockAfter = updated.variants.find((v) => v.sku === sku).stock;
    await StockMovement.create({ product, sku, delta, stockAfter, reason, note, by, order });
    return stockAfter;
};
