import { ResumeData } from "@/lib/types/resume";
import {
  ATSSuggestion,
  GenerateImprovementResult,
  ImprovementOption,
  KeywordPlacement,
} from "./content-types";
import {
  extractJson,
  flashModel,
  flashModelJson,
  safety,
  serializeResume,
} from "./shared";
import { generateId } from "@/lib/utils";
import { buildSystemInstruction, PROMPT_VERSION, wrapTag } from "./prompt-utils";
import { AIBaseOptions, Industry, SeniorityLevel } from "./content-types";

/**
 * Get industry-specific improvement guidance
 */
function getIndustryImprovementGuidance(industry?: Industry): string {
  if (!industry) return "";

  const guidance: Record<Industry, string> = {
    technology: "- Focus on modern tech stacks, scalability, and system performance\n- Use technical terminology matching industry standards (e.g., 'high-availability', 'latency reduction')\n- Emphasize technical problem-solving and deployment metrics",
    finance: "- Emphasize accuracy, regulatory compliance, and risk mitigation\n- Use finance-specific terminology (e.g., 'P&L management', 'audit compliance')\n- Focus on performance against market benchmarks and financial impact",
    healthcare: "- Focus on patient outcomes, clinical efficiency, and HIPAA/regulatory compliance\n- Use healthcare-specific terminology (e.g., 'care coordination', 'clinical operations')\n- Emphasize quality of care metrics",
    marketing: "- Prioritize ROI, brand growth, and conversion metrics\n- Use marketing terminology (e.g., 'omnichannel strategy', 'ROI optimization')\n- Emphasize data-driven decision making and audience reach",
    sales: "- Focus on quota attainment, revenue growth, and pipeline management\n- Use sales terminology (e.g., 'lead generation', 'territory expansion')\n- Emphasize hunter/farmer roles and scale of impact",
    engineering: "- Prioritize safety standards, technical precision, and efficiency improvements\n- Use engineering terminology (e.g., 'Six Sigma', 'continuous improvement')\n- Emphasize project delivery and industrial impact",
    education: "- Focus on student outcomes, curriculum innovation, and academic success\n- Use educational terminology (e.g., 'instructional design', 'pedagogy')\n- Emphasize learning reach and educational impact",
    legal: "- Emphasize risk mitigation, contract management, and regulatory compliance\n- Use legal terminology (e.g., 'due diligence', 'corporate governance')\n- Focus on precision and ethical standards",
    consulting: "- Prioritize strategic impact, client value, and strategic transformation\n- Use consulting terminology (e.g., 'change management', 'strategy execution')\n- Emphasize versatility and problem-solving scope",
    manufacturing: "- Focus on Lean/Six Sigma, operational excellence, and supply chain efficiency\n- Use manufacturing terminology (e.g., 'continuous improvement', 'ERP systems')\n- Emphasize safety and production targets",
    retail: "- Focus on customer experience, inventory management, and sales targets\n- Use retail terminology (e.g., 'merchandising', 'omnichannel flows')\n- Emphasize operational efficiency and team leadership",
    hospitality: "- Prioritize guest satisfaction, RevPAR, and service excellence\n- Use hospitality terminology (e.g., 'brand standards', 'revenue management')\n- Emphasize service quality and team performance",
    nonprofit: "- Focus on mission impact, fundraising success, and community engagement\n- Use nonprofit terminology (e.g., 'donor relations', 'grant management')\n- Emphasize social value and organizational growth",
    government: "- Emphasize policy impact, public service efficiency, and compliance\n- Use government terminology (e.g., 'public administration', 'policy implementation')\n- Focus on accountability and social impact",
    other: "",
  };
  return guidance[industry] ? `\nINDUSTRY GUIDANCE:\n${guidance[industry]}` : "";
}

/**
 * Get seniority-specific improvement guidance
 */
function getSeniorityImprovementGuidance(level: SeniorityLevel = "mid"): string {
  const guidance: Record<SeniorityLevel, string> = {
    entry: "- Emphasize learning agility, foundational skills, and potential\n- Highlight academic or internship projects relevant to the role\n- Focus on contribution to team goals and fast knowledge acquisition",
    mid: "- Focus on independent project execution and specialized expertise\n- Highlight career progression and ownership of deliverables\n- Emphasize ability to mentor others and scale processes",
    senior: "- Emphasize strategic impact, mentorship, and technical/business leadership\n- Highlight organizational transformation and team building\n- Focus on long-term vision and architecting scalable solutions",
    executive: "- Focus on enterprise-level vision, P&L responsibility, and C-suite influence\n- Highlight strategic transformations and board-level achievements\n- Emphasize culture building and global organizational impact",
  };
  return `\nSENIORITY LEVEL GUIDANCE (${level}):\n${guidance[level]}`;
}

/**
 * Generate specific improvement options for an ATS suggestion
 */
export async function generateImprovement(
  suggestion: ATSSuggestion,
  resumeData: ResumeData,
  jobDescription: string,
  options: AIBaseOptions = {}
): Promise<GenerateImprovementResult> {
  const { industry, seniorityLevel } = options;
  const model = flashModelJson();
  const resumeText = serializeResume(resumeData);
  const systemInstruction = buildSystemInstruction(
    "Resume improvement assistant",
    "Generate JSON options only. Never fabricate facts."
  );

  // Get work experience context for targeting bullets
  const experienceContext = resumeData.workExperience
    ?.slice(0, 3)
    .map((exp, i) => `Experience ${i + 1}: ${exp.position} at ${exp.company} (ID: ${exp.id})`)
    .join("\n") || "No work experience";

  const prompt = `PROMPT_VERSION: ${PROMPT_VERSION}
TASK: Generate specific, actionable options to address this ATS suggestion.

=== SUGGESTION TO ADDRESS ===
Type: ${suggestion.type}
Severity: ${suggestion.severity}
Title: ${suggestion.title}
Description: ${suggestion.description}
Recommended Action: ${suggestion.action}

=== CURRENT RESUME ===
${wrapTag("resume", resumeText)}

=== WORK EXPERIENCE IDS ===
${experienceContext}

=== JOB DESCRIPTION (excerpt) ===
${wrapTag("job_description", jobDescription.substring(0, 1000))}

${getIndustryImprovementGuidance(industry)}
${getSeniorityImprovementGuidance(seniorityLevel)}

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
- Be specific and use context from the job description

CRITICAL CONSTRAINTS - NEVER VIOLATE:
- NEVER suggest adding fake education, degrees, universities, or certifications
- NEVER suggest fabricating work experience, companies, or job titles
- NEVER invent metrics or achievements that don't exist in the original resume
- Only offer improvements that rephrase/enhance existing content or add learnable skills
- If a suggestion asks for education the candidate doesn't have, skip it or suggest alternative certifications they could actually obtain`;

  const result = await model.generateContent({
    systemInstruction,
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
  jobDescription: string,
  options: AIBaseOptions = {}
): Promise<KeywordPlacement[]> {
  const { industry, seniorityLevel } = options;
  if (keywords.length === 0) return [];

  const model = flashModelJson();
  const resumeText = serializeResume(resumeData);
  const systemInstruction = buildSystemInstruction(
    "Resume keyword optimizer",
    "Return JSON only. Do not fabricate facts."
  );

  const experienceContext = resumeData.workExperience
    ?.slice(0, 3)
    .map((exp) => `- ${exp.position} at ${exp.company} (ID: ${exp.id})`)
    .join("\n") || "No work experience";

  const prompt = `PROMPT_VERSION: ${PROMPT_VERSION}
TASK: Suggest where to add these missing keywords to a resume.

=== MISSING KEYWORDS ===
${keywords.join(", ")}

=== CURRENT RESUME ===
${wrapTag("resume", resumeText)}

=== WORK EXPERIENCE IDS ===
${experienceContext}

=== JOB CONTEXT ===
${wrapTag("job_description", jobDescription.substring(0, 800))}

${getIndustryImprovementGuidance(industry)}
${getSeniorityImprovementGuidance(seniorityLevel)}

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
    systemInstruction,
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
  companyName: string,
  options: AIBaseOptions = {}
): Promise<string> {
  const { industry, seniorityLevel } = options;
  const model = flashModel();
  const currentSummary = resumeData.personalInfo?.summary || "";
  const resumeText = serializeResume(resumeData);
  const systemInstruction = buildSystemInstruction(
    "Professional resume writer",
    "Rewrite the summary using only provided facts."
  );

  const prompt = `PROMPT_VERSION: ${PROMPT_VERSION}
TASK: Rewrite this professional summary to better target the specified job.

=== CURRENT SUMMARY ===
${wrapTag("text", currentSummary || "(No summary provided)")}

=== RESUME CONTEXT ===
${wrapTag("resume", resumeText)}

=== TARGET JOB ===
Position: ${jobTitle || "Not specified"}
Company: ${companyName || "Not specified"}

=== JOB DESCRIPTION ===
${wrapTag("job_description", jobDescription.substring(0, 1200))}

${getIndustryImprovementGuidance(industry)}
${getSeniorityImprovementGuidance(seniorityLevel)}

=== INSTRUCTIONS ===
Write a compelling 2-3 sentence professional summary that:
1. Highlights relevant experience and skills for this specific role
2. Incorporates key keywords from the job description naturally
3. Showcases quantifiable achievements when possible
4. Maintains a professional, confident tone
5. Is 40-60 words long

Return ONLY the summary text, no JSON, no quotes, no explanation.`;

  const result = await model.generateContent({
    systemInstruction,
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
