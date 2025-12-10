import {
  AIBaseOptions,
  AnalyzeTextContext,
  Industry,
  SeniorityLevel,
  TextAnalysisResult,
  WritingSuggestion,
} from "./content-types";
import { flashModel, safety } from "./shared";

interface AnalyzeTextOptions extends AIBaseOptions {
  context?: AnalyzeTextContext;
}

/**
 * Get detailed context instructions based on content type
 */
function getContextInstructions(
  context: AnalyzeTextContext,
  seniority?: SeniorityLevel
): string {
  const seniorityContext = seniority
    ? getSeniorityWritingGuidance(seniority)
    : "";

  const instructions: Record<AnalyzeTextContext, string> = {
    "bullet-point": `CONTENT TYPE: Resume Bullet Point
${seniorityContext}

BULLET REQUIREMENTS:
- Start with a strong action verb (Led, Developed, Increased, Optimized, etc.)
- Include quantifiable metrics (percentages, dollar amounts, time saved, team size)
- Length: 15-25 words (concise but comprehensive)
- Focus on impact/results, not responsibilities
- Use past tense consistently (present tense only for current role)
- Avoid passive voice entirely
- Be specific and concrete - avoid vague terms like "helped," "worked on," "various"
- Show the CAR formula: Challenge → Action → Result`,

    summary: `CONTENT TYPE: Professional Summary
${seniorityContext}

SUMMARY REQUIREMENTS:
- 2-3 sentences, 40-60 words total
- Lead with your unique value proposition
- Incorporate 2-3 key skills naturally (not as a list)
- Use confident, active voice
- Be compelling and engaging - this is your elevator pitch
- Use industry-appropriate language and terminology
- Avoid first person pronouns ("I am," "I have")
- Tailor to the target role if one is specified`,

    description: `CONTENT TYPE: Job/Role Description
${seniorityContext}

DESCRIPTION REQUIREMENTS:
- Clear, specific language that explains the role context
- Active voice throughout
- Include relevant details about scope and responsibilities
- Appropriate length (not too wordy, not too sparse)
- Well-structured sentences
- Provides context for the achievements that follow`,
  };

  return instructions[context];
}

/**
 * Get seniority-specific writing guidance
 */
function getSeniorityWritingGuidance(level: SeniorityLevel): string {
  const guidance: Record<SeniorityLevel, string> = {
    entry: `SENIORITY LEVEL: Entry-Level
- Focus on transferable skills and learning agility
- Highlight projects, internships, and academic achievements
- Emphasize potential and eagerness to contribute
- Metrics can be from academic projects or volunteer work
- Action verbs: Assisted, Contributed, Supported, Learned, Developed`,
    mid: `SENIORITY LEVEL: Mid-Level Professional
- Balance individual contributions with team collaboration
- Show progression and increasing responsibility
- Include project ownership and direct impact
- Metrics should show meaningful business impact
- Action verbs: Led, Implemented, Optimized, Delivered, Managed`,
    senior: `SENIORITY LEVEL: Senior Professional
- Emphasize leadership, strategy, and organizational impact
- Show mentorship and team development
- Include cross-functional initiatives
- Metrics should demonstrate significant business outcomes
- Action verbs: Spearheaded, Architected, Transformed, Championed, Drove`,
    executive: `SENIORITY LEVEL: Executive
- Focus on vision, transformation, and P&L impact
- Show board-level achievements and strategic initiatives
- Include organizational change and culture building
- Metrics should be company-wide or division-wide
- Action verbs: Orchestrated, Revolutionized, Pioneered, Established, Scaled`,
  };
  return guidance[level];
}

/**
 * Get industry-specific writing considerations
 */
function getIndustryWritingTips(industry?: Industry): string {
  if (!industry) return "";

  const tips: Record<Industry, string> = {
    technology: `INDUSTRY CONTEXT: Technology
- Use technical terminology appropriately (but explain acronyms)
- Highlight scalability, performance, and innovation
- Include tech stack and methodologies (Agile, DevOps, CI/CD)
- Metrics: uptime, latency, user growth, deployment frequency`,
    finance: `INDUSTRY CONTEXT: Finance
- Emphasize compliance, risk management, and regulatory knowledge
- Use financial terminology accurately
- Highlight analytical and quantitative achievements
- Metrics: AUM, portfolio returns, cost savings, deal sizes`,
    healthcare: `INDUSTRY CONTEXT: Healthcare
- Emphasize patient outcomes and safety
- Use appropriate clinical terminology
- Highlight compliance (HIPAA, regulatory)
- Metrics: patient satisfaction, wait times, error rates`,
    marketing: `INDUSTRY CONTEXT: Marketing
- Focus on campaign results and ROI
- Use marketing metrics appropriately
- Highlight creativity alongside data-driven results
- Metrics: ROAS, conversion rates, engagement, reach`,
    sales: `INDUSTRY CONTEXT: Sales
- Lead with revenue and quota attainment
- Show relationship building and client retention
- Highlight competitive wins and market expansion
- Metrics: revenue, quota %, deal size, pipeline growth`,
    engineering: `INDUSTRY CONTEXT: Engineering
- Emphasize technical problem-solving
- Include project delivery and quality metrics
- Highlight safety and compliance achievements
- Metrics: project timelines, budget adherence, efficiency gains`,
    education: `INDUSTRY CONTEXT: Education
- Focus on student outcomes and engagement
- Highlight curriculum development and innovation
- Include professional development contributions
- Metrics: student performance, graduation rates, program reach`,
    legal: `INDUSTRY CONTEXT: Legal
- Use precise legal terminology
- Emphasize case outcomes and efficiency
- Highlight research and analytical skills
- Metrics: case win rates, settlement amounts, matter completion`,
    consulting: `INDUSTRY CONTEXT: Consulting
- Focus on client impact and deliverables
- Highlight diverse industry experience
- Show thought leadership and methodology expertise
- Metrics: client satisfaction, project delivery, revenue per consultant`,
    manufacturing: `INDUSTRY CONTEXT: Manufacturing
- Emphasize efficiency and quality improvements
- Include lean/Six Sigma terminology if applicable
- Highlight safety records and compliance
- Metrics: production efficiency, defect rates, cost reduction`,
    retail: `INDUSTRY CONTEXT: Retail
- Focus on customer experience and sales performance
- Include inventory and operations management
- Highlight team leadership in fast-paced environments
- Metrics: same-store sales, inventory turnover, customer satisfaction`,
    hospitality: `INDUSTRY CONTEXT: Hospitality
- Emphasize guest experience and service excellence
- Highlight team coordination and problem resolution
- Show brand standards maintenance
- Metrics: guest satisfaction scores, occupancy rates, RevPAR`,
    nonprofit: `INDUSTRY CONTEXT: Nonprofit
- Focus on mission impact and fundraising
- Highlight resource optimization and volunteer engagement
- Show program outcomes and community reach
- Metrics: funds raised, donor retention, program participants`,
    government: `INDUSTRY CONTEXT: Government
- Emphasize public service and policy impact
- Highlight compliance and process improvement
- Show stakeholder communication skills
- Metrics: service delivery, processing times, constituent satisfaction`,
    other: "",
  };
  return tips[industry];
}

export async function analyzeText(
  text: string,
  options: AnalyzeTextOptions = {}
): Promise<TextAnalysisResult> {
  const { context = "bullet-point", industry, seniorityLevel } = options;
  const model = flashModel();

  const prompt = `You are an expert resume writing coach specializing in analyzing and improving resume text to maximize impact and ATS compatibility.

TASK: Analyze the provided resume text and provide a comprehensive evaluation with specific, actionable suggestions for improvement.

${getContextInstructions(context, seniorityLevel)}

${getIndustryWritingTips(industry)}

TEXT TO ANALYZE:
"${text}"

ANALYSIS CRITERIA:

For Bullet Points:
- Starts with strong action verb (not "Responsible for," "Helped," "Worked on")
- Includes quantifiable metrics (percentages, dollar amounts, time saved, team size)
- 15-25 words (concise but comprehensive)
- Focuses on impact/results, not just responsibilities
- Uses past tense consistently (or present for current role)
- Avoids passive voice
- Specific and concrete (no vague terms)
- Follows CAR/STAR formula implicitly

For Summary:
- 2-3 sentences, 40-60 words
- Highlights unique value proposition
- Incorporates key skills naturally
- Uses active voice
- Compelling and engaging
- Industry-appropriate language
- No first-person pronouns

For Job Description:
- Clear and specific
- Active voice throughout
- Relevant details included
- Appropriate length
- Well-structured

SCORING GUIDELINES (0-100):
- 90-100: Excellent, minimal improvements needed - strong verbs, clear metrics, impactful
- 75-89: Good, some enhancements possible - solid but could be stronger
- 60-74: Average, several areas for improvement - missing key elements
- 40-59: Below average, significant improvements needed - weak structure or impact
- 0-39: Poor, major rewrite recommended - fundamental issues

SUGGESTION TYPES:
- weak-verb: Replace with stronger action verb (avoid "helped," "worked on," "responsible for")
- missing-metric: Add quantifiable metrics where impact can be measured
- passive-voice: Convert to active voice for stronger impact
- too-long: Reduce length while maintaining impact (over 25 words for bullets)
- too-short: Expand to include more context or impact (under 10 words for bullets)
- vague: Make more specific and concrete (avoid "various," "multiple," "several")
- improvement: General enhancement opportunity

SEVERITY LEVELS:
- high: Critical issue that significantly impacts effectiveness (weak verbs, no metrics)
- medium: Important issue that should be addressed (minor clarity issues)
- low: Minor improvement that would enhance quality (style polish)

REQUIRED OUTPUT FORMAT:
SCORE: [0-100 integer]

STRENGTHS:
- [Specific strength 1: what the text does well]
- [Specific strength 2: another positive aspect]
- [Continue listing 2-4 key strengths...]

SUGGESTIONS:
1. [TYPE: weak-verb|missing-metric|passive-voice|too-long|too-short|vague|improvement] [SEVERITY: high|medium|low]
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
- If the text is already excellent, acknowledge it and suggest only minor polish

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
