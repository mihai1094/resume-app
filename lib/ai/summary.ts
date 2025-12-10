import {
  GenerateSummaryInput,
  Industry,
  SeniorityLevel,
  Tone,
} from "./content-types";
import { flashModel, safety } from "./shared";

/**
 * Get seniority-specific summary guidance
 */
function getSenioritySummaryGuidance(level: SeniorityLevel = "mid"): string {
  const guidance: Record<SeniorityLevel, string> = {
    entry: `SENIORITY: Entry-Level
POSITIONING:
- Lead with education, relevant coursework, or certifications
- Emphasize eagerness to learn and contribute
- Highlight internships, projects, and transferable skills
- Focus on potential and adaptability
LANGUAGE:
- "Recent graduate," "Aspiring," "Motivated"
- Focus on foundational skills and quick learning
- Mention relevant academic achievements or projects`,
    mid: `SENIORITY: Mid-Level Professional
POSITIONING:
- Lead with years of experience and proven track record
- Highlight specific achievements and specializations
- Show career progression and increasing responsibility
- Balance technical skills with collaboration
LANGUAGE:
- "X years of experience," "Proven track record," "Demonstrated ability"
- Focus on measurable outcomes and specific domains
- Mention leadership of projects or small teams`,
    senior: `SENIORITY: Senior Professional
POSITIONING:
- Emphasize leadership, strategy, and organizational impact
- Highlight team building, mentorship, and cross-functional collaboration
- Show expertise in driving initiatives and transformations
- Focus on business outcomes and stakeholder management
LANGUAGE:
- "Senior," "Seasoned," "Strategic leader"
- Focus on organizational impact and leadership scope
- Mention department-level or company-wide achievements`,
    executive: `SENIORITY: Executive
POSITIONING:
- Lead with vision, transformation, and P&L impact
- Emphasize C-suite or board-level experience
- Highlight organizational change and culture building
- Focus on business growth, market positioning, or turnarounds
LANGUAGE:
- "Executive," "Transformational leader," "Visionary"
- Focus on enterprise-wide impact and strategic vision
- Mention revenue responsibility, headcount managed, or market impact`,
  };
  return guidance[level];
}

/**
 * Get industry-specific summary considerations
 */
function getIndustrySummaryTips(industry?: Industry): string {
  if (!industry) return "";

  const tips: Record<Industry, string> = {
    technology: `INDUSTRY: Technology
KEYWORDS TO CONSIDER: scalable systems, agile methodologies, cloud architecture, user experience, data-driven, DevOps, digital transformation
METRICS TO HIGHLIGHT: system performance, user growth, deployment velocity, platform scale`,
    finance: `INDUSTRY: Finance
KEYWORDS TO CONSIDER: risk management, regulatory compliance, portfolio management, financial modeling, quantitative analysis
METRICS TO HIGHLIGHT: AUM, portfolio returns, cost optimization, deal value`,
    healthcare: `INDUSTRY: Healthcare
KEYWORDS TO CONSIDER: patient outcomes, clinical excellence, regulatory compliance, quality improvement, evidence-based practice
METRICS TO HIGHLIGHT: patient satisfaction, quality metrics, operational efficiency, compliance rates`,
    marketing: `INDUSTRY: Marketing
KEYWORDS TO CONSIDER: brand strategy, digital marketing, campaign optimization, content strategy, customer acquisition
METRICS TO HIGHLIGHT: ROI, conversion rates, audience growth, campaign performance`,
    sales: `INDUSTRY: Sales
KEYWORDS TO CONSIDER: revenue growth, client relationships, consultative selling, pipeline management, negotiation
METRICS TO HIGHLIGHT: quota attainment, revenue generated, deal size, client retention`,
    engineering: `INDUSTRY: Engineering
KEYWORDS TO CONSIDER: project delivery, technical leadership, process optimization, quality assurance, safety compliance
METRICS TO HIGHLIGHT: project outcomes, efficiency gains, cost savings, safety records`,
    education: `INDUSTRY: Education
KEYWORDS TO CONSIDER: curriculum development, student engagement, educational technology, program development, assessment
METRICS TO HIGHLIGHT: student outcomes, program reach, grant funding, satisfaction scores`,
    legal: `INDUSTRY: Legal
KEYWORDS TO CONSIDER: litigation, corporate law, regulatory expertise, contract negotiation, legal strategy
METRICS TO HIGHLIGHT: case outcomes, deal value, matter volume, efficiency improvements`,
    consulting: `INDUSTRY: Consulting
KEYWORDS TO CONSIDER: client engagement, strategic advisory, change management, business transformation, thought leadership
METRICS TO HIGHLIGHT: client impact, project delivery, revenue contribution, practice development`,
    manufacturing: `INDUSTRY: Manufacturing
KEYWORDS TO CONSIDER: lean manufacturing, process optimization, quality management, supply chain, operational excellence
METRICS TO HIGHLIGHT: production efficiency, quality improvements, cost reduction, safety records`,
    retail: `INDUSTRY: Retail
KEYWORDS TO CONSIDER: merchandising, customer experience, inventory management, sales performance, omnichannel
METRICS TO HIGHLIGHT: sales growth, customer satisfaction, inventory turnover, operational efficiency`,
    hospitality: `INDUSTRY: Hospitality
KEYWORDS TO CONSIDER: guest experience, service excellence, operations management, revenue management, team leadership
METRICS TO HIGHLIGHT: guest satisfaction, RevPAR, operational metrics, team performance`,
    nonprofit: `INDUSTRY: Nonprofit
KEYWORDS TO CONSIDER: mission-driven, fundraising, stakeholder engagement, program development, community impact
METRICS TO HIGHLIGHT: funds raised, program impact, community reach, volunteer engagement`,
    government: `INDUSTRY: Government
KEYWORDS TO CONSIDER: public service, policy implementation, stakeholder communication, compliance, process improvement
METRICS TO HIGHLIGHT: service delivery, efficiency gains, constituent satisfaction, compliance rates`,
    other: "",
  };
  return tips[industry] ? `\n${tips[industry]}` : "";
}

export async function generateSummary(
  input: GenerateSummaryInput
): Promise<string> {
  const model = flashModel();
  const toneInstructions: Record<Tone, string> = {
    professional: "formal, polished, achievement-oriented",
    creative: "engaging, memorable, dynamic",
    technical: "precise, expertise-focused, technical",
  };

  const {
    firstName,
    lastName,
    jobTitle,
    yearsOfExperience,
    keySkills,
    recentPosition,
    recentCompany,
    tone = "professional",
    industry,
    seniorityLevel,
  } = input;

  const prompt = `You are an expert resume writer specializing in crafting compelling professional summaries that capture attention and pass ATS systems.

TASK: Write a ${toneInstructions[tone]} professional summary for a resume.

CANDIDATE PROFILE:
- Name: ${firstName} ${lastName}
- Job Title: ${jobTitle || "Professional"}
${yearsOfExperience ? `- Years of Experience: ${yearsOfExperience} years` : ""}
- Key Skills: ${keySkills.slice(0, 5).join(", ")}
${
  recentPosition
    ? `- Recent Position: ${recentPosition}${
        recentCompany ? ` at ${recentCompany}` : ""
      }`
    : ""
}

${getSenioritySummaryGuidance(seniorityLevel)}
${getIndustrySummaryTips(industry)}

CRITICAL REQUIREMENTS:
1. Length: Exactly 2-3 sentences (40-60 words total)
2. Structure based on seniority:
   ${
     seniorityLevel === "entry"
       ? "- First sentence: Education/background and career aspiration\n   - Second sentence: Relevant skills and eagerness to contribute"
       : seniorityLevel === "executive"
       ? "- First sentence: Executive leadership scope and strategic impact\n   - Second sentence: Transformation achievements and business outcomes"
       : "- First sentence: Lead with years of experience and core expertise\n   - Second sentence: Highlight key achievements or unique value proposition"
   }
3. Tone: ${
    tone === "technical"
      ? "Precise, expertise-focused, emphasize technical domains and certifications"
      : tone === "creative"
      ? "Engaging, memorable, dynamic, showcase creativity and innovation"
      : "Formal, polished, achievement-oriented, professional and confident"
  }
4. Use active voice throughout
5. Naturally incorporate 2-3 key skills from the list above
6. Focus on impact and results, not just experience
7. Avoid generic phrases like "team player," "hard worker," "detail-oriented"
8. Avoid first-person pronouns ("I am," "I have")
9. Make it specific to this candidate's background and seniority level

TONE-SPECIFIC GUIDELINES:
${
  tone === "technical"
    ? "- Emphasize technical expertise, certifications, and specialized domains\n- Use industry-specific terminology appropriately\n- Highlight technical achievements and problem-solving capabilities"
    : tone === "creative"
    ? "- Make it memorable and engaging\n- Show personality while maintaining professionalism\n- Highlight creative achievements and innovative thinking"
    : "- Maintain formal, polished language\n- Emphasize leadership, achievements, and career progression\n- Use professional terminology"
}

EXAMPLE SUMMARIES BY SENIORITY:

Entry-Level:
"Recent Computer Science graduate with strong foundation in Python, Java, and cloud technologies. Eager to apply analytical problem-solving skills and passion for clean code to contribute to innovative software development teams."

Mid-Level:
"Software Engineer with 5 years of experience building scalable web applications and leading agile development teams. Proven track record of delivering high-impact features that increased user engagement by 40% and reduced load times by 60%."

Senior:
"Strategic technology leader with 12 years driving digital transformation initiatives across Fortune 500 organizations. Expert in architecting enterprise solutions and building high-performing teams that consistently exceed delivery targets while reducing technical debt."

Executive:
"Transformational CTO with 20+ years leading technology organizations through periods of rapid growth and market disruption. Track record of scaling engineering teams from 50 to 500+ while delivering $100M+ in technology-enabled revenue growth."

OUTPUT FORMAT:
Return ONLY the summary text, no labels, no explanations, just the 2-3 sentence summary.

Generate the professional summary now:`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  return result.response.text().trim();
}
