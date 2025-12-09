import { CoverLetterOutput, GenerateCoverLetterInput } from "./content-types";
import {
  extractJson,
  fallbackCoverLetterFromText,
  flashModel,
  safety,
  serializeResume,
} from "./shared";

export async function generateCoverLetter(
  input: GenerateCoverLetterInput
): Promise<CoverLetterOutput> {
  const {
    resumeData,
    jobDescription,
    companyName,
    positionTitle,
    hiringManagerName,
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

CANDIDATE'S RESUME:
${resumeText}

CRITICAL REQUIREMENTS:
1. Length: Approximately 300 words (concise but comprehensive)
2. Personalization: Reference specific company details, role requirements, and how the candidate's experience aligns
3. Structure:
   - Salutation: Professional greeting${
     hiringManagerName
       ? ` (use "${hiringManagerName}" if provided)`
       : " (use 'Dear Hiring Manager' if name not provided)"
   }
   - Introduction (1-2 sentences): Hook that shows genuine interest and mentions the specific position
   - Body (2-3 paragraphs):
     * Paragraph 1: Highlight most relevant experience and achievements that match job requirements
     * Paragraph 2: Connect additional skills/experience to job needs, mention specific accomplishments
     * Optional Paragraph 3: Show knowledge of company/industry or address any gaps
   - Closing (1-2 sentences): Enthusiastic closing that reiterates interest and value
   - Signature: Professional sign-off

CONTENT GUIDELINES:
- Match keywords from the job description naturally
- Use specific examples from the resume (quantify achievements when possible)
- Show knowledge of the company/role (if evident from JD)
- Demonstrate enthusiasm and cultural fit
- Avoid generic phrases - be specific and authentic
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
    "[Optional third paragraph: Company knowledge or addressing specific requirements]"
  ],
  "closing": "[1-2 sentence closing that reiterates interest and value proposition]",
  "signature": "Sincerely,\\n${resumeData.personalInfo?.firstName || ""} ${
    resumeData.personalInfo?.lastName || ""
  }"
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no explanations, no code blocks.`;

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
