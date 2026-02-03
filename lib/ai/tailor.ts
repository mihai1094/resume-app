import { ResumeData } from "@/lib/types/resume";
import {
  flashModelJson,
  parseAIJsonResponse,
  safety,
  serializeResume,
  validateAIResponse,
} from "./shared";
import { buildSystemInstruction, PROMPT_VERSION, wrapTag } from "./prompt-utils";
import { AIBaseOptions, Industry, SeniorityLevel, TailoredResumeResult } from "./content-types";

/**
 * Get industry-specific tailoring guidance
 */
function getIndustryTailoringGuidance(industry?: Industry): string {
  if (!industry) return "";

  const guidance: Record<Industry, string> = {
    technology: "- Prioritize modern tech stacks, cloud architecture, and development methodologies\n- Use technical terminology matching the JD (e.g., 'microservices', 'distributed systems')\n- Emphasize technical problem-solving and scalability",
    finance: "- Emphasize accuracy, compliance, and quantifiable financial impact\n- Use finance-specific terminology (e.g., 'risk mitigation', 'P&L management')\n- Focus on performance against market benchmarks",
    healthcare: "- Focus on patient outcomes, regulatory compliance (HIPAA), and clinical efficiency\n- Use healthcare-specific terminology (e.g., 'care coordination', 'clinical operations')\n- Emphasize quality of care metrics",
    marketing: "- Prioritize ROI, customer acquisition, and brand growth metrics\n- Use marketing terminology (e.g., 'omnichannel', 'conversion funnel')\n- Emphasize data-driven decision making",
    sales: "- Focus on quota attainment, revenue growth, and pipeline management\n- Use sales terminology (e.g., 'negotiation', 'lead generation')\n- Emphasize hunter/farmer roles as appropriate",
    engineering: "- Prioritize technical project management, safety standards, and efficiency improvements\n- Use engineering terminology (e.g., 'Six Sigma', 'BIM')\n- Emphasize industrial impact and precision",
    education: "- Focus on learning outcomes, curriculum development, and student engagement\n- Use educational terminology (e.g., 'instructional design', 'pedagogy')\n- Emphasize academic success metrics",
    legal: "- Emphasize risk mitigation, contract management, and regulatory compliance\n- Use legal terminology matching the JD (e.g., 'due diligence', 'corporate governance')\n- Focus on precision and ethical standards",
    consulting: "- Prioritize strategic impact, client management, and value creation\n- Use consulting terminology (e.g., 'change management', 'transformation focus')\n- Emphasize versatility and problem-solving",
    manufacturing: "- Focus on operational excellence, Lean/Six Sigma, and supply chain efficiency\n- Use manufacturing terminology (e.g., 'continuous improvement', 'ERP')\n- Emphasize safety and production targets",
    retail: "- Focus on customer experience, inventory management, and sales targets\n- Use retail terminology (e.g., 'merchandising', 'omnichannel')\n- Emphasize operational flow and team leadership",
    hospitality: "- Prioritize guest satisfaction, revenue management, and service excellence\n- Use hospitality terminology (e.g., 'brand standards', 'RevPAR')\n- Emphasize service quality and efficiency",
    nonprofit: "- Focus on mission impact, fundraising success, and community engagement\n- Use nonprofit terminology (e.g., 'grant writing', 'donor relations')\n- Emphasize social value and organizational growth",
    government: "- Emphasize policy impact, public service efficiency, and regulatory adherence\n- Use government terminology (e.g., 'stakeholder engagement', 'public administration')\n- Focus on accountability and social impact",
    other: "",
  };
  return guidance[industry] ? `\nINDUSTRY FOCUS:\n${guidance[industry]}` : "";
}

/**
 * Get seniority-specific tailoring guidance
 */
function getSeniorityTailoringGuidance(level: SeniorityLevel = "mid"): string {
  const guidance: Record<SeniorityLevel, string> = {
    entry: "- Emphasize potential, education, and foundational skills\n- Highlight academic projects or internships relevant to the role\n- Focus on fast learning and contribution to team goals",
    mid: "- Focus on specialized expertise and independent project execution\n- Highlight professional achievements and growing impact\n- Emphasize ability to scale processes and mentor others",
    senior: "- Emphasize strategic impact, team leadership, and technical vision\n- Highlight organizational transformation and team building\n- Focus on mentoring, architecture, and driving complex initiatives",
    executive: "- Focus on enterprise-level impact, P&L management, and vision\n- Highlight executive presence and strategic business transformation\n- Emphasize board-level influence and long-term industry impact",
  };
  return `\nSENIORITY LEVEL FOCUS (${level}):\n${guidance[level]}`;
}

export async function tailorResume(
  resumeData: ResumeData,
  jobDescription: string,
  options: AIBaseOptions = {}
): Promise<TailoredResumeResult> {
  const { industry, seniorityLevel } = options;
  const model = flashModelJson();
  const resumeText = serializeResume(resumeData);

  const systemInstruction = buildSystemInstruction(
    "Expert resume writer",
    "Tailor resumes using only provided facts and return JSON only."
  );

  type TailorResponse = {
    summary: string;
    enhancedBullets: Record<string, string[]>;
    addedKeywords: string[];
    changes: string[];
  };

  const isValidResponse = (data: unknown): data is TailorResponse => {
    if (!data || typeof data !== "object") return false;
    const obj = data as TailorResponse;
    return (
      typeof obj.summary === "string" &&
      typeof obj.enhancedBullets === "object" &&
      Array.isArray(obj.addedKeywords) &&
      Array.isArray(obj.changes)
    );
  };

  const prompt = `PROMPT_VERSION: ${PROMPT_VERSION}
TASK: Tailor the resume to match the job description by rephrasing, emphasizing relevant experience, and incorporating keywords - WITHOUT adding false information.

JOB DESCRIPTION:
${wrapTag("job_description", jobDescription)}

CURRENT RESUME:
${wrapTag("resume", resumeText)}

${getIndustryTailoringGuidance(industry)}
${getSeniorityTailoringGuidance(seniorityLevel)}

CRITICAL CONSTRAINTS:
1. FACTUAL ACCURACY: Do NOT invent experiences, achievements, or skills. Only rephrase what exists.
2. NO FABRICATION: Never add metrics, technologies, or experiences not present in the original resume.
3. PRESERVE TRUTH: Maintain the integrity of all dates, companies, titles, and accomplishments.
4. REPHRASE ONLY: Change wording to match JD language, emphasize relevant aspects, but keep facts identical.

TAILORING STRATEGY:
1. Keyword Integration: Naturally incorporate keywords from JD into existing bullet points
2. Emphasis Shift: Rephrase to highlight experience most relevant to the job
3. Language Matching: Use terminology from JD where appropriate (e.g., "managed" vs "led", "developed" vs "created")
4. Relevance Prioritization: Emphasize achievements and skills that align with job requirements
5. Industry Alignment: Adjust phrasing to match industry standards mentioned in JD

IMPORTANT:
- Only rephrase existing content - do not add new experiences
- Maintain all original facts, dates, companies, and achievements
- Focus on language alignment and keyword integration
- Explain each change in the CHANGES MADE section

REQUIRED JSON OUTPUT:
{
  "summary": "2-3 sentence summary with integrated keywords",
  "enhancedBullets": {
    "exp-1": ["Rephrased bullet 1", "Rephrased bullet 2"],
    "exp-2": ["..."]
  },
  "addedKeywords": ["keyword1", "keyword2"],
  "changes": ["Specific change 1", "Specific change 2"]
}

Return ONLY valid JSON.`;

  const result = await model.generateContent({
    systemInstruction,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = validateAIResponse(result.response.text(), "tailorResume");
  const parsed = parseAIJsonResponse<TailorResponse>(
    text,
    "tailorResume",
    isValidResponse
  );

  return {
    summary: parsed.summary?.trim() || "",
    enhancedBullets: parsed.enhancedBullets || {},
    addedKeywords: (parsed.addedKeywords || []).filter((k) => k.trim().length > 0),
    changes: (parsed.changes || []).filter((c) => c.trim().length > 0),
  };
}
