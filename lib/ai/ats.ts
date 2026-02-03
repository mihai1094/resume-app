import { ResumeData } from "@/lib/types/resume";
import { AIBaseOptions, ATSAnalysisResult, Industry, LearnableSkill, SeniorityLevel } from "./content-types";
import {
  AIError,
  extractJson,
  flashModel,
  parseAIJsonResponse,
  safety,
  serializeResume,
  validateAIResponse,
} from "./shared";
import { matchSkillsWithResources } from "./learning-resources";
import { aiLogger } from "@/lib/services/logger";
import { buildSystemInstruction, PROMPT_VERSION, wrapTag } from "./prompt-utils";

/**
 * Get seniority-specific ATS analysis guidance
 */
function getSeniorityATSGuidance(level: SeniorityLevel = "mid"): string {
  const guidance: Record<SeniorityLevel, string> = {
    entry: "- Look for foundational skills, academic projects, and relevant certifications\n- Emphasize transferable skills and learning capacity",
    mid: "- Look for specific tool proficiency and project ownership keywords\n- Value quantifiable impact and technical depth in descriptions",
    senior: "- Look for strategic leadership, architectural decisions, and mentorship keywords\n- Value cross-functional impact and organizational influence",
    executive: "- Look for P&L responsibility, strategic vision, and enterprise transformation keywords\n- Value board-level relations and long-term business outcomes",
  };
  return `\nSENIORITY FOCUS (${level}):\n${guidance[level]}`;
}

/**
 * Get industry-specific ATS keyword guidance
 */
function getIndustryATSGuidance(industry?: Industry): string {
  if (!industry) return "";

  const guidance: Record<Industry, string> = {
    technology: "- Prioritize tech stack keywords (languages, frameworks, infrastructure)\n- Look for agile methodologies and system design descriptors",
    finance: "- Prioritize regulatory knowledge, financial instruments, and analysis tools\n- Look for audit, compliance, and risk management keywords",
    healthcare: "- Prioritize clinical systems (EHR/EMR), compliance (HIPAA), and care specialties\n- Look for quality improvement and patient safety metrics",
    marketing: "- Prioritize digital growth tools (SEO, Analytics), brand metrics, and strategy\n- Look for omnichannel and conversion optimization keywords",
    sales: "- Prioritize CRM tools, revenue growth metrics, and negotiation techniques\n- Look for pipeline management and market expansion keywords",
    engineering: "- Prioritize design standards, technical tools (CAD), and safety protocols\n- Look for project engineering and lifecycle management keywords",
    education: "- Prioritize pedagogical frameworks, learning assessment tools, and curriculum\n- Look for student outcome and differentiated instruction keywords",
    legal: "- Prioritize legal research tools, document types, and practice areas\n- Look for litigation, compliance, and due diligence keywords",
    consulting: "- Prioritize framework knowledge, client management, and business value\n- Look for digital transformation and change management keywords",
    manufacturing: "- Prioritize lean manufacturing, quality control (Six Sigma), and ERP systems\n- Look for safety and process optimization keywords",
    retail: "- Prioritize inventory management, sales metrics, and service standards\n- Look for omnichannel and customer experience keywords",
    hospitality: "- Prioritize service standards, revenue management, and property systems\n- Look for guest satisfaction and team leadership keywords",
    nonprofit: "- Prioritize mission alignment, fundraising, and donor management tools\n- Look for community impact and resource stewardship keywords",
    government: "- Prioritize public policy, accountability, and regulatory compliance\n- Look for program management and public impact keywords",
    other: "",
  };

  return `\nINDUSTRY CONTEXT (${industry}):\n${guidance[industry]}`;
}

/**
 * Simplified fallback prompt for when the main analysis fails
 */
function getSimplifiedPrompt(resumeText: string, jobDescription: string): string {
  // Extract key requirements from job description for focused analysis
  const jobSnippet = jobDescription.substring(0, 1500);
  const resumeSnippet = resumeText.substring(0, 2000);

  return `Compare resume to job. Return JSON only.

JOB REQUIREMENTS:
${jobSnippet}

RESUME:
${resumeSnippet}

Respond with this JSON (replace placeholders with real analysis):
{
  "score": 65,
  "missingKeywords": ["Docker", "Playwright", "distributed systems"],
  "suggestions": [
    {"id": "1", "type": "skill", "severity": "critical", "title": "Add Docker experience", "description": "Job requires Docker familiarity", "action": "Add Docker to skills if you have experience", "estimatedImpact": 10},
    {"id": "2", "type": "keyword", "severity": "high", "title": "Mention browser automation", "description": "Job focuses on Playwright/Puppeteer", "action": "Highlight any browser automation experience", "estimatedImpact": 8}
  ],
  "strengths": ["Strong TypeScript experience", "Remote work experience"],
  "improvements": ["Add more backend/infrastructure keywords", "Mention API development experience"]
}

CRITICAL: Fill in REAL values based on the actual job and resume. Do not return empty arrays.
NEVER suggest adding fake education, degrees, universities, or certifications the candidate doesn't have.
Only suggest adding skills or rephrasing existing experience.`;
}

export async function analyzeATSCompatibility(
  resumeData: ResumeData,
  jobDescription: string,
  options: AIBaseOptions = {}
): Promise<ATSAnalysisResult> {
  const { industry, seniorityLevel } = options;
  const model = flashModel();
  const resumeText = serializeResume(resumeData);

  const systemInstruction = buildSystemInstruction(
    "ATS analyzer and career coach",
    "Return JSON only. Never fabricate credentials or experience."
  );

  aiLogger.debug("ATS analysis start", {
    resumeLength: resumeText.length,
    jobDescriptionLength: jobDescription.length,
  });

  const prompt = `PROMPT_VERSION: ${PROMPT_VERSION}
TASK: Analyze the resume against the job requirements and provide a compatibility analysis.

=== JOB DESCRIPTION ===
${wrapTag("job_description", jobDescription)}

=== RESUME ===
${wrapTag("resume", resumeText)}

${getIndustryATSGuidance(industry)}
${getSeniorityATSGuidance(seniorityLevel)}

=== INSTRUCTIONS ===
Analyze the resume against the job requirements and respond with ONLY a JSON object (no markdown, no explanation).

The JSON must have this exact structure:
{
  "score": <number 0-100 based on match quality>,
  "missingKeywords": ["<required skill/keyword not in resume>", ...],
  "suggestions": [
    {
      "id": "1",
      "type": "<keyword|skill|experience|achievement>",
      "severity": "<critical|high|medium|low>",
      "title": "<short title>",
      "description": "<what's missing or weak>",
      "action": "<how to fix it>",
      "estimatedImpact": <1-15>
    }
  ],
  "strengths": ["<what matches well>", ...],
  "improvements": ["<priority improvement>", ...],
  "skillsToLearn": [
    {
      "skill": "<specific technology/skill from job requirements NOT in resume>",
      "importance": "<critical|important|nice-to-have>",
      "reason": "<why this skill matters for this specific job, 1 sentence>"
    }
  ]
}

Scoring guide:
- 80-100: Excellent match, most requirements met
- 60-79: Good match, some gaps
- 40-59: Partial match, significant gaps
- 0-39: Poor match, missing key requirements

For "skillsToLearn", identify 3-6 specific technologies, tools, or frameworks mentioned in the job description that:
1. Are NOT present in the candidate's resume
2. Can realistically be learned in 1-4 weeks
3. Would significantly improve their chances of getting the job

Focus on concrete, learnable skills like: React, TypeScript, Docker, AWS, Python, SQL, GraphQL, etc.
Do NOT include soft skills or vague requirements like "attention to detail" or "team player".

CRITICAL CONSTRAINTS - DO NOT VIOLATE:
1. NEVER suggest adding fake education, degrees, universities, or certifications the candidate doesn't have
2. NEVER suggest fabricating work experience or job titles
3. NEVER suggest inventing metrics, achievements, or accomplishments
4. Only suggest improvements based on rephrasing existing content, adding learnable SKILLS, or highlighting existing experience differently
5. If the job requires a degree the candidate doesn't have, acknowledge this as a gap but do NOT suggest adding a fake degree
6. Suggestions must be ethical and factually accurate

Provide 3-5 actionable suggestions. Be specific about what's missing from the job requirements.`;

  // Try main analysis
  try {
    aiLogger.debug("ATS calling model");
    const result = await model.generateContent({
      systemInstruction,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings: safety,
    });

    const rawText = result.response.text();

    const text = validateAIResponse(rawText, "analyzeATSCompatibility");
    const parsed = parseAIJsonResponse<ATSAnalysisResult>(text, "analyzeATSCompatibility");


    // Validate that we got meaningful results
    const atsResult: ATSAnalysisResult = {
      score: parsed.score || 0,
      missingKeywords: parsed.missingKeywords || [],
      suggestions: parsed.suggestions || [],
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
    };

    // Match AI-identified skills with our curated learning resources
    const skillsToLearn = (parsed as any).skillsToLearn || [];
    if (skillsToLearn.length > 0) {
      const learnableSkills = matchSkillsWithResources(skillsToLearn);
      if (learnableSkills.length > 0) {
        atsResult.learnableSkills = learnableSkills;
        aiLogger.debug("ATS matched learning resources", {
          count: learnableSkills.length,
        });
      }
    }

    // Validate we got meaningful results (score alone isn't enough)
    const hasContent = atsResult.suggestions.length > 0 || atsResult.missingKeywords.length > 0 || atsResult.strengths.length > 0;
    if (!hasContent) {
      console.warn('[ATS] AI returned score but no content, retrying. Raw:', rawText?.substring(0, 1000));
      throw new AIError("invalid_format", "analyzeATSCompatibility", "AI returned empty arrays");
    }

    aiLogger.debug("ATS analysis complete", {
      score: atsResult.score,
      learnableSkills: atsResult.learnableSkills?.length || 0,
    });
    return atsResult;
  } catch (error) {
    const errorDetails = error instanceof AIError
      ? { type: error.type, message: error.message, rawPreview: error.rawResponse?.substring(0, 500) }
      : error instanceof Error
        ? { message: error.message }
        : { error: String(error) };

    console.warn('[ATS] Main analysis failed:', JSON.stringify(errorDetails, null, 2));

    // Retry with simplified prompt
    try {
      aiLogger.debug("ATS retry with simplified prompt");
      const simplifiedPrompt = getSimplifiedPrompt(resumeText, jobDescription);
      const retryResult = await model.generateContent({
        systemInstruction,
        contents: [{ role: "user", parts: [{ text: simplifiedPrompt }] }],
        safetySettings: safety,
      });

      const retryText = retryResult.response.text();
      aiLogger.debug("ATS retry response", {
        length: retryText?.length || 0,
        preview: retryText?.substring(0, 200),
      });

      if (!retryText) {
        throw new AIError("empty_response", "analyzeATSCompatibility", "Retry returned empty response");
      }

      const parsed = extractJson<ATSAnalysisResult>(retryText);
      if (!parsed) {
        console.error('[ATS] Retry parse failed. Full response:', retryText);
        throw new AIError("parse_error", "analyzeATSCompatibility", "Retry also failed to parse JSON", {
          rawResponse: retryText,
        });
      }

      aiLogger.debug("ATS simplified analysis success", {
        score: parsed.score,
      });
      return {
        score: parsed.score || 50,
        missingKeywords: parsed.missingKeywords || [],
        suggestions: parsed.suggestions || [],
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
      };
    } catch (retryError) {
      const retryDetails = retryError instanceof AIError
        ? { type: retryError.type, message: retryError.message }
        : retryError instanceof Error
          ? { message: retryError.message }
          : { error: String(retryError) };

      console.error('[ATS] Both main and simplified analysis failed. Retry error:', JSON.stringify(retryDetails, null, 2));
      throw error;
    }
  }
}
