# Nepalgunj Delivery App: Project Playbook

**What this is:** one file that tells the team *what comes first, what comes next, and how to raise the work as GitHub issues*. It merges the three earlier backlog files into a single ordered process.

**Current stack (actual):** Expo + React Native + TypeScript + Tailwind (NativeWind) · Node.js + Express + TypeScript · MongoDB + Mongoose
**Market:** Nepalgunj, Nepal · NPR · English/Nepali
**Date:** 15 October 2026

> **Change from the old docs:** they said PostgreSQL + Prisma. We use **MongoDB + Mongoose**, so "migrations" become "Mongoose schemas + seed scripts", and atomic stock rules use conditional `findOneAndUpdate` with `$inc`.

---

## 1. The Process in One Picture

```
Phase 0  Setup                 (DONE)  empty repo -> Express+Mongoose, Expo+Tailwind running
Phase 1  Design                        Excalidraw flows + wireframes + theme tokens (FREEZE before coding)
Phase 2  Backend: catalogue API        models, seed data, category/product endpoints
Phase 3  App: browse & choose          splash animation, categories, products, details, quantity, add/buy, cart
Phase 4  Login & checkout              auth, address, order summary, server-side validated order
Phase 5  Pay & track  ==> MVP          payment, confirmation, "your order is on the way"
Phase 6  Operations                    admin (products/stock/orders), rider assignment + updates, push
Phase 7  Post-MVP features             delivery area/fees, search, history, Nepali, coupons, reports, favourites...
Phase 8  Harden & pilot                security, tests, release build, real-user pilot
```

**Rule of order:** never start a phase before the previous phase's *exit check* passes. Design comes before screens; API comes before the screens that use it; checkout comes before payment; payment comes before tracking.

---

## 2. MVP Definition

The MVP is finished when a customer can do this end to end on an Android phone:

1. Open the app and see the **animated splash screen**
2. See **products grouped by category**
3. **Select a product**, choose **quantity**
4. Tap **Buy now** or **Add to cart**
5. Go to **checkout**
6. **Log in** (or register) during checkout
7. **Pay** (Cash on Delivery first, eSewa after)
8. See **payment/order confirmed**
9. See the order status **"on the way"**

Everything else in the old documents (rider app, admin, coupons, reports, favourites...) is **after** the MVP and lives in Phases 6-8.

---

## 3. Phase Details and Exit Checks

### Phase 0: Setup (DONE)
Backend with Express + Mongoose, frontend with Expo + Tailwind, both run locally.
**Leftovers to confirm:** branch protection on `main`, PR template, `.env.example`, CI (lint + typecheck + build).

### Phase 1: Design (Sprint 1)
Excalidraw is the source of truth. Theme is chosen. Now we make it buildable.
**Produce:** user-flow diagram, wireframes for every MVP screen, theme tokens (colours, fonts, spacing, radius) copied into `tailwind.config.js`, component list (button, product card, quantity stepper, status badge...).
**Exit check:** every MVP screen has a wireframe, tokens are in code, the team agreed the design is frozen. After this, design changes are made in Excalidraw first, then in code.

### Phase 2: Backend, catalogue API (Sprint 2)
**Produce:** `Category` and `Product` (with variants: SKU, price, stock) schemas, seed script with real Nepalgunj-style items, endpoints for categories, products by category, product detail, validation, error handler, health route.
**Exit check:** Postman/curl returns seeded data; invalid IDs return clean errors; CI green.

### Phase 3: App, browse and choose (Sprints 3-4)
**Produce:** splash animation, navigation, home with categories, product list, product detail with quantity stepper, **Add to cart**, **Buy now**, cart screen with subtotal, loading/empty/error states.
**Exit check:** on a real phone you can go splash -> category -> product -> quantity -> cart with live API data.

### Phase 4: Login and checkout (Sprint 5)
**Produce:** `User` model, register/login (JWT, hashed passwords), login/register screens, auth gate at checkout, address entry, checkout summary, `Order` model, `POST /orders` that **recalculates prices and checks stock on the server** (never trust the app's totals), duplicate-submit protection.
**Exit check:** a logged-in user can place an order; tampered prices are rejected; out-of-stock is rejected.

### Phase 5: Pay and track = MVP (Sprint 6)
**Produce:** Cash on Delivery flow, eSewa sandbox payment, payment confirm screen, order confirmation, order status API, status screen showing **"on the way"**, end-to-end test of the full MVP journey.
**Order states to start with:** `pending -> confirmed -> preparing -> out_for_delivery -> delivered` (+ `cancelled`, `payment_failed`). Keep payment status separate from order status.
**Exit check:** the 9-step MVP journey in Section 2 works without manual database edits (except the status change, which a script or admin does for now).

### Phase 6: Operations (Sprint 7)
**Produce:** minimal admin web (products, prices, stock, order confirmation), rider assignment, rider screen to update status, push notifications.
**Exit check:** staff can run a full order without touching the database.

### Phase 7: Post-MVP features (Sprints 8-9)
Delivery area and fees, minimum order, search and filters, order history, full Nepali translation, stock reservation with timeout, coupons, refunds and reports, favourites, reorder, ratings, support contact, staff 2FA, backups and audit log.

### Phase 8: Harden and pilot (Sprint 10)
Security review, test pass, performance on low-end Android, release APK/AAB, pilot with a small group of real customers, feedback into backlog.

---

## 4. Sprint Plan

Default sprint length is 7 days (change `SPRINT_DAYS` in `config.env`).

| Sprint | Phase | Goal |
| :-- | :-- | :-- |
| 1 | 1 Design | Frozen design + theme tokens |
| 2 | 2 Backend catalogue | Seeded catalogue API |
| 3 | 3 App browse | Splash, categories, products, details |
| 4 | 3 App choose | Quantity, add/buy, cart |
| 5 | 4 Login & checkout | Auth + validated order |
| 6 | 5 Pay & track | **MVP complete** |
| 7 | 6 Operations | Admin, rider, push |
| 8-9 | 7 Post-MVP | Feature backlog |
| 10 | 8 Harden & pilot | Release + pilot |

### Ceremonies (keep them light)
Planning on day 1 (pick the sprint's issues, confirm the goal) · short daily sync · review on the last day (demo on a real phone) · retro (one improvement action).

### Definition of Done (every issue)
- Compiles with zero TypeScript and lint errors
- Pull request reviewed by the *other* person and merged to `main`
- Works on a real Android device or emulator against the local API
- Matches the Excalidraw design (or the design was updated first)
- Issue closed with a link to the PR

---

## 5. Colour System

### Priority colours (labels)
| Label | Meaning | Colour |
| :-- | :-- | :-- |
| `P0` | Must have, blocks the MVP | Red `#d73a4a` |
| `P1` | Should have, soon after MVP | Orange `#f9a825` |
| `P2` | Could have, future | Green `#0e8a16` |

### Sprint colours (labels `sprint-N`, the "sprint indication line")
| Sprint | Colour | Sprint | Colour |
| :-- | :-- | :-- | :-- |
| 1 | Blue `#1d76db` | 6 | Slate `#607d8b` |
| 2 | Violet `#5319e7` | 7 | Cyan `#00bcd4` |
| 3 | Teal `#006b75` | 8 | Dark `#24292e` |
| 4 | Magenta `#e91e8c` | 9 | Purple `#ab47bc` |
| 5 | Brown `#795548` | 10 | Aqua `#26a69a` |

Tip: in a GitHub Project board, **group by Milestone** and show the labels column. Each sprint reads as its own coloured line, and each card shows its priority colour.

---

## 6. Issue-Raising Scripts

**How it works**
- `bootstrap.sh` runs **once**: creates priority, sprint, phase and area labels (with colours) and 10 sprint milestones with due dates.
- `phase-N-*.sh` runs **when the previous phase completes**: raises that phase's issues.
- Each issue gets a **priority**, a **deadline** (sprint start + day offset), a **sprint colour label**, and a **random assignee**. The assignee queue is shuffled and used in rounds, so it is random but nobody gets a double load.
- `complete-phase.sh N` checks that phase N has no open issues, then automatically runs the next phase script.

**Requirements:** [GitHub CLI](https://cli.github.com) logged in (`gh auth login`), run from **Git Bash** (Windows), Linux, or macOS with bash 4+ (`brew install bash`). Network access to GitHub.

Create a `scripts/` folder in the repo root and add these files.

### `scripts/config.env`
```bash
# EDIT THESE
ASSIGNEES="github-user-1 github-user-2"   # space separated GitHub usernames
SPRINT1_START="2026-10-15"                # first day of Sprint 1 (YYYY-MM-DD)
SPRINT_DAYS=7                             # sprint length in days
```

### `scripts/lib.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/config.env"

REPO="${REPO:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
read -r -a ASSIGNEE_LIST <<< "$ASSIGNEES"
QUEUE=()
CURRENT=""

# date + N days (GNU date, with macOS fallback)
date_plus() {
  date -d "$1 +$2 days" +%F 2>/dev/null || date -j -v+"$2"d -f %F "$1" +%F
}

# start date of sprint N, then a day offset inside it
sprint_day() { # sprint offset
  date_plus "$SPRINT1_START" $(( ($1 - 1) * SPRINT_DAYS + $2 ))
}

# random but balanced: shuffle everyone, hand out one by one, reshuffle when empty
next_assignee() {
  if [ ${#QUEUE[@]} -eq 0 ]; then
    mapfile -t QUEUE < <(printf '%s\n' "${ASSIGNEE_LIST[@]}" | shuf)
  fi
  CURRENT="${QUEUE[0]}"
  QUEUE=("${QUEUE[@]:1}")
}

# issue "Title" P0|P1|P2 sprint dayOffset area "Done when: ..."
issue() {
  local title="$1" prio="$2" sprint="$3" off="$4" area="$5" body="$6"
  local due; due="$(sprint_day "$sprint" "$off")"
  next_assignee
  gh issue create --repo "$REPO" \
    --title "[$prio][S$sprint] $title (due $due)" \
    --label "$prio,sprint-$sprint,phase-$PHASE,$area" \
    --milestone "Sprint $sprint" \
    --assignee "$CURRENT" \
    --body "**Phase:** $PHASE_NAME
**Priority:** $prio
**Sprint:** $sprint
**Deadline:** $due
**Assigned (random):** @$CURRENT

$body

---
Definition of Done: no TS/lint errors, reviewed PR merged, tested on device, matches Excalidraw design." >/dev/null
  echo "OK  [$prio] $title -> @$CURRENT (due $due)"
}
```

### `scripts/bootstrap.sh` (run once)
```bash
#!/usr/bin/env bash
source "$(dirname "$0")/lib.sh"

lbl() { gh label create "$1" --repo "$REPO" --color "$2" --description "$3" --force >/dev/null; echo "label $1"; }

# priority
lbl P0 d73a4a "Must have (blocks MVP)"
lbl P1 f9a825 "Should have (after MVP)"
lbl P2 0e8a16 "Could have (future)"

# sprints
colors=(1d76db 5319e7 006b75 e91e8c 795548 607d8b 00bcd4 24292e ab47bc 26a69a)
for i in $(seq 1 10); do lbl "sprint-$i" "${colors[$((i-1))]}" "Sprint $i"; done

# phases (grey shades)
for i in $(seq 0 8); do lbl "phase-$i" "bfc5cc" "Phase $i"; done

# areas
lbl design   fbca04 "Design / Excalidraw"
lbl backend  0052cc "Express + Mongoose"
lbl mobile   7057ff "Expo + React Native"
lbl ops      c2e0c6 "Admin / rider / operations"
lbl security b60205 "Security"
lbl testing  d4c5f9 "Testing"
lbl docs     0075ca "Documentation"

# milestones with due dates (sprint end)
for i in $(seq 1 10); do
  due="$(sprint_day "$i" $((SPRINT_DAYS - 1)))T23:59:59Z"
  gh api "repos/$REPO/milestones" -f title="Sprint $i" -f due_on="$due" >/dev/null 2>&1 \
    && echo "milestone Sprint $i due $due" || echo "milestone Sprint $i exists"
done
```

### `scripts/phase-1-design.sh`
```bash
#!/usr/bin/env bash
source "$(dirname "$0")/lib.sh"
PHASE=1; PHASE_NAME="Phase 1: Design"

issue "Draw end-to-end user flow in Excalidraw (splash to on-the-way)"      P0 1 1 design "Done when: one diagram covers all 9 MVP steps and is committed to /design."
issue "Wireframe: splash, home/categories, product list"                     P0 1 2 design "Done when: 3 screens wireframed with states (loading, empty, error)."
issue "Wireframe: product detail, quantity, add/buy, cart"                   P0 1 3 design "Done when: screens wireframed including quantity stepper behaviour."
issue "Wireframe: login/register, checkout, payment, confirmation, status"   P0 1 4 design "Done when: all remaining MVP screens wireframed."
issue "Put theme tokens into tailwind.config.js"                             P0 1 4 mobile "Done when: colours, fonts, spacing, radius from Excalidraw exist as Tailwind tokens."
issue "Define splash animation spec (duration, motion, logo)"                P1 1 5 design "Done when: a short written spec exists and both agree."
issue "Component inventory (button, card, stepper, badge, input)"            P1 1 5 design "Done when: list of reusable components with variants agreed."
issue "Design review and freeze"                                             P0 1 6 design "Done when: both approve; changes after this go to Excalidraw first."
issue "Confirm leftovers: branch protection, PR template, .env.example, CI"  P0 1 6 docs   "Done when: main is protected and CI runs lint + typecheck + build."
```

### `scripts/phase-2-backend.sh`
```bash
#!/usr/bin/env bash
source "$(dirname "$0")/lib.sh"
PHASE=2; PHASE_NAME="Phase 2: Backend catalogue API"

issue "Category schema (Mongoose) with EN/NE name fields"          P0 2 0 backend "Done when: model validated, indexes on slug."
issue "Product schema with variants (SKU, price in NPR, stock)"    P0 2 1 backend "Done when: price stored as integer paisa or whole NPR consistently, stock >= 0 enforced."
issue "Seed script with realistic snacks and beverages"            P0 2 2 backend "Done when: npm run seed fills categories and 20+ products, safe to re-run."
issue "GET /categories"                                            P0 2 2 backend "Done when: returns active categories sorted."
issue "GET /products?category= and GET /products/:id"              P0 2 3 backend "Done when: filters by category, 404 on unknown id, 400 on bad id."
issue "Request validation (zod) and central error handler"         P0 2 4 backend "Done when: consistent JSON error shape across all routes."
issue "Health route and env config loader"                         P1 2 4 backend "Done when: /health works, missing env vars fail fast at startup."
issue "Product image URLs and static serving"                      P1 2 5 backend "Done when: seeded products have images the app can load."
issue "API documentation (README or Postman collection)"           P1 2 6 docs    "Done when: every endpoint has request/response examples."
issue "Sprint 2 review: API tested from the app project"           P0 2 6 testing "Done when: the Expo app fetches /categories on a real device."
```

### `scripts/phase-3-app.sh`
```bash
#!/usr/bin/env bash
source "$(dirname "$0")/lib.sh"
PHASE=3; PHASE_NAME="Phase 3: App, browse and choose"

# Sprint 3: see products
issue "Navigation structure and API client (base URL via env)"        P0 3 0 mobile "Done when: stack/tab navigation runs, API client handles errors and timeouts."
issue "Animated splash screen"                                        P0 3 2 mobile "Done when: follows the spec, hides cleanly, no flicker on Android."
issue "Home screen with categories"                                   P0 3 3 mobile "Done when: live data, loading skeleton, empty and error states."
issue "Product list per category"                                     P0 3 4 mobile "Done when: cards show name, image, price, availability."
issue "Product detail screen"                                         P0 3 5 mobile "Done when: image, description, variant selector, price, stock status."
issue "i18n scaffolding (EN now, NE strings structure ready)"         P1 3 6 mobile "Done when: no hard-coded UI text, language switch wired up."

# Sprint 4: choose and cart
issue "Quantity stepper component (respects stock limit)"             P0 4 1 mobile "Done when: min 1, max stock, disabled states work."
issue "Cart state (Zustand) persisted on device"                      P0 4 2 mobile "Done when: add, remove, change quantity survive app restart."
issue "Add to cart action with feedback"                              P0 4 3 mobile "Done when: toast/badge updates, duplicate variant merges quantity."
issue "Buy now action (skips cart, goes to checkout)"                 P0 4 4 mobile "Done when: single-item checkout starts correctly."
issue "Cart screen with subtotal"                                     P0 4 5 mobile "Done when: edit quantities, remove items, subtotal correct."
issue "Unit tests for cart maths"                                     P1 4 6 testing "Done when: subtotal and quantity rules covered."
```

### `scripts/phase-4-checkout.sh`
```bash
#!/usr/bin/env bash
source "$(dirname "$0")/lib.sh"
PHASE=4; PHASE_NAME="Phase 4: Login and checkout"

issue "User schema and password hashing (bcrypt)"                         P0 5 0 backend  "Done when: unique phone/email, no plain-text passwords."
issue "Register and login endpoints with JWT"                             P0 5 1 backend  "Done when: tokens expire, auth middleware protects routes, errors don't leak info."
issue "Login/register screens and secure token storage"                   P0 5 2 mobile   "Done when: token stored with expo-secure-store, logout works."
issue "Auth gate: ask to log in at checkout, then continue"               P0 5 3 mobile   "Done when: cart is kept through login and checkout resumes."
issue "Delivery address entry (name, phone, address, landmark)"           P0 5 3 mobile   "Done when: validated form saved with the order."
issue "Order schema (items snapshot, totals, status, payment status)"     P0 5 3 backend  "Done when: stores price snapshot so later price changes don't alter old orders."
issue "POST /orders with server-side price recalculation and stock check" P0 5 4 backend  "Done when: tampered totals rejected, out-of-stock rejected, stock decremented atomically."
issue "Idempotency key to stop double submit"                             P0 5 5 backend  "Done when: repeating the same request creates one order."
issue "Checkout summary screen (items, delivery fee, total)"              P0 5 5 mobile   "Done when: totals come from the server response, not local maths."
issue "Basic rate limiting and input sanitising on auth routes"           P1 5 6 security "Done when: brute-force attempts get throttled."
```

### `scripts/phase-5-pay-track.sh`
```bash
#!/usr/bin/env bash
source "$(dirname "$0")/lib.sh"
PHASE=5; PHASE_NAME="Phase 5: Pay and track (MVP)"

issue "Cash on Delivery option end to end"                          P0 6 0 mobile   "Done when: order is created as COD and shown as payment pending."
issue "eSewa sandbox integration (initiate and verify on server)"   P0 6 1 backend  "Done when: payment is confirmed only after server-side verification with eSewa."
issue "Payment screen and return/cancel handling in the app"        P0 6 2 mobile   "Done when: success, failure, cancel and retry all behave."
issue "Order confirmation screen (order number, summary)"           P0 6 3 mobile   "Done when: shown only after the server confirms the order."
issue "Order status endpoint and state-transition rules"            P0 6 3 backend  "Done when: invalid transitions rejected; payment status kept separate."
issue "Order status screen showing 'on the way'"                    P0 6 4 mobile   "Done when: screen polls or refreshes and shows the current state with friendly text."
issue "Temporary status-update script for testing"                  P1 6 4 backend  "Done when: one command moves an order through all states."
issue "End-to-end test of the 9-step MVP journey"                   P0 6 5 testing  "Done when: written checklist passed on a real phone, bugs raised as issues."
issue "MVP demo and retro"                                          P0 6 6 docs     "Done when: demo recorded or done live, retro action noted."
```

### `scripts/phase-6-operations.sh`
```bash
#!/usr/bin/env bash
source "$(dirname "$0")/lib.sh"
PHASE=6; PHASE_NAME="Phase 6: Operations"

issue "Staff roles (admin, operator, rider) in backend"           P0 7 0 backend  "Done when: role checks on every staff route."
issue "Admin web: product, price and stock management"           P0 7 1 ops      "Done when: staff can edit products without touching the database."
issue "Admin web: order list, confirm or reject order"           P0 7 2 ops      "Done when: confirmation moves order to confirmed."
issue "Manual rider assignment"                                   P0 7 3 ops      "Done when: operator can assign an order to a rider."
issue "Rider screen: assigned orders and status updates"          P0 7 4 mobile   "Done when: rider can mark picked up, on the way, delivered."
issue "Push notifications for status changes"                     P1 7 5 mobile   "Done when: customer gets a push on each status change."
issue "Stock adjustment and restock audit trail"                  P1 7 6 backend  "Done when: every stock change records who, when, why."
```

### `scripts/phase-7-features.sh`
```bash
#!/usr/bin/env bash
source "$(dirname "$0")/lib.sh"
PHASE=7; PHASE_NAME="Phase 7: Post-MVP features"

# Sprint 8
issue "Service area validation and delivery fee rules"        P0 8 1 backend  "Done when: out-of-area addresses blocked before checkout."
issue "Minimum order rule"                                    P1 8 2 backend  "Done when: checkout blocks orders below the minimum."
issue "Search and filters (name, category, price)"            P1 8 3 mobile   "Done when: results match query, empty state shown."
issue "Order history and order details"                       P1 8 4 mobile   "Done when: customer sees only their own orders."
issue "Complete Nepali translation (EN/NE switch)"            P1 8 5 mobile   "Done when: every screen reviewed in Nepali, fonts render correctly."
issue "Atomic stock reservation with timeout expiry"          P1 8 6 backend  "Done when: unpaid reservations release stock automatically."

# Sprint 9
issue "Coupon codes and campaign rules"                       P1 9 1 backend  "Done when: validated server-side, usage limits enforced."
issue "Refund tracking and financial summary report"          P1 9 2 ops      "Done when: admin sees daily sales and refunds."
issue "Contact support about an order"                        P1 9 3 mobile   "Done when: customer can reach support from the order screen."
issue "Favourites"                                            P2 9 4 mobile   "Done when: saved items persist per user."
issue "Reorder a previous purchase"                           P2 9 5 mobile   "Done when: past order refills the cart with current prices."
issue "Rate a completed delivery"                             P2 9 6 mobile   "Done when: rating saved once per order."
issue "Staff 2FA for privileged roles"                        P1 9 6 security "Done when: admin login requires a second factor."
issue "Database backup, restore test and audit logging"       P0 9 6 ops      "Done when: a restore was tested successfully."
```

### `scripts/phase-8-pilot.sh`
```bash
#!/usr/bin/env bash
source "$(dirname "$0")/lib.sh"
PHASE=8; PHASE_NAME="Phase 8: Harden and pilot"

issue "Security review (auth, ownership checks, secrets, dependencies)" P0 10 0 security "Done when: no customer can read another customer's order."
issue "Full regression test pass"                                       P0 10 1 testing  "Done when: all critical flows pass on 2+ Android devices."
issue "Performance check on a low-end Android phone"                    P1 10 2 mobile   "Done when: startup and scrolling are acceptable."
issue "Error monitoring (Sentry or similar) on app and API"             P1 10 3 ops      "Done when: errors reach a dashboard."
issue "Production environment and release build (AAB/APK)"              P0 10 4 ops      "Done when: signed build installs and talks to production API."
issue "Pilot with 5-10 real customers and feedback capture"             P0 10 5 docs     "Done when: feedback turned into backlog issues."
issue "Pilot retro and next-release plan"                               P1 10 6 docs     "Done when: next priorities agreed."
```

### `scripts/complete-phase.sh`
```bash
#!/usr/bin/env bash
# usage: ./scripts/complete-phase.sh 1
source "$(dirname "$0")/lib.sh"
N="${1:?usage: complete-phase.sh <phase number>}"

OPEN=$(gh issue list --repo "$REPO" --label "phase-$N" --state open --json number --jq length)
if [ "$OPEN" -gt 0 ]; then
  echo "Phase $N still has $OPEN open issue(s):"
  gh issue list --repo "$REPO" --label "phase-$N" --state open
  exit 1
fi

NEXT=$((N + 1))
FILE=$(ls "$DIR"/phase-"$NEXT"-*.sh 2>/dev/null | head -n1 || true)
if [ -z "$FILE" ]; then echo "No phase $NEXT script. Project plan complete."; exit 0; fi

echo "Phase $N complete. Raising Phase $NEXT issues..."
bash "$FILE"
```

---

## 7. How to Run It

```bash
# one time
gh auth login
chmod +x scripts/*.sh
# edit scripts/config.env first (usernames + sprint start date)
./scripts/bootstrap.sh

# start the real work
./scripts/phase-1-design.sh

# whenever a phase is finished (all its issues closed)
./scripts/complete-phase.sh 1     # raises Phase 2 issues
./scripts/complete-phase.sh 2     # raises Phase 3 issues
# ...and so on
```

**Notes**
- Phase 3 issues cover **two sprints** (3 and 4) and Phase 7 covers sprints 8 and 9. This is intended.
- If a sprint slips, change `SPRINT1_START` and re-run `bootstrap.sh` to update milestone dates; already-raised issues keep their title dates, so edit those by hand.
- If you add an issue mid-sprint, call `issue` in a small script with the same parameters, or create it on GitHub and add the priority and sprint labels.
- GitHub issues have no native due-date field. The deadline is shown in the **title**, the **body**, and the **milestone** (sprint end).

---

## 8. Backlog Mapping (old docs to phases)

| Old ID | Item | Phase |
| :-- | :-- | :-- |
| FND-01/02 | Repo, CI, env | 0-1 |
| CAT-01/02 | Categories, products, variants | 2-3 |
| CAT-03 | Images, search, curated sections | 2, 7 |
| ACC-01 | Guest/registration | 4 |
| CHK-02/03 | Cart, validated order | 3-4 |
| PAY-01 | COD + eSewa | 5 |
| ORD-01 | Status and tracking | 5-6 |
| ORD-02 | Rider app and assignment | 6 |
| INV-01/02 | Stock audits, reservation | 6-7 |
| CHK-01 | Service area, fees, minimum | 7 |
| ACC-02, FND-03 | Staff 2FA, backups, audit | 7 |
| PAY-02, PRO-01 | Refunds, reports, coupons | 7 |
| ENH-01 | Favourites, reorder | 7 |
