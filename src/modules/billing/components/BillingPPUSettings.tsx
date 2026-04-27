"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { TokenBalance } from "@/lib/token-balance";
import styles from "./BillingPPUSettings.module.css";

interface Props {
  balance: TokenBalance | null;
  onSaveLimit: (spendingLimitCents: number) => void;
  onDisablePPU: () => void;
}

export default function BillingPPUSettings({
  balance,
  onSaveLimit,
  onDisablePPU,
}: Props) {
  const t = useTranslations();
  const [localLimit, setLocalLimit] = useState(0);

  useEffect(() => {
    if (balance) {
      setLocalLimit(Math.round((balance.ppu_spending_limit_cents || 0) / 100));
    }
  }, [balance]);

  const handleSave = () => {
    onSaveLimit(Math.max(0, Number(localLimit || 0)) * 100);
  };

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      onDisablePPU();
    } else {
      handleSave();
    }
  };

  if (!balance) return null;

  return (
    <section className={styles.billingCard}>
      <div className={styles.billingCardHeader}>
        <div className={styles.billingCardHeaderLeft}>
          <h2>{t("billing.ppu.title")}</h2>
          <p>{t("billing.ppu.subtitle")}</p>
        </div>
        <label className={styles.ppuToggle}>
          <input
            checked={balance.ppu_enabled}
            type="checkbox"
            onChange={handleToggle}
          />
          <span>{balance.ppu_enabled ? t("common.yes") : t("common.no")}</span>
        </label>
      </div>

      <div className={styles.ppuGrid}>
        <label className={styles.ppuField}>
          <span>{t("billing.ppu.limit")}</span>
          <input
            value={localLimit}
            type="number"
            min="0"
            step="1"
            onChange={(e) => setLocalLimit(Number(e.target.value))}
          />
        </label>
        <button className="btn primary" onClick={handleSave}>
          {t("common.save")}
        </button>
      </div>

      <div className={styles.ppuStats}>
        <span>
          {t("billing.ppu.used")}
          <strong>${(balance.ppu_spent_this_cycle_cents / 100).toFixed(2)}</strong>
        </span>
        <span>
          {t("billing.ppu.pending")}
          <strong>${(balance.ppu_pending_charge_cents / 100).toFixed(2)}</strong>
        </span>
        <span>
          {t("billing.ppu.remaining")}
          <strong>${(balance.ppu_remaining_cents / 100).toFixed(2)}</strong>
        </span>
        <span>
          {t("billing.ppu.debt")}
          <strong>${(balance.ppu_outstanding_cents / 100).toFixed(2)}</strong>
        </span>
      </div>
    </section>
  );
}
