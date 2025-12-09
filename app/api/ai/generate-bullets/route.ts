import { NextRequest, NextResponse } from 'next/server';
import { generateBulletPoints } from '@/lib/ai/content-generator';
import { bulletPointsCache, withCache } from '@/lib/ai/cache';
import { sanitizeInput } from '@/lib/utils/sanitize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/generate-bullets
 * Generate professional bullet points for work experience
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { position, company, industry, customPrompt } = body;

    // Validation
    if (!position || !company) {
      return NextResponse.json(
        {
          error: 'Missing required fields: position and company are required',
        },
        { status: 400 }
      );
    }

    // Validate position and company length
    if (position.length < 2 || position.length > 100) {
      return NextResponse.json(
        { error: 'Position must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    if (company.length < 2 || company.length > 100) {
      return NextResponse.json(
        { error: 'Company must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    // Sanitize inputs to prevent XSS
    const sanitizedPosition = sanitizeInput(position);
    const sanitizedCompany = sanitizeInput(company);
    const sanitizedIndustry = industry ? sanitizeInput(industry) : undefined;
    const sanitizedCustomPrompt = customPrompt ? sanitizeInput(customPrompt) : undefined;

    console.log('[AI] Generating bullets for:', { position: sanitizedPosition, company: sanitizedCompany, industry: sanitizedIndustry });

    // Create cache key from request parameters
    const cacheParams = {
      position: sanitizedPosition.toLowerCase().trim(),
      company: sanitizedCompany.toLowerCase().trim(),
      industry: sanitizedIndustry?.toLowerCase().trim(),
      customPrompt: sanitizedCustomPrompt?.toLowerCase().trim(),
    };

    // Try cache first, then generate if needed
    const startTime = Date.now();
    const { data: bulletPoints, fromCache } = await withCache(
      bulletPointsCache,
      cacheParams,
      () =>
        generateBulletPoints({
          position: sanitizedPosition,
          company: sanitizedCompany,
          industry: sanitizedIndustry,
          customPrompt: sanitizedCustomPrompt,
        })
    );
    const endTime = Date.now();

    console.log(
      `[AI] ${fromCache ? 'CACHE HIT' : 'GENERATED'} ${bulletPoints.length} bullets in ${endTime - startTime}ms`
    );

    // Get cache stats for monitoring
    const cacheStats = bulletPointsCache.getStats();

    // Return the generated bullet points
    return NextResponse.json(
      {
        bulletPoints,
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
    console.error('[AI] Error generating bullet points:', error);

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
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Failed to generate bullet points. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
