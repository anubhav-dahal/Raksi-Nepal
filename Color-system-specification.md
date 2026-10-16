# 🎨 Color System & Design Tokens Specification

**Project:** Midnight Navy & Teal Mobile App  
**Version:** 1.0.0  
**Status:** Finalized

## 1. Overview & Philosophy
This document defines the color palette, semantic roles, and usage rules for the application. To maintain consistency, never use raw hex codes directly in component styles. Always reference the corresponding CSS variables (tokens).

*   **Dark Theme (Default):** Immersive Midnight Navy (`#0b132b`) paired with vibrant Teal (`#21b8a6`) for high-contrast visibility and a modern fintech/e-commerce feel.
*   **Light Theme:** Crisp off-white surfaces (`#f7f9fa`) paired with a deeper, professional forest/teal shade (`#087f73`) for daylight legibility.

## 2. Core Palette Tokens

| Token Name | Hex / Value (Dark) | Hex / Value (Light) | Visual Role |
| :--- | :--- | :--- | :--- |
| `--bg` | `#0b132b` (Midnight Navy) | `#f7f9fa` (Off-White) | App canvas / background screen base. |
| `--card` | `#1c2541` (Deep Slate Navy) | `#ffffff` (Pure White) | Containers, cards, modals, and navigation bars. |
| `--card-2` | `#233055` (Elevated Navy) | `#edf3f3` (Light Gray-Teal) | Secondary elements, table rows, button backgrounds. |
| `--text` | `#f8f9fa` (Bright White) | `#18252d` (Dark Charcoal) | Primary headings, titles, and high-emphasis text. |
| `--muted` | `#8d99ae` (Slate Gray) | `#687981` (Muted Teal-Gray) | Subtitles, helper text, and inactive states. |
| `--accent` | `#21b8a6` (Vibrant Teal) | `#087f73` (Deep Teal) | Primary actions, buttons, active icons, price tags. |
| `--accent-dark` | `#087f73` | `#06695f` | Pressed states, dark hover variants. |
| `--border` | `rgba(255, 255, 255, 0.08)` | `rgba(24, 37, 45, 0.09)` | Dividers, structural borders, and card outlines. |
| `--shadow` | `0 18px 46px rgba(0, 0, 0, 0.35)` | `0 16px 42px rgba(18, 54, 58, 0.1)`| Elevation and depth for cards and floating sheets. |

## 3. Semantic & Functional Colors
These colors convey specific statuses and feedback across the application regardless of the current theme:

| Role | Color Token / Value | Use Case |
| :--- | :--- | :--- |
| **Success / In-Stock** | `#2ec4b6` | Confirmation checkmarks, success toast notifications, in-stock badges. |
| **Warning / Low Stock** | `#ff8800` | Low stock warnings, pending alerts, cautionary highlights. |
| **Error / Destructive** | `#e63946` | Form validation errors, delete actions, critical failure states. |

## 4. Usage Rules & Guidelines

### Rule 1: Always Use CSS Variables
When writing CSS, Tailwind classes, or inline styles, always bind to the semantic variable.
*   ✅ **Do this:** `background-color: var(--card); color: var(--text);`
*   ❌ **Don't do this:** `background-color: #1c2541; color: #f8f9fa;` *(Hardcoding breaks theme switching)*.

### Rule 2: Interactive States
*   **Buttons (`--accent`):** Main CTA buttons must use `--accent` as their background with white text. On active/pressed states, use `--accent-dark`.
*   **Borders & Focus Rings:** Input fields and interactive components must use `var(--border)` for standard outlines and `var(--accent)` for `:focus-visible` outlines.

### Rule 3: Transparency & Overlays
When creating gradients or translucent backdrops (like glassmorphism or modal backdrops), use `color-mix()` with the base tokens rather than arbitrary hex opacity:
*   **Example:** `background: color-mix(in srgb, var(--accent) 13%, transparent);`
```eof
