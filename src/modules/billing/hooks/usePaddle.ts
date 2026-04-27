/**
 * usePaddle — React port of the Vue usePaddle composable.
 *
 * Script loading is singleton (module-level promise).
 * Paddle initialization is idempotent — re-initialized only when token changes.
 */

const PADDLE_SCRIPT_SRC = "https://cdn.paddle.com/paddle/v2/paddle.js";

export interface Paddle {
  Environment?: { set(env: string): void };
  Initialize(opts: { token: string }): void;
  Checkout: {
    open(opts: {
      transactionId?: string;
      items?: { priceId: string; quantity: number }[];
      settings?: { successUrl?: string };
    }): void;
  };
}

declare global {
  interface Window {
    Paddle: Paddle;
  }
}

// Module-level singletons (survive component remounts)
let scriptPromise: Promise<Paddle> | null = null;
let initializedToken = "";

async function loadPaddleScript(): Promise<Paddle> {
  if (typeof window === "undefined") throw new Error("window is not available");
  if (window.Paddle) return window.Paddle;
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<Paddle>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PADDLE_SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Paddle), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Paddle.js")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = PADDLE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(window.Paddle);
    script.onerror = () => reject(new Error("Failed to load Paddle.js"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

async function initPaddle(clientToken: string, environment = "production") {
  const Paddle = await loadPaddleScript();
  if (environment === "sandbox" && Paddle?.Environment?.set) {
    Paddle.Environment.set("sandbox");
  }
  if (initializedToken !== clientToken) {
    Paddle.Initialize({ token: clientToken });
    initializedToken = clientToken;
  }
  return Paddle;
}

export interface OpenTransactionCheckoutOptions {
  clientToken: string;
  environment?: string;
  transactionId: string;
  successUrl?: string;
}

export interface OpenPriceCheckoutOptions {
  clientToken: string;
  environment?: string;
  priceId: string;
  successUrl?: string;
}

export function usePaddle() {
  const openTransactionCheckout = async (opts: OpenTransactionCheckoutOptions) => {
    const Paddle = await initPaddle(opts.clientToken, opts.environment);
    Paddle.Checkout.open({
      transactionId: opts.transactionId,
      settings: opts.successUrl ? { successUrl: opts.successUrl } : {},
    });
  };

  const openPriceCheckout = async (opts: OpenPriceCheckoutOptions) => {
    const Paddle = await initPaddle(opts.clientToken, opts.environment);
    Paddle.Checkout.open({
      items: [{ priceId: opts.priceId, quantity: 1 }],
      settings: opts.successUrl ? { successUrl: opts.successUrl } : {},
    });
  };

  return { openTransactionCheckout, openPriceCheckout };
}
