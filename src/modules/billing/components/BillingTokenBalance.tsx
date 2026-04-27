"use client";

import { useTranslations } from "next-intl";
import type { TokenBalance } from "@/lib/token-balance";
import styles from "./BillingTokenBalance.module.css";

interface Props {
  balance: TokenBalance | null;
}

export default function BillingTokenBalance({ balance }: Props) {
  const t = useTranslations("billing.tokenBalance");

  return (
    <section className={styles.billingCard}>
      <div className={styles.billingCardHeader}>
        <h2>{t("title")}</h2>
        <strong className={styles.availableBalance}>{balance?.available ?? "—"}</strong>
      </div>

      <div className={styles.billingGrid}>
        <div className={styles.billingGridItem}>
          <span>{t("persistent")}</span>
          <strong>{balance?.persistent ?? "—"}</strong>
        </div>
        <div className={styles.billingGridItem}>
          <span>{t("nonPersistent")}</span>
          <strong>{balance?.non_persistent ?? "—"}</strong>
        </div>
        <div className={styles.billingGridItem}>
          <span>{t("frozen")}</span>
          <strong>{balance?.frozen ?? "—"}</strong>
        </div>
        <div className={styles.billingGridItem}>
          <span>{t("effective")}</span>
          <strong>{balance?.available ?? "—"}</strong>
        </div>
      </div>
    </section>
  );
}
