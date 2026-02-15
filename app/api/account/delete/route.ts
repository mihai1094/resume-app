import { NextRequest, NextResponse } from "next/server";
import { verifyAuthHeader } from "@/lib/firebase/admin";
import { accountDeletionService } from "@/lib/services/account-deletion-service";
import { logger } from "@/lib/services/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const deleteLogger = logger.child({ module: "AccountDeleteAPI" });
const RECENT_AUTH_WINDOW_SECONDS = 5 * 60;

function unauthorizedResponse() {
  return NextResponse.json(
    {
      error: "Authentication required",
      code: "UNAUTHORIZED",
    },
    { status: 401 }
  );
}

function requiresReauthResponse() {
  return NextResponse.json(
    {
      error: "Recent authentication required",
      code: "REQUIRES_REAUTH",
      message: "Please sign in again before deleting your account.",
    },
    { status: 401 }
  );
}

export async function POST(request: NextRequest): Promise<Response> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return unauthorizedResponse();
  }

  const decodedToken = await verifyAuthHeader(authHeader);
  if (!decodedToken) {
    return unauthorizedResponse();
  }

  const authTime = decodedToken.auth_time;
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!authTime || nowSeconds - authTime > RECENT_AUTH_WINDOW_SECONDS) {
    return requiresReauthResponse();
  }

  try {
    const result = await accountDeletionService.deleteAccount(decodedToken.uid);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    deleteLogger.error(
      "Failed to delete account",
      error instanceof Error ? error : new Error(String(error)),
      { userId: decodedToken.uid }
    );

    return NextResponse.json(
      {
        error: "Failed to delete account.",
        code: "ACCOUNT_DELETE_FAILED",
      },
      { status: 500 }
    );
  }
}
