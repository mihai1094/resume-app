import { ResumeData } from "@/lib/types/resume";
import {
  ATSSuggestion,
  GenerateImprovementResult,
  ImprovementOption,
  KeywordPlacement,
} from "./content-types";
import { extractJson, flashModel, safety, serializeResume } from "./shared";
import { generateId } from "@/lib/utils";

/**
 * Generate specific improvement options for an ATS suggestion
 */
export async function generateImprovement(
  suggestion: ATSSuggestion,
  resumeData: ResumeData,
  jobDescription: string
): Promise<GenerateImprovementResult> {
  const model = flashModel();
  const resumeText = serializeResume(resumeData);

  // Get work experience context for targeting bullets
  const experienceContext = resumeData.workExperience
    ?.slice(0, 3)
    .map((exp, i) => `Experience ${i + 1}: ${exp.position} at ${exp.company} (ID: ${exp.id})`)
    .join("\n") || "No work experience";

  const prompt = `You are a resume improvement assistant. Generate specific, actionable options to address this ATS suggestion.

=== SUGGESTION TO ADDRESS ===
Type: ${suggestion.type}
Severity: ${suggestion.severity}
Title: ${suggestion.title}
Description: ${suggestion.description}
Recommended Action: ${suggestion.action}

=== CURRENT RESUME ===
${resumeText}

=== WORK EXPERIENCE IDS ===
${experienceContext}

=== JOB DESCRIPTION (excerpt) ===
${jobDescription.substring(0, 1000)}

=== INSTRUCTIONS ===
Generate 2-3 specific options to address this suggestion. Each option should be ready to apply directly to the resume.

Return JSON only:
{
  "options": [
    {
      "type": "add_skill" | "add_bullet" | "update_bullet" | "update_summary",
      "content": "<exact text to add/update>",
      "preview": "<short description of what this does>",
      "targetSection": "skills" | "experience" | "summary",
      "targetId": "<work experience ID if applicable>",
      "targetIndex": <bullet index if updating existing bullet>
    }
  ],
  "explanation": "<brief explanation of why these options address the suggestion>"
}

Guidelines:
- For skill suggestions: offer "add_skill" option with the skill name
- For experience suggestions: offer "add_bullet" with a new achievement bullet
- For missing keywords: offer both skill and bullet options when applicable
- Bullets should be 15-25 words, start with action verb, include metrics if possible
- Be specific and use context from the job description`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const rawText = result.response.text();
  const parsed = extractJson<{
    options: Array<{
      type: string;
      content: string;
      preview: string;
      targetSection: string;
      targetId?: string;
      targetIndex?: number;
    }>;
    explanation: string;
  }>(rawText);

  if (!parsed || !parsed.options || parsed.options.length === 0) {
    // Fallback: generate a simple skill addition
    return {
      options: [
        {
          id: generateId(),
          type: "add_skill",
          content: suggestion.title.replace(/^Add\s+/i, "").replace(/\s+experience$/i, ""),
          preview: `Add "${suggestion.title}" to skills`,
          targetSection: "skills",
        },
      ],
      explanation: "Add the mentioned skill to your resume",
    };
  }

  return {
    options: parsed.options.map((opt) => ({
      id: generateId(),
      type: opt.type as ImprovementOption["type"],
      content: opt.content,
      preview: opt.preview,
      targetSection: opt.targetSection as ImprovementOption["targetSection"],
      targetId: opt.targetId,
      targetIndex: opt.targetIndex,
    })),
    explanation: parsed.explanation || "",
  };
}

/**
 * Generate keyword placement suggestions
 */
export async function generateKeywordPlacements(
  keywords: string[],
  resumeData: ResumeData,
  jobDescription: string
): Promise<KeywordPlacement[]> {
  if (keywords.length === 0) return [];

  const model = flashModel();
  const resumeText = serializeResume(resumeData);

  const experienceContext = resumeData.workExperience
    ?.slice(0, 3)
    .map((exp) => `- ${exp.position} at ${exp.company} (ID: ${exp.id})`)
    .join("\n") || "No work experience";

  const prompt = `You are a resume keyword optimizer. Suggest where to add these missing keywords to a resume.

=== MISSING KEYWORDS ===
${keywords.join(", ")}

=== CURRENT RESUME ===
${resumeText}

=== WORK EXPERIENCE IDS ===
${experienceContext}

=== JOB CONTEXT ===
${jobDescription.substring(0, 800)}

=== INSTRUCTIONS ===
For each keyword, suggest 1-2 ways to add it naturally to the resume.

Return JSON only:
{
  "placements": [
    {
      "keyword": "<keyword>",
      "options": [
        {
          "type": "skill",
          "suggestedContent": "<skill name>",
          "preview": "Add to skills section"
        },
        {
          "type": "bullet",
          "targetId": "<experience ID>",
          "suggestedContent": "<new bullet point incorporating the keyword>",
          "preview": "Add bullet to [Position] at [Company]"
        }
      ]
    }
  ]
}

Guidelines:
- For technical skills: prefer adding to skills section
- For action-oriented keywords: prefer adding as achievement bullets
- Bullets should be realistic and match the candidate's experience level
- Don't force keywords where they don't fit naturally`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const rawText = result.response.text();
  const parsed = extractJson<{
    placements: Array<{
      keyword: string;
      options: Array<{
        type: "skill" | "bullet";
        targetId?: string;
        suggestedContent: string;
        preview: string;
      }>;
    }>;
  }>(rawText);

  if (!parsed || !parsed.placements) {
    // Fallback: simple skill additions
    return keywords.map((kw) => ({
      keyword: kw,
      placements: [
        {
          type: "skill" as const,
          suggestedContent: kw,
          preview: `Add "${kw}" to skills`,
        },
      ],
    }));
  }

  return parsed.placements.map((p) => ({
    keyword: p.keyword,
    placements: p.options.map((opt) => ({
      type: opt.type,
      targetId: opt.targetId,
      suggestedContent: opt.suggestedContent,
      preview: opt.preview,
    })),
  }));
}

/**
 * Generate an optimized summary for a target job
 */
export async function generateOptimizedSummary(
  resumeData: ResumeData,
  jobDescription: string,
  jobTitle: string,
  companyName: string
): Promise<string> {
  const model = flashModel();
  const currentSummary = resumeData.personalInfo?.summary || "";
  const resumeText = serializeResume(resumeData);

  const prompt = `You are a professional resume writer. Rewrite this professional summary to better target the specified job.

=== CURRENT SUMMARY ===
${currentSummary || "(No summary provided)"}

=== RESUME CONTEXT ===
${resumeText}

=== TARGET JOB ===
Position: ${jobTitle || "Not specified"}
Company: ${companyName || "Not specified"}

=== JOB DESCRIPTION ===
${jobDescription.substring(0, 1200)}

=== INSTRUCTIONS ===
Write a compelling 2-3 sentence professional summary that:
1. Highlights relevant experience and skills for this specific role
2. Incorporates key keywords from the job description naturally
3. Showcases quantifiable achievements when possible
4. Maintains a professional, confident tone
5. Is 40-60 words long

Return ONLY the summary text, no JSON, no quotes, no explanation.`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const rawText = result.response.text()?.trim();

  if (!rawText) {
    throw new Error("Failed to generate summary");
  }

  // Clean up any accidental quotes or markdown
  return rawText
    .replace(/^["']|["']$/g, "")
    .replace(/^#+\s*/gm, "")
    .trim();
}
