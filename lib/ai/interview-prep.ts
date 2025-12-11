import { ResumeData } from "@/lib/types/resume";
import {
  DifficultyLevel,
  GenerateInterviewPrepInput,
  Industry,
  InterviewPrepResult,
  InterviewQuestion,
  SeniorityLevel,
  SkillGap,
} from "./content-types";
import { flashModel, safety, serializeResume } from "./shared";

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
 * Get industry-specific question themes
 */
function getIndustryQuestionThemes(industry?: Industry): string {
  const themes: Record<Industry, string> = {
    technology: `INDUSTRY THEMES: Technology
- System design and scalability discussions
- Agile/DevOps practices and collaboration
- Technical debt management, code quality
- Security considerations
- Staying current with evolving technologies`,
    finance: `INDUSTRY THEMES: Finance
- Regulatory compliance and risk management
- Analytical and quantitative problem-solving
- Market awareness and financial modeling
- Client relationship management
- Handling confidential information`,
    healthcare: `INDUSTRY THEMES: Healthcare
- Patient care and safety priorities
- HIPAA compliance and privacy
- Cross-disciplinary collaboration
- Evidence-based decision making
- Handling stress and critical situations`,
    marketing: `INDUSTRY THEMES: Marketing
- Campaign strategy and measurement
- Data-driven decision making
- Brand consistency and storytelling
- Cross-channel coordination
- Adapting to market changes`,
    sales: `INDUSTRY THEMES: Sales
- Pipeline management and forecasting
- Objection handling and negotiation
- Client relationship building
- Quota attainment strategies
- Competitive differentiation`,
    engineering: `INDUSTRY THEMES: Engineering
- Technical standards and safety protocols
- Project lifecycle management
- Cross-functional team coordination
- Quality assurance processes
- Problem-solving methodologies`,
    education: `INDUSTRY THEMES: Education
- Curriculum development and assessment
- Student engagement strategies
- Technology integration in learning
- Diversity and inclusion in education
- Parent/stakeholder communication`,
    legal: `INDUSTRY THEMES: Legal
- Case strategy and legal reasoning
- Client confidentiality and ethics
- Research and documentation rigor
- Deadline management
- Court/negotiation preparation`,
    consulting: `INDUSTRY THEMES: Consulting
- Client engagement and expectation management
- Rapid learning and adaptability
- Deliverable quality and presentation
- Practice development and business development
- Managing multiple engagements`,
    manufacturing: `INDUSTRY THEMES: Manufacturing
- Process optimization and efficiency
- Quality control and Six Sigma
- Safety protocols and compliance
- Supply chain management
- Continuous improvement culture`,
    retail: `INDUSTRY THEMES: Retail
- Customer experience and service
- Inventory and merchandising
- Sales performance optimization
- Team scheduling and management
- Loss prevention strategies`,
    hospitality: `INDUSTRY THEMES: Hospitality
- Guest experience and satisfaction
- Service recovery and problem resolution
- Team coordination during peak times
- Brand standards maintenance
- Cultural sensitivity and diversity`,
    nonprofit: `INDUSTRY THEMES: Nonprofit
- Mission alignment and passion
- Fundraising and donor relations
- Resource optimization
- Volunteer management
- Impact measurement and storytelling`,
    government: `INDUSTRY THEMES: Government
- Policy implementation and compliance
- Public service orientation
- Stakeholder communication
- Process improvement within constraints
- Transparency and accountability`,
    other: `INDUSTRY THEMES: General
- Role-specific competencies
- Problem-solving approaches
- Team collaboration
- Professional development
- Adaptability and growth mindset`,
  };
  return industry ? themes[industry] : themes.other;
}

/**
 * Get difficulty distribution guidance
 */
function getDifficultyGuidance(): string {
  return `DIFFICULTY DISTRIBUTION:
- EASY (2-3 questions): Warm-up questions, standard behavioral questions, basic role-specific questions
  Examples: "Walk me through your resume", "Why this role?", basic technical concepts

- MEDIUM (4-5 questions): Core competency questions, scenario-based problem-solving, moderate technical depth
  Examples: Detailed STAR responses, trade-off discussions, typical day scenarios

- HARD (2-3 questions): Complex scenarios, leadership challenges, advanced technical questions
  Examples: Conflict resolution with senior stakeholders, system design, strategic decisions`;
}

export async function generateInterviewPrep(
  input: GenerateInterviewPrepInput
): Promise<InterviewPrepResult> {
  const { resumeData, jobDescription, seniorityLevel, industry } = input;
  const model = flashModel();
  const resumeText = serializeResume(resumeData);

  const prompt = `You are an expert interview coach specializing in preparing candidates for job interviews by creating realistic, role-specific questions and comprehensive answers. You also analyze skill gaps between the candidate and job requirements.

TASK:
1. Generate 8-10 diverse interview questions with detailed answers
2. Identify skill gaps between the resume and job requirements
3. Assess overall interview readiness

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S RESUME:
${resumeText}

${getSeniorityQuestionFocus(seniorityLevel)}

${getIndustryQuestionThemes(industry)}

${getDifficultyGuidance()}

QUESTION DISTRIBUTION:
- 3-4 Behavioral questions (STAR method: Situation, Task, Action, Result)
- 2-3 Technical questions (role-specific skills, tools, methodologies)
- 2-3 Situational questions (hypothetical scenarios relevant to the role)
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

===== REQUIRED OUTPUT FORMAT =====

SECTION: QUESTIONS

QUESTION 1:
TYPE: behavioral|technical|situational
DIFFICULTY: easy|medium|hard
Q: [The interview question]
ANSWER: [Comprehensive answer using STAR method for behavioral, detailed explanation for technical/situational. Reference specific resume experiences when applicable.]
KEY POINTS: [Key point 1], [Key point 2], [Key point 3]
FOLLOW-UPS: [Follow-up question 1] | [Follow-up question 2]

[Repeat for all 8-10 questions]

SECTION: SKILL_GAPS

Identify 3-6 skill gaps between the resume and job requirements. Focus on gaps that are:
- Critical or important for the role
- Learnable within 1-3 weeks before the interview

GAP 1:
SKILL: [Skill/technology name]
CATEGORY: technical|soft|tool|certification|domain
IMPORTANCE: critical|important|nice-to-have
CURRENT_LEVEL: missing|basic|intermediate
REQUIRED_LEVEL: basic|intermediate|advanced
LEARNABLE: yes|no
TIME_TO_LEARN: [e.g., "1 week", "2-3 weeks", "1-2 days"]
LEARNING_PATH: [Brief actionable suggestion: specific course, tutorial, or practice method]
INTERVIEW_TIP: [How to address this gap honestly in the interview - show eagerness to learn, relate to similar experience, etc.]

[Repeat for all gaps]

SECTION: SUMMARY

READINESS_SCORE: [0-100 based on resume-to-job match]
STRENGTHS: [Strength 1] | [Strength 2] | [Strength 3] | [Strength 4]

===== END FORMAT =====

IMPORTANT:
- Questions should be realistic and commonly asked for this role
- Answers must be based on actual resume content
- For skill gaps, be realistic about what can be learned in 1-3 weeks
- Learning paths should be specific (name actual resources when possible)
- Interview tips should help candidate address gaps honestly without underselling themselves
- Strengths should highlight what makes this candidate a good fit

Generate the interview prep now:`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = result.response.text();
  console.log(
    "[AI] generateInterviewPrep raw response:",
    text.substring(0, 800)
  );

  // Parse questions
  const questions: InterviewQuestion[] = [];
  const questionBlocks = text.split(/QUESTION \d+:/i).filter((q) => q.trim());

  questionBlocks.slice(0, 10).forEach((block, idx) => {
    // Stop if we hit the skill gaps section
    if (block.includes("SECTION: SKILL_GAPS") || block.includes("GAP 1:")) {
      return;
    }

    const typeMatch = block.match(
      /TYPE:\s*(behavioral|technical|situational)/i
    );
    const difficultyMatch = block.match(/DIFFICULTY:\s*(easy|medium|hard)/i);
    const questionMatch = block.match(/Q:\s*([^\n]+)/i);
    const answerMatch = block.match(
      /ANSWER:\s*([^\n]+(?:\n(?!KEY POINTS:)[^\n]+)*)/i
    );
    const keyPointsMatch = block.match(/KEY POINTS:\s*([^\n]+)/i);
    const followUpsMatch = block.match(/FOLLOW-UPS:\s*([^\n]+)/i);

    if (typeMatch && questionMatch && answerMatch) {
      const keyPoints = keyPointsMatch
        ? keyPointsMatch[1]
            .split(/[,|]/)
            .map((p) => p.trim())
            .filter((p) => p.length > 0)
        : [];
      const followUps = followUpsMatch
        ? followUpsMatch[1]
            .split("|")
            .map((f) => f.trim())
            .filter((f) => f.length > 0)
        : [];

      questions.push({
        id: String(idx + 1),
        type: typeMatch[1].toLowerCase() as InterviewQuestion["type"],
        difficulty: (difficultyMatch?.[1]?.toLowerCase() ||
          "medium") as DifficultyLevel,
        question: questionMatch[1].trim(),
        sampleAnswer: answerMatch[1].trim(),
        keyPoints,
        followUps,
      });
    }
  });

  // Parse skill gaps
  const skillGaps: SkillGap[] = [];
  const gapBlocks = text.split(/GAP \d+:/i).filter((g) => g.trim());

  gapBlocks.slice(0, 6).forEach((block, idx) => {
    // Stop if we hit the summary section
    if (block.includes("SECTION: SUMMARY") || block.includes("READINESS_SCORE:")) {
      return;
    }

    const skillMatch = block.match(/SKILL:\s*([^\n]+)/i);
    const categoryMatch = block.match(/CATEGORY:\s*(technical|soft|tool|certification|domain)/i);
    const importanceMatch = block.match(/IMPORTANCE:\s*(critical|important|nice-to-have)/i);
    const currentLevelMatch = block.match(/CURRENT_LEVEL:\s*(missing|basic|intermediate)/i);
    const requiredLevelMatch = block.match(/REQUIRED_LEVEL:\s*(basic|intermediate|advanced)/i);
    const learnableMatch = block.match(/LEARNABLE:\s*(yes|no)/i);
    const timeMatch = block.match(/TIME_TO_LEARN:\s*([^\n]+)/i);
    const learningPathMatch = block.match(/LEARNING_PATH:\s*([^\n]+)/i);
    const interviewTipMatch = block.match(/INTERVIEW_TIP:\s*([^\n]+)/i);

    if (skillMatch && categoryMatch) {
      skillGaps.push({
        id: String(idx + 1),
        skill: skillMatch[1].trim(),
        category: categoryMatch[1].toLowerCase() as SkillGap["category"],
        importance: (importanceMatch?.[1]?.toLowerCase() || "important") as SkillGap["importance"],
        currentLevel: (currentLevelMatch?.[1]?.toLowerCase() || "missing") as SkillGap["currentLevel"],
        requiredLevel: (requiredLevelMatch?.[1]?.toLowerCase() || "intermediate") as SkillGap["requiredLevel"],
        learnable: learnableMatch?.[1]?.toLowerCase() === "yes",
        timeToLearn: timeMatch?.[1]?.trim() || "2-3 weeks",
        learningPath: learningPathMatch?.[1]?.trim() || "",
        interviewTip: interviewTipMatch?.[1]?.trim() || "",
      });
    }
  });

  // Parse summary
  const readinessMatch = text.match(/READINESS_SCORE:\s*(\d+)/i);
  const strengthsMatch = text.match(/STRENGTHS:\s*([^\n]+)/i);

  const overallReadiness = readinessMatch ? parseInt(readinessMatch[1], 10) : 70;
  const strengthsToHighlight = strengthsMatch
    ? strengthsMatch[1]
        .split("|")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];

  return {
    questions,
    skillGaps,
    overallReadiness,
    strengthsToHighlight,
  };
}
