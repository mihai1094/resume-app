import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetter } from '@/lib/ai/content-generator';
import { coverLetterCache, withCache } from '@/lib/ai/cache';
import { hashCacheKey } from '@/lib/ai/cache-key';
import { verifyAuth } from '@/lib/api/auth-middleware';
import { checkCreditsForOperation } from '@/lib/api/credit-middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/generate-cover-letter
 * Generate personalized cover letter from resume and job description
 * Requires authentication and 5 AI credits
 */
export async function POST(request: NextRequest) {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.success) {
        return auth.response;
    }

    // Check and deduct credits
    const creditCheck = await checkCreditsForOperation(auth.user.uid, "generate-cover-letter");
    if (!creditCheck.success) {
        return creditCheck.response;
    }

    try {
        const body = await request.json();
        const {
            resumeData,
            jobDescription,
            companyName,
            positionTitle,
            hiringManagerName,
            industry,
            seniorityLevel,
        } = body;

        // Validation
        if (!resumeData || !jobDescription || !companyName || !positionTitle) {
            return NextResponse.json(
                {
                    error:
                        'Missing required fields: resumeData, jobDescription, companyName, and positionTitle are required',
                },
                { status: 400 }
            );
        }

        // Validate field lengths
        if (jobDescription.length < 50) {
            return NextResponse.json(
                { error: 'Job description must be at least 50 characters' },
                { status: 400 }
            );
        }

        if (companyName.length < 2 || companyName.length > 100) {
            return NextResponse.json(
                { error: 'Company name must be between 2 and 100 characters' },
                { status: 400 }
            );
        }

        if (positionTitle.length < 2 || positionTitle.length > 100) {
            return NextResponse.json(
                { error: 'Position title must be between 2 and 100 characters' },
                { status: 400 }
            );
        }

        const userKey = hashCacheKey(auth.user.uid);
        const payloadHash = hashCacheKey({
            resumeData,
            jobDescription,
            companyName,
            positionTitle,
            hiringManagerName,
            industry: industry?.toLowerCase().trim(),
            seniorityLevel: seniorityLevel?.toLowerCase().trim(),
        });

        const cacheParams = {
            userKey,
            payloadHash,
        };

        // Try cache first, then generate if needed
        const startTime = Date.now();
        const { data: coverLetter, fromCache } = await withCache(
            coverLetterCache,
            cacheParams,
            () =>
                generateCoverLetter({
                    resumeData,
                    jobDescription,
                    companyName,
                    positionTitle,
                    hiringManagerName,
                    industry,
                    seniorityLevel,
                })
        );
        const endTime = Date.now();

        // Get cache stats for monitoring
        const cacheStats = coverLetterCache.getStats();

        // Return the generated cover letter
        return NextResponse.json(
            {
                coverLetter,
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
        console.error('[AI] Error generating cover letter:', error);

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
                        error:
                            'Failed to parse AI response. Please try again or rephrase your job description.',
                    },
                    { status: 500 }
                );
            }
        }

        // Generic error
        return NextResponse.json(
            {
                error: 'Failed to generate cover letter. Please try again.',
                details: process.env.NODE_ENV === 'development' ? error : undefined,
            },
            { status: 500 }
        );
    }
}
