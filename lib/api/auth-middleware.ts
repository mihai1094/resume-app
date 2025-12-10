import { NextRequest, NextResponse } from "next/server";
import { verifyAuthHeader } from "@/lib/firebase/admin";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
}

export interface AuthResult {
  success: true;
  user: AuthenticatedUser;
}

export interface AuthError {
  success: false;
  response: NextResponse;
}

/**
 * Verify authentication for API routes
 * Returns the authenticated user or an error response
 *
 * @param request - The Next.js request object
 * @returns AuthResult with user data or AuthError with response
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const auth = await verifyAuth(request);
 *   if (!auth.success) {
 *     return auth.response;
 *   }
 *   const { user } = auth;
 *   // user.uid is available
 * }
 * ```
 */
export async function verifyAuth(
  request: NextRequest
): Promise<AuthResult | AuthError> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Authentication required",
          code: "UNAUTHORIZED",
          message: "Please log in to access this resource",
        },
        { status: 401 }
      ),
    };
  }

  if (!authHeader.startsWith("Bearer ")) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Invalid authorization format",
          code: "INVALID_AUTH_FORMAT",
          message: "Authorization header must use Bearer token format",
        },
        { status: 401 }
      ),
    };
  }

  try {
    const decodedToken = await verifyAuthHeader(authHeader);

    if (!decodedToken) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: "Invalid or expired token",
            code: "INVALID_TOKEN",
            message: "Your session has expired. Please log in again.",
          },
          { status: 401 }
        ),
      };
    }

    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
      },
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Authentication failed",
          code: "AUTH_ERROR",
          message: "Unable to verify authentication. Please try again.",
        },
        { status: 401 }
      ),
    };
  }
}

/**
 * Optional auth verification - returns user if authenticated, null if not
 * Use this for endpoints that work with or without authentication
 *
 * @param request - The Next.js request object
 * @returns The authenticated user or null
 */
export async function optionalAuth(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    const decodedToken = await verifyAuthHeader(authHeader);
    if (!decodedToken) {
      return null;
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
    };
  } catch {
    return null;
  }
}
