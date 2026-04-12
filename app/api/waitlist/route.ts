import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError } from "@/lib/api/error-handler";
import { applyRateLimit, rateLimitResponse } from "@/lib/api/rate-limit";
import { logger } from "@/lib/services/logger";
import { getAdminDb } from "@/lib/firebase/admin";

const waitlistLogger = logger.child({ module: "Waitlist" });

const waitlistSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    try {
      await applyRateLimit(request, "AUTH");
    } catch (error) {
      return rateLimitResponse(error as Error);
    }

    const body = await request.json().catch(() => null);
    const parsed = waitlistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const { email } = parsed.data;
    const db = getAdminDb();

    // Deduplicate by email (doc ID = sanitized email)
    const docId = email.toLowerCase().replace(/[^a-z0-9]/g, "_");
    await db.collection("waitlist").doc(docId).set(
      {
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    waitlistLogger.info("Waitlist signup", { email });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    waitlistLogger.error("Waitlist signup failed", error);
    return handleApiError(error);
  }
}
