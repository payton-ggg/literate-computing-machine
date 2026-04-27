"use client";

import styles from "./InsufficientBalanceModal.module.css";

interface InsufficientBalanceModalProps {
  isOpen: boolean;
  mode: "insufficient_balance" | "ppu_limit_reached" | string;
  estimatedTokens: number;
  available: number;
  ppuRemainingCents: number;
  ppuSpendingLimitCents: number;
  onUpgrade: () => void;
  onEnablePpu: () => void;
  onIncreaseLimit: () => void;
  onClose: () => void;
  t: (key: string, values?: Record<string, any>) => string;
}

export default function InsufficientBalanceModal({
  isOpen,
  mode,
  estimatedTokens,
  available,
  ppuRemainingCents,
  ppuSpendingLimitCents,
  onUpgrade,
  onEnablePpu,
  onIncreaseLimit,
  onClose,
  t,
}: InsufficientBalanceModalProps) {
  if (!isOpen) return null;

  const isLimitReached = mode === "ppu_limit_reached";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrapper}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className={styles.title}>
          {isLimitReached
            ? t("insufficientBalance.ppuLimitTitle")
            : t("insufficientBalance.title")}
        </h2>
        <p className={styles.message}>
          {isLimitReached
            ? t("insufficientBalance.ppuLimitMessage")
            : t("insufficientBalance.message")}
        </p>

        <div className={styles.balanceInfo}>
          {!isLimitReached && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{t("insufficientBalance.available")}</span>
              <span className={styles.infoValue}>{available}</span>
            </div>
          )}
          {isLimitReached && (
            <>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>{t("insufficientBalance.ppuLimit")}</span>
                <span className={styles.infoValue}>
                  ${(ppuSpendingLimitCents / 100).toFixed(2)}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>{t("insufficientBalance.ppuSpent")}</span>
                <span className={styles.infoValue}>
                  ${((ppuSpendingLimitCents - ppuRemainingCents) / 100).toFixed(2)}
                </span>
              </div>
            </>
          )}
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{t("insufficientBalance.required")}</span>
            <span className={styles.infoValue}>{estimatedTokens} tokens</span>
          </div>
        </div>

        <div className={styles.footer}>
          {isLimitReached ? (
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onIncreaseLimit}>
              {t("insufficientBalance.increaseLimit")}
            </button>
          ) : (
            <>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onUpgrade}>
                {t("insufficientBalance.upgrade")}
              </button>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onEnablePpu}>
                {t("insufficientBalance.enablePpu")}
              </button>
            </>
          )}
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
            {t("common.back")}
          </button>
        </div>
      </div>
    </div>
  );
}

