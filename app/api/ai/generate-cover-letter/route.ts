import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetter } from '@/lib/ai/content-generator';
import { coverLetterCache, withCache } from '@/lib/ai/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/generate-cover-letter
 * Generate personalized cover letter from resume and job description
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            resumeData,
            jobDescription,
            companyName,
            positionTitle,
            hiringManagerName,
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

        console.log('[AI] Generating cover letter for:', {
            company: companyName,
            position: positionTitle,
        });

        // Create cache key from request parameters
        // Note: We cache based on company + position + job description hash
        // Resume data is NOT cached as it's user-specific
        const cacheParams = {
            companyName: companyName.toLowerCase().trim(),
            positionTitle: positionTitle.toLowerCase().trim(),
            jobDescriptionHash: jobDescription
                .toLowerCase()
                .trim()
                .substring(0, 200), // Use first 200 chars as hash
            hiringManagerName: hiringManagerName?.toLowerCase().trim(),
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
                })
        );
        const endTime = Date.now();

        console.log(
            `[AI] ${fromCache ? 'CACHE HIT' : 'GENERATED'} cover letter in ${endTime - startTime}ms`
        );

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
