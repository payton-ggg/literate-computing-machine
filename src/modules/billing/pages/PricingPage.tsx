"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { billingApi, subscriptionApi } from "../api/billing.api";
import { usePaddle } from "../hooks/usePaddle";
import { toast } from "@/lib/toast";
import styles from "./PricingPage.module.css";

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: 39,
    tokens: "1,000 tokens",
    description: "For early-stage research workflows",
  },
  {
    key: "pro",
    name: "Pro",
    price: 59,
    tokens: "2,000 tokens",
    description: "For active product teams",
  },
  {
    key: "business",
    name: "Business",
    price: 299,
    tokens: "10,000 tokens",
    description: "For research-heavy organizations",
  },
];

export default function PricingPage() {
  const t = useTranslations();
  const { openTransactionCheckout } = usePaddle();
  const [billingConfig, setBillingConfig] = useState<any>(null);

  const loadBillingConfig = async () => {
    if (billingConfig) return billingConfig;
    const response = await billingApi.getConfig();
    setBillingConfig(response.data);
    return response.data;
  };

  const handleOpenCheckout = async (planKey: string) => {
    try {
      const [checkoutResponse, config] = await Promise.all([
        subscriptionApi.checkout(planKey),
        loadBillingConfig(),
      ]);

      await openTransactionCheckout({
        clientToken: config.client_token,
        environment: config.environment,
        transactionId: checkoutResponse.data.transaction_id,
        successUrl: `${window.location.origin}/billing?payment=success`,
      });
    } catch (err) {
      toast.error(t("pricing.checkoutError"));
    }
  };

  return (
    <div className={styles.pricingPage}>
      <header className={styles.pricingHeader}>
        <div>
          <h1>{t("pricing.title")}</h1>
          <p>{t("pricing.subtitle")}</p>
        </div>
        <Link href="/billing" className="btn secondary">
          {t("pricing.openBilling")}
        </Link>
      </header>

      <div className={styles.pricingGrid}>
        {PLANS.map((plan) => (
          <article key={plan.key} className={styles.pricingCard}>
            <div className={styles.pricingCardTop}>
              <h2>{plan.name}</h2>
              <p>{plan.description}</p>
            </div>
            <div className={styles.pricingCardPrice}>${plan.price}</div>
            <div className={styles.pricingCardTokens}>{plan.tokens}</div>
            <button
              className="btn primary pricingCta"
              onClick={() => handleOpenCheckout(plan.key)}
            >
              {t("pricing.cta")}
            </button>
          </article>
        ))}
      </div>

      <section className={styles.pricingPpu}>
        <h2>{t("pricing.ppu.title")}</h2>
        <p>{t("pricing.ppu.description")}</p>
      </section>
    </div>
  );
}
