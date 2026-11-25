import { tokenStorage } from './tokenStorage';
import { create } from 'zustand';
import * as authApi from '../api/auth';
import { ApiError } from '../api/client';
import type { User } from '../types';

const TOKEN_KEY = 'raksi-token';

type AuthState = {
  token: string | null;
  user: User | null;
  /** False until the saved token has been checked on startup. */
  hydrated: boolean;
  hydrate: () => Promise<void>;
  login: (phone: string, password: string) => Promise<User>;
  register: (input: { name: string; phone: string; email?: string; password: string }) => Promise<User>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

// The token lives in the phone's secure storage (Keychain / Keystore), not AsyncStorage.
export const useAuthStore = create<AuthState>()((set, get) => {
  const signIn = async ({ token, user }: { token: string; user: User }) => {
    await tokenStorage.set(TOKEN_KEY, token);
    set({ token, user });
    return user;
  };

  return {
    token: null,
    user: null,
    hydrated: false,

    hydrate: async () => {
      const token = await tokenStorage.get(TOKEN_KEY).catch(() => null);
      if (!token) return set({ hydrated: true });
      try {
        const user = await authApi.fetchMe(token);
        set({ token, user, hydrated: true });
      } catch (e) {
        // Expired or revoked: forget it. Offline: keep the token and try later.
        if (e instanceof ApiError && e.status === 401) {
          await tokenStorage.remove(TOKEN_KEY).catch(() => {});
          set({ hydrated: true });
        } else {
          set({ token, hydrated: true });
        }
      }
    },

    login: async (phone, password) => signIn(await authApi.login(phone, password)),
    register: async (input) => signIn(await authApi.register(input)),

    refreshUser: async () => {
      const { token } = get();
      if (token) set({ user: await authApi.fetchMe(token) });
    },

    logout: async () => {
      await tokenStorage.remove(TOKEN_KEY).catch(() => {});
      set({ token: null, user: null });
    },
  };
});

/** Logs out when the server says the session is no longer valid. */
export const handleAuthError = (error: unknown) => {
  if (error instanceof ApiError && error.status === 401) useAuthStore.getState().logout();
};
