import { NextRequest, NextResponse } from 'next/server';
import { generateBulletPoints } from '@/lib/ai/content-generator';
import { bulletPointsCache, withCache } from '@/lib/ai/cache';
import { hashCacheKey } from '@/lib/ai/cache-key';
import { sanitizeText } from '@/lib/api/sanitization';
import { verifyAuth } from '@/lib/api/auth-middleware';
import { checkCreditsForOperation } from '@/lib/api/credit-middleware';
import { handleApiError, validationError } from '@/lib/api/error-handler';
import { aiLogger } from '@/lib/services/logger';
import type { Industry } from '@/lib/ai/content-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/generate-bullets
 * Generate professional bullet points for work experience
 * Requires authentication and 2 AI credits
 */
export async function POST(request: NextRequest) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return auth.response;
  }

  // Check and deduct credits
  const creditCheck = await checkCreditsForOperation(auth.user.uid, "generate-bullets");
  if (!creditCheck.success) {
    return creditCheck.response;
  }

  try {
    const body = await request.json();
    const { position, company, industry, customPrompt } = body;

    // Validation
    if (!position || !company) {
      return validationError('Missing required fields: position and company are required');
    }

    // Validate position and company length
    if (position.length < 2 || position.length > 100) {
      return validationError('Position must be between 2 and 100 characters');
    }

    if (company.length < 2 || company.length > 100) {
      return validationError('Company must be between 2 and 100 characters');
    }

    // Sanitize inputs to prevent XSS
    const sanitizedPosition = sanitizeText(position, 100);
    const sanitizedCompany = sanitizeText(company, 100);
    const sanitizedIndustry = industry ? sanitizeText(industry, 100) as Industry : undefined;
    const sanitizedCustomPrompt = customPrompt ? sanitizeText(customPrompt, 500) : undefined;


    const userKey = hashCacheKey(auth.user.uid);
    const payloadHash = hashCacheKey({
      position: sanitizedPosition.toLowerCase().trim(),
      company: sanitizedCompany.toLowerCase().trim(),
      industry: sanitizedIndustry?.toLowerCase().trim(),
      customPrompt: sanitizedCustomPrompt?.toLowerCase().trim(),
    });

    const cacheParams = {
      userKey,
      payloadHash,
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

    // Get cache stats for monitoring
    const cacheStats = bulletPointsCache.getStats();

    // Log successful generation
    aiLogger.info('Generated bullet points', {
      action: 'generate-bullets',
      fromCache,
      responseTime: endTime - startTime,
    });

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
    return handleApiError(error, { module: 'AI', action: 'generate-bullets' });
  }
}
