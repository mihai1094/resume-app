import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware for Route Protection
 *
 * This provides server-side route protection as a first line of defense.
 * Client-side AuthGuard components provide the second layer.
 *
 * Note: Firebase Auth uses client-side tokens, so we check for the presence
 * of Firebase auth cookies as an indicator of authentication state.
 * The actual auth verification happens client-side with Firebase SDK.
 */

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/editor",
  "/onboarding",
  "/cover-letter",
  "/edit-cover-letter",
  "/settings",
  "/utils", // Dev utilities
];

// Routes only for unauthenticated users
const authRoutes = ["/login", "/register"];

// Public routes that don't need any checks
const publicRoutes = [
  "/",
  "/blog",
  "/preview",
  "/terms",
  "/privacy",
  "/not-found",
  "/offline",
  "/maintenance",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // Static files like .css, .js, .ico
  ) {
    return NextResponse.next();
  }

  // Check for Firebase auth session cookie
  // Firebase sets multiple cookies, we check for common auth indicators
  const hasAuthCookie =
    request.cookies.has("__session") ||
    request.cookies.has("firebase-auth-token");

  // For protected routes: redirect to login if no auth cookie
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !hasAuthCookie) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the original URL for redirect after login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For auth routes: redirect to dashboard if already authenticated
  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute && hasAuthCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Add security headers to all responses
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy - restrict sensitive browser features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};

