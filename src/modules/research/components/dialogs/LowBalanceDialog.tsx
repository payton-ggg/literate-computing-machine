"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import styles from "./LowBalanceDialog.module.css";

interface LowBalanceDialogProps {
  isOpen: boolean;
  requiredSeconds?: number;
  availableSeconds?: number;
  onClose: () => void;
}

export default function LowBalanceDialog({
  isOpen,
  requiredSeconds = 0,
  availableSeconds = 0,
  onClose,
}: LowBalanceDialogProps) {
  const t = useTranslations();

  if (!isOpen) return null;

  const formatHours = (seconds: number) => {
    if (!seconds) return "0.00";
    return (seconds / 3600).toFixed(2);
  };

  const requiredHours = formatHours(requiredSeconds);
  const availableHours = formatHours(availableSeconds);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialogCard}
        role="dialog"
        aria-modal="true"
        aria-label={t("dialogs.lowBalance.title")}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h3>{t("dialogs.lowBalance.title")}</h3>
          <button
            className={styles.btnClose}
            onClick={onClose}
            aria-label={t("common.close")}
          >
            &times;
          </button>
        </header>
        <section className={styles.body}>
          <p>
            {t("dialogs.lowBalance.message", {
              required: requiredHours,
              available: availableHours,
            })}
          </p>
          <p>{t("dialogs.lowBalance.topUp")}</p>
        </section>
        <footer className={styles.actions}>
          <Link href="/billing" className={`${styles.btn} ${styles.btnPrimary}`}>
            {t("dialogs.lowBalance.buyHours")}
          </Link>
          <Link href="/" className={`${styles.btn} ${styles.btnSecondary}`}>
            {t("dialogs.lowBalance.menu")}
          </Link>
        </footer>
      </div>
    </div>
  );
}
