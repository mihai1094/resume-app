import { NextRequest, NextResponse } from 'next/server';
import { getAllCacheStats } from '@/lib/ai/cache';
import { verifyAuth } from '@/lib/api/auth-middleware';
import { isAdminUser } from '@/lib/config/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/cache-stats
 * Get cache statistics and monitoring data
 * Requires authentication (admin feature)
 */
export async function GET(request: NextRequest) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return auth.response;
  }

  if (!isAdminUser(auth.user.email)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  try {
    const allStats = getAllCacheStats();

    // Calculate total savings across all caches
    const totalSavings =
      allStats.bulletPoints.estimatedSavings +
      allStats.summary.estimatedSavings +
      allStats.skills.estimatedSavings +
      allStats.ats.estimatedSavings;

    // Calculate overall hit rate
    const totalHits =
      allStats.bulletPoints.hits +
      allStats.summary.hits +
      allStats.skills.hits +
      allStats.ats.hits;

    const totalRequests = totalHits +
      allStats.bulletPoints.misses +
      allStats.summary.misses +
      allStats.skills.misses +
      allStats.ats.misses;

    const overallHitRate = totalRequests > 0 ? totalHits / totalRequests : 0;

    return NextResponse.json({
      overall: {
        hitRate: `${(overallHitRate * 100).toFixed(1)}%`,
        totalHits,
        totalRequests,
        estimatedSavings: `$${totalSavings.toFixed(4)}`,
        savingsPerMonth: `$${(totalSavings * 30).toFixed(2)}`, // Rough monthly estimate
      },
      caches: {
        bulletPoints: {
          ...allStats.bulletPoints,
          hitRate: `${(allStats.bulletPoints.hitRate * 100).toFixed(1)}%`,
          estimatedSavings: `$${allStats.bulletPoints.estimatedSavings.toFixed(4)}`,
          cacheSize: `${allStats.bulletPoints.size}/${allStats.bulletPoints.maxSize}`,
        },
        summary: {
          ...allStats.summary,
          hitRate: `${(allStats.summary.hitRate * 100).toFixed(1)}%`,
          estimatedSavings: `$${allStats.summary.estimatedSavings.toFixed(4)}`,
          cacheSize: `${allStats.summary.size}/${allStats.summary.maxSize}`,
        },
        skills: {
          ...allStats.skills,
          hitRate: `${(allStats.skills.hitRate * 100).toFixed(1)}%`,
          estimatedSavings: `$${allStats.skills.estimatedSavings.toFixed(4)}`,
          cacheSize: `${allStats.skills.size}/${allStats.skills.maxSize}`,
        },
        ats: {
          ...allStats.ats,
          hitRate: `${(allStats.ats.hitRate * 100).toFixed(1)}%`,
          estimatedSavings: `$${allStats.ats.estimatedSavings.toFixed(4)}`,
          cacheSize: `${allStats.ats.size}/${allStats.ats.maxSize}`,
        },
      },
      recommendations: generateRecommendations(allStats, overallHitRate),
    });
  } catch (error) {
    console.error('[Cache Stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cache statistics' },
      { status: 500 }
    );
  }
}

function generateRecommendations(
  stats: ReturnType<typeof getAllCacheStats>,
  overallHitRate: number
) {
  const recommendations: string[] = [];

  if (overallHitRate < 0.3) {
    recommendations.push(
      '📊 Low cache hit rate (<30%). Consider increasing cache TTL or max size.'
    );
  } else if (overallHitRate > 0.7) {
    recommendations.push(
      '🎉 Excellent cache hit rate (>70%)! You\'re saving significant costs.'
    );
  }

  if (stats.bulletPoints.size >= stats.bulletPoints.maxSize * 0.9) {
    recommendations.push(
      '⚠️ Bullet points cache is 90%+ full. Consider increasing maxSize.'
    );
  }

  const totalSavings =
    stats.bulletPoints.estimatedSavings +
    stats.summary.estimatedSavings +
    stats.skills.estimatedSavings +
    stats.ats.estimatedSavings;

  if (totalSavings > 1) {
    recommendations.push(
      `💰 Cache has saved you $${totalSavings.toFixed(2)} so far!`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Cache is performing well. Keep monitoring!');
  }

  return recommendations;
}
