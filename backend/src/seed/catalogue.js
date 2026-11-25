// The shop's starter catalogue, read from public/catalog/catalog.json
// (simple names, prices in whole NPR, photos in public/catalog/<category>/).
//
// catalog.json lists one row per (product, size). Here rows with the same name
// in the same category become ONE product whose sizes are its options.
// Different products were given different names in catalog.json, so the name
// is the product. If the same size appears twice (two prices), the first
// price is used and the row is reported in `review`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CATALOG_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'catalog');
const STATIC = '/static/catalog';
const DEFAULT_STOCK = 24;

export const slugify = (s) =>
    s
        .toLowerCase()
        .replace(/'/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

// "180 ml" < "375 ml" < "750 ml" < "1 L"; grams after.
const sizeOrder = (size) => {
    const [n, unit] = size.split(' ');
    return unit === 'L' ? Number(n) * 1000 : unit === 'g' ? 100000 + Number(n) : Number(n);
};

export const loadCatalogue = (dir = CATALOG_DIR) => {
    const data = JSON.parse(fs.readFileSync(path.join(dir, 'catalog.json'), 'utf8'));

    const categories = data.categories.map((c) => ({
        slug: slugify(c.name),
        name: { en: c.name },
        subtitle: { en: '' },
        image: c.cover ? `${STATIC}/${c.cover}` : '',
        alcoholic: c.alcoholic,
        sortOrder: c.sortOrder,
    }));

    const products = [];
    const review = [];
    for (const category of data.categories) {
        const byName = new Map();
        for (const row of data.products[category.name] ?? []) {
            if (!byName.has(row.name)) byName.set(row.name, { image: '', sizes: new Map() });
            const p = byName.get(row.name);
            if (!p.image && row.imageFile) p.image = `${STATIC}/${row.imageFile}`;
            if (p.sizes.has(row.size)) {
                if (p.sizes.get(row.size) !== row.price) {
                    review.push(`${row.name} ${row.size}: using NPR ${p.sizes.get(row.size)}, also listed at NPR ${row.price}`);
                }
                continue;
            }
            p.sizes.set(row.size, row.price);
        }

        const categorySlug = slugify(category.name);
        for (const [name, p] of byName) {
            const slug = slugify(name);
            const sizes = [...p.sizes].sort((a, b) => sizeOrder(a[0]) - sizeOrder(b[0]));
            products.push({
                category: categorySlug,
                slug,
                name: { en: name },
                description: { en: '' },
                image: p.image,
                variants: sizes.map(([label, price]) => ({
                    sku: `${categorySlug}-${slug}-${label.replace(/\s+/g, '')}`.toUpperCase().slice(0, 60),
                    label,
                    price,
                    stock: DEFAULT_STOCK,
                })),
            });
        }
    }

    return { categories, products, review };
};
