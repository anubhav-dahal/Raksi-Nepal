# App Feedback & Updates

One shared list of everything we notice while testing RaksiChaiyo: bugs, things that look wrong, and ideas. Both of us add to it. Nothing gets lost in chat.

## How to use it

1. **Add** a new entry at the bottom of **Open** with the next number (`FB-0xx`). Copy the template.
2. **Pick it up:** set `Status: In progress` and your name.
3. **Fixed:** move the entry to **Done** and add the PR number. Don't delete entries.
4. Commit changes to this file on their own (`docs: feedback FB-012`), or together with the fix.

Bigger work should also get a GitHub issue. Put the issue number in the entry.

**Priority:** `P0` blocks using the app · `P1` should fix soon · `P2` nice to have
**Area:** `login` · `checkout` · `payment` · `browse` · `cart` · `order-status` · `admin` · `rider` · `design` · `backend` · `other`

### Template

```
### FB-0xx: Short title
- **Reported:** YYYY-MM-DD by @name · **Priority:** P1 · **Area:** checkout
- **Status:** Open
- **Phone / build:** e.g. Samsung A14, Android 14, Expo Go
- **What happened:** ...
- **Expected:** ...
- **Steps:** 1. ... 2. ...
- **Screenshot:** (drag into the GitHub editor or link it)
```

---

## Open

### FB-001: Test the whole app on a real phone
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P0 · **Area:** other
- **Status:** Open
- **What:** Nothing has been checked on a phone yet. Go through `docs/MVP_TEST_CHECKLIST.md` (on branch `feat/phase-6-operations`) and add an entry here for everything that looks or works wrong.

### FB-002: Real eSewa sandbox payment not tried yet
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P0 · **Area:** payment
- **Status:** Open
- **What:** Pay with eSewa from the phone using the sandbox account (ID `9806800001`, password `Nepal@123`, OTP `123456`). Also cancel once on the eSewa page, then retry and use "pay cash instead".

### FB-004: Product photos are linked from other websites, and 16 products have none
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P1 · **Area:** backend
- **Status:** Open
- **What:** Beer now uses our own photo. The other 3 category photos and 8 product photos are still hot-linked and could stop loading. 16 products have no photo and show a monogram placeholder. Add our own packshots to `backend/public/images` and set each product's `image` in `backend/src/seed/catalogue.js` to `/static/images/<file>`.

### FB-005: Database resets every time the backend restarts
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P1 · **Area:** backend
- **Status:** Open
- **What:** Development uses an in-memory database. Create a free MongoDB Atlas database, set `MONGO_URI` in `backend/.env`, and run `npm run seed` with `ADMIN_PHONE` and `ADMIN_PASSWORD` set.

### FB-006: Push notifications need an EAS project and a development build
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P2 · **Area:** order-status
- **Status:** Open
- **What:** Run `eas init` and build a development build. Expo Go on Android can't receive remote pushes. Until then, the order screen refreshes itself every 15 seconds.

### FB-007: Set the real shop phone number
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P1 · **Area:** order-status
- **Status:** Open
- **What:** "Call the shop" uses a placeholder number. Set `EXPO_PUBLIC_SHOP_PHONE` in `RaksiChaiyo/.env`.

### FB-008: Finish the Nepali translation
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P2 · **Area:** design
- **Status:** Open
- **What:** `RaksiChaiyo/src/i18n/ne.ts` has only a few lines. Missing text shows in English.

### FB-009: Unpaid eSewa orders keep stock reserved
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P2 · **Area:** payment
- **Status:** Open
- **What:** If someone starts an eSewa payment and never finishes, the stock stays taken until the order is cancelled. Add automatic expiry (Phase 7, stock reservation timeout).

---

## Done

### FB-017: App looked dull and flat
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P1 · **Area:** design
- **Status:** Done, in `feat/phase-6-operations` (commit `08fa65a`)
- **Fix:** Restyled to the prototype:
  - dark by default, with a Dark / Light / Phone switch in Account
  - teal glows on every screen and behind product shots
  - category banner, product detail sheet, glowing buttons, card entrance animations

### FB-018: Two layers of shade on the category thumbnails
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P1 · **Area:** design
- **Status:** Done, in `feat/phase-6-operations` (commit `08fa65a`)
- **Fix:** One smooth gradient instead of two overlapping dark boxes.

### FB-019: Bottom of the app hidden on some phones
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P0 · **Area:** design
- **Status:** Done, in `feat/phase-6-operations` (commit `08fa65a`). **Re-check on your phone.**
- **Fix:** Every screen and bottom bar now pads for the Android navigation/gesture bar. Bottom buttons no longer touch the screen edges.

### FB-020: App name is Nepalgunj Sips
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P1 · **Area:** design
- **Status:** Done, in `feat/phase-6-operations` (commit `08fa65a`)
- **Fix:** Name changed in the splash ("NEPALGUNJ / SIPS"), the header lockup and app.json. The prototype's glass logo is used in the app.

### FB-003 / FB-021: App icon and splash were Expo's defaults
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P1 · **Area:** design
- **Status:** Done, in `feat/phase-6-operations` (commit `08fa65a`)
- **Fix:** The app icon is a square crop of the uploaded beer photo. The splash and favicon use the logo. Expo Go shows its own icon; the new icon appears in a real build.

### FB-022: Checkout and product lists looked empty
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P0 · **Area:** checkout
- **Status:** Done, in `feat/phase-6-operations` (commit `08fa65a`). **Re-check on your phone, and add a screenshot here if checkout is still empty.**
- **Fix:** Most product photos were blank (one image host blocks apps), so the screens looked empty. Missing or failed photos now show a designed placeholder, and the Beer photo is served by our backend.

### FB-023: Errors showing in Expo Go
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P1 · **Area:** other
- **Status:** Done, in `feat/phase-6-operations` (commit `08fa65a`). **Re-check: list any error that still shows.**
- **Fix:** The push notification package logged errors in Expo Go as soon as it loaded. It now only loads in real builds.

### FB-010: Smart Telecom numbers (96x) couldn't register or log in
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P0 · **Area:** login
- **Status:** Done, in `feat/phase-6-operations` (commit `ae4dab5`)
- **Fix:** Numbers starting 96, 97 and 98 are accepted. `+977`, spaces and dashes are cleaned up automatically.

### FB-011: Keyboard covered the form and the Place order button on Android
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P1 · **Area:** checkout
- **Status:** Done, in `feat/phase-6-operations` (commit `ae4dab5`)

### FB-012: "Nothing to check out" flashed after placing an order
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P2 · **Area:** checkout
- **Status:** Done, in `feat/phase-6-operations` (commit `ae4dab5`)

### FB-013: Logged in but no name or saved address after starting offline
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P2 · **Area:** login
- **Status:** Done, in `feat/phase-6-operations` (commit `ae4dab5`)

### FB-014: Locked out of login after 10 tries while testing
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P2 · **Area:** login
- **Status:** Done, in `feat/phase-6-operations` (commit `ae4dab5`). Production still limits to 10 tries per 15 minutes.

### FB-015: "Cannot reach the server" didn't say which address
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P2 · **Area:** other
- **Status:** Done, in `feat/phase-6-operations` (commit `ae4dab5`). The message now shows the address the app tried.

### FB-016: App wouldn't open in Expo Go ("incompatible")
- **Reported:** 2026-11-25 by @aakash-develops · **Priority:** P0 · **Area:** other
- **Status:** Done, in `feat/phase-6-operations` (commit `296d016`)
- **Fix:** Upgraded from Expo SDK 57 to SDK 58, which is what Expo Go from the store runs.
