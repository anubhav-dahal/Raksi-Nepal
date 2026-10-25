# Component Inventory

**Issue:** #23 · **Phase:** 1 Design · **Status:** Draft, needs agreement from both of us
**Based on:** wireframes in `design/app-design.excalidraw` and the components in `Prototype/src/`
**Tokens:** the class names below use the theme tokens from #21 (`bg-card`, `rounded-md`, `font-heading`...).

The list of reusable UI pieces for the MVP, with their variants and states. Each one becomes a file in `RaksiChaiyo/src/components/` in Phase 3. Screens must use these, not one-off styles.

## Summary

| # | Component | Variants | First needed |
| :-- | :-- | :-- | :-- |
| 1 | `Button` | primary, secondary, ghost · default, large | Phase 3 |
| 2 | `IconButton` | solid, glass · with or without count badge | Phase 3 |
| 3 | `QuantityStepper` | compact, large | Phase 3 (Sprint 4) |
| 4 | `Badge` | status, stock, count, pill, age | Phase 3 |
| 5 | `Input` | text, phone, password · with label and error | Phase 4 |
| 6 | `CategoryCard` | n/a | Phase 3 |
| 7 | `ProductCard` | n/a | Phase 3 |
| 8 | `CartItem` | n/a | Phase 3 (Sprint 4) |
| 9 | `SummaryCard` | bill, order reference | Phase 4 |
| 10 | `PaymentOption` | COD, eSewa | Phase 5 |
| 11 | `Toast` | success, error | Phase 3 (Sprint 4) |
| 12 | `AppHeader` | home (logo), sub-page (back + title) | Phase 3 |
| 13 | `StateView` | loading, empty, error | Phase 3 |
| 14 | `Logo` | full, compact | Phase 3 |

Small helpers that are not full components: `Eyebrow` (10 px uppercase `accent` label), `Divider` (1 px `border`), `Spinner`.

---

## 1. Button

Main call to action. Text is `font-heading`, 13 px. Height 50 px (`h-control`), radius 15 px, icon and label 8 px apart. Shrinks to 98% while pressed.

| Variant | Background | Text | Border | Used for |
| :-- | :-- | :-- | :-- | :-- |
| `primary` | `accent` (pressed: `accent-dark`) | `on-accent` (white) | none | Buy now, Sign in, Pay, Place order |
| `secondary` | `card` | `text` | 1 px `border` | Add to cart, demo login |
| `ghost` | transparent | `accent` | none | "Not now", "Browse products" |

**States:** default · pressed · disabled (60% opacity) · loading (spinner replaces the icon, label changes to "Processing…", can't be pressed).
**Props:** `variant`, `label`, `icon?`, `loading?`, `disabled?`, `fullWidth?`, `onPress`.

## 2. IconButton

Square 40 × 40 px button, radius 14 px (`rounded-md`), shrinks to 93% while pressed.

| Variant | Look | Used for |
| :-- | :-- | :-- |
| `solid` | `card` background | Header menu, back, cart |
| `glass` | Dark see-through (45%) with a light 1 px border | Over the product photo on the detail screen |

**Count badge (optional):** an 18 px `accent` circle in the top-right corner, with a 2 px `bg` ring around it. Hidden when the count is 0. Screen reader label: "Cart with N items".
**Props:** `icon`, `variant`, `count?`, `accessibilityLabel`, `onPress`.

## 3. QuantityStepper

− [n] + control.

| Variant | Button size | Gap | Where |
| :-- | :-- | :-- | :-- |
| `compact` | 27 × 27 px, radius 9 px, `card-2` | 9 px | Cart rows |
| `large` | 34 × 34 px, radius 11 px, inside a `card` tray with radius 14 px | 15 px | Product detail |

**Rules (from the Phase 3 issue):** smallest value is **1**, largest is the **stock** count. At the limit, that button is disabled (40% opacity). Removing an item is a separate action in the cart, not "minus to 0".
**Props:** `value`, `min = 1`, `max`, `onChange`, `size`.

> The prototype lets the cart stepper go to 0 to remove the item. This inventory uses min 1 to match the Phase 3 issue. **Decide in the review (#24).**

## 4. Badge

Small text label, `font-body-bold`, 10 px.

| Variant | Look | Used for |
| :-- | :-- | :-- |
| `status` | Coloured background by order state, see below | Order status screen |
| `stock` | `success` "In stock" · `warning` "Only N left" · `error` "Out of stock" | Product card and detail |
| `count` | 18 px `accent` circle | Cart icon (inside `IconButton`) |
| `pill` | `card` background, 1 px `border`, rounded, optional dot | "Delivering in Nepalgunj" on Home |
| `age` | 8 px white text at 68% opacity | "18+ · Enjoy responsibly" on alcohol category cards |

**Order status colours:** `pending`, `confirmed`, `preparing` → `warning` · `out_for_delivery` → `accent` ("On the way") · `delivered` → `success` · `cancelled`, `payment_failed` → `error`.

## 5. Input

Labelled text field. The label is 10 px bold `muted`, 7 px above the field. The field is 50 px tall, radius 14 px, `card` background, 1 px `border`, text 13 px, 15 px padding left and right.

| Type | Keyboard | Check |
| :-- | :-- | :-- |
| `text` | default | required, length |
| `phone` | number pad | 10 digits, starts with 97 or 98, placeholder `98XXXXXXXX` |
| `password` | secure entry, with show/hide | at least 8 characters for real accounts |

**States:** default · focused (border turns `accent`) · error (border `error`, red 10 px message underneath) · disabled.
**Props:** `label`, `type`, `value`, `onChangeText`, `error?`, `placeholder?`.

## 6. CategoryCard

Big photo tile on Home, shown two per row. At least 230 px tall, radius 22 px. A dark gradient at the bottom keeps the white text readable. Shows the category name, the item count, and a 32 px round ↗ arrow. Alcohol categories also show the `age` badge.
**States:** pressed (photo zooms in slightly) · loading (skeleton block of the same size).

## 7. ProductCard

Grid card on the product list. Radius 21 px, `card` background, 1 px `border`, `shadow-card`. Photo area is 142 px tall. Below it: size (small `muted`), name (`font-heading`), price in NPR (`accent`). A 28 px `accent` "+" button (radius 10 px) adds one to the cart straight away.
**States:** default · pressed · out of stock (dimmed, "+" disabled, `stock` badge shown).

## 8. CartItem

Row in the cart and checkout. Radius 18 px, `card`, 1 px `border`. 65 × 68 px photo (radius 12 px), name, size, line price, a `compact` QuantityStepper, and a remove button.

## 9. SummaryCard

Radius 18 px, `card`, 1 px `border`, rows of label and value at 11 px, then a divider and a bold total.

| Variant | Rows |
| :-- | :-- |
| `bill` | Subtotal, delivery fee, total (amounts come from the **server**) |
| `reference` | Order number, total paid, payment method, estimated time |

## 10. PaymentOption

Choose-one card. An icon tile (रु for COD, eSewa logo), a title and a note, and a round check on the right.
**States:** unselected (`border`) · selected (`accent` border, faint `accent` background, check filled) · disabled (eSewa until the integration is live).

## 11. Toast

Floating message near the bottom, 17 px from each edge. At least 51 px tall, radius 16 px, `card` background at 90% opacity with a 1 px `border`. A 26 px `accent` icon tile, 11 px text. Slides up 15 px and fades in, then hides after **2.4 s**.
**Variants:** `success` ("Added to cart") · `error` ("Out of stock", network failure).

## 12. AppHeader

| Variant | Left | Centre | Right |
| :-- | :-- | :-- | :-- |
| `home` | Menu `IconButton` | `Logo` (compact) and app name | Cart `IconButton` with count |
| `sub` | Back `IconButton` | Screen title (`font-heading`, 18 px) | Cart `IconButton` with count |

## 13. StateView

One component for the loading, empty and error states required on every list screen.

| Variant | Content |
| :-- | :-- |
| `loading` | Skeleton blocks shaped like the content (not a spinner on a blank screen) |
| `empty` | Icon, a 17 px heading ("Your cart is empty"), a short line, a `ghost` button ("Browse products") |
| `error` | Icon, "Something went wrong", a secondary "Try again" button that refetches |

## 14. Logo

The glass-and-orbit mark from the prototype as an SVG. `full` is 88 px wide (splash, login). `compact` is 37 px (header).

---

## Not in the MVP inventory

Drawer menu, theme switch, age confirmation modal, and the success halo animation are in the prototype but are one-off screens or post-MVP. They get built when their screen is built and can join this list later.

## Open questions (settle in the design review, #24)

1. Quantity stepper minimum: 1 (Phase 3 issue) or 0 to remove (prototype)?
2. Is the age confirmation modal part of the MVP? It's a legal question for alcohol, so it probably should be.
3. Should the password rule be at least 8 characters (recommended) or the prototype's 4?

## Sign-off

- [ ] @aakash-develops agrees
- [ ] @anubhav-dahal agrees
