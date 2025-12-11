import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api/auth-middleware";
import { applyRateLimit, rateLimitResponse } from "@/lib/api/rate-limit";
import { withTimeout, TimeoutError, timeoutResponse } from "@/lib/api/timeout";
import {
  generateImprovement,
  generateKeywordPlacements,
  generateOptimizedSummary,
} from "@/lib/ai/improvement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/ai/generate-improvement
 * Generate specific improvement options for ATS suggestions
 */
export async function POST(request: NextRequest) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return auth.response;
  }

  const userId = auth.user.uid;

  try {
    // Rate limiting
    try {
      await applyRateLimit(request, "AI", userId);
    } catch (error) {
      return rateLimitResponse(error as Error);
    }

    const body = await request.json();
    const { action, suggestion, resumeData, jobDescription, keywords, jobTitle, companyName } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "generate_improvement": {
        if (!suggestion || !resumeData || !jobDescription) {
          return NextResponse.json(
            { error: "suggestion, resumeData, and jobDescription are required" },
            { status: 400 }
          );
        }

        console.log("[AI] Generating improvement for suggestion:", suggestion.title);

        result = await withTimeout(
          generateImprovement(suggestion, resumeData, jobDescription),
          30000
        );

        console.log("[AI] Generated", result.options.length, "options");
        break;
      }

      case "generate_keyword_placements": {
        if (!keywords || !resumeData || !jobDescription) {
          return NextResponse.json(
            { error: "keywords, resumeData, and jobDescription are required" },
            { status: 400 }
          );
        }

        console.log("[AI] Generating placements for", keywords.length, "keywords");

        result = await withTimeout(
          generateKeywordPlacements(keywords, resumeData, jobDescription),
          30000
        );

        console.log("[AI] Generated keyword placements");
        break;
      }

      case "generate_summary": {
        if (!resumeData || !jobDescription) {
          return NextResponse.json(
            { error: "resumeData and jobDescription are required" },
            { status: 400 }
          );
        }

        console.log("[AI] Generating optimized summary");

        result = await withTimeout(
          generateOptimizedSummary(
            resumeData,
            jobDescription,
            jobTitle || "",
            companyName || ""
          ),
          20000
        );

        console.log("[AI] Generated summary");
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error("[AI] Error in generate-improvement:", error);

    if (error instanceof TimeoutError) {
      return timeoutResponse(error);
    }

    return NextResponse.json(
      {
        error: "Failed to generate improvement",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
