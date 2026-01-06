import { NextRequest, NextResponse } from 'next/server';
import { improveBulletPoint } from '@/lib/ai/content-generator';
import { bulletPointsCache, withCache } from '@/lib/ai/cache';
import { verifyAuth } from '@/lib/api/auth-middleware';
import { checkCreditsForOperation } from '@/lib/api/credit-middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/improve-bullet
 * Improve an existing bullet point with AI suggestions
 * Requires authentication and 1 AI credit
 */
export async function POST(request: NextRequest) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return auth.response;
  }

  // Check and deduct credits
  const creditCheck = await checkCreditsForOperation(auth.user.uid, "improve-bullet");
  if (!creditCheck.success) {
    return creditCheck.response;
  }

  try {
    const body = await request.json();
    const { bulletPoint } = body;

    // Validation
    if (!bulletPoint || bulletPoint.trim().length < 10) {
      return NextResponse.json(
        {
          error: 'Bullet point is required and must be at least 10 characters',
        },
        { status: 400 }
      );
    }

    if (bulletPoint.length > 500) {
      return NextResponse.json(
        { error: 'Bullet point must be less than 500 characters' },
        { status: 400 }
      );
    }

    console.log('[AI] Improving bullet point...');

    // Create cache key
    const cacheParams = {
      bulletPoint: bulletPoint.toLowerCase().trim(),
      type: 'improve',
    };

    // Try cache first, then improve if needed
    const startTime = Date.now();
    const { data: result, fromCache } = await withCache(
      bulletPointsCache,
      cacheParams,
      () => improveBulletPoint(bulletPoint)
    );
    const endTime = Date.now();

    console.log(
      `[AI] ${fromCache ? 'CACHE HIT' : 'IMPROVED'} bullet in ${endTime - startTime}ms`
    );

    // Get cache stats
    const cacheStats = bulletPointsCache.getStats();

    return NextResponse.json(
      {
        result,
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
    console.error('[AI] Error improving bullet point:', error);

    if (error instanceof Error) {
      if (error.message.includes('quota')) {
        return NextResponse.json(
          {
            error:
              'AI service quota exceeded. Please try again in a few moments.',
          },
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
        error: 'Failed to improve bullet point. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
