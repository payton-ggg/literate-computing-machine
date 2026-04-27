/**
 * tokenBalanceEvents.ts
 *
 * Lightweight event bus for signalling that the token balance
 * should be re-fetched (e.g. after a mutation that consumes tokens).
 *
 * Using a custom event on `window` keeps this decoupled from
 * any specific store or framework.
 */

export const TOKEN_BALANCE_REFRESH_EVENT = "castdev:token-balance-refresh";

export const requestTokenBalanceRefresh = (): void => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOKEN_BALANCE_REFRESH_EVENT));
};

export const onTokenBalanceRefresh = (callback: () => void): (() => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(TOKEN_BALANCE_REFRESH_EVENT, callback);
  return () => window.removeEventListener(TOKEN_BALANCE_REFRESH_EVENT, callback);
};
