import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { pruneExpiredAbuseGuardData } from "@/lib/services/abuse-guard";
import { analyticsServiceServer } from "@/lib/services/analytics-service-server";
import { logger } from "@/lib/services/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cronLogger = logger.child({ module: "CronPruneData" });

function getCronSecret(): string | null {
  return process.env.CRON_SECRET || process.env.MAINTENANCE_SECRET || null;
}

function isAuthorized(request: NextRequest, secret: string): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return false;
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const tokenBuf = Buffer.from(token);
  const secretBuf = Buffer.from(secret);
  if (tokenBuf.length !== secretBuf.length) return false;
  return timingSafeEqual(tokenBuf, secretBuf);
}

// Single generic not-found response used both for misconfiguration and for
// unauthorized callers. Security: never confirm whether CRON_SECRET is set
// or whether this route exists — both cases return the same 404.
const notFoundResponse = () =>
  NextResponse.json({ error: "Not found" }, { status: 404 });

async function handlePrune(request: NextRequest) {
  const secret = getCronSecret();
  if (!secret) {
    // Log the misconfiguration server-side so ops can still detect it,
    // but do not leak the state to the caller.
    cronLogger.error("Prune cron invoked without CRON_SECRET or MAINTENANCE_SECRET");
    return notFoundResponse();
  }

  if (!isAuthorized(request, secret)) {
    return notFoundResponse();
  }

  try {
    const [abuseGuard, analytics] = await Promise.all([
      pruneExpiredAbuseGuardData(),
      analyticsServiceServer.pruneExpiredEvents(),
    ]);

    return NextResponse.json({
      success: true,
      abuseGuard,
      analytics,
      ranAt: new Date().toISOString(),
    });
  } catch (error) {
    cronLogger.error("Failed to prune expired data", error);
    return NextResponse.json(
      { error: "Failed to prune expired data" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handlePrune(request);
}

export async function POST(request: NextRequest) {
  return handlePrune(request);
}
