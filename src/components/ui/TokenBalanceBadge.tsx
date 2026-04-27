"use client";

import { useTranslations } from "next-intl";
import styles from "./TokenBalanceBadge.module.css";

interface Props {
  balance: number | { available?: number } | null;
  onOpenBilling: () => void;
}

export default function TokenBalanceBadge({ balance, onOpenBilling }: Props) {
  const t = useTranslations("billing");

  const total =
    typeof balance === "object" && balance !== null
      ? (balance.available ?? 0)
      : (balance ?? 0);

  return (
    <div className={styles.tokenBalanceNav}>
      <div className={styles.balancePill} onClick={onOpenBilling}>
        <span className={styles.pillLabel}>{t("balance.title")}:</span>
        <span className={styles.pillValue}>{total}</span>
      </div>
      <button
        className={styles.addFundsBtn}
        title={t("packages.title")}
        onClick={onOpenBilling}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
