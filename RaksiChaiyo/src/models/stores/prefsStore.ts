import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Language = 'en' | 'ne';
/** Dark is the designed default (prototype). "system" follows the phone. */
export type ThemePref = 'dark' | 'light' | 'system';

type PrefsState = {
  /** The user confirmed they are 18+ (asked before alcohol categories). */
  ageConfirmed: boolean;
  language: Language;
  theme: ThemePref;
  confirmAge: () => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: ThemePref) => void;
};

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      ageConfirmed: false,
      language: 'en',
      theme: 'dark',
      confirmAge: () => set({ ageConfirmed: true }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'raksi-prefs', version: 1, storage: createJSONStorage(() => AsyncStorage) }
  )
);
