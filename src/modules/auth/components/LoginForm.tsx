"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { authApi } from "@/modules/auth/api/auth.api";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { toast } from "@/lib/toast";
import styles from "./LoginForm.module.css";

interface Props {
  redirectPath: string | null;
}

export default function LoginForm({ redirectPath }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const { setUser, isAuthenticated } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [googleLoginUrl, setGoogleLoginUrl] = useState("/api/auth/google/login");
  useEffect(() => {
    // On prod Next.js runs at /app basePath. The backend uses `origin`
    // to build the OAuth redirect_uri, so we must include the basePath.
    const basePath = window.location.pathname.startsWith("/app") ? "/app" : "";
    const origin = encodeURIComponent(window.location.origin + basePath);
    const demo = localStorage.getItem("demo_session_id");
    const url = demo
      ? `/api/auth/google/login?origin=${origin}&demo_session_id=${encodeURIComponent(demo)}`
      : `/api/auth/google/login?origin=${origin}`;
    setGoogleLoginUrl(url);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectPath ?? "/");
    }
  }, [isAuthenticated, redirectPath, router]);

  const clearError = useCallback(() => setErrorMessage(""), []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setErrorMessage(t("auth.login.enterCredentials"));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await authApi.login(username.trim(), password);
      // Assume the API returns { user: { id, username, email }, token? }
      const user = res.data?.user ?? res.data;
      setUser({ id: user.id, username: user.username, email: user.email });
      toast.success(t("auth.login.success"));
      router.replace(redirectPath ?? "/");
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { code?: string; email?: string } } };

      if (error?.response?.data?.code === "EMAIL_NOT_VERIFIED") {
        const email = error.response!.data!.email;
        router.push(`/verify-email${email ? `?email=${encodeURIComponent(email)}` : ""}`);
        return;
      }

      if (error?.response?.status === 401) {
        setErrorMessage(t("auth.login.invalidCredentials"));
      } else {
        setErrorMessage(t("auth.login.verificationFailed"));
        console.error("Login error", err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.authCard}>
      <h1 className={styles.authTitle}>{t("auth.login.title")}</h1>

      {errorMessage && (
        <div className={styles.errorBox}>
          <div className={styles.errorItem}>{errorMessage}</div>
        </div>
      )}

      <form onSubmit={onSubmit} className={styles.authForm} noValidate>
        <div className={styles.formGroup}>
          <label htmlFor="login-username">{t("auth.login.usernameOrEmail")}</label>
          <input
            id="login-username"
            type="text"
            autoComplete="username"
            className={styles.formInput}
            value={username}
            onChange={(e) => { setUsername(e.target.value); clearError(); }}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="login-password">{t("auth.login.password")}</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            className={styles.formInput}
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError(); }}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className="btn primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
          </button>

          <Link href="/register" className="btn secondary">
            {t("auth.login.createAccount")}
          </Link>

          <Link href="/forgot-password" className={styles.forgotPasswordLink}>
            {t("auth.forgotPassword.title")}
          </Link>
        </div>

        <div className={styles.socialAuth}>
          <div className={styles.divider}>
            <span>{t("auth.or")}</span>
          </div>
          <a href={googleLoginUrl} className={styles.googleBtn}>
            <svg
              className={styles.googleIcon}
              viewBox="0 0 24 24"
              width="24"
              height="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t("auth.continueWithGoogle")}
          </a>
        </div>
      </form>
    </div>
  );
}
