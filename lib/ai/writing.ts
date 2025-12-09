import {
  AnalyzeTextContext,
  TextAnalysisResult,
  WritingSuggestion,
} from "./content-types";
import { flashModel, safety } from "./shared";

export async function analyzeText(
  text: string,
  context: AnalyzeTextContext = "bullet-point"
): Promise<TextAnalysisResult> {
  const model = flashModel();
  const contextInstructions: Record<AnalyzeTextContext, string> = {
    "bullet-point": `This is a resume bullet. Start with action verb, include metrics, 15-25 words, impact/results, past tense, avoid passive.`,
    summary: `2-3 sentences, 40-60 words, highlight value, key skills, active voice, compelling.`,
    description: `Job description: be clear, specific, active voice, relevant details, appropriate length.`,
  };

  const prompt = `You are an expert resume writing coach specializing in analyzing and improving resume text to maximize impact and ATS compatibility.

TASK: Analyze the provided resume text and provide a comprehensive evaluation with specific, actionable suggestions for improvement.

CONTEXT: ${contextInstructions[context]}

TEXT TO ANALYZE:
"${text}"

ANALYSIS CRITERIA:

For Bullet Points:
- Starts with strong action verb
- Includes quantifiable metrics
- 15-25 words (concise but comprehensive)
- Focuses on impact/results, not just responsibilities
- Uses past tense consistently
- Avoids passive voice
- Specific and concrete (no vague terms)

For Summary:
- 2-3 sentences, 40-60 words
- Highlights unique value proposition
- Incorporates key skills naturally
- Uses active voice
- Compelling and engaging
- Industry-appropriate language

For Job Description:
- Clear and specific
- Active voice throughout
- Relevant details included
- Appropriate length
- Well-structured

SCORING GUIDELINES (0-100):
- 90-100: Excellent, minimal improvements needed
- 75-89: Good, some enhancements possible
- 60-74: Average, several areas for improvement
- 40-59: Below average, significant improvements needed
- 0-39: Poor, major rewrite recommended

SUGGESTION TYPES:
- weak-verb: Replace with stronger action verb
- missing-metric: Add quantifiable metrics
- passive-voice: Convert to active voice
- too-long: Reduce length while maintaining impact
- vague: Make more specific and concrete
- improvement: General enhancement opportunity

SEVERITY LEVELS:
- high: Critical issue that significantly impacts effectiveness
- medium: Important issue that should be addressed
- low: Minor improvement that would enhance quality

REQUIRED OUTPUT FORMAT:
SCORE: [0-100 integer]

STRENGTHS:
- [Specific strength 1: what the text does well]
- [Specific strength 2: another positive aspect]
- [Continue listing 2-4 key strengths...]

SUGGESTIONS:
1. [TYPE: weak-verb|missing-metric|passive-voice|too-long|vague|improvement] [SEVERITY: high|medium|low]
   ISSUE: [Specific problem identified in the text]
   FIX: [Specific action to take to fix the issue]
   EXAMPLE: [Before: original text] → [After: improved version]

2. [Continue with additional suggestions...]

IMPORTANT:
- Provide specific, actionable suggestions
- Include before/after examples when helpful
- Prioritize high-severity issues
- Be constructive and clear
- Focus on improvements that will have the most impact

Analyze the text and provide comprehensive feedback now:`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const responseText = result.response.text();
  console.log("[AI] analyzeText raw response:", responseText.substring(0, 800));

  const suggestions: WritingSuggestion[] = [];
  let overallScore = 50;
  const strengths: string[] = [];

  const scoreMatch = responseText.match(/SCORE:\s*(\d+)/i);
  if (scoreMatch)
    overallScore = Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10)));

  const strengthsSection = responseText.match(
    /STRENGTHS:([\s\S]*?)(?:SUGGESTIONS:|$)/i
  );
  if (strengthsSection) {
    strengths.push(
      ...strengthsSection[1]
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.startsWith("-") || l.startsWith("•"))
        .map((l) => l.replace(/^[-•]\s*/, "").trim())
        .filter((l) => l.length > 0)
    );
  }

  const suggestionsSection = responseText.match(/SUGGESTIONS:([\s\S]*?)$/i);
  if (suggestionsSection) {
    const blocks = suggestionsSection[1]
      .split(/\n\d+\.\s+/)
      .filter((s) => s.trim());
    blocks.forEach((block, idx) => {
      const typeMatch = block.match(/\[TYPE:\s*([\w-]+)\]/i);
      const severityMatch = block.match(/\[SEVERITY:\s*(high|medium|low)\]/i);
      const issueMatch = block.match(/ISSUE:\s*([^\n]+)/i);
      const fixMatch = block.match(/FIX:\s*([^\n]+)/i);
      const exampleMatch = block.match(/EXAMPLE:\s*([^\n]+)/i);
      if (typeMatch && issueMatch && fixMatch) {
        suggestions.push({
          id: String(idx + 1),
          type: typeMatch[1] as WritingSuggestion["type"],
          severity: (severityMatch?.[1] ||
            "medium") as WritingSuggestion["severity"],
          title: issueMatch[1].trim(),
          description: issueMatch[1].trim(),
          suggestion: fixMatch[1].trim(),
          improved: exampleMatch?.[1]?.trim(),
        });
      }
    });
  }

  return { suggestions, overallScore, strengths };
}
