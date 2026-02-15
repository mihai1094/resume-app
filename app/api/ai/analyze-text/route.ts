import { z } from "zod";
import { analyzeText } from "@/lib/ai/content-generator";
import { writingAssistantCache, withCache } from "@/lib/ai/cache";
import { hashCacheKey } from "@/lib/ai/cache-key";
import { sanitizeTextForAI } from "@/lib/ai/privacy";
import { withAIRoute } from "@/lib/api/ai-route-wrapper";
import { aiLogger } from "@/lib/services/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const validContexts = ["bullet-point", "summary", "description"] as const;

const schema = z.object({
  text: z
    .string()
    .min(5, "Text must be at least 5 characters long")
    .max(1000, "Text must be less than 1000 characters"),
  context: z.enum(validContexts).default("bullet-point"),
});

type Input = z.infer<typeof schema>;

/**
 * POST /api/ai/analyze-text
 * Analyze text for writing quality and provide suggestions
 * Requires authentication and 1 AI credit
 */
export const POST = withAIRoute<Input>(
  async (body, ctx) => {
    const { text, context } = body;
    const safeText = sanitizeTextForAI(text, { maxLength: 1000 });

    const normalizedText = safeText.toLowerCase().trim();
    const userKey = hashCacheKey(ctx.userId);
    const payloadHash = hashCacheKey({
      text: normalizedText,
      context,
    });

    const cacheParams = { userKey, payloadHash };

    const startTime = Date.now();
    const { data: analysis, fromCache } = await withCache(
      writingAssistantCache,
      cacheParams,
      () => analyzeText(safeText, { context })
    );
    const endTime = Date.now();

    const cacheStats = writingAssistantCache.getStats();

    aiLogger.info("Analyzed text", {
      action: "analyze-text",
      fromCache,
      responseTime: endTime - startTime,
    });

    return {
      analysis,
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
  { creditOperation: "analyze-text", schema, timeout: 30000 }
);
