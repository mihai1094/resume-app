import { NextResponse } from "next/server";
import {
  generateImprovement,
  generateKeywordPlacements,
  generateOptimizedSummary,
} from "@/lib/ai/improvement";
import { sanitizeResumeForAI } from "@/lib/ai/privacy";
import { withAIRoute } from "@/lib/api/ai-route-wrapper";
import type { ResumeData } from "@/lib/types/resume";
import type { ATSSuggestion, AIBaseOptions } from "@/lib/ai/content-types";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  action: z.enum(["generate_improvement", "generate_keyword_placements", "generate_summary"]),
  suggestion: z.unknown().optional(),
  resumeData: z.object({}).passthrough().optional(),
  jobDescription: z.string().optional(),
  keywords: z.unknown().optional(),
  jobTitle: z.string().optional(),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  seniorityLevel: z.string().optional(),
});

type GenerateImprovementBody = z.infer<typeof requestSchema>;

/**
 * POST /api/ai/generate-improvement
 * Generate specific improvement options for ATS suggestions
 * Requires authentication and 3 AI credits
 */
export const POST = withAIRoute<GenerateImprovementBody>(
  async (body, ctx) => {
    const {
      action,
      suggestion,
      resumeData,
      jobDescription,
      keywords,
      jobTitle,
      companyName,
      industry,
      seniorityLevel,
    } = body;

    const options = { industry, seniorityLevel } as AIBaseOptions;
    const sanitizedResume = resumeData
      ? sanitizeResumeForAI(resumeData as unknown as ResumeData, {
          mode: ctx.privacyMode,
        })
      : undefined;
    let result;

    switch (action) {
      case "generate_improvement": {
        if (!suggestion || !sanitizedResume || !jobDescription) {
          return NextResponse.json(
            { error: "suggestion, resumeData, and jobDescription are required" },
            { status: 400 }
          );
        }
        result = await generateImprovement(
          suggestion as ATSSuggestion,
          sanitizedResume,
          jobDescription,
          options
        );
        break;
      }

      case "generate_keyword_placements": {
        if (!keywords || !sanitizedResume || !jobDescription) {
          return NextResponse.json(
            { error: "keywords, resumeData, and jobDescription are required" },
            { status: 400 }
          );
        }
        result = await generateKeywordPlacements(
          keywords as string[],
          sanitizedResume,
          jobDescription,
          options
        );
        break;
      }

      case "generate_summary": {
        if (!sanitizedResume || !jobDescription) {
          return NextResponse.json(
            { error: "resumeData and jobDescription are required" },
            { status: 400 }
          );
        }
        result = await generateOptimizedSummary(
          sanitizedResume,
          jobDescription,
          jobTitle || "",
          companyName || "",
          options
        );
        break;
      }
    }

    return { result };
  },
  {
    creditOperation: "generate-improvement",
    schema: requestSchema,
    timeout: 30000,
  }
);
