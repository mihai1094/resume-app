import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api/auth-middleware";
import { checkCreditsForOperation } from "@/lib/api/credit-middleware";
import { getModel, SAFETY_SETTINGS } from "@/lib/ai/gemini-client";
import { bulletPointsCache, withCache } from "@/lib/ai/cache";
import { hashCacheKey } from "@/lib/ai/cache-key";
import { buildSystemInstruction, PROMPT_VERSION, wrapTag } from "@/lib/ai/prompt-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface GhostSuggestRequest {
  text: string;
  context?: {
    position?: string;
    company?: string;
    sectionType?: "bullet" | "summary" | "description";
  };
  jobDescription?: string;
}

/**
 * POST /api/ai/ghost-suggest
 * Get a quick AI suggestion to improve/complete text
 * Optimized for speed - uses simpler prompt and smaller response
 * Requires authentication and 1 AI credit
 */
export async function POST(request: NextRequest) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return auth.response;
  }

  // Check and deduct credits
  const creditCheck = await checkCreditsForOperation(auth.user.uid, "ghost-suggest");
  if (!creditCheck.success) {
    return creditCheck.response;
  }

  try {
    const body: GhostSuggestRequest = await request.json();
    const { text, context, jobDescription } = body;

    // Validation
    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "Text must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (text.length > 300) {
      return NextResponse.json(
        { error: "Text must be less than 300 characters for ghost suggestions" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Build a simple, fast prompt
    const sectionType = context?.sectionType || "bullet";
    const roleContext = context?.position
      ? ` for a ${context.position}${context.company ? ` at ${context.company}` : ""}`
      : "";
    const jdContext = jobDescription
      ? `\nTarget job keywords: ${extractKeywords(jobDescription).slice(0, 5).join(", ")}`
      : "";

    const systemInstruction = buildSystemInstruction(
      "Resume writing assistant",
      "Improve the text using only provided content. Return only the improved text."
    );

    const prompt = `PROMPT_VERSION: ${PROMPT_VERSION}
Improve this ${sectionType} point${roleContext}. Make it more impactful with metrics if possible.${jdContext}

Original:
${wrapTag("text", text)}

Return ONLY the improved text, no explanations. Keep similar length.`;

    const normalizedText = text.toLowerCase().trim();
    const normalizedJobDescription = jobDescription
      ? jobDescription.toLowerCase().trim().replace(/\s+/g, " ").substring(0, 500)
      : "";
    const userKey = hashCacheKey(auth.user.uid);
    const payloadHash = hashCacheKey({
      text: normalizedText,
      type: "ghost",
      context: context?.position || "",
      company: context?.company || "",
      sectionType,
      jobDescription: normalizedJobDescription,
    });

    const cacheParams = {
      userKey,
      payloadHash,
    };

    // Try cache first
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
            maxOutputTokens: 150, // Keep it short for speed
            temperature: 0.7,
          },
        });

        const responseText = result.response.text().trim();
        // Clean up any quotes or prefixes
        return responseText
          .replace(/^["']|["']$/g, "")
          .replace(/^(Improved|Enhanced|Better|Here'?s?):\s*/i, "")
          .trim();
      }
    );

    const endTime = Date.now();

    // Don't return suggestion if it's essentially the same
    if (suggestion.toLowerCase().trim() === text.toLowerCase().trim()) {
      return NextResponse.json({ suggestion: null });
    }

    return NextResponse.json({
      suggestion,
      meta: {
        responseTime: endTime - startTime,
        fromCache,
      },
    });
  } catch (error) {
    console.error("[Ghost Suggest] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}

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
