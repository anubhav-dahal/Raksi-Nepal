import { Category } from '../models/CategoryModel.js';
import { Product } from '../models/ProductModel.js';
import { loadCatalogue } from './catalogue.js';

/**
 * Upserts a catalogue ({ categories, products }; default: public/catalog).
 * Safe to run again: existing products keep their stock and sizes
 * (only set the first time); names, photos and categories are refreshed.
 *
 * replace: true also HIDES categories/products that aren't in the catalogue
 * (e.g. the old demo items). Nothing is deleted, so past orders stay valid.
 */
export const seedDatabase = async (data = loadCatalogue(), { replace = false } = {}) => {
    const categoryIds = {};

    for (const category of data.categories) {
        const doc = await Category.findOneAndUpdate(
            { slug: category.slug },
            { $set: { ...category, isActive: true } },
            { upsert: true, returnDocument: 'after', runValidators: true }
        );
        categoryIds[category.slug] = doc._id;
    }

    for (const { category, variants, ...product } of data.products) {
        const cat = data.categories.find((c) => c.slug === category);
        await Product.findOneAndUpdate(
            { slug: product.slug },
            {
                $set: { ...product, category: categoryIds[category], alcoholic: cat.alcoholic },
                $setOnInsert: { variants },
            },
            { upsert: true, runValidators: true }
        );
    }

    let hidden = { categories: 0, products: 0 };
    if (replace) {
        const keepCats = data.categories.map((c) => c.slug);
        const keepProducts = data.products.map((p) => p.slug);
        const c = await Category.updateMany({ slug: { $nin: keepCats } }, { $set: { isActive: false } });
        const p = await Product.updateMany({ slug: { $nin: keepProducts } }, { $set: { isActive: false } });
        hidden = { categories: c.modifiedCount, products: p.modifiedCount };
    }

    return { categories: data.categories.length, products: data.products.length, hidden, review: data.review ?? [] };
};
