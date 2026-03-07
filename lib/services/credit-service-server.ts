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

function normalizePlan(rawPlan: unknown): PlanId {
  const normalized = (rawPlan ?? "free").toString().toLowerCase();
  return normalized === "premium" || normalized === "pro" || normalized === "ai"
    ? "premium"
    : "free";
}

function createDefaultUsage(now: Date = new Date()): UserUsage {
  return {
    aiCreditsUsed: 0,
    aiCreditsResetDate: getNextResetDate(now),
    lastCreditReset: now.toISOString(),
  };
}

function normalizeUsage(
  usage: UserUsage | undefined,
  now: Date = new Date()
): { usage: UserUsage; changed: boolean } {
  if (!usage) {
    return { usage: createDefaultUsage(now), changed: true };
  }

  if (now >= new Date(usage.aiCreditsResetDate)) {
    return {
      usage: createDefaultUsage(now),
      changed: true,
    };
  }

  return { usage, changed: false };
}

function getTierLimits(plan: PlanId) {
  return plan === "premium" ? PREMIUM_TIER_LIMITS : FREE_TIER_LIMITS;
}

function getNextResetDate(now: Date = new Date()): string {
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
  return normalizePlan(metadata?.plan);
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
  const { usage, changed } = normalizeUsage(metadata?.usage);
  if (changed) {
    await updateUserUsage(userId, usage);
  }
  return usage;
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

export async function reserveCredits(
  userId: string,
  operation: string,
  plan?: PlanId
): Promise<CreditCheckResult> {
  const resolvedPlan = plan ?? (await getUserPlan(userId));
  return checkCredits(userId, operation, resolvedPlan);
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
  return confirmCredits(userId, operation, plan);
}

export async function confirmCredits(
  userId: string,
  operation: string,
  fallbackPlan?: PlanId
): Promise<CreditDeductionResult> {
  if (!isValidOperation(operation)) {
    return {
      success: false,
      creditsRequired: 0,
      creditsUsed: 0,
      creditsRemaining: 0,
      resetDate: "",
      isPremium: fallbackPlan === "premium",
      reason: "invalid_operation",
      newUsage: {
        aiCreditsUsed: 0,
        aiCreditsResetDate: "",
        lastCreditReset: "",
      },
    };
  }

  const db = getAdminDb();
  const userRef = db.collection(USERS_COLLECTION).doc(userId);
  const creditCost = getCreditCost(operation);
  const now = new Date();

  return db.runTransaction(async (tx) => {
    const snapshot = await tx.get(userRef);
    const metadata = snapshot.data() as UserMetadata | undefined;
    const plan = normalizePlan(metadata?.plan ?? fallbackPlan);
    const { usage, changed } = normalizeUsage(metadata?.usage, now);
    const isPremium = plan === "premium";
    const basePayload = {
      creditsRequired: creditCost,
      creditsUsed: usage.aiCreditsUsed,
      creditsRemaining: isPremium
        ? Infinity
        : Math.max(0, getTierLimits(plan).monthlyAICredits - usage.aiCreditsUsed),
      resetDate: usage.aiCreditsResetDate,
      isPremium,
    };

    if (isPremiumOnlyFeature(operation) && !isPremium) {
      if (changed) {
        tx.set(
          userRef,
          {
            usage,
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
      }

      return {
        success: false,
        ...basePayload,
        reason: "premium_required" as const,
        newUsage: usage,
      };
    }

    if (isPremium) {
      if (changed) {
        tx.set(
          userRef,
          {
            usage,
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
      }

      return {
        success: true,
        ...basePayload,
        newUsage: usage,
      };
    }

    const limits = getTierLimits(plan);
    const creditsRemaining = limits.monthlyAICredits - usage.aiCreditsUsed;
    if (creditsRemaining < creditCost) {
      if (changed) {
        tx.set(
          userRef,
          {
            usage,
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
      }

      return {
        success: false,
        ...basePayload,
        reason: "insufficient_credits" as const,
        newUsage: usage,
      };
    }

    const newUsage: UserUsage = {
      ...usage,
      aiCreditsUsed: usage.aiCreditsUsed + creditCost,
    };

    tx.set(
      userRef,
      {
        usage: newUsage,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    return {
      success: true,
      creditsRequired: creditCost,
      creditsUsed: newUsage.aiCreditsUsed,
      creditsRemaining: Math.max(0, limits.monthlyAICredits - newUsage.aiCreditsUsed),
      resetDate: newUsage.aiCreditsResetDate,
      isPremium: false,
      newUsage,
    };
  });
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
  return confirmCredits(userId, operation, plan);
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
