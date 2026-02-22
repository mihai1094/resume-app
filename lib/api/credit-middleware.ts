import { NextResponse } from "next/server";
import {
  checkAndDeductCredits,
  getUserPlan,
  AIOperation,
  PlanId,
} from "@/lib/services/credit-service-server";
import { AI_CREDITS_HEADERS } from "@/lib/constants/ai-credits-events";

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
 * Check and deduct credits for an AI operation.
 * Returns a NextResponse error if insufficient credits.
 *
 * Usage:
 * ```ts
 * const creditCheck = await checkCreditsForOperation(userId, "improve-bullet");
 * if (!creditCheck.success) {
 *   return creditCheck.response;
 * }
 * // proceed with AI operation
 * ```
 */
export async function checkCreditsForOperation(
  userId: string,
  operation: AIOperation
): Promise<CreditCheckResult> {
  const isNonProduction = process.env.NODE_ENV !== "production";
  const skipCredits =
    isNonProduction &&
    (process.env.SKIP_CREDITS === "true" || process.env.DEMO_MODE === "true");
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

  try {
    // Get user's plan (server-side, admin Firestore)
    const plan: PlanId = await getUserPlan(userId);

    // Check and deduct credits
    const result = await checkAndDeductCredits(userId, operation, plan);

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
    console.error("[Credits] Error checking credits:", error);
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
 * Get operation name from route path
 * e.g., "/api/ai/improve-bullet" -> "improve-bullet"
 */
export function getOperationFromPath(path: string): string {
  const match = path.match(/\/api\/ai\/([^/?]+)/);
  return match ? match[1] : "";
}
