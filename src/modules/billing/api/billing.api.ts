import { apiClient } from "@/lib/axios";

export const billingApi = {
  getConfig: () => apiClient.get("/billing/config"),
  getPublicConfig: () => apiClient.get("/billing/public-config"),
  /** Legacy seconds-balance endpoint used by the interview store */
  getBalance: () => apiClient.get("/me/balance"),
  listPackages: () => apiClient.get("/billing/packages"),
  purchase: (options: Record<string, unknown>) =>
    apiClient.post("/billing/purchase", options),
};

// ---------------------------------------------------------------------------
// Token billing (new system: credits / PPU)
// ---------------------------------------------------------------------------

export const tokenBillingApi = {
  getBalance: () => apiClient.get("/v1/tokens/balance"),

  getTransactions: ({
    page = 1,
    perPage = 20,
    type = "",
  }: { page?: number; perPage?: number; type?: string } = {}) =>
    apiClient.get("/v1/tokens/transactions", {
      params: {
        page,
        per_page: perPage,
        ...(type ? { type } : {}),
      },
    }),

  setPPU: (spendingLimitCents: number) =>
    apiClient.put("/v1/tokens/ppu", {
      spending_limit_cents: spendingLimitCents,
    }),

  disablePPU: () => apiClient.delete("/v1/tokens/ppu"),
};

// ---------------------------------------------------------------------------
// Subscription (plan management)
// ---------------------------------------------------------------------------

export const subscriptionApi = {
  getSubscription: () => apiClient.get("/v1/billing/subscription"),

  checkout: (planKey: string) =>
    apiClient.post("/v1/billing/checkout", { plan_key: planKey }),

  changePlan: (newPlanKey: string) =>
    apiClient.post("/v1/billing/change-plan", { new_plan_key: newPlanKey }),

  cancel: () => apiClient.post("/v1/billing/cancel"),
};
