import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api/auth-middleware";
import { isAdminUser } from "@/lib/config/admin";
import { handleApiError } from "@/lib/api/error-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success) return auth.response;

  try {
    return NextResponse.json({
      isAdmin: isAdminUser(auth.user.email),
    });
  } catch (error) {
    return handleApiError(error, {
      module: "AdminAccess",
      action: "check",
    });
  }
}
