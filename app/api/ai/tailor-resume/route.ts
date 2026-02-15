import { tailorResume } from '@/lib/ai/content-generator';
import { tailorResumeCache, withCache } from '@/lib/ai/cache';
import { hashCacheKey } from '@/lib/ai/cache-key';
import { withAIRoute, type AIRouteContext } from '@/lib/api/ai-route-wrapper';
import { sanitizeResumeForAI } from "@/lib/ai/privacy";
import { aiLogger } from '@/lib/services/logger';
import type { ResumeData } from '@/lib/types/resume';
import type { AIBaseOptions } from '@/lib/ai/content-types';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  resumeData: z.object({}).passthrough(),
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters'),
  industry: z.string().optional(),
  seniorityLevel: z.string().optional(),
});

type TailorResumeBody = z.infer<typeof requestSchema>;

/**
 * POST /api/ai/tailor-resume
 * Tailor resume content for specific job description
 * Requires authentication and 5 AI credits
 */
export const POST = withAIRoute<TailorResumeBody>(
  async (body, ctx: AIRouteContext) => {
    const { resumeData, jobDescription, industry, seniorityLevel } = body;
    const resume = sanitizeResumeForAI(
      resumeData as unknown as ResumeData,
      { mode: ctx.privacyMode }
    );

    const userKey = hashCacheKey(ctx.userId);
    const payloadHash = hashCacheKey({
      resumeData: resume,
      jobDescription,
      industry: industry || 'all',
      seniorityLevel: seniorityLevel || 'auto',
    });

    const cacheParams = { userKey, payloadHash };

    const startTime = Date.now();
    const { data: result, fromCache } = await withCache(
      tailorResumeCache,
      cacheParams,
      () => tailorResume(resume, jobDescription, { industry, seniorityLevel } as AIBaseOptions)
    );
    const endTime = Date.now();

    const cacheStats = tailorResumeCache.getStats();

    aiLogger.info('Tailored resume', {
      action: 'tailor-resume',
      fromCache,
      responseTime: endTime - startTime,
    });

    return {
      result,
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
    };
  },
  {
    creditOperation: 'tailor-resume',
    schema: requestSchema,
    timeout: 30000,
  }
);
