import { ResumeData } from "@/lib/types/resume";
import { AIBaseOptions, Industry, LinkedInProfile, SeniorityLevel } from "./content-types";
import { flashModel, safety, serializeResume } from "./shared";

interface OptimizeLinkedInInput extends AIBaseOptions {
  resumeData: ResumeData;
  targetRole?: string; // Optional target role for optimization
}

/**
 * Get seniority-specific LinkedIn optimization guidance
 */
function getSeniorityLinkedInGuidance(level: SeniorityLevel = "mid"): string {
  const guidance: Record<SeniorityLevel, string> = {
    entry: `SENIORITY: Entry-Level
HEADLINE APPROACH:
- Lead with aspiration and education
- Format: "Aspiring [Role] | [Degree/Major] | [Key Skills]"
- Emphasize learning mindset and potential

ABOUT TONE:
- Enthusiastic and eager to contribute
- Highlight education, projects, internships
- Show passion for the field
- Mention career goals and learning interests`,
    mid: `SENIORITY: Mid-Level Professional
HEADLINE APPROACH:
- Lead with current title and expertise
- Format: "[Current Title] | [Specialization] | [Key Achievement/Value]"
- Balance specific skills with broader value

ABOUT TONE:
- Confident and achievement-focused
- Highlight track record and specific expertise
- Show progression and growing impact
- Demonstrate thought leadership potential`,
    senior: `SENIORITY: Senior Professional
HEADLINE APPROACH:
- Lead with leadership and strategic impact
- Format: "[Senior Title] | [Leadership Scope] | [Industry Impact]"
- Emphasize team building and transformation

ABOUT TONE:
- Strategic and leadership-focused
- Highlight organizational impact and team development
- Show cross-functional expertise
- Position as mentor and thought leader`,
    executive: `SENIORITY: Executive
HEADLINE APPROACH:
- Lead with executive presence and vision
- Format: "[C-Suite Title] | [Business Impact] | [Transformation Focus]"
- Emphasize board-level and P&L experience

ABOUT TONE:
- Visionary and transformational
- Highlight enterprise-level achievements
- Show industry leadership and influence
- Position for board and advisory opportunities`,
  };
  return guidance[level];
}

/**
 * Get industry-specific keywords for LinkedIn SEO
 */
function getIndustryLinkedInKeywords(industry?: Industry): string {
  if (!industry) return "";

  const keywords: Record<Industry, string> = {
    technology: `INDUSTRY: Technology
HIGH-SEARCH KEYWORDS:
- Titles: Software Engineer, Full Stack Developer, DevOps, Data Scientist, Product Manager, Engineering Manager, CTO
- Skills: Python, JavaScript, AWS, Kubernetes, Machine Learning, Agile, Cloud Architecture, System Design
- Buzzwords: Digital Transformation, AI/ML, Scalable, Microservices, DevOps, Data-Driven`,
    finance: `INDUSTRY: Finance
HIGH-SEARCH KEYWORDS:
- Titles: Financial Analyst, Portfolio Manager, Investment Banker, Risk Manager, CFO, Quant
- Skills: Financial Modeling, Risk Analysis, Bloomberg, Python/R, Regulatory Compliance, M&A
- Buzzwords: Alpha, Risk-Adjusted Returns, RegTech, FinTech, ESG`,
    healthcare: `INDUSTRY: Healthcare
HIGH-SEARCH KEYWORDS:
- Titles: Clinical Director, Healthcare Administrator, Medical Director, Nurse Manager, Health IT
- Skills: EHR Systems (Epic, Cerner), Healthcare Compliance, HIPAA, Clinical Operations, Quality Improvement
- Buzzwords: Patient Outcomes, Value-Based Care, Population Health, Digital Health`,
    marketing: `INDUSTRY: Marketing
HIGH-SEARCH KEYWORDS:
- Titles: Marketing Manager, Brand Manager, Digital Marketing, CMO, Growth Marketing, Content Strategist
- Skills: SEO/SEM, Google Analytics, Marketing Automation, Brand Strategy, Campaign Management
- Buzzwords: ROI, Customer Acquisition, Omnichannel, Data-Driven Marketing, Growth Hacking`,
    sales: `INDUSTRY: Sales
HIGH-SEARCH KEYWORDS:
- Titles: Sales Manager, Account Executive, VP Sales, Business Development, Sales Director, CRO
- Skills: Salesforce, HubSpot, Pipeline Management, Enterprise Sales, Negotiation, Sales Strategy
- Buzzwords: Quota Attainment, Revenue Growth, Hunter, Client Success, Solution Selling`,
    engineering: `INDUSTRY: Engineering
HIGH-SEARCH KEYWORDS:
- Titles: Project Engineer, Engineering Manager, Civil Engineer, Mechanical Engineer, VP Engineering
- Skills: AutoCAD, Project Management, Six Sigma, Lean, BIM, Technical Leadership
- Buzzwords: Project Delivery, Safety, Quality Assurance, Sustainability, Innovation`,
    education: `INDUSTRY: Education
HIGH-SEARCH KEYWORDS:
- Titles: Teacher, Principal, Curriculum Developer, Instructional Designer, EdTech, Dean
- Skills: Curriculum Development, Learning Management Systems, Assessment, Student Engagement
- Buzzwords: Student Outcomes, Differentiated Instruction, EdTech, Online Learning`,
    legal: `INDUSTRY: Legal
HIGH-SEARCH KEYWORDS:
- Titles: Attorney, Legal Counsel, Partner, General Counsel, Paralegal, Compliance Officer
- Skills: Contract Law, Litigation, Due Diligence, Regulatory Compliance, Legal Research
- Buzzwords: Risk Mitigation, Corporate Governance, M&A, Intellectual Property`,
    consulting: `INDUSTRY: Consulting
HIGH-SEARCH KEYWORDS:
- Titles: Consultant, Senior Consultant, Manager, Partner, Principal, Strategy Consultant
- Skills: Strategy, Change Management, Business Analysis, Client Engagement, Project Management
- Buzzwords: Digital Transformation, Value Creation, Thought Leadership, Client Impact`,
    manufacturing: `INDUSTRY: Manufacturing
HIGH-SEARCH KEYWORDS:
- Titles: Plant Manager, Operations Manager, Quality Manager, Supply Chain Director, VP Operations
- Skills: Lean Manufacturing, Six Sigma, ERP, Supply Chain, Production Planning
- Buzzwords: Operational Excellence, Continuous Improvement, Industry 4.0, Sustainability`,
    retail: `INDUSTRY: Retail
HIGH-SEARCH KEYWORDS:
- Titles: Store Manager, Regional Manager, Merchandising, E-commerce Manager, VP Retail
- Skills: Inventory Management, Visual Merchandising, Retail Analytics, Customer Experience
- Buzzwords: Omnichannel, Customer Experience, Retail Innovation, Same-Store Sales`,
    hospitality: `INDUSTRY: Hospitality
HIGH-SEARCH KEYWORDS:
- Titles: General Manager, Hotel Manager, F&B Director, Revenue Manager, VP Operations
- Skills: Revenue Management, Guest Services, F&B Operations, Property Management Systems
- Buzzwords: Guest Experience, RevPAR, Service Excellence, Brand Standards`,
    nonprofit: `INDUSTRY: Nonprofit
HIGH-SEARCH KEYWORDS:
- Titles: Executive Director, Development Director, Program Manager, Fundraising Manager
- Skills: Fundraising, Grant Writing, Volunteer Management, Program Development
- Buzzwords: Mission-Driven, Impact, Community Engagement, Donor Relations`,
    government: `INDUSTRY: Government
HIGH-SEARCH KEYWORDS:
- Titles: Program Manager, Policy Analyst, Director, Public Administrator, Agency Head
- Skills: Policy Development, Government Contracting, Stakeholder Engagement, Public Administration
- Buzzwords: Public Service, Policy Impact, Constituent Services, Good Governance`,
    other: "",
  };
  return keywords[industry] ? `\n${keywords[industry]}` : "";
}

export async function optimizeLinkedInProfile(
  input: OptimizeLinkedInInput
): Promise<LinkedInProfile> {
  const { resumeData, targetRole, industry, seniorityLevel } = input;
  const model = flashModel();
  const resumeText = serializeResume(resumeData);

  const prompt = `You are an expert LinkedIn profile optimizer specializing in converting resume content into engaging, LinkedIn-optimized profiles that attract recruiters, improve search visibility, and build professional networks.

TASK: Convert this resume into LinkedIn-optimized content with appropriate tone, formatting, and keywords for maximum discoverability.

RESUME CONTENT:
${resumeText}
${targetRole ? `\nTARGET ROLE: ${targetRole}` : ""}

${getSeniorityLinkedInGuidance(seniorityLevel)}
${getIndustryLinkedInKeywords(industry)}

LINKEDIN SEO OPTIMIZATION:
LinkedIn's search algorithm prioritizes:
1. Keywords in headline (highest weight)
2. Keywords in About section (high weight)
3. Job titles and company names
4. Skills section matches
5. Engagement and activity (not applicable here, but content should encourage engagement)

LINKEDIN OPTIMIZATION GUIDELINES:

1. HEADLINE (Maximum 120 characters):
   - CRITICAL: Include the most searchable job title keywords
   - Use separators (|, •, /) to include multiple keywords
   - Format based on seniority level (see guidance above)
   - Include industry-specific terms recruiters search for
   - Balance searchability with compelling value proposition
   - Examples:
     Entry: "Aspiring Software Engineer | CS Graduate | Python, JavaScript, React"
     Mid: "Senior Software Engineer | Full Stack | Building Scalable Systems at [Company]"
     Senior: "Engineering Director | Leading 50+ Engineers | Digital Transformation at Scale"
     Executive: "CTO | 20+ Years Scaling Tech Organizations | $100M+ P&L"

2. ABOUT SECTION (2-3 paragraphs, 200-300 words):
   - FIRST PARAGRAPH: Hook + current expertise + what you do
     * Start with attention-grabbing opening
     * Include primary keywords naturally
     * Establish expertise and focus area
   - SECOND PARAGRAPH: Track record + achievements + unique value
     * Highlight quantifiable achievements
     * Include industry-specific keywords
     * Show progression and impact
   - THIRD PARAGRAPH (optional): Goals + call-to-action
     * Career interests and direction
     * What you're looking for (if open to opportunities)
     * How to connect or engage
   - KEYWORD STRATEGY: Naturally incorporate 8-12 high-value keywords

3. EXPERIENCE BULLETS (More conversational than resume):
   - Convert resume bullets to LinkedIn-style descriptions
   - Slightly more conversational and storytelling-oriented
   - Can include more context about the role and challenges
   - Still highlight achievements and quantifiable impact
   - Include relevant keywords naturally
   - Maintain professional but approachable tone

4. TOP SKILLS (10 skills, ranked by searchability):
   - Prioritize skills recruiters actively search for
   - Include exact-match keywords from job descriptions
   - Mix of technical skills and soft skills (appropriate to role)
   - Industry-standard terminology (exact phrasing matters)
   - Order by relevance and search volume

REQUIRED OUTPUT FORMAT:
HEADLINE:
[Compelling headline, max 120 characters, keyword-rich, searchable]

ABOUT:
[First paragraph: Hook and expertise - engaging opening, establish credibility]

[Second paragraph: Track record and achievements - quantifiable impact, unique value]

[Optional third paragraph: Goals and call-to-action - what you're seeking, how to connect]

EXPERIENCE BULLETS:
Experience 1:
- [LinkedIn-optimized bullet point 1 - conversational, keyword-rich]
- [LinkedIn-optimized bullet point 2]
- [Continue for all relevant experiences...]

Experience 2:
- [LinkedIn-optimized bullets for second experience...]

[Continue for all work experiences...]

TOP SKILLS:
[Skill 1], [Skill 2], [Skill 3], [Skill 4], [Skill 5], [Skill 6], [Skill 7], [Skill 8], [Skill 9], [Skill 10]

IMPORTANT:
- LinkedIn tone is more conversational and personal than resume
- Every section should be optimized for search/discoverability
- Include keywords naturally - never keyword stuff
- Make it engaging and authentic to encourage profile views
- Focus on achievements and impact with quantifiable results
- Use first person appropriately (preferred in About section)

CRITICAL CONSTRAINTS - DO NOT VIOLATE:
- ONLY use information that exists in the provided resume
- Do NOT invent achievements, metrics, or experiences not in the resume
- Do NOT fabricate job titles, companies, or responsibilities
- Do NOT add skills or certifications the candidate doesn't have
- Rephrase and optimize existing content - never fabricate new content
- If the resume lacks certain details, do NOT make them up
- All metrics and achievements must come from the original resume

Generate the LinkedIn-optimized content now:`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = result.response.text();
  console.log(
    "[AI] optimizeLinkedInProfile raw response:",
    text.substring(0, 800)
  );

  const headlineMatch = text.match(/HEADLINE:\s*([^\n]+)/i);
  const aboutMatch = text.match(
    /ABOUT:([\s\S]*?)(?:EXPERIENCE BULLETS:|TOP SKILLS:|$)/i
  );
  const bulletsSection = text.match(
    /EXPERIENCE BULLETS:([\s\S]*?)(?:TOP SKILLS:|$)/i
  );
  const skillsMatch = text.match(/TOP SKILLS:\s*([^\n]+)/i);

  const experienceBullets: Record<string, string[]> = {};
  if (bulletsSection) {
    bulletsSection[1]
      .split(/Experience \d+:/i)
      .filter((b) => b.trim())
      .forEach((block, idx) => {
        const bullets = block
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.startsWith("-"))
          .map((l) => l.replace(/^-\s*/, "").trim())
          .filter((l) => l.length > 0);
        if (bullets.length) experienceBullets[`exp-${idx + 1}`] = bullets;
      });
  }

  const topSkills =
    skillsMatch?.[1]
      ?.split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 10) || [];

  return {
    headline: headlineMatch?.[1]?.trim() || "",
    about: aboutMatch?.[1]?.trim() || "",
    experienceBullets,
    topSkills,
  };
}
