"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { authApi } from "@/modules/auth/api/auth.api";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { toast } from "@/lib/toast";
import styles from "./RegisterForm.module.css";

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,30}$/;
const PASSWORD_PATTERN = /^[\x21-\x7E]{8,64}$/;

interface Props {
  redirectPath: string | null;
}

export default function RegisterForm({ redirectPath }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [backendError, setBackendError] = useState("");

  const hasErrors = !!(
    usernameError ||
    emailError ||
    passwordError ||
    confirmError ||
    backendError
  );

  const [googleLoginUrl, setGoogleLoginUrl] = useState(
    "/api/auth/google/login",
  );
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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectPath ?? "/");
    }
  }, [isAuthenticated, redirectPath, router]);

  const validateUsername = useCallback(
    (val: string) => {
      if (!val) {
        setUsernameError("");
        return;
      }
      if (!USERNAME_PATTERN.test(val)) {
        setUsernameError(t("auth.register.validation.usernamePattern"));
      } else {
        setUsernameError("");
      }
    },
    [t],
  );

  const validateEmail = useCallback(
    (val: string) => {
      if (!val) {
        setEmailError("");
        return;
      }
      if (!val.includes("@")) {
        setEmailError(t("auth.register.validation.emailInvalid"));
      } else {
        setEmailError("");
      }
    },
    [t],
  );

  const validatePassword = useCallback(
    (val: string) => {
      if (!val) {
        setPasswordError("");
        return;
      }
      if (!PASSWORD_PATTERN.test(val)) {
        setPasswordError(t("auth.register.validation.passwordPattern"));
      } else {
        setPasswordError("");
      }
    },
    [t],
  );

  const validateConfirm = useCallback(
    (val: string, pass: string) => {
      if (!val) {
        setConfirmError("");
        return;
      }
      if (pass !== val) {
        setConfirmError(t("auth.register.validation.passwordMismatch"));
      } else {
        setConfirmError("");
      }
    },
    [t],
  );

  const validateAll = () => {
    let isValid = true;

    validateUsername(username);
    validateEmail(email);
    validatePassword(password);
    validateConfirm(confirmPassword, password);

    if (!username) {
      setUsernameError(t("auth.register.validation.usernameRequired"));
      isValid = false;
    } else if (!USERNAME_PATTERN.test(username)) {
      isValid = false;
    }

    if (!email) {
      setEmailError(t("auth.register.validation.emailRequired"));
      isValid = false;
    } else if (!email.includes("@")) {
      isValid = false;
    }

    if (!password) {
      setPasswordError(t("auth.register.validation.passwordRequired"));
      isValid = false;
    } else if (!PASSWORD_PATTERN.test(password)) {
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmError(t("auth.register.validation.confirmRequired"));
      isValid = false;
    } else if (password !== confirmPassword) {
      isValid = false;
    }

    return isValid;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBackendError("");

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.register({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      if (response.data && response.data.requires_verification) {
        toast.info(t("toasts.auth.pleaseVerify"));
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        return;
      }

      toast.success(t("auth.register.success"));
      router.replace(redirectPath ?? "/");
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string; error?: string } };
      };
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        t("auth.register.failed");

      setBackendError(message);
      console.error("Registration failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.authCard}>
      <h1 className={styles.authTitle}>{t("auth.register.title")}</h1>

      {hasErrors && (
        <div className={styles.errorBox}>
          {backendError && (
            <div className={styles.backendError}>{backendError}</div>
          )}
          {usernameError && (
            <div className={styles.errorItem}>{usernameError}</div>
          )}
          {emailError && <div className={styles.errorItem}>{emailError}</div>}
          {passwordError && (
            <div className={styles.errorItem}>{passwordError}</div>
          )}
          {confirmError && (
            <div className={styles.errorItem}>{confirmError}</div>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} className={styles.authForm} noValidate>
        {/* Username */}
        <div className={styles.formGroup}>
          <label htmlFor="register-username">
            {t("auth.register.username")}
          </label>
          <input
            id="register-username"
            type="text"
            autoComplete="username"
            className={`${styles.formInput} ${usernameError ? styles.hasError : ""}`}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              validateUsername(e.target.value);
            }}
            disabled={isSubmitting}
          />
        </div>

        {/* Email */}
        <div className={styles.formGroup}>
          <label htmlFor="register-email">{t("auth.register.email")}</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            className={`${styles.formInput} ${emailError ? styles.hasError : ""}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateEmail(e.target.value);
            }}
            disabled={isSubmitting}
          />
        </div>

        {/* Password */}
        <div className={styles.formGroup}>
          <label htmlFor="register-password">
            {t("auth.register.password")}
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            className={`${styles.formInput} ${passwordError ? styles.hasError : ""}`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
              if (confirmPassword) {
                validateConfirm(confirmPassword, e.target.value);
              }
            }}
            disabled={isSubmitting}
          />
        </div>

        {/* Confirm Password */}
        <div className={styles.formGroup}>
          <label htmlFor="register-confirm">
            {t("auth.register.confirmPassword")}
          </label>
          <input
            id="register-confirm"
            type="password"
            autoComplete="new-password"
            className={`${styles.formInput} ${confirmError ? styles.hasError : ""}`}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              validateConfirm(e.target.value, password);
            }}
            disabled={isSubmitting}
          />
        </div>

        {/* Actions */}
        <div className={styles.formActions}>
          <button type="submit" className="btn primary" disabled={isSubmitting}>
            {isSubmitting
              ? t("auth.register.submitting")
              : t("auth.register.submit")}
          </button>

          <Link href="/login" className="btn secondary">
            {t("auth.register.hasAccount")}
          </Link>
        </div>

        {/* Google OAuth */}
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
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t("auth.continueWithGoogle")}
          </a>
        </div>
      </form>
    </div>
  );
}
