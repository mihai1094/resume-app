import { QuantificationSuggestion } from "./content-types";
import { extractMetrics, flashModel, safety } from "./shared";

export async function quantifyAchievement(
  statement: string
): Promise<QuantificationSuggestion[]> {
  const model = flashModel();
  const prompt = `You are an expert resume writer specializing in transforming vague statements into powerful, quantifiable achievement statements.

TASK: Transform this vague resume statement into 2-3 versions with realistic, quantifiable metrics.

CURRENT STATEMENT:
"${statement}"

TRANSFORMATION GUIDELINES:
1. Add realistic metrics that make sense for the role/industry:
   - Percentages (increases, decreases, improvements)
   - Dollar amounts (revenue, cost savings, budget managed)
   - Timeframes (deadlines met, time saved, project duration)
   - Volumes (users, transactions, team size, projects)
   - Scale (company size, market reach, geographic scope)

2. Maintain factual accuracy - metrics should be believable for the context
3. Use strong action verbs
4. Focus on impact and results
5. Keep it concise (15-25 words ideal)
6. Make it specific and concrete

APPROACHES TO QUANTIFICATION:
- Before/After comparisons
- Percentage improvements
- Dollar value impact
- Time efficiency gains
- Scale/volume metrics
- Team/project size
- Market/geographic reach

REQUIRED OUTPUT FORMAT:
SUGGESTION 1:
[Improved statement with realistic, quantifiable metrics]
WHY: [Explanation of what metrics were added and why they strengthen the statement]

SUGGESTION 2:
[Alternative improved statement with different metrics/approach]
WHY: [Explanation of this approach and its benefits]

SUGGESTION 3:
[Third alternative if applicable]
WHY: [Explanation of this approach]

IMPORTANT:
- Provide 2-3 different approaches to quantification
- Each suggestion should use different types of metrics when possible
- Metrics must be realistic and believable
- Explain why each metric strengthens the statement
- Return only text, no markdown formatting

Generate the quantified suggestions now:`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = result.response.text();
  console.log("[AI] quantifyAchievement raw response:", text.substring(0, 500));

  const suggestions: QuantificationSuggestion[] = [];
  const blocks = text.split(/SUGGESTION \d+:/i).filter((s) => s.trim());

  blocks.slice(0, 3).forEach((block, i) => {
    const parts = block.split(/WHY:/i);
    if (parts.length >= 2) {
      const example = parts[0].trim();
      const reasoning = parts[1].trim();
      if (example && reasoning) {
        suggestions.push({
          id: String(i + 1),
          approach: `Quantification approach ${i + 1}`,
          example,
          metrics: extractMetrics(example),
          reasoning,
        });
      }
    }
  });

  return suggestions;
}
