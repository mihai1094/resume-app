import { NextRequest, NextResponse } from 'next/server';
import { suggestSkills } from '@/lib/ai/content-generator';
import { skillsCache, withCache } from '@/lib/ai/cache';
import { hashCacheKey } from '@/lib/ai/cache-key';
import { verifyAuth } from '@/lib/api/auth-middleware';
import { checkCreditsForOperation } from '@/lib/api/credit-middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/suggest-skills
 * Suggest relevant skills based on job title
 * Requires authentication and 1 AI credit
 */
export async function POST(request: NextRequest) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return auth.response;
  }

  // Check and deduct credits
  const creditCheck = await checkCreditsForOperation(auth.user.uid, "suggest-skills");
  if (!creditCheck.success) {
    return creditCheck.response;
  }

  try {
    const body = await request.json();
    const { jobTitle, jobDescription, industry, seniorityLevel } = body;

    // Validation
    if (!jobTitle || jobTitle.trim().length < 2) {
      return NextResponse.json(
        {
          error: 'Job title is required and must be at least 2 characters',
        },
        { status: 400 }
      );
    }

    if (jobTitle.length > 100) {
      return NextResponse.json(
        { error: 'Job title must be less than 100 characters' },
        { status: 400 }
      );
    }


    const normalizedJobTitle = jobTitle.toLowerCase().trim();
    const normalizedJobDescription = jobDescription
      ? jobDescription.toLowerCase().trim().replace(/\s+/g, ' ').substring(0, 200)
      : '';
    const userKey = hashCacheKey(auth.user.uid);
    const payloadHash = hashCacheKey({
      jobTitle: normalizedJobTitle,
      jobDescription: normalizedJobDescription,
      industry: industry?.toLowerCase().trim(),
      seniorityLevel: seniorityLevel?.toLowerCase().trim(),
    });

    const cacheParams = {
      userKey,
      payloadHash,
    };

    // Try cache first, then generate if needed
    const startTime = Date.now();
    const { data: skills, fromCache } = await withCache(
      skillsCache,
      cacheParams,
      () => suggestSkills({ jobTitle, jobDescription, industry, seniorityLevel })
    );
    const endTime = Date.now();


    // Get cache stats
    const cacheStats = skillsCache.getStats();

    return NextResponse.json(
      {
        skills,
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
    console.error('[AI] Error suggesting skills:', error);

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
        error: 'Failed to suggest skills. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
