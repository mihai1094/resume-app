import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api/auth-middleware";
import { isAdminUser } from "@/lib/config/admin";
import {
  resetCredits,
  updatePlan,
  PlanId,
} from "@/lib/services/credit-service-server";
import { handleApiError } from "@/lib/api/error-handler";
import { applyRateLimit, rateLimitResponse } from "@/lib/api/rate-limit";
import { authLogger } from "@/lib/services/logger";

type AdminAction = "reset-credits" | "switch-plan";

const VALID_PLANS: PlanId[] = ["free", "premium"];

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success) return auth.response;

  const { user } = auth;

  if (!isAdminUser(user.email)) {
    authLogger.warn("Non-admin attempted admin action", {
      uid: user.uid,
      email: user.email,
    });
    return NextResponse.json(
      { error: "Forbidden", code: "ADMIN_REQUIRED", message: "Admin access required" },
      { status: 403 }
    );
  }

  try {
    await applyRateLimit(request, "GENERAL", user.uid);
  } catch (error) {
    return rateLimitResponse(error as Error);
  }

  try {
    const body = await request.json();
    const { action, targetUserId, plan } = body as {
      action: AdminAction;
      targetUserId?: string;
      plan?: string;
    };

    const userId = targetUserId || user.uid;

    switch (action) {
      case "reset-credits": {
        const newUsage = await resetCredits(userId);
        authLogger.info("Admin reset credits", {
          admin: user.email,
          targetUserId: userId,
        });
        return NextResponse.json({ success: true, usage: newUsage });
      }

      case "switch-plan": {
        if (!plan || !VALID_PLANS.includes(plan as PlanId)) {
          return NextResponse.json(
            { error: "Invalid plan", code: "INVALID_PLAN", message: `Plan must be one of: ${VALID_PLANS.join(", ")}` },
            { status: 400 }
          );
        }
        await updatePlan(userId, plan as PlanId);
        authLogger.info("Admin switched plan", {
          admin: user.email,
          targetUserId: userId,
          plan,
        });
        return NextResponse.json({ success: true, plan });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action", code: "INVALID_ACTION", message: "Valid actions: reset-credits, switch-plan" },
          { status: 400 }
        );
    }
  } catch (error) {
    return handleApiError(error, { module: "Admin", action: "admin-operation" });
  }
}
