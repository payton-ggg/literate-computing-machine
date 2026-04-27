"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { meApi } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";
import { toast } from "@/lib/toast";

export type EmailChangeStep = "idle" | "current" | "new-email" | "new";

function validatePasswordStrength(pwd: string, t: ReturnType<typeof useTranslations>): string[] {
  if (!pwd) return [];
  if (/[а-яёА-ЯЁ]/.test(pwd)) return [t("auth.passwordValidation.noCyrillic")];
  const errors: string[] = [];
  if (pwd.length < 8) errors.push(t("auth.passwordValidation.tooShort"));
  if (pwd.length > 64) errors.push(t("auth.passwordValidation.tooLong"));
  if (!/[A-Z]/.test(pwd)) errors.push(t("auth.passwordValidation.needUppercase"));
  if (!/[a-z]/.test(pwd)) errors.push(t("auth.passwordValidation.needLowercase"));
  if (!/[0-9]/.test(pwd)) errors.push(t("auth.passwordValidation.needDigit"));
  if (!/[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/.test(pwd))
    errors.push(t("auth.passwordValidation.needSpecial"));
  return errors;
}

export function useSettings() {
  const t = useTranslations();
  const { user, setUser } = useAuthStore();

  // Profile
  const [username, setUsername] = useState(user?.username ?? "");
  const isGoogleAccount = !!user?.has_google;

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Reserve password (Google accounts)
  const [reservePassword, setReservePassword] = useState("");
  const [reservePasswordConfirm, setReservePasswordConfirm] = useState("");
  const [showReservePassword, setShowReservePassword] = useState(false);

  // Email change wizard
  const [emailChangeStep, setEmailChangeStep] = useState<EmailChangeStep>("idle");
  const [currentEmailCode, setCurrentEmailCode] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newEmailCode, setNewEmailCode] = useState("");
  const [pendingNewEmail, setPendingNewEmail] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  // Resend timer
  const [resendTimer, setResendTimer] = useState(0);
  const resendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startResendTimer = (seconds = 59) => {
    setResendTimer(seconds);
    if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
    resendIntervalRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(resendIntervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
    };
  }, []);

  // Masked email
  const maskedEmail = (() => {
    const e = user?.email ?? "";
    if (!e) return "";
    const [local, domain] = e.split("@");
    return `${local[0]}${"*".repeat(Math.min(local.length - 1, 5))}@${domain}`;
  })();

  // Wizard next enabled
  const wizardNextEnabled =
    (emailChangeStep === "current" && currentEmailCode.length === 6) ||
    (emailChangeStep === "new-email" && !!newEmail) ||
    (emailChangeStep === "new" && newEmailCode.length === 6);

  // Live password validation errors
  const passwordErrors = (() => {
    if (isGoogleAccount && showReservePassword && reservePassword)
      return validatePasswordStrength(reservePassword, t);
    if (!isGoogleAccount && newPassword)
      return validatePasswordStrength(newPassword, t);
    return [];
  })();

  const cancelEmailChange = () => {
    setEmailChangeStep("idle");
    setCurrentEmailCode("");
    setNewEmail("");
    setNewEmailCode("");
    setPendingNewEmail("");
    setError("");
    if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
    setResendTimer(0);
  };

  const startEmailChange = async () => {
    try {
      setEmailSubmitting(true);
      setError("");
      await meApi.sendCurrentEmailCode();
      setEmailChangeStep("current");
      startResendTimer();
      toast.info(t("auth.accountSettings.currentEmailCodeSent"));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.response?.data?.error ?? t("common.error"));
    } finally {
      setEmailSubmitting(false);
    }
  };

  const resendCurrentCode = async () => {
    try {
      await meApi.sendCurrentEmailCode();
      startResendTimer();
      toast.info(t("auth.accountSettings.currentEmailCodeSent"));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t("common.error"));
    }
  };

  const resendNewCode = async () => {
    try {
      await meApi.resendNewEmailCode();
      startResendTimer();
      toast.info(t("auth.accountSettings.newEmailCodeSent"));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t("common.error"));
    }
  };

  const wizardBack = () => {
    setError("");
    if (emailChangeStep === "current") { cancelEmailChange(); return; }
    if (emailChangeStep === "new-email") { setEmailChangeStep("current"); return; }
    if (emailChangeStep === "new") { setEmailChangeStep("new-email"); return; }
  };

  const wizardNext = async () => {
    setError("");

    if (emailChangeStep === "current") {
      setEmailSubmitting(true);
      try {
        await meApi.confirmCurrentEmailCode(currentEmailCode);
        setEmailChangeStep("new-email");
      } catch (err: any) {
        setError(err?.response?.data?.message ?? err?.response?.data?.error ?? t("common.error"));
      } finally {
        setEmailSubmitting(false);
      }
      return;
    }

    if (emailChangeStep === "new-email") {
      setEmailSubmitting(true);
      try {
        await meApi.confirmCurrentAndSetNew(currentEmailCode, newEmail);
        setPendingNewEmail(newEmail);
        setEmailChangeStep("new");
        startResendTimer();
        toast.info(t("auth.accountSettings.newEmailCodeSent"));
      } catch (err: any) {
        setError(err?.response?.data?.message ?? err?.response?.data?.error ?? t("common.error"));
      } finally {
        setEmailSubmitting(false);
      }
      return;
    }

    if (emailChangeStep === "new") {
      setEmailSubmitting(true);
      try {
        await meApi.confirmNewEmail(newEmailCode);
        if (user) setUser({ ...user, email: pendingNewEmail });
        toast.success(t("common.saved"));
        cancelEmailChange();
      } catch (err: any) {
        setError(err?.response?.data?.message ?? err?.response?.data?.error ?? t("common.error"));
      } finally {
        setEmailSubmitting(false);
      }
    }
  };

  const onSave = async () => {
    if (!username) {
      setError(t("auth.register.validation.usernameRequired"));
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await meApi.updateProfile(username);
      if (user) setUser({ ...user, username });

      if (!isGoogleAccount && (newPassword || currentPassword || confirmPassword)) {
        if (!currentPassword) {
          setError(t("auth.accountSettings.currentPasswordRequired"));
          return;
        }
        const pwdErrs = validatePasswordStrength(newPassword, t);
        if (pwdErrs.length) { setError(pwdErrs[0]); return; }
        if (newPassword !== confirmPassword) {
          setError(t("auth.register.validation.passwordMismatch"));
          return;
        }
        await meApi.changePassword(currentPassword, newPassword);
      }

      if (isGoogleAccount && reservePassword) {
        const pwdErrs = validatePasswordStrength(reservePassword, t);
        if (pwdErrs.length) { setError(pwdErrs[0]); return; }
        if (reservePassword !== reservePasswordConfirm) {
          setError(t("auth.register.validation.passwordMismatch"));
          return;
        }
        await meApi.addEmailPassword(user!.email, reservePassword);
      }

      setSuccessMessage(t("common.saved"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setReservePassword("");
      setReservePasswordConfirm("");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.response?.data?.error ?? t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // profile
    username, setUsername,
    email: user?.email ?? "",
    isGoogleAccount,
    maskedEmail,
    // state
    isSubmitting, error, setError,
    successMessage, setSuccessMessage,
    // password
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    reservePassword, setReservePassword,
    reservePasswordConfirm, setReservePasswordConfirm,
    showReservePassword, setShowReservePassword,
    passwordErrors,
    // email wizard
    emailChangeStep, emailSubmitting,
    currentEmailCode, setCurrentEmailCode,
    newEmail, setNewEmail,
    newEmailCode, setNewEmailCode,
    pendingNewEmail,
    resendTimer, wizardNextEnabled,
    startEmailChange, cancelEmailChange,
    resendCurrentCode, resendNewCode,
    wizardBack, wizardNext,
    // save
    onSave,
  };
}
