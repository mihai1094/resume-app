import { GenerateBulletsInput } from "./content-types";
import { flashModel, safety } from "./shared";

export async function generateBulletPoints(
  input: GenerateBulletsInput
): Promise<string[]> {
  const { position, company, industry, customPrompt } = input;
  const model = flashModel();

  const prompt = `You are an expert resume writer specializing in creating impactful, results-oriented bullet points that pass ATS systems and impress recruiters.

TASK: Generate exactly 4 professional, achievement-focused resume bullet points for a ${position} at ${company}${
    industry ? ` in the ${industry} industry` : ""
  }.

CRITICAL REQUIREMENTS:
1. Start each bullet with a strong action verb (e.g., Led, Developed, Implemented, Optimized, Increased, Reduced, Managed, Created)
2. Include realistic, quantifiable metrics (percentages, dollar amounts, timeframes, team sizes, volume numbers)
3. Focus on impact and results, not just responsibilities
4. Use past tense throughout
5. Keep each bullet to 15-25 words (1-2 lines maximum)
6. Be specific and avoid vague language
7. Use industry-appropriate terminology
8. Ensure each bullet demonstrates measurable value

FORMAT:
- Return ONLY the 4 bullet points
- One bullet per line
- No bullets, numbers, or dashes
- No introductory text or explanations

${
  customPrompt
    ? `ADDITIONAL CONTEXT:\n${customPrompt}\n\nIncorporate this context naturally into the bullet points.`
    : ""
}

EXAMPLES OF EXCELLENT BULLETS:
- "Led cross-functional team of 8 engineers to deliver mobile app feature, increasing user engagement by 35% and generating $2M in additional revenue within 6 months"
- "Optimized supply chain processes, reducing operational costs by 22% ($450K annually) while improving delivery times by 18%"
- "Managed social media strategy across 5 platforms, growing follower base from 10K to 50K and increasing engagement rate by 150% in 12 months"

Generate the 4 bullet points now:`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = result.response.text();
  const bullets = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => l.replace(/^[•\-*\d.)\s]+/, "").trim())
    .filter((l) => l.length > 10);

  return bullets.slice(0, 4);
}

export async function improveBulletPoint(
  bulletPoint: string
): Promise<{ improvedVersion: string; suggestions: string[] }> {
  const model = flashModel();

  const prompt = `You are an expert resume writer specializing in transforming weak bullet points into powerful, achievement-focused statements.

TASK: Analyze and improve this resume bullet point to make it more impactful and results-oriented.

CURRENT BULLET:
"${bulletPoint}"

ANALYSIS CRITERIA:
1. Does it start with a strong action verb?
2. Does it include quantifiable metrics (numbers, percentages, timeframes)?
3. Does it show impact/results rather than just responsibilities?
4. Is it specific and concrete (avoid vague terms like "various" or "several")?
5. Is it concise (15-25 words ideal)?
6. Does it use past tense consistently?

IMPROVEMENT GUIDELINES:
- Add realistic, quantifiable metrics if missing
- Replace weak verbs with stronger action verbs
- Focus on achievements and outcomes, not just duties
- Make it more specific and concrete
- Ensure it demonstrates measurable value
- Keep it concise and scannable

REQUIRED OUTPUT FORMAT:
IMPROVED:
[Your improved version of the bullet point - make it compelling and results-focused]

SUGGESTIONS:
- [Specific suggestion 1: what to change and why]
- [Specific suggestion 2: what to change and why]
- [Specific suggestion 3: what to change and why]

Provide the improved bullet and 3 actionable suggestions:`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = result.response.text();
  const improvedMatch = text.match(
    /IMPROVED:\s*\n([\s\S]+?)(?=\n\nSUGGESTIONS:|$)/
  );
  const suggestionsMatch = text.match(/SUGGESTIONS:\s*\n([\s\S]+)/);

  const improvedVersion = improvedMatch ? improvedMatch[1].trim() : bulletPoint;
  const suggestions = suggestionsMatch
    ? suggestionsMatch[1]
        .split("\n")
        .map((l) => l.replace(/^[•\-*\s]+/, "").trim())
        .filter((l) => l.length > 0)
    : [];

  return { improvedVersion, suggestions };
}
