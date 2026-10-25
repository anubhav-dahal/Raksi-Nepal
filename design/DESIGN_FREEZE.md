# Design Review and Freeze

**Issue:** #24 · **Phase:** 1 Design · **Status:** Review not held yet, **not frozen**
**Done when:** both of us approve. After that, design changes go into Excalidraw first, then into code.

This is the checklist for the review meeting. Tick the boxes together, settle the open decisions, sign at the bottom, then close #24 and run `./scripts/complete-phase.sh 1`.

## 1. What is being frozen

| Item | Where | Issue | State on 2026-10-26 |
| :-- | :-- | :-- | :-- |
| User flow (splash to "on the way") | `design/app-design.excalidraw` | #17 | Merged (#30) |
| Wireframes for all MVP screens | `design/app-design.excalidraw` | #18 to #20 | Merged (#30), gaps listed below |
| Colour system | `Color-system-specification.md` | n/a | On `main` |
| Theme tokens in code | `RaksiChaiyo/global.css` | #21 | Branch `feat/21-theme-tokens`, PR needed |
| Splash animation spec | `design/splash-animation-spec.md` | #22 | Branch `docs/22-splash-animation-spec` |
| Component inventory | `design/component-inventory.md` | #23 | Branch `docs/23-component-inventory` |
| Visual reference (hi-fi) | `Prototype/` (Vite + React) | n/a | On `main` |

## 2. Wireframe coverage

Every screen in the 9-step MVP journey (`PROJECT_PLAYBOOK.md` section 2), checked against the Excalidraw file:

| MVP step | Screen | In Excalidraw? | Notes |
| :-- | :-- | :-- | :-- |
| 1 | Animated splash | ✅ "Animation screen" | Motion is in the #22 spec |
| 2 | Home with categories | ⚠️ Frame exists but has no labels | Label it: categories, delivery pill, age note |
| 2 | Product list per category | ✅ "ice", "buweiser" | |
| 3 | Product detail and quantity | ✅ "tuborg", − 2 + | |
| 4 | Add to cart / Buy now | ✅ "add to cart", "checkout" buttons | The second button says "checkout". Rename it to **"Buy now"** to match the flow? |
| 4 | Cart screen | ❌ Missing | Phase 3 needs it (subtotal, edit quantity, remove) |
| 5 | Checkout summary | ✅ "TUBORG · QTY 4 · Price 1000 · Pay" | Add the delivery fee line and total |
| 5 | Delivery address entry | ❌ Missing | Phase 4: name, phone, address, landmark |
| 6 | Login / register | ⚠️ "LOGIN" only | Register screen or tab is not drawn |
| 7 | Payment choice (COD / eSewa) | ⚠️ Inside checkout as "Pay" | Show the two options (see `PaymentOption`) |
| 8 | Order confirmed | ✅ "SUCCESS!!!!" | |
| 9 | Order status "on the way" | ⚠️ Shares the success frame | Draw it as its own screen. Users come back to it later. |
| all | Loading, empty, error states | ❌ Missing | #18 asked for these. `StateView` in #23 covers the pattern. |

## 3. Review checklist

**Flow and screens**
- [ ] The flow arrows cover all 9 MVP steps in order
- [ ] Missing screens added to Excalidraw: cart, address, register, separate status screen
- [ ] Home frame labelled
- [ ] Loading, empty and error states drawn once (one example is enough, since `StateView` is shared)

**Theme and tokens**
- [ ] Colours in `global.css` match `Color-system-specification.md` (dark and light)
- [ ] Fonts agreed: **Manrope** for headings, **DM Sans** for body
- [ ] Radius and spacing scale agreed (see #21)
- [ ] Token smoke screen checked on a real Android phone, in both light and dark mode

**Specs**
- [ ] Splash spec (#22) agreed and its open questions answered
- [ ] Component inventory (#23) agreed and its open questions answered

## 4. Decisions to make in the review

| # | Question | Recommendation | Decision |
| :-- | :-- | :-- | :-- |
| D1 | App name on screens: **RaksiChaiyo** or the prototype's "Nepalgunj Sips"? | RaksiChaiyo (the Expo app name) | |
| D2 | Default theme: follow the phone, or always dark? | Follow the phone, with dark as the design default. The splash is always dark. | |
| D3 | Second button on product detail: "Checkout" or "Buy now"? | "Buy now" (playbook wording) | |
| D4 | Quantity stepper minimum: 1 or 0? | 1, and removing is a separate action | |
| D5 | Age confirmation (18+) modal in the MVP? | Yes, because it sells alcohol | |
| D6 | Password minimum length | 8 characters | |

## 5. Change rule after the freeze

1. Change the design in **Excalidraw** first (and this file or the spec if it's affected).
2. Open a small `docs/` PR with the updated design and get the other person's approval.
3. Only then change the code.

## 6. Sign-off

- [ ] @aakash-develops approves the design freeze. Date: ______
- [ ] @anubhav-dahal approves the design freeze. Date: ______
