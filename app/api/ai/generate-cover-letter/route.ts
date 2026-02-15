import { z } from "zod";
import { generateCoverLetter } from "@/lib/ai/content-generator";
import { coverLetterCache, withCache } from "@/lib/ai/cache";
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
  jobDescription: z.string().min(50, "Job description must be at least 50 characters"),
  companyName: z.string().min(2).max(100, "Company name must be between 2 and 100 characters"),
  positionTitle: z.string().min(2).max(100, "Position title must be between 2 and 100 characters"),
  hiringManagerName: z.string().optional(),
  industry: z.string().optional(),
  seniorityLevel: z.string().optional(),
});

type CoverLetterInput = z.infer<typeof schema>;

/**
 * POST /api/ai/generate-cover-letter
 * Generate personalized cover letter from resume and job description
 * Requires authentication and 5 AI credits
 */
export const POST = withAIRoute<CoverLetterInput>(
  async (body, ctx: AIRouteContext) => {
    const {
      resumeData,
      jobDescription,
      companyName,
      positionTitle,
      hiringManagerName,
      industry,
      seniorityLevel,
    } = body;
    const rawResume = resumeData as unknown as ResumeData;
    const resume = sanitizeResumeForAI(rawResume, { mode: ctx.privacyMode });
    const candidateName = `${rawResume.personalInfo?.firstName || ""} ${rawResume.personalInfo?.lastName || ""}`.trim();

    const userKey = hashCacheKey(ctx.userId);
    const payloadHash = hashCacheKey({
      resumeData: resume,
      jobDescription,
      companyName,
      positionTitle,
      hiringManagerName,
      industry: industry?.toLowerCase().trim(),
      seniorityLevel: seniorityLevel?.toLowerCase().trim(),
    });

    const cacheParams = { userKey, payloadHash };

    const startTime = Date.now();
    const { data: coverLetter, fromCache } = await withCache(
      coverLetterCache,
      cacheParams,
      () =>
        generateCoverLetter({
          resumeData: resume,
          jobDescription,
          companyName,
          positionTitle,
          hiringManagerName,
          industry: industry as Industry | undefined,
          seniorityLevel: seniorityLevel as SeniorityLevel | undefined,
        })
    );
    if (candidateName) {
      coverLetter.signature = `Sincerely,\n${candidateName}`;
    }
    const endTime = Date.now();

    const cacheStats = coverLetterCache.getStats();

    aiLogger.info("Generated cover letter", {
      action: "generate-cover-letter",
      fromCache,
      responseTime: endTime - startTime,
    });

    return {
      coverLetter,
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
    creditOperation: "generate-cover-letter",
    schema,
  }
);
