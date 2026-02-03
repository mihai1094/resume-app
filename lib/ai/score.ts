import { ResumeData } from "@/lib/types/resume";
import { AIBaseOptions, Industry, ResumeScore, SeniorityLevel } from "./content-types";
import {
  flashModel,
  parseAIJsonResponse,
  safety,
  serializeResume,
  validateAIResponse,
} from "./shared";
import { buildSystemInstruction, PROMPT_VERSION, wrapTag } from "./prompt-utils";

/**
 * Get industry-specific scoring guidance
 */
function getIndustryScoringGuidance(industry?: Industry): string {
  if (!industry) return "";

  const guidance: Record<Industry, string> = {
    technology: "- Focus heavily on modern tech stacks and technical project impact\n- Value open source contributions and continuous learning\n- Keywords: System Design, Scalability, Cloud Native, DevOps",
    finance: "- Emphasize accuracy, risk mitigation, and regulatory compliance\n- Value certifications (CFA, CPA) and quantifiable financial impact\n- Keywords: Financial Modeling, Risk Analysis, Compliance, ROI",
    healthcare: "- Focus on quality of care, patient outcomes, and regulatory adherence (HIPAA)\n- Value clinical excellence and interdisciplinary collaboration\n- Keywords: Patient Care, Clinical Operations, HIPAA, Quality Improvement",
    marketing: "- Emphasize brand growth, campaign ROI, and data-driven insights\n- Value creativity combined with analytical rigor\n- Keywords: Growth Marketing, SEO/SEM, Brand Strategy, Marketing Analytics",
    sales: "- Focus heavily on quota attainment and revenue growth metrics\n- Value relationship management and pipeline optimization\n- Keywords: Revenue Growth, Pipeline Management, Account Strategy, Negotiation",
    engineering: "- Focus on technical precision, design standards, and safety\n- Value project management and cross-functional leadership\n- Keywords: Project Engineering, Six Sigma, CAD/CAM, Quality Assurance",
    education: "- Focus on student outcomes and pedagogical innovation\n- Value curriculum development and classroom excellence\n- Keywords: Curriculum Development, Learning Assessment, Pedagogy, EdTech",
    legal: "- Emphasize analytical rigor, research depth, and compliance\n- Value attention to detail and persuasive writing\n- Keywords: Due Diligence, Regulatory Compliance, Litigation, Corporate Governance",
    consulting: "- Focus on client value, strategic frameworks, and adaptability\n- Value diverse project experience and organizational impact\n- Keywords: Strategic Planning, Change Management, Business Value, Client Engagement",
    manufacturing: "- Focus on operational efficiency, lean methodology, and safety\n- Value process optimization and supply chain management\n- Keywords: Lean Manufacturing, Six Sigma, Operational Excellence, Supply Chain",
    retail: "- Emphasize customer experience and operational agility\n- Value inventory management and sales performance\n- Keywords: Inventory Control, Customer Experience, Visual Merchandising, Retail Operations",
    hospitality: "- Focus on service excellence and guest satisfaction metrics\n- Value multitasking and interpersonal skills\n- Keywords: Guest Relations, Revenue Management, Service Standards, Team Leadership",
    nonprofit: "- Align with mission-driven impact and resource efficiency\n- Value community engagement and donor stewardship\n- Keywords: Fundraising, Program Development, Community Impact, Grant Writing",
    government: "- Emphasize public service commitment and regulatory compliance\n- Value accountability and stakeholder management\n- Keywords: Public Policy, Regulatory Compliance, Program Management, Accountability",
    other: "",
  };

  return `\nINDUSTRY BENCHMARKS (${industry}):\n${guidance[industry]}`;
}

/**
 * Get seniority-specific scoring focus
 */
function getSeniorityScoringGuidance(level: SeniorityLevel = "mid"): string {
  const guidance: Record<SeniorityLevel, string> = {
    entry: `- Focus on learning potential, academic excellence, and core skills\n- Value internships, projects, and extracurricular leadership`,
    mid: `- Focus on individual contribution, project ownership, and growing expertise\n- Value collaborative impact and technical depth`,
    senior: `- Focus on leadership, mentorship, and strategic impact\n- Value team transformation and cross-functional influence`,
    executive: `- Focus on organizational vision, P&L responsibility, and enterprise value\n- Value board-level influence and long-term strategy`,
  };
  return `\nSENIORITY EVALUATION FOCUS (${level}):\n${guidance[level]}`;
}

export async function scoreResume(
  resumeData: ResumeData,
  options: AIBaseOptions = {}
): Promise<ResumeScore> {
  const { industry, seniorityLevel } = options;
  const model = flashModel();
  const resumeText = serializeResume(resumeData);

  const systemInstruction = buildSystemInstruction(
    "Expert resume evaluator",
    "Score resumes using the provided rubric and return JSON only."
  );

  type ScoreResponse = {
    overallScore: number;
    categoryScores: {
      keywords: number;
      metrics: number;
      formatting: number;
      atsCompatibility: number;
      impact: number;
    };
    strengths: string[];
    improvements: string[];
    industryBenchmark: string;
  };

  const isValidResponse = (data: unknown): data is ScoreResponse => {
    if (!data || typeof data !== "object") return false;
    const obj = data as ScoreResponse;
    const scores = obj.categoryScores;
    return (
      typeof obj.overallScore === "number" &&
      scores &&
      typeof scores.keywords === "number" &&
      typeof scores.metrics === "number" &&
      typeof scores.formatting === "number" &&
      typeof scores.atsCompatibility === "number" &&
      typeof scores.impact === "number" &&
      Array.isArray(obj.strengths) &&
      Array.isArray(obj.improvements) &&
      typeof obj.industryBenchmark === "string"
    );
  };

  const prompt = `PROMPT_VERSION: ${PROMPT_VERSION}
TASK: Perform a comprehensive evaluation of this resume across multiple dimensions using industry-standard criteria.

RESUME TO EVALUATE:
${wrapTag("resume", resumeText)}

${getIndustryScoringGuidance(industry)}
${getSeniorityScoringGuidance(seniorityLevel)}

EVALUATION CRITERIA (Detailed Rubrics):

1. KEYWORDS (0-100):
   Evaluate keyword optimization and relevance:
   - Industry-relevant keywords: Appropriate terminology for the candidate's field/role
   - Skill keywords: Technical and soft skills appropriate for target role level
   - Job title keywords: Relevant job titles and role descriptors present
   - Certification/qualification keywords: Professional credentials and qualifications
   - Keyword density: Optimal frequency (2-3 mentions per important keyword in context)
   - Natural integration: Keywords flow naturally, not stuffed or forced
   - Acronym coverage: Both acronyms and full terms included where relevant
   - Contextual placement: Keywords appear in relevant sections (experience, skills, summary)

   Scoring:
   - 90-100: Exceptional keyword optimization, industry-appropriate terms, natural integration
   - 80-89: Strong keyword presence, good integration, minor gaps
   - 70-79: Adequate keywords, some missing industry terms, acceptable integration
   - 60-69: Basic keywords present, missing important terms, integration needs work
   - 50-59: Limited keywords, significant gaps, poor integration
   - 0-49: Minimal keywords, major gaps, keyword stuffing or unnatural usage

2. METRICS (0-100):
   Evaluate quantification and measurable achievements:
   - Quantifiable achievements: Specific numbers, percentages, dollar amounts
   - Percentage increases/decreases: Growth metrics, efficiency improvements
   - Financial impact: Revenue, cost savings, budget management, ROI
   - Timeframes: Project durations, deadlines met, time-to-market improvements
   - Team/project scope: Team sizes managed, project scales, organizational impact
   - Volume metrics: Users served, transactions processed, data handled
   - Scale indicators: Geographic reach, market size, customer base
   - Quality metrics: Error reduction, accuracy improvements, satisfaction scores

   Scoring:
   - 90-100: Extensive quantification, diverse metrics, clear impact demonstrated
   - 80-89: Strong metrics throughout, good variety, clear impact
   - 70-79: Adequate metrics, some achievements quantified, impact visible
   - 60-69: Limited metrics, few quantified achievements, impact unclear
   - 50-59: Minimal metrics, mostly qualitative descriptions
   - 0-49: No or very few metrics, entirely qualitative, no measurable impact

3. FORMATTING (0-100):
   Evaluate structure, readability, and professional presentation:
   - Clear section structure: Logical organization, easy navigation
   - Consistent formatting: Uniform styling, spacing, font usage
   - Professional appearance: Clean, polished, appropriate for industry
   - Easy to scan: Quick readability, clear visual hierarchy
   - Appropriate length: 1-2 pages for most roles, appropriate for experience level
   - Contact information clarity: Complete, accessible, properly formatted
   - Visual balance: Appropriate white space, not cluttered
   - Section completeness: All standard sections present and complete

   Scoring:
   - 90-100: Exceptional formatting, professional, highly readable, optimal length
   - 80-89: Strong formatting, professional appearance, good readability
   - 70-79: Adequate formatting, mostly consistent, readable
   - 60-69: Basic formatting, some inconsistencies, readability issues
   - 50-59: Poor formatting, inconsistent, difficult to read
   - 0-49: Very poor formatting, unprofessional, hard to parse

4. ATS COMPATIBILITY (0-100):
   Evaluate ATS-friendly structure and optimization:
   - Standard section headers: Conventional titles ("Work Experience", "Education", "Skills")
   - Keyword optimization: Strategic keyword placement for ATS parsing
   - Clean structure: Simple layout, no complex formatting that confuses parsers
   - Parseable content: Information easily extractable by ATS systems
   - Contact information placement: In main body, not headers/footers
   - Date formatting: Consistent, parseable date formats
   - File format considerations: Structure suggests ATS-compatible format (noted in text)
   - No parsing blockers: Avoids elements that typically confuse ATS (tables, images, complex layouts)

   Scoring:
   - 90-100: Excellent ATS compatibility, optimal structure, all best practices followed
   - 80-89: Strong ATS compatibility, minor optimization opportunities
   - 70-79: Good ATS compatibility, some areas for improvement
   - 60-69: Adequate ATS compatibility, notable optimization needed
   - 50-59: Poor ATS compatibility, significant issues
   - 0-49: Very poor ATS compatibility, major parsing problems likely

5. IMPACT (0-100):
   Evaluate results orientation and value demonstration:
   - Results-oriented language: Focus on achievements and outcomes, not just duties
   - Achievement focus: Accomplishments highlighted over responsibilities
   - Strong action verbs: Powerful, specific verbs (Led, Developed, Implemented, etc.)
   - Value demonstration: Clear contribution and impact shown
   - Progression and growth: Career advancement and skill development evident
   - Compelling professional summary: Engaging, value-focused opening
   - Problem-solving evidence: Challenges addressed and solved
   - Leadership indicators: Management, influence, and initiative shown

   Scoring:
   - 90-100: Exceptional impact focus, compelling achievements, strong value proposition
   - 80-89: Strong impact focus, good achievements, clear value
   - 70-79: Adequate impact focus, some achievements, value somewhat clear
   - 60-69: Limited impact focus, mostly responsibilities, value unclear
   - 50-59: Poor impact focus, primarily duties listed, minimal value shown
   - 0-49: Very poor impact focus, entirely responsibility-based, no value demonstrated

OVERALL SCORING METHODOLOGY:
- Calculate weighted average: Keywords (25%), Metrics (25%), Formatting (15%), ATS Compatibility (20%), Impact (15%)
- Consider industry benchmarks for similar roles and experience levels
- Factor in completeness: Missing critical sections reduce overall score
- Apply severity weighting: Critical issues (missing contact info, no experience) have greater impact

SCORING SCALE (Overall and Categories):
- 90-100: Exceptional (Top 10% of resumes) - Standout quality, exceeds standards
- 80-89: Excellent (Top 20%) - Strong quality, meets high standards
- 70-79: Good (Top 30%) - Solid quality, meets most standards
- 60-69: Average (Top 50%) - Acceptable quality, meets basic standards
- 50-59: Below Average (Bottom 50%) - Needs improvement, below standards
- 0-49: Needs Significant Improvement - Major gaps, well below standards

BENCHMARK COMPARISON:
Compare against typical resumes for similar roles, experience levels, and industries. Consider:
- Industry standards and expectations
- Role level appropriateness (entry/mid/senior)
- Geographic market norms
- Current hiring market conditions

REQUIRED JSON OUTPUT:
{
  "overallScore": 0-100,
  "categoryScores": {
    "keywords": 0-100,
    "metrics": 0-100,
    "formatting": 0-100,
    "atsCompatibility": 0-100,
    "impact": 0-100
  },
  "strengths": ["Specific strength with brief example", "..."],
  "improvements": ["Actionable improvement with example", "..."],
  "industryBenchmark": "Above average (Top X%) | Average (Top X%) | Below average (Bottom X%)"
}

Return ONLY valid JSON.`;

  const result = await model.generateContent({
    systemInstruction,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = validateAIResponse(result.response.text(), "scoreResume");
  const parsed = parseAIJsonResponse<ScoreResponse>(
    text,
    "scoreResume",
    isValidResponse
  );

  return {
    overallScore: Math.min(100, Math.max(0, parsed.overallScore || 0)),
    categoryScores: {
      keywords: Math.min(100, Math.max(0, parsed.categoryScores.keywords || 0)),
      metrics: Math.min(100, Math.max(0, parsed.categoryScores.metrics || 0)),
      formatting: Math.min(100, Math.max(0, parsed.categoryScores.formatting || 0)),
      atsCompatibility: Math.min(
        100,
        Math.max(0, parsed.categoryScores.atsCompatibility || 0)
      ),
      impact: Math.min(100, Math.max(0, parsed.categoryScores.impact || 0)),
    },
    strengths: (parsed.strengths || []).filter((s) => s.trim().length > 0),
    improvements: (parsed.improvements || []).filter((s) => s.trim().length > 0),
    industryBenchmark: parsed.industryBenchmark || "Average",
  };
}
