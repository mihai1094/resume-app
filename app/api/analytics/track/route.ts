import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { AnalyticsEventType, TrafficSource } from "@/lib/types/analytics";
import { applyRateLimit, rateLimitResponse } from "@/lib/api/rate-limit";
import { analyticsServiceServer } from "@/lib/services/analytics-service-server";
import { logger } from "@/lib/services/logger";
import {
  COOKIE_CONSENT_COOKIE_NAME,
  isGrantedCookieConsent,
} from "@/lib/privacy/consent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const analyticsLogger = logger.child({ module: "Analytics" });

// --- Bot detection ---
const BOT_UA_PATTERNS = [
  /bot/i,
  /crawl/i,
  /spider/i,
  /scrape/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /headless/i,
];

function isBot(userAgent: string): boolean {
  if (!userAgent || userAgent.length < 10) return true;
  return BOT_UA_PATTERNS.some((p) => p.test(userAgent));
}

// --- resumeId format validation ---
// Firestore doc IDs are 1-1500 bytes, typically alphanumeric + hyphens
const RESUME_ID_PATTERN = /^[a-zA-Z0-9_-]{10,40}$/;

function isValidResumeId(id: string): boolean {
  return typeof id === "string" && RESUME_ID_PATTERN.test(id);
}

// --- Event dedupe (per IP + resumeId + type) ---
const DEDUPE_WINDOW_MS = 30_000; // 30 seconds
const DEDUPE_MAX_ENTRIES = 2000;
const dedupeMap = new Map<string, number>();

function isDuplicate(key: string): boolean {
  const now = Date.now();

  // Prune expired entries periodically
  if (dedupeMap.size > DEDUPE_MAX_ENTRIES) {
    for (const [k, ts] of dedupeMap) {
      if (now - ts > DEDUPE_WINDOW_MS) dedupeMap.delete(k);
    }
  }

  const lastSeen = dedupeMap.get(key);
  if (lastSeen && now - lastSeen < DEDUPE_WINDOW_MS) return true;
  dedupeMap.set(key, now);
  return false;
}

const VALID_EVENT_TYPES: AnalyticsEventType[] = ["view", "download", "share"];
const VALID_SOURCES: TrafficSource[] = [
  "direct",
  "qr",
  "social",
  "referral",
  "unknown",
];

function normalizeReferrer(referrer: unknown): string | undefined {
  if (typeof referrer !== "string") return undefined;
  const trimmed = referrer.trim();
  if (!trimmed) return undefined;

  try {
    return new URL(trimmed).hostname.replace(/^www\./, "");
  } catch {
    return trimmed.replace(/^www\./, "").slice(0, 120);
  }
}

function normalizeCountry(country: unknown): string | undefined {
  if (typeof country !== "string") return undefined;
  const normalized = country.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : undefined;
}

function hashForDedupe(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * POST /api/analytics/track
 * Track an analytics event for a public resume
 *
 * Public endpoint with rate limiting, bot filtering, and dedupe.
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  try {
    await applyRateLimit(request, "ANALYTICS");
  } catch (error) {
    return rateLimitResponse(error as Error);
  }

  // Bot filtering
  const userAgent = request.headers.get("user-agent") || "";
  if (isBot(userAgent)) {
    // Silently accept but don't track - avoids leaking detection to bots
    return NextResponse.json({ success: true }, { status: 200 });
  }

  // Track only when consent for non-essential analytics exists.
  const consent = request.cookies.get(COOKIE_CONSENT_COOKIE_NAME)?.value;
  if (!isGrantedCookieConsent(consent)) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  try {
    const body = await request.json();
    const { resumeId, type, source } = body;

    // Validate resumeId format
    if (!isValidResumeId(resumeId)) {
      return NextResponse.json(
        { error: "Invalid resume ID" },
        { status: 400 }
      );
    }

    if (!type || !VALID_EVENT_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Valid event type is required (view, download, share)" },
        { status: 400 }
      );
    }

    // Dedupe check (IP + resumeId + type)
    const clientIP =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const dedupeKey = hashForDedupe(`${clientIP}:${resumeId}:${type}`);
    if (isDuplicate(dedupeKey)) {
      // Accept silently to avoid leaking dedupe logic
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Extract metadata from headers
    const referrer = normalizeReferrer(
      request.headers.get("referer") || body.referrer
    );
    const country = normalizeCountry(
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("x-country") ||
      body.country
    );

    const providedSource =
      typeof source === "string" && VALID_SOURCES.includes(source as TrafficSource)
        ? (source as TrafficSource)
        : undefined;

    const determinedSource: TrafficSource =
      providedSource || analyticsServiceServer.determineSource(referrer);

    // Track the event
    const success = await analyticsServiceServer.trackPublicEvent(resumeId, {
      type: type as AnalyticsEventType,
      source: determinedSource,
      country,
      referrer,
    });

    if (!success) {
      // No-op for unknown/non-public resumes to avoid disclosing metadata.
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    analyticsLogger.error(
      "Error tracking event",
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}
