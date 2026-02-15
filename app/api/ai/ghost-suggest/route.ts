import { z } from "zod";
import { getModel, SAFETY_SETTINGS } from "@/lib/ai/gemini-client";
import { bulletPointsCache, withCache } from "@/lib/ai/cache";
import { hashCacheKey } from "@/lib/ai/cache-key";
import { buildSystemInstruction, PROMPT_VERSION, wrapTag } from "@/lib/ai/prompt-utils";
import { sanitizeTextForAI } from "@/lib/ai/privacy";
import { withAIRoute, type AIRouteContext } from "@/lib/api/ai-route-wrapper";
import { aiLogger } from "@/lib/services/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters").max(300, "Text must be less than 300 characters for ghost suggestions"),
  context: z.object({
    position: z.string().optional(),
    company: z.string().optional(),
    sectionType: z.enum(["bullet", "summary", "description"]).optional(),
  }).optional(),
  jobDescription: z.string().optional(),
});

type GhostSuggestInput = z.infer<typeof schema>;

/**
 * POST /api/ai/ghost-suggest
 * Get a quick AI suggestion to improve/complete text
 * Optimized for speed - uses simpler prompt and smaller response
 * Requires authentication and 1 AI credit
 */
export const POST = withAIRoute<GhostSuggestInput>(
  async (body, ctx: AIRouteContext) => {
    const { text, context, jobDescription } = body;
    const safeText = sanitizeTextForAI(text, { maxLength: 300 });
    const safePosition = context?.position
      ? sanitizeTextForAI(context.position, { maxLength: 80 })
      : undefined;
    const safeCompany = context?.company
      ? sanitizeTextForAI(context.company, { maxLength: 80 })
      : undefined;
    const safeJobDescription = jobDescription
      ? sanitizeTextForAI(jobDescription, { maxLength: 1500 })
      : undefined;

    const startTime = Date.now();

    const sectionType = context?.sectionType || "bullet";
    const roleContext = safePosition
      ? ` for a ${safePosition}${safeCompany ? ` at ${safeCompany}` : ""}`
      : "";
    const jdContext = safeJobDescription
      ? `\nTarget job keywords: ${extractKeywords(safeJobDescription).slice(0, 5).join(", ")}`
      : "";

    const systemInstruction = buildSystemInstruction(
      "Resume writing assistant",
      "Improve the text using only provided content. Return only the improved text."
    );

    const prompt = `PROMPT_VERSION: ${PROMPT_VERSION}
Improve this ${sectionType} point${roleContext}. Make it more impactful with metrics if possible.${jdContext}

Original:
${wrapTag("text", safeText)}

Return ONLY the improved text, no explanations. Keep similar length.`;

    const normalizedText = safeText.toLowerCase().trim();
    const normalizedJobDescription = safeJobDescription
      ? safeJobDescription.toLowerCase().trim().replace(/\s+/g, " ").substring(0, 500)
      : "";
    const userKey = hashCacheKey(ctx.userId);
    const payloadHash = hashCacheKey({
      text: normalizedText,
      type: "ghost",
      context: safePosition || "",
      company: safeCompany || "",
      sectionType,
      jobDescription: normalizedJobDescription,
    });

    const cacheParams = { userKey, payloadHash };

    const { data: suggestion, fromCache } = await withCache(
      bulletPointsCache,
      cacheParams,
      async () => {
        const model = getModel("FLASH");
        const result = await model.generateContent({
          systemInstruction,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          safetySettings: SAFETY_SETTINGS,
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7,
          },
        });

        const responseText = result.response.text().trim();
        return responseText
          .replace(/^["']|["']$/g, "")
          .replace(/^(Improved|Enhanced|Better|Here'?s?):\s*/i, "")
          .trim();
      }
    );

    const endTime = Date.now();

    aiLogger.info("Ghost suggestion generated", {
      action: "ghost-suggest",
      fromCache,
      responseTime: endTime - startTime,
    });

    // Don't return suggestion if it's essentially the same
    if (suggestion.toLowerCase().trim() === safeText.toLowerCase().trim()) {
      return { suggestion: null };
    }

    return {
      suggestion,
      meta: {
        responseTime: endTime - startTime,
        fromCache,
      },
    };
  },
  {
    creditOperation: "ghost-suggest",
    schema,
  }
);

/**
 * Extract key terms from job description for context
 */
function extractKeywords(jd: string): string[] {
  // Simple keyword extraction - look for capitalized terms and tech keywords
  const words = jd.split(/\s+/);
  const keywords = new Set<string>();

  const techTerms = [
    "react",
    "typescript",
    "javascript",
    "python",
    "aws",
    "azure",
    "docker",
    "kubernetes",
    "sql",
    "nosql",
    "agile",
    "scrum",
    "ci/cd",
    "git",
    "node",
    "java",
    "go",
    "rust",
    "graphql",
    "rest",
    "api",
  ];

  for (const word of words) {
    const clean = word.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (techTerms.includes(clean)) {
      keywords.add(clean);
    }
  }

  // Also look for years of experience patterns
  const expMatch = jd.match(/(\d+)\+?\s*years?/gi);
  if (expMatch) {
    keywords.add(expMatch[0]);
  }

  return Array.from(keywords);
}
