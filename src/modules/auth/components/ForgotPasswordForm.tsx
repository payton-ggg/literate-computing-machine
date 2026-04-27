"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { authApi } from "@/modules/auth/api/auth.api";
import styles from "./ForgotPasswordForm.module.css";

export default function ForgotPasswordForm() {
  const t = useTranslations();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await authApi.requestPasswordReset(email);
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authCard}>
      <div className={styles.authHeader}>
        <h1 className={styles.authTitle}>{t("auth.forgotPassword.title")}</h1>
        <p className={styles.authSubtitle}>{t("auth.forgotPassword.subtitle")}</p>
      </div>

      <form onSubmit={onSubmit} className={styles.authForm} noValidate>
        <div className={styles.formGroup}>
          <label htmlFor="forgot-email" className={styles.formLabel}>
            {t("auth.forgotPassword.emailLabel")}
          </label>
          <input
            id="forgot-email"
            type="email"
            className={styles.formInput}
            placeholder="email@example.com"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && <div className={styles.authError}>{error}</div>}
        {success && (
          <div className={styles.authSuccess}>
            {t("auth.forgotPassword.success")}
          </div>
        )}

        <button
          type="submit"
          className={styles.authButton}
          disabled={loading || !email}
        >
          {loading && <span className={styles.spinner} />}
          {loading
            ? t("auth.forgotPassword.submitting")
            : t("auth.forgotPassword.submit")}
        </button>
      </form>

      <div className={styles.authFooter}>
        <Link href="/login" className={styles.authLink}>
          {t("auth.forgotPassword.backToLogin")}
        </Link>
      </div>
    </div>
  );
}
