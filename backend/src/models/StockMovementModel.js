import mongoose from 'mongoose';

// Audit trail: one record for every stock change (who, when, why).
export const STOCK_REASONS = ['order', 'order_cancelled', 'restock', 'adjustment', 'damaged'];

const stockMovementSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        sku: { type: String, required: true },
        delta: { type: Number, required: true },
        stockAfter: { type: Number, required: true, min: 0 },
        reason: { type: String, enum: STOCK_REASONS, required: true },
        note: { type: String, trim: true, maxlength: 200, default: '' },
        // null for automatic changes made by an order.
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

stockMovementSchema.index({ product: 1, createdAt: -1 });
stockMovementSchema.index({ sku: 1, createdAt: -1 });

export const StockMovement = mongoose.model('StockMovement', stockMovementSchema);
