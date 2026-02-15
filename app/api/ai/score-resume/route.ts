import { z } from "zod";
import { scoreResume } from "@/lib/ai/content-generator";
import { resumeScoringCache, withCache } from "@/lib/ai/cache";
import { hashCacheKey } from "@/lib/ai/cache-key";
import { sanitizeResumeForAI } from "@/lib/ai/privacy";
import { withAIRoute, type AIRouteContext } from "@/lib/api/ai-route-wrapper";
import { aiLogger } from "@/lib/services/logger";
import type { ResumeData } from "@/lib/types/resume";
import type { AIBaseOptions } from "@/lib/ai/content-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  resumeData: z.object({}).passthrough(),
  industry: z.string().optional(),
  seniorityLevel: z.string().optional(),
});

type ScoreResumeInput = z.infer<typeof schema>;

/**
 * POST /api/ai/score-resume
 * Score resume quality and provide improvement suggestions
 * Requires authentication and 2 AI credits
 */
export const POST = withAIRoute<ScoreResumeInput>(
  async (body, ctx: AIRouteContext) => {
    const { resumeData, industry, seniorityLevel } = body;
    const resume = sanitizeResumeForAI(
      resumeData as unknown as ResumeData,
      { mode: ctx.privacyMode }
    );

    const userKey = hashCacheKey(ctx.userId);
    const payloadHash = hashCacheKey({
      resumeData: resume,
      industry: industry || "all",
      seniorityLevel: seniorityLevel || "auto",
    });

    const cacheParams = { userKey, payloadHash };

    const startTime = Date.now();
    const { data: score, fromCache } = await withCache(
      resumeScoringCache,
      cacheParams,
      () => scoreResume(resume, { industry, seniorityLevel } as AIBaseOptions)
    );
    const endTime = Date.now();

    const cacheStats = resumeScoringCache.getStats();

    aiLogger.info("Scored resume", {
      action: "score-resume",
      fromCache,
      responseTime: endTime - startTime,
    });

    return {
      score,
      meta: {
        model: "gemini-2.5-flash",
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
    creditOperation: "score-resume",
    schema,
  }
);
