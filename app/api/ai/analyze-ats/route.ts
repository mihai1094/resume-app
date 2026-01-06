import { NextRequest, NextResponse } from 'next/server';
import { analyzeATSCompatibility } from '@/lib/ai/content-generator';
import { atsCache, withCache } from '@/lib/ai/cache';
import { applyRateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { validateJobDescription, validateResumeData } from '@/lib/api/sanitization';
import { withTimeout, TimeoutError, timeoutResponse } from '@/lib/api/timeout';
import { verifyAuth } from '@/lib/api/auth-middleware';
import { checkCreditsForOperation } from '@/lib/api/credit-middleware';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  const creditCheck = await checkCreditsForOperation(auth.user.uid, "analyze-ats");
  if (!creditCheck.success) {
    return creditCheck.response;
  }

  const userId = auth.user.uid;

  try {
    // 1. Rate limiting (user-aware)
    try {
      await applyRateLimit(request, 'AI', userId);
    } catch (error) {
      return rateLimitResponse(error as Error);
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const { resumeData, jobDescription } = body;

    // 3. Validate and sanitize inputs
    let validatedJobDesc: string;
    try {
      validatedJobDesc = validateJobDescription(jobDescription);
    } catch (error) {
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Invalid job description',
          type: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    try {
      validateResumeData(resumeData);
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid resume data',
          type: 'VALIDATION_ERROR',
          details: error instanceof z.ZodError ? error.issues : undefined,
        },
        { status: 400 }
      );
    }

    console.log('[AI] Analyzing ATS compatibility...');

    // Create cache key from job description (normalize to avoid minor variations)
    const normalizedJobDesc = validatedJobDesc
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .substring(0, 500); // First 500 chars for caching

    const cacheParams = {
      jobDescription: normalizedJobDesc,
      // Include resume summary in cache key for better matching
      resumeSkills: resumeData.skills?.map((s: any) => s.name).sort().join(',') || '',
      resumeJobTitle: resumeData.personalInfo?.jobTitle?.toLowerCase() || '',
    };

    // 4. Try cache first, then analyze with timeout if needed
    const startTime = Date.now();
    const { data: analysis, fromCache } = await withCache(
      atsCache,
      cacheParams,
      () => withTimeout(
        analyzeATSCompatibility(resumeData, validatedJobDesc),
        45000 // 45 second timeout for complex analysis
      )
    );
    const endTime = Date.now();

    console.log(
      `[AI] ${fromCache ? 'CACHE HIT' : 'ANALYZED'} ATS in ${endTime - startTime}ms (score: ${analysis.score})`
    );

    // Get cache stats
    const cacheStats = atsCache.getStats();

    return NextResponse.json(
      {
        analysis,
        meta: {
          model: 'gemini-2.5-flash',
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
    console.error('[AI] Error analyzing ATS:', error);

    // Handle timeout errors
    if (error instanceof TimeoutError) {
      return timeoutResponse(error);
    }

    // Handle other errors
    if (error instanceof Error) {
      if (error.message.includes('quota')) {
        return NextResponse.json(
          {
            error: 'AI service quota exceeded. Please try again in a few moments.',
            type: 'QUOTA_EXCEEDED',
          },
          { status: 429 }
        );
      }

      if (error.message.includes('timeout')) {
        return NextResponse.json(
          {
            error: 'Request timed out. Please try again.',
            type: 'TIMEOUT',
          },
          { status: 504 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to analyze ATS compatibility. Please try again.',
        type: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
