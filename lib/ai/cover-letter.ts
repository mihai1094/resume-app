import { CoverLetterOutput, GenerateCoverLetterInput, Locale, SeniorityLevel } from "./content-types";
import {
  extractJson,
  fallbackCoverLetterFromText,
  flashModel,
  safety,
  serializeResume,
} from "./shared";

/**
 * Get locale-specific cover letter conventions
 */
function getLocaleGuidance(locale: Locale = "US"): string {
  const guidance: Record<Locale, string> = {
    US: "- Use American English spelling and conventions\n- Direct, achievement-focused tone\n- Emphasize individual accomplishments",
    UK: "- Use British English spelling (organisation, colour, etc.)\n- Slightly more formal tone than US\n- Balance team and individual achievements",
    EU: "- Professional European conventions\n- May be more formal than US style\n- Consider multilingual context if relevant",
    APAC: "- Respectful, relationship-focused tone\n- Balance humility with achievements\n- Consider cultural context for formality level",
  };
  return guidance[locale];
}

/**
 * Get seniority-appropriate content guidance
 */
function getSeniorityGuidance(level: SeniorityLevel = "mid"): string {
  const guidance: Record<SeniorityLevel, string> = {
    entry: "- Focus on education, internships, projects, and transferable skills\n- Show eagerness to learn and grow\n- Highlight relevant coursework or certifications",
    mid: "- Balance experience with growth potential\n- Highlight specific achievements and skills\n- Show progression and increasing responsibility",
    senior: "- Emphasize leadership and strategic impact\n- Focus on team building and mentorship\n- Highlight cross-functional collaboration",
    executive: "- Focus on organizational transformation and vision\n- Emphasize P&L responsibility and business outcomes\n- Highlight board-level or C-suite achievements",
  };
  return guidance[level];
}

export async function generateCoverLetter(
  input: GenerateCoverLetterInput
): Promise<CoverLetterOutput> {
  const {
    resumeData,
    jobDescription,
    companyName,
    positionTitle,
    hiringManagerName,
    companyInfo,
    locale = "US",
    seniorityLevel = "mid",
  } = input;
  const model = flashModel();
  const resumeText = serializeResume(resumeData);

  const prompt = `You are an expert cover letter writer specializing in creating personalized, compelling cover letters that demonstrate genuine interest and alignment with job requirements.

TASK: Write a personalized, professional cover letter that connects the candidate's experience to the specific job requirements.

JOB INFORMATION:
- Company: ${companyName}
- Position: ${positionTitle}
${hiringManagerName ? `- Hiring Manager: ${hiringManagerName}` : ""}

JOB DESCRIPTION:
${jobDescription}
${companyInfo ? `\nADDITIONAL COMPANY INFORMATION:\n${companyInfo}` : ""}

CANDIDATE'S RESUME:
${resumeText}

LOCALE/REGION CONVENTIONS:
${getLocaleGuidance(locale)}

SENIORITY LEVEL GUIDANCE (${seniorityLevel}):
${getSeniorityGuidance(seniorityLevel)}

CRITICAL REQUIREMENTS:
1. Length: 250-350 words (concise but comprehensive - this is strictly enforced)
2. Personalization: Reference specific details from the job description
3. Structure:
   - Salutation: Professional greeting${
     hiringManagerName
       ? ` (use "${hiringManagerName}")`
       : " (use 'Dear Hiring Manager' if name not provided)"
   }
   - Introduction (1-2 sentences): Hook that shows genuine interest and mentions the specific position
   - Body (2-3 paragraphs):
     * Paragraph 1: Highlight most relevant experience and achievements matching job requirements
     * Paragraph 2: Connect additional skills/experience to job needs, mention specific accomplishments
     * Optional Paragraph 3: Address specific requirements from JD or show industry knowledge
   - Closing (1-2 sentences): Enthusiastic closing that reiterates interest and value
   - Signature: Professional sign-off

CONTENT GUIDELINES:
- Match keywords from the job description naturally
- Use specific examples from the resume (quantify achievements when possible)
- IMPORTANT: Only reference company details that are explicitly mentioned in the job description or additional company info provided above. Do NOT fabricate or assume company facts, culture, or values not mentioned.
- If the job description lacks company details, focus entirely on role requirements and how your experience matches
- Avoid generic company praise like "I admire your company's innovation" unless you have specific details to reference
- Demonstrate enthusiasm and cultural fit based on the role, not assumed company traits
- Use active voice and confident language
- Connect past achievements to future contributions
- Address how you can solve their problems or add value

TONE:
- Professional yet warm and engaging
- Confident but not arrogant
- Enthusiastic but not overly casual
- Specific and concrete, not vague

REQUIRED JSON OUTPUT FORMAT:
{
  "salutation": "Dear ${hiringManagerName || "Hiring Manager"},",
  "introduction": "[1-2 sentence hook showing interest in the specific position]",
  "bodyParagraphs": [
    "[First paragraph: Most relevant experience and achievements matching job requirements]",
    "[Second paragraph: Additional skills/experience and specific accomplishments]",
    "[Optional third paragraph: Address specific JD requirements or industry knowledge]"
  ],
  "closing": "[1-2 sentence closing that reiterates interest and value proposition]",
  "signature": "Sincerely,\\n${resumeData.personalInfo?.firstName || ""} ${
    resumeData.personalInfo?.lastName || ""
  }"
}

EXAMPLE OUTPUT:
{
  "salutation": "Dear Ms. Johnson,",
  "introduction": "I am excited to apply for the Senior Software Engineer position at TechCorp, where I can leverage my 6 years of experience building scalable distributed systems to help drive your cloud infrastructure initiatives.",
  "bodyParagraphs": [
    "In my current role at DataSystems Inc., I led the architecture of a microservices platform that reduced deployment time by 75% and supported 10x traffic growth. This experience directly aligns with your need for engineers who can design robust, scalable solutions.",
    "Beyond technical execution, I have mentored 5 junior engineers and established code review practices that decreased production bugs by 40%. I am passionate about building strong engineering cultures while delivering impactful results."
  ],
  "closing": "I would welcome the opportunity to discuss how my background in distributed systems and team leadership can contribute to TechCorp's engineering goals.",
  "signature": "Sincerely,\\nJohn Smith"
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no explanations, no code blocks. If you cannot complete this task, return: {"error": true, "reason": "explanation"}`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = result.response.text();
  const parsed = extractJson<CoverLetterOutput>(text);
  if (parsed) {
    return {
      salutation: parsed.salutation || "Dear Hiring Manager,",
      introduction: parsed.introduction || "",
      bodyParagraphs: parsed.bodyParagraphs || [],
      closing: parsed.closing || "",
      signature:
        parsed.signature ||
        `Sincerely,\n${resumeData.personalInfo?.firstName || ""} ${
          resumeData.personalInfo?.lastName || ""
        }`,
    };
  }

  return fallbackCoverLetterFromText(text, resumeData);
}
