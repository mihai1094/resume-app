import { NextResponse } from "next/server";
import { z } from "zod";
import { generateBulletPoints } from "@/lib/ai/content-generator";
import { bulletPointsCache, withCache } from "@/lib/ai/cache";
import { hashCacheKey } from "@/lib/ai/cache-key";
import { sanitizeText } from "@/lib/api/sanitization";
import { withAIRoute } from "@/lib/api/ai-route-wrapper";
import { aiLogger } from "@/lib/services/logger";
import type { Industry, SeniorityLevel } from "@/lib/ai/content-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  position: z.string().min(2).max(100),
  company: z.string().min(2).max(100),
  industry: z.string().max(100).optional(),
  seniorityLevel: z.string().optional(),
  customPrompt: z.string().max(500).optional(),
});

type Input = z.infer<typeof schema>;

export const POST = withAIRoute<Input>(
  async (body, ctx) => {
    const sanitizedPosition = sanitizeText(body.position, 100);
    const sanitizedCompany = sanitizeText(body.company, 100);
    const sanitizedIndustry = body.industry ? sanitizeText(body.industry, 100) as Industry : undefined;
    const sanitizedCustomPrompt = body.customPrompt ? sanitizeText(body.customPrompt, 500) : undefined;

    const userKey = hashCacheKey(ctx.userId);
    const payloadHash = hashCacheKey({
      position: sanitizedPosition.toLowerCase().trim(),
      company: sanitizedCompany.toLowerCase().trim(),
      industry: sanitizedIndustry?.toLowerCase().trim(),
      seniorityLevel: body.seniorityLevel?.toLowerCase().trim(),
      customPrompt: sanitizedCustomPrompt?.toLowerCase().trim(),
    });

    const startTime = Date.now();
    const { data: bulletPoints, fromCache } = await withCache(
      bulletPointsCache,
      { userKey, payloadHash },
      () =>
        generateBulletPoints({
          position: sanitizedPosition,
          company: sanitizedCompany,
          industry: sanitizedIndustry,
          seniorityLevel: body.seniorityLevel as SeniorityLevel | undefined,
          customPrompt: sanitizedCustomPrompt,
        })
    );
    const responseTime = Date.now() - startTime;

    const cacheStats = bulletPointsCache.getStats();
    aiLogger.info("Generated bullet points", { action: "generate-bullets", fromCache, responseTime });

    return {
      bulletPoints,
      meta: {
        model: "gemini-2.5-flash",
        responseTime,
        fromCache,
        cacheStats: {
          hitRate: `${(cacheStats.hitRate * 100).toFixed(1)}%`,
          totalHits: cacheStats.hits,
          estimatedSavings: `$${cacheStats.estimatedSavings.toFixed(4)}`,
        },
      },
    };
  },
  {
    creditOperation: "generate-bullets",
    schema,
    timeout: 30000,
  }
);
