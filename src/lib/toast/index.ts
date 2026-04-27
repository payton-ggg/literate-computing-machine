import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  add: (type: ToastType, message: string, duration?: number) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  add: (type, message, duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    if (duration > 0) {
      setTimeout(() => get().remove(id), duration);
    }
  },
  remove: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Call outside React components (e.g. in API error handlers) */
export const toast = {
  success: (msg: string, duration?: number) =>
    useToastStore.getState().add("success", msg, duration),
  error: (msg: string, duration?: number) =>
    useToastStore.getState().add("error", msg, duration),
  info: (msg: string, duration?: number) =>
    useToastStore.getState().add("info", msg, duration),
};
