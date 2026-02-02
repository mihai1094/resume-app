import {
  Industry,
  QuantificationSuggestion,
  QuantifyAchievementInput,
  SeniorityLevel,
} from "./content-types";
import { extractMetrics, flashModel, safety } from "./shared";

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
  const { statement, role, companySize, industry, seniorityLevel } = input;
  const model = flashModel();

  const prompt = `You are an expert resume writer specializing in transforming vague statements into powerful, quantifiable achievement statements.

TASK: Transform this vague resume statement into 2-3 versions with realistic, quantifiable metrics.

CURRENT STATEMENT:
"${statement}"
${role ? `\nROLE CONTEXT: ${role}` : ""}

${getCompanySizeContext(companySize)}

${getSeniorityGuidance(seniorityLevel)}

INDUSTRY-SPECIFIC METRICS TO CONSIDER:
${getIndustryMetrics(industry)}

TRANSFORMATION GUIDELINES:
1. Add realistic metrics appropriate for the role, seniority, and company size:
   - Percentages (increases, decreases, improvements)
   - Dollar amounts (revenue, cost savings, budget managed)
   - Timeframes (deadlines met, time saved, project duration)
   - Volumes (users, transactions, team size, projects)
   - Scale (company size, market reach, geographic scope)

2. CRITICAL: Metrics must be realistic for the context provided
   - A junior engineer at a startup won't manage $50M budgets
   - An executive at an enterprise won't cite 500% growth rates
   - Match the scale to the role and company size

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

VALIDATION CHECKLIST (apply to each suggestion):
- Are the metrics realistic for the seniority level?
- Are the metrics appropriate for the company size?
- Are the metrics relevant to the industry?
- Would a hiring manager find these numbers believable?

IMPORTANT:
- Provide 2-3 different approaches to quantification
- Each suggestion should use different types of metrics when possible
- Metrics must be realistic and believable for the context
- Explain why each metric strengthens the statement
- Return only text, no markdown formatting

CRITICAL - THESE ARE TEMPLATES FOR USER TO CUSTOMIZE:
The metrics shown are EXAMPLE PLACEHOLDERS based on realistic ranges for this role/seniority.
The user MUST replace these example numbers with their ACTUAL metrics from their real experience.
Use language that makes clear these are suggestions, not facts:
- "Consider adding metrics such as..."
- "If applicable, you might quantify this as..."
- "A realistic metric for this type of work could be [X-Y range] - use your actual figure"
NEVER present fabricated metrics as the user's real achievements.

Generate the quantified suggestions now:`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = result.response.text();

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
