import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { verifyAuth } from "@/lib/api/auth-middleware";
import { getAdminDb } from "@/lib/firebase/admin";
import { analyzeResumeReadiness } from "@/lib/services/resume-readiness";
import { getTierLimits } from "@/lib/config/credits";
import type { ResumeData } from "@/lib/types/resume";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USERS_COLLECTION = "users";
const RESUMES_SUBCOLLECTION = "resumes";
const CURRENT_RESUME_DOC = "current";
const REWARD_KEY = "resumeCompletionV1";
const REWARD_CREDITS = 5;

function getNextResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

interface UsageShape {
  aiCreditsUsed?: number;
  aiCreditsResetDate?: string;
  lastCreditReset?: string;
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success) return auth.response;

  const userId = auth.user.uid;
  const db = getAdminDb();

  const currentResumeRef = db
    .collection(USERS_COLLECTION)
    .doc(userId)
    .collection(RESUMES_SUBCOLLECTION)
    .doc(CURRENT_RESUME_DOC);

  const currentResumeSnap = await currentResumeRef.get();
  if (!currentResumeSnap.exists) {
    return NextResponse.json(
      { claimed: false, reason: "no_resume_draft" },
      { status: 400 }
    );
  }

  const currentResumeData = currentResumeSnap.data() as { data?: ResumeData } | undefined;
  const resumeData = currentResumeData?.data;
  if (!resumeData) {
    return NextResponse.json(
      { claimed: false, reason: "invalid_resume_data" },
      { status: 400 }
    );
  }

  const readiness = analyzeResumeReadiness(resumeData);
  if (!readiness.isReady) {
    return NextResponse.json(
      {
        claimed: false,
        reason: "resume_not_ready",
        requiredPassed: readiness.summary.required.passed,
        requiredTotal: readiness.summary.required.total,
      },
      { status: 400 }
    );
  }

  const userRef = db.collection(USERS_COLLECTION).doc(userId);

  const result = await db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);
    const userData = (userSnap.data() ?? {}) as Record<string, unknown>;
    const rawPlan = String(userData.plan ?? "free").toLowerCase();
    const plan = rawPlan === "premium" || rawPlan === "pro" || rawPlan === "ai"
      ? "premium"
      : "free";

    if (plan === "premium") {
      return { claimed: false as const, reason: "premium_plan" as const };
    }

    const rewards = (userData.rewards ?? {}) as Record<string, unknown>;
    const creditRewards = (rewards.credits ?? {}) as Record<string, unknown>;
    if (creditRewards[REWARD_KEY]) {
      return { claimed: false as const, reason: "already_claimed" as const };
    }

    const usage = (userData.usage ?? {}) as UsageShape;
    const currentUsed = Math.max(0, Number(usage.aiCreditsUsed ?? 0));
    const nextUsed = Math.max(0, currentUsed - REWARD_CREDITS);
    const resetDate =
      typeof usage.aiCreditsResetDate === "string" && usage.aiCreditsResetDate
        ? usage.aiCreditsResetDate
        : getNextResetDate();

    tx.set(
      userRef,
      {
        usage: {
          aiCreditsUsed: nextUsed,
          aiCreditsResetDate: resetDate,
          lastCreditReset:
            typeof usage.lastCreditReset === "string" && usage.lastCreditReset
              ? usage.lastCreditReset
              : new Date().toISOString(),
        },
        rewards: {
          ...rewards,
          credits: {
            ...creditRewards,
            [REWARD_KEY]: {
              credits: REWARD_CREDITS,
              awardedAt: Timestamp.now(),
              source: "resume_completion",
            },
          },
        },
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    const limits = getTierLimits("free");
    return {
      claimed: true as const,
      creditsAwarded: REWARD_CREDITS,
      creditsRemaining: Math.max(0, limits.monthlyAICredits - nextUsed),
    };
  });

  if (!result.claimed) {
    return NextResponse.json({ claimed: false, reason: result.reason }, { status: 200 });
  }

  return NextResponse.json(result, { status: 200 });
}

