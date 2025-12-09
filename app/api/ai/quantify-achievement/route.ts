import { NextRequest, NextResponse } from 'next/server';
import { quantifyAchievement } from '@/lib/ai/content-generator';
import { quantifierCache, withCache } from '@/lib/ai/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { statement } = body;

        // Validation
        if (!statement || typeof statement !== 'string') {
            return NextResponse.json(
                { error: 'Statement is required and must be a string' },
                { status: 400 }
            );
        }

        if (statement.trim().length < 10) {
            return NextResponse.json(
                { error: 'Statement must be at least 10 characters long' },
                { status: 400 }
            );
        }

        if (statement.length > 500) {
            return NextResponse.json(
                { error: 'Statement must not exceed 500 characters' },
                { status: 400 }
            );
        }

        // Cache parameters - normalize for better hit rate
        const cacheParams = {
            statement: statement.toLowerCase().trim(),
        };

        const startTime = Date.now();
        const { data: suggestions, fromCache } = await withCache(
            quantifierCache,
            cacheParams,
            () => quantifyAchievement(statement)
        );
        const endTime = Date.now();

        // Get cache statistics
        const cacheStats = quantifierCache.getStats();

        return NextResponse.json(
            {
                suggestions,
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
        console.error('[AI] Error quantifying achievement:', error);

        // Handle specific error types
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

        // Generic error response
        return NextResponse.json(
            {
                error: 'Failed to quantify achievement. Please try again.',
                code: 'INTERNAL_ERROR',
            },
            { status: 500 }
        );
    }
}
