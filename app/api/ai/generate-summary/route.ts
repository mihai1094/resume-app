import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/ai/content-generator";
import { summaryCache, withCache } from "@/lib/ai/cache";
import { hashCacheKey } from "@/lib/ai/cache-key";
import { verifyAuth } from "@/lib/api/auth-middleware";
import { checkCreditsForOperation } from "@/lib/api/credit-middleware";
import { handleApiError, validationError } from "@/lib/api/error-handler";
import { aiLogger } from "@/lib/services/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/ai/generate-summary
 * Generate professional summary for resume
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
    "generate-summary"
  );
  if (!creditCheck.success) {
    return creditCheck.response;
  }

  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      jobTitle,
      yearsOfExperience,
      keySkills,
      recentPosition,
      recentCompany,
      tone = "professional",
    } = body;

    // Validation
    if (!firstName || !lastName) {
      return validationError(
        "Missing required fields: firstName and lastName are required"
      );
    }

    if (keySkills && !Array.isArray(keySkills)) {
      return validationError("keySkills must be an array");
    }

    const userKey = hashCacheKey(auth.user.uid);
    const payloadHash = hashCacheKey({
      firstName,
      lastName,
      jobTitle,
      yearsOfExperience,
      keySkills,
      recentPosition,
      recentCompany,
      tone,
    });

    const cacheParams = {
      userKey,
      payloadHash,
    };

    // Try cache first, then generate if needed
    const startTime = Date.now();
    const { data: summary, fromCache } = await withCache(
      summaryCache,
      cacheParams,
      () =>
        generateSummary({
          firstName,
          lastName,
          jobTitle,
          yearsOfExperience,
          keySkills: keySkills || [],
          recentPosition,
          recentCompany,
          tone,
        })
    );
    const endTime = Date.now();

    // Get cache stats
    const cacheStats = summaryCache.getStats();

    // Log successful generation
    aiLogger.info("Generated summary", {
      action: "generate-summary",
      fromCache,
      responseTime: endTime - startTime,
    });

    return NextResponse.json(
      {
        summary,
        meta: {
          model: "gemini-2.5-flash",
          responseTime: endTime - startTime,
          fromCache,
          cacheStats: {
            hitRate: `${(cacheStats.hitRate * 100).toFixed(1)}%`,
            totalHits: cacheStats.hits,
            estimatedSavings: `$${cacheStats.estimatedSavings.toFixed(4)}`,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, { module: "AI", action: "generate-summary" });
  }
}
