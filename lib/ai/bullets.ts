import { GenerateBulletsInput, Industry, SeniorityLevel } from "./content-types";
import { flashModel, safety } from "./shared";

/**
 * Get seniority-appropriate action verbs and scope
 */
function getSeniorityBulletGuidance(level: SeniorityLevel = "mid"): string {
  const guidance: Record<SeniorityLevel, string> = {
    entry: `SENIORITY: Entry-Level
ACTION VERBS: Assisted, Contributed, Supported, Coordinated, Researched, Analyzed, Prepared, Documented, Participated, Developed
SCOPE: Individual tasks, team support, learning accomplishments, academic/internship projects
METRICS: Smaller scale (10-50% improvements, 5-20 people impacted, $10K-$100K budgets)`,
    mid: `SENIORITY: Mid-Level Professional
ACTION VERBS: Led, Managed, Developed, Implemented, Optimized, Delivered, Designed, Launched, Streamlined, Executed
SCOPE: Project ownership, team collaboration, process improvements, direct client/customer impact
METRICS: Medium scale (20-50% improvements, 10-50 people impacted, $100K-$1M budgets)`,
    senior: `SENIORITY: Senior Professional
ACTION VERBS: Spearheaded, Architected, Directed, Transformed, Championed, Pioneered, Orchestrated, Drove, Established, Scaled
SCOPE: Department initiatives, cross-functional leadership, strategic planning, team building, mentorship
METRICS: Large scale (30-60% improvements, 20-100 people impacted, $1M-$10M budgets)`,
    executive: `SENIORITY: Executive
ACTION VERBS: Revolutionized, Pioneered, Transformed, Established, Orchestrated, Scaled, Founded, Restructured, Envisioned, Mobilized
SCOPE: Company-wide transformation, P&L ownership, board-level initiatives, culture building, strategic vision
METRICS: Enterprise scale (significant % improvements in revenue/cost, 100+ people impacted, $10M+ budgets)`,
  };
  return guidance[level];
}

/**
 * Get industry-specific bullet examples
 */
function getIndustryBulletExamples(industry?: Industry): string {
  if (!industry) {
    return `EXAMPLE BULLETS:
- "Led cross-functional team of 8 engineers to deliver mobile app feature, increasing user engagement by 35% and generating $2M in additional revenue within 6 months"
- "Optimized supply chain processes, reducing operational costs by 22% ($450K annually) while improving delivery times by 18%"
- "Managed social media strategy across 5 platforms, growing follower base from 10K to 50K and increasing engagement rate by 150% in 12 months"`;
  }

  const examples: Record<Industry, string> = {
    technology: `INDUSTRY: Technology
EXAMPLE BULLETS:
- "Architected microservices platform handling 10M daily requests, improving response time by 60% and achieving 99.99% uptime"
- "Led migration of legacy systems to AWS, reducing infrastructure costs by $500K annually while improving deployment frequency from monthly to daily"
- "Developed ML-powered recommendation engine increasing conversion rates by 25% and generating $3M in incremental revenue"`,
    finance: `INDUSTRY: Finance
EXAMPLE BULLETS:
- "Managed $50M fixed income portfolio, achieving 12% annual returns while maintaining risk within VaR limits"
- "Led regulatory compliance initiative achieving zero audit findings across SOX and SEC requirements"
- "Developed quantitative trading models generating $2.5M in alpha while reducing portfolio volatility by 15%"`,
    healthcare: `INDUSTRY: Healthcare
EXAMPLE BULLETS:
- "Implemented electronic health records system for 200-bed hospital, reducing documentation time by 40% and improving patient satisfaction scores by 25%"
- "Led quality improvement initiative reducing hospital readmission rates by 18% and saving $1.2M annually"
- "Managed clinical trials for Phase 3 drug study with 500 patients, achieving 95% protocol compliance"`,
    marketing: `INDUSTRY: Marketing
EXAMPLE BULLETS:
- "Orchestrated integrated marketing campaign across 8 channels, generating 50,000 qualified leads and $5M pipeline in Q4"
- "Increased organic search traffic by 200% through SEO optimization, reducing customer acquisition cost by 35%"
- "Launched brand refresh initiative, improving brand awareness by 45% and driving 30% increase in market share"`,
    sales: `INDUSTRY: Sales
EXAMPLE BULLETS:
- "Exceeded annual quota by 135%, closing $4.2M in new business and maintaining 95% client retention rate"
- "Built and managed sales team of 12, growing territory revenue from $2M to $8M over 3 years"
- "Negotiated enterprise contracts with Fortune 500 clients, averaging $500K deal size with 18-month sales cycle"`,
    engineering: `INDUSTRY: Engineering
EXAMPLE BULLETS:
- "Directed $15M infrastructure project delivered 2 months ahead of schedule and 10% under budget"
- "Implemented lean manufacturing processes reducing production defects by 45% and cycle time by 30%"
- "Led safety initiative achieving 500 consecutive days without recordable incidents across 3 facilities"`,
    education: `INDUSTRY: Education
EXAMPLE BULLETS:
- "Developed STEM curriculum adopted by 50 schools, improving student test scores by 25% and engagement by 40%"
- "Secured $2M in grant funding for educational technology initiative benefiting 5,000 students"
- "Led professional development program training 200 educators, achieving 95% satisfaction rating"`,
    legal: `INDUSTRY: Legal
EXAMPLE BULLETS:
- "Managed portfolio of 75+ litigation matters, achieving favorable outcomes in 85% of cases"
- "Led due diligence on $500M M&A transaction, identifying $15M in potential liabilities"
- "Reduced contract review time by 50% through implementing AI-assisted document analysis"`,
    consulting: `INDUSTRY: Consulting
EXAMPLE BULLETS:
- "Led digital transformation engagement for Fortune 500 client, delivering $20M in annual cost savings"
- "Managed team of 8 consultants across 5 concurrent projects, achieving 95% on-time delivery rate"
- "Developed proprietary methodology adopted firm-wide, improving project margins by 15%"`,
    manufacturing: `INDUSTRY: Manufacturing
EXAMPLE BULLETS:
- "Implemented Six Sigma initiative reducing defect rate from 500 ppm to 50 ppm, saving $2M annually"
- "Led automation project increasing production capacity by 40% while reducing labor costs by 25%"
- "Managed supply chain optimization achieving 99.5% on-time delivery and $3M inventory reduction"`,
    retail: `INDUSTRY: Retail
EXAMPLE BULLETS:
- "Increased same-store sales by 15% through customer experience improvements and staff training programs"
- "Reduced shrinkage by 35% through implementation of loss prevention technology and procedures"
- "Managed merchandising strategy for 50 locations, improving inventory turnover by 20%"`,
    hospitality: `INDUSTRY: Hospitality
EXAMPLE BULLETS:
- "Improved guest satisfaction scores from 4.2 to 4.8 stars, driving 25% increase in repeat bookings"
- "Managed $5M renovation project completed on-time, contributing to 20% RevPAR improvement"
- "Led team of 50 staff achieving lowest turnover rate in region at 15% annually"`,
    nonprofit: `INDUSTRY: Nonprofit
EXAMPLE BULLETS:
- "Increased annual fundraising revenue by 40% to $3M through donor cultivation and grant writing"
- "Expanded program reach from 500 to 2,000 beneficiaries while reducing cost-per-participant by 25%"
- "Built volunteer network of 200+ contributors, increasing service capacity by 60%"`,
    government: `INDUSTRY: Government
EXAMPLE BULLETS:
- "Streamlined permit processing reducing average review time from 45 to 15 days while maintaining compliance"
- "Led digital transformation initiative serving 500,000 citizens, improving service satisfaction by 35%"
- "Managed $10M budget achieving 100% fund utilization with zero audit findings"`,
    other: `EXAMPLE BULLETS:
- "Led cross-functional team of 8 to deliver major initiative, increasing efficiency by 35% and generating $2M in value"
- "Optimized operational processes, reducing costs by 22% while improving quality metrics by 18%"
- "Managed stakeholder relationships across 5 departments, achieving 95% project delivery rate"`,
  };
  return examples[industry];
}

export async function generateBulletPoints(
  input: GenerateBulletsInput
): Promise<string[]> {
  const { position, company, industry, seniorityLevel, customPrompt } = input;
  const model = flashModel();

  const prompt = `You are an expert resume writer specializing in creating impactful, results-oriented bullet points that pass ATS systems and impress recruiters.

TASK: Generate exactly 4 professional, achievement-focused resume bullet points for a ${position} at ${company}${
    industry ? ` in the ${industry} industry` : ""
  }.

${getSeniorityBulletGuidance(seniorityLevel)}

CRITICAL REQUIREMENTS:
1. Start each bullet with a strong action verb appropriate for the seniority level
2. Include realistic, quantifiable metrics scaled to the seniority level and company context
3. Focus on impact and results, not just responsibilities
4. Use past tense throughout
5. Keep each bullet to 15-25 words (1-2 lines maximum)
6. Be specific and avoid vague language ("various," "multiple," "helped with")
7. Use industry-appropriate terminology
8. Ensure each bullet demonstrates measurable value
9. Vary the types of achievements (revenue, efficiency, team, quality, etc.)

FORMAT:
- Return ONLY the 4 bullet points
- One bullet per line
- No bullets, numbers, or dashes at the start
- No introductory text or explanations

${
  customPrompt
    ? `ADDITIONAL CONTEXT:\n${customPrompt}\n\nIncorporate this context naturally into the bullet points.`
    : ""
}

${getIndustryBulletExamples(industry)}

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

interface ImproveBulletOptions {
  industry?: Industry;
  seniorityLevel?: SeniorityLevel;
  role?: string;
}

export async function improveBulletPoint(
  bulletPoint: string,
  options: ImproveBulletOptions = {}
): Promise<{ improvedVersion: string; suggestions: string[] }> {
  const { industry, seniorityLevel, role } = options;
  const model = flashModel();

  const prompt = `You are an expert resume writer specializing in transforming weak bullet points into powerful, achievement-focused statements.

TASK: Analyze and improve this resume bullet point to make it more impactful and results-oriented.

CURRENT BULLET:
"${bulletPoint}"
${role ? `\nROLE CONTEXT: ${role}` : ""}

${seniorityLevel ? getSeniorityBulletGuidance(seniorityLevel) : ""}

${industry ? getIndustryBulletExamples(industry) : ""}

ANALYSIS CRITERIA:
1. Does it start with a strong action verb (not "Responsible for," "Helped," "Worked on")?
2. Does it include quantifiable metrics (numbers, percentages, timeframes, dollar amounts)?
3. Does it show impact/results rather than just responsibilities?
4. Is it specific and concrete (avoid vague terms like "various," "several," "multiple")?
5. Is it concise (15-25 words ideal)?
6. Does it use past tense consistently?
7. Does it follow the CAR formula: Challenge → Action → Result?

IMPROVEMENT GUIDELINES:
- Add realistic, quantifiable metrics if missing (scaled appropriately to role/seniority)
- Replace weak verbs with stronger action verbs
- Focus on achievements and outcomes, not just duties
- Make it more specific and concrete
- Ensure it demonstrates measurable value
- Keep it concise and scannable
- Use industry-appropriate terminology if industry context is provided

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
