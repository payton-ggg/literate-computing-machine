"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useSettings } from "../hooks/useSettings";
import PasswordInput from "../components/PasswordInput";
import EmailChangeModal from "../components/EmailChangeModal";
import styles from "./SettingsPage.module.css";

export default function SettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const s = useSettings();

  return (
    <div className={styles.settingsPage}>
      <div className={styles.settingsContainer}>

        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button className={styles.breadcrumbBack} onClick={() => router.back()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            {t("auth.accountSettings.profileSettings", { defaultValue: "Profile / Settings" })}
          </button>
        </div>

        <h1 className={styles.pageTitle}>{t("auth.accountSettings.title")}</h1>

        {/* Body */}
        <div className={styles.body}>

          {/* ACCOUNT SECTION */}
          <section className={styles.section}>
            <div className={styles.sectionLabel}>{t("auth.accountSettings.accountSection")}</div>

            {/* Username */}
            <div className={styles.formGroup}>
              <label className={styles.fieldLabel} htmlFor="settings-username">
                {t("auth.setupProfile.usernameLabel")}
              </label>
              <input
                id="settings-username"
                className={styles.fieldInput}
                value={s.username}
                onChange={(e) => s.setUsername(e.target.value)}
                placeholder={t("auth.setupProfile.usernamePlaceholder")}
                autoComplete="username"
              />
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.fieldLabel} htmlFor="settings-email">
                {t("auth.accountSettings.emailLabel")}
              </label>
              <div className={styles.fieldInputWrap}>
                <input
                  id="settings-email"
                  className={`${styles.fieldInput} ${s.isGoogleAccount ? styles.hasSuffix : ""}`}
                  value={s.email}
                  disabled
                />
                {s.isGoogleAccount && (
                  <span className={styles.inputSuffixIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  </span>
                )}
              </div>
              <button className={styles.btnChangeEmail} onClick={s.startEmailChange}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
                {t("auth.accountSettings.changeEmail")}
              </button>
            </div>
          </section>

          {/* PASSWORD SECTION — regular accounts */}
          {!s.isGoogleAccount && (
            <section className={styles.section}>
              <div className={styles.sectionHeaderRow}>
                <div className={styles.sectionLabel}>{t("auth.accountSettings.passwordSectionTitle")}</div>
                <button className={styles.linkBtn} type="button" onClick={() => router.push("/forgot-password")}>
                  {t("auth.accountSettings.forgotPasswordLink")}
                </button>
              </div>

              <PasswordInput
                id="settings-current-password"
                label={t("auth.accountSettings.currentPasswordLabel")}
                value={s.currentPassword}
                onChange={s.setCurrentPassword}
                placeholder={t("auth.accountSettings.currentPasswordPlaceholder")}
              />
              <PasswordInput
                id="settings-new-password"
                label={t("auth.accountSettings.newPasswordLabel")}
                value={s.newPassword}
                onChange={s.setNewPassword}
                placeholder={t("auth.accountSettings.newPasswordPlaceholder")}
              />
              <PasswordInput
                id="settings-confirm-password"
                label={t("auth.accountSettings.confirmPasswordLabel")}
                value={s.confirmPassword}
                onChange={s.setConfirmPassword}
                placeholder={t("auth.accountSettings.confirmPasswordPlaceholder")}
              />
            </section>
          )}

          {/* RESERVE PASSWORD SECTION — Google accounts */}
          {s.isGoogleAccount && (
            <section className={styles.section}>
              <div className={styles.sectionHeaderRow}>
                <div className={styles.sectionLabel}>{t("auth.accountSettings.reservePasswordTitle")}</div>
                <button
                  className={`${styles.toggleSwitch} ${s.showReservePassword ? styles.active : ""}`}
                  type="button"
                  onClick={() => s.setShowReservePassword(!s.showReservePassword)}
                  aria-pressed={s.showReservePassword}
                >
                  <span className={styles.toggleKnob} />
                </button>
              </div>

              {s.showReservePassword && (
                <>
                  <PasswordInput
                    id="settings-reserve-password"
                    label={t("auth.accountSettings.passwordLabel")}
                    value={s.reservePassword}
                    onChange={s.setReservePassword}
                    placeholder={t("auth.accountSettings.reservePasswordPlaceholder")}
                  />
                  <PasswordInput
                    id="settings-reserve-confirm"
                    label={t("auth.accountSettings.confirmPasswordLabel")}
                    value={s.reservePasswordConfirm}
                    onChange={s.setReservePasswordConfirm}
                    placeholder={t("auth.accountSettings.reservePasswordConfirmPlaceholder")}
                  />
                </>
              )}
            </section>
          )}

          {/* Password validation errors */}
          {s.passwordErrors.length > 0 && (
            <ul className={styles.errorList}>
              {s.passwordErrors.map((e) => <li key={e}>{e}</li>)}
            </ul>
          )}

          {/* General error */}
          {s.error && <p className={styles.errorMsg}>{s.error}</p>}

          {/* Inline success */}
          {s.successMessage && (
            <div className={styles.inlineSuccess}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#059669">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>{s.successMessage}</span>
              <button className={styles.closeSuccess} onClick={() => s.setSuccessMessage("")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.btnCancel} onClick={() => router.back()}>
            {t("common.cancel")}
          </button>
          <button className={styles.btnSave} disabled={s.isSubmitting} onClick={s.onSave}>
            {t("common.save")}
          </button>
        </div>
      </div>

      {/* Email Change Modal */}
      <EmailChangeModal
        step={s.emailChangeStep}
        maskedEmail={s.maskedEmail}
        currentEmailCode={s.currentEmailCode}
        onCurrentEmailCodeChange={s.setCurrentEmailCode}
        newEmail={s.newEmail}
        onNewEmailChange={s.setNewEmail}
        newEmailCode={s.newEmailCode}
        onNewEmailCodeChange={s.setNewEmailCode}
        pendingNewEmail={s.pendingNewEmail}
        resendTimer={s.resendTimer}
        wizardNextEnabled={s.wizardNextEnabled}
        emailSubmitting={s.emailSubmitting}
        error={s.error}
        onBack={s.wizardBack}
        onNext={s.wizardNext}
        onClose={s.cancelEmailChange}
        onResendCurrent={s.resendCurrentCode}
        onResendNew={s.resendNewCode}
      />
    </div>
  );
}
