# Deploying Nepalgunj Sips

Three pieces: a **MongoDB database**, the **API** (`backend/`) and the **app** (`RaksiChaiyo/`).

## 1. Database: MongoDB Atlas

1. Create a free cluster at mongodb.com/atlas, plus a database user.
2. Under Network Access, allow the API server's IP (or `0.0.0.0/0` while testing).
3. Copy the connection string: `mongodb+srv://user:pass@cluster.../nepalgunj_sips`.

## 2. API: any Node or Docker host (Render, Railway, Fly.io, a VPS)

Environment variables:

| Variable | Value |
| :-- | :-- |
| `NODE_ENV` | `production` |
| `MONGO_URI` | the Atlas string (`memory` isn't allowed in production) |
| `JWT_SECRET` | a long random string: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_PHONE`, `ADMIN_PASSWORD` | **the one admin account**. Changing them and restarting updates the admin. |
| `PUBLIC_URL` | the API's public address, e.g. `https://api.nepalgunjsips.com` (needed for eSewa) |
| `UPLOAD_DIR` | a **persistent** folder for admin photos (the Dockerfile uses `/data/uploads`, mount a volume there) |
| `CORS_ORIGIN` | `*` is fine for the mobile app |
| `DELIVERY_FEE` | flat fee in NPR (default 100) |
| `ESEWA_PRODUCT_CODE`, `ESEWA_SECRET_KEY`, `ESEWA_FORM_URL`, `ESEWA_STATUS_URL` | live eSewa merchant values (the defaults are the sandbox) |

**With Docker:**
```bash
docker build -t nepalgunj-sips-api backend
docker run -d -p 5000:5000 --env-file backend/.env -v sips-uploads:/data/uploads nepalgunj-sips-api
```
**Without Docker:** `cd backend && npm ci --omit=dev && npm start`.

**First run only:** `npm run seed` loads the starter catalogue. Skip it if the admin will add everything in the app. Then check `https://<api>/api/health`.

Put the API behind HTTPS (most hosts do this for you). eSewa and the app stores expect HTTPS.

## 3. App: EAS Build

```bash
cd RaksiChaiyo
npm install -g eas-cli
eas login
eas init                      # links the project; adds extra.eas.projectId (also enables push)
```
1. In `eas.json`, set `EXPO_PUBLIC_API_URL` in `preview` and `production` to your API address.
2. Build:
   ```bash
   eas build -p android --profile preview      # APK to install and test on phones
   eas build -p android --profile production   # AAB for the Play Store
   eas submit -p android                       # upload to Play Console
   ```

The app ID is `com.nepalgunjsips.app` (Android and iOS). For each new store release, raise `version`, plus `android.versionCode` / `ios.buildNumber`, in `app.json`.

## After deploying

- Log in with `ADMIN_PHONE` to open the shop dashboard.
- Add categories and products with their photos (Dashboard → Categories / Products).
- Riders register in the app as normal; then Dashboard → Riders gives them the rider role.
- Before going live, walk through `docs/MVP_TEST_CHECKLIST.md` on a real phone.
