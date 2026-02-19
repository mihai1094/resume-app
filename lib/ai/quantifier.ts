import {
  Industry,
  QuantificationSuggestion,
  QuantifyAchievementInput,
  SeniorityLevel,
} from "./content-types";
import {
  extractMetrics,
  flashModelJson,
  parseAIJsonResponse,
  safety,
  validateAIResponse,
} from "./shared";
import { buildSystemInstruction, PROMPT_VERSION, wrapTag } from "./prompt-utils";

/**
 * Get industry-specific metric guidance
 */
function getIndustryMetrics(industry?: Industry): string {
  const metrics: Record<Industry, string> = {
    technology:
      "- System uptime/reliability (99.9%)\n- Code coverage, bug reduction\n- API response times, latency improvements\n- User adoption, DAU/MAU growth\n- Deployment frequency, release cycles",
    finance:
      "- Portfolio returns, AUM growth\n- Risk reduction percentages\n- Transaction processing volumes\n- Compliance audit results\n- Cost savings, revenue impact",
    healthcare:
      "- Patient outcomes, satisfaction scores\n- Wait time reductions\n- Error rate improvements\n- Compliance rates\n- Cost per patient metrics",
    marketing:
      "- Campaign ROI, ROAS\n- Lead generation numbers\n- Conversion rate improvements\n- Brand awareness metrics\n- Customer acquisition cost",
    sales:
      "- Revenue generated, quota attainment\n- Deal size, win rates\n- Pipeline growth\n- Customer retention rates\n- Territory expansion",
    engineering:
      "- Project delivery timelines\n- Budget adherence\n- Safety incident rates\n- Efficiency improvements\n- Quality metrics (defect rates)",
    education:
      "- Student performance improvements\n- Graduation/retention rates\n- Program enrollment growth\n- Grant funding secured\n- Curriculum reach",
    legal:
      "- Case win rates\n- Settlement amounts\n- Billable hours efficiency\n- Client retention\n- Matter completion times",
    consulting:
      "- Client satisfaction scores\n- Project delivery rates\n- Revenue per consultant\n- Repeat business percentage\n- Implementation success rates",
    manufacturing:
      "- Production efficiency gains\n- Defect rate reductions\n- Inventory optimization\n- Safety improvements\n- Cost per unit reductions",
    retail:
      "- Same-store sales growth\n- Inventory turnover\n- Customer satisfaction scores\n- Shrinkage reduction\n- Average transaction value",
    hospitality:
      "- Guest satisfaction scores\n- Occupancy rates\n- RevPAR improvements\n- Staff retention\n- Service time metrics",
    nonprofit:
      "- Funds raised, donor retention\n- Program impact metrics\n- Volunteer engagement\n- Community reach\n- Cost efficiency ratios",
    government:
      "- Service delivery improvements\n- Budget efficiency\n- Constituent satisfaction\n- Processing time reductions\n- Compliance rates",
    other:
      "- Efficiency improvements\n- Cost savings\n- Quality metrics\n- Team/project scale\n- Timeline achievements",
  };
  return industry ? metrics[industry] : metrics.other;
}

/**
 * Get seniority-appropriate metric ranges
 */
function getSeniorityGuidance(level?: SeniorityLevel): string {
  const guidance: Record<SeniorityLevel, string> = {
    entry:
      "SCOPE: Individual contributor metrics\n- Team sizes: 1-5 people\n- Budgets: Under $100K\n- Improvements: 10-30%\n- Projects: 2-5 concurrent",
    mid: "SCOPE: Team/project-level metrics\n- Team sizes: 5-15 people\n- Budgets: $100K-$1M\n- Improvements: 20-50%\n- Projects: 5-10 concurrent",
    senior:
      "SCOPE: Department/organization metrics\n- Team sizes: 10-50 people\n- Budgets: $1M-$10M\n- Improvements: 30-60%\n- Projects: Multiple strategic initiatives",
    executive:
      "SCOPE: Company-wide/P&L metrics\n- Team sizes: 50+ people\n- Budgets: $10M+\n- Revenue impact: Millions to billions\n- Strategic transformations",
  };
  return level ? guidance[level] : guidance.mid;
}

/**
 * Get company size context for realistic metrics
 */
function getCompanySizeContext(
  size?: "startup" | "small" | "medium" | "large" | "enterprise"
): string {
  const context: Record<string, string> = {
    startup:
      "COMPANY CONTEXT: Startup (1-50 employees)\n- Revenue metrics in thousands to low millions\n- Percentage growth can be high (100%+) due to small base\n- Team sizes typically 1-10\n- Budgets modest but impactful",
    small:
      "COMPANY CONTEXT: Small business (50-200 employees)\n- Revenue in millions\n- Growth rates 20-50% realistic\n- Teams 5-20 people\n- Budgets $50K-$500K typical",
    medium:
      "COMPANY CONTEXT: Mid-size company (200-1000 employees)\n- Revenue tens of millions\n- Growth rates 10-30% realistic\n- Teams 10-50 people\n- Budgets $500K-$5M typical",
    large:
      "COMPANY CONTEXT: Large company (1000-10000 employees)\n- Revenue hundreds of millions\n- Growth rates 5-20% realistic\n- Teams 20-100 people\n- Budgets $1M-$50M typical",
    enterprise:
      "COMPANY CONTEXT: Enterprise (10000+ employees)\n- Revenue in billions\n- Growth rates 3-15% realistic\n- Teams can be 50-500+ people\n- Budgets $10M-$500M+ typical",
  };
  return size ? context[size] : context.medium;
}

export async function quantifyAchievement(
  input: QuantifyAchievementInput
): Promise<QuantificationSuggestion[]> {
  const {
    statement,
    role,
    companySize,
    industry,
    seniorityLevel,
    jobDescription,
  } = input;
  const model = flashModelJson();
  const systemInstruction = buildSystemInstruction(
    "Expert resume writer",
    "Provide quantification suggestions with placeholders and return JSON only."
  );

  type QuantifyResponse = {
    suggestions: Array<{
      approach: string;
      example: string;
      why: string;
    }>;
  };

  const isValidResponse = (data: unknown): data is QuantifyResponse => {
    if (!data || typeof data !== "object") return false;
    const obj = data as QuantifyResponse;
    return (
      Array.isArray(obj.suggestions) &&
      obj.suggestions.every(
        (s) =>
          typeof s === "object" &&
          s !== null &&
          typeof (s as Record<string, unknown>).approach === "string"
      )
    );
  };

  const targetJobDescription = jobDescription
    ? jobDescription.trim().replace(/\s+/g, " ").slice(0, 1000)
    : "";

  const prompt = `PROMPT_VERSION: ${PROMPT_VERSION}
Add realistic metrics to this achievement statement. Return 2-3 versions, each using a different metric type (e.g. time savings, revenue impact, scale, quality).

STATEMENT:
${wrapTag("text", statement)}
${role ? `\nROLE: ${wrapTag("role", role)}` : ""}
${getCompanySizeContext(companySize)}
${getSeniorityGuidance(seniorityLevel)}
${industry ? `\nINDUSTRY METRICS TO DRAW FROM:\n${getIndustryMetrics(industry)}` : ""}
${targetJobDescription ? `\nTARGET JOB DESCRIPTION (for relevance):\n${wrapTag("job_description", targetJobDescription)}` : ""}

RULES:
- Use realistic number ranges (e.g. "20–40%", "$50K–$150K") scaled to seniority and company size
- Do NOT use [X%] placeholders — give actual range estimates the user can edit
- Each suggestion must use a different metric approach
- Label each with a short approach name like "Time savings", "Revenue impact", "Scale", "Quality"
- Keep bullets 15-25 words, strong action verb, past tense
- Do not invent activities not implied by the original statement

Return JSON:
{
  "suggestions": [
    {
      "approach": "short label like 'Time savings' or 'Revenue impact'",
      "example": "bullet with realistic metric range",
      "why": "one sentence: why this metric fits this achievement"
    }
  ]
}

Return ONLY valid JSON.`;

  const result = await model.generateContent({
    systemInstruction,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = validateAIResponse(
    result.response.text(),
    "quantifyAchievement"
  );
  const parsed = parseAIJsonResponse<QuantifyResponse>(
    text,
    "quantifyAchievement",
    isValidResponse
  );

  const suggestions: QuantificationSuggestion[] = (parsed.suggestions || [])
    .slice(0, 3)
    .map((suggestion, i) => ({
      id: String(i + 1),
      approach: suggestion.approach || `Approach ${i + 1}`,
      example: suggestion.example,
      metrics: extractMetrics(suggestion.example),
      reasoning: suggestion.why,
    }));

  return suggestions;
}
