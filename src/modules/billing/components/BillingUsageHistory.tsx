"use client";

import { useTranslations } from "next-intl";
import styles from "./BillingUsageHistory.module.css";

interface Transaction {
  id: string;
  created_at: string;
  description?: string;
  type?: string;
  amount: number;
  balance_after: number;
}

interface Props {
  items: Transaction[];
  onRefresh: () => void;
}

export default function BillingUsageHistory({ items, onRefresh }: Props) {
  const t = useTranslations();

  return (
    <section className={styles.billingCard}>
      <div className={styles.billingCardHeader}>
        <h2>{t("billing.usageHistory.title")}</h2>
        <button className="btn secondary" onClick={onRefresh}>
          {t("common.refresh")}
        </button>
      </div>

      <div className={styles.billingTable}>
        <div className={styles.billingTableHead}>
          <span>{t("billing.usageHistory.date")}</span>
          <span>{t("billing.usageHistory.operation")}</span>
          <span>{t("billing.usageHistory.tokens")}</span>
          <span>{t("billing.usageHistory.balanceAfter")}</span>
        </div>

        {items.map((item) => (
          <div key={item.id} className={styles.billingTableRow}>
            <span>{item.created_at}</span>
            <span>{item.description || item.type}</span>
            <span>{item.amount}</span>
            <span>{item.balance_after}</span>
          </div>
        ))}

        {items.length === 0 && (
          <p className={styles.billingTableEmpty}>
            {t("billing.usageHistory.empty")}
          </p>
        )}
      </div>
    </section>
  );
}
