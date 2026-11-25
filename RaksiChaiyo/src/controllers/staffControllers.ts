import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Linking, Platform } from 'react-native';
import { useT } from '../i18n';
import { fetchOrder } from '../models/api/orders';
import * as staff from '../models/api/staff';
import { useAuthStore } from '../models/stores/authStore';
import { toast } from '../models/stores/toastStore';
import type { OrderStatus, Role, StaffOrder } from '../models/types';
import { localize } from '../utils/format';
import { isValidPhone, normalizePhone } from '../utils/phone';
import { errorMessage } from './errors';
import { withAuth } from './orderControllers';
import { useAsync } from './useAsync';

/** Reloads every `ms` while the screen is open, and when coming back to it. */
const useLiveReload = (reload: () => Promise<void>, ms = 20_000) => {
  useFocusEffect(
    useCallback(() => {
      reload();
      const timer = setInterval(reload, ms);
      return () => clearInterval(timer);
    }, [reload, ms])
  );
};

/** Runs an action with a busy flag and a toast on error. */
const useAction = () => {
  const t = useT();
  const [busy, setBusy] = useState<string | null>(null);
  const run = async (key: string, action: () => Promise<unknown>, success?: string) => {
    setBusy(key);
    try {
      await action();
      if (success) toast(success);
      return true;
    } catch (e) {
      toast(errorMessage(e, t), 'error');
      return false;
    } finally {
      setBusy(null);
    }
  };
  return { busy, run };
};

export const useRole = (): Role | null => useAuthStore((s) => s.user?.role ?? null);

// ---- Admin: dashboard + order queue ------------------------------------------

export const useAdminDashboard = () => {
  const [filter, setFilter] = useState<staff.OrderFilter>('active');
  const summary = useAsync(() => withAuth(staff.fetchSummary), []);
  const orders = useAsync(() => withAuth((token) => staff.fetchAdminOrders(token, filter)), [filter]);

  const reloadAll = useCallback(async () => {
    await Promise.all([summary.reload(), orders.reload()]);
  }, [summary.reload, orders.reload]); // eslint-disable-line react-hooks/exhaustive-deps
  useLiveReload(reloadAll);

  return {
    summary,
    orders,
    filter,
    setFilter,
    reloadAll,
    openOrder: (id: string) => router.push({ pathname: '/admin/order/[id]', params: { id } }),
    openProducts: () => router.push('/admin/products'),
    openStaff: () => router.push('/admin/staff'),
  };
};

// What the admin's main button does next for each status.
const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

// ---- Admin: one order ----------------------------------------------------------

export const useAdminOrder = (id: string) => {
  const t = useT();
  const order = useAsync(() => withAuth((token) => fetchOrder(token, id)), [id]);
  const riders = useAsync(() => withAuth(staff.fetchRiders), []);
  const { busy, run } = useAction();
  useLiveReload(order.reload);

  const o = order.data;
  const next = o ? NEXT[o.status] : undefined;
  const waitingForEsewa = !!o && o.payment.method === 'esewa' && o.payment.status !== 'paid';
  const needsRider = next === 'out_for_delivery' && !o?.rider;

  const setStatus = (status: OrderStatus) =>
    run(status, () => withAuth((token) => staff.setOrderStatus(token, id, status)), t('admin.updated')).then(() =>
      order.reload()
    );

  return {
    order,
    riders,
    busy,
    next,
    // The main action is blocked until payment / rider rules are met (the server checks too).
    nextBlockedReason:
      next === 'confirmed' && waitingForEsewa ? t('admin.waitingPayment') : needsRider ? t('admin.needsRider') : null,
    canAssign: !!o && (o.status === 'confirmed' || o.status === 'preparing'),
    canCancel: !!o && ['pending', 'confirmed', 'preparing'].includes(o.status),
    advance: () => next && setStatus(next),
    cancel: () => setStatus('cancelled'),
    assign: (riderId: string) =>
      run('assign', () => withAuth((token) => staff.assignRider(token, id, riderId)), t('admin.riderAssigned')).then(() =>
        Promise.all([order.reload(), riders.reload()])
      ),
    callCustomer: () => o && Linking.openURL(`tel:${o.address.phone}`),
  };
};

// ---- Admin: products, prices, stock -----------------------------------------------

export const useAdminProducts = () => {
  const products = useAsync(() => withAuth(staff.fetchAdminProducts), []);
  const [query, setQuery] = useState('');
  useLiveReload(products.reload, 60_000);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.data ?? [];
    return q
      ? list.filter(
          (p) => localize(p.name).toLowerCase().includes(q) || p.variants.some((v) => v.sku.toLowerCase().includes(q))
        )
      : list;
  }, [products.data, query]);

  return {
    products,
    filtered,
    query,
    setQuery,
    openProduct: (id: string) => router.push({ pathname: '/admin/product/[id]', params: { id } }),
  };
};

export const useAdminProduct = (id: string) => {
  const t = useT();
  const products = useAsync(() => withAuth(staff.fetchAdminProducts), []);
  const movements = useAsync(() => withAuth((token) => staff.fetchStockMovements(token, id)), [id]);
  const { busy, run } = useAction();
  const product = products.data?.find((p) => p.id === id);

  const refresh = () => Promise.all([products.reload(), movements.reload()]);

  return {
    product,
    products,
    movements,
    busy,
    savePrice: (sku: string, price: number) =>
      run(`price-${sku}`, () => withAuth((token) => staff.updatePrice(token, id, sku, price)), t('admin.priceSaved')).then(refresh),
    adjustStock: (sku: string, delta: number, reason: 'restock' | 'adjustment' | 'damaged', note: string) =>
      run(`stock-${sku}`, () => withAuth((token) => staff.adjustStock(token, id, sku, { delta, reason, note })), t('admin.stockSaved')).then(
        async (ok) => {
          await refresh();
          return ok;
        }
      ),
    toggleActive: () =>
      product &&
      run('active', () => withAuth((token) => staff.updateProduct(token, id, { isActive: !product.isActive })), t('admin.updated')).then(
        refresh
      ),
  };
};

// ---- Admin: staff roles -----------------------------------------------------------

export const useStaffRoles = () => {
  const t = useT();
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('rider');
  const { busy, run } = useAction();
  const riders = useAsync(() => withAuth(staff.fetchRiders), []);

  return {
    phone,
    setPhone,
    role,
    setRole,
    busy,
    riders,
    canSubmit: isValidPhone(phone),
    submit: async () => {
      const ok = await run('role', () => withAuth((token) => staff.setStaffRole(token, normalizePhone(phone), role)), t('admin.roleSaved'));
      if (ok) {
        setPhone('');
        riders.reload();
      }
    },
  };
};

// ---- Rider ------------------------------------------------------------------------

export const useRiderDeliveries = () => {
  const t = useT();
  const deliveries = useAsync(() => withAuth(staff.fetchDeliveries), []);
  const { busy, run } = useAction();
  useLiveReload(deliveries.reload, 30_000);

  const move = (order: StaffOrder, status: 'out_for_delivery' | 'delivered') =>
    run(`${order.id}-${status}`, () => withAuth((token) => staff.setDeliveryStatus(token, order.id, status)), t(
      status === 'delivered' ? 'rider.deliveredToast' : 'rider.pickedUpToast'
    )).then(() => deliveries.reload());

  const list = deliveries.data ?? [];
  return {
    deliveries,
    toDeliver: list.filter((o) => o.status !== 'delivered'),
    deliveredToday: list.filter((o) => o.status === 'delivered'),
    busy,
    pickUp: (order: StaffOrder) => move(order, 'out_for_delivery'),
    deliver: (order: StaffOrder) => move(order, 'delivered'),
    call: (order: StaffOrder) => Linking.openURL(`tel:${order.address.phone}`),
    openMap: (order: StaffOrder) => {
      const q = encodeURIComponent(`${order.address.address}, Nepalgunj`);
      Linking.openURL(Platform.OS === 'ios' ? `http://maps.apple.com/?q=${q}` : `geo:0,0?q=${q}`);
    },
  };
};
