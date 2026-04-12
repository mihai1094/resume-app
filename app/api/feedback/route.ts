import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAuth } from "@/lib/api/auth-middleware";
import { handleApiError } from "@/lib/api/error-handler";
import { applyRateLimit, rateLimitResponse } from "@/lib/api/rate-limit";
import { logger } from "@/lib/services/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const feedbackLogger = logger.child({ module: "Feedback" });

const FEEDBACK_COLLECTION = "feedback";
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request, { requireEmailVerified: true });
    if (!auth.success) return auth.response;

    try {
      await applyRateLimit(request, "GENERAL", auth.user.uid);
    } catch (error) {
      return rateLimitResponse(error as Error);
    }

    const body = await request.json();
    const { category, message } = body;

    // Validate
    if (!category || !message?.trim()) {
      return NextResponse.json(
        { error: "Category and message are required" },
        { status: 400 },
      );
    }

    const validCategories = ["bug", "feature", "general"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 },
      );
    }

    const trimmedMessage = message.trim().slice(0, MAX_MESSAGE_LENGTH);

    const db = getAdminDb();
    const feedbackRef = db.collection(FEEDBACK_COLLECTION).doc();

    await feedbackRef.set({
      id: feedbackRef.id,
      userId: auth.user.uid,
      userEmail: auth.user.email || null,
      category,
      message: trimmedMessage,
      status: "new",
      createdAt: new Date().toISOString(),
    });

    feedbackLogger.info("Feedback submitted", {
      feedbackId: feedbackRef.id,
      category,
      userId: auth.user.uid,
    });

    return NextResponse.json({ success: true, id: feedbackRef.id });
  } catch (error) {
    return handleApiError(error, { module: "Feedback", action: "submit" });
  }
}
