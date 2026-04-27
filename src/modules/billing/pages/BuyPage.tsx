"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { billingApi } from "../api/billing.api";
import { usePaddle } from "../hooks/usePaddle";
import styles from "./BuyPage.module.css";

const BUY_PRICE_ID = "pri_01kn6m96kzf4mabpvc2x981ef7";

export default function BuyPage() {
  const t = useTranslations();
  const { openPriceCheckout } = usePaddle();

  const [billingConfig, setBillingConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await billingApi.getPublicConfig();
        setBillingConfig(response.data);
      } catch (err) {
        console.error("Failed to fetch public billing config:", err);
        setErrorMessage(t("buy.messages.paymentServiceUnavailable"));
      }
    };
    fetchConfig();
  }, [t]);

  const handleOpenCheckout = async () => {
    if (!billingConfig?.client_token) {
      setErrorMessage(t("buy.messages.paymentServiceUnavailable"));
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await openPriceCheckout({
        clientToken: billingConfig.client_token,
        environment: billingConfig.environment,
        priceId: BUY_PRICE_ID,
        successUrl: `${window.location.origin}/`,
      });
    } catch (err) {
      console.error("Failed to open Paddle checkout:", err);
      setErrorMessage(t("buy.messages.paymentFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.buyPage}>
      <div className={styles.buyCard}>
        <div className={styles.buyPrice}>{t("buy.price")}</div>
        <h1 className={styles.buyTitle}>{t("buy.title")}</h1>
        <p className={styles.buySubtitle}>{t("buy.subtitle")}</p>

        <button
          className={`btn primary ${styles.buyButton}`}
          disabled={isLoading || !billingConfig}
          onClick={handleOpenCheckout}
        >
          {isLoading ? t("buy.processing") : t("buy.pay")}
        </button>

        {errorMessage && <p className={styles.buyError}>{errorMessage}</p>}

        <Link href="/" className={styles.buyBack}>
          {t("buy.back")}
        </Link>
      </div>
    </div>
  );
}
