import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useT } from '../i18n';
import { clampQuantity } from '../models/cart';
import { useCartStore } from '../models/stores/cartStore';
import { useCheckoutStore } from '../models/stores/checkoutStore';
import { toast } from '../models/stores/toastStore';
import type { CartItem, Product } from '../models/types';
import { localize } from '../utils/format';
import { useProductQuery } from './catalogueControllers';

/** Product detail: variant choice, quantity (1..stock), Add to cart, Buy now. */
export const useProductController = (id: string) => {
  const t = useT();
  const product = useProductQuery(id);
  const addToCart = useCartStore((s) => s.add);
  const inCart = useCartStore((s) => s.items);
  const startBuyNow = useCheckoutStore((s) => s.startBuyNow);

  const [sku, setSku] = useState<string>();
  const [quantity, setQuantity] = useState(1);

  // Default to the first variant that is in stock.
  useEffect(() => {
    const variants = product.data?.variants ?? [];
    setSku((variants.find((v) => v.stock > 0) ?? variants[0])?.sku);
  }, [product.data]);

  const variant = useMemo(
    () => product.data?.variants.find((v) => v.sku === sku),
    [product.data, sku]
  );

  // Stock still available after what is already in the cart.
  const alreadyInCart = inCart.find((i) => i.sku === sku)?.quantity ?? 0;
  const available = Math.max((variant?.stock ?? 0) - alreadyInCart, 0);

  useEffect(() => {
    setQuantity((q) => clampQuantity(q, Math.max(available, 1)));
  }, [available]);

  const toCartItem = (p: Product): CartItem | null =>
    variant
      ? {
          productId: p.id,
          sku: variant.sku,
          name: localize(p.name),
          label: variant.label,
          image: p.image,
          price: variant.price,
          quantity,
          maxQuantity: variant.stock,
        }
      : null;

  const onAddToCart = () => {
    const item = product.data && toCartItem(product.data);
    if (!item) return;
    if (available < 1) {
      toast(t('product.maxReached', { count: variant?.stock ?? 0 }), 'error');
      return;
    }
    addToCart(item);
    toast(t('product.added', { name: item.name }));
  };

  const onBuyNow = () => {
    const item = product.data && toCartItem(product.data);
    if (!item || !variant || variant.stock < 1) return;
    startBuyNow({ ...item, quantity: clampQuantity(quantity, variant.stock) });
    router.push('/checkout');
  };

  return {
    product,
    variant,
    selectVariant: (next: string) => {
      setSku(next);
      setQuantity(1);
    },
    quantity,
    setQuantity,
    maxQuantity: Math.max(available, 1),
    canBuy: (variant?.stock ?? 0) > 0,
    canAdd: available > 0,
    onAddToCart,
    onBuyNow,
  };
};
