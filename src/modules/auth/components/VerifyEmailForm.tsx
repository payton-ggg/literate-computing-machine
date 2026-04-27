"use client";

import { useState, useEffect, useCallback, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { authApi } from "@/modules/auth/api/auth.api";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import styles from "./VerifyEmailForm.module.css";

interface Props {
  email: string;
}

export default function VerifyEmailForm({ email }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer ref so we can clear it on unmount
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = useCallback(() => {
    setResendTimer(60);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      await authApi.verifyEmail(email, code);
      setSuccessMessage(t("auth.verify.success"));

      // Restore session: fetch /me to populate the store
      const meRes = await authApi.me();
      const userData = meRes.data?.user ?? meRes.data;
      if (userData) {
        setUser({ id: userData.id, username: userData.username, email: userData.email });
      }

      // Clear demo session from localStorage after successful verification
      localStorage.removeItem("demo_session_id");

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { code?: string } } };
      const errorCode = e.response?.data?.code;
      if (errorCode === "INVALID_CODE") {
        setError(t("auth.verify.invalidCode"));
      } else if (errorCode === "CODE_EXPIRED") {
        setError(t("auth.verify.expiredCode"));
      } else {
        setError(t("auth.verify.failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await authApi.resendVerification(email);
      setSuccessMessage(t("auth.verify.resendSuccess"));
      startTimer();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || t("auth.verify.failed"));
    } finally {
      setResendLoading(false);
    }
  };

  const resendButtonText = () => {
    if (resendLoading) return t("auth.verify.resendSending");
    if (resendTimer > 0) return t("auth.verify.resendWait", { time: resendTimer });
    return t("auth.verify.resend");
  };

  return (
    <div className={styles.authCard}>
      <div className={styles.authHeader}>
        <h1 className={styles.authTitle}>{t("auth.verify.title")}</h1>
        <p className={styles.authSubtitle}>
          {t("auth.verify.subtitle", { email })}
        </p>
      </div>

      <form onSubmit={handleVerify} className={styles.authForm}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="verify-code">
            {t("auth.verify.codeLabel")}
          </label>
          <input
            id="verify-code"
            type="text"
            className={`${styles.formInput} ${styles.codeInput}`}
            placeholder={t("auth.verify.placeholder")}
            maxLength={6}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            disabled={loading}
          />
        </div>

        {error && <div className={styles.authError}>{error}</div>}
        {successMessage && <div className={styles.authSuccess}>{successMessage}</div>}

        <button
          type="submit"
          className={styles.authButton}
          disabled={loading || code.length !== 6}
        >
          {loading && <span className={styles.spinner} />}
          {loading ? t("auth.verify.submitting") : t("auth.verify.submit")}
        </button>
      </form>

      <div className={styles.authFooter}>
        <p className={styles.authText}>
          <button
            type="button"
            onClick={handleResend}
            className={styles.linkButton}
            disabled={resendLoading || resendTimer > 0}
          >
            {resendButtonText()}
          </button>
        </p>
        <Link href="/login" className={styles.authLink}>
          {t("header.login")}
        </Link>
      </div>
    </div>
  );
}
