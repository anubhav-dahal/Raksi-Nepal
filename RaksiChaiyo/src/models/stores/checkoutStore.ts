import { create } from 'zustand';
import type { CartItem } from '../types';

type CheckoutState = {
  /** Set by "Buy now": checkout this one item and leave the cart untouched. */
  buyNowItem: CartItem | null;
  startBuyNow: (item: CartItem) => void;
  startCartCheckout: () => void;
};

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  buyNowItem: null,
  startBuyNow: (item) => set({ buyNowItem: item }),
  startCartCheckout: () => set({ buyNowItem: null }),
}));
