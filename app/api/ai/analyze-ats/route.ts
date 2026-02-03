import { NextRequest, NextResponse } from "next/server";
import { analyzeATSCompatibility } from "@/lib/ai/content-generator";
import { atsCache, withCache } from "@/lib/ai/cache";
import { hashCacheKey } from "@/lib/ai/cache-key";
import { applyRateLimit, rateLimitResponse } from "@/lib/api/rate-limit";
import {
  validateJobDescription,
  validateResumeData,
} from "@/lib/api/sanitization";
import { withTimeout, TimeoutError, timeoutResponse } from "@/lib/api/timeout";
import { verifyAuth } from "@/lib/api/auth-middleware";
import { checkCreditsForOperation } from "@/lib/api/credit-middleware";
import { handleApiError, validationError } from "@/lib/api/error-handler";
import { aiLogger } from "@/lib/services/logger";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/ai/analyze-ats
 * Analyze resume for ATS compatibility against job description
 * Requires authentication and 3 AI credits
 *
 * Security features:
 * - Authentication: Firebase ID token required
 * - Rate limiting: User-level (15/min, 100/hour for authenticated users)
 * - Input sanitization: Strip HTML/scripts
 * - Size limits: Max 20,000 chars for job description
 * - Timeout: 15 seconds
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
    "analyze-ats"
  );
  if (!creditCheck.success) {
    return creditCheck.response;
  }

  const userId = auth.user.uid;

  try {
    // 1. Rate limiting (user-aware)
    try {
      await applyRateLimit(request, "AI", userId);
    } catch (error) {
      return rateLimitResponse(error as Error);
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const { resumeData, jobDescription, industry, seniorityLevel } = body;

    // 3. Validate and sanitize inputs
    let validatedJobDesc: string;
    try {
      validatedJobDesc = validateJobDescription(jobDescription);
    } catch (error) {
      return validationError(
        error instanceof Error ? error.message : "Invalid job description"
      );
    }

    try {
      validateResumeData(resumeData);
    } catch (error) {
      const fields =
        error instanceof z.ZodError
          ? error.issues.reduce((acc, issue) => {
            const path = issue.path.join(".");
            acc[path] = [issue.message];
            return acc;
          }, {} as Record<string, string[]>)
          : undefined;
      return validationError("Invalid resume data", fields);
    }

    // Create cache key from job description (normalize to avoid minor variations)
    const normalizedJobDesc = validatedJobDesc
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .substring(0, 500); // First 500 chars for caching

    const userKey = hashCacheKey(auth.user.uid);
    const payloadHash = hashCacheKey({
      resumeData,
      jobDescription: normalizedJobDesc,
      industry: industry || 'all',
      seniorityLevel: seniorityLevel || 'auto',
    });

    const cacheParams = {
      userKey,
      payloadHash,
    };

    // 4. Try cache first, then analyze with timeout if needed
    const startTime = Date.now();
    const { data: analysis, fromCache } = await withCache(
      atsCache,
      cacheParams,
      () =>
        withTimeout(
          analyzeATSCompatibility(resumeData, validatedJobDesc, { industry, seniorityLevel }),
          45000 // 45 second timeout for complex analysis
        )
    );
    const endTime = Date.now();

    // Get cache stats
    const cacheStats = atsCache.getStats();

    // Log successful analysis
    aiLogger.info("Analyzed ATS compatibility", {
      action: "analyze-ats",
      fromCache,
      responseTime: endTime - startTime,
    });

    return NextResponse.json(
      {
        analysis,
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
    // Handle timeout errors with specific response
    if (error instanceof TimeoutError) {
      return timeoutResponse(error);
    }

    return handleApiError(error, { module: "AI", action: "analyze-ats" });
  }
}
