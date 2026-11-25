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
| `npm run order:next -- <number>` | Move an order to its next status (testing) |

## Structure (MVC)

```
src/
  models/        Mongoose schemas (the M)
  controllers/   Request handlers + their zod input schemas (the C)
  routes/        URL -> middleware -> controller wiring
  middleware/    validate (zod), errorHandler, requireAuth / requireRole
  services/      Business logic shared by controllers: pricing and orders,
                 status rules, stock + audit, eSewa, push notifications
  tools/         Dev tools (order:next)
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

## Accounts

Send the token as `Authorization: Bearer <token>`. Phone numbers are 10 digits starting with 97 or 98. Passwords are at least 8 characters.

| Method | Path | Who | Body / notes |
| :-- | :-- | :-- | :-- |
| POST | `/api/users/register` | anyone | `{ name, phone, email?, password }` → `201 { data: { token, user } }`. `409` if the phone is taken |
| POST | `/api/users/login` | anyone | `{ phone, password }` → `{ data: { token, user } }`. Same `401` for unknown phone and wrong password |
| GET | `/api/users/me` | logged in | the user, including `lastAddress` |
| POST / DELETE | `/api/users/me/push-token` | logged in | `{ token: "ExponentPushToken[...]" }` → `204` |

Register and login allow 10 attempts per 15 minutes per IP (`429 TOO_MANY_REQUESTS`).

**Roles:** `customer` (default), `rider`, `admin`. With `MONGO_URI=memory`, two demo accounts are created on start: admin `9800000000` / `admin12345` and rider `9800000099` / `rider12345`. For a real database, set `ADMIN_PHONE` and `ADMIN_PASSWORD`, then run `npm run seed`.

## Orders

| Method | Path | Who | Body / notes |
| :-- | :-- | :-- | :-- |
| POST | `/api/orders/quote` | anyone | `{ items: [{ sku, quantity }] }` → `{ items, subtotal, deliveryFee, total, problems }`. Prices come from the database |
| POST | `/api/orders` | customer | Header `Idempotency-Key: <8-100 chars>`. Body `{ items, address: { name, phone, address, landmark?, note? }, paymentMethod: "cod" \| "esewa", expectedTotal? }` → `201`. Same key again → `200` with the same order |
| GET | `/api/orders` | customer | my orders, newest first |
| GET | `/api/orders/:id` | owner, admin, assigned rider | `404` for anyone else |
| POST | `/api/orders/:id/cancel` | owner | only while `pending` and not paid. Stock is returned |
| POST | `/api/orders/:id/pay-on-delivery` | owner | switch an unpaid eSewa order to cash |
| PATCH | `/api/orders/:id/status` | admin | `{ status, note? }` |
| GET | `/api/orders/by-number/:number` | admin | look up `RC-261125-A1B2C3` |

**Placing an order:** prices and stock are checked on the server. `409 CONFLICT` with `details: [{ sku, code: "OUT_OF_STOCK", available }]` means not enough stock. `409 PRICE_CHANGED` means `expectedTotal` didn't match the server's total. Stock is taken atomically per line and given back if any line fails.

**Status rules:**
```
pending -> confirmed -> preparing -> out_for_delivery -> delivered
pending / confirmed / preparing -> cancelled
pending -> payment_failed
```
- An unpaid eSewa order can't be confirmed.
- `out_for_delivery` needs a rider assigned first.
- COD becomes `paid` on `delivered`.
- `cancelled` and `payment_failed` return stock (once).
- Payment status (`pending / paid / failed / refunded`) is separate from order status.

## Payments (eSewa ePay v2)

Defaults use eSewa's **sandbox** (`EPAYTEST`, test money only). For live payments, set `ESEWA_PRODUCT_CODE`, `ESEWA_SECRET_KEY`, `ESEWA_FORM_URL` (`https://epay.esewa.com.np/api/epay/main/v2/form`) and `ESEWA_STATUS_URL` (`https://epay.esewa.com.np/api/epay/transaction/status/`).

1. The app calls `POST /api/payments/esewa/:orderId/session` with `{ returnUrl }` (an app link: `nepalgunjsips://`, `exp://`). It gets a 15-minute link back.
2. The app opens the link in an in-app browser. `GET /api/payments/esewa/pay/:token` posts the signed form to eSewa.
3. eSewa sends the browser to `/success/:token?data=...` or `/failure/:token`. On success the server checks the signature **and** asks eSewa's status API before marking the order paid. Then it redirects to `returnUrl?orderId=...&result=success|failed|cancelled|pending`.
4. The app reloads the order from the server. The redirect itself is never trusted.

Sandbox login: eSewa ID `9806800001` (to `...005`), password `Nepal@123`, OTP `123456`.

Set `PUBLIC_URL` if the phone reaches the API through a different address than it calls (for example a tunnel).

## Admin (`/api/admin`, admin only)

| Method | Path | Notes |
| :-- | :-- | :-- |
| GET | `/summary` | active orders by status, today's orders and paid revenue, low-stock count, eSewa orders awaiting payment |
| GET | `/orders?status=active\|all\|<status>` | queue (active: oldest first), with customer and rider |
| POST | `/orders/:id/assign` | `{ riderId }`. Only while `confirmed` or `preparing` |
| GET | `/riders` | active riders with their number of active orders |
| GET | `/products` | all products, including hidden ones |
| PATCH | `/products/:id` | `{ name?, description?, image?, isActive? }` |
| PATCH | `/products/:id/variants/:sku` | `{ price }`. Old orders keep their price |
| POST | `/products/:id/variants/:sku/stock` | `{ delta, reason: "restock" \| "adjustment" \| "damaged", note? }`. Never below 0 |
| GET | `/products/:id/stock-movements` | the audit trail: every change with who, when, why and the order |
| POST | `/staff` | `{ phone, role }`. Give a registered user the `rider` or `admin` role |

## Rider (`/api/rider`, rider only)

| Method | Path | Notes |
| :-- | :-- | :-- |
| GET | `/orders` | my assigned orders still to deliver, plus today's delivered |
| POST | `/orders/:id/status` | `{ status: "out_for_delivery" }` (picked up, from `preparing`) or `{ status: "delivered" }` |

## Push notifications

The customer gets a push on every status change through Expo's push service, sent to each device registered with `/api/users/me/push-token`. A failed push never fails the status change.

## Testing tool

`npm run order:next -- <order number> [status]` moves an order one step along the happy path (or to the given status) through the API as the admin. It assigns the first rider when needed. The API must be running.
