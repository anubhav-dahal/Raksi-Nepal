# Raksi Nepal API

Express 5 + Mongoose 9 (MVC). JavaScript ES modules.

## Run it

```bash
cd backend
npm install
cp .env.example .env     # MONGO_URI=memory works out of the box
npm run dev              # http://localhost:5000
```

With `MONGO_URI=memory` an in-memory MongoDB starts with the server and is filled with the starter catalogue. **Data resets on every restart.** For data that persists, set a real `MONGO_URI` (local MongoDB or Atlas) and run `npm run seed` once. The seed is safe to run again and keeps existing stock levels.

The server listens on `0.0.0.0`, so a phone on the same Wi-Fi can reach it at `http://<your-PC-IP>:5000`.

| Script | What it does |
| :-- | :-- |
| `npm run dev` | Start with auto-reload (nodemon) |
| `npm start` | Start without reload |
| `npm run seed` | Seed the database in `MONGO_URI` |
| `npm test` | API tests against an in-memory database |

## Structure (MVC)

```
src/
  models/        Mongoose schemas (the M)
  controllers/   Request handlers + their zod input schemas (the C)
  routes/        URL -> middleware -> controller wiring
  middleware/    validate (zod), errorHandler, auth (later phases)
  services/      Business logic shared by controllers (later phases)
  config/        env validation, database connection
  seed/          Starter catalogue + seeding
  utils/         ApiError
public/          Served at /static (product images)
tests/           node:test + supertest
```

The "view" for this API is its JSON. The mobile app in `RaksiChaiyo/` is the UI.

## Conventions

- **Success:** `{ "data": ... }`
- **Error:** `{ "error": { "code": "NOT_FOUND", "message": "...", "details": [ { "field": "...", "message": "..." } ] } }`
  - Codes: `BAD_REQUEST` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `INTERNAL_ERROR` (500)
- Documents expose `id` (not `_id`).
- Money is **whole NPR** integers.
- Text that will be translated is `{ "en": "...", "ne": "..." }`.

## Endpoints

### `GET /api/health`
```json
{ "status": "OK", "message": "Raksi Nepal API is active" }
```

### `GET /api/categories`
Active categories, sorted.
```json
{
  "data": [
    {
      "id": "6745...",
      "slug": "beer",
      "name": { "en": "Beer", "ne": "बियर" },
      "subtitle": { "en": "Chilled & ready", "ne": "" },
      "image": "https://...",
      "alcoholic": true,
      "sortOrder": 1,
      "isActive": true
    }
  ]
}
```

### `GET /api/products?category=<slug-or-id>`
Active products, optionally filtered by category. Unknown category returns 404.
```json
{
  "data": [
    {
      "id": "6745...",
      "slug": "gorkha-premium",
      "name": { "en": "Gorkha Premium", "ne": "" },
      "description": { "en": "A crisp, refreshing lager...", "ne": "" },
      "category": "6745...",
      "image": "https://...",
      "alcoholic": true,
      "variants": [
        { "id": "6745...", "sku": "BEER-GORKHA-650", "label": "650 ml bottle", "price": 340, "stock": 48 }
      ]
    }
  ]
}
```

### `GET /api/products/:id`
One product, with `category` populated as `{ id, name, slug, alcoholic }`.
- `400 BAD_REQUEST` if `id` is not a valid id
- `404 NOT_FOUND` if no active product has that id
