import { z } from "zod";
import { optimizeLinkedInProfile } from "@/lib/ai/content-generator";
import { linkedInOptimizerCache, withCache } from "@/lib/ai/cache";
import { hashCacheKey } from "@/lib/ai/cache-key";
import { sanitizeResumeForAI } from "@/lib/ai/privacy";
import { withAIRoute, type AIRouteContext } from "@/lib/api/ai-route-wrapper";
import { aiLogger } from "@/lib/services/logger";
import type { ResumeData } from "@/lib/types/resume";
import type { Industry, SeniorityLevel } from "@/lib/ai/content-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  resumeData: z.object({}).passthrough(),
  targetRole: z.string().optional(),
  industry: z.string().optional(),
  seniorityLevel: z.string().optional(),
});

type OptimizeLinkedInInput = z.infer<typeof schema>;

/**
 * POST /api/ai/optimize-linkedin
 * Generate LinkedIn profile optimization suggestions
 * Requires authentication and 5 AI credits
 */
export const POST = withAIRoute<OptimizeLinkedInInput>(
  async (body, ctx: AIRouteContext) => {
    const { resumeData, targetRole, industry, seniorityLevel } = body;
    const resume = sanitizeResumeForAI(
      resumeData as unknown as ResumeData,
      { mode: ctx.privacyMode }
    );

    const userKey = hashCacheKey(ctx.userId);
    const payloadHash = hashCacheKey({
      resumeData: resume,
      targetRole: targetRole || "",
      industry: industry || "all",
      seniorityLevel: seniorityLevel || "auto",
    });

    const cacheParams = { userKey, payloadHash };

    const startTime = Date.now();
    const { data: profile, fromCache } = await withCache(
      linkedInOptimizerCache,
      cacheParams,
      () =>
        optimizeLinkedInProfile({
          resumeData: resume,
          targetRole,
          industry: industry as Industry | undefined,
          seniorityLevel: seniorityLevel as SeniorityLevel | undefined,
        })
    );
    const endTime = Date.now();

    const cacheStats = linkedInOptimizerCache.getStats();

    aiLogger.info("Optimized LinkedIn profile", {
      action: "optimize-linkedin",
      fromCache,
      responseTime: endTime - startTime,
    });

    return {
      profile,
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
    creditOperation: "optimize-linkedin",
    schema,
  }
);
