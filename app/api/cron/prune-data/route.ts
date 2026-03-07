import { NextRequest, NextResponse } from "next/server";
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
  return token === secret;
}

async function handlePrune(request: NextRequest) {
  const secret = getCronSecret();
  if (!secret) {
    cronLogger.error("Prune cron invoked without CRON_SECRET or MAINTENANCE_SECRET");
    return NextResponse.json(
      { error: "Cron secret is not configured" },
      { status: 503 }
    );
  }

  if (!isAuthorized(request, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
