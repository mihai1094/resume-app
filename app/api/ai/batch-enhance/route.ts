import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api/auth-middleware";
import { checkCreditsForOperation } from "@/lib/api/credit-middleware";
import { getModel, SAFETY_SETTINGS } from "@/lib/ai/gemini-client";
import { ResumeData } from "@/lib/types/resume";
import { extractJson, serializeResume } from "@/lib/ai/shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface BatchEnhanceRequest {
  resumeData: ResumeData;
  jobDescription?: string;
  options?: {
    enhanceSummary?: boolean;
    enhanceBullets?: boolean;
  };
}

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
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return auth.response;
  }

  // Check and deduct credits
  const creditCheck = await checkCreditsForOperation(auth.user.uid, "batch-enhance");
  if (!creditCheck.success) {
    return creditCheck.response;
  }

  try {
    const body: BatchEnhanceRequest = await request.json();
    const { resumeData, jobDescription, options } = body;

    if (!resumeData) {
      return NextResponse.json(
        { error: "Resume data is required" },
        { status: 400 }
      );
    }

    const enhanceSummary = options?.enhanceSummary ?? true;
    const enhanceBullets = options?.enhanceBullets ?? true;

    const startTime = Date.now();
    const model = getModel("FLASH");

    const result: BatchEnhanceResponse = {
      experiences: [],
      meta: { totalChanges: 0, processingTimeMs: 0 },
    };

    // Build context
    const resumeText = serializeResume(resumeData);
    const jdContext = jobDescription
      ? `\n\nTARGET JOB DESCRIPTION:\n${jobDescription.substring(0, 2000)}`
      : "";

    // Enhance summary if requested
    if (enhanceSummary && resumeData.personalInfo?.summary?.trim()) {
      const summaryPrompt = `You are a professional resume writer. Improve this professional summary to be more impactful and achievement-oriented.${jdContext ? " Tailor it toward the target job." : ""}

CURRENT SUMMARY:
"${resumeData.personalInfo.summary}"
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

        if (parsed?.enhanced && parsed.enhanced !== resumeData.personalInfo.summary) {
          result.summary = {
            original: resumeData.personalInfo.summary,
            enhanced: parsed.enhanced,
          };
          result.meta.totalChanges++;
        }
      } catch (err) {
        console.error("[BatchEnhance] Summary enhancement failed:", err);
      }
    }

    // Enhance bullets for each work experience
    if (enhanceBullets && resumeData.workExperience?.length) {
      for (const exp of resumeData.workExperience) {
        const bullets = exp.description?.filter((b) => b?.trim()) || [];
        if (bullets.length === 0) continue;

        const bulletsPrompt = `You are a professional resume writer. Improve these bullet points to be more impactful with metrics and achievements.${jdContext ? " Tailor them toward the target job." : ""}

ROLE: ${exp.position} at ${exp.company}
${jdContext}

CURRENT BULLETS:
${bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

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
          console.error(`[BatchEnhance] Bullets enhancement failed for ${exp.company}:`, err);
        }
      }
    }

    result.meta.processingTimeMs = Date.now() - startTime;

    return NextResponse.json(result);
  } catch (error) {
    console.error("[BatchEnhance] Error:", error);
    return NextResponse.json(
      { error: "Failed to enhance resume content" },
      { status: 500 }
    );
  }
}
