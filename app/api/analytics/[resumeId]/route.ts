import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api/auth-middleware";
import { analyticsServiceServer } from "@/lib/services/analytics-service-server";
import { logger } from "@/lib/services/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const analyticsLogger = logger.child({ module: "AnalyticsAPI" });

interface RouteContext {
  params: Promise<{ resumeId: string }>;
}

const RESUME_ID_PATTERN = /^[a-zA-Z0-9_-]{10,40}$/;

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return auth.response;
  }

  const { resumeId } = await context.params;
  if (!RESUME_ID_PATTERN.test(resumeId)) {
    return NextResponse.json({ error: "Invalid resume ID" }, { status: 400 });
  }

  const limitParam = Number(request.nextUrl.searchParams.get("limit") || "20");
  const activityLimit = Number.isFinite(limitParam)
    ? Math.min(100, Math.max(1, limitParam))
    : 20;

  try {
    const data = await analyticsServiceServer.getAnalyticsForOwner(
      auth.user.uid,
      resumeId,
      activityLimit
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    analyticsLogger.error(
      "Failed to fetch analytics",
      error instanceof Error ? error : new Error(String(error)),
      { resumeId }
    );

    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
