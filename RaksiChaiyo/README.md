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
