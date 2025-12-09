import { ResumeData } from "@/lib/types/resume";
import { TailoredResumeResult } from "./content-types";
import { flashModel, safety, serializeResume } from "./shared";

export async function tailorResume(
  resumeData: ResumeData,
  jobDescription: string
): Promise<TailoredResumeResult> {
  const model = flashModel();
  const resumeText = serializeResume(resumeData);

  const prompt = `You are an expert resume writer specializing in tailoring resumes to specific job descriptions while maintaining 100% factual accuracy.

TASK: Tailor the resume to match the job description by rephrasing, emphasizing relevant experience, and incorporating keywords - WITHOUT adding false information.

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME:
${resumeText}

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

REQUIRED OUTPUT FORMAT:
SUMMARY:
[Enhanced professional summary that incorporates keywords from JD while maintaining factual accuracy. 2-3 sentences, 40-60 words.]

ENHANCED BULLETS:
Experience 1:
- [Rephrased bullet point 1 with JD keywords integrated]
- [Rephrased bullet point 2 with JD keywords integrated]
- [Continue for all relevant experiences...]

Experience 2:
- [Rephrased bullets for second experience...]

[Continue for all work experiences...]

KEYWORDS ADDED:
[Keyword 1], [Keyword 2], [Keyword 3]
[List all keywords from JD that were naturally incorporated into the resume]

CHANGES MADE:
- [Specific change 1: what was rephrased and why]
- [Specific change 2: what was emphasized and why]
- [Continue listing all significant changes...]

IMPORTANT:
- Only rephrase existing content - do not add new experiences
- Maintain all original facts, dates, companies, and achievements
- Focus on language alignment and keyword integration
- Explain each change in the CHANGES MADE section

Generate the tailored resume content now:`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = result.response.text();
  console.log("[AI] tailorResume raw response:", text.substring(0, 800));

  const summaryMatch = text.match(
    /SUMMARY:\s*([^\n]+(?:\n(?!ENHANCED BULLETS:|KEYWORDS ADDED:|CHANGES MADE:)[^\n]+)*)/i
  );
  const bulletsSection = text.match(
    /ENHANCED BULLETS:([\s\S]*?)(?:KEYWORDS ADDED:|$)/i
  );
  const keywordsMatch = text.match(/KEYWORDS ADDED:\s*([^\n]+)/i);
  const changesSection = text.match(/CHANGES MADE:([\s\S]*?)$/i);

  const enhancedBullets: Record<string, string[]> = {};
  if (bulletsSection) {
    bulletsSection[1]
      .split(/Experience \d+:/i)
      .filter((b) => b.trim())
      .forEach((block, idx) => {
        const bullets = block
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.startsWith("-"))
          .map((l) => l.replace(/^-\s*/, "").trim())
          .filter((l) => l.length > 0);
        if (bullets.length) enhancedBullets[`exp-${idx + 1}`] = bullets;
      });
  }

  const addedKeywords =
    keywordsMatch?.[1]
      ?.split(/[,;]/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0) || [];

  const changes =
    changesSection?.[1]
      ?.split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("-"))
      .map((l) => l.replace(/^-\s*/, "").trim())
      .filter((l) => l.length > 0) || [];

  return {
    summary: summaryMatch ? summaryMatch[1].trim() : "",
    enhancedBullets,
    addedKeywords,
    changes,
  };
}
