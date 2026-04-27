"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

interface BillingIssue {
  error?: string;
  estimated_tokens?: number;
  estimated_ppu_cents?: number;
  ppu_remaining_cents?: number;
  ppu_spending_limit_cents?: number;
}

export function useBillingIssue() {
  const router = useRouter();
  const [activeBillingIssue, setActiveBillingIssue] =
    useState<BillingIssue | null>(null);

  const billingIssueMode = useMemo(
    () => activeBillingIssue?.error || "insufficient_balance",
    [activeBillingIssue],
  );

  const billingIssueAvailable = 0;

  const billingIssueEstimatedPpuCents = useMemo(
    () => activeBillingIssue?.estimated_ppu_cents || 0,
    [activeBillingIssue],
  );

  const billingIssuePpuRemainingCents = useMemo(
    () => activeBillingIssue?.ppu_remaining_cents || 0,
    [activeBillingIssue],
  );

  const billingIssuePpuSpendingLimitCents = useMemo(
    () => activeBillingIssue?.ppu_spending_limit_cents || 0,
    [activeBillingIssue],
  );

  const showEnablePpuAction = useMemo(
    () => billingIssueMode === "insufficient_balance",
    [billingIssueMode],
  );

  const showIncreaseLimitAction = useMemo(
    () => billingIssueMode === "ppu_limit_reached",
    [billingIssueMode],
  );

  const closeBillingIssueModal = useCallback(() => {
    setActiveBillingIssue(null);
  }, []);

  const openPricingPage = useCallback(() => {
    setActiveBillingIssue(null);
    router.push("/pricing");
  }, [router]);

  const openBillingPage = useCallback(() => {
    setActiveBillingIssue(null);
    router.push("/billing");
  }, [router]);

  return {
    activeBillingIssue,
    setActiveBillingIssue,
    billingIssueMode,
    billingIssueAvailable,
    billingIssueEstimatedPpuCents,
    billingIssuePpuRemainingCents,
    billingIssuePpuSpendingLimitCents,
    showEnablePpuAction,
    showIncreaseLimitAction,
    closeBillingIssueModal,
    openPricingPage,
    openBillingPage,
  };
}
