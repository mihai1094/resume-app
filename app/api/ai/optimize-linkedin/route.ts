import { NextRequest, NextResponse } from 'next/server';
import { optimizeLinkedInProfile } from '@/lib/ai/content-generator';
import { linkedInOptimizerCache, withCache } from '@/lib/ai/cache';
import { hashCacheKey } from '@/lib/ai/cache-key';
import { verifyAuth } from '@/lib/api/auth-middleware';
import { checkCreditsForOperation } from '@/lib/api/credit-middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/optimize-linkedin
 * Generate LinkedIn profile optimization suggestions
 * Requires authentication and 5 AI credits
 */
export async function POST(request: NextRequest) {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.success) {
        return auth.response;
    }

    // Check and deduct credits
    const creditCheck = await checkCreditsForOperation(auth.user.uid, "optimize-linkedin");
    if (!creditCheck.success) {
        return creditCheck.response;
    }

    try {
        const body = await request.json();
        const { resumeData, targetRole, industry, seniorityLevel } = body;

        // Validation
        if (!resumeData || typeof resumeData !== 'object') {
            return NextResponse.json(
                { error: 'Resume data is required and must be an object' },
                { status: 400 }
            );
        }

        const userKey = hashCacheKey(auth.user.uid);
        const payloadHash = hashCacheKey({
            resumeData,
            targetRole: targetRole || '',
            industry: industry || 'all',
            seniorityLevel: seniorityLevel || 'auto'
        });

        const cacheParams = {
            userKey,
            payloadHash,
        };

        const startTime = Date.now();
        const { data: profile, fromCache } = await withCache(
            linkedInOptimizerCache,
            cacheParams,
            () => optimizeLinkedInProfile({
                resumeData,
                targetRole,
                industry,
                seniorityLevel
            })
        );
        const endTime = Date.now();

        const cacheStats = linkedInOptimizerCache.getStats();

        return NextResponse.json(
            {
                profile,
                meta: {
                    model: 'gemini-2.5-flash',
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
    } catch (error: any) {
        console.error('[AI] Error optimizing LinkedIn profile:', error);

        if (error.message?.includes('quota')) {
            return NextResponse.json(
                {
                    error: 'AI service quota exceeded. Please try again later.',
                    code: 'QUOTA_EXCEEDED',
                },
                { status: 429 }
            );
        }

        if (error.message?.includes('timeout')) {
            return NextResponse.json(
                {
                    error: 'Request timed out. Please try again.',
                    code: 'TIMEOUT',
                },
                { status: 504 }
            );
        }

        return NextResponse.json(
            {
                error: 'Failed to optimize LinkedIn profile. Please try again.',
                code: 'INTERNAL_ERROR',
            },
            { status: 500 }
        );
    }
}
