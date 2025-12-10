import { NextRequest, NextResponse } from 'next/server';
import { generateSummary } from '@/lib/ai/content-generator';
import { summaryCache, withCache } from '@/lib/ai/cache';
import { verifyAuth } from '@/lib/api/auth-middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/generate-summary
 * Generate professional summary for resume
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return auth.response;
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
      tone = 'professional',
    } = body;

    // Validation
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName and lastName are required' },
        { status: 400 }
      );
    }

    if (keySkills && !Array.isArray(keySkills)) {
      return NextResponse.json(
        { error: 'keySkills must be an array' },
        { status: 400 }
      );
    }

    console.log('[AI] Generating summary for:', { firstName, lastName, jobTitle, tone });

    // Create cache key
    const cacheParams = {
      jobTitle: jobTitle?.toLowerCase().trim() || '',
      yearsOfExperience: yearsOfExperience || 0,
      keySkills: (keySkills || [])
        .slice(0, 5)
        .map((s: string) => s.toLowerCase().trim())
        .sort()
        .join(','),
      tone,
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

    console.log(
      `[AI] ${fromCache ? 'CACHE HIT' : 'GENERATED'} summary in ${endTime - startTime}ms`
    );

    // Get cache stats
    const cacheStats = summaryCache.getStats();

    return NextResponse.json(
      {
        summary,
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
    console.error('[AI] Error generating summary:', error);

    if (error instanceof Error) {
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'AI service quota exceeded. Please try again in a few moments.' },
          { status: 429 }
        );
      }

      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Request timed out. Please try again.' },
          { status: 504 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate summary. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
