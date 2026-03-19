import { NextRequest, NextResponse } from "next/server";
import { verifyAuthHeader } from "@/lib/firebase/admin";
import { getAdminDb } from "@/lib/firebase/admin";
import { handleApiError } from "@/lib/api/error-handler";
import { logger } from "@/lib/services/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const feedbackLogger = logger.child({ module: "Feedback" });

const FEEDBACK_COLLECTION = "feedback";
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const decodedToken = await verifyAuthHeader(authHeader);

    if (!decodedToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
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
      userId: decodedToken.uid,
      userEmail: decodedToken.email || null,
      category,
      message: trimmedMessage,
      status: "new",
      createdAt: new Date().toISOString(),
    });

    feedbackLogger.info("Feedback submitted", {
      feedbackId: feedbackRef.id,
      category,
      userId: decodedToken.uid,
    });

    return NextResponse.json({ success: true, id: feedbackRef.id });
  } catch (error) {
    return handleApiError(error, { module: "Feedback", action: "submit" });
  }
}
