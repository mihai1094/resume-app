import { NextRequest, NextResponse } from 'next/server';
import { optimizeLinkedInProfile } from '@/lib/ai/content-generator';
import { linkedInOptimizerCache, withCache } from '@/lib/ai/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { resumeData } = body;

        // Validation
        if (!resumeData || typeof resumeData !== 'object') {
            return NextResponse.json(
                { error: 'Resume data is required and must be an object' },
                { status: 400 }
            );
        }

        // Cache parameters - use resume ID if available
        const cacheParams = {
            resumeId: resumeData.id || 'default',
        };

        const startTime = Date.now();
        const { data: profile, fromCache } = await withCache(
            linkedInOptimizerCache,
            cacheParams,
            () => optimizeLinkedInProfile(resumeData)
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
