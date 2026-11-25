# MVP Test Checklist (on a real phone)

The 9-step journey from `PROJECT_PLAYBOOK.md` section 2. Run it on an Android phone before calling the MVP done. Raise a GitHub issue for anything that fails.

The same journey is also tested automatically through the API: `backend/tests/journey.test.js` (`cd backend && npm test`).

## Setup

1. PC and phone on the **same Wi-Fi**.
2. `cd backend && npm run dev`. Note the demo staff accounts it prints.
3. `cd RaksiChaiyo && npx expo start`, then open it in Expo Go.
4. Start with a fresh app: in Expo Go, clear the app's data, or log out and empty the cart.

**eSewa sandbox login** (test money only): eSewa ID `9806800001`, password `Nepal@123`, OTP `123456`.

## Journey

| # | Step | Expected | Pass |
| :-- | :-- | :-- | :-- |
| 1 | Open the app | Animated splash (logo springs in, loader fills) for about 2 s, then Home. No white flash. | ☐ |
| 2 | Home | 4 category tiles with photos. Tapping **Beer** asks "Are you 18 or older?" the first time only. | ☐ |
| 2 | Product list | Grid of products with price and stock badge. Nepal Ice shows "Out of stock". | ☐ |
| 3 | Product detail | Photo, price, size picker (e.g. Gorkha 650 ml / 330 ml), quantity stepper stops at 1 and at stock. | ☐ |
| 4 | Add to cart | Toast "… added to cart", cart badge count goes up. | ☐ |
| 4 | Buy now | Goes straight to checkout with only that item. Cart is unchanged. | ☐ |
| 5 | Cart → Checkout | Subtotal right; change quantity, remove item; close and reopen the app and the cart is still there. Checkout shows subtotal + NPR 100 delivery = total. | ☐ |
| 6 | Log in / register | "Log in to continue" → register → returns to checkout with the cart and form kept. Address name/phone pre-filled. | ☐ |
| 7a | Pay: Cash on delivery | Place order → "Order placed!" with order number. | ☐ |
| 7b | Pay: eSewa | Choose eSewa → eSewa page opens → log in with the sandbox account → pay → back in the app, payment status **Paid**. | ☐ |
| 7c | eSewa cancel | Cancel on the eSewa page → "You cancelled the eSewa payment" with **Pay with eSewa** and **Pay cash on delivery instead**. Both work. | ☐ |
| 8 | Order confirmed | Status card shows "We received your order". Account → My orders lists it. | ☐ |
| 9 | On the way | `cd backend && npm run order:next -- <order number>` three times (or use the Admin screens, Phase 6). Within 15 s the app shows **"Your order is on the way!"** and the timeline moves. | ☐ |

## Edge cases

| Case | Expected | Pass |
| :-- | :-- | :-- |
| Stop the backend, pull to refresh on Home | Error state with **Try again**; works again after restarting. | ☐ |
| Two phones buy the last Barahsinghe (stock 3) at once | One order succeeds, the other gets "not available" and the checkout refreshes. | ☐ |
| Double-tap **Place order** | Only one order is created. | ☐ |
| Cancel a pending order | Status "Cancelled"; the stock is back in the product list. | ☐ |
| Phone in light mode | App follows it (splash stays dark). | ☐ |
| Log out, reopen app | Logged out; cart still there. | ☐ |

Tested by: ________  Phone: ________  Date: ________
