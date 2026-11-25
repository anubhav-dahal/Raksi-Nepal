import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import { useT } from '../i18n';
import { cancelOrder, fetchMyOrders, fetchOrder, payOnDelivery } from '../models/api/orders';
import { handleAuthError, useAuthStore } from '../models/stores/authStore';
import { toast } from '../models/stores/toastStore';
import type { OrderStatus } from '../models/types';
import { errorMessage } from './errors';
import { payWithEsewa, type PaymentOutcome } from './paymentController';
import { useAsync } from './useAsync';

const ACTIVE: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery'];
const POLL_MS = 15_000;

/** Runs an API call with the saved token; logs out if the server rejects it. */
export const withAuth = async <T>(fn: (token: string) => Promise<T>): Promise<T> => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('Not logged in');
  try {
    return await fn(token);
  } catch (e) {
    handleAuthError(e);
    throw e;
  }
};

export const useOrderQuery = (id: string) => useAsync(() => withAuth((token) => fetchOrder(token, id)), [id]);

/**
 * Order confirmation + live status. Refreshes every 15 s while the order is
 * active and the screen is open. Payment actions for unpaid eSewa orders.
 */
export const useOrderController = (id: string, justPaid?: PaymentOutcome) => {
  const t = useT();
  const order = useOrderQuery(id);
  const [busy, setBusy] = useState<null | 'pay' | 'cod' | 'cancel'>(null);
  const [lastOutcome, setLastOutcome] = useState<PaymentOutcome | undefined>(justPaid);
  const o = order.data;
  const active = !!o && ACTIVE.includes(o.status);

  const { reload } = order;
  useFocusEffect(
    useCallback(() => {
      if (!active) return;
      const timer = setInterval(reload, POLL_MS);
      return () => clearInterval(timer);
    }, [active, reload])
  );

  const run = async (kind: 'pay' | 'cod' | 'cancel', action: () => Promise<unknown>) => {
    setBusy(kind);
    try {
      await action();
    } catch (e) {
      handleAuthError(e);
      toast(errorMessage(e, t), 'error');
    } finally {
      setBusy(null);
      await reload();
    }
  };

  const awaitingEsewa =
    !!o && o.status === 'pending' && o.payment.method === 'esewa' && o.payment.status !== 'paid';

  return {
    order,
    busy,
    lastOutcome,
    awaitingEsewa,
    canCancel: !!o && o.status === 'pending' && o.payment.status !== 'paid',
    payWithEsewa: () =>
      run('pay', async () => {
        const outcome = await payWithEsewa(id);
        setLastOutcome(outcome);
        if (outcome === 'success') toast(t('payment.success'));
      }),
    payOnDelivery: () =>
      run('cod', async () => {
        await withAuth((token) => payOnDelivery(token, id));
        setLastOutcome(undefined);
        toast(t('payment.switchedToCod'));
      }),
    cancel: () =>
      run('cancel', async () => {
        await withAuth((token) => cancelOrder(token, id));
        toast(t('order.cancelled'));
      }),
    callRider: () => o?.rider && Linking.openURL(`tel:${o.rider.phone}`),
    callShop: () => Linking.openURL(`tel:${SHOP_PHONE}`),
    goHome: () => router.dismissTo('/'),
  };
};

// "Call the shop" number on the order screen. Set EXPO_PUBLIC_SHOP_PHONE (see .env.example).
export const SHOP_PHONE = process.env.EXPO_PUBLIC_SHOP_PHONE ?? '9800000000';

/** Account: profile, my orders, logout. */
export const useAccountController = () => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const orders = useAsync(() => (token ? withAuth(fetchMyOrders) : Promise.resolve([])), [token]);

  return {
    user,
    isLoggedIn: !!token,
    orders,
    openOrder: (id: string) => router.push({ pathname: '/order/[id]', params: { id } }),
    login: () => router.push('/login'),
    register: () => router.push('/register'),
    logout: async () => {
      await logout();
      router.dismissTo('/');
    },
  };
};
