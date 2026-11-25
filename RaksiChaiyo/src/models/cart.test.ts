/// <reference types="node" />
// Runs under Node (npm test), not in the app.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addItem, clampQuantity, itemCount, removeItem, setQuantity, subtotal } from './cart.ts';
import type { CartItem } from './types.ts';

const beer: CartItem = {
  productId: 'p1',
  sku: 'BEER-650',
  name: 'Gorkha Premium',
  label: '650 ml bottle',
  image: '',
  price: 340,
  quantity: 1,
  maxQuantity: 5,
};
const chips: CartItem = { ...beer, productId: 'p2', sku: 'CHIPS-120', name: 'Lays', price: 145, maxQuantity: 10 };

test('clampQuantity keeps 1..max', () => {
  assert.equal(clampQuantity(0, 5), 1);
  assert.equal(clampQuantity(-3, 5), 1);
  assert.equal(clampQuantity(9, 5), 5);
  assert.equal(clampQuantity(2.7, 5), 2);
  assert.equal(clampQuantity(3, 0), 0, 'nothing in stock');
});

test('addItem merges the same SKU and caps at stock', () => {
  let items = addItem([], { ...beer, quantity: 2 });
  items = addItem(items, { ...beer, quantity: 2 });
  assert.equal(items.length, 1);
  assert.equal(items[0].quantity, 4);
  items = addItem(items, { ...beer, quantity: 10 });
  assert.equal(items[0].quantity, 5);
});

test('addItem ignores out-of-stock items', () => {
  assert.deepEqual(addItem([], { ...beer, maxQuantity: 0 }), []);
});

test('setQuantity clamps, removeItem removes', () => {
  let items = addItem(addItem([], beer), chips);
  items = setQuantity(items, 'BEER-650', 99);
  assert.equal(items[0].quantity, 5);
  items = setQuantity(items, 'BEER-650', 0);
  assert.equal(items[0].quantity, 1);
  items = removeItem(items, 'BEER-650');
  assert.deepEqual(items.map((i) => i.sku), ['CHIPS-120']);
});

test('subtotal and itemCount', () => {
  const items = addItem(addItem([], { ...beer, quantity: 3 }), { ...chips, quantity: 2 });
  assert.equal(subtotal(items), 3 * 340 + 2 * 145);
  assert.equal(itemCount(items), 5);
  assert.equal(subtotal([]), 0);
});
