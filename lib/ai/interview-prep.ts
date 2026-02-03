import { ResumeData } from "@/lib/types/resume";
import {
  DifficultyLevel,
  GenerateInterviewPrepInput,
  InterviewPrepResult,
  InterviewQuestion,
  SeniorityLevel,
  SkillGap,
  Industry,
} from "./content-types";
import {
  flashModelJson,
  parseAIJsonResponse,
  safety,
  serializeResume,
  validateAIResponse,
} from "./shared";
import { aiLogger } from "@/lib/services/logger";
import { buildSystemInstruction, PROMPT_VERSION, wrapTag } from "./prompt-utils";

/**
 * Analyze resume to build a candidate profile for better interview prep
 */
function analyzeCandidateProfile(resumeData: ResumeData): {
  yearsOfExperience: number;
  inferredSeniority: SeniorityLevel;
  industries: string[];
  careerHighlights: string[];
  skillCategories: { technical: string[]; soft: string[]; tools: string[] };
  hasManagementExperience: boolean;
  educationLevel: string;
} {
  const workExperience = resumeData.workExperience || [];

  // Calculate years of experience
  let totalMonths = 0;
  const industries = new Set<string>();
  const technicalSkills: string[] = [];
  const softSkills: string[] = [];
  const tools: string[] = [];
  const highlights: string[] = [];
  let hasManagement = false;

  workExperience.forEach((exp) => {
    if (exp.startDate) {
      const start = new Date(exp.startDate);
      const end = exp.current ? new Date() : exp.endDate ? new Date(exp.endDate) : new Date();
      const months = Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
      totalMonths += months;
    }

    // Check for management experience
    const positionLower = (exp.position || "").toLowerCase();
    if (
      positionLower.includes("manager") ||
      positionLower.includes("director") ||
      positionLower.includes("lead") ||
      positionLower.includes("head of") ||
      positionLower.includes("vp") ||
      positionLower.includes("chief")
    ) {
      hasManagement = true;
    }

    // Extract highlights from descriptions
    if (exp.description && Array.isArray(exp.description)) {
      exp.description.forEach((desc) => {
        if (desc && (desc.includes("%") || desc.includes("$") || /\d+/.test(desc))) {
          highlights.push(desc);
        }
      });
    }
  });

  const yearsOfExperience = Math.round(totalMonths / 12);

  // Infer seniority based on experience and management
  let inferredSeniority: SeniorityLevel = "mid";
  if (yearsOfExperience <= 2) {
    inferredSeniority = "entry";
  } else if (yearsOfExperience <= 5) {
    inferredSeniority = "mid";
  } else if (yearsOfExperience <= 10 || hasManagement) {
    inferredSeniority = "senior";
  } else if (yearsOfExperience > 10 && hasManagement) {
    inferredSeniority = "executive";
  }

  // Categorize skills
  const techKeywords = ["javascript", "python", "react", "node", "sql", "aws", "docker", "kubernetes", "java", "typescript", "api", "database", "cloud", "devops", "ci/cd", "git"];
  const softKeywords = ["leadership", "communication", "teamwork", "problem-solving", "management", "collaboration", "mentoring"];
  const toolKeywords = ["figma", "jira", "confluence", "slack", "notion", "excel", "powerpoint", "salesforce", "hubspot", "tableau"];

  (resumeData.skills || []).forEach((skill) => {
    const nameLower = skill.name.toLowerCase();
    if (techKeywords.some((kw) => nameLower.includes(kw))) {
      technicalSkills.push(skill.name);
    } else if (softKeywords.some((kw) => nameLower.includes(kw))) {
      softSkills.push(skill.name);
    } else if (toolKeywords.some((kw) => nameLower.includes(kw))) {
      tools.push(skill.name);
    } else {
      technicalSkills.push(skill.name); // Default to technical
    }
  });

  // Determine education level
  let educationLevel = "Not specified";
  const education = resumeData.education || [];
  if (education.length > 0) {
    const degrees = education.map((e) => (e.degree || "").toLowerCase());
    if (degrees.some((d) => d.includes("phd") || d.includes("doctorate"))) {
      educationLevel = "PhD/Doctorate";
    } else if (degrees.some((d) => d.includes("master") || d.includes("mba") || d.includes("m.s.") || d.includes("m.a."))) {
      educationLevel = "Master's degree";
    } else if (degrees.some((d) => d.includes("bachelor") || d.includes("b.s.") || d.includes("b.a."))) {
      educationLevel = "Bachelor's degree";
    } else if (degrees.some((d) => d.includes("associate"))) {
      educationLevel = "Associate's degree";
    }
  }

  return {
    yearsOfExperience,
    inferredSeniority,
    industries: Array.from(industries),
    careerHighlights: highlights.slice(0, 5),
    skillCategories: {
      technical: technicalSkills.slice(0, 10),
      soft: softSkills.slice(0, 5),
      tools: tools.slice(0, 5),
    },
    hasManagementExperience: hasManagement,
    educationLevel,
  };
}

/**
 * Generate candidate profile section for the prompt
 */
function getCandidateProfileSection(resumeData: ResumeData): string {
  const profile = analyzeCandidateProfile(resumeData);

  return `CANDIDATE PROFILE (auto-analyzed from resume):
- Years of Experience: ${profile.yearsOfExperience} years
- Inferred Seniority: ${profile.inferredSeniority.charAt(0).toUpperCase() + profile.inferredSeniority.slice(1)}-level
- Education: ${profile.educationLevel}
- Management Experience: ${profile.hasManagementExperience ? "Yes" : "No"}
- Technical Skills: ${profile.skillCategories.technical.join(", ") || "Not specified"}
- Tools: ${profile.skillCategories.tools.join(", ") || "Not specified"}
${profile.careerHighlights.length > 0 ? `- Notable Achievements: ${profile.careerHighlights.slice(0, 3).join("; ")}` : ""}

Use this profile to:
1. Calibrate question difficulty appropriately
2. Reference specific experiences in sample answers
3. Identify realistic skill gaps
4. Assess readiness accurately`;
}

/**
 * Get seniority-appropriate question focus areas
 */
function getSeniorityQuestionFocus(level: SeniorityLevel = "mid"): string {
  const focus: Record<SeniorityLevel, string> = {
    entry: `SENIORITY FOCUS: Entry-Level
- Emphasize learning potential and growth mindset
- Focus on academic projects, internships, and transferable skills
- Questions about adaptability and eagerness to learn
- Less focus on leadership, more on collaboration and contribution
- Technical questions should be foundational, not advanced`,
    mid: `SENIORITY FOCUS: Mid-Level Professional
- Balance of technical depth and collaboration skills
- Questions about specific project ownership and outcomes
- Problem-solving approaches and decision-making
- Some leadership/mentorship questions (informal or peer)
- Technical questions should probe practical experience`,
    senior: `SENIORITY FOCUS: Senior Professional
- Strong emphasis on leadership and strategic thinking
- Questions about team building, mentorship, and conflict resolution
- Architecture decisions, technical strategy, trade-offs
- Cross-functional collaboration and stakeholder management
- Handling ambiguity and driving initiatives`,
    executive: `SENIORITY FOCUS: Executive Level
- Strategic vision and organizational transformation
- P&L responsibility, business outcomes, ROI thinking
- Board-level communication, investor relations
- Culture building, talent acquisition strategy
- Industry trends, competitive positioning, risk management`,
  };
  return focus[level];
}

/**
 * Get industry-specific interview themes
 */
function getIndustryInterviewGuidance(industry?: Industry): string {
  if (!industry) return "";

  const guidance: Record<Industry, string> = {
    technology: `INDUSTRY THEMES: Technology
- Focus on system design, scalability, and technical problem-solving
- Emphasize ability to stay current with evolving tech stacks
- Questions about SDLC, testing, and deployment best practices`,
    finance: `INDUSTRY THEMES: Finance
- Focus on accuracy, attention to detail, and risk management
- Emphasize regulatory knowledge and ethical decision-making
- Questions about financial modeling, reporting, and market awareness`,
    healthcare: `INDUSTRY THEMES: Healthcare
- Focus on patient safety, quality of care, and compliance (HIPAA)
- Emphasize empathy, collaborative care, and technical precision
- Questions about clinical workflows and evidence-based practice`,
    marketing: `INDUSTRY THEMES: Marketing
- Focus on brand strategy, digital trends, and ROI metrics
- Emphasize creativity, audience insights, and campaign performance
- Questions about data-driven marketing and multi-channel strategy`,
    sales: `INDUSTRY THEMES: Sales
- Focus on quota attainment, relationship building, and persistence
- Emphasize negotiation, active listening, and solution selling
- Questions about pipeline management and closing techniques`,
    engineering: `INDUSTRY THEMES: Engineering
- Focus on technical precision, project management, and safety
- Emphasize cross-functional collaboration and resource optimization
- Questions about design standards, testing, and lifecycle management`,
    education: `INDUSTRY THEMES: Education
- Focus on pedagogy, student engagement, and outcome tracking
- Emphasize classroom management, adaptable teaching, and empathy
- Questions about curriculum development and learning assessment`,
    legal: `INDUSTRY THEMES: Legal
- Focus on analytical rigor, research, and persuasive communication
- Emphasize ethical standards, compliance, and attention to detail
- Questions about case management, legal drafting, and client advice`,
    consulting: `INDUSTRY THEMES: Consulting
- Focus on client management, strategic frameworks, and adaptability
- Emphasize business value, structured problem-solving, and influence
- Questions about diverse project experience and deliverables`,
    manufacturing: `INDUSTRY THEMES: Manufacturing
- Focus on lean methodology, operational efficiency, and safety
- Emphasize process optimization, quality control, and reliability
- Questions about supply chain integration and production planning`,
    retail: `INDUSTRY THEMES: Retail
- Focus on customer experience, operational excellence, and agility
- Emphasize sales performance, inventory control, and team spirit
- Questions about high-volume environments and service standards`,
    hospitality: `INDUSTRY THEMES: Hospitality
- Focus on service excellence, brand standards, and multitasking
- Emphasize positive attitude, problem resolution, and flexibility
- Questions about guest satisfaction and team coordination`,
    nonprofit: `INDUSTRY THEMES: Nonprofit
- Focus on mission alignment, donor relations, and resource stewardship
- Emphasize empathy, social impact, and community engagement
- Questions about program development and impact measurement`,
    government: `INDUSTRY THEMES: Government
- Focus on public service commitment, policy adherence, and transparency
- Emphasize accountability, regulatory compliance, and stakeholders
- Questions about process adherence and public impact`,
    other: "",
  };

  return `\n${guidance[industry]}`;
}


/**
 * Get difficulty distribution guidance
 */
function getDifficultyGuidance(): string {
  return `DIFFICULTY DISTRIBUTION:
- EASY (4-5 questions): Warm-up questions, standard behavioral questions, basic role-specific questions
  Examples: "Walk me through your resume", "Why this role?", basic technical concepts

- MEDIUM (8-10 questions): Core competency questions, scenario-based problem-solving, moderate technical depth
  Examples: Detailed STAR responses, trade-off discussions, typical day scenarios

- HARD (3-5 questions): Complex scenarios, leadership challenges, advanced technical questions
  Examples: Conflict resolution with senior stakeholders, system design, strategic decisions`;
}

export async function generateInterviewPrep(
  input: GenerateInterviewPrepInput
): Promise<InterviewPrepResult> {
  const { resumeData, jobDescription, seniorityLevel, industry } = input;
  const model = flashModelJson();
  const resumeText = serializeResume(resumeData);

  const systemInstruction = buildSystemInstruction(
    "Expert interview coach",
    "Generate interview prep content using only provided resume and job description. Return JSON only and do not reference external links or courses."
  );

  // Analyze candidate profile from resume
  const candidateProfile = analyzeCandidateProfile(resumeData);
  // Use provided seniority level as override, otherwise use inferred
  const effectiveSeniority = seniorityLevel || candidateProfile.inferredSeniority;

  type InterviewPrepResponse = {
    questions: Array<{
      type: "behavioral" | "technical" | "situational";
      difficulty: "easy" | "medium" | "hard";
      question: string;
      answer: string;
      keyPoints: string[];
      followUps: string[];
    }>;
    skillGaps: Array<{
      skill: string;
      category: "technical" | "soft" | "tool" | "certification" | "domain";
      importance: "critical" | "important" | "nice-to-have";
      currentLevel: "missing" | "basic" | "intermediate";
      requiredLevel: "basic" | "intermediate" | "advanced";
      learnable: boolean;
      timeToLearn: string;
      learningPath: string;
      interviewTip: string;
    }>;
    overallReadiness: number;
    strengthsToHighlight: string[];
  };

  const isValidResponse = (data: unknown): data is InterviewPrepResponse => {
    if (!data || typeof data !== "object") return false;
    const obj = data as InterviewPrepResponse;
    if (!Array.isArray(obj.questions) || !Array.isArray(obj.skillGaps)) return false;
    if (typeof obj.overallReadiness !== "number") return false;
    return Array.isArray(obj.strengthsToHighlight);
  };

  const prompt = `PROMPT_VERSION: ${PROMPT_VERSION}
TASK:
1. Generate 15-20 diverse interview questions with detailed answers
2. Identify skill gaps between the resume and job requirements
3. Assess overall interview readiness

JOB DESCRIPTION:
${wrapTag("job_description", jobDescription)}

CANDIDATE'S RESUME:
${wrapTag("resume", resumeText)}

${getCandidateProfileSection(resumeData)}

${getSeniorityQuestionFocus(effectiveSeniority)}${getIndustryInterviewGuidance(industry)}

IMPORTANT: Questions should be realistic and highly tailored to the specific industry and role level.

${getDifficultyGuidance()}

QUESTION DISTRIBUTION:
- 6-8 Behavioral questions (STAR method: Situation, Task, Action, Result)
- 5-6 Technical questions (role-specific skills, tools, methodologies)
- 4-5 Situational questions (hypothetical scenarios relevant to the role)
- 1-2 Questions about motivation/fit (why this role, why this company)

QUESTION GUIDELINES:
1. Behavioral Questions:
   - Focus on past experiences from the resume
   - Use STAR method structure in answers
   - Examples: "Tell me about a time when...", "Describe a situation where..."

2. Technical Questions:
   - Based on skills/technologies mentioned in JD and resume
   - Test practical knowledge and experience
   - Include both conceptual and applied questions
   - Calibrate depth to the seniority level

3. Situational Questions:
   - Hypothetical scenarios relevant to the role
   - Test problem-solving and decision-making
   - Examples: "How would you handle...", "What would you do if..."
   - Scale complexity to seniority level

ANSWER GUIDELINES:
- Use specific examples from the resume when possible
- Incorporate quantifiable achievements
- Show problem-solving and impact
- Demonstrate alignment with job requirements
- Be concise but comprehensive (2-3 minutes speaking time)
- Use STAR method for behavioral questions
- Match answer depth and scope to seniority level

IMPORTANT:
- Questions should be realistic and commonly asked for this role
- Answers must be based on actual resume content
- For skill gaps, be realistic about what can be learned in 1-3 weeks
- Learning paths should be specific but generic (no external links, course names, or URLs)
- Interview tips should help candidate address gaps honestly without underselling themselves
- Strengths should highlight what makes this candidate a good fit

REQUIRED JSON OUTPUT:
{
  "questions": [
    {
      "type": "behavioral|technical|situational",
      "difficulty": "easy|medium|hard",
      "question": "...",
      "answer": "...",
      "keyPoints": ["...", "..."],
      "followUps": ["...", "..."]
    }
  ],
  "skillGaps": [
    {
      "skill": "...",
      "category": "technical|soft|tool|certification|domain",
      "importance": "critical|important|nice-to-have",
      "currentLevel": "missing|basic|intermediate",
      "requiredLevel": "basic|intermediate|advanced",
      "learnable": true,
      "timeToLearn": "1-3 weeks",
      "learningPath": "Practice plan or study approach (no external URLs or course names)",
      "interviewTip": "How to address this gap honestly"
    }
  ],
  "overallReadiness": 0-100,
  "strengthsToHighlight": ["...", "...", "..."]
}

Return ONLY valid JSON.`;

  const result = await model.generateContent({
    systemInstruction,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = validateAIResponse(
    result.response.text(),
    "generateInterviewPrep"
  );
  aiLogger.debug("Interview prep raw response", {
    preview: text.substring(0, 800),
  });

  const parsed = parseAIJsonResponse<InterviewPrepResponse>(
    text,
    "generateInterviewPrep",
    isValidResponse
  );

  const questions: InterviewQuestion[] = (parsed.questions || []).map(
    (q, idx) => ({
      id: String(idx + 1),
      type: q.type,
      difficulty: q.difficulty as DifficultyLevel,
      question: q.question,
      sampleAnswer: q.answer,
      keyPoints: (q.keyPoints || []).filter((p) => p.trim().length > 0),
      followUps: (q.followUps || []).filter((f) => f.trim().length > 0),
    })
  );

  const skillGaps: SkillGap[] = (parsed.skillGaps || []).map((g, idx) => ({
    id: String(idx + 1),
    skill: g.skill,
    category: g.category,
    importance: g.importance,
    currentLevel: g.currentLevel,
    requiredLevel: g.requiredLevel,
    learnable: Boolean(g.learnable),
    timeToLearn: g.timeToLearn,
    learningPath: g.learningPath,
    interviewTip: g.interviewTip,
  }));

  return {
    questions,
    skillGaps,
    overallReadiness: Math.min(100, Math.max(0, parsed.overallReadiness || 0)),
    strengthsToHighlight: (parsed.strengthsToHighlight || []).filter(
      (s) => s.trim().length > 0
    ),
  };
}
