import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api/auth-middleware";
import { getModel, SAFETY_SETTINGS } from "@/lib/ai/gemini-client";
import { bulletPointsCache, withCache } from "@/lib/ai/cache";

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
 */
export async function POST(request: NextRequest) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return auth.response;
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

    const prompt = `Improve this ${sectionType} point${roleContext}. Make it more impactful with metrics if possible.${jdContext}

Original: "${text}"

Return ONLY the improved text, no explanations. Keep similar length.`;

    // Create cache key
    const cacheParams = {
      text: text.toLowerCase().trim(),
      type: "ghost",
      context: context?.position || "",
    };

    // Try cache first
    const { data: suggestion, fromCache } = await withCache(
      bulletPointsCache,
      cacheParams,
      async () => {
        const model = getModel("FLASH");
        const result = await model.generateContent({
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
