// Pure cart rules (no React, no storage) so they can be unit tested.
// Tests: src/models/cart.test.ts  ->  npm run test

import type { CartItem } from './types';

export const MIN_QUANTITY = 1;

export const clampQuantity = (quantity: number, max: number): number => {
  if (max < MIN_QUANTITY) return 0;
  return Math.min(Math.max(Math.floor(quantity), MIN_QUANTITY), max);
};

/** Adds an item; the same SKU merges into one line, capped at stock. */
export const addItem = (items: CartItem[], item: CartItem): CartItem[] => {
  if (item.maxQuantity < MIN_QUANTITY) return items;

  const existing = items.find((i) => i.sku === item.sku);
  if (!existing) {
    return [...items, { ...item, quantity: clampQuantity(item.quantity, item.maxQuantity) }];
  }

  return items.map((i) =>
    i.sku === item.sku
      ? {
          ...i,
          ...item,
          quantity: clampQuantity(i.quantity + item.quantity, item.maxQuantity),
        }
      : i
  );
};

export const setQuantity = (items: CartItem[], sku: string, quantity: number): CartItem[] =>
  items.map((i) => (i.sku === sku ? { ...i, quantity: clampQuantity(quantity, i.maxQuantity) } : i));

export const removeItem = (items: CartItem[], sku: string): CartItem[] =>
  items.filter((i) => i.sku !== sku);

export const lineTotal = (item: CartItem): number => item.price * item.quantity;

export const subtotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + lineTotal(item), 0);

export const itemCount = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.quantity, 0);
