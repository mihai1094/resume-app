import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { applyRateLimit, rateLimitResponse } from "@/lib/api/rate-limit";
import { checkAndRecordSignupAttempt } from "@/lib/services/abuse-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  deviceId: z.string().min(8).max(128).optional(),
});

export async function POST(request: NextRequest): Promise<Response> {
  try {
    try {
      await applyRateLimit(request, "GENERAL");
    } catch (error) {
      return rateLimitResponse(error as Error);
    }

    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const result = await checkAndRecordSignupAttempt(request, parsed.data.deviceId);
    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too many signup attempts from this network/device.",
          code: "SIGNUP_THROTTLED",
          retryAfterSeconds: result.retryAfterSeconds ?? 3600,
        },
        { status: 429 }
      );
    }

    return NextResponse.json({ allowed: true });
  } catch (error) {
    console.error("[SignupCheck] Failed:", error);
    return NextResponse.json(
      {
        error: "Unable to verify signup eligibility.",
        code: "SIGNUP_CHECK_FAILED",
      },
      { status: 500 }
    );
  }
}
