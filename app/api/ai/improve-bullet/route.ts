import { z } from "zod";
import { improveBulletPoint } from "@/lib/ai/content-generator";
import { bulletPointsCache, withCache } from "@/lib/ai/cache";
import { hashCacheKey } from "@/lib/ai/cache-key";
import { sanitizeTextForAI } from "@/lib/ai/privacy";
import { withAIRoute } from "@/lib/api/ai-route-wrapper";
import { aiLogger } from "@/lib/services/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  bulletPoint: z
    .string()
    .min(10, "Bullet point must be at least 10 characters")
    .max(500, "Bullet point must be less than 500 characters"),
});

type Input = z.infer<typeof schema>;

/**
 * POST /api/ai/improve-bullet
 * Improve an existing bullet point with AI suggestions
 * Requires authentication and 1 AI credit
 */
export const POST = withAIRoute<Input>(
  async (body, ctx) => {
    const { bulletPoint } = body;
    const safeBulletPoint = sanitizeTextForAI(bulletPoint, { maxLength: 500 });

    const userKey = hashCacheKey(ctx.userId);
    const payloadHash = hashCacheKey({
      bulletPoint: safeBulletPoint.toLowerCase().trim(),
      type: "improve",
    });

    const cacheParams = { userKey, payloadHash };

    const startTime = Date.now();
    const { data: result, fromCache } = await withCache(
      bulletPointsCache,
      cacheParams,
      () => improveBulletPoint(safeBulletPoint)
    );
    const endTime = Date.now();

    const cacheStats = bulletPointsCache.getStats();

    aiLogger.info("Improved bullet point", {
      action: "improve-bullet",
      fromCache,
      responseTime: endTime - startTime,
    });

    return {
      result,
      meta: {
        model: "gemini-2.5-flash",
        responseTime: endTime - startTime,
        fromCache,
        cacheStats: {
          hitRate: `${(cacheStats.hitRate * 100).toFixed(1)}%`,
          totalHits: cacheStats.hits,
          estimatedSavings: `$${cacheStats.estimatedSavings.toFixed(4)}`,
        },
      },
    };
  },
  { creditOperation: "improve-bullet", schema, timeout: 30000 }
);
