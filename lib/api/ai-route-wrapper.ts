/**
 * AI Route Wrapper
 *
 * Standardized wrapper for all AI API routes.
 * Enforces correct ordering: auth → rate limit → parse → validate → transactional credit charge → handler
 */

import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, rateLimitResponse } from "./rate-limit";
import { withTimeout, TimeoutError, timeoutResponse } from "./timeout";
import { verifyAuth } from "./auth-middleware";
import {
  confirmCreditsForOperation,
  refundCreditsForOperation,
} from "./credit-middleware";
import { aiLogger } from "@/lib/services/logger";
import { resolvePrivacyMode, type AIPrivacyMode } from "@/lib/ai/privacy";
import { isLaunchFeatureEnabled, type LaunchFeatureKey } from "@/config/launch";
import { enforceAiAbuseGuard } from "@/lib/services/abuse-guard";
import { AI_CREDITS_HEADERS } from "@/lib/constants/ai-credits-events";
import { z } from "zod";
import type { AIOperation } from "@/lib/config/credits";

export interface AIRouteOptions<T = unknown> {
  /** AI operation key for credit deduction (skips credits if omitted) */
  creditOperation?: AIOperation;
  /** Enable rate limiting (default: true) */
  rateLimit?: boolean;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Zod validation schema for request body */
  schema?: z.ZodSchema<T>;
  /** Require authentication (default: true) */
  requireAuth?: boolean;
  /** Optional launch feature gate; if omitted, route path mapping is used */
  launchFeature?: LaunchFeatureKey;
}

export interface AIRouteContext {
  userId: string;
  plan?: string;
  privacyMode: AIPrivacyMode;
}

type CreditMeta = {
  creditsUsed: number;
  creditsRemaining: number;
  resetDate: string;
  isPremium: boolean;
};

/**
 * Wrap an AI route handler with security features.
 *
 * Order of operations (P0 compliant):
 * 1. Authentication
 * 2. Rate limiting (user-aware)
 * 3. Parse request body
 * 4. Validate request body (schema)
 * 5. Charge credits transactionally
 * 6. Execute handler with timeout
 * 7. Refund credits on failure
 *
 * Credits are NEVER deducted before validation passes.
 */
export function withAIRoute<T = unknown>(
  handler: (
    body: T,
    ctx: AIRouteContext,
    request: NextRequest
  ) => Promise<NextResponse | Record<string, unknown>>,
  options: AIRouteOptions<T> = {}
) {
  const {
    creditOperation,
    rateLimit: enableRateLimit = true,
    timeout = 30000,
    schema,
    requireAuth = true,
    launchFeature,
  } = options;

  const pathFeatureMap: Record<string, LaunchFeatureKey> = {
    "/api/ai/generate-bullets": "aiGenerateBullets",
    "/api/ai/generate-summary": "aiGenerateSummary",
    "/api/ai/improve-bullet": "aiImproveBullet",
    "/api/ai/generate-cover-letter": "aiGenerateCoverLetter",
    "/api/ai/analyze-ats": "aiAnalyzeAts",
    "/api/ai/analyze-text": "aiAnalyzeText",
    "/api/ai/generate-improvement": "aiGenerateImprovement",
    "/api/ai/ghost-suggest": "aiGhostSuggest",
    "/api/ai/quantify-achievement": "aiQuantifyAchievement",
    "/api/ai/score-resume": "aiScoreResume",
    "/api/ai/suggest-skills": "aiSuggestSkills",
    "/api/ai/tailor-resume": "tailorResume",
    "/api/ai/batch-enhance": "batchEnhance",
    "/api/ai/interview-prep": "interviewPrep",
    "/api/ai/optimize-linkedin": "linkedinTools",
  };

  const applyCreditHeaders = (response: Response, creditMeta?: CreditMeta) => {
    if (!creditMeta) return response;
    response.headers.set(AI_CREDITS_HEADERS.updated, "1");
    response.headers.set(AI_CREDITS_HEADERS.used, String(creditMeta.creditsUsed));
    response.headers.set(
      AI_CREDITS_HEADERS.remaining,
      String(creditMeta.creditsRemaining)
    );
    response.headers.set(AI_CREDITS_HEADERS.resetDate, creditMeta.resetDate || "");
    response.headers.set(
      AI_CREDITS_HEADERS.isPremium,
      creditMeta.isPremium ? "1" : "0"
    );
    return response;
  };

  return async function (request: NextRequest): Promise<Response> {
    let userId = "";
    let plan: string | undefined;
    let creditMeta: CreditMeta | undefined;
    let creditIdempotencyKey: string | undefined;
    let creditsCharged = false;
    const privacyMode = resolvePrivacyMode(
      request.headers.get("x-ai-privacy-mode")
    );

    const syncCreditMeta = (result: CreditMeta & { plan?: string }) => {
      creditMeta = {
        creditsUsed: result.creditsUsed,
        creditsRemaining: result.creditsRemaining,
        resetDate: result.resetDate,
        isPremium: result.isPremium,
      };
      if (result.plan) {
        plan = result.plan;
      }
    };

    const refundChargedCredits = async () => {
      if (!creditOperation || !userId || !creditsCharged) {
        return;
      }

      if (typeof refundCreditsForOperation !== "function") {
        return;
      }

      const refundResult = await refundCreditsForOperation(
        userId,
        creditOperation,
        plan === "premium" ? "premium" : "free",
        creditIdempotencyKey
      );

      if (refundResult.success) {
        syncCreditMeta(refundResult);
        creditsCharged = false;
      }
    };

    try {
      // 1. Authentication
      if (requireAuth) {
        const auth = await verifyAuth(request);
        if (!auth.success) return auth.response;
        if (auth.user.emailVerified === false) {
          return NextResponse.json(
            {
              error: "Email verification required",
              type: "EMAIL_NOT_VERIFIED",
              message: "Please verify your email address before using AI features.",
            },
            { status: 403 }
          );
        }
        userId = auth.user.uid;
      }

      // 2. Rate limiting (user-aware)
      if (enableRateLimit) {
        try {
          await applyRateLimit(request, "AI", userId);
        } catch (error) {
          return rateLimitResponse(error as Error);
        }
      }

      const resolvedFeature = launchFeature ?? pathFeatureMap[request.nextUrl.pathname];
      if (resolvedFeature && !isLaunchFeatureEnabled(resolvedFeature)) {
        return NextResponse.json(
          {
            error: "This AI feature is not available in the current release.",
            type: "FEATURE_DISABLED",
            feature: resolvedFeature,
          },
          { status: 403 }
        );
      }

      if (userId) {
        const abuseCheck = await enforceAiAbuseGuard(request, userId);
        if (!abuseCheck.allowed) {
          return NextResponse.json(
            {
              error: "AI access temporarily blocked due to suspicious signup activity.",
              type: "ABUSE_BLOCKED",
              retryAfterSeconds: abuseCheck.retryAfterSeconds,
            },
            { status: 429 }
          );
        }
      }

      // 3. Parse request body
      let body: T;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON in request body", type: "VALIDATION_ERROR" },
          { status: 400 }
        );
      }

      // 4. Validate request body (before credit deduction)
      if (schema) {
        const result = schema.safeParse(body);
        if (!result.success) {
          return NextResponse.json(
            {
              error: "Invalid request data",
              type: "VALIDATION_ERROR",
              details: result.error.issues,
            },
            { status: 400 }
          );
        }
        body = result.data;
      }

      // 5. Transactional credit charge
      if (creditOperation && userId) {
        creditIdempotencyKey =
          request.headers.get(AI_CREDITS_HEADERS.idempotencyKey) ||
          crypto.randomUUID();

        const chargeResult = await confirmCreditsForOperation(
          userId,
          creditOperation,
          undefined,
          creditIdempotencyKey
        );
        if (!chargeResult.success) return chargeResult.response;

        syncCreditMeta(chargeResult);
        creditsCharged = true;
      }

      // 6. Execute handler with timeout
      const ctx: AIRouteContext = { userId, plan, privacyMode };
      const result = await withTimeout(handler(body, ctx, request), timeout);
      const responseStatus = result instanceof Response ? result.status : 200;

      if (responseStatus < 200 || responseStatus >= 400) {
        await refundChargedCredits();
      } else {
        creditsCharged = false;
      }

      if (result instanceof NextResponse) {
        return applyCreditHeaders(result, creditMeta);
      }

      return applyCreditHeaders(NextResponse.json(result, { status: 200 }), creditMeta);
    } catch (error) {
      if (creditsCharged) {
        try {
          await refundChargedCredits();
        } catch {
          // Preserve the charged meta if the refund attempt itself fails.
        }
      }

      aiLogger.error("[AI Route] Error:", error instanceof Error ? error : new Error(String(error)));

      if (error instanceof TimeoutError) {
        return applyCreditHeaders(timeoutResponse(error), creditMeta);
      }

      if (error instanceof Error && error.message.includes("quota")) {
        return applyCreditHeaders(
          NextResponse.json(
            {
              error: "AI service quota exceeded. Please try again in a few moments.",
              type: "QUOTA_EXCEEDED",
              retryable: true,
            },
            { status: 429 }
          ),
          creditMeta
        );
      }

      if (error instanceof z.ZodError) {
        return applyCreditHeaders(
          NextResponse.json(
            {
              error: "Validation failed",
              type: "VALIDATION_ERROR",
              details: error.issues,
            },
            { status: 400 }
          ),
          creditMeta
        );
      }

      return applyCreditHeaders(
        NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred. Please try again.",
            type: "SERVER_ERROR",
            retryable: true,
            details: process.env.NODE_ENV === "development" ? String(error) : undefined,
          },
          { status: 500 }
        ),
        creditMeta
      );
    }
  };
}

/**
 * Error response with retry information
 */
export function errorResponse(
  message: string,
  type: string,
  status: number = 500,
  retryable: boolean = true
) {
  return NextResponse.json({ error: message, type, retryable }, { status });
}
