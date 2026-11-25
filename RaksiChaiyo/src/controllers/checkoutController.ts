import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '../i18n';
import { ApiError } from '../models/api/client';
import { createOrder, fetchQuote } from '../models/api/orders';
import { handleAuthError, useAuthStore } from '../models/stores/authStore';
import { useCartStore } from '../models/stores/cartStore';
import { useCheckoutStore } from '../models/stores/checkoutStore';
import { toast } from '../models/stores/toastStore';
import type { Address, Order, PaymentMethod } from '../models/types';
import { PHONE_PATTERN } from './authController';
import { errorMessage } from './errors';
import { useAsync } from './useAsync';

type AddressErrors = Partial<Record<keyof Address, string>>;

/**
 * Checkout: server-priced summary, delivery address, payment choice, place order.
 * Login is asked for only when placing the order; the cart and form are kept.
 */
export const useCheckoutController = (opts: { onPlaced?: (order: Order) => Promise<void> | void } = {}) => {
  const t = useT();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const cartItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const buyNowItem = useCheckoutStore((s) => s.buyNowItem);

  const items = useMemo(() => (buyNowItem ? [buyNowItem] : cartItems), [buyNowItem, cartItems]);
  const itemsKey = items.map((i) => `${i.sku}x${i.quantity}`).join(',');

  // Totals always come from the server, never from local maths.
  const quote = useAsync(
    () => fetchQuote(items.map(({ sku, quantity }) => ({ sku, quantity }))),
    [itemsKey]
  );

  // One key per attempt at this basket: retries after a network error reuse
  // it, so the server never creates the order twice.
  const idempotencyKey = useRef(Crypto.randomUUID());
  useEffect(() => {
    idempotencyKey.current = Crypto.randomUUID();
  }, [itemsKey]);

  const [address, setAddress] = useState<Address>({ name: '', phone: '', address: '', landmark: '', note: '' });
  const [addressErrors, setAddressErrors] = useState<AddressErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [placing, setPlacing] = useState(false);

  // Pre-fill from the last order, or at least the account's name and phone.
  useEffect(() => {
    if (!user) return;
    setAddress((a) =>
      a.name || a.address
        ? a
        : { ...a, ...(user.lastAddress ?? {}), name: user.lastAddress?.name ?? user.name, phone: user.lastAddress?.phone ?? user.phone }
    );
  }, [user]);

  const updateAddress = (field: keyof Address, value: string) => {
    setAddress((a) => ({ ...a, [field]: value }));
    setAddressErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validateAddress = () => {
    const errors: AddressErrors = {};
    if (address.name.trim().length < 2) errors.name = t('checkout.nameRequired');
    if (!PHONE_PATTERN.test(address.phone.trim())) errors.phone = t('auth.phoneInvalid');
    if (address.address.trim().length < 5) errors.address = t('checkout.addressRequired');
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const placeOrder = async () => {
    if (!token) {
      router.push('/login');
      return;
    }
    if (!quote.data || quote.data.problems.length || !validateAddress()) return;

    setPlacing(true);
    try {
      const order = await createOrder(token, idempotencyKey.current, {
        items: items.map(({ sku, quantity }) => ({ sku, quantity })),
        address: {
          name: address.name.trim(),
          phone: address.phone.trim(),
          address: address.address.trim(),
          landmark: address.landmark?.trim() ?? '',
          note: address.note?.trim() ?? '',
        },
        paymentMethod,
        expectedTotal: quote.data.total,
      });

      if (buyNowItem) useCheckoutStore.getState().startCartCheckout();
      else clearCart();

      if (opts.onPlaced) await opts.onPlaced(order);
      else router.replace({ pathname: '/order/[id]', params: { id: order.id } });
    } catch (e) {
      handleAuthError(e);
      if (e instanceof ApiError && (e.code === 'PRICE_CHANGED' || e.code === 'CONFLICT')) {
        toast(e.message, 'error');
        idempotencyKey.current = Crypto.randomUUID();
        quote.reload();
      } else {
        toast(errorMessage(e, t), 'error');
      }
    } finally {
      setPlacing(false);
    }
  };

  const problems = quote.data?.problems ?? [];

  return {
    items,
    quote,
    problems,
    isLoggedIn: !!token,
    user,
    address,
    addressErrors,
    updateAddress,
    paymentMethod,
    setPaymentMethod,
    placing,
    canPlace: !!quote.data && problems.length === 0 && items.length > 0 && !placing,
    placeOrder,
    login: () => router.push('/login'),
  };
};
