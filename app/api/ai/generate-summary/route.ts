import { z } from "zod";
import { generateSummary } from "@/lib/ai/content-generator";
import { summaryCache, withCache } from "@/lib/ai/cache";
import { hashCacheKey } from "@/lib/ai/cache-key";
import { allowPIIForAI } from "@/lib/ai/privacy";
import { withAIRoute } from "@/lib/api/ai-route-wrapper";
import { aiLogger } from "@/lib/services/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TONE_VALUES = ["professional", "creative", "technical", "concise", "impactful", "friendly"] as const;
const LENGTH_VALUES = ["short", "medium", "long"] as const;
const INDUSTRY_VALUES = [
  "technology", "finance", "healthcare", "marketing", "sales",
  "engineering", "education", "legal", "consulting", "manufacturing",
  "retail", "hospitality", "nonprofit", "government", "other",
] as const;
const SENIORITY_VALUES = ["entry", "mid", "senior", "executive"] as const;

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.enum(values).optional()
  );

const schema = z.object({
  firstName: z.string().max(120).optional().default(""),
  lastName: z.string().max(120).optional().default(""),
  jobTitle: z.string().optional(),
  jobDescription: z.string().max(5000).optional(),
  yearsOfExperience: z.number().optional(),
  keySkills: z.array(z.string()).optional(),
  recentPosition: z.string().optional(),
  recentCompany: z.string().optional(),
  experienceHighlights: z.array(z.string().max(280)).optional(),
  currentSummary: z.string().max(2000).optional().default(""),
  tone: z.enum(TONE_VALUES).default("professional"),
  length: z.enum(LENGTH_VALUES).default("medium"),
  industry: optionalEnum(INDUSTRY_VALUES),
  seniorityLevel: optionalEnum(SENIORITY_VALUES),
});

type Input = z.infer<typeof schema>;

/**
 * POST /api/ai/generate-summary
 * Generate professional summary for resume
 * Requires authentication and 2 AI credits
 */
export const POST = withAIRoute<Input>(
  async (body, ctx) => {
    const {
      firstName,
      lastName,
      jobTitle,
      jobDescription,
      yearsOfExperience,
      keySkills,
      recentPosition,
      recentCompany,
      experienceHighlights,
      currentSummary,
      tone,
      length,
      industry,
      seniorityLevel,
    } = body;
    const allowPII = allowPIIForAI() && ctx.privacyMode === "standard";
    const safeFirstName = allowPII ? firstName : "";
    const safeLastName = allowPII ? lastName : "";

    const userKey = hashCacheKey(ctx.userId);
    const payloadHash = hashCacheKey({
      firstName: safeFirstName,
      lastName: safeLastName,
      jobTitle,
      jobDescription,
      yearsOfExperience,
      keySkills,
      recentPosition,
      recentCompany,
      experienceHighlights,
      currentSummary,
      tone,
      length,
      industry,
      seniorityLevel,
    });

    const cacheParams = { userKey, payloadHash };

    const startTime = Date.now();
    const { data: summary, fromCache } = await withCache(
      summaryCache,
      cacheParams,
      () =>
        generateSummary({
          firstName: safeFirstName,
          lastName: safeLastName,
          jobTitle,
          jobDescription,
          yearsOfExperience,
          keySkills: keySkills || [],
          recentPosition,
          recentCompany,
          experienceHighlights: experienceHighlights || [],
          draftSummary: currentSummary,
          tone,
          length,
          industry,
          seniorityLevel,
        })
    );
    const endTime = Date.now();

    const cacheStats = summaryCache.getStats();

    aiLogger.info("Generated summary", {
      action: "generate-summary",
      fromCache,
      responseTime: endTime - startTime,
    });

    return {
      summary,
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
  { creditOperation: "generate-summary", schema, timeout: 30000 }
);
