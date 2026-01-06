/**
 * Credit Service
 *
 * Handles AI credit checking, deduction, and validation.
 * Works with Firestore for persistence.
 */

import { firestoreService, UserUsage, PlanId } from "./firestore";
import {
  AI_CREDIT_COSTS,
  AIOperation,
  FREE_TIER_LIMITS,
  PREMIUM_TIER_LIMITS,
  getCreditCost,
  isValidOperation,
  isPremiumOnlyFeature,
} from "@/lib/config/credits";

export interface CreditCheckResult {
  success: boolean;
  creditsRequired: number;
  creditsUsed: number;
  creditsRemaining: number;
  resetDate: string;
  isPremium: boolean;
  reason?: "insufficient_credits" | "premium_required" | "invalid_operation";
}

export interface CreditDeductionResult extends CreditCheckResult {
  newUsage: UserUsage;
}

/**
 * Get tier limits based on plan
 */
export function getTierLimits(plan: PlanId) {
  return plan === "premium" ? PREMIUM_TIER_LIMITS : FREE_TIER_LIMITS;
}

/**
 * Check if user can use credits for an operation
 * Does NOT deduct credits - use deductCredits for that
 */
export async function checkCredits(
  userId: string,
  operation: string,
  plan: PlanId = "free"
): Promise<CreditCheckResult> {
  // Validate operation
  if (!isValidOperation(operation)) {
    return {
      success: false,
      creditsRequired: 0,
      creditsUsed: 0,
      creditsRemaining: 0,
      resetDate: "",
      isPremium: plan === "premium",
      reason: "invalid_operation",
    };
  }

  // Check if premium-only feature
  if (isPremiumOnlyFeature(operation) && plan !== "premium") {
    const usage = await firestoreService.getUserUsage(userId);
    const limits = getTierLimits(plan);
    return {
      success: false,
      creditsRequired: getCreditCost(operation),
      creditsUsed: usage.aiCreditsUsed,
      creditsRemaining: Math.max(0, limits.monthlyAICredits - usage.aiCreditsUsed),
      resetDate: usage.aiCreditsResetDate,
      isPremium: false,
      reason: "premium_required",
    };
  }

  const creditCost = getCreditCost(operation);
  const usage = await firestoreService.getUserUsage(userId);
  const limits = getTierLimits(plan);
  const isPremium = plan === "premium";

  // Premium users have unlimited credits
  if (isPremium) {
    return {
      success: true,
      creditsRequired: creditCost,
      creditsUsed: usage.aiCreditsUsed,
      creditsRemaining: Infinity,
      resetDate: usage.aiCreditsResetDate,
      isPremium: true,
    };
  }

  // Free tier - check credits
  const creditsRemaining = limits.monthlyAICredits - usage.aiCreditsUsed;
  const hasEnoughCredits = creditsRemaining >= creditCost;

  return {
    success: hasEnoughCredits,
    creditsRequired: creditCost,
    creditsUsed: usage.aiCreditsUsed,
    creditsRemaining: Math.max(0, creditsRemaining),
    resetDate: usage.aiCreditsResetDate,
    isPremium: false,
    reason: hasEnoughCredits ? undefined : "insufficient_credits",
  };
}

/**
 * Deduct credits for an operation
 * Returns updated usage after deduction
 */
export async function deductCredits(
  userId: string,
  operation: AIOperation,
  plan: PlanId = "free"
): Promise<CreditDeductionResult> {
  const check = await checkCredits(userId, operation, plan);

  if (!check.success) {
    return {
      ...check,
      newUsage: {
        aiCreditsUsed: check.creditsUsed,
        aiCreditsResetDate: check.resetDate,
        lastCreditReset: "",
      },
    };
  }

  // Premium users don't deduct (but we still track for analytics)
  const creditCost = getCreditCost(operation);
  const newUsage = await firestoreService.addCreditsUsed(userId, creditCost);

  const limits = getTierLimits(plan);
  const creditsRemaining = plan === "premium"
    ? Infinity
    : Math.max(0, limits.monthlyAICredits - newUsage.aiCreditsUsed);

  return {
    success: true,
    creditsRequired: creditCost,
    creditsUsed: newUsage.aiCreditsUsed,
    creditsRemaining,
    resetDate: newUsage.aiCreditsResetDate,
    isPremium: plan === "premium",
    newUsage,
  };
}

/**
 * Check and deduct credits in one operation
 * Returns error result if insufficient credits
 */
export async function checkAndDeductCredits(
  userId: string,
  operation: string,
  plan: PlanId = "free"
): Promise<CreditDeductionResult> {
  if (!isValidOperation(operation)) {
    return {
      success: false,
      creditsRequired: 0,
      creditsUsed: 0,
      creditsRemaining: 0,
      resetDate: "",
      isPremium: plan === "premium",
      reason: "invalid_operation",
      newUsage: {
        aiCreditsUsed: 0,
        aiCreditsResetDate: "",
        lastCreditReset: "",
      },
    };
  }

  return deductCredits(userId, operation, plan);
}

/**
 * Get current credit status for UI display
 */
export async function getCreditStatus(
  userId: string,
  plan: PlanId = "free"
): Promise<{
  creditsUsed: number;
  creditsRemaining: number;
  totalCredits: number;
  resetDate: string;
  isPremium: boolean;
  percentageUsed: number;
}> {
  const usage = await firestoreService.getUserUsage(userId);
  const limits = getTierLimits(plan);
  const isPremium = plan === "premium";

  const totalCredits = limits.monthlyAICredits;
  const creditsRemaining = isPremium
    ? Infinity
    : Math.max(0, totalCredits - usage.aiCreditsUsed);
  const percentageUsed = isPremium
    ? 0
    : Math.min(100, (usage.aiCreditsUsed / totalCredits) * 100);

  return {
    creditsUsed: usage.aiCreditsUsed,
    creditsRemaining,
    totalCredits,
    resetDate: usage.aiCreditsResetDate,
    isPremium,
    percentageUsed,
  };
}

/**
 * Reset credits for a user (admin/dev only)
 */
export async function resetCredits(userId: string): Promise<UserUsage> {
  return firestoreService.resetUserCredits(userId);
}

/**
 * Update user plan (admin/dev only)
 */
export async function updatePlan(
  userId: string,
  plan: PlanId
): Promise<boolean> {
  return firestoreService.updateUserPlan(userId, plan);
}

// Re-export types and constants for convenience
export { AI_CREDIT_COSTS, FREE_TIER_LIMITS, PREMIUM_TIER_LIMITS };
export type { AIOperation };
