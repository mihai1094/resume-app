import { NextRequest, NextResponse } from "next/server";
import { sharingService } from "@/lib/services/sharing-service";
import { incrementDownloadCountServer } from "@/lib/services/sharing-service-server";
import { analyticsServiceServer } from "@/lib/services/analytics-service-server";
import { serializeTemplate } from "@/lib/services/template-serializer";
import { renderHtmlToPdf } from "@/lib/services/pdf-renderer";
import { TemplateId } from "@/lib/constants/templates";
import { applyRateLimit, rateLimitResponse } from "@/lib/api/rate-limit";
import { withTimeout, TimeoutError, timeoutResponse } from "@/lib/api/timeout";
import { handleApiError } from "@/lib/api/error-handler";
import { logger } from "@/lib/services/logger";
import { extractClientIp } from "@/lib/api/client-ip";
import { createHash } from "crypto";
import {
  COOKIE_CONSENT_COOKIE_NAME,
  isConsentGranted,
  parseStoredConsent,
} from "@/lib/privacy/consent";
import { launchFlags } from "@/config/launch";
import { bufferToExactBytes } from "@/lib/utils/binary";

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
  bytes: Uint8Array;
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

function hasAnalyticsConsent(request: NextRequest): boolean {
  const consentRaw = request.cookies.get(COOKIE_CONSENT_COOKIE_NAME)?.value;
  let decodedConsent: string | null = null;
  if (consentRaw) {
    try {
      decodedConsent = decodeURIComponent(consentRaw);
    } catch {
      decodedConsent = consentRaw;
    }
  }
  const storedConsent = parseStoredConsent(decodedConsent);
  return isConsentGranted(storedConsent, "resumeAnalytics");
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!launchFlags.features.publicSharing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Rate limiting
  try {
    await applyRateLimit(request, "DOWNLOAD");
  } catch (error) {
    return rateLimitResponse(error as Error);
  }

  // Abuse detection
  const clientIP = extractClientIp(request);
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

      return new NextResponse(cached.bytes as unknown as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${cached.fileName}"`,
          "Content-Length": cached.bytes.byteLength.toString(),
          "X-Cache": "HIT",
        },
      });
    }

    if (hasAnalyticsConsent(request)) {
      // Track download analytics only with explicit consent.
      await incrementDownloadCountServer(publicResume.resumeId);
      trackAnalytics(request, publicResume);
    }

    // Generate PDF (with timeout)
    const customization = {
      primaryColor: publicResume.customization.primaryColor,
      secondaryColor: publicResume.customization.secondaryColor,
      accentColor: publicResume.customization.accentColor,
      fontFamily: publicResume.customization.fontFamily,
      fontSize: publicResume.customization.fontSize,
      lineSpacing: publicResume.customization.lineSpacing,
      sectionSpacing: publicResume.customization.sectionSpacing,
    };

    const pdfGeneration = async () => {
      const html = await serializeTemplate(
        publicResume.data,
        publicResume.templateId as TemplateId,
        customization
      );
      return renderHtmlToPdf(html);
    };

    const pdfBuffer = await withTimeout(pdfGeneration(), EXPORT_TIMEOUT_MS);
    const pdfBytes = bufferToExactBytes(pdfBuffer);

    // Store in cache
    pdfCache.set(cacheKey, {
      bytes: pdfBytes,
      fileName,
      createdAt: Date.now(),
    });

    downloadLogger.info("Generated and cached PDF", {
      resumeId: publicResume.resumeId,
      cacheKey,
      sizeBytes: pdfBytes.byteLength,
    });

    return new NextResponse(pdfBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBytes.byteLength.toString(),
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    if (error instanceof TimeoutError) {
      return timeoutResponse(error);
    }
    return handleApiError(error, { module: "Download", action: "generate-pdf" });
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

/**
 * Normalize non-POST responses to the same 404 JSON body as a missing resume.
 * Without these stubs, Next.js auto-returns 405 Method Not Allowed for
 * GET/HEAD/etc, which leaks that POST is a valid method on this route and
 * lets attackers fingerprint existing (username, slug) pairs by diffing
 * response bodies. Stubs fix that by returning an identical 404 everywhere.
 */
const notFoundResponse = () =>
  NextResponse.json({ error: "Not found" }, { status: 404 });

export const GET = notFoundResponse;
export const HEAD = notFoundResponse;
export const PUT = notFoundResponse;
export const PATCH = notFoundResponse;
export const DELETE = notFoundResponse;
export const OPTIONS = notFoundResponse;
