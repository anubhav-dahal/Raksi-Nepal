import { Category } from '../models/CategoryModel.js';
import { Product } from '../models/ProductModel.js';
import { categories, products } from './catalogue.js';

// Upserts the starter catalogue. Safe to run again: existing records keep
// their stock (only inserted the first time), everything else is refreshed.
export const seedDatabase = async () => {
    const categoryIds = {};

    for (const category of categories) {
        const doc = await Category.findOneAndUpdate(
            { slug: category.slug },
            { $set: category },
            { upsert: true, returnDocument: 'after', runValidators: true }
        );
        categoryIds[category.slug] = doc._id;
    }

    for (const { category, variants, ...product } of products) {
        const cat = categories.find((c) => c.slug === category);
        await Product.findOneAndUpdate(
            { slug: product.slug },
            {
                $set: { ...product, category: categoryIds[category], alcoholic: cat.alcoholic },
                $setOnInsert: { variants },
            },
            { upsert: true, runValidators: true }
        );
    }

    return { categories: categories.length, products: products.length };
};
