import { create } from "zustand";

export interface TokenBalance {
  available: number;
  persistent: number;
  non_persistent: number;
  frozen: number;
  ppu_enabled: boolean;
  ppu_spending_limit_cents: number;
  ppu_spent_this_cycle_cents: number;
  ppu_pending_charge_cents: number;
  ppu_remaining_cents: number;
  ppu_outstanding_cents: number;
}

interface TokenBalanceState {
  balance: TokenBalance | null;
  isLoading: boolean;
  pollingTimer: ReturnType<typeof setInterval> | null;
  refresh: () => Promise<void>;
  start: (intervalMs?: number) => void;
  stop: () => void;
}

export const useTokenBalanceStore = create<TokenBalanceState>((set, get) => ({
  balance: null,
  isLoading: false,
  pollingTimer: null,

  refresh: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const { tokenBillingApi } = await import("@/modules/billing");
      const res = await tokenBillingApi.getBalance();
      set({ balance: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  start: (intervalMs = 60_000) => {
    const { refresh, pollingTimer } = get();
    if (pollingTimer) return; // already running
    refresh();
    const timer = setInterval(refresh, intervalMs);
    set({ pollingTimer: timer });
  },

  stop: () => {
    const { pollingTimer } = get();
    if (pollingTimer) {
      clearInterval(pollingTimer);
      set({ pollingTimer: null });
    }
  },
}));
