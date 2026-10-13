# Beverage Delivery Android App

## Product Backlog, User Stories, and Agile Scrum Implementation Plan

**Document type:** Product requirements and Scrum delivery plan\
**Platform:** Android customer application\
**Business model:** Commercial beverage delivery to customer-selected
locations\
**Version:** 1.0\
**Status:** Initial product planning baseline

---

## 1. Product Overview

### 1.1 Product vision

Build a convenient and reliable Android app that lets customers discover
beverages, check delivery availability, place and pay for orders, and
follow delivery progress. The supporting business tools must allow staff
to maintain the catalog, manage stock and orders, and coordinate
deliveries.

### 1.2 Assumptions and scope

This backlog assumes:

- The primary deliverable is an Android app for customers.
- A backend service stores products, customers, addresses, carts or
  order drafts, payments, inventory, and order statuses.
- An administrative interface is available to authorized staff. It may
  be a web dashboard rather than part of the Android app.
- Delivery operations may use a separate driver interface or a
  controlled operational workflow.
- Payment processing is provided by a suitable payment service
  provider.
- Delivery is only offered inside configured service areas.
- If alcoholic beverages are sold, age verification and applicable
  local legal requirements must be treated as explicit requirements
  before launch.

The backlog is an initial baseline. Product discovery, technical
investigation, legal review, and stakeholder feedback may change its
scope and priority.

### 1.3 Product goals

1.  Let customers find and order available beverages with minimal
    friction.
2.  Make product prices, delivery fees, and order totals clear before
    payment.
3.  Provide reliable order confirmation and status updates.
4.  Help staff keep product information and inventory accurate.
5.  Support a manageable process for preparing, assigning, and
    completing deliveries.
6.  Protect customer, order, and payment information.

### 1.4 Main user groups

- **Customer:** Browses products, places orders, pays, and tracks
  delivery.
- **Administrator:** Manages product catalog, prices, stock, and
  configuration.
- **Order operator:** Reviews, accepts, prepares, and updates orders.
- **Delivery manager:** Assigns deliveries and monitors progress.
- **Delivery driver:** Views assigned deliveries and records delivery
  progress.
- **Business owner or analyst:** Reviews sales and operational
  reports.

---

## 2. Product Backlog Prioritization

Priorities are defined as:

- **P0 --- Must have:** Needed for a usable and operationally viable
  first release.
- **P1 --- Should have:** Valuable shortly after the MVP or where
  business needs require it.
- **P2 --- Could have:** Useful enhancement for a later release.

P0 does not mean every item must be delivered in the first sprint. The
Product Owner orders items based on value, risk, dependencies, and
learning.

---

Backlog ID Epic Backlog item Priority Initial
release

---

PB-01 Account Customer P0 MVP
registration
and login

PB-02 Account Manage customer P1 Later
profile

PB-03 Location Enter and P0 MVP
select delivery
address

PB-04 Location Check P0 MVP
delivery-area
availability

PB-05 Catalog Browse beverage P0 MVP
categories

PB-06 Catalog Search and P0 MVP
filter
beverages

PB-07 Catalog View product P0 MVP
details and
prices

PB-08 Catalog Display product P0 MVP
availability

PB-09 Cart Add and remove P0 MVP
products

PB-10 Cart Change product P0 MVP
quantities

PB-11 Cart Calculate P0 MVP
subtotal, fees,
and total

PB-12 Checkout Confirm address P0 MVP
and order
details

PB-13 Payment Pay using P0 MVP
supported
payment methods

PB-14 Orders Receive order P0 MVP
confirmation

PB-15 Orders View order P1 Later
history and
details

PB-16 Delivery View order P0 MVP
status

PB-17 Delivery Receive P1 Later
delivery
notifications

PB-18 Support Contact support P1 Later
about an order

PB-19 Promotions Apply discount P1 Later
codes

PB-20 Favorites Save favorite P2 Future
beverages

PB-21 Reordering Repeat a P2 Future
previous order

PB-22 Ratings Rate a P2 Future
completed order
or delivery

PB-23 Administration Manage P0 Operational
products, MVP
prices, and
stock

PB-24 Administration Process P0 Operational
incoming orders MVP

PB-25 Delivery Assign orders P0 Operational
operations to drivers MVP

PB-26 Delivery Update delivery P0 Operational
operations status MVP

PB-27 Reporting View sales and P1 Later
order reports

PB-28 Security Protect P0 Across all
customer data releases
and payments

---

**Important:** The customer app is not commercially operational unless
the business has a way to receive orders, keep inventory accurate, and
fulfil deliveries. Administrative and delivery capabilities may be
separate web or mobile tools, but their workflow must be included in the
end-to-end release plan.

---

## 3. Detailed User Stories and Acceptance Criteria

User stories use the format:

> As a \[user\], I want \[capability\], so that \[benefit\].

Acceptance criteria describe observable behavior and should be refined
with the Product Owner and team before development.

### Epic A --- Customer Account and Location

#### US-01 --- Customer registration and login

**Backlog item:** PB-01\
**Priority:** P0\
**Story:** As a customer, I want to create an account and sign in so
that I can place and manage my orders.

**Acceptance criteria** - Given valid required details, when I submit
registration, the system creates my account. - Required fields are
validated and understandable error messages are shown. - If an email
address or phone number is already registered, the app explains the
problem without creating a duplicate account. - I can sign in and sign
out securely. - Authentication failures do not expose sensitive account
information.

#### US-02 --- Set delivery location

**Backlog items:** PB-03, PB-04\
**Priority:** P0\
**Story:** As a customer, I want to enter a delivery address and check
whether delivery is available so that I know if I can order to my
location.

**Acceptance criteria** - I can enter an address manually and, if
supported, select a location on a map. - The app validates the address
using the available address service. - The system checks whether the
address is within a configured delivery area. - If delivery is
unavailable, the app explains this before checkout. - The customer can
correct the address and check again.

### Epic B --- Beverage Catalog

#### US-03 --- Browse beverages

**Backlog item:** PB-05\
**Priority:** P0\
**Story:** As a customer, I want to browse beverages by category so that
I can find products quickly.

**Acceptance criteria** - The catalog displays configured categories,
such as water, soft drinks, juice, and energy drinks. - Each product
card shows its name, image where available, price, and availability. -
Selecting a category shows the relevant products. - Empty categories
display a helpful empty state. - The app handles loading and catalog
errors without crashing.

#### US-04 --- Search and filter products

**Backlog item:** PB-06\
**Priority:** P0\
**Story:** As a customer, I want to search and filter beverages so that
I can find a product that meets my needs.

**Acceptance criteria** - I can search by product name and other
supported searchable fields. - Results match the entered search query. -
I can filter by available attributes such as category, brand, or price
range. - I can clear filters and return to the full catalog. - If no
results match, the app explains this and lets me revise the search.

#### US-05 --- View product details

**Backlog items:** PB-07, PB-08\
**Priority:** P0\
**Story:** As a customer, I want to see product details so that I can
make an informed purchase.

**Acceptance criteria** - The product page shows the name, description,
size or volume, price, and image where available. - Availability is
shown clearly. - Available products can be added to the cart. -
Unavailable products cannot be ordered. - Price and availability are
validated again by the backend when the order is submitted.

### Epic C --- Cart and Checkout

#### US-06 --- Manage shopping cart

**Backlog items:** PB-09, PB-10, PB-11\
**Priority:** P0\
**Story:** As a customer, I want to add products to my cart and change
quantities so that I can prepare my order before checkout.

**Acceptance criteria** - I can add an available product to the cart. -
I can increase or decrease quantities and remove products. - The
subtotal updates when items or quantities change. - Delivery fees and
other applicable charges are shown separately. - The app prevents
invalid quantities and communicates stock limitations. - The backend
recalculates prices and availability before order placement.

#### US-07 --- Review and place an order

**Backlog items:** PB-12, PB-14\
**Priority:** P0\
**Story:** As a customer, I want to review my order and confirm the
delivery details so that I can submit the correct purchase.

**Acceptance criteria** - Checkout shows products, quantities, item
prices, fees, discounts if applicable, and the total. - I can select or
enter a delivery address. - The app validates the order total, service
area, and product availability before submission. - A successful order
receives a unique order reference and confirmation. - If order creation
fails, the app displays an error and does not falsely confirm the
order. - Repeated taps or retries do not unintentionally create
duplicate orders.

#### US-08 --- Pay for an order

**Backlog item:** PB-13\
**Priority:** P0\
**Story:** As a customer, I want to pay using a supported payment method
so that I can complete my purchase securely.

**Acceptance criteria** - The app displays only payment methods enabled
by the business. - The amount sent for payment matches the confirmed
order total. - Successful payment is associated with the correct
order. - Failed, pending, or cancelled payments are represented
clearly. - The customer can retry a failed payment when allowed by the
payment provider and order rules. - Sensitive payment information is
handled by a suitable payment provider and is not stored insecurely by
the app.

### Epic D --- Orders and Delivery

#### US-09 --- Track order status

**Backlog item:** PB-16\
**Priority:** P0\
**Story:** As a customer, I want to see my order status so that I know
what is happening after checkout.

**Acceptance criteria** - The app displays agreed statuses, such as
Confirmed, Preparing, Out for Delivery, Delivered, and Cancelled. -
Status changes are based on valid updates from the backend. - The order
reference and estimated delivery time are shown when available. -
Cancelled orders are clearly marked. - The customer can only access
orders they are authorized to view.

#### US-10 --- Receive order notifications

**Backlog item:** PB-17\
**Priority:** P1\
**Story:** As a customer, I want to receive notifications about
important order updates so that I do not have to keep opening the app.

**Acceptance criteria** - The app requests notification permission where
required by the Android version. - Customers can manage notification
preferences where supported. - Important events, such as confirmation
and dispatch, can trigger notifications. - Selecting a notification
opens the relevant order after authorization. - Notification failure
does not prevent the order status from being saved.

#### US-11 --- View previous orders

**Backlog item:** PB-15\
**Priority:** P1\
**Story:** As a customer, I want to view previous orders so that I can
check past purchases and order details.

**Acceptance criteria** - I can view a list of my orders. - Each entry
shows the date, reference, total, and status. - Selecting an entry shows
the products and relevant order details. - I cannot access another
customer's order history.

### Epic E --- Business and Delivery Operations

#### US-12 --- Manage beverage inventory

**Backlog item:** PB-23\
**Priority:** P0\
**Story:** As an administrator, I want to manage products, prices, and
stock so that customers see accurate catalog information.

**Acceptance criteria** - Authorized staff can create, edit, activate,
and deactivate products. - Authorized staff can update prices and stock
quantities. - Products with no available stock cannot be purchased. -
Catalog changes become visible in the customer app within the agreed
update period. - Changes are validated and access is restricted to
authorized staff.

#### US-13 --- Process incoming orders

**Backlog item:** PB-24\
**Priority:** P0\
**Story:** As an order operator, I want to view and process incoming
orders so that customer purchases can be prepared for delivery.

**Acceptance criteria** - Staff can view incoming orders and their
details. - Staff can accept or reject an order according to defined
business rules. - Staff can update preparation status. - Rejection or
cancellation reasons are recorded where applicable. - Valid status
changes are reflected in the customer app.

#### US-14 --- Assign delivery drivers

**Backlog item:** PB-25\
**Priority:** P0\
**Story:** As a delivery manager, I want to assign orders to available
drivers so that orders can be delivered to customers.

**Acceptance criteria** - Authorized staff can assign an order to an
available driver. - Drivers can see the information needed to complete
their assigned deliveries. - Assignment is associated with the correct
order. - Reassignment updates the delivery record and relevant status. -
Unauthorized users cannot assign or view restricted delivery
information.

#### US-15 --- Update delivery progress

**Backlog item:** PB-26\
**Priority:** P0\
**Story:** As a delivery driver, I want to update the status of my
assigned deliveries so that customers and operators can follow delivery
progress.

**Acceptance criteria** - Drivers can view their assigned deliveries. -
Drivers can update permitted statuses, such as Picked Up, Out for
Delivery, and Delivered. - Only authorized drivers can update their
assigned deliveries. - Updates are saved by the backend and shown to the
customer. - Failed updates can be retried without creating conflicting
status records.

### Epic F --- Additional Customer and Business Features

#### US-16 --- Apply a discount code

**Backlog item:** PB-19\
**Priority:** P1\
**Story:** As a customer, I want to apply a discount code so that I can
receive eligible offers.

**Acceptance criteria** - The app validates the code with the backend. -
Valid discounts are applied according to their rules. - Invalid,
expired, or ineligible codes produce a clear explanation. - The updated
total is displayed before payment.

#### US-17 --- Save favorite beverages

**Backlog item:** PB-20\
**Priority:** P2\
**Story:** As a customer, I want to save favorite beverages so that I
can find them easily later.

**Acceptance criteria** - I can add or remove a product from
favorites. - I can view my saved products. - Unavailable products remain
identifiable and cannot be ordered until available.

#### US-18 --- Reorder a previous purchase

**Backlog item:** PB-21\
**Priority:** P2\
**Story:** As a customer, I want to reorder a previous purchase so that
I can order familiar products more quickly.

**Acceptance criteria** - I can start a new cart from a previous
order. - Current prices and stock are checked. - Unavailable products
are identified and are not silently added. - I can review and edit the
cart before checkout.

#### US-19 --- Contact customer support

**Backlog item:** PB-18\
**Priority:** P1\
**Story:** As a customer, I want to contact support about an order so
that I can resolve payment or delivery issues.

**Acceptance criteria** - I can access support options from an order. -
The order reference is available to help identify the issue. - The app
clearly indicates how the support request will be handled. - Personal
information is shared only as needed for support.

#### US-20 --- Rate a completed order

**Backlog item:** PB-22\
**Priority:** P2\
**Story:** As a customer, I want to rate a completed order or delivery
so that I can provide feedback.

**Acceptance criteria** - Only eligible completed orders can be rated. -
The customer can submit a rating and optional feedback where
supported. - The app confirms successful submission. - Duplicate ratings
are handled according to the business rules.

#### US-21 --- View business reports

**Backlog item:** PB-27\
**Priority:** P1\
**Story:** As a business owner, I want to view sales and order reports
so that I can monitor business performance.

**Acceptance criteria** - Authorized users can view agreed measures,
such as order count, sales totals, and order status totals. - Reports
can be filtered by an agreed date range. - Totals follow documented
rules for refunds, cancelled orders, discounts, and fees. - Restricted
business data is available only to authorized users.

#### US-22 --- Save multiple delivery addresses

**Backlog item:** PB-02, PB-03\
**Priority:** P1\
**Story:** As a customer, I want to save multiple delivery addresses so
that I can order to different locations.

**Acceptance criteria** - I can add, edit, and remove saved addresses. -
I can choose an address during checkout. - Each selected address is
checked against current delivery rules. - Saved addresses are private to
the customer account.

---

## 4. Non-Functional Requirements

These requirements apply across the product and should be refined into
measurable targets.

### NFR-01 --- Performance

- Product lists and order details should load promptly under normal
  supported network conditions.
- Loading indicators should be shown for operations that take
  noticeable time.
- Large catalogs should support pagination or another appropriate
  loading strategy.

### NFR-02 --- Security and access control

- Authentication and authorization must be enforced by the backend.
- Customers may access only their own private account and order
  information.
- Administrative and driver actions must require appropriate
  permissions.
- Secrets and payment credentials must not be hard-coded into the app.

### NFR-03 --- Reliability

- Repeated checkout requests must not unintentionally create duplicate
  orders or charges.
- Payment and order states must be reconciled when callbacks or
  network responses are delayed.
- Errors must be logged in a way that supports troubleshooting without
  exposing sensitive data.

### NFR-04 --- Usability and accessibility

- Forms must provide understandable validation messages.
- Screens must handle loading, empty, success, and failure states.
- Text, contrast, touch targets, and navigation should follow Android
  accessibility guidance.

### NFR-05 --- Inventory and price consistency

- The backend is the source of truth for prices, stock, fees, and
  order totals.
- Stock and prices must be revalidated when an order is submitted.
- The product must define when stock is reserved and how reservations
  expire.

### NFR-06 --- Privacy and data retention

- Collect only data needed to operate the service.
- Define retention and deletion rules for customer data and order
  records.
- Use secure transport for network communication.
- Meet applicable privacy and consumer-protection requirements.

### NFR-07 --- Observability

- Important failures, payment outcomes, and order lifecycle
  transitions should be logged.
- Monitoring should help the team identify service failures and
  degraded performance.
- Logs must not contain unnecessary payment secrets or sensitive
  personal data.

### NFR-08 --- Compatibility

- Define the minimum supported Android version and supported device
  range.
- Test key customer flows on representative devices and screen sizes.
- Handle intermittent connectivity without misleading the customer
  about order status.

---

# 5. Agile Scrum Implementation

## 5.1 Scrum product goal

**Product Goal:** Deliver a commercially usable beverage ordering
service in which customers can find eligible products, place and pay for
orders, and track delivery, while staff can manage inventory and fulfil
those orders reliably.

Scrum should be used to deliver a usable Increment in each Sprint,
gather feedback, and adapt the backlog. It should not be treated as a
one-time sequence in which every requirement is fixed before development
begins.

## 5.2 Scrum accountabilities

Scrum defines three accountabilities: Product Owner, Scrum Master, and
Developers.

### Product Owner

- Owns and communicates the Product Goal.
- Orders Product Backlog items to maximize product value.
- Clarifies business rules and acceptance expectations.
- Makes trade-offs between scope, value, risk, and timing.
- Engages stakeholders such as operations, delivery staff, and
  customers.

### Scrum Master

- Helps establish and improve effective Scrum practices.
- Facilitates Scrum events when needed.
- Helps the team identify and remove impediments.
- Supports transparency and productive collaboration.
- Does not act as a traditional task-assignment manager.

### Developers

- Include the people needed to create a usable Increment, such as
  Android development, backend development, testing, UX, and relevant
  operational or integration expertise.
- Create the Sprint Backlog and plan how work will be done.
- Maintain quality through the Definition of Done.
- Adapt their plan daily toward the Sprint Goal.
- Are accountable for creating a usable Increment each Sprint.

A person may have specialist skills, but the Scrum accountabilities
should remain clear. The Product Owner is one accountability, not a
committee.

## 5.3 Suggested Scrum team skills

For a small product, the Developers may collectively cover:

- Android development
- Backend and API development
- UI/UX design
- Automated and exploratory testing
- Payment and notification integration
- Deployment, monitoring, and security
- Product and operational domain knowledge

The exact team size depends on the product and organizational context.
Avoid splitting a small product into separate teams that cannot
independently deliver an end-to-end Increment unless there is a clear
reason.

## 5.4 Sprint length and cadence

**Suggested starting point: two-week Sprints.**

A two-week Sprint gives the team a short feedback loop while leaving
enough time to implement and test a meaningful slice. The team should
inspect whether this cadence works and adapt if needed.

Typical Sprint events:

---

Event When Purpose

---

Sprint Planning First day of the Sprint Agree why the Sprint is
valuable, what can be
done, and how the work
will be approached

Daily Scrum Each working day, 15 Inspect progress toward
minutes the Sprint Goal and
adapt the plan

Backlog refinement Regularly during the Clarify, split,
Sprint estimate, and reorder
upcoming backlog items

Sprint Review Last day of the Sprint Inspect the Increment
with stakeholders and
adapt future priorities

Sprint Retrospective After the Review, Identify improvements
before the next Sprint to quality and
effectiveness

---

The Sprint is the container for the Scrum events. Refinement is an
ongoing activity, not a separate official Scrum event.

## 5.5 Example release roadmap

This is an illustrative roadmap, not a commitment. Actual delivery
depends on team capacity, integrations, technical risks, and the size of
refined backlog items.

---

Sprint Example Sprint Goal Candidate work

---

Sprint 0 / Discovery Reduce uncertainty and Validate workflows, map
prepare a service area rules,
delivery-ready prototype key screens,
foundation investigate payment and
map providers,
establish environments
and CI

Sprint 1 Customers can explore App shell, catalog API,
the beverage catalog categories, product
list, product details,
loading and error
states

Sprint 2 Customers can prepare a Cart management,
valid cart quantity rules,
subtotal calculation,
delivery address entry,
service-area checks

Sprint 3 Customers can place an Checkout review,
order safely backend price and stock
validation, order
creation, payment
integration, order
confirmation

Sprint 4 Orders can be processed Staff order workflow,
and tracked end to end order statuses, driver
assignment, delivery
status updates,
customer tracking

Sprint 5 The MVP is ready for Security and permission
controlled pilot use checks, failure-path
tests, accessibility,
monitoring, operational
runbook, pilot feedback
and fixes

---

A "Sprint 0" is sometimes used as a planning label, but it is not a
required Scrum event or a special type of Sprint. Prefer validating key
risks early and delivering usable Increments rather than spending a long
period designing everything before development begins.

## 5.6 Sprint Planning example

**Sprint Goal:** Customers can browse beverages, see product details,
and add available products to a cart.

Candidate Sprint Backlog: - US-03 --- Browse beverages - US-04 ---
Search and filter products, if capacity allows - US-05 --- View product
details - US-06 --- Add products to and remove products from cart,
possibly split into smaller stories

Before committing to the Sprint Goal, Developers should check
dependencies, capacity, design readiness, API availability, and the
Definition of Done. The Product Owner helps explain value and desired
outcomes; Developers decide how much work they can forecast and how to
implement it.

The team should avoid selecting stories solely to fill every person's
schedule. The goal is a coherent, usable Increment.

## 5.7 Daily Scrum example

The Daily Scrum is for Developers to inspect progress toward the Sprint
Goal and adapt their plan. It is not intended as a status report to a
manager.

A useful discussion might cover: - What has changed that affects the
Sprint Goal? - Which work needs collaboration today? - Is any dependency
or blocker threatening delivery? - Should the team adjust its plan to
finish a usable Increment?

Detailed technical problem-solving can continue with the relevant people
after the event.

## 5.8 Sprint Review example

Demonstrate a working flow rather than only slides or completed tickets:

1.  Open the Android app.
2.  Browse categories and open a beverage.
3.  Add a product to the cart and change the quantity.
4.  Show how the app handles unavailable stock or a changed price.
5.  Discuss the next steps toward checkout and delivery.

Invite stakeholders who understand customers and operations. Capture
feedback, new risks, and changes to priorities in the Product Backlog.

## 5.9 Sprint Retrospective example

Inspect how the team worked during the Sprint, then agree on a small
number of actionable improvements.

Possible topics: - Were stories clear enough before development? - Did
backend and Android work integrate early enough? - Were payment,
inventory, or network failure paths tested? - Did reviews reveal
problems too late? - Was the Sprint Goal protected from unnecessary
scope changes?

Example action: "For the next Sprint, add API contract examples and test
data before Android integration begins." Give improvement actions an
owner or an explicit team agreement and inspect whether they help.

---

# 6. Product Backlog Refinement

Refinement is ongoing work to make upcoming items understandable and
appropriately sized.

For each high-priority item, the team should clarify:

1.  **User value:** What user or business problem does this solve?
2.  **Scope:** What is included and excluded?
3.  **Acceptance criteria:** What observable behavior proves it works?
4.  **Dependencies:** Does it rely on another story, service, provider,
    or decision?
5.  **Risks:** Are there unknowns involving payment, stock, maps,
    privacy, or delivery operations?
6.  **Size:** Can the item reasonably be completed within a Sprint?
7.  **Testability:** Can the team verify success and failure paths?

### Example: Split a broad story

The story "Implement checkout" is likely too broad. It could be split
into: - Display order summary and item prices. - Validate the delivery
address. - Revalidate product availability and price. - Calculate
delivery fees and final total. - Create an order with a unique
reference. - Integrate payment and handle success or failure. - Display
confirmation and recover from retry scenarios.

Stories should be split by useful behavior or risk, not simply by
technical layer. For example, "build the frontend" and "build the
backend" may each be incomplete on their own; whenever practical, create
a thin end-to-end slice.

## 6.1 Definition of Ready --- optional team checklist

Scrum does not prescribe a formal Definition of Ready. A team may use a
lightweight checklist to improve readiness, without treating it as a
gate that blocks all learning.

A backlog item is reasonably ready for Sprint Planning when: - Its user
or business value is understood. - Its scope is small enough to complete
within a Sprint. - Acceptance criteria are clear enough to test. - Known
dependencies and major risks have been discussed. - The team can
estimate it with reasonable confidence.

If an item is uncertain, consider a time-boxed technical investigation
or prototype. Record the result and refine the backlog.

## 6.2 Definition of Done

The Definition of Done is the shared quality standard for an Increment.
The following is a suggested starting point to adapt to the team's
architecture and risk level.

A story is Done when: - Its agreed acceptance criteria are met. - Code
has been reviewed according to team practice. - Relevant automated unit
and integration tests pass. - Key user flows and failure paths have been
tested. - API contracts and error handling are updated where needed. -
Security and authorization checks are completed for affected behavior. -
Accessibility and UI states have been checked for affected screens. -
Changes are integrated into the main branch and deployed to the agreed
test environment. - Relevant documentation, configuration, and
operational notes are updated. - The feature meets the team's agreed
performance and reliability standards.

"Development complete" is not the same as Done. Work that fails the
Definition of Done is not part of the usable Increment.

---

# 7. Estimation and Prioritization

## 7.1 Story points

The team may use relative story points to estimate effort, complexity,
uncertainty, and risk. A common scale is:

**1, 2, 3, 5, 8, 13**

These are not hours. Each team establishes its own reference stories and
uses estimates to support planning, not to compare individuals or
measure productivity.

Example estimates below are placeholders and should be revised by the
actual team after refinement.

---

Story Illustrative estimate Notes

---

US-03 Browse 3 Depends on catalog
beverages API and design

US-05 Product details 2 Depends on product
model and catalog

US-06 Manage cart 5 Includes quantity and
total updates

US-02 Delivery 5 May increase with
location maps and service-area
rules

US-07 Place order 8 Needs stock, pricing,
and order consistency

US-08 Payment 8 Integration and
failure recovery can
be complex

US-09 Track order 5 Depends on order
lifecycle and backend
events

US-14 Assign drivers 5 Depends on the
operational workflow

---

Do not add these estimates and treat the result as a reliable release
date. Estimate the refined work, then use observed team throughput over
several Sprints to improve forecasts.

## 7.2 Prioritization approach

The Product Owner can consider: - Customer and business value -
Operational necessity - Risk reduction and learning - Dependencies and
enabling work - Legal, security, and compliance needs - Cost of delay

The first release should prioritize a complete and reliable
ordering-to-delivery path over cosmetic or engagement features such as
favorites and ratings.

---

# 8. Dependencies and Technical Risks

---

Risk or dependency Why it matters Suggested action

---

Payment provider Determines payment Validate provider
selection flow, callbacks, capabilities early and
refunds, and supported test failed or delayed
methods payment outcomes

Delivery-area Orders must not be Define service
definition accepted for boundaries, address
unsupported locations validation, and
exception handling

Inventory source of Prevents selling Keep authoritative
truth products that are no stock on the backend
longer available and define reservation
rules

Pricing and delivery Affects customer trust Calculate final totals
fees and payment correctness on the backend and
display a clear
breakdown

Order state model Customer, operator, and Define allowed status
driver views must agree transitions and
permissions

Driver workflow Delivery assignment and Validate the process
completion must be with delivery staff
operationally realistic before finalizing the
interface

Network reliability Customers may lose Use safe retries,
connectivity during idempotency, and clear
checkout or status pending/error states
updates

Privacy and legal rules Requirements depend on Review applicable rules
operating country and before launch,
beverage type including age checks if
relevant

Third-party services Maps, push Isolate integrations,
notifications, and monitor errors, and
payment providers may define fallbacks
fail or change

---

## 8.1 Suggested order lifecycle

Agree on the order states before implementing tracking. A possible
starting model is:

`Pending Payment → Confirmed → Preparing → Ready for Pickup → Out for Delivery → Delivered`

Alternative paths may include:

- `Pending Payment → Payment Failed`
- `Confirmed → Cancelled`
- `Preparing → Cancelled`, if allowed by policy
- `Out for Delivery → Delivery Failed`, followed by a defined retry or
  return process

The actual lifecycle depends on the business. Payment status and
fulfilment status may need to be tracked separately, because a payment
can be pending or refunded while an order has its own operational
status.

---

# 9. Testing Strategy

Testing should be part of each Sprint, not postponed until the end.

### Unit testing

- Cart quantity and subtotal calculations
- Discount and delivery-fee rules
- Validation logic
- Order-status transition rules

### Integration testing

- Android app to backend APIs
- Backend to payment provider
- Inventory and order creation
- Push notification delivery
- Driver assignment and status updates

### End-to-end testing

- Browse catalog → add to cart → checkout → payment → confirmation
- Out-of-area address
- Product becoming unavailable before checkout
- Payment failure, cancellation, and retry
- Repeated checkout submission
- Driver updates status → customer sees update
- Unauthorized access to another customer's order

### Non-functional testing

- Performance on representative Android devices
- Accessibility and screen-size behavior
- Network interruption and recovery
- Authentication, authorization, and sensitive-data handling
- Monitoring and error reporting

---

# 10. Release and MVP Acceptance

The MVP should be considered ready for a controlled pilot when the
agreed end-to-end workflow works reliably.

### Customer experience

- Customers can access the catalog and view product details.
- Customers can enter an eligible delivery address.
- Customers can prepare a cart and review a clear total.
- Customers can place an order and receive an accurate confirmation.
- Customers can view order status.

### Business operations

- Staff can manage products, prices, and inventory.
- Staff can receive and process orders.
- Deliveries can be assigned and updated.
- Customers see the relevant status changes.

### Reliability and security

- Failed payments and order requests are handled without false
  confirmation.
- Duplicate orders and charges are prevented through appropriate
  backend controls.
- Customer and staff permissions are enforced.
- Monitoring and support procedures are available.
- Critical end-to-end tests pass.

### Operational readiness

- Delivery areas, operating hours, fees, and cancellation rules are
  configured.
- Staff know how to process exceptions.
- Support contacts and escalation procedures are documented.
- A rollback or incident-response plan exists for the pilot.

A pilot should be used to gather feedback and verify actual operational
assumptions before a wider rollout.

---

# 11. Scrum Artifacts and Transparency

Scrum has three core artifacts, each with a commitment.

---

Scrum artifact Application to this Commitment
product

---

Product Backlog Ordered list of product Product Goal
improvements, stories,
defects, and technical
work

Sprint Backlog Sprint Goal, selected Sprint Goal
Product Backlog items,
and actionable plan

Increment Integrated, usable Definition of Done
product work that meets
the Definition of Done

---

Maintain transparency by keeping backlog status, acceptance criteria,
test results, and release readiness visible to the people who need them.
A task board can help coordinate work, but moving a card to "Done" does
not replace the Definition of Done.

## 11.1 Example board columns

A simple team board could use:

- Product Backlog
- Ready for Sprint
- In Progress
- In Review
- Testing
- Done

These are optional workflow columns, not prescribed Scrum states. Keep
the workflow lightweight and make blocked work visible.

---

# 12. Example First-Sprint Working Agreement

The team can adapt the following agreements after its first
Retrospective:

1.  Every Sprint has one clear Sprint Goal.
2.  Stories have testable acceptance criteria before implementation
    where practical.
3.  Developers collaborate across Android, backend, and testing to
    create integrated functionality.
4.  High-risk integrations are investigated early rather than left until
    the release deadline.
5.  Code is reviewed and tests are run before work is considered Done.
6.  Blockers and risks are raised early.
7.  The Daily Scrum is used to adapt the plan, not as an individual
    status report.
8.  Sprint Review feedback is captured in the Product Backlog.
9.  The Retrospective results in specific improvement actions.
10. The team uses its own observed delivery history to forecast future
    work.

---

# 13. Suggested Next Steps

1.  **Confirm business rules:** delivery locations, hours, fees, minimum
    order value, cancellations, returns, and beverage restrictions.
2.  **Map the end-to-end journey:** customer, payment provider, order
    operator, inventory, driver, and delivery completion.
3.  **Validate technical risks:** payment integration, address
    validation, inventory consistency, and order status synchronization.
4.  **Refine the top backlog items:** split large stories, add
    acceptance criteria, identify dependencies, and estimate
    collaboratively.
5.  **Agree on quality standards:** Definition of Done, testing
    expectations, security requirements, and deployment process.
6.  **Start with a thin end-to-end slice:** deliver a small but real
    piece of the customer-to-fulfilment workflow, then expand it through
    feedback.
7.  **Inspect and adapt each Sprint:** use stakeholder feedback,
    operational data, and Retrospective actions to update the plan.

---

## Appendix A --- Backlog Summary

ID User story / capability Priority

---

US-01 Register and sign in P0
US-02 Set delivery location and check availability P0
US-03 Browse beverages P0
US-04 Search and filter products P0
US-05 View product details and availability P0
US-06 Manage cart and quantities P0
US-07 Review and place order P0
US-08 Pay securely P0
US-09 Track order status P0
US-10 Receive order notifications P1
US-11 View previous orders P1
US-12 Manage product catalog and inventory P0
US-13 Process incoming orders P0
US-14 Assign delivery drivers P0
US-15 Update delivery progress P0
US-16 Apply discount code P1
US-17 Save favorite beverages P2
US-18 Reorder a previous purchase P2
US-19 Contact support P1
US-20 Rate a completed order P2
US-21 View sales reports P1
US-22 Save multiple delivery addresses P1

## Appendix B --- Glossary

- **Acceptance criteria:** Conditions that describe the expected
  behavior of a backlog item.
- **Backlog refinement:** Ongoing work to clarify, split, estimate,
  and order Product Backlog items.
- **Definition of Done:** Shared quality standard an Increment must
  meet to be considered usable.
- **Increment:** Integrated product work that meets the Definition of
  Done.
- **MVP:** Minimum Viable Product; the smallest product scope that can
  test core value in real use.
- **Product Backlog:** Ordered, evolving list of work needed to
  improve the product.
- **Product Goal:** The longer-term objective for the product.
- **Product Owner:** Scrum accountability responsible for maximizing
  product value and managing Product Backlog ordering.
- **Scrum Master:** Scrum accountability responsible for helping
  establish Scrum and improving its effectiveness.
- **Sprint:** A fixed-length period of one month or less in which a
  usable Increment is created.
- **Sprint Backlog:** Sprint Goal, selected Product Backlog items, and
  the plan for delivering them.
- **Sprint Goal:** The single objective for the Sprint.
- **Story points:** A relative estimation approach some teams use to
  discuss size, complexity, and uncertainty.

---

**Document note:** This is a planning baseline, not a substitute for
stakeholder validation, technical design, legal review, or
payment-provider requirements. The Scrum approach should remain
empirical: make work and outcomes visible, inspect the result, and adapt
based on evidence.
