import { NextRequest, NextResponse } from 'next/server';
import { analyzeText } from '@/lib/ai/content-generator';
import { writingAssistantCache, withCache } from '@/lib/ai/cache';
import { verifyAuth } from '@/lib/api/auth-middleware';
import { checkCreditsForOperation } from '@/lib/api/credit-middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/analyze-text
 * Analyze text for writing quality and provide suggestions
 * Requires authentication and 1 AI credit
 */
export async function POST(request: NextRequest) {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.success) {
        return auth.response;
    }

    // Check and deduct credits
    const creditCheck = await checkCreditsForOperation(auth.user.uid, "analyze-text");
    if (!creditCheck.success) {
        return creditCheck.response;
    }

    try {
        const body = await request.json();
        const { text, context = 'bullet-point' } = body;

        // Validation
        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Text is required and must be a string' },
                { status: 400 }
            );
        }

        if (text.trim().length < 5) {
            return NextResponse.json(
                { error: 'Text must be at least 5 characters long' },
                { status: 400 }
            );
        }

        if (text.length > 1000) {
            return NextResponse.json(
                { error: 'Text must be less than 1000 characters' },
                { status: 400 }
            );
        }

        const validContexts = ['bullet-point', 'summary', 'description'];
        if (!validContexts.includes(context)) {
            return NextResponse.json(
                { error: 'Invalid context. Must be: bullet-point, summary, or description' },
                { status: 400 }
            );
        }

        console.log('[AI] Analyzing text:', {
            length: text.length,
            context,
        });

        // Create cache key from text and context
        const cacheParams = {
            text: text.toLowerCase().trim(),
            context,
        };

        // Try cache first, then analyze if needed
        const startTime = Date.now();
        const { data: analysis, fromCache } = await withCache(
            writingAssistantCache,
            cacheParams,
            () => analyzeText(text, { context: context as 'bullet-point' | 'summary' | 'description' })
        );
        const endTime = Date.now();

        console.log(
            `[AI] ${fromCache ? 'CACHE HIT' : 'ANALYZED'} text in ${endTime - startTime}ms`
        );

        // Get cache stats for monitoring
        const cacheStats = writingAssistantCache.getStats();

        // Return the analysis
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
        console.error('[AI] Error analyzing text:', error);

        // Check for specific error types
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

            if (error.message.includes('parse')) {
                return NextResponse.json(
                    {
                        error: 'Failed to parse AI response. The text may be too complex.',
                    },
                    { status: 500 }
                );
            }
        }

        // Generic error
        return NextResponse.json(
            {
                error: 'Failed to analyze text. Please try again.',
                details: process.env.NODE_ENV === 'development' ? error : undefined,
            },
            { status: 500 }
        );
    }
}
