import { router } from 'expo-router';
import { itemCount, subtotal } from '../models/cart';
import { useCartStore } from '../models/stores/cartStore';
import { useCheckoutStore } from '../models/stores/checkoutStore';

export const useCartCount = () => useCartStore((s) => itemCount(s.items));

export const useCartController = () => {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const startCartCheckout = useCheckoutStore((s) => s.startCartCheckout);

  return {
    items,
    subtotal: subtotal(items),
    count: itemCount(items),
    setQuantity,
    remove,
    browse: () => router.dismissTo('/'),
    checkout: () => {
      startCartCheckout();
      router.push('/checkout');
    },
  };
};
