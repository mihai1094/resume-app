import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api/auth-middleware";
import { isAdminUser } from "@/lib/config/admin";
import { handleApiError } from "@/lib/api/error-handler";
import { applyRateLimit, rateLimitResponse } from "@/lib/api/rate-limit";
import { getAdminDashboardData } from "@/lib/services/testimonials-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success) return auth.response;

  if (!isAdminUser(auth.user.email)) {
    return NextResponse.json(
      { error: "Admin access required", code: "ADMIN_REQUIRED" },
      { status: 403 }
    );
  }

  try {
    await applyRateLimit(request, "GENERAL", auth.user.uid);
  } catch (error) {
    return rateLimitResponse(error as Error);
  }

  try {
    const data = await getAdminDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, {
      module: "AdminOverview",
      action: "list",
    });
  }
}
