import { analyzeATSCompatibility } from "@/lib/ai/content-generator";
import { atsCache, withCache } from "@/lib/ai/cache";
import { hashCacheKey } from "@/lib/ai/cache-key";
import { sanitizeResumeForAI } from "@/lib/ai/privacy";
import {
  validateJobDescription,
  validateResumeData,
} from "@/lib/api/sanitization";
import { withAIRoute, type AIRouteContext } from "@/lib/api/ai-route-wrapper";
import { aiLogger } from "@/lib/services/logger";
import type { ResumeData } from "@/lib/types/resume";
import type { AIBaseOptions } from "@/lib/ai/content-types";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  resumeData: z.object({}).passthrough(),
  jobDescription: z.string().min(1),
  industry: z.string().optional(),
  seniorityLevel: z.string().optional(),
});

type AnalyzeATSBody = z.infer<typeof requestSchema>;

/**
 * POST /api/ai/analyze-ats
 * Analyze resume for ATS compatibility against job description
 * Requires authentication and 3 AI credits
 */
export const POST = withAIRoute<AnalyzeATSBody>(
  async (body, ctx: AIRouteContext) => {
    const { resumeData, jobDescription, industry, seniorityLevel } = body;

    // Validate and sanitize inputs (beyond schema validation)
    const validatedJobDesc = validateJobDescription(jobDescription);
    validateResumeData(resumeData);
    const resume = sanitizeResumeForAI(resumeData as unknown as ResumeData, {
      mode: ctx.privacyMode,
      profile: "ats",
    });

    // Create cache key from job description (normalize to avoid minor variations)
    const normalizedJobDesc = validatedJobDesc
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .substring(0, 500);

    const userKey = hashCacheKey(ctx.userId);
    const payloadHash = hashCacheKey({
      resumeData: resume,
      jobDescription: normalizedJobDesc,
      industry: industry || "all",
      seniorityLevel: seniorityLevel || "auto",
    });

    const cacheParams = { userKey, payloadHash };

    const startTime = Date.now();
    const { data: analysis, fromCache } = await withCache(
      atsCache,
      cacheParams,
      () =>
        analyzeATSCompatibility(resume, validatedJobDesc, {
          industry,
          seniorityLevel,
        } as AIBaseOptions)
    );
    const endTime = Date.now();

    const cacheStats = atsCache.getStats();

    aiLogger.info("Analyzed ATS compatibility", {
      action: "analyze-ats",
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
  {
    creditOperation: "analyze-ats",
    schema: requestSchema,
    timeout: 45000,
  }
);
