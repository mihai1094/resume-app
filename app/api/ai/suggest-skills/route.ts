import { z } from "zod";
import { suggestSkills } from "@/lib/ai/content-generator";
import { skillsCache, withCache } from "@/lib/ai/cache";
import { hashCacheKey } from "@/lib/ai/cache-key";
import { withAIRoute } from "@/lib/api/ai-route-wrapper";
import { aiLogger } from "@/lib/services/logger";
import { filterDuplicates } from "@/lib/ai/skills-normalize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const workHistorySchema = z.object({
  position: z.string().min(1).max(200),
  companyLabel: z.string().max(200).optional(),
  yearsAgo: z.number().int().min(0).max(50),
  durationMonths: z.number().int().min(0).max(600),
  isCurrent: z.boolean(),
  bullets: z.array(z.string().max(300)).max(10).default([]),
});

const projectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(300),
  technologies: z.array(z.string().max(60)).max(20).default([]),
});

const existingSkillSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().max(60),
});

const schema = z.object({
  jobTitle: z
    .string()
    .min(2, "Job title must be at least 2 characters")
    .max(100, "Job title must be less than 100 characters"),
  jobDescription: z.string().max(5000).optional(),
  industry: z
    .enum([
      "technology",
      "finance",
      "healthcare",
      "marketing",
      "sales",
      "engineering",
      "education",
      "legal",
      "consulting",
      "manufacturing",
      "retail",
      "hospitality",
      "nonprofit",
      "government",
      "other",
    ])
    .optional(),
  seniorityLevel: z
    .enum(["entry", "mid", "senior", "executive"])
    .optional(),

  // Resume-derived context
  summary: z.string().max(500).optional(),
  workHistory: z.array(workHistorySchema).max(5).optional(),
  projects: z.array(projectSchema).max(10).optional(),
  certifications: z.array(z.string().max(200)).max(10).optional(),
  educationField: z.string().max(120).optional(),
  languages: z.array(z.string().max(60)).max(20).optional(),
  existingSkills: z.array(existingSkillSchema).max(100).optional(),
});

type Input = z.infer<typeof schema>;

/**
 * POST /api/ai/suggest-skills
 *
 * Suggests relevant skills for the candidate using their target role plus any
 * resume-derived context they choose to share (work history, projects, certs,
 * summary). Dedupes against their existing skills with alias awareness.
 *
 * Requires authentication and 1 AI credit.
 */
export const POST = withAIRoute<Input>(
  async (body, ctx) => {
    const {
      jobTitle,
      jobDescription,
      industry,
      seniorityLevel,
      summary,
      workHistory,
      projects,
      certifications,
      educationField,
      languages,
      existingSkills,
    } = body;

    const userKey = hashCacheKey(ctx.userId);
    const payloadHash = hashCacheKey({
      jobTitle: jobTitle.toLowerCase().trim(),
      jobDescription: jobDescription
        ? jobDescription.toLowerCase().trim().replace(/\s+/g, " ").substring(0, 200)
        : "",
      industry: industry?.toLowerCase().trim(),
      seniorityLevel: seniorityLevel?.toLowerCase().trim(),
      // Include resume-derived context so the cache invalidates when the
      // user edits their resume.
      summaryHash: summary ? summary.slice(0, 200) : "",
      workHistoryHash: workHistory?.map((w) => ({
        p: w.position,
        y: w.yearsAgo,
        n: w.bullets.length,
      })),
      projectHash: projects?.map((p) => ({ n: p.name, t: p.technologies.length })),
      certCount: certifications?.length ?? 0,
      existingSkillsHash: existingSkills?.map((s) => s.name.toLowerCase()).sort(),
    });

    const cacheParams = { userKey, payloadHash };

    const startTime = Date.now();
    const { data: rawSkills, fromCache } = await withCache(
      skillsCache,
      cacheParams,
      () =>
        suggestSkills({
          jobTitle,
          jobDescription,
          industry,
          seniorityLevel,
          summary,
          workHistory,
          projects,
          certifications,
          educationField,
          languages,
          existingSkills,
        })
    );
    const endTime = Date.now();

    // Safety-net dedupe at the route level — runs even on cache hits so that
    // a stale cached entry can't leak a duplicate if the user has meanwhile
    // added a matching skill client-side.
    const skills = existingSkills
      ? filterDuplicates(rawSkills, existingSkills)
      : rawSkills;

    const cacheStats = skillsCache.getStats();

    aiLogger.info("Suggested skills", {
      action: "suggest-skills",
      fromCache,
      responseTime: endTime - startTime,
      suggestionCount: skills.length,
      sourceBreakdown: countSources(skills),
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

function countSources(skills: { source?: string }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of skills) {
    const key = s.source ?? "unknown";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}
