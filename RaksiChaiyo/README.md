# RaksiChaiyo app

Expo SDK 57 + Expo Router + NativeWind v5 (Tailwind v4). TypeScript.

## Run it

1. Start the API first (see `backend/README.md`): `cd backend && npm run dev`
2. Then the app:
   ```bash
   cd RaksiChaiyo
   npm install
   npx expo start
   ```
3. Open it in Expo Go on a phone that's **on the same Wi-Fi as the PC**. The app finds the API on the PC automatically (port 5000). To point it somewhere else, copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`.

If the phone shows "Cannot reach the server", check that Windows Firewall allows Node on port 5000 for private networks.

| Script | What it does |
| :-- | :-- |
| `npx expo start` | Dev server |
| `npm run typecheck` | TypeScript check (CI runs this) |
| `npm test` | Unit tests (Node test runner) |
| `npm run build:local` | Release APK built on this PC, saved to `../builds/android/` |

## Local APK builds and in-app updates

`npm run build:local` builds a release APK on this PC with no EAS account needed. It runs `expo prebuild` and then Gradle; `eas build --local` itself doesn't run on Windows. Each run:

1. bumps `version` (patch) and `android.versionCode` (+1) in `app.json`, and undoes the bump if the build fails;
2. bakes in the backend address: this PC's Wi-Fi IP on port 5000, or `--api-url` / `EXPO_PUBLIC_API_URL`;
3. saves `builds/android/v<version>-b<code>/NepalgunjSips-v<version>-b<code>.apk` plus a `build.json`, and updates `builds/android/latest.json`.

While the backend runs, it serves that folder. Phones with an older build show an **Update available** prompt when the app opens or comes back to the front. **Update now** downloads the new APK; tap it to install over the old one. For the first install, open `http://<PC IP>:5000/downloads/android/latest.apk` on the phone.

Options: `--minor`, `--major`, `--no-bump`, `--notes "What's new"`, `--required` (the prompt has no "Later" button), `--api-url http://192.168.1.10:5000`, `--clean`.

Needs JDK 17+ (17 or 21 is safest) and the Android SDK; installing Android Studio provides both. Builds are signed with the template's debug key, which is the same on every build, so updates install over each other. Use EAS or your own keystore for the Play Store.

## Structure (MVC)

```
src/
  app/            Routes (Expo Router). Thin: read params, render a screen.
  models/         The M: data and rules, no UI
    types.ts        API data shapes
    api/            HTTP client + one file per API area
    stores/         zustand stores (cart and prefs are saved on the device)
    cart.ts         Pure cart rules (+ cart.test.ts)
  controllers/    The C: hooks holding each screen's logic and actions
  views/          The V: what's drawn
    components/     Reusable pieces from design/component-inventory.md
    screens/        One file per screen, uses a controller hook
    theme.ts        JS copy of the colour tokens (for SVG / StatusBar)
  i18n/           UI text (en.ts, ne.ts) and t()
  utils/          Formatting helpers
```

**Rule of thumb:** screens don't call the API or change stores directly. They call their controller hook. Controllers use models. Models don't import from views.

Styling uses the theme tokens in `global.css` (`bg-card`, `text-muted`, `font-heading`...). Don't use raw hex colours in components.
