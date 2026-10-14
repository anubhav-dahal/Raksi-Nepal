# Product Backlog & Agile Delivery Plan
**Snack & Beverage Delivery Platform**  
*Nepalgunj, Nepal • Android-First Customer App • Dedicated Rider App • Web Administration*  
*Prepared as a practical working document for a two-person beginner development team*

---

**Version:** 1.0  
**Date:** 14 October 2026  
**Purpose:** Translate the product decisions made during discovery into an understandable product backlog, Scrum working agreement, and a concrete first sprint. This is a living plan—not a promise that every listed feature belongs in the first release.

---

## Document Guide
1. Executive summary and product vision
2. Decisions and assumptions
3. MVP scope and release roadmap
4. How Agile and Scrum work for this team
5. Roles, workflow, and working agreements
6. Product backlog: epics and user stories
7. Sprint 1: goal, scope, tasks, and ownership
8. Quality, security, privacy, and operational guardrails
9. Risks, dependencies, and decisions to revisit
10. Glossary and templates

---

## 1. Executive Summary

The project is a small-team delivery platform for snacks and beverages serving Nepalgunj, Nepal. The initial business model is a single store, with architecture that can associate products and orders with a store later if a marketplace is justified. The initial customer platform is Android; iOS follows later. A dedicated rider app and a web admin dashboard are planned, all using one shared backend.

The discovery choices describe a broad long-term product. The first release must therefore be deliberately narrower: reliable catalogue, checkout, order confirmation, stock control, delivery assignment, order-status updates, and payment recording come before advanced marketing, analytics, or marketplace features.

> **Critical Launch Gate:**  
> Alcohol sales and delivery must remain disabled until the business has verified the applicable Nepali licensing, permitted sale/delivery hours, age-verification obligations, and advertising/promotion rules. The product can be designed to support restricted products, but legal approval is a release dependency.

### Product Vision
Help customers in eligible Nepalgunj delivery areas conveniently order snacks and beverages during the store’s available operating hours, while giving the business a reliable way to manage products, stock, orders, riders, payments, and promotions.

### Product Outcomes to Validate
- Customers can place a valid order without confusion about availability, delivery area, fees, or total price.
- Staff can confirm and fulfil orders without overselling stock or losing track of payments.
- Riders can see only their assigned deliveries and report delivery progress.
- The business can understand order volume, cancellations, discounts, payment collection, and operational bottlenecks.
- The team can ship safely through repeatable development, testing, backup, and release practices.

---

## 2. Decisions and Assumptions

| Area | Agreed Direction |
| :--- | :--- |
| **Business model** | Own store first; keep the data model extensible for a future multi-store marketplace. |
| **Initial market** | Nepalgunj, Nepal; late-evening snack and beverage demand is an initial hypothesis to validate. |
| **Platforms** | Android customer app first; separate React Native customer and rider apps; web admin dashboard. iOS later. |
| **Stack direction** | Provisional: React Native + Expo + TypeScript; Node.js/Express + TypeScript backend; PostgreSQL + Prisma. Confirm through a short technical spike before locking in. |
| **Operating availability** | Store/admin can toggle ordering availability based on demand and rider capacity; don't accept orders when fulfilment is unavailable. |
| **Ordering** | Quick-order paths and a full cart share the same server-side checkout/order logic. |
| **Payments** | Cash on delivery and eSewa are desired. Validate eSewa merchant integration, verification, reconciliation, and refund support before choosing the exact flow. |
| **Fulfilment** | Admin confirms/rejects new orders and manually assigns riders; riders update assigned delivery statuses. |
| **Delivery zones** | Configured service areas with per-area fees; written address plus optional map pin. |
| **Customer accounts** | Guest checkout plus optional accounts; saved addresses, favourites, and order history for registered customers. |
| **Stock** | Each variant has its own SKU, optional barcode, price, and stock. Reserve stock on submission, with timeout and safe release rules. |
| **Prices** | Only the main administrator can change regular prices. Discounts are separate. Accepted orders retain price/fee/discount snapshots. |
| **Promotions** | Configurable campaigns and coupons; stacking is configurable. Influencer attribution uses coupon codes and trackable links. |
| **Privacy/security** | Minimum necessary data, role-based access, audit logs, appropriate retention/deletion, privileged-role 2FA, separate environments and backups. |
| **Languages** | English and Nepali from launch; NPR currency. |
| **Support** | Phone/WhatsApp plus basic order-linked support tickets. |
| **Testing** | Unit, integration, API, and end-to-end tests, expanded incrementally. |
| **Release workflow** | Feature branches and pull requests; development, staging, and production environments. |

---

## 3. MVP Scope and Release Roadmap

Priority labels: **P0** = launch-critical; **P1** = valuable early follow-up; **P2** = later enhancement. Priorities are proposed and should be reviewed at Sprint Planning.

| Release | Scope |
| :--- | :--- |
| **Release 1 — Operational MVP (P0)** | Environment/repository foundation; customer catalogue and variants; service areas and delivery fee; guest checkout; server-side price/stock validation and reservation; admin order confirmation; manual rider assignment; rider delivery statuses; COD recording; eSewa only after verified integration; basic customer order status; role-based access; audit/security basics; backups; critical automated tests; English/Nepali foundations. |
| **Release 1.1 — Convenience (P1)** | Registered accounts and recovery; saved addresses; favourites/reorder; push notifications; secure guest order-status link; basic support tickets; product visibility settings; basic promotion/coupon support if legal review permits. |
| **Release 1.2 — Growth and Reporting (P1/P2)** | Influencer tracking links, campaign reports, expanded promotion rules, operational/marketing dashboards, optional email summaries, richer admin controls, free-delivery campaigns. |
| **Later — Scale (P2)** | iOS release; live rider GPS if justified; richer analytics; self-service privacy dashboard; advanced automated recovery; marketplace/multi-store operations; advanced recommendation/loyalty features. |

> **Scope Discipline:**  
> The discovery backlog records desired capabilities, not a commitment to build all of them immediately. In particular, building separate customer and rider apps, a web dashboard, and mobile admin screens at once is expensive. Sprint 1 should establish foundations; the first usable release should be chosen based on validated capacity and legal readiness.

---

## 4. Agile and Scrum in Plain Language

| Term | Plain-Language Meaning |
| :--- | :--- |
| **Agile** | A way of working that delivers useful pieces incrementally, learns from feedback, and adapts plans. |
| **Scrum** | A lightweight framework with a Product Backlog, Sprint Planning, a time-boxed Sprint, a usable Increment, and review/retrospective events. |
| **Product Backlog** | The ordered list of everything the product may need: features, quality work, fixes, and research. |
| **Epic** | A broad capability containing multiple smaller stories, such as Checkout or Inventory. |
| **User Story** | A short description of value from a user's perspective: “As a customer, I want… so that…”. |
| **Acceptance Criteria** | Specific conditions that must be true for a story to be accepted. |
| **Product Backlog Item (PBI)** | Any item in the Product Backlog; user stories are a common type. |
| **Sprint** | A fixed period in which the team aims to deliver a small, tested increment. |
| **Sprint Goal** | The single outcome the team is trying to achieve during a Sprint. |
| **Sprint Backlog** | The Sprint Goal, selected Product Backlog Items, and the team's plan/tasks to deliver them. |
| **Task** | A concrete piece of work that helps complete a story, such as creating a database migration. |
| **Story Points** | A relative estimate of effort, complexity, and uncertainty. They are not hours. |
| **Definition of Ready (DoR)** | A team checklist for whether a story is clear enough to start. |
| **Definition of Done (DoD)** | The shared quality checklist a story must pass before being considered complete. |
| **Increment** | The integrated, working product produced by a Sprint. |
| **Sprint Review** | Show what works and gather feedback; adapt the backlog. |
| **Retrospective** | Discuss how the team worked and choose one or two improvements. |

### Suggested Cadence

| Event | Suggested Duration | Purpose |
| :--- | :--- | :--- |
| **Sprint length** | 2 weeks initially | Short enough to learn quickly; adjust if school/work commitments make it unrealistic. |
| **Sprint Planning** | 45–60 minutes | Agree the Sprint Goal, select ready stories, and plan tasks based on real availability. |
| **Short team sync** | 10–15 minutes, 2–3 times/week | Share progress, next step, and blockers; a daily meeting is not mandatory for a hobby team. |
| **Sprint Review** | 30 minutes | Demonstrate working software to the business partner and capture feedback. |
| **Retrospective** | 20–30 minutes | Choose one practical process improvement for the next Sprint. |
| **Backlog refinement** | 20–30 minutes weekly | Clarify upcoming stories, acceptance criteria, dependencies, and estimates. |

*Note: For the first two or three Sprints, treat estimates as learning aids rather than promises. Do not convert story points into hours. Record actual availability and completed work, then calibrate future Sprint capacity.*

---

## 5. Roles, Workflow, and Working Agreements

### People and Responsibilities

| Role | Responsibility |
| :--- | :--- |
| **Product Owner / Business Representative** | Owns priorities and business outcomes; answers product questions; accepts stories against criteria. The business-side friend is a natural candidate, but confirm this explicitly. |
| **Developer A — Backend & Platform** | Proposed initial focus: API, database, authentication/authorization, environments, CI, backups, and backend tests. |
| **Developer B — Mobile & Experience** | Proposed initial focus: React Native app shell, navigation, design system, localization foundations, mobile tests, and user flows. |
| **Both Developers** | Review each other's pull requests, refine stories, test end-to-end flows, document decisions, and share knowledge. |

*The two developer assignments are provisional, not assumptions about skill. Swap or pair on tasks according to each person's strengths.*

### GitHub Workflow
1. Keep `main` releasable; do work in short-lived branches such as `feat/catalogue-api` or `fix/stock-reservation`.
2. Open a pull request for each meaningful change. Include purpose, screenshots or API examples where useful, tests run, and linked issue IDs.
3. Run formatting/linting, type checks, tests, and build checks automatically where practical.
4. Review for correctness, security, tests, and maintainability; then merge.
5. Use separate configuration and credentials for development, staging, and production. Never commit secrets.

### Definition of Ready (DoR)
- The user/business problem and intended value are clear.
- Acceptance criteria are testable and not contradictory.
- Dependencies and legal/payment/provider uncertainties are identified.
- The story is small enough to finish within a Sprint, or is split.
- The team understands the test approach and has enough information to start.

### Definition of Done (DoD)
- Acceptance criteria pass and the change is integrated through a reviewed pull request.
- Relevant automated tests pass; critical business logic has appropriate coverage.
- Input validation, authorization, error handling, and loading/empty states are addressed.
- Database migrations and configuration changes are documented; secrets are not committed.
- English/Nepali behaviour is considered for customer-facing UI where applicable.
- Manual verification is completed in the appropriate environment; no known critical defect remains.
- Documentation and audit/logging behaviour are updated where needed.

---

## 6. Product Backlog: Epics and User Stories

*P0 items should be refined first. Acceptance criteria are intentionally concise; expand them into test cases during refinement.*

| Epic | ID | Priority | Title | User Story | Acceptance Criteria | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Foundation** | FND-01 | P0 | Repository and collaboration | As a developer, I want a shared repository and branch workflow so that we can collaborate safely. | Both developers can clone the repository; main branch protections/PR conventions are documented; no secrets are committed. | |
| **Foundation** | FND-02 | P0 | Separate environments | As a developer, I want development, staging, and production configuration separated so experiments cannot affect live orders. | Each environment has distinct config and credentials; staging uses test data; production secrets are not available to ordinary development builds. | |
| **Foundation** | FND-03 | P0 | Automated quality checks | As a developer, I want repeatable checks so that regressions are caught before merging. | Pull requests run configured lint/type/test/build checks; failures are visible and block merge when protection is enabled. | |
| **Foundation** | FND-04 | P0 | Database backup and restore | As the business owner, I want recoverable backups so that operational records are not lost after failure. | Automated backup schedule and retention are documented; access is restricted; restore is tested in a non-production environment. | |
| **Foundation** | FND-05 | P0 | Audit sensitive actions | As the business owner, I want sensitive staff actions recorded so that important changes can be investigated. | Log actor, time, action, target record, and relevant old/new values; ordinary staff cannot alter audit logs; secrets are excluded. | |
| **Accounts & Access** | ACC-01 | P0 | Customer guest checkout | As a customer, I want to order without creating an account so that checkout is quick. | Guest can provide required contact/address details and submit; receives order reference/status access; account creation is not mandatory. | |
| **Accounts & Access** | ACC-02 | P1 | Customer registration and login | As a customer, I want an account so that I can save addresses and see my orders. | Verified contact method and secure password flow; sessions can be revoked; account data is scoped to its owner. | |
| **Accounts & Access** | ACC-03 | P1 | Password recovery | As a customer, I want to recover my account using verified email or phone so that I can regain access. | Time-limited single-use reset token/OTP; rate limits; generic response does not reveal account existence; successful reset invalidates token. | |
| **Accounts & Access** | ACC-04 | P0 | Staff roles and permissions | As the business owner, I want role-based access so staff can only perform permitted actions. | Backend checks permissions for every protected action; initial roles include Admin, Order Manager, Inventory Manager, Rider; unauthorized requests fail. | |
| **Accounts & Access** | ACC-05 | P0 | Privileged-role 2FA | As the business owner, I want stronger sign-in for privileged staff so sensitive operations are protected. | Admins and privileged roles must complete a second factor; recovery and session revocation are documented; no secrets are logged. | |
| **Accounts & Access** | ACC-06 | P1 | Customer deletion request | As a customer, I want to request account deletion so I can exercise privacy choices. | Request is recorded and tracked; eligible data is deleted/anonymized; legally required records and active-order/refund needs are handled. | |
| **Catalogue** | CAT-01 | P0 | Categories and subcategories | As a customer, I want to browse a clear category structure so I can find products. | Admin can manage category hierarchy; categories can be localized; products can appear in multiple relevant categories without duplication. | |
| **Catalogue** | CAT-02 | P0 | Product and variant management | As an admin, I want products to have variants so each size/flavour can have its own price and stock. | Product has one or more variants; each variant has unique SKU, price, stock, optional barcode, attributes, and availability. | |
| **Catalogue** | CAT-03 | P0 | Product images | As an admin, I want to upload product images so customers can identify products. | Upload validates type/size; supports multiple images and a primary image; broken external URLs have a fallback. | |
| **Catalogue** | CAT-04 | P0 | Search, filters, and sorting | As a customer, I want to search and filter products so I can find suitable items quickly. | Search and category browsing work; initial filters include price, brand, availability; results reflect current availability. | |
| **Catalogue** | CAT-05 | P0 | Curated home sections | As a customer, I want useful product sections so I can discover popular and promoted items. | Home supports configurable sections such as Best Sellers, New Arrivals, and active promotions; no personalized engine required. | |
| **Catalogue** | CAT-06 | P0 | Unavailable-product visibility | As an admin, I want to choose whether unavailable products are hidden or shown as out of stock. | Visibility is configurable; displayed unavailable products cannot be ordered; server checks stock independently of UI. | |
| **Catalogue** | CAT-07 | P0 | Bilingual catalogue and UI | As a customer, I want English and Nepali so I can use the app in my preferred language. | Customer can switch language; UI strings are localized; product/category content supports required languages; currency displays NPR. | |
| **Catalogue** | CAT-08 | P1 | Favourites | As a registered customer, I want to favourite products so I can find them again. | Customer can add/remove favourites; data is scoped to their account; unavailable items are clearly indicated. | |
| **Catalogue** | CAT-09 | P1 | Reorder previous order | As a customer, I want to reorder previous purchases so checkout is faster. | Creates a new cart using current price/stock/fees; unavailable products are flagged or skipped; old order is unchanged. | |
| **Inventory** | INV-01 | P0 | Stock adjustment and restock | As an inventory manager, I want to update stock so on-hand quantities stay accurate. | Authorized staff can restock, adjust, or mark unavailable with reason; adjustments are audited. | |
| **Inventory** | INV-02 | P0 | Atomic stock reservation | As the business, I want stock reserved on order submission so concurrent orders cannot oversell. | Reservation is atomic; available and reserved quantities are distinguishable; competing orders cannot reserve the same last unit. | |
| **Inventory** | INV-03 | P0 | Reservation expiry and release | As an admin, I want expired unpaid reservations released so unavailable stock can return to sale. | Configurable timeout; expiry checks payment status first; paid/uncertain payments are not silently released; releases are auditable. | |
| **Inventory** | INV-04 | P0 | Substitution proposal | As a customer, I want to approve a substitute when an item is unavailable so I control changes to my order. | Admin proposes substitute and price difference; customer accepts or declines; stock and totals update safely; decision is recorded. | |
| **Checkout & Delivery** | CHK-01 | P0 | Service areas and eligibility | As a customer, I want to select my delivery area so I know whether delivery is available. | Areas are configurable; checkout rejects out-of-area addresses; written address/landmark and phone are collected; map pin is optional. | |
| **Checkout & Delivery** | CHK-02 | P0 | Area delivery fees | As an admin, I want to set delivery fees per area so fees reflect service costs. | Backend calculates fee from configured area; accepted order snapshots fee; later configuration changes do not alter existing orders. | |
| **Checkout & Delivery** | CHK-03 | P0 | Minimum order and availability | As a customer, I want to know if ordering is available and whether I meet the minimum so I don't submit an invalid order. | Admin can toggle ordering availability; configurable minimum is enforced server-side; unavailable service prevents order submission. | |
| **Checkout & Delivery** | CHK-04 | P0 | Cart and quick order | As a customer, I want both quick ordering and a full cart so I can choose the fastest suitable path. | Both paths use the same checkout validation and order creation logic; customer sees item quantities and totals before submission. | |
| **Checkout & Delivery** | CHK-05 | P0 | Checkout price/stock revalidation | As a customer, I want to confirm current prices and availability so I know what I am paying. | Backend revalidates price, stock, promotion, fee, and minimum; material changes require acceptance; order stores accepted snapshots. | |
| **Checkout & Delivery** | CHK-06 | P0 | Order request and admin confirmation | As a customer, I want to submit an order request and know when it is confirmed. | Order starts awaiting confirmation; admin can confirm/reject with reason; customer sees current state; duplicate submission is prevented. | |
| **Checkout & Delivery** | CHK-07 | P0 | Customer cancellation rules | As a customer, I want to cancel before confirmation so I can correct mistakes. | Customer can cancel before confirmation; after confirmation they are directed to support; eligible reservations are released; action is audited. | |
| **Checkout & Delivery** | CHK-08 | P0 | Configurable free delivery | As an admin, I want configurable free-delivery rules so I can run simple offers. | Rules can include threshold or campaign; eligibility is server-validated; discount is recorded separately and snapshotted. | |
| **Checkout & Delivery** | CHK-09 | P1 | Delivery proof | As the business, I want a recorded delivery completion so disputes can be investigated. | Rider marks delivered and records a minimal configured proof such as recipient confirmation; privacy and operational suitability reviewed before launch. | |
| **Orders & Rider** | ORD-01 | P0 | Order status lifecycle | As a customer, I want clear status updates so I know what is happening. | Allowed transitions are defined and enforced; initial states include received, awaiting confirmation, confirmed, preparing, rider assigned, picked up, delivered, rejected/cancelled. | |
| **Orders & Rider** | ORD-02 | P0 | Manual rider assignment | As an order manager, I want to assign a rider so delivery responsibility is clear. | Only authorized staff can assign/reassign; rider sees assigned orders only; assignment and changes are audited. | |
| **Orders & Rider** | ORD-03 | P0 | Dedicated rider app | As a rider, I want a mobile app for assigned deliveries so I can complete them reliably. | Rider can authenticate, view assigned order/address/contact, and update permitted statuses; cannot access unrelated orders or admin functions. | |
| **Orders & Rider** | ORD-04 | P0 | Customer order status page | As a customer, I want to see order progress so I don't need to call the store for every update. | Registered customers see their own order; guest access uses an unpredictable, revocable/expiring secure token; minimal data is exposed. | |
| **Orders & Rider** | ORD-05 | P1 | Push notifications | As a customer, I want important order changes sent to my device so I don't miss them. | Push is sent for agreed important status changes; backend status remains source of truth; failed push does not change order state. | |
| **Orders & Rider** | ORD-06 | P1 | Secure guest status link | As a guest, I want a secure link to view order status without creating an account. | Token is high-entropy, revocable/expiring, and exposes only the relevant order; avoid sensitive details in notification previews. | |
| **Payments & Finance** | PAY-01 | P0 | Cash-on-delivery tracking | As an order manager, I want COD collection recorded so cash can be reconciled. | Payment state is separate from order state; rider/staff can record collection according to permission; amount and actor/time are recorded. | |
| **Payments & Finance** | PAY-02 | P0 | eSewa payment integration | As a customer, I want to pay through eSewa so I can use a supported digital payment method. | Implement only after merchant/API requirements are verified; backend verifies transaction with provider; callbacks are authenticated/idempotent; sandbox tests pass. | |
| **Payments & Finance** | PAY-03 | P0 | Payment/order state separation | As the business, I want payment state tracked separately so order fulfilment does not misrepresent money received. | Payment states include pending, paid, failed/expired, and refunded as applicable; order and payment transitions are independently validated. | |
| **Payments & Finance** | PAY-04 | P0 | Refund tracking | As an admin, I want to approve and track refunds so customers and records stay consistent. | Refund amount/reason/approval/provider reference/status are recorded; manual/provider processing is reconciled; no duplicate refund action. | |
| **Payments & Finance** | PAY-05 | P1 | Financial reports and exports | As the business owner, I want financial reports so I can reconcile sales, COD, digital payments, discounts, and refunds. | Reports define metrics and date ranges; totals reconcile to recorded transactions; exports are access-controlled. | |
| **Promotions & Marketing** | PRO-01 | P1 | Coupon and campaign rules | As an admin, I want configurable coupons so I can run promotions safely. | Support fixed/percentage discount, dates, minimum order, usage limits, eligibility, max discount, and stacking policy; backend validates all rules. | |
| **Promotions & Marketing** | PRO-02 | P1 | Influencer codes and links | As a marketer, I want codes and trackable links so campaign orders can be attributed. | Campaign/influencer is separate from coupon; attribution is persisted with order; each order counted once; reports support analysis. | |

---

## 7. Sprint 1: Goal, Scope, Tasks, and Ownership

**Sprint Goal:**  
Set up the core developer environment, shared database schema, authentication basics, and initial API and customer UI for viewing products.

| Task ID | Story / Area | Task Description | Owner | Estimated Effort |
| :--- | :--- | :--- | :--- | :--- |
| `TSK-01` | FND-01 | Initialize GitHub repo with branch protections, linting, and PR templates | Dev A | Low |
| `TSK-02` | FND-02 | Setup environment config (`.env.example`) for Dev/Staging/Prod | Dev A | Low |
| `TSK-03` | Setup | Initialize Express/TypeScript backend scaffold with PostgreSQL & Prisma | Dev A | Medium |
| `TSK-04` | Setup | Initialize React Native (Expo + TypeScript) project shell and routing | Dev B | Medium |
| `TSK-05` | CAT-01/02 | Design initial database schema for Categories, Products, and Variants | Dev A | Medium |
| `TSK-06` | CAT-01/02 | Build CRUD REST APIs for Categories and Products (Admin secured) | Dev A | Medium |
| `TSK-07` | CAT-01 | Implement Customer App Catalogue Screen with localization setup (EN/NE) | Dev B | High |
| `TSK-08` | CAT-02 | Implement Product Details view in Customer App with variant selectors | Dev B | Medium |
| `TSK-09` | FND-03 | Configure GitHub Actions CI workflow (Typecheck, Lint, basic API unit test) | Dev A | Medium |
| `TSK-10` | Review | End-of-sprint demo prep and review against Definition of Done | Both | Low |

---

## 10. Glossary and Document Info

- **COD:** Cash on Delivery
- **NPR:** Nepalese Rupee
- **SKU:** Stock Keeping Unit
- **OTP:** One-Time Password
- **PBI:** Product Backlog Item
- **DoR / DoD:** Definition of Ready / Definition of Done

---
*Document end.*