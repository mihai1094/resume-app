import { getModel, SAFETY_SETTINGS } from "@/lib/ai/gemini-client";
import { extractJson, serializeResume } from "@/lib/ai/shared";
import { sanitizeResumeForAI } from "@/lib/ai/privacy";
import { withAIRoute } from "@/lib/api/ai-route-wrapper";
import { aiLogger } from "@/lib/services/logger";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  resumeData: z.object({}).passthrough(),
  jobDescription: z.string().optional(),
  options: z
    .object({
      enhanceSummary: z.boolean().optional(),
      enhanceBullets: z.boolean().optional(),
    })
    .optional(),
});

type BatchEnhanceBody = z.infer<typeof requestSchema>;

interface BulletEnhancement {
  index: number;
  original: string;
  enhanced: string;
}

interface ExperienceEnhancement {
  experienceId: string;
  experienceTitle: string;
  bullets: BulletEnhancement[];
}

interface BatchEnhanceResponse {
  summary?: {
    original: string;
    enhanced: string;
  };
  experiences: ExperienceEnhancement[];
  meta: {
    totalChanges: number;
    processingTimeMs: number;
  };
}

/**
 * POST /api/ai/batch-enhance
 * Batch enhance all resume content (summary + bullets)
 */
export const POST = withAIRoute<BatchEnhanceBody>(
  async (body, ctx) => {
    const { resumeData, jobDescription, options } = body;
    const resume = sanitizeResumeForAI(resumeData as any, {
      mode: ctx.privacyMode,
    }) as any;

    const enhanceSummary = options?.enhanceSummary ?? true;
    const enhanceBullets = options?.enhanceBullets ?? true;

    const startTime = Date.now();
    const model = getModel("FLASH");

    const result: BatchEnhanceResponse = {
      experiences: [],
      meta: { totalChanges: 0, processingTimeMs: 0 },
    };

    // Build context
    serializeResume(resume);
    const jdContext = jobDescription
      ? `\n\nTARGET JOB DESCRIPTION:\n${jobDescription.substring(0, 2000)}`
      : "";

    // Enhance summary if requested
    if (enhanceSummary && resume.personalInfo?.summary?.trim()) {
      const summaryPrompt = `You are a professional resume writer. Improve this professional summary to be more impactful and achievement-oriented.${jdContext ? " Tailor it toward the target job." : ""}

CURRENT SUMMARY:
"${resume.personalInfo.summary}"
${jdContext}

Return ONLY a JSON object with this exact format:
{"enhanced": "The improved summary text here"}

Guidelines:
- Keep it concise (2-4 sentences)
- Lead with years of experience or key qualification
- Include specific skills relevant to the role
- Add quantifiable achievements if possible
- Use strong action words`;

      try {
        const summaryResult = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: summaryPrompt }] }],
          safetySettings: SAFETY_SETTINGS,
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
          },
        });

        const summaryText = summaryResult.response.text();
        const parsed = extractJson<{ enhanced: string }>(summaryText);

        if (parsed?.enhanced && parsed.enhanced !== resume.personalInfo.summary) {
          result.summary = {
            original: resume.personalInfo.summary,
            enhanced: parsed.enhanced,
          };
          result.meta.totalChanges++;
        }
      } catch (err) {
        aiLogger.error("[BatchEnhance] Summary enhancement failed:", err instanceof Error ? err : new Error(String(err)));
      }
    }

    // Enhance bullets for each work experience
    if (enhanceBullets && resume.workExperience?.length) {
      for (const exp of resume.workExperience) {
        const bullets = exp.description?.filter((b: string) => b?.trim()) || [];
        if (bullets.length === 0) continue;

        const bulletsPrompt = `You are a professional resume writer. Improve these bullet points to be more impactful with metrics and achievements.${jdContext ? " Tailor them toward the target job." : ""}

ROLE: ${exp.position} at ${exp.company}
${jdContext}

CURRENT BULLETS:
${bullets.map((b: string, i: number) => `${i + 1}. ${b}`).join("\n")}

Return ONLY a JSON object with this exact format:
{"bullets": [{"index": 0, "enhanced": "Improved bullet text"}, ...]}

Guidelines:
- Add specific metrics (percentages, numbers, dollar amounts) where possible
- Start with strong action verbs
- Focus on achievements and impact, not just duties
- Keep bullets concise (1-2 lines each)
- If a bullet is already strong, return it unchanged`;

        try {
          const bulletsResult = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: bulletsPrompt }] }],
            safetySettings: SAFETY_SETTINGS,
            generationConfig: {
              maxOutputTokens: 800,
              temperature: 0.7,
            },
          });

          const bulletsText = bulletsResult.response.text();
          const parsed = extractJson<{ bullets: Array<{ index: number; enhanced: string }> }>(bulletsText);

          if (parsed?.bullets?.length) {
            const enhancedBullets: BulletEnhancement[] = [];

            for (const b of parsed.bullets) {
              const originalIndex = b.index;
              const original = bullets[originalIndex];

              if (original && b.enhanced && b.enhanced.trim() !== original.trim()) {
                enhancedBullets.push({
                  index: originalIndex,
                  original,
                  enhanced: b.enhanced.trim(),
                });
              }
            }

            if (enhancedBullets.length > 0) {
              result.experiences.push({
                experienceId: exp.id,
                experienceTitle: `${exp.position} @ ${exp.company}`,
                bullets: enhancedBullets,
              });
              result.meta.totalChanges += enhancedBullets.length;
            }
          }
        } catch (err) {
          aiLogger.error(`[BatchEnhance] Bullets enhancement failed for ${exp.company}:`, err instanceof Error ? err : new Error(String(err)));
        }
      }
    }

    result.meta.processingTimeMs = Date.now() - startTime;

    return { ...result } as Record<string, unknown>;
  },
  {
    creditOperation: "batch-enhance",
    schema: requestSchema,
    timeout: 60000,
  }
);
