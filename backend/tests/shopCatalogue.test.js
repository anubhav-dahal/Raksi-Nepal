// The shop's real catalogue (public/catalog): data and photos are consistent.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { app } from './setup.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { loadCatalogue } from '../src/seed/catalogue.js';
import { seedDatabase } from '../src/seed/seedDatabase.js';

const PUBLIC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const raw = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'catalog', 'catalog.json'), 'utf8'));
const shop = loadCatalogue();

before(async () => {
    await connectDB();
    await seedDatabase(shop);
});
after(disconnectDB);

describe('shop catalogue data', () => {
    test('8 categories in shop order', () => {
        assert.deepEqual(
            shop.categories.map((c) => c.name.en),
            ['Beer', 'Whiskey', 'Vodka', 'Rum', 'Gin', 'Wine', 'Other Drinks', 'Snack Sets']
        );
        assert.equal(shop.categories.find((c) => c.slug === 'snack-sets').alcoholic, false);
    });

    test('every row of catalog.json is a size of some product, at its price (first price when listed twice)', () => {
        for (const [category, rows] of Object.entries(raw.products)) {
            for (const row of rows) {
                const p = shop.products.find((x) => x.name.en === row.name && x.category === category.toLowerCase().replace(/ /g, '-'));
                assert.ok(p, `missing product ${row.name}`);
                assert.ok(p.variants.some((v) => v.label === row.size), `${row.name} missing size ${row.size}`);
            }
        }
        // Spot checks against the source prices.
        const price = (name, size) => shop.products.find((p) => p.name.en === name).variants.find((v) => v.label === size).price;
        assert.equal(price('Gorkha Strong Beer', '650 ml'), 375);
        assert.equal(price('Khukri XXX Rum', '180 ml'), 575);
        assert.equal(price('KK Chicken Snack Set', '95 g'), 160);
    });

    test('product slugs and SKUs are unique; sizes go small to large', () => {
        const slugs = shop.products.map((p) => p.slug);
        assert.equal(new Set(slugs).size, slugs.length);
        const skus = shop.products.flatMap((p) => p.variants.map((v) => v.sku));
        assert.equal(new Set(skus).size, skus.length);
        const oldMonk = shop.products.find((p) => p.name.en === 'Old Monk XXX Rum');
        assert.deepEqual(oldMonk.variants.map((v) => v.label), ['180 ml', '375 ml', '750 ml']);
    });

    test('different products keep different names', () => {
        const names = shop.products.map((p) => p.name.en);
        assert.ok(names.includes('Old Durbar Reserve Whiskey') && names.includes('Old Durbar Blended Reserve Whiskey'));
        assert.ok(names.includes('Golden Oak Whiskey') && names.includes('Golden Oak Blended Malt Whiskey'));
    });

    test('every photo and cover exists; no third-party traces', () => {
        for (const item of [...shop.products, ...shop.categories]) {
            if (!item.image) continue;
            assert.ok(fs.existsSync(path.join(PUBLIC, item.image.replace('/static/', ''))), `missing ${item.image}`);
        }
        assert.ok(shop.categories.every((c) => c.image), 'every category has a cover');
        const text = fs.readFileSync(path.join(PUBLIC, 'catalog', 'catalog.json'), 'utf8');
        assert.doesNotMatch(text, /fasto|https?:\/\//i);
        assert.doesNotMatch(text, /[ऀ-ॿ]/, 'no Nepali script');
    });
});

describe('shop catalogue through the API', () => {
    test('categories and products are served with their photos', async () => {
        const cats = (await request(app).get('/api/categories').expect(200)).body.data;
        assert.equal(cats.length, 8);
        const whiskey = (await request(app).get('/api/products?category=whiskey').expect(200)).body.data;
        const jw = whiskey.find((p) => p.name.en === 'Johnnie Walker Black Label Whiskey');
        assert.equal(jw.image, '/static/catalog/whiskey/johnnie-walker-black-label-whiskey.webp');
        await request(app).get(jw.image).expect(200).expect('Content-Type', /image\/webp/);
        await request(app).get(cats[0].image).expect(200);
    });
});
