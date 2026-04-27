"use client";

import { useState, useEffect, useMemo, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { authApi } from "@/modules/auth/api/auth.api";
import styles from "./ResetPasswordForm.module.css";

interface Props {
  token: string;
}

// Password rule definitions (mirrors Vue exactly)
const RULES = [
  { key: "tooShort",      test: (p: string) => p.length >= 8 },
  { key: "tooLong",       test: (p: string) => p.length <= 64 },
  { key: "needUppercase", test: (p: string) => /[A-Z]/.test(p) },
  { key: "needLowercase", test: (p: string) => /[a-z]/.test(p) },
  { key: "needDigit",     test: (p: string) => /[0-9]/.test(p) },
  { key: "needSpecial",   test: (p: string) => /[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(p) },
  { key: "noCyrillic",    test: (p: string) => !/[а-яёА-ЯЁ]/.test(p) },
] as const;

// Backend error message → rule key mapping (mirrors Vue exactly)
const BACKEND_MSG_TO_KEY: Record<string, string> = {
  "password must be at least 8 characters long": "tooShort",
  "password must be no longer than 64 characters": "tooLong",
  "password must contain at least one uppercase letter (A-Z)": "needUppercase",
  "password must contain at least one lowercase letter (a-z)": "needLowercase",
  "password must contain at least one digit (0-9)": "needDigit",
  "password must contain at least one special character (e.g. !@#$%^&*)": "needSpecial",
  "password must use Latin characters only, Cyrillic is not allowed": "noCyrillic",
  "password must contain only printable Latin characters (no spaces)": "noCyrillic",
};

export default function ResetPasswordForm({ token }: Props) {
  const t = useTranslations();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Token verification states
  const [verifying, setVerifying] = useState(true);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    authApi
      .verifyResetToken(token)
      .catch(() => setTokenInvalid(true))
      .finally(() => setVerifying(false));
  }, [token, router]);

  // Computed password rules (show only when something is typed)
  const allRules = useMemo(() => {
    if (!password) return [];
    return RULES.map((r) => ({
      key: r.key,
      label: t(`auth.passwordValidation.${r.key}`),
      passed: r.test(password),
    }));
  }, [password, t]);

  const passwordErrors = allRules.filter((r) => !r.passed);
  const allPassed = password.length > 0 && passwordErrors.length === 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!allPassed) return;

    setLoading(true);
    setError("");

    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { code?: string; error?: string; message?: string } } };
      const code = e.response?.data?.code;
      const msg = e.response?.data?.error || e.response?.data?.message || "";

      if (code === "INVALID_TOKEN" || code === "TOKEN_EXPIRED") {
        setTokenInvalid(true);
      } else if (code === "VALIDATION_ERROR" && BACKEND_MSG_TO_KEY[msg]) {
        setError(t(`auth.passwordValidation.${BACKEND_MSG_TO_KEY[msg]}`));
      } else {
        setError(msg || t("auth.resetPassword.failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Token invalid / expired state ──────────────────────────────────────────
  if (tokenInvalid) {
    return (
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>
            {t("auth.resetPassword.invalidTokenTitle")}
          </h1>
        </div>
        <div className={styles.tokenErrorMessage}>
          {t("auth.resetPassword.invalidTokenMessage")}
        </div>
        <Link href="/forgot-password" className={styles.authButton}>
          {t("auth.resetPassword.requestNewLink")}
        </Link>
        <div className={styles.authFooter}>
          <Link href="/login" className={styles.authLink}>
            {t("auth.forgotPassword.backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  // ── Token verification in progress ────────────────────────────────────────
  if (verifying) {
    return (
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>{t("auth.resetPassword.title")}</h1>
        </div>
        <div className={styles.verifyingSpinner}>
          <span className={styles.spinnerLarge} />
        </div>
      </div>
    );
  }

  // ── Normal reset form ─────────────────────────────────────────────────────
  return (
    <div className={styles.authCard}>
      <div className={styles.authHeader}>
        <h1 className={styles.authTitle}>{t("auth.resetPassword.title")}</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.authForm}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="reset-password">
            {t("auth.resetPassword.passwordLabel")}
          </label>
          <input
            id="reset-password"
            type="password"
            className={styles.formInput}
            placeholder={t("auth.resetPassword.placeholder")}
            required
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            disabled={loading}
          />
        </div>

        {/* Password validation rules — visible only while typing and errors exist */}
        {password && passwordErrors.length > 0 && (
          <ul className={styles.passwordRules}>
            {allRules.map((rule) => (
              <li key={rule.key} className={rule.passed ? styles.rulePassed : styles.ruleFailed}>
                <span className={styles.ruleIcon}>{rule.passed ? "✓" : "•"}</span>
                <span className={rule.passed ? styles.ruleLabelPassed : undefined}>
                  {rule.label}
                </span>
              </li>
            ))}
          </ul>
        )}

        {error && <div className={styles.authError}>{error}</div>}
        {success && <div className={styles.authSuccess}>{t("auth.resetPassword.success")}</div>}

        <button
          type="submit"
          className={styles.authButton}
          disabled={loading || !allPassed}
        >
          {loading && <span className={styles.spinner} />}
          {loading ? t("auth.resetPassword.submitting") : t("auth.resetPassword.submit")}
        </button>
      </form>
    </div>
  );
}
