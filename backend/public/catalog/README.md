# Shop catalogue

The starter products of Nepalgunj Sips: 8 categories and 80 products (107 sizes), every one with a photo. Prices are in whole NPR. The backend serves this folder at `/static/catalog/...`, and `npm run seed` loads it into the database.

| File | What it is |
| :-- | :-- |
| `catalog.json` | `categories` (name, 18+, order, cover) and `products`: one row per product size with `name`, `size`, `price`, `imageFile` |
| `<category>/*.webp` | Product photos, white background removed |
| `covers/*.webp` | Category tile images |
| `renames.csv` | Every original name, size and photo next to its simple new one |

## How rows become products

- Rows with the same name in the same category are one product, and each size is an option (smallest first).
- Different products have different names. Example: "Old Durbar Reserve Whiskey" and "Old Durbar Blended Reserve Whiskey" have different bottles, so they stay separate.
- Every product starts with 24 in stock. The admin changes stock, prices and photos in the app.

## Please review

These sizes are listed twice at different prices. The app uses the first price. Fix the price in the app (Dashboard → Products) if the other one is right:

| Product | Size | Used | Also listed |
| :-- | :-- | --: | --: |
| Barahsinghe Pilsner Beer | 330 ml | 225 | 220 |
| Gorkha Extra Strong Beer | 330 ml | 205 | 180 |
| Shlok Whiskey | 750 ml | 2960 | 2860 |
| Golden Oak Blended Malt Whiskey | 750 ml | 1320 | 1280 |
| Golden Oak Blended Malt Whiskey | 180 ml | 320 | 330 |
| Black Oak Malt Whiskey | 180 ml | 360 | 380 |
| Jack Daniel's Honey Whiskey | 1 L | 8500 | 8850 |
| Jacob's Creek Merlot Wine | 750 ml | 2200 | 2250, 2350 |
