import { NextRequest, NextResponse } from "next/server";

const COMING_SOON_PATH = "/coming-soon";

/** Routes that must remain accessible even in coming-soon mode. */
const BYPASS_PREFIXES = [
  COMING_SOON_PATH,
  "/api/",
  "/_next/",
  "/monitoring",
  "/favicon",
  "/icon",
];

const BYPASS_EXTENSIONS = [".svg", ".png", ".jpg", ".ico", ".webp", ".woff2", ".woff", ".css", ".js"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Coming-soon gate ---------------------------------------------------
  const comingSoon = process.env.COMING_SOON === "true";

  if (comingSoon) {
    const isBypassed =
      BYPASS_PREFIXES.some((p) => pathname.startsWith(p)) ||
      BYPASS_EXTENSIONS.some((ext) => pathname.endsWith(ext));

    if (!isBypassed) {
      const url = request.nextUrl.clone();
      url.pathname = COMING_SOON_PATH;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, icon.svg, etc.
     */
    "/((?!_next/static|_next/image).*)",
  ],
};
