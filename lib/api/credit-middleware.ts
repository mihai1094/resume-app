import { NextResponse } from "next/server";
import {
  confirmCredits,
  type AIOperation,
  type PlanId,
  reserveCredits,
} from "@/lib/services/credit-service-server";
import { AI_CREDITS_HEADERS } from "@/lib/constants/ai-credits-events";
import { logger } from "@/lib/services/logger";

export interface CreditCheckSuccess {
  success: true;
  userId: string;
  plan: PlanId;
  creditsUsed: number;
  creditsRemaining: number;
  resetDate: string;
  isPremium: boolean;
}

export interface CreditCheckFailure {
  success: false;
  response: NextResponse;
}

export type CreditCheckResult = CreditCheckSuccess | CreditCheckFailure;
const creditsLogger = logger.child({ module: "CreditMiddleware" });

function getCreditsBypassEnabled(): boolean {
  const bypassEnabled =
    process.env.SKIP_CREDITS === "true" || process.env.DEMO_MODE === "true";

  if (process.env.NODE_ENV === "production" && bypassEnabled) {
    throw new Error("SKIP_CREDITS/DEMO_MODE must not be set in production");
  }

  return process.env.NODE_ENV !== "production" && bypassEnabled;
}

function setCreditHeaders(
  response: NextResponse,
  payload: {
    creditsUsed: number;
    creditsRemaining: number;
    resetDate: string;
    isPremium: boolean;
  }
): NextResponse {
  response.headers.set(AI_CREDITS_HEADERS.updated, "1");
  response.headers.set(AI_CREDITS_HEADERS.used, String(payload.creditsUsed));
  response.headers.set(
    AI_CREDITS_HEADERS.remaining,
    String(payload.creditsRemaining)
  );
  response.headers.set(AI_CREDITS_HEADERS.resetDate, payload.resetDate || "");
  response.headers.set(
    AI_CREDITS_HEADERS.isPremium,
    payload.isPremium ? "1" : "0"
  );
  return response;
}

/**
 * Reserve credits for an AI operation.
 * This is a pre-flight check only and does not deduct usage.
 *
 * Usage:
 * ```ts
 * const creditCheck = await reserveCreditsForOperation(userId, "improve-bullet");
 * if (!creditCheck.success) {
 *   return creditCheck.response;
 * }
 * // proceed with AI operation, then confirm on success
 * ```
 */
export async function reserveCreditsForOperation(
  userId: string,
  operation: AIOperation
): Promise<CreditCheckResult> {
  try {
    const skipCredits = getCreditsBypassEnabled();
    if (skipCredits) {
      return {
        success: true,
        userId,
        plan: "premium",
        creditsUsed: 0,
        creditsRemaining: Infinity,
        resetDate: "",
        isPremium: true,
      };
    }

    const result = await reserveCredits(userId, operation);
    const plan = result.isPremium ? "premium" : ("free" as PlanId);

    if (!result.success) {
      // Return appropriate error response
      if (result.reason === "premium_required") {
        const response = NextResponse.json(
          {
            error: "premium_required",
            message: "This feature requires a Premium subscription",
            upgradeUrl: "/pricing",
          },
          { status: 403 }
        );
        return {
          success: false,
          response: setCreditHeaders(response, {
            creditsUsed: result.creditsUsed,
            creditsRemaining: result.creditsRemaining,
            resetDate: result.resetDate,
            isPremium: result.isPremium,
          }),
        };
      }

      if (result.reason === "insufficient_credits") {
        const response = NextResponse.json(
          {
            error: "insufficient_credits",
            message: "Not enough AI credits",
            creditsRequired: result.creditsRequired,
            creditsRemaining: result.creditsRemaining,
            resetDate: result.resetDate,
            upgradeUrl: "/pricing",
          },
          { status: 402 } // Payment Required
        );
        return {
          success: false,
          response: setCreditHeaders(response, {
            creditsUsed: result.creditsUsed,
            creditsRemaining: result.creditsRemaining,
            resetDate: result.resetDate,
            isPremium: result.isPremium,
          }),
        };
      }

      if (result.reason === "invalid_operation") {
        return {
          success: false,
          response: NextResponse.json(
            {
              error: "invalid_operation",
              message: "Invalid AI operation",
            },
            { status: 400 }
          ),
        };
      }

      // Generic failure
      return {
        success: false,
        response: NextResponse.json(
          {
            error: "credit_check_failed",
            message: "Failed to verify credits",
          },
          { status: 500 }
        ),
      };
    }

    return {
      success: true,
      userId,
      plan,
      creditsUsed: result.creditsUsed,
      creditsRemaining: result.creditsRemaining,
      resetDate: result.resetDate,
      isPremium: result.isPremium,
    };
  } catch (error) {
    creditsLogger.error("Failed to check credits", error, {
      userId,
      operation,
    });
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "credit_check_error",
          message: "Failed to check credits. Please try again.",
        },
        { status: 500 }
      ),
    };
  }
}

/**
 * Confirm and deduct credits after an AI operation succeeds.
 * Uses an atomic transaction to enforce limits under concurrency.
 * Supports idempotency keys to prevent double-charging on retries.
 */
export async function confirmCreditsForOperation(
  userId: string,
  operation: AIOperation,
  reservedPlan?: PlanId,
  idempotencyKey?: string
): Promise<CreditCheckResult> {
  try {
    const skipCredits = getCreditsBypassEnabled();
    if (skipCredits) {
      return {
        success: true,
        userId,
        plan: "premium",
        creditsUsed: 0,
        creditsRemaining: Infinity,
        resetDate: "",
        isPremium: true,
      };
    }

    const result = await confirmCredits(userId, operation, reservedPlan, idempotencyKey);
    const plan = result.isPremium ? "premium" : ("free" as PlanId);

    if (!result.success) {
      if (result.reason === "premium_required") {
        const response = NextResponse.json(
          {
            error: "premium_required",
            message: "This feature requires a Premium subscription",
            upgradeUrl: "/pricing",
          },
          { status: 403 }
        );
        return {
          success: false,
          response: setCreditHeaders(response, {
            creditsUsed: result.creditsUsed,
            creditsRemaining: result.creditsRemaining,
            resetDate: result.resetDate,
            isPremium: result.isPremium,
          }),
        };
      }

      if (result.reason === "insufficient_credits") {
        const response = NextResponse.json(
          {
            error: "insufficient_credits",
            message: "Not enough AI credits",
            creditsRequired: result.creditsRequired,
            creditsRemaining: result.creditsRemaining,
            resetDate: result.resetDate,
            upgradeUrl: "/pricing",
          },
          { status: 402 }
        );
        return {
          success: false,
          response: setCreditHeaders(response, {
            creditsUsed: result.creditsUsed,
            creditsRemaining: result.creditsRemaining,
            resetDate: result.resetDate,
            isPremium: result.isPremium,
          }),
        };
      }

      if (result.reason === "invalid_operation") {
        return {
          success: false,
          response: NextResponse.json(
            {
              error: "invalid_operation",
              message: "Invalid AI operation",
            },
            { status: 400 }
          ),
        };
      }

      return {
        success: false,
        response: NextResponse.json(
          {
            error: "credit_check_failed",
            message: "Failed to verify credits",
          },
          { status: 500 }
        ),
      };
    }

    return {
      success: true,
      userId,
      plan,
      creditsUsed: result.creditsUsed,
      creditsRemaining: result.creditsRemaining,
      resetDate: result.resetDate,
      isPremium: result.isPremium,
    };
  } catch (error) {
    creditsLogger.error("Failed to confirm credits", error, {
      userId,
      operation,
      reservedPlan,
    });
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "credit_check_error",
          message: "Failed to confirm credits. Please try again.",
        },
        { status: 500 }
      ),
    };
  }
}

/**
 * Get operation name from route path
 * e.g., "/api/ai/improve-bullet" -> "improve-bullet"
 */
export function getOperationFromPath(path: string): string {
  const match = path.match(/\/api\/ai\/([^/?]+)/);
  return match ? match[1] : "";
}
