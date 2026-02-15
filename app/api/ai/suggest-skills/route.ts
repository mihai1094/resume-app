import { z } from "zod";
import { suggestSkills } from "@/lib/ai/content-generator";
import { skillsCache, withCache } from "@/lib/ai/cache";
import { hashCacheKey } from "@/lib/ai/cache-key";
import { withAIRoute } from "@/lib/api/ai-route-wrapper";
import { aiLogger } from "@/lib/services/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  jobTitle: z
    .string()
    .min(2, "Job title must be at least 2 characters")
    .max(100, "Job title must be less than 100 characters"),
  jobDescription: z.string().optional(),
  industry: z.enum([
    "technology", "finance", "healthcare", "marketing", "sales",
    "engineering", "education", "legal", "consulting", "manufacturing",
    "retail", "hospitality", "nonprofit", "government", "other",
  ]).optional(),
  seniorityLevel: z.enum(["entry", "mid", "senior", "executive"]).optional(),
});

type Input = z.infer<typeof schema>;

/**
 * POST /api/ai/suggest-skills
 * Suggest relevant skills based on job title
 * Requires authentication and 1 AI credit
 */
export const POST = withAIRoute<Input>(
  async (body, ctx) => {
    const { jobTitle, jobDescription, industry, seniorityLevel } = body;

    const normalizedJobTitle = jobTitle.toLowerCase().trim();
    const normalizedJobDescription = jobDescription
      ? jobDescription.toLowerCase().trim().replace(/\s+/g, " ").substring(0, 200)
      : "";
    const userKey = hashCacheKey(ctx.userId);
    const payloadHash = hashCacheKey({
      jobTitle: normalizedJobTitle,
      jobDescription: normalizedJobDescription,
      industry: industry?.toLowerCase().trim(),
      seniorityLevel: seniorityLevel?.toLowerCase().trim(),
    });

    const cacheParams = { userKey, payloadHash };

    const startTime = Date.now();
    const { data: skills, fromCache } = await withCache(
      skillsCache,
      cacheParams,
      () => suggestSkills({ jobTitle, jobDescription, industry, seniorityLevel })
    );
    const endTime = Date.now();

    const cacheStats = skillsCache.getStats();

    aiLogger.info("Suggested skills", {
      action: "suggest-skills",
      fromCache,
      responseTime: endTime - startTime,
    });

    return {
      skills,
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
  { creditOperation: "suggest-skills", schema, timeout: 30000 }
);
