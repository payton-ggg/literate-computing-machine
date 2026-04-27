import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const TOKEN_BALANCE_MUTATION_PATHS = [
  /^\/v1\/tokens\//,
  /^\/v1\/billing\//,
  /^\/v1\/operations\/start$/,
  /^\/interviews\/[^/]+\/extract-insights$/,
  /^\/interviews\/[^/]+\/translate$/,
  /^\/interviews\/[^/]+\/extract-jobs$/,
  /^\/folders\/[^/]+\/generate-job-tree$/,
  /^\/ideas\/[^/]+\/evaluate$/,
] as const;

const normalizeApiPath = (url = ""): string => {
  if (!url) return "";
  try {
    const pathname = new URL(url, "http://internal.local").pathname;
    return pathname.replace(/^\/api/, "") || pathname;
  } catch {
    return url.replace(/^\/api/, "");
  }
};

const shouldRefreshTokenBalance = (response: {
  config?: { method?: string; url?: string };
  data?: { status?: string };
}): boolean => {
  const method = response?.config?.method?.toLowerCase();
  const path = normalizeApiPath(response?.config?.url);

  if (!method || !path) return false;

  if (
    /^\/v1\/operations\/[^/]+\/status$/.test(path) &&
    ["completed", "failed"].includes(response?.data?.status ?? "")
  ) {
    return true;
  }

  if (!["post", "put", "delete"].includes(method)) return false;

  return TOKEN_BALANCE_MUTATION_PATHS.some((pattern) => pattern.test(path));
};

// Lazy import to avoid circular dependency with event utilities
apiClient.interceptors.response.use(
  async (response) => {
    if (shouldRefreshTokenBalance(response)) {
      const { requestTokenBalanceRefresh } =
        await import("@/lib/axios/tokenBalanceEvents");
      requestTokenBalanceRefresh();
    }
    return response;
  },
  async (error) => {
    // Global 401 handler — session expired or invalid
    if (
      error?.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      // Lazily clear auth store to avoid circular imports
      const { useAuthStore } = await import("@/modules/auth/store/auth.store");
      useAuthStore.getState().logout();

      // Only redirect if not already on an auth page to avoid redirect loops
      const pathname = window.location.pathname;
      const isAuthPage = ["/login", "/register", "/forgot-password", "/buy"].some(
        (p) => pathname.startsWith(p)
      );
      if (!isAuthPage) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// --- Request Deduplication for GET requests ---
// This prevents React Strict Mode or concurrent identical fetches from triggering duplicate API calls.
const pendingRequests = new Map<string, Promise<any>>();
const originalGet = apiClient.get;

apiClient.get = function (url: string, config?: any) {
  const key = `${url}?${JSON.stringify(config?.params || {})}`;
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }
  const promise = originalGet.call(this, url, config).finally(() => {
    pendingRequests.delete(key);
  });
  pendingRequests.set(key, promise);
  return promise;
};

export default apiClient;
