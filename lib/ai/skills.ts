import {
  Industry,
  SeniorityLevel,
  SuggestedSkill,
  SuggestSkillsInput,
} from "./content-types";
import {
  AIError,
  flashModel,
  parseAIJsonResponse,
  safety,
  validateAIResponse,
} from "./shared";
import { buildSystemInstruction, PROMPT_VERSION, wrapTag } from "./prompt-utils";

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

export async function suggestSkills(
  input: SuggestSkillsInput
): Promise<SuggestedSkill[]> {
  const { jobTitle, jobDescription, industry, seniorityLevel } = input;
  const model = flashModel();
  const systemInstruction = buildSystemInstruction(
    "Expert career advisor",
    "Suggest skills based on provided input and return JSON only."
  );

  const prompt = `PROMPT_VERSION: ${PROMPT_VERSION}
TASK: Suggest 8-10 highly relevant skills for the job title, prioritizing skills that are most important for success in this role.

JOB TITLE:
${wrapTag("text", jobTitle)}
${jobDescription ? `\n\nJOB DESCRIPTION:\n${wrapTag("job_description", jobDescription)}` : ""}

${getSenioritySkillGuidance(seniorityLevel)}
${getIndustryTrendingSkills(industry)}

SKILL SUGGESTION GUIDELINES:
1. If job description is provided, prioritize skills mentioned in it
2. Include industry-standard skills for this role
3. Balance technical/hard skills with soft skills appropriate for the seniority level
4. Consider both required and nice-to-have skills
5. Include current, in-demand skills (see trends above if applicable)
6. Categorize appropriately using the standard categories below
7. For entry-level: focus on foundational and learnable skills
8. For senior/executive: include leadership and strategic skills

RELEVANCE LEVELS:
- "high": Critical/must-have skills - typically mentioned in JD or essential for role success
- "medium": Important but not essential - differentiators or nice-to-have skills

STANDARD CATEGORIES (use these consistently):
- "Technical": Programming languages, technical frameworks, specialized software
- "Languages": Human languages (English, Spanish, etc.)
- "Frameworks": Development frameworks, methodologies (Agile, Scrum)
- "Tools": Software tools, platforms, productivity apps
- "Soft Skills": Communication, leadership, teamwork, problem-solving
- "Other": Certifications, domain knowledge, industry-specific skills

REQUIRED JSON OUTPUT FORMAT:
[
  {
    "name": "[Skill name - be specific, not generic]",
    "category": "Technical|Languages|Frameworks|Tools|Soft Skills|Other",
    "relevance": "high|medium",
    "reason": "[1-2 sentence explanation of why this skill is relevant and how it applies to this specific job title]"
  }
]

EXAMPLES OF GOOD SKILL SUGGESTIONS:

For "Software Engineer":
{"name": "TypeScript", "category": "Technical", "relevance": "high", "reason": "Modern type-safe JavaScript superset widely used in enterprise applications, improving code maintainability and reducing runtime errors."}

For "Marketing Manager":
{"name": "Google Analytics 4", "category": "Tools", "relevance": "high", "reason": "Essential for measuring campaign performance and understanding customer behavior across digital channels in the post-Universal Analytics era."}

For "Senior Product Manager":
{"name": "Stakeholder Management", "category": "Soft Skills", "relevance": "high", "reason": "Critical for aligning engineering, design, and business teams around product vision and managing executive expectations."}

IMPORTANT:
- Return exactly 8-10 skills
- Aim for 5-6 "high" relevance skills and 2-4 "medium"
- Provide clear, specific reasons (not generic explanations)
- Use the standard categories listed above
- Consider current market trends for the industry
- Return ONLY valid JSON array, no markdown, no explanations outside JSON

Generate the skill suggestions now:`;

  const result = await model.generateContent({
    systemInstruction,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = validateAIResponse(result.response.text(), "suggestSkills");

  // Type guard for SuggestedSkill array validation
  const isValidSkillArray = (data: unknown): data is SuggestedSkill[] => {
    if (!Array.isArray(data)) return false;
    return data.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof item.name === "string" &&
        typeof item.category === "string" &&
        (item.relevance === "high" || item.relevance === "medium")
    );
  };

  const parsed = parseAIJsonResponse<SuggestedSkill[]>(
    text,
    "suggestSkills",
    isValidSkillArray
  );

  return parsed
    .filter(
      (skill) =>
        Boolean(skill.name) &&
        Boolean(skill.category) &&
        (skill.relevance === "high" || skill.relevance === "medium") &&
        Boolean(skill.reason)
    )
    .slice(0, 10);
}
