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
const COMING_SOON_PATH = "/coming-soon";
const COMING_SOON_BYPASS_PREFIXES = [
  COMING_SOON_PATH,
  "/api/",
  "/_next/",
  "/monitoring",
  "/favicon",
  "/icon",
];
const COMING_SOON_BYPASS_EXTENSIONS = [
  ".svg", ".png", ".jpg", ".ico", ".webp", ".woff2", ".woff", ".css", ".js",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Coming-soon gate ---------------------------------------------------
  if (process.env.COMING_SOON === "true") {
    const isBypassed =
      COMING_SOON_BYPASS_PREFIXES.some((p) => pathname.startsWith(p)) ||
      COMING_SOON_BYPASS_EXTENSIONS.some((ext) => pathname.endsWith(ext));

    if (!isBypassed) {
      const url = request.nextUrl.clone();
      url.pathname = COMING_SOON_PATH;
      const response = NextResponse.rewrite(url, { status: 503 });
      response.headers.set("Retry-After", "86400"); // check back in 24h
      return response;
    }
  }

  const isDev = process.env.NODE_ENV === "development";

  // Generate a per-request nonce
  const nonce = Buffer.from(
    crypto.getRandomValues(new Uint8Array(16))
  ).toString("base64");

  // script-src: in dev allow eval for fast-refresh; in production nonce-only
  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'unsafe-eval' 'wasm-unsafe-eval' https://apis.google.com https://va.vercel-scripts.com`
    : `'self' 'nonce-${nonce}' https://apis.google.com https://va.vercel-scripts.com`;

  // img-src: pinned to known origins instead of wildcard https: to shrink the
  // data exfiltration surface if a DOM XSS ever lands. Covers Firebase Storage
  // (user photos), Google OAuth avatars, and Vercel OG image hosts.
  const imgSrc = [
    "'self'",
    "data:",
    "blob:",
    "https://firebasestorage.googleapis.com",
    "https://lh3.googleusercontent.com",
    "https://*.googleusercontent.com",
    "https://*.vercel.app",
    "https://*.vercel-storage.com",
  ].join(" ");

  // connect-src: Gemini is called server-side only; client never needs it.
  // Removed https://generativelanguage.googleapis.com.
  const connectSrc = [
    "'self'",
    "data:",
    "blob:",
    "https://firebaseinstallations.googleapis.com",
    "https://identitytoolkit.googleapis.com",
    "https://securetoken.googleapis.com",
    "https://firestore.googleapis.com",
    "https://*.sentry.io",
    "wss://*.firebaseio.com",
  ].join(" ");

  const cspDirectives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `img-src ${imgSrc}`,
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src ${connectSrc}`,
    "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");

  const mixedContentDirectives = isDev
    ? ""
    : "; block-all-mixed-content; upgrade-insecure-requests";

  // Forward CSP on the request headers so Next.js can extract the nonce
  // and apply it to its inline scripts (RSC payload, bootstrapping, etc.).
  // Without this, the CSP nonce blocks all inline scripts and the page
  // never hydrates — infinite loading on Vercel.
  const cspValue = `${cspDirectives}${mixedContentDirectives}`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", cspValue);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", cspValue);

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
