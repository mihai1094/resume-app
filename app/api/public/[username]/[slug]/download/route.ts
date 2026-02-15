import { NextRequest, NextResponse } from "next/server";
import { sharingService } from "@/lib/services/sharing-service";
import { analyticsServiceServer } from "@/lib/services/analytics-service-server";
import { exportToPDF } from "@/lib/services/export";
import { applyRateLimit, rateLimitResponse } from "@/lib/api/rate-limit";
import { withTimeout, TimeoutError, timeoutResponse } from "@/lib/api/timeout";
import { logger } from "@/lib/services/logger";
import { createHash } from "crypto";
import {
  COOKIE_CONSENT_COOKIE_NAME,
  isGrantedCookieConsent,
} from "@/lib/privacy/consent";

const downloadLogger = logger.child({ module: "Download" });

interface RouteContext {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

// Max time for PDF generation
const EXPORT_TIMEOUT_MS = 60_000;

// --- In-memory PDF cache ---
const PDF_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const PDF_CACHE_MAX_ENTRIES = 50;

interface CachedPDF {
  buffer: ArrayBuffer;
  fileName: string;
  createdAt: number;
}

const pdfCache = new Map<string, CachedPDF>();

function getCacheKey(
  resumeId: string,
  templateId: string,
  customization: Record<string, unknown>
): string {
  const hash = createHash("sha256")
    .update(JSON.stringify({ resumeId, templateId, customization }))
    .digest("hex")
    .slice(0, 16);
  return `pdf:${hash}`;
}

function pruneCache() {
  const now = Date.now();
  for (const [key, entry] of pdfCache) {
    if (now - entry.createdAt > PDF_CACHE_TTL_MS) {
      pdfCache.delete(key);
    }
  }
  // Evict oldest if over max
  if (pdfCache.size > PDF_CACHE_MAX_ENTRIES) {
    const oldest = [...pdfCache.entries()].sort(
      (a, b) => a[1].createdAt - b[1].createdAt
    );
    const toRemove = oldest.slice(0, pdfCache.size - PDF_CACHE_MAX_ENTRIES);
    for (const [key] of toRemove) pdfCache.delete(key);
  }
}

// --- Abuse tracking ---
const abuseWindow = new Map<string, { count: number; windowStart: number }>();
const ABUSE_THRESHOLD = 20; // requests per 5min from same IP
const ABUSE_WINDOW_MS = 5 * 60 * 1000;

function trackAbuse(ip: string): boolean {
  const now = Date.now();
  const record = abuseWindow.get(ip);
  if (!record || now - record.windowStart > ABUSE_WINDOW_MS) {
    abuseWindow.set(ip, { count: 1, windowStart: now });
    return false;
  }
  record.count++;
  if (record.count >= ABUSE_THRESHOLD) {
    downloadLogger.warn("Abuse threshold reached", { ip, count: record.count });
    return true;
  }
  return false;
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function hasAnalyticsConsent(request: NextRequest): boolean {
  const consent = request.cookies.get(COOKIE_CONSENT_COOKIE_NAME)?.value;
  return isGrantedCookieConsent(consent);
}

export async function POST(request: NextRequest, context: RouteContext) {
  // Rate limiting
  try {
    await applyRateLimit(request, "DOWNLOAD");
  } catch (error) {
    return rateLimitResponse(error as Error);
  }

  // Abuse detection
  const clientIP = getClientIP(request);
  if (trackAbuse(clientIP)) {
    downloadLogger.warn("Blocked abusive download request", { ip: clientIP });
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { username, slug } = await context.params;

    const publicResume = await sharingService.getPublicResumeBySlug(
      username,
      slug
    );

    if (!publicResume || !publicResume.isPublic) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    // Build filename
    const { personalInfo } = publicResume.data;
    const sanitizePart = (value: string | undefined) =>
      (value || "")
        .replace(/[^a-zA-Z0-9-_]+/g, "_")
        .replace(/_{2,}/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 50);

    const firstName = sanitizePart(personalInfo.firstName);
    const lastName = sanitizePart(personalInfo.lastName);
    const nameParts = [firstName, lastName].filter(Boolean);
    const fileName =
      nameParts.length > 0
        ? `${nameParts.join("_")}_Resume.pdf`
        : "Resume.pdf";

    // Check PDF cache
    const cacheKey = getCacheKey(
      publicResume.resumeId,
      publicResume.templateId,
      publicResume.customization as unknown as Record<string, unknown>
    );

    pruneCache();
    const cached = pdfCache.get(cacheKey);
    if (cached && Date.now() - cached.createdAt < PDF_CACHE_TTL_MS) {
      downloadLogger.info("Serving cached PDF", {
        resumeId: publicResume.resumeId,
        cacheKey,
      });

      if (hasAnalyticsConsent(request)) {
        // Still track analytics for cached responses
        trackAnalytics(request, publicResume);
      }

      return new NextResponse(cached.buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${cached.fileName}"`,
          "Content-Length": cached.buffer.byteLength.toString(),
          "X-Cache": "HIT",
        },
      });
    }

    if (hasAnalyticsConsent(request)) {
      // Track download analytics only with explicit consent.
      await sharingService.incrementDownloadCount(publicResume.resumeId);
      trackAnalytics(request, publicResume);
    }

    // Generate PDF (with timeout)
    const result = await withTimeout(
      exportToPDF(publicResume.data, publicResume.templateId, {
        customization: {
          primaryColor: publicResume.customization.primaryColor,
          secondaryColor: publicResume.customization.secondaryColor,
          accentColor: publicResume.customization.accentColor,
          fontFamily: publicResume.customization.fontFamily,
          fontSize: publicResume.customization.fontSize,
          lineSpacing: publicResume.customization.lineSpacing,
          sectionSpacing: publicResume.customization.sectionSpacing,
        },
      }),
      EXPORT_TIMEOUT_MS
    );

    if (!result.success || !result.blob) {
      return NextResponse.json(
        { error: result.error || "Failed to generate PDF" },
        { status: 500 }
      );
    }

    const arrayBuffer = await result.blob.arrayBuffer();

    // Store in cache
    pdfCache.set(cacheKey, {
      buffer: arrayBuffer,
      fileName,
      createdAt: Date.now(),
    });

    downloadLogger.info("Generated and cached PDF", {
      resumeId: publicResume.resumeId,
      cacheKey,
      sizeBytes: arrayBuffer.byteLength,
    });

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": arrayBuffer.byteLength.toString(),
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    if (error instanceof TimeoutError) {
      return timeoutResponse(error);
    }
    downloadLogger.error(
      "Download error",
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

/** Fire-and-forget analytics tracking */
function trackAnalytics(
  request: NextRequest,
  publicResume: { resumeId: string }
) {
  const referrer = request.headers.get("referer") || "";
  const normalizedReferrer = (() => {
    if (!referrer) return undefined;
    try {
      return new URL(referrer).hostname.replace(/^www\./, "");
    } catch {
      return referrer.replace(/^www\./, "").slice(0, 120);
    }
  })();
  const country =
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    undefined;

  analyticsServiceServer
    .trackPublicEvent(publicResume.resumeId, {
      type: "download",
      source: analyticsServiceServer.determineSource(normalizedReferrer),
      country,
      referrer: normalizedReferrer,
    })
    .catch((err) =>
      downloadLogger.error(
        "Analytics tracking failed",
        err instanceof Error ? err : new Error(String(err))
      )
    );
}
