"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import styles from "./BillingCurrentPlan.module.css";

interface Subscription {
  plan?: string;
  status?: string;
  current_period_end?: string;
}

interface Props {
  subscription: Subscription | null;
  onChangePlan: (planKey: string) => void;
  onCancel: () => void;
}

const PLAN_ORDER = ["starter", "pro", "business"];

export default function BillingCurrentPlan({ subscription, onChangePlan, onCancel }: Props) {
  const t = useTranslations();

  const normalizedPlan = String(subscription?.plan ?? "").trim().toLowerCase();
  const normalizedStatus = String(subscription?.status ?? "").trim().toLowerCase();

  const planLabel = normalizedPlan || "free";
  const currentIdx = PLAN_ORDER.indexOf(normalizedPlan);

  const upgradePlanKey = currentIdx >= 0 && currentIdx < PLAN_ORDER.length - 1
    ? PLAN_ORDER[currentIdx + 1]
    : null;

  const downgradePlanKey = currentIdx > 0
    ? PLAN_ORDER[currentIdx - 1]
    : null;

  const hasSubscription = Boolean(normalizedPlan);
  const canCancel = hasSubscription && normalizedStatus !== "canceled";
  const showPricingCTA = !hasSubscription;

  return (
    <section className={styles.billingCard}>
      <div className={styles.billingCardHeader}>
        <div className={styles.billingCardHeaderLeft}>
          <h2>{t("billing.currentPlan.title")}</h2>
          <p>{t("billing.currentPlan.subtitle")}</p>
        </div>
        <span className={styles.planBadge}>{planLabel}</span>
      </div>

      <div className={styles.billingCardBody}>
        <div className={styles.billingStat}>
          <span className={styles.billingStatLabel}>{t("billing.currentPlan.status")}</span>
          <span className={styles.billingStatValue}>{subscription?.status ?? "—"}</span>
        </div>
        <div className={styles.billingStat}>
          <span className={styles.billingStatLabel}>{t("billing.currentPlan.renewalDate")}</span>
          <span className={styles.billingStatValue}>{subscription?.current_period_end ?? "—"}</span>
        </div>
      </div>

      <div className={styles.billingCardActions}>
        {showPricingCTA && (
          <Link href="/pricing" className="btn primary">
            {t("billing.page.openPricing")}
          </Link>
        )}
        {upgradePlanKey && (
          <button className="btn primary" onClick={() => onChangePlan(upgradePlanKey)}>
            {t("billing.currentPlan.upgrade")}
          </button>
        )}
        {downgradePlanKey && (
          <button className="btn secondary" onClick={() => onChangePlan(downgradePlanKey)}>
            {t("billing.currentPlan.downgrade")}
          </button>
        )}
        {canCancel && (
          <button className="btn secondary" onClick={onCancel}>
            {t("billing.currentPlan.cancel")}
          </button>
        )}
      </div>
    </section>
  );
}
