import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Phones: Keychain / Keystore via expo-secure-store.
// Web preview (npx expo start --web): secure store doesn't exist there, so use localStorage.
const web = Platform.OS === 'web';

export const tokenStorage = {
  get: async (key: string): Promise<string | null> =>
    web ? globalThis.localStorage?.getItem(key) ?? null : SecureStore.getItemAsync(key),
  set: async (key: string, value: string): Promise<void> =>
    web ? globalThis.localStorage?.setItem(key, value) : SecureStore.setItemAsync(key, value),
  remove: async (key: string): Promise<void> =>
    web ? globalThis.localStorage?.removeItem(key) : SecureStore.deleteItemAsync(key),
};
