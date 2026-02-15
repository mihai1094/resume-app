import { z } from "zod";
import { generateSummary } from "@/lib/ai/content-generator";
import { summaryCache, withCache } from "@/lib/ai/cache";
import { hashCacheKey } from "@/lib/ai/cache-key";
import { allowPIIForAI } from "@/lib/ai/privacy";
import { withAIRoute } from "@/lib/api/ai-route-wrapper";
import { aiLogger } from "@/lib/services/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Tone: API supports 3 for prompts; client UI also sends concise/impactful/friendly — accept all and map in handler
const TONE_VALUES = ["professional", "creative", "technical", "concise", "impactful", "friendly"] as const;
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
  yearsOfExperience: z.number().optional(),
  keySkills: z.array(z.string()).optional(),
  recentPosition: z.string().optional(),
  recentCompany: z.string().optional(),
  tone: z.enum(TONE_VALUES).default("professional"),
  industry: optionalEnum(INDUSTRY_VALUES),
  seniorityLevel: optionalEnum(SENIORITY_VALUES),
});

type Input = z.infer<typeof schema>;

/**
 * POST /api/ai/generate-summary
 * Generate professional summary for resume
 * Requires authentication and 2 AI credits
 */
// Map client tone (concise/impactful/friendly) to backend Tone for generateSummary
const toBackendTone = (tone: Input["tone"]): "professional" | "creative" | "technical" => {
  if (tone === "creative" || tone === "technical") return tone;
  return "professional";
};

export const POST = withAIRoute<Input>(
  async (body, ctx) => {
    const {
      firstName,
      lastName,
      jobTitle,
      yearsOfExperience,
      keySkills,
      recentPosition,
      recentCompany,
      tone,
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
      yearsOfExperience,
      keySkills,
      recentPosition,
      recentCompany,
      tone,
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
          yearsOfExperience,
          keySkills: keySkills || [],
          recentPosition,
          recentCompany,
          tone: toBackendTone(tone),
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
