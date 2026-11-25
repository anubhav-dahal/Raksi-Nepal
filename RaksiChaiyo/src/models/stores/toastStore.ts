import { create } from 'zustand';

export type ToastKind = 'success' | 'error';

type ToastState = {
  message: string | null;
  kind: ToastKind;
  /** Changes on every show() so the same message twice re-triggers the timer. */
  key: number;
  show: (message: string, kind?: ToastKind) => void;
  hide: () => void;
};

export const useToastStore = create<ToastState>()((set) => ({
  message: null,
  kind: 'success',
  key: 0,
  show: (message, kind = 'success') => set((s) => ({ message, kind, key: s.key + 1 })),
  hide: () => set({ message: null }),
}));

/** Show a toast from anywhere (controllers, callbacks). */
export const toast = (message: string, kind?: ToastKind) => useToastStore.getState().show(message, kind);
