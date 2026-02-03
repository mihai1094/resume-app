import { NextRequest, NextResponse } from "next/server";
import { scoreResume } from "@/lib/ai/content-generator";
import { resumeScoringCache, withCache } from "@/lib/ai/cache";
import { hashCacheKey } from "@/lib/ai/cache-key";
import { verifyAuth } from "@/lib/api/auth-middleware";
import { checkCreditsForOperation } from "@/lib/api/credit-middleware";
import { handleApiError, validationError } from "@/lib/api/error-handler";
import { aiLogger } from "@/lib/services/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/ai/score-resume
 * Score resume quality and provide improvement suggestions
 * Requires authentication and 2 AI credits
 */
export async function POST(request: NextRequest) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return auth.response;
  }

  // Check and deduct credits
  const creditCheck = await checkCreditsForOperation(
    auth.user.uid,
    "score-resume"
  );
  if (!creditCheck.success) {
    return creditCheck.response;
  }

  try {
    const body = await request.json();
    const { resumeData, industry, seniorityLevel } = body;

    // Validation
    if (!resumeData || typeof resumeData !== "object") {
      return validationError("Resume data is required and must be an object");
    }

    const userKey = hashCacheKey(auth.user.uid);
    const payloadHash = hashCacheKey({
      resumeData,
      industry: industry || 'all',
      seniorityLevel: seniorityLevel || 'auto',
    });

    const cacheParams = {
      userKey,
      payloadHash,
    };

    const startTime = Date.now();
    const { data: score, fromCache } = await withCache(
      resumeScoringCache,
      cacheParams,
      () => scoreResume(resumeData, { industry, seniorityLevel })
    );
    const endTime = Date.now();

    const cacheStats = resumeScoringCache.getStats();

    // Log successful scoring
    aiLogger.info("Scored resume", {
      action: "score-resume",
      fromCache,
      responseTime: endTime - startTime,
    });

    return NextResponse.json(
      {
        score,
        meta: {
          model: "gemini-2.5-flash",
          responseTime: endTime - startTime,
          fromCache,
          cacheStats: {
            hitRate: `${(cacheStats.hitRate * 100).toFixed(1)}%`,
            totalHits: cacheStats.hits,
            totalMisses: cacheStats.misses,
            estimatedSavings: `$${cacheStats.estimatedSavings.toFixed(4)}`,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, { module: "AI", action: "score-resume" });
  }
}
