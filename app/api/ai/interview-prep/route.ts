import { z } from "zod";
import { generateInterviewPrep } from "@/lib/ai/content-generator";
import { interviewPrepCache, withCache } from "@/lib/ai/cache";
import { hashCacheKey } from "@/lib/ai/cache-key";
import { sanitizeResumeForAI } from "@/lib/ai/privacy";
import { withAIRoute, type AIRouteContext } from "@/lib/api/ai-route-wrapper";
import { aiLogger } from "@/lib/services/logger";
import type { ResumeData } from "@/lib/types/resume";
import type { GenerateInterviewPrepInput } from "@/lib/ai/content-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  resumeData: z.object({}).passthrough(),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters"),
  seniorityLevel: z.string().optional(),
  industry: z.string().optional(),
});

type InterviewPrepInput = z.infer<typeof schema>;

/**
 * POST /api/ai/interview-prep
 * Generate interview preparation questions
 * Requires authentication and 5 AI credits
 */
export const POST = withAIRoute<InterviewPrepInput>(
  async (body, ctx: AIRouteContext) => {
    const { resumeData, jobDescription, seniorityLevel, industry } = body;
    const resume = sanitizeResumeForAI(
      resumeData as unknown as ResumeData,
      { mode: ctx.privacyMode }
    );

    const normalizedJobDescription = jobDescription
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .substring(0, 500);
    const userKey = hashCacheKey(ctx.userId);
    const payloadHash = hashCacheKey({
      resumeData: resume,
      jobDescription: normalizedJobDescription,
      seniorityLevel: seniorityLevel || "auto",
      industry: industry || "all",
    });

    const cacheParams = { userKey, payloadHash };

    const startTime = Date.now();
    const { data: result, fromCache } = await withCache(
      interviewPrepCache,
      cacheParams,
      () => generateInterviewPrep({
        resumeData: resume,
        jobDescription,
        seniorityLevel,
        industry,
      } as GenerateInterviewPrepInput)
    );
    const endTime = Date.now();

    const cacheStats = interviewPrepCache.getStats();

    aiLogger.info("Generated interview prep", {
      action: "interview-prep",
      fromCache,
      responseTime: endTime - startTime,
    });

    return {
      questions: result.questions,
      skillGaps: result.skillGaps,
      overallReadiness: result.overallReadiness,
      strengthsToHighlight: result.strengthsToHighlight,
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
    creditOperation: "interview-prep",
    schema,
  }
);
