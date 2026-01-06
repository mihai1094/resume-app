import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "@/lib/services/analytics-service";
import { AnalyticsEventType, TrafficSource } from "@/lib/types/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/analytics/track
 * Track an analytics event for a public resume
 *
 * No authentication required - public endpoint for tracking
 * Rate limiting should be handled at the infrastructure level (Vercel, Cloudflare, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeId, type, source } = body;

    // Validate required fields
    if (!resumeId || typeof resumeId !== "string") {
      return NextResponse.json(
        { error: "Resume ID is required" },
        { status: 400 }
      );
    }

    if (!type || !["view", "download", "share"].includes(type)) {
      return NextResponse.json(
        { error: "Valid event type is required (view, download, share)" },
        { status: 400 }
      );
    }

    // Extract metadata from headers
    const referrer = request.headers.get("referer") || body.referrer || "";
    const userAgent = request.headers.get("user-agent") || "";

    // Try to get country from various headers (Cloudflare, Vercel, etc.)
    const country =
      request.headers.get("cf-ipcountry") || // Cloudflare
      request.headers.get("x-vercel-ip-country") || // Vercel
      request.headers.get("x-country") || // Custom header
      body.country ||
      undefined;

    // Determine source from referrer if not provided
    const determinedSource: TrafficSource =
      source || analyticsService.determineSource(referrer);

    // Track the event
    const success = await analyticsService.trackEvent(resumeId, {
      type: type as AnalyticsEventType,
      source: determinedSource,
      country,
      referrer: referrer || undefined,
      userAgent: userAgent || undefined,
    });

    if (!success) {
      return NextResponse.json(
        { error: "Failed to track event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Analytics] Error tracking event:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}
