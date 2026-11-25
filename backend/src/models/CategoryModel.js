import mongoose from 'mongoose';

// Bilingual text: English now, Nepali filled in later (Phase 7).
export const localizedText = {
    en: { type: String, required: true, trim: true },
    ne: { type: String, trim: true, default: '' },
};

const categorySchema = new mongoose.Schema(
    {
        name: localizedText,
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /^[a-z0-9-]+$/,
        },
        subtitle: localizedText,
        image: { type: String, required: true },
        // Alcoholic categories need the 18+ confirmation in the app.
        alcoholic: { type: Boolean, default: false },
        sortOrder: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

categorySchema.index({ isActive: 1, sortOrder: 1 });

export const Category = mongoose.model('Category', categorySchema);
