import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Proxy (equivalent to middleware in Next.js 16+)
 *
 * Generates a per-request CSP nonce to eliminate `'unsafe-inline'` from
 * script-src in production. Sets the nonce on the `x-nonce` request header
 * so RSC (e.g. layout.tsx) can attach it to inline scripts.
 *
 * NOTE: Firebase Auth is client-side only (IndexedDB/localStorage), so
 * authentication checks are NOT done here — that is handled by AuthGuard
 * and the useUser hook on the client.
 */
export function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";

  // Generate a per-request nonce
  const nonce = Buffer.from(
    crypto.getRandomValues(new Uint8Array(16))
  ).toString("base64");

  // script-src: in dev allow eval for fast-refresh; in production nonce-only
  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'unsafe-eval' 'wasm-unsafe-eval' https://apis.google.com https://va.vercel-scripts.com`
    : `'self' 'nonce-${nonce}' 'wasm-unsafe-eval' https://apis.google.com https://va.vercel-scripts.com`;

  const cspDirectives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' data: blob: https://firebaseinstallations.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://generativelanguage.googleapis.com https://*.sentry.io wss://*.firebaseio.com",
    "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "block-all-mixed-content",
    "upgrade-insecure-requests",
  ].join("; ");

  // Forward the nonce to RSC so layout.tsx can attach it to JSON-LD scripts
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", cspDirectives);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and Next.js internals.
     * CSP is applied to page / API responses; static assets don't need it.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot)).*)",
  ],
};
