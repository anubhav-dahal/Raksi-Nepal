import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as cart from '../cart';
import type { CartItem } from '../types';

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  setQuantity: (sku: string, quantity: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
};

// Saved on the device so the cart survives an app restart.
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) => set((s) => ({ items: cart.addItem(s.items, item) })),
      setQuantity: (sku, quantity) => set((s) => ({ items: cart.setQuantity(s.items, sku, quantity) })),
      remove: (sku) => set((s) => ({ items: cart.removeItem(s.items, sku) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'raksi-cart', version: 1, storage: createJSONStorage(() => AsyncStorage) }
  )
);
