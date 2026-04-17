import {
  ExistingSkillRef,
  Industry,
  ProjectSignal,
  SeniorityLevel,
  SuggestedSkill,
  SuggestedSkillSource,
  SuggestSkillsInput,
  WorkHistorySignal,
} from "./content-types";
import {
  AIError,
  flashModel,
  parseAIJsonResponse,
  safety,
  validateAIResponse,
} from "./shared";
import { buildSystemInstruction, PROMPT_VERSION, wrapTag } from "./prompt-utils";
import { dedupeSuggestions, filterDuplicates } from "./skills-normalize";

/** Valid source values, used to default any AI output that omits the field. */
const VALID_SOURCES: readonly SuggestedSkillSource[] = [
  "experience",
  "projects",
  "certifications",
  "complementary",
  "industry-trend",
];

/**
 * Get seniority-specific skill expectations
 */
function getSenioritySkillGuidance(level: SeniorityLevel = "mid"): string {
  const guidance: Record<SeniorityLevel, string> = {
    entry: `SENIORITY: Entry-Level
SKILL EXPECTATIONS:
- Focus on foundational technical skills
- Include learning ability and adaptability
- Highlight transferable skills from education/internships
- Less emphasis on leadership, more on collaboration
- Include modern tools and technologies being taught today`,
    mid: `SENIORITY: Mid-Level Professional
SKILL EXPECTATIONS:
- Balance technical depth with soft skills
- Include project management and collaboration tools
- Show proficiency in industry-standard technologies
- Begin including leadership/mentorship skills
- Highlight specialized expertise areas`,
    senior: `SENIORITY: Senior Professional
SKILL EXPECTATIONS:
- Emphasize leadership and strategic thinking
- Include architecture and system design skills
- Highlight mentorship and team development
- Show cross-functional collaboration abilities
- Include stakeholder management and communication`,
    executive: `SENIORITY: Executive
SKILL EXPECTATIONS:
- Focus on strategic and business skills
- Include P&L management and financial acumen
- Highlight organizational leadership and change management
- Show board-level communication skills
- Include industry expertise and thought leadership`,
  };
  return guidance[level];
}

/**
 * Get industry-specific in-demand skills
 */
function getIndustryTrendingSkills(industry?: Industry): string {
  if (!industry) return "";

  const trends: Record<Industry, string> = {
    technology: `INDUSTRY: Technology (2024-2025 Trends)
IN-DEMAND SKILLS:
- AI/ML: LLMs, prompt engineering, RAG, vector databases
- Cloud: Kubernetes, Terraform, serverless, multi-cloud
- Security: Zero trust, DevSecOps, cloud security
- Data: Real-time analytics, data mesh, feature stores
- Development: TypeScript, Rust, Go, event-driven architecture`,
    finance: `INDUSTRY: Finance (2024-2025 Trends)
IN-DEMAND SKILLS:
- RegTech: Automated compliance, KYC/AML tech
- FinTech: Blockchain, DeFi, digital payments
- Data: Alternative data, ML models, risk analytics
- ESG: ESG reporting, sustainable finance
- Automation: RPA, intelligent automation`,
    healthcare: `INDUSTRY: Healthcare (2024-2025 Trends)
IN-DEMAND SKILLS:
- Digital Health: Telehealth platforms, remote monitoring
- AI: Clinical decision support, medical imaging AI
- Data: Population health analytics, EHR optimization
- Interoperability: FHIR, health data exchange
- Cybersecurity: Healthcare-specific security, HIPAA tech`,
    marketing: `INDUSTRY: Marketing (2024-2025 Trends)
IN-DEMAND SKILLS:
- AI: Generative AI for content, predictive analytics
- Privacy: First-party data strategy, cookieless tracking
- Platforms: TikTok, influencer platforms, connected TV
- Personalization: CDP, real-time personalization
- Analytics: Attribution modeling, marketing mix optimization`,
    sales: `INDUSTRY: Sales (2024-2025 Trends)
IN-DEMAND SKILLS:
- AI: Sales intelligence, conversational AI, lead scoring
- Revenue Ops: RevOps platforms, pipeline automation
- Social: LinkedIn Sales Navigator, social selling
- CRM: Salesforce, HubSpot, advanced automation
- Analytics: Revenue forecasting, customer health scoring`,
    engineering: `INDUSTRY: Engineering (2024-2025 Trends)
IN-DEMAND SKILLS:
- Digital: Digital twins, IoT integration, BIM
- Sustainability: Green engineering, carbon footprint analysis
- Automation: Industrial robotics, predictive maintenance
- Simulation: FEA, CFD, multi-physics simulation
- Project: Agile engineering, integrated project delivery`,
    education: `INDUSTRY: Education (2024-2025 Trends)
IN-DEMAND SKILLS:
- EdTech: Learning management systems, adaptive learning
- AI: AI tutoring, automated assessment, personalized learning
- Accessibility: Universal design for learning, accessibility tools
- Data: Learning analytics, student success prediction
- Hybrid: Blended learning design, asynchronous content`,
    legal: `INDUSTRY: Legal (2024-2025 Trends)
IN-DEMAND SKILLS:
- LegalTech: eDiscovery, contract analytics, legal AI
- Cybersecurity: Data privacy law, cyber incident response
- Automation: Document automation, workflow tools
- AI: Legal research AI, contract review automation
- Compliance: ESG regulations, data protection (GDPR, CCPA)`,
    consulting: `INDUSTRY: Consulting (2024-2025 Trends)
IN-DEMAND SKILLS:
- Digital: Digital transformation strategy, cloud advisory
- AI: AI strategy, generative AI implementation
- Sustainability: ESG consulting, climate risk
- Change: Change management, organizational design
- Analytics: Advanced analytics, data strategy`,
    manufacturing: `INDUSTRY: Manufacturing (2024-2025 Trends)
IN-DEMAND SKILLS:
- Industry 4.0: Smart factory, industrial IoT, digital twins
- Automation: Robotics, autonomous systems, cobots
- Analytics: Predictive maintenance, quality analytics
- Supply Chain: Supply chain visibility, demand sensing
- Sustainability: Circular economy, carbon neutrality`,
    retail: `INDUSTRY: Retail (2024-2025 Trends)
IN-DEMAND SKILLS:
- Omnichannel: Unified commerce, headless commerce
- Personalization: AI recommendations, customer 360
- Supply Chain: Last-mile optimization, inventory AI
- Experience: AR/VR shopping, social commerce
- Analytics: Customer analytics, dynamic pricing`,
    hospitality: `INDUSTRY: Hospitality (2024-2025 Trends)
IN-DEMAND SKILLS:
- Technology: Contactless tech, mobile check-in/out
- Revenue: Dynamic pricing, revenue management systems
- Experience: Personalization platforms, loyalty tech
- Sustainability: Sustainable operations, green certifications
- Analytics: Guest analytics, demand forecasting`,
    nonprofit: `INDUSTRY: Nonprofit (2024-2025 Trends)
IN-DEMAND SKILLS:
- Fundraising: Digital fundraising, peer-to-peer platforms
- CRM: Nonprofit CRM (Salesforce NPSP, Bloomerang)
- Analytics: Impact measurement, donor analytics
- Marketing: Digital storytelling, social media advocacy
- Grants: Grant management software, proposal writing`,
    government: `INDUSTRY: Government (2024-2025 Trends)
IN-DEMAND SKILLS:
- Digital: Digital services, citizen experience platforms
- Cybersecurity: Government security frameworks, FedRAMP
- Data: Open data, data governance, privacy compliance
- AI: AI ethics, responsible AI, automated decision-making
- Cloud: Government cloud (GovCloud), hybrid infrastructure`,
    other: "",
  };
  return trends[industry] ? `\n${trends[industry]}` : "";
}

/**
 * Formats a work-history entry as a compact, readable block for the prompt.
 *
 * Example:
 *   [CURRENT · 2y 3m] Senior Engineer at a technology company
 *   - Led migration to TypeScript across 80K LOC frontend
 *   - Reduced p99 latency 40% via Redis caching
 */
function formatWorkHistory(entries: WorkHistorySignal[] | undefined): string {
  if (!entries || entries.length === 0) return "";
  const lines = entries.map((e) => {
    const duration = formatDuration(e.durationMonths);
    const recency = e.isCurrent
      ? "CURRENT"
      : e.yearsAgo === 0
        ? "recent"
        : `${e.yearsAgo}y ago`;
    const header = `[${recency} · ${duration}] ${e.position}${e.companyLabel ? ` at ${e.companyLabel}` : ""}`;
    const bulletBlock = e.bullets.length > 0
      ? "\n" + e.bullets.map((b) => `  - ${b}`).join("\n")
      : "";
    return header + bulletBlock;
  });
  return `\n\nWORK HISTORY (most recent first — weight recent roles higher):\n${lines.join("\n\n")}`;
}

function formatDuration(months: number): string {
  if (months <= 0) return "<1m";
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${months}m`;
  if (rem === 0) return `${years}y`;
  return `${years}y ${rem}m`;
}

function formatProjects(projects: ProjectSignal[] | undefined): string {
  if (!projects || projects.length === 0) return "";
  const lines = projects.map((p) => {
    const techs = p.technologies.length > 0
      ? `\n  Technologies: ${p.technologies.join(", ")}`
      : "";
    const desc = p.description ? `\n  ${p.description}` : "";
    return `- ${p.name}${desc}${techs}`;
  });
  return `\n\nPROJECTS:\n${lines.join("\n")}`;
}

function formatExistingSkills(existing: ExistingSkillRef[] | undefined): string {
  if (!existing || existing.length === 0) return "";
  const list = existing.map((s) => `- ${s.name} (${s.category})`).join("\n");
  return `\n\nEXISTING SKILLS — DO NOT SUGGEST ANY OF THESE OR EQUIVALENTS:
${list}

DEDUPLICATION RULES:
1. Case-insensitive match: "react" = "React" = "REACT"
2. Punctuation/spacing-insensitive: "React.js" = "ReactJS" = "React JS" = "React"
3. Recognize canonical aliases before suggesting:
   - JS ↔ JavaScript
   - TS ↔ TypeScript
   - k8s ↔ Kubernetes
   - node ↔ Node.js
   - RN ↔ React Native
   - ML ↔ Machine Learning
   - AI ↔ Artificial Intelligence
   - GCP ↔ Google Cloud Platform
   - AWS ↔ Amazon Web Services
   - CI/CD ↔ Continuous Integration
   - Postgres ↔ PostgreSQL
   - Mongo ↔ MongoDB
4. Reject any suggestion a reasonable recruiter would consider equivalent to an existing skill.`;
}

function formatLanguages(languages: string[] | undefined): string {
  if (!languages || languages.length === 0) return "";
  return `\n\nHUMAN LANGUAGES ALREADY TRACKED SEPARATELY (do NOT suggest these):
${languages.map((l) => `- ${l}`).join("\n")}`;
}

function formatSummary(summary: string | undefined): string {
  if (!summary?.trim()) return "";
  return `\n\nUSER'S OWN SUMMARY (their words):\n${wrapTag("summary", summary.trim())}`;
}

function formatCertifications(certs: string[] | undefined): string {
  if (!certs || certs.length === 0) return "";
  return `\n\nCERTIFICATIONS:\n${certs.map((c) => `- ${c}`).join("\n")}`;
}

function formatEducationField(field: string | undefined): string {
  if (!field?.trim()) return "";
  return `\n\nDEGREE FIELD: ${field.trim()}`;
}

export async function suggestSkills(
  input: SuggestSkillsInput
): Promise<SuggestedSkill[]> {
  const {
    jobTitle,
    jobDescription,
    industry,
    seniorityLevel,
    summary,
    workHistory,
    projects,
    certifications,
    educationField,
    languages,
    existingSkills,
  } = input;

  const model = flashModel();
  const systemInstruction = buildSystemInstruction(
    "Expert career advisor",
    "Suggest skills based on the candidate's actual history and return JSON only. Be honest — do not invent skills the candidate has not demonstrated."
  );

  const hasDemonstrableHistory =
    (workHistory && workHistory.length > 0) ||
    (projects && projects.length > 0) ||
    (certifications && certifications.length > 0);

  const prompt = `PROMPT_VERSION: ${PROMPT_VERSION}
TASK: Suggest 8-10 relevant skills for this candidate, grounded in their actual history where possible. Each suggestion must carry a "source" classification.

TARGET ROLE:
${wrapTag("job_title", jobTitle)}${jobDescription ? `\n\nTARGET JOB DESCRIPTION:\n${wrapTag("job_description", jobDescription)}` : ""}
${formatSummary(summary)}
${formatWorkHistory(workHistory)}
${formatProjects(projects)}
${formatCertifications(certifications)}
${formatEducationField(educationField)}

${getSenioritySkillGuidance(seniorityLevel)}
${getIndustryTrendingSkills(industry)}
${formatExistingSkills(existingSkills)}
${formatLanguages(languages)}

SOURCE CLASSIFICATION — classify every suggestion into one source:
- "experience" — directly evidenced by work history bullets or positions.
  citedFrom = "Position at CompanyLabel (duration)"
- "projects" — directly evidenced by the projects list.
  citedFrom = "Project: Name"
- "certifications" — implied by a certification the candidate holds.
  citedFrom = "Cert: Name"
- "complementary" — commonly paired with an existing skill the candidate has.
  pairedWith = "the existing skill name"
- "industry-trend" — in-demand for this industry/role but not evidenced in history.
  (no citedFrom / pairedWith)

TARGET MIX (out of 8-10 suggestions):
${hasDemonstrableHistory
  ? `- 5-7 MUST come from "experience", "projects", or "certifications" (demonstrable)
- 2-4 from "complementary" or "industry-trend" (aspirational)`
  : `- Prioritize "industry-trend" and "complementary" since no work history is provided.
- Still include "projects" and "certifications" if available.`}

RELEVANCE LEVELS:
- "high": Critical/must-have skills for the target role.
- "medium": Important but not essential — differentiators.

STANDARD CATEGORIES (use these consistently):
- "Technical": Programming languages, technical frameworks, specialized software
- "Languages": Human languages (English, Spanish) — do NOT suggest, tracked elsewhere
- "Frameworks": Development frameworks, methodologies (Agile, Scrum)
- "Tools": Software tools, platforms, productivity apps
- "Soft Skills": Communication, leadership, teamwork, problem-solving
- "Other": Certifications, domain knowledge, industry-specific skills

REQUIRED JSON OUTPUT FORMAT:
[
  {
    "name": "[Skill name — be specific, not generic]",
    "category": "Technical|Languages|Frameworks|Tools|Soft Skills|Other",
    "relevance": "high|medium",
    "source": "experience|projects|certifications|complementary|industry-trend",
    "citedFrom": "[Position at CompanyLabel (duration)] OR [Project: Name] OR [Cert: Name] OR null",
    "pairedWith": "[existing skill name when source=complementary, else null]",
    "reason": "[1-2 sentence explanation — cite the bullet/project/cert when source=experience/projects/certifications]"
  }
]

EXAMPLES:

source=experience:
{"name": "Kubernetes", "category": "Tools", "relevance": "high", "source": "experience", "citedFrom": "Senior DevOps at a technology company (2y)", "pairedWith": null, "reason": "Candidate led container orchestration at their most recent role — deployment automation noted in bullets."}

source=projects:
{"name": "WebSockets", "category": "Technical", "relevance": "medium", "source": "projects", "citedFrom": "Project: Real-time Dashboard", "pairedWith": null, "reason": "Project explicitly uses real-time bidirectional communication — underlying WebSocket knowledge implied."}

source=complementary:
{"name": "Helm", "category": "Tools", "relevance": "medium", "source": "complementary", "citedFrom": null, "pairedWith": "Kubernetes", "reason": "Commonly used alongside Kubernetes for package management and deployment templating."}

source=industry-trend:
{"name": "LLM Prompt Engineering", "category": "Technical", "relevance": "high", "source": "industry-trend", "citedFrom": null, "pairedWith": null, "reason": "Critical in-demand skill for senior engineers in technology in 2024-2025."}

IMPORTANT:
- Return exactly 8-10 skills
- Aim for 5-6 "high" relevance and 2-4 "medium"
- DO NOT suggest skills already in EXISTING SKILLS (see deduplication rules)
- DO NOT suggest human languages
- DO NOT invent evidence — if not grounded in history, classify as complementary or industry-trend
- Return ONLY valid JSON array, no markdown, no explanations outside JSON

Generate the skill suggestions now:`;

  const result = await model.generateContent({
    systemInstruction,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = validateAIResponse(result.response.text(), "suggestSkills");

  // Type guard — lenient on source (we'll default missing/invalid to industry-trend)
  const isValidSkillArray = (data: unknown): data is Array<Record<string, unknown>> => {
    if (!Array.isArray(data)) return false;
    return data.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).name === "string" &&
        typeof (item as Record<string, unknown>).category === "string"
    );
  };

  const parsed = parseAIJsonResponse<Array<Record<string, unknown>>>(
    text,
    "suggestSkills",
    isValidSkillArray
  );

  const normalized: SuggestedSkill[] = parsed
    .map((item) => normalizeSuggestion(item))
    .filter((s): s is SuggestedSkill => s !== null);

  // Safety-net dedupe: against existing skills AND against self (same name twice).
  const dedupedInternal = dedupeSuggestions(normalized);
  const filtered = existingSkills
    ? filterDuplicates(dedupedInternal, existingSkills)
    : dedupedInternal;

  if (filtered.length === 0) {
    throw new AIError("empty_response", "suggestSkills", "No valid suggestions after dedupe");
  }

  return filtered.slice(0, 10);
}

/** Coerces a raw AI object into a valid SuggestedSkill or null if malformed. */
function normalizeSuggestion(item: Record<string, unknown>): SuggestedSkill | null {
  const name = typeof item.name === "string" ? item.name.trim() : "";
  const category = typeof item.category === "string" ? item.category : "Other";
  const relevance = item.relevance === "high" || item.relevance === "medium"
    ? item.relevance
    : "medium";
  const reason = typeof item.reason === "string" ? item.reason : "";

  if (!name || !reason) return null;

  const rawSource = typeof item.source === "string" ? item.source : "";
  const source: SuggestedSkillSource = VALID_SOURCES.includes(rawSource as SuggestedSkillSource)
    ? (rawSource as SuggestedSkillSource)
    : "industry-trend";

  const citedFrom = typeof item.citedFrom === "string" && item.citedFrom.trim() && item.citedFrom !== "null"
    ? item.citedFrom.trim()
    : undefined;
  const pairedWith = typeof item.pairedWith === "string" && item.pairedWith.trim() && item.pairedWith !== "null"
    ? item.pairedWith.trim()
    : undefined;

  return {
    name,
    category: category as SuggestedSkill["category"],
    relevance,
    source,
    citedFrom,
    pairedWith,
    reason,
  };
}
