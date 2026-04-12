import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api/auth-middleware";
import type { AuthenticatedUser } from "@/lib/api/auth-middleware";

interface TestGuardSuccess {
  success: true;
  user: AuthenticatedUser;
}

interface TestGuardError {
  success: false;
  response: NextResponse;
}

/**
 * Guard for /api/test/* routes.
 * Ensures ENABLE_TEST_TOOLBAR is set and the caller matches TEST_USER_EMAIL.
 */
export async function testRouteGuard(
  request: NextRequest
): Promise<TestGuardSuccess | TestGuardError> {
  if (process.env.ENABLE_TEST_TOOLBAR !== "true") {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Not available" },
        { status: 404 }
      ),
    };
  }

  const auth = await verifyAuth(request);
  if (!auth.success) {
    return { success: false, response: auth.response };
  }

  const testEmail = process.env.TEST_USER_EMAIL;
  if (!testEmail || auth.user.email !== testEmail) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return { success: true, user: auth.user };
}
