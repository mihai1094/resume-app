import { z } from "zod";
import { quantifyAchievement } from "@/lib/ai/content-generator";
import { quantifierCache, withCache } from "@/lib/ai/cache";
import { hashCacheKey } from "@/lib/ai/cache-key";
import { sanitizeTextForAI } from "@/lib/ai/privacy";
import { withAIRoute } from "@/lib/api/ai-route-wrapper";
import { aiLogger } from "@/lib/services/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  statement: z
    .string()
    .min(10, "Statement must be at least 10 characters long")
    .max(500, "Statement must not exceed 500 characters"),
});

type Input = z.infer<typeof schema>;

/**
 * POST /api/ai/quantify-achievement
 * Generate quantified versions of achievement statements
 * Requires authentication and 1 AI credit
 */
export const POST = withAIRoute<Input>(
  async (body, ctx) => {
    const { statement } = body;
    const safeStatement = sanitizeTextForAI(statement, { maxLength: 500 });

    const normalizedStatement = safeStatement.toLowerCase().trim();
    const userKey = hashCacheKey(ctx.userId);
    const payloadHash = hashCacheKey({
      statement: normalizedStatement,
    });

    const cacheParams = { userKey, payloadHash };

    const startTime = Date.now();
    const { data: suggestions, fromCache } = await withCache(
      quantifierCache,
      cacheParams,
      () => quantifyAchievement({ statement: safeStatement })
    );
    const endTime = Date.now();

    const cacheStats = quantifierCache.getStats();

    aiLogger.info("Quantified achievement", {
      action: "quantify-achievement",
      fromCache,
      responseTime: endTime - startTime,
    });

    return {
      suggestions,
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
  { creditOperation: "quantify-achievement", schema, timeout: 30000 }
);
