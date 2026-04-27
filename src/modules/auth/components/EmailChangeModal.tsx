"use client";

import { useTranslations } from "next-intl";
import type { EmailChangeStep } from "../hooks/useSettings";
import styles from "./EmailChangeModal.module.css";

interface Props {
  step: EmailChangeStep;
  maskedEmail: string;
  currentEmailCode: string;
  onCurrentEmailCodeChange: (v: string) => void;
  newEmail: string;
  onNewEmailChange: (v: string) => void;
  newEmailCode: string;
  onNewEmailCodeChange: (v: string) => void;
  pendingNewEmail: string;
  resendTimer: number;
  wizardNextEnabled: boolean;
  emailSubmitting: boolean;
  error: string;
  onBack: () => void;
  onNext: () => void;
  onClose: () => void;
  onResendCurrent: () => void;
  onResendNew: () => void;
}

export default function EmailChangeModal({
  step,
  maskedEmail,
  currentEmailCode,
  onCurrentEmailCodeChange,
  newEmail,
  onNewEmailChange,
  newEmailCode,
  onNewEmailCodeChange,
  pendingNewEmail,
  resendTimer,
  wizardNextEnabled,
  emailSubmitting,
  error,
  onBack,
  onNext,
  onClose,
  onResendCurrent,
  onResendNew,
}: Props) {
  const t = useTranslations();

  if (step === "idle") return null;

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.title}>{t("auth.accountSettings.changeEmailTitle")}</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 4L4 12M4 4L12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Step 1: verify current email */}
          {step === "current" && (
            <>
              <div className={styles.stepTitle}>{t("auth.accountSettings.enterCodeTitle")}</div>
              <p className={styles.hint}>
                {t("auth.accountSettings.currentEmailStepHint")}{" "}
                <strong>{maskedEmail}</strong>
              </p>
              <input
                className={`${styles.fieldInput} ${styles.codeInput}`}
                value={currentEmailCode}
                onChange={(e) => onCurrentEmailCodeChange(e.target.value)}
                maxLength={6}
                placeholder={t("auth.accountSettings.codePlaceholder")}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              <button
                className={styles.resendBtn}
                disabled={resendTimer > 0}
                onClick={onResendCurrent}
              >
                {resendTimer > 0
                  ? `${t("auth.accountSettings.resendIn")} ${resendTimer}`
                  : t("auth.accountSettings.resendCode")}
              </button>
            </>
          )}

          {/* Step 2: enter new email */}
          {step === "new-email" && (
            <>
              <div className={styles.stepTitle}>{t("auth.accountSettings.newEmailLabel")}</div>
              <p className={styles.hint}>{t("auth.accountSettings.newEmailHint")}</p>
              <input
                className={styles.fieldInput}
                value={newEmail}
                onChange={(e) => onNewEmailChange(e.target.value)}
                type="email"
                placeholder={t("auth.register.email")}
                autoComplete="email"
              />
            </>
          )}

          {/* Step 3: verify new email */}
          {step === "new" && (
            <>
              <div className={styles.stepTitle}>{t("auth.accountSettings.enterCodeTitle")}</div>
              <p className={styles.hint}>
                {t("auth.accountSettings.newEmailStepHint")}{" "}
                <strong>{pendingNewEmail}</strong>
              </p>
              <input
                className={`${styles.fieldInput} ${styles.codeInput}`}
                value={newEmailCode}
                onChange={(e) => onNewEmailCodeChange(e.target.value)}
                maxLength={6}
                placeholder={t("auth.accountSettings.codePlaceholder")}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              <button
                className={styles.resendBtn}
                disabled={resendTimer > 0}
                onClick={onResendNew}
              >
                {resendTimer > 0
                  ? `${t("auth.accountSettings.resendIn")} ${resendTimer}`
                  : t("auth.accountSettings.resendCode")}
              </button>
            </>
          )}

          {error && <p className={styles.errorMsg}>{error}</p>}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.btnCancel} onClick={onBack}>
            {t("common.back")}
          </button>
          <button
            className={styles.btnSave}
            disabled={emailSubmitting || !wizardNextEnabled}
            onClick={onNext}
          >
            {t("common.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
