/**
 * AI Route Wrapper
 *
 * Standardized wrapper for all AI API routes.
 * Enforces correct ordering: auth → rate limit → parse → validate → credit deduct → handler
 */

import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, rateLimitResponse } from "./rate-limit";
import { withTimeout, TimeoutError, timeoutResponse } from "./timeout";
import { verifyAuth } from "./auth-middleware";
import { checkCreditsForOperation } from "./credit-middleware";
import { aiLogger } from "@/lib/services/logger";
import { resolvePrivacyMode, type AIPrivacyMode } from "@/lib/ai/privacy";
import { isLaunchFeatureEnabled, type LaunchFeatureKey } from "@/config/launch";
import { enforceAiAbuseGuard } from "@/lib/services/abuse-guard";
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

/**
 * Wrap an AI route handler with security features.
 *
 * Order of operations (P0 compliant):
 * 1. Authentication
 * 2. Rate limiting (user-aware)
 * 3. Parse request body
 * 4. Validate request body (schema)
 * 5. Credit check and deduction
 * 6. Execute handler with timeout
 *
 * Credits are NEVER deducted before validation passes.
 */
export function withAIRoute<T = unknown>(
  handler: (body: T, ctx: AIRouteContext, request: NextRequest) => Promise<NextResponse | Record<string, unknown>>,
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

  return async function (request: NextRequest): Promise<Response> {
      let userId = "";
      const privacyMode = resolvePrivacyMode(
        request.headers.get("x-ai-privacy-mode")
      );

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

      // 4. Validate request body (before credit deduction!)
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

      // 5. Credit check and deduction (AFTER validation)
      let plan: string | undefined;
      if (creditOperation && userId) {
        const creditCheck = await checkCreditsForOperation(userId, creditOperation);
        if (!creditCheck.success) return creditCheck.response;
        plan = creditCheck.plan;
      }

      // 6. Execute handler with timeout
      const ctx: AIRouteContext = { userId, plan, privacyMode };
      const result = await withTimeout(
        handler(body, ctx, request),
        timeout
      );

      // Handler can return NextResponse directly or a plain object
      if (result instanceof NextResponse) return result;
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      aiLogger.error("[AI Route] Error:", error instanceof Error ? error : new Error(String(error)));

      if (error instanceof TimeoutError) {
        return timeoutResponse(error);
      }

      if (error instanceof Error && error.message.includes("quota")) {
        return NextResponse.json(
          {
            error: "AI service quota exceeded. Please try again in a few moments.",
            type: "QUOTA_EXCEEDED",
            retryable: true,
          },
          { status: 429 }
        );
      }

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", type: "VALIDATION_ERROR", details: error.issues },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
          type: "SERVER_ERROR",
          retryable: true,
          details: process.env.NODE_ENV === "development" ? String(error) : undefined,
        },
        { status: 500 }
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
  return NextResponse.json(
    { error: message, type, retryable },
    { status }
  );
}
