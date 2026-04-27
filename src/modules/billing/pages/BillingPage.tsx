"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTokenBalanceStore } from "@/lib/token-balance";
import { subscriptionApi, tokenBillingApi } from "../api/billing.api";
import { toast } from "@/lib/toast";

import BillingCurrentPlan from "../components/BillingCurrentPlan";
import BillingTokenBalance from "../components/BillingTokenBalance";
import BillingPPUSettings from "../components/BillingPPUSettings";
import BillingUsageHistory from "../components/BillingUsageHistory";

import styles from "./BillingPage.module.css";

export default function BillingPage() {
  const t = useTranslations();
  const { balance, refresh: refreshBalance } = useTokenBalanceStore();
  
  const [subscription, setSubscription] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const loadSubscription = async () => {
    try {
      const response = await subscriptionApi.getSubscription();
      setSubscription(response.data);
    } catch (err) {
      toast.error(t("billing.messages.loadSubscriptionError"));
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await tokenBillingApi.getTransactions();
      setTransactions(response.data.items || []);
    } catch (err) {
      toast.error(t("billing.messages.loadTransactionsError"));
    }
  };

  useEffect(() => {
    loadSubscription();
    loadTransactions();
    refreshBalance();
  }, [refreshBalance]);

  const handleSavePPULimit = async (spendingLimitCents: number) => {
    try {
      await tokenBillingApi.setPPU(spendingLimitCents);
      await refreshBalance();
      toast.success(t("billing.messages.ppuSaved"));
    } catch (err) {
      toast.error(t("billing.messages.ppuSaveError"));
    }
  };

  const handleDisablePPU = async () => {
    try {
      await tokenBillingApi.disablePPU();
      await refreshBalance();
      toast.success(t("toasts.updated"));
    } catch (err) {
      toast.error(t("billing.messages.ppuSaveError"));
    }
  };

  const handleChangePlan = async (planKey: string) => {
    try {
      await subscriptionApi.changePlan(planKey);
      await loadSubscription();
      toast.success(t("billing.messages.planUpdated"));
    } catch (err) {
      toast.error(t("billing.messages.planUpdateError"));
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await subscriptionApi.cancel();
      await loadSubscription();
      toast.success(t("billing.messages.cancelScheduled"));
    } catch (err) {
      toast.error(t("billing.messages.cancelError"));
    }
  };

  return (
    <div className={styles.billingPage}>
      <header className={styles.billingHeader}>
        <div>
          <h1>{t("billing.page.title")}</h1>
          <p>{t("billing.page.subtitle")}</p>
        </div>
        <Link href="/pricing" className="btn secondary">
          {t("billing.page.openPricing")}
        </Link>
      </header>

      <div className={styles.billingGrid}>
        <BillingCurrentPlan
          subscription={subscription}
          onChangePlan={handleChangePlan}
          onCancel={handleCancelSubscription}
        />
        <BillingTokenBalance balance={balance} />
        <BillingPPUSettings
          balance={balance}
          onSaveLimit={handleSavePPULimit}
          onDisablePPU={handleDisablePPU}
        />
        <BillingUsageHistory
          items={transactions}
          onRefresh={loadTransactions}
        />
      </div>
    </div>
  );
}
