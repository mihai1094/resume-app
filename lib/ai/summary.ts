import {
  GenerateSummaryInput,
  Industry,
  SeniorityLevel,
  SummaryLength,
  Tone,
} from "./content-types";
import { flashModel, safety } from "./shared";
import { buildSystemInstruction, PROMPT_VERSION, wrapTag } from "./prompt-utils";

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
  const systemInstruction = buildSystemInstruction(
    "Senior resume strategist and editor",
    "Write ATS-friendly summaries that are specific, factual, and free of cliches."
  );
  const toneInstructions: Record<Tone, string> = {
    professional: "polished and confident",
    concise: "direct, crisp, minimal filler",
    impactful: "outcome-focused with strong action language",
    friendly: "human and approachable while still professional",
    creative: "engaging and memorable without being informal",
    technical: "precise, domain-specific, and expertise-focused",
  };
  const lengthRules: Record<
    SummaryLength,
    { words: string; sentences: string }
  > = {
    short: {
      words: "35-50 words",
      sentences: "2 sentences",
    },
    medium: {
      words: "50-75 words",
      sentences: "2-3 sentences",
    },
    long: {
      words: "75-100 words",
      sentences: "3-4 sentences",
    },
  };

  const {
    firstName,
    lastName,
    jobTitle,
    jobDescription,
    yearsOfExperience,
    keySkills,
    recentPosition,
    recentCompany,
    experienceHighlights = [],
    draftSummary,
    tone = "professional",
    length = "medium",
    industry,
    seniorityLevel,
  } = input;
  const hasDraftSummary = !!draftSummary?.trim();
  const selectedLength = lengthRules[length];
  const topSkills = keySkills
    .map((skill) => skill?.trim())
    .filter(Boolean)
    .slice(0, 8);
  const topHighlights = experienceHighlights
    .map((item) => item?.trim())
    .filter(Boolean)
    .slice(0, 4);
  const fullName = `${firstName} ${lastName}`.trim() || "Candidate";
  const roleHeadline = jobTitle?.trim() || recentPosition?.trim() || "Professional";
  const recentRoleWithCompany = recentPosition
    ? `${recentPosition}${recentCompany ? ` at ${recentCompany}` : ""}`
    : "";
  const targetJobDescription = jobDescription
    ? jobDescription.trim().replace(/\s+/g, " ").slice(0, 1200)
    : "";
  const yearsLine = yearsOfExperience
    ? `${yearsOfExperience} years`
    : "Not specified";
  const skillsLine = topSkills.length > 0 ? topSkills.join(", ") : "Not specified";
  const highlightsBlock =
    topHighlights.length > 0
      ? topHighlights.map((item) => `- ${item}`).join("\n")
      : "- Not specified";

  const prompt = `PROMPT_VERSION: ${PROMPT_VERSION}
TASK MODE: ${hasDraftSummary ? "POLISH_EXISTING_SUMMARY" : "GENERATE_NEW_SUMMARY"}
TASK: Produce a resume summary that is concrete, specific, and useful for recruiters.

PROFILE FACTS (SOURCE OF TRUTH):
- Name: ${wrapTag("text", fullName)}
- Headline Role: ${wrapTag("text", roleHeadline)}
- Years of Experience: ${yearsLine}
- Most Recent Role: ${wrapTag("context", recentRoleWithCompany || "Not specified")}
- Key Skills: ${wrapTag("context", skillsLine)}
- Experience Highlights:
${wrapTag("context", highlightsBlock)}
${targetJobDescription ? `- Target Job Description:\n${wrapTag("job_description", targetJobDescription)}` : ""}
${hasDraftSummary ? `\nCURRENT USER DRAFT:\n${wrapTag("text", draftSummary!.trim())}` : ""}

${getSenioritySummaryGuidance(seniorityLevel)}
${getIndustrySummaryTips(industry)}

CRITICAL REQUIREMENTS:
1. Length: ${selectedLength.sentences}, ${selectedLength.words}
2. Structure based on seniority:
   ${
     seniorityLevel === "entry"
       ? "- First sentence: Education/background and career aspiration\n   - Second sentence: Relevant skills and eagerness to contribute"
       : seniorityLevel === "executive"
       ? "- First sentence: Executive leadership scope and strategic impact\n   - Second sentence: Transformation achievements and business outcomes"
       : "- First sentence: Lead with years of experience and core expertise\n   - Second sentence: Highlight key achievements or unique value proposition"
   }
3. Tone: ${toneInstructions[tone]}
4. Use active voice and specific verbs.
5. Include 2-4 key skills when available.
6. Prioritize concrete scope and outcomes over generic adjectives.
7. Avoid first-person pronouns ("I", "my", "me").
8. Avoid cliches and banned openers:
   - "Results-driven"
   - "Proven track record"
   - "Highly motivated"
   - "Dynamic professional"
9. ${hasDraftSummary
      ? "When polishing, preserve the user's factual meaning and strongest details, while improving clarity and flow."
      : "When generating new text, use only the provided facts and keep wording specific."}

CRITICAL CONSTRAINTS - DO NOT VIOLATE:
- ONLY use information provided in the candidate profile above
- Do NOT invent years of experience, skills, or achievements not provided
- Do NOT fabricate job titles, companies, or credentials
- If data is missing (e.g., years of experience not provided), do NOT make up numbers; use neutral phrasing
- All claims must be verifiable from the provided profile data
- Keep the wording natural and recruiter-friendly, not robotic

OUTPUT FORMAT:
Return ONLY the summary text (plain text). No labels, bullets, or explanation.

Generate the professional summary now:`;

  const result = await model.generateContent({
    systemInstruction,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  return result.response
    .text()
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
