import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  AI_CREDIT_COSTS,
  AIOperation,
  FREE_TIER_LIMITS,
  PREMIUM_TIER_LIMITS,
  getCreditCost,
  isValidOperation,
  isPremiumOnlyFeature,
} from "@/lib/config/credits";

export interface UserUsage {
  aiCreditsUsed: number;
  aiCreditsResetDate: string;
  lastCreditReset: string;
}

export interface UserMetadata {
  plan?: "free" | "premium" | string;
  usage?: UserUsage;
}

export type PlanId = "free" | "premium";

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

const USERS_COLLECTION = "users";

function getTierLimits(plan: PlanId) {
  return plan === "premium" ? PREMIUM_TIER_LIMITS : FREE_TIER_LIMITS;
}

function getNextResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

async function getUserMetadata(userId: string): Promise<UserMetadata | null> {
  const docRef = getAdminDb().collection(USERS_COLLECTION).doc(userId);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return null;
  return docSnap.data() as UserMetadata;
}

export async function getUserPlan(userId: string): Promise<PlanId> {
  const metadata = await getUserMetadata(userId);
  const rawPlan = (metadata?.plan ?? "free").toString().toLowerCase();

  // Backward-compat for older plan labels in Firestore rules/data.
  if (rawPlan === "premium" || rawPlan === "pro" || rawPlan === "ai") {
    return "premium";
  }

  return "free";
}

async function updateUserUsage(
  userId: string,
  usage: UserUsage
): Promise<void> {
  const docRef = getAdminDb().collection(USERS_COLLECTION).doc(userId);
  await docRef.set(
    {
      usage,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

async function getUserUsage(userId: string): Promise<UserUsage> {
  const metadata = await getUserMetadata(userId);
  const usage = metadata?.usage;

  const defaultUsage: UserUsage = {
    aiCreditsUsed: 0,
    aiCreditsResetDate: getNextResetDate(),
    lastCreditReset: new Date().toISOString(),
  };

  if (!usage) {
    await updateUserUsage(userId, defaultUsage);
    return defaultUsage;
  }

  if (new Date() >= new Date(usage.aiCreditsResetDate)) {
    const newUsage: UserUsage = {
      aiCreditsUsed: 0,
      aiCreditsResetDate: getNextResetDate(),
      lastCreditReset: new Date().toISOString(),
    };
    await updateUserUsage(userId, newUsage);
    return newUsage;
  }

  return usage;
}

async function addCreditsUsed(
  userId: string,
  credits: number
): Promise<UserUsage> {
  const usage = await getUserUsage(userId);
  const newUsage: UserUsage = {
    ...usage,
    aiCreditsUsed: usage.aiCreditsUsed + credits,
  };
  await updateUserUsage(userId, newUsage);
  return newUsage;
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

  if (isPremiumOnlyFeature(operation) && plan !== "premium") {
    const usage = await getUserUsage(userId);
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
  const usage = await getUserUsage(userId);
  const limits = getTierLimits(plan);
  const isPremium = plan === "premium";

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

  const creditCost = getCreditCost(operation);
  const newUsage = await addCreditsUsed(userId, creditCost);

  const limits = getTierLimits(plan);
  const creditsRemaining =
    plan === "premium"
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
 * Reset credits for a user (admin-only, server-side)
 */
export async function resetCredits(userId: string): Promise<UserUsage> {
  const newUsage: UserUsage = {
    aiCreditsUsed: 0,
    aiCreditsResetDate: getNextResetDate(),
    lastCreditReset: new Date().toISOString(),
  };
  await updateUserUsage(userId, newUsage);
  return newUsage;
}

/**
 * Update user plan (admin-only, server-side via Admin SDK)
 */
export async function updatePlan(
  userId: string,
  plan: PlanId
): Promise<void> {
  const docRef = getAdminDb().collection(USERS_COLLECTION).doc(userId);
  await docRef.set(
    {
      plan,
      subscription: { plan, status: "active" },
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

export { AI_CREDIT_COSTS };
export type { AIOperation };
