import { router } from 'expo-router';
import { fetchMyOrders, fetchOrder } from '../models/api/orders';
import { handleAuthError, useAuthStore } from '../models/stores/authStore';
import { useAsync } from './useAsync';

const withAuth = async <T>(fn: (token: string) => Promise<T>): Promise<T> => {
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
