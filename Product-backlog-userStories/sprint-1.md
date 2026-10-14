# Nepalgunj Delivery Platform: Product Backlog & Scrum Plan

**Platform:** Android-First Customer App • Dedicated Rider App • Web Administration  
**Market:** Nepalgunj, Nepal (English/Nepali Bilingual, NPR Currency)  
**Tech Stack:** React Native + Expo + TypeScript, Node.js/Express + TypeScript backend, PostgreSQL + Prisma  
**Version:** 1.0  
**Date:** 14 October 2026

---

## 1. Product Vision & Marketplace Standards
Inspired by modern European marketplace standards, the platform prioritizes transparency, strict backend stock validation, zero-blind-confirmation rules, and a frictionless mobile experience.
* **Core Goal:** Enable customers in Nepalgunj to seamlessly discover, order, pay for, and track snack and beverage deliveries, while giving the business reliable inventory, order management, and rider coordination tools.
* **Release Strategy:** Lean MVP approach. We build the core end-to-end loop first (Catalog -> Cart -> Validated Checkout -> Admin Confirmation -> Rider Assignment -> Delivery).

---

## 2. Harmonized Product Backlog

| Epic | ID | Title | Priority | Target Release |
| :--- | :--- | :--- | :--- | :--- |
| **Foundation** | FND-01 | Repository setup, branch protection, and CI checks | P0 | Sprint 1 |
| **Foundation** | FND-02 | Environment configuration & secure credential separation | P0 | Sprint 1 |
| **Foundation** | FND-03 | Database backup, restore policies, and audit logging | P0 | Sprint 2 |
| **Accounts & Access** | ACC-01 | Customer guest checkout & registration flows | P0 | Sprint 2 |
| **Accounts & Access** | ACC-02 | Staff roles, permissions, and privileged-role 2FA | P0 | Sprint 2 |
| **Catalogue & Search** | CAT-01 | Categories, subcategories, and bilingual UI support (EN/NE) | P0 | Sprint 1 |
| **Catalogue & Search** | CAT-02 | Product and variant management (SKU, price, stock) | P0 | Sprint 1 |
| **Catalogue & Search** | CAT-03 | Product images, search filters, and curated sections | P0 | Sprint 2 |
| **Inventory** | INV-01 | Stock adjustments, restock audits, and availability display | P0 | Sprint 2 |
| **Inventory** | INV-02 | Atomic stock reservation and timeout expiry rules | P0 | Sprint 3 |
| **Checkout & Delivery** | CHK-01 | Service area validation, delivery fees, and minimum order rules | P0 | Sprint 3 |
| **Checkout & Delivery** | CHK-02 | Cart management (quantities, subtotal, fee calculation) | P0 | Sprint 3 |
| **Checkout & Delivery** | CHK-03 | Server-side revalidation, order submission, and admin confirmation | P0 | Sprint 3 |
| **Orders & Rider** | ORD-01 | Order status lifecycle, customer tracking page, and push updates | P0 | Sprint 4 |
| **Orders & Rider** | ORD-02 | Dedicated rider mobile app & manual order assignment | P0 | Sprint 4 |
| **Payments & Finance** | PAY-01 | Cash-on-delivery tracking and eSewa payment integration | P0 | Sprint 4 |
| **Payments & Finance** | PAY-02 | Refund tracking and financial summary reporting | P1 | Sprint 5 |
| **Promotions** | PRO-01 | Coupon codes, campaign rules, and influencer tracking | P1 | Sprint 5 |
| **Enhancements** | ENH-01 | Favourites and reordering previous purchases | P2 | Future |

---

## 3. Sprint 1: Foundation & Catalogue Core

**Sprint Goal:** Establish the technical environments, repository structure, database schema, backend API framework, and the foundational Android UI for browsing categories and products in English and Nepali.

### Sprint 1 Task Breakdown & Balanced Workload Distribution

| Task ID | Epic / Story | Task Description | Assigned Owner | Estimated Effort |
| :--- | :--- | :--- | :--- | :--- |
| **TSK-101** | `FND-01` | Initialize GitHub repository, branch protection rules (`main`), PR templates, and `.gitignore`. | **Developer A** | Low |
| **TSK-102** | `FND-02` | Set up environment configuration templates (`.env.example`) for Dev, Staging, and Production. | **Developer A** | Low |
| **TSK-103** | Setup | Initialize Express + TypeScript backend scaffold, integrating PostgreSQL and Prisma ORM. | **Developer A** | Medium |
| **TSK-104** | Setup | Initialize React Native (Expo + TypeScript) mobile app shell, navigation structure, and asset folders. | **Developer B** | Medium |
| **TSK-105** | `CAT-01/02`| Design and execute initial database migration for Categories, Products, and Variants (SKU, price, stock). | **Developer A** | Medium |
| **TSK-106** | `CAT-01/02`| Build REST API endpoints for fetching categories and product listings (secured admin CRUD stubs). | **Developer A** | Medium |
| **TSK-107** | `CAT-01` | Implement Customer App Home & Catalogue Screen with localization setup (English / Nepali switching). | **Developer B** | High |
| **TSK-108** | `CAT-02` | Implement Product Details view in the mobile app with variant selector components. | **Developer B** | Medium |
| **TSK-109** | `FND-01` | Configure GitHub Actions CI pipeline to run automated linting, type-checking, and build verification on PRs. | **Developer A** | Medium |
| **TSK-110** | Review | Conduct joint code review, test API-to-app communication, and verify Sprint 1 against the Definition of Done. | **Both** | Low |

---

## 4. Definition of Done (DoD)
* Code compiles cleanly with zero TypeScript or linter errors.
* Pull requests are reviewed and merged via GitHub following branch rules.
* Database schema successfully migrates locally and in test environments.
* Mobile app successfully fetches and renders category/product lists from the local backend API in both English and Nepali.