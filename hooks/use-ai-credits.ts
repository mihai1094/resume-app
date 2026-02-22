"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "./use-user";
import {
  getCreditStatus,
  checkCredits,
  deductCredits,
  AI_CREDIT_COSTS,
  AIOperation,
  FREE_TIER_LIMITS,
  CreditCheckResult,
} from "@/lib/services/credit-service";
import { PlanId } from "@/lib/services/firestore";
import { isPremiumOnlyFeature, getCreditCost } from "@/lib/config/credits";
import { isAdminUser } from "@/lib/config/admin";
import { getAuth } from "firebase/auth";
import {
  AI_CREDITS_UPDATED_EVENT,
  type AICreditsUpdateDetail,
} from "@/lib/constants/ai-credits-events";

export interface CreditStatus {
  creditsUsed: number;
  creditsRemaining: number;
  totalCredits: number;
  resetDate: string;
  isPremium: boolean;
  percentageUsed: number;
}

export interface UseAICreditsReturn {
  // Credit status
  status: CreditStatus | null;
  isLoading: boolean;
  error: string | null;

  // Plan info
  isPremium: boolean;
  plan: PlanId;

  // Credit checks
  canUseCredits: (operation: AIOperation) => boolean;
  getCreditsNeeded: (operation: AIOperation) => number;
  checkOperation: (operation: AIOperation) => Promise<CreditCheckResult>;

  // Credit operations
  consumeCredits: (
    operation: AIOperation,
  ) => Promise<{ success: boolean; error?: string }>;
  refreshStatus: () => Promise<void>;

  // Admin/Dev operations
  isAdmin: boolean;
  resetUserCredits: () => Promise<void>;
  switchPlan: (plan: PlanId) => Promise<void>;
}

export function useAICredits(): UseAICreditsReturn {
  const { user } = useUser();
  const [status, setStatus] = useState<CreditStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const plan = (user?.plan ?? "free") as PlanId;
  const isPremium = plan === "premium";
  const isAdmin = isAdminUser(user?.email);
  // Allow dev tools in development mode for any user
  const canUseDevTools = isAdmin || process.env.NODE_ENV === "development";

  // Fetch credit status
  const refreshStatus = useCallback(async () => {
    if (!user?.id) {
      setStatus(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const creditStatus = await getCreditStatus(user.id, plan);
      setStatus(creditStatus);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch credit status:", err);
      setError("Failed to load credit status");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, plan]);

  // Initial load
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Keep local credit pills in sync after any AI API request updates credit headers.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleCreditsUpdated = (event: Event) => {
      if (!user?.id) return;

      const detail = (event as CustomEvent<AICreditsUpdateDetail>).detail;
      if (!detail) {
        void refreshStatus();
        return;
      }

      setStatus((prev) => {
        if (!prev) {
          void refreshStatus();
          return prev;
        }

        const nextIsPremium = detail.isPremium ?? prev.isPremium;
        const nextCreditsUsed = detail.creditsUsed ?? prev.creditsUsed;
        const nextCreditsRemaining =
          detail.creditsRemaining ??
          (nextIsPremium ? Infinity : Math.max(0, prev.totalCredits - nextCreditsUsed));
        const nextTotalCredits = nextIsPremium ? prev.totalCredits : prev.totalCredits;
        const nextPercentageUsed = nextIsPremium
          ? 0
          : Math.min(100, (nextCreditsUsed / nextTotalCredits) * 100);

        return {
          ...prev,
          creditsUsed: nextCreditsUsed,
          creditsRemaining: nextCreditsRemaining,
          resetDate: detail.resetDate ?? prev.resetDate,
          isPremium: nextIsPremium,
          percentageUsed: nextPercentageUsed,
        };
      });
      setError(null);
      setIsLoading(false);
    };

    window.addEventListener(
      AI_CREDITS_UPDATED_EVENT,
      handleCreditsUpdated as EventListener
    );
    return () => {
      window.removeEventListener(
        AI_CREDITS_UPDATED_EVENT,
        handleCreditsUpdated as EventListener
      );
    };
  }, [user?.id, refreshStatus]);

  // Check if user can use credits for an operation (sync check)
  const canUseCredits = useCallback(
    (operation: AIOperation): boolean => {
      if (isPremium) return true;
      if (!status) return false;

      // Check if premium-only feature
      if (isPremiumOnlyFeature(operation)) return false;

      const cost = getCreditCost(operation);
      return status.creditsRemaining >= cost;
    },
    [isPremium, status],
  );

  // Get credits needed for an operation
  const getCreditsNeeded = useCallback((operation: AIOperation): number => {
    return getCreditCost(operation);
  }, []);

  // Check operation (async, full check)
  const checkOperation = useCallback(
    async (operation: AIOperation): Promise<CreditCheckResult> => {
      if (!user?.id) {
        return {
          success: false,
          creditsRequired: getCreditCost(operation),
          creditsUsed: 0,
          creditsRemaining: 0,
          resetDate: "",
          isPremium: false,
          reason: "insufficient_credits",
        };
      }
      return checkCredits(user.id, operation, plan);
    },
    [user?.id, plan],
  );

  // Consume credits for an operation
  const consumeCredits = useCallback(
    async (
      operation: AIOperation,
    ): Promise<{ success: boolean; error?: string }> => {
      if (!user?.id) {
        return { success: false, error: "Not authenticated" };
      }

      try {
        const result = await deductCredits(user.id, operation, plan);

        if (!result.success) {
          if (result.reason === "premium_required") {
            return { success: false, error: "This feature requires Premium" };
          }
          if (result.reason === "insufficient_credits") {
            return {
              success: false,
              error: `Not enough credits. You need ${result.creditsRequired} but have ${result.creditsRemaining}`,
            };
          }
          return { success: false, error: "Failed to use credits" };
        }

        // Update local status
        setStatus((prev) =>
          prev
            ? {
                ...prev,
                creditsUsed: result.creditsUsed,
                creditsRemaining: result.creditsRemaining,
                percentageUsed: isPremium
                  ? 0
                  : Math.min(
                      100,
                      (result.creditsUsed / FREE_TIER_LIMITS.monthlyAICredits) *
                        100,
                    ),
              }
            : null,
        );

        return { success: true };
      } catch (err) {
        console.error("Failed to use credits:", err);
        return { success: false, error: "Failed to use credits" };
      }
    },
    [user?.id, plan, isPremium],
  );

  // Helper to call admin API with auth token
  const callAdminApi = useCallback(
    async (body: Record<string, unknown>) => {
      const token = await getAuth().currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Admin API request failed");
      }
      return res.json();
    },
    [],
  );

  // Admin/Dev: Reset credits (via server-only admin API)
  const resetUserCredits = useCallback(async () => {
    if (!user?.id || !canUseDevTools) return;

    try {
      await callAdminApi({ action: "reset-credits" });
      await refreshStatus();
    } catch (err) {
      console.error("Failed to reset credits:", err);
    }
  }, [user?.id, canUseDevTools, refreshStatus, callAdminApi]);

  // Admin/Dev: Switch plan (via server-only admin API)
  const switchPlan = useCallback(
    async (newPlan: PlanId) => {
      if (!user?.id || !canUseDevTools) return;

      try {
        await callAdminApi({ action: "switch-plan", plan: newPlan });
        window.location.reload();
      } catch (err) {
        console.error("Failed to switch plan:", err);
      }
    },
    [user?.id, canUseDevTools, callAdminApi],
  );

  return {
    status,
    isLoading,
    error,
    isPremium,
    plan,
    canUseCredits,
    getCreditsNeeded,
    checkOperation,
    consumeCredits,
    refreshStatus,
    isAdmin,
    resetUserCredits,
    switchPlan,
  };
}

// Export types and constants
export { AI_CREDIT_COSTS };
export type { AIOperation };
