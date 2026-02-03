import { CoverLetterOutput, GenerateCoverLetterInput, Industry, Locale, SeniorityLevel } from "./content-types";
import {
  extractJson,
  fallbackCoverLetterFromText,
  flashModel,
  safety,
  serializeResume,
} from "./shared";
import { buildSystemInstruction, PROMPT_VERSION, wrapTag } from "./prompt-utils";

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

/**
 * Get industry-specific cover letter guidance
 */
function getIndustryCoverLetterGuidance(industry?: Industry): string {
  if (!industry) return "";

  const guidance: Record<Industry, string> = {
    technology: "- Highlight technical innovation and problem-solving\n- Mention ability to learn new stacks quickly\n- Focus on scalability and performance impact",
    finance: "- Emphasize accuracy, risk management, and regulatory compliance\n- Focus on quantifiable financial outcomes and efficiency\n- Maintain a formal, authoritative tone",
    healthcare: "- Highlight patient-centric approach and quality of care\n- Mention experience with healthcare regulations (e.g., HIPAA)\n- Focus on empathy combined with clinical/technical excellence",
    marketing: "- Emphasize creativity, brand alignment, and ROI\n- Focus on data-driven decision making and audience engagement\n- Use a more energetic and persuasive tone",
    sales: "- Focus on quota attainment and revenue growth\n- Emphasize relationship building and negotiation skills\n- Use a high-energy, results-oriented tone",
    engineering: "- Highlight technical precision and safety standards\n- Focus on project management and cross-functional collaboration\n- Emphasize complex problem-solving abilities",
    education: "- Focus on student outcomes and pedagogical innovation\n- Highlight curriculum development and classroom management\n- Emphasize empathy and communication skills",
    legal: "- Emphasize attention to detail and analytical rigor\n- Focus on compliance, research, and persuasive writing\n- Maintain a highly formal and precise tone",
    consulting: "- Highlight client-facing excellence and strategic thinking\n- Focus on diverse project experience and adaptability\n- Emphasize ability to deliver value in fast-paced environments",
    manufacturing: "- Focus on operational efficiency and process optimization\n- Highlight safety records and lean methodology knowledge\n- Emphasize reliability and technical expertise",
    retail: "- Emphasize customer experience and operational excellence\n- Focus on sales targets and inventory management\n- Highlight adaptability in high-volume environments",
    hospitality: "- Focus on guest satisfaction and service excellence\n- Highlight interpersonal skills and multi-tasking abilities\n- Emphasize positive attitude and teamwork",
    nonprofit: "- Align with the organization's mission and social impact\n- Focus on resource stewardship and community engagement\n- Emphasize passion combined with professional execution",
    government: "- Emphasize public service commitment and regulatory compliance\n- Focus on transparency, accountability, and process adherence\n- Maintain a formal, objective tone",
    other: "",
  };

  return `\nINDUSTRY CONTEXT (${industry}):\n${guidance[industry]}`;
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
    industry,
  } = input;
  const model = flashModel();
  const resumeText = serializeResume(resumeData);
  const systemInstruction = buildSystemInstruction(
    "Expert cover letter writer",
    "Generate a personalized cover letter using only provided facts and return JSON only."
  );

  const prompt = `PROMPT_VERSION: ${PROMPT_VERSION}
TASK: Write a personalized, professional cover letter that connects the candidate's experience to the specific job requirements.

JOB INFORMATION:
Company: ${wrapTag("company", companyName)}
Position: ${wrapTag("position", positionTitle)}
${hiringManagerName ? `Hiring Manager: ${wrapTag("hiring_manager", hiringManagerName)}` : ""}

JOB DESCRIPTION:
${wrapTag("job_description", jobDescription)}
${companyInfo ? `\nADDITIONAL COMPANY INFORMATION:\n${wrapTag("context", companyInfo)}` : ""}

CANDIDATE'S RESUME:
${wrapTag("resume", resumeText)}

LOCALE/REGION CONVENTIONS:
${getLocaleGuidance(locale)}

SENIORITY LEVEL GUIDANCE (${seniorityLevel}):
${getSeniorityGuidance(seniorityLevel)}${getIndustryCoverLetterGuidance(industry)}

CRITICAL REQUIREMENTS:
1. Length: 250-350 words (concise but comprehensive - this is strictly enforced)
2. Personalization: Reference specific details from the job description
3. Structure:
   - Salutation: Professional greeting${hiringManagerName
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

CRITICAL CONSTRAINTS - DO NOT VIOLATE:
- ONLY reference achievements, skills, and experiences that are in the provided resume
- Do NOT invent metrics, accomplishments, or qualifications the candidate doesn't have
- Do NOT fabricate education, certifications, or work history
- Do NOT add skills or experiences not mentioned in the resume
- All claims about the candidate must be verifiable from their resume
- If the resume lacks certain experience, do NOT pretend they have it

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
  "signature": "Sincerely,\\n${resumeData.personalInfo?.firstName || ""} ${resumeData.personalInfo?.lastName || ""
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
    systemInstruction,
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
        `Sincerely,\n${resumeData.personalInfo?.firstName || ""} ${resumeData.personalInfo?.lastName || ""
        }`,
    };
  }

  return fallbackCoverLetterFromText(text, resumeData);
}
