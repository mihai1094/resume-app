import { NextResponse } from "next/server";
import {
  checkAndDeductCredits,
  getUserPlan,
  AIOperation,
  PlanId,
} from "@/lib/services/credit-service-server";

export interface CreditCheckSuccess {
  success: true;
  userId: string;
  plan: PlanId;
  creditsUsed: number;
  creditsRemaining: number;
}

export interface CreditCheckFailure {
  success: false;
  response: NextResponse;
}

export type CreditCheckResult = CreditCheckSuccess | CreditCheckFailure;

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
  const skipCredits =
    process.env.SKIP_CREDITS === "true" || process.env.DEMO_MODE === "true";
  if (skipCredits) {
    return {
      success: true,
      userId,
      plan: "premium",
      creditsUsed: 0,
      creditsRemaining: Infinity,
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
        return {
          success: false,
          response: NextResponse.json(
            {
              error: "premium_required",
              message: "This feature requires a Premium subscription",
              upgradeUrl: "/pricing",
            },
            { status: 403 }
          ),
        };
      }

      if (result.reason === "insufficient_credits") {
        return {
          success: false,
          response: NextResponse.json(
            {
              error: "insufficient_credits",
              message: "Not enough AI credits",
              creditsRequired: result.creditsRequired,
              creditsRemaining: result.creditsRemaining,
              resetDate: result.resetDate,
              upgradeUrl: "/pricing",
            },
            { status: 402 } // Payment Required
          ),
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
