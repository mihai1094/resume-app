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

// --- PDF cache (L1: in-memory per-instance, L2: KV cross-instance) ---
const PDF_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const PDF_CACHE_TTL_SECONDS = 5 * 60;
const PDF_CACHE_MAX_ENTRIES = 50;

interface CachedPDF {
  bytes: Uint8Array;
  fileName: string;
  createdAt: number;
}

interface KVCachedPDF {
  bytesBase64: string;
  fileName: string;
}

// L1: per-instance in-memory cache (fast, warm for repeat requests on same instance)
const pdfCacheL1 = new Map<string, CachedPDF>();

const KV_PDF_AVAILABLE =
  typeof process !== "undefined" &&
  !!process.env.KV_REST_API_URL &&
  !!process.env.KV_REST_API_TOKEN;

async function getPdfFromKV(key: string): Promise<CachedPDF | null> {
  if (!KV_PDF_AVAILABLE) return null;
  try {
    const { kv } = await import("@vercel/kv");
    const entry = await kv.get<KVCachedPDF>(key);
    if (!entry) return null;
    const bytes = Buffer.from(entry.bytesBase64, "base64");
    return { bytes: new Uint8Array(bytes), fileName: entry.fileName, createdAt: Date.now() };
  } catch {
    return null;
  }
}

async function setPdfInKV(key: string, bytes: Uint8Array, fileName: string): Promise<void> {
  if (!KV_PDF_AVAILABLE) return;
  try {
    const { kv } = await import("@vercel/kv");
    const entry: KVCachedPDF = {
      bytesBase64: Buffer.from(bytes).toString("base64"),
      fileName,
    };
    await kv.set(key, entry, { ex: PDF_CACHE_TTL_SECONDS });
  } catch {
    // Non-fatal — fall through without KV caching
  }
}

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

function pruneL1Cache() {
  const now = Date.now();
  for (const [key, entry] of pdfCacheL1) {
    if (now - entry.createdAt > PDF_CACHE_TTL_MS) {
      pdfCacheL1.delete(key);
    }
  }
  if (pdfCacheL1.size > PDF_CACHE_MAX_ENTRIES) {
    const oldest = [...pdfCacheL1.entries()].sort(
      (a, b) => a[1].createdAt - b[1].createdAt
    );
    const toRemove = oldest.slice(0, pdfCacheL1.size - PDF_CACHE_MAX_ENTRIES);
    for (const [key] of toRemove) pdfCacheL1.delete(key);
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

    // Check PDF cache (L1 → L2)
    const cacheKey = getCacheKey(
      publicResume.resumeId,
      publicResume.templateId,
      publicResume.customization as unknown as Record<string, unknown>
    );

    pruneL1Cache();

    const l1Hit = pdfCacheL1.get(cacheKey);
    const cached =
      l1Hit && Date.now() - l1Hit.createdAt < PDF_CACHE_TTL_MS
        ? l1Hit
        : await getPdfFromKV(cacheKey);

    if (cached) {
      // Backfill L1 if the hit came from L2
      if (!l1Hit) {
        pdfCacheL1.set(cacheKey, cached);
      }

      downloadLogger.info("Serving cached PDF", {
        resumeId: publicResume.resumeId,
        cacheKey,
        source: l1Hit ? "L1" : "L2",
      });

      if (hasAnalyticsConsent(request)) {
        trackAnalytics(request, publicResume);
      }

      return new NextResponse(cached.bytes as unknown as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${cached.fileName}"`,
          "Content-Length": cached.bytes.byteLength.toString(),
          "Cache-Control": "no-store",
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

    // Store in L1 (sync) and L2 (async, fire-and-forget)
    const cacheEntry: CachedPDF = { bytes: pdfBytes, fileName, createdAt: Date.now() };
    pdfCacheL1.set(cacheKey, cacheEntry);
    setPdfInKV(cacheKey, pdfBytes, fileName);

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
        "Cache-Control": "no-store",
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
