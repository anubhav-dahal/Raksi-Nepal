import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Language = 'en' | 'ne';

type PrefsState = {
  /** The user confirmed they are 18+ (asked before alcohol categories). */
  ageConfirmed: boolean;
  language: Language;
  confirmAge: () => void;
  setLanguage: (language: Language) => void;
};

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      ageConfirmed: false,
      language: 'en',
      confirmAge: () => set({ ageConfirmed: true }),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'raksi-prefs', version: 1, storage: createJSONStorage(() => AsyncStorage) }
  )
);
