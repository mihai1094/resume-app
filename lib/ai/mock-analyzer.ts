import { ResumeData } from "@/lib/types/resume";

export interface JobAnalysis {
  score: number; // 0-100
  missingKeywords: string[];
  suggestions: Suggestion[];
  strengths: string[];
  improvements: string[];
}

export interface Suggestion {
  id: string;
  type: "skill" | "keyword" | "experience" | "achievement";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  current?: string;
  suggested?: string;
  action: string;
}

/**
 * Mock AI analyzer that extracts insights from job description
 * In production, this will call OpenAI API
 */
export function analyzeJobMatch(
  jobDescription: string,
  resumeData: ResumeData
): JobAnalysis {
  // Extract keywords from job description (mock - real version uses NLP)
  const keywords = extractKeywords(jobDescription);
  const requiredSkills = extractRequiredSkills(jobDescription);

  // Check what's missing in resume
  const resumeText = JSON.stringify(resumeData).toLowerCase();
  const missingKeywords = keywords.filter(
    (keyword) => !resumeText.includes(keyword.toLowerCase())
  );

  // Generate suggestions
  const suggestions: Suggestion[] = [];

  // 1. Missing keywords suggestions
  if (missingKeywords.length > 0) {
    missingKeywords.slice(0, 3).forEach((keyword, index) => {
      suggestions.push({
        id: `keyword-${index}`,
        type: "keyword",
        severity: "high",
        title: `Add "${keyword}" to your resume`,
        description: `This keyword appears ${countOccurrences(jobDescription, keyword)} times in the job description but is missing from your resume.`,
        action: `Add "${keyword}" to your skills or experience sections`,
      });
    });
  }

  // 2. Skills gap analysis
  const resumeSkills = resumeData.skills.map(s => s.name.toLowerCase());
  const missingSkills = requiredSkills.filter(
    skill => !resumeSkills.includes(skill.toLowerCase())
  );

  if (missingSkills.length > 0) {
    suggestions.push({
      id: "skills-gap",
      type: "skill",
      severity: "high",
      title: "Add missing required skills",
      description: `The job requires these skills that aren't in your resume: ${missingSkills.slice(0, 3).join(", ")}`,
      suggested: missingSkills.slice(0, 5).join(", "),
      action: "Add these skills to your Skills section if you have them",
    });
  }

  // 3. Experience optimization
  if (resumeData.workExperience.length > 0) {
    const lastExp = resumeData.workExperience[0];
    if (lastExp.description.length > 0) {
      const firstBullet = lastExp.description[0];
      if (!firstBullet.match(/\d+%|\d+\+|increased|decreased|improved/i)) {
        suggestions.push({
          id: "quantify-achievements",
          type: "achievement",
          severity: "medium",
          title: "Quantify your achievements",
          description: "Add numbers and metrics to your experience bullets to show impact.",
          current: firstBullet,
          suggested: `${firstBullet} (e.g., "Increased efficiency by 25%")`,
          action: "Add specific metrics and results to your bullet points",
        });
      }
    }
  }

  // 4. Action verbs
  const weakVerbs = ["responsible for", "worked on", "helped with"];
  const resumeExp = resumeData.workExperience.flatMap(e => e.description).join(" ").toLowerCase();
  const hasWeakVerbs = weakVerbs.some(verb => resumeExp.includes(verb));

  if (hasWeakVerbs) {
    suggestions.push({
      id: "action-verbs",
      type: "experience",
      severity: "medium",
      title: "Use stronger action verbs",
      description: "Replace passive language with powerful action verbs to show leadership and impact.",
      current: "Responsible for managing team projects",
      suggested: "Led team of 5 engineers to deliver 3 major projects on time",
      action: "Start bullets with: Led, Spearheaded, Architected, Increased, Reduced",
    });
  }

  // 5. Summary optimization
  if (!resumeData.personalInfo.summary || resumeData.personalInfo.summary.length < 100) {
    suggestions.push({
      id: "add-summary",
      type: "experience",
      severity: "low",
      title: "Add or improve professional summary",
      description: "A tailored summary helps ATS and recruiters quickly understand your fit for this role.",
      suggested: generateMockSummary(jobDescription, resumeData),
      action: "Add a 2-3 sentence summary at the top of your resume",
    });
  }

  // Calculate match score
  const score = calculateMatchScore(
    keywords,
    missingKeywords,
    requiredSkills,
    resumeSkills,
    suggestions.length
  );

  // Identify strengths
  const strengths = identifyStrengths(jobDescription, resumeData);

  // Compile improvements
  const improvements = suggestions.map(s => s.title);

  return {
    score,
    missingKeywords: missingKeywords.slice(0, 10),
    suggestions,
    strengths,
    improvements,
  };
}

function extractKeywords(jobDescription: string): string[] {
  // Mock keyword extraction (real version uses NLP/AI)
  const commonKeywords = [
    "JavaScript", "TypeScript", "React", "Node.js", "Python",
    "AWS", "Docker", "Kubernetes", "CI/CD", "Agile",
    "REST API", "GraphQL", "PostgreSQL", "MongoDB",
    "Team Leadership", "Project Management", "Scrum",
    "Machine Learning", "Data Analysis", "Problem Solving"
  ];

  const text = jobDescription.toLowerCase();
  return commonKeywords.filter(keyword =>
    text.includes(keyword.toLowerCase())
  );
}

function extractRequiredSkills(jobDescription: string): string[] {
  // Mock skill extraction
  const skillPatterns = [
    /required skills?:([^.]+)/i,
    /must have:([^.]+)/i,
    /requirements:([^.]+)/i,
  ];

  const skills: string[] = [];

  for (const pattern of skillPatterns) {
    const match = jobDescription.match(pattern);
    if (match && match[1]) {
      const extractedSkills = match[1]
        .split(/[,;]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
      skills.push(...extractedSkills);
    }
  }

  // Fallback to common skills
  if (skills.length === 0) {
    return extractKeywords(jobDescription).slice(0, 5);
  }

  return skills.slice(0, 8);
}

function countOccurrences(text: string, keyword: string): number {
  const regex = new RegExp(keyword, "gi");
  return (text.match(regex) || []).length;
}

function calculateMatchScore(
  allKeywords: string[],
  missingKeywords: string[],
  requiredSkills: string[],
  resumeSkills: string[],
  suggestionCount: number
): number {
  // Base score from keyword matching
  const keywordMatchRate = allKeywords.length > 0
    ? ((allKeywords.length - missingKeywords.length) / allKeywords.length) * 50
    : 50;

  // Skill matching score
  const matchingSkills = requiredSkills.filter(skill =>
    resumeSkills.some(rs => rs.toLowerCase().includes(skill.toLowerCase()))
  );
  const skillMatchRate = requiredSkills.length > 0
    ? (matchingSkills.length / requiredSkills.length) * 30
    : 30;

  // Penalty for suggestions
  const suggestionPenalty = Math.min(suggestionCount * 3, 20);

  const score = Math.max(0, Math.min(100, keywordMatchRate + skillMatchRate - suggestionPenalty));

  return Math.round(score);
}

function identifyStrengths(jobDescription: string, resumeData: ResumeData): string[] {
  const strengths: string[] = [];

  // Check experience level
  if (resumeData.workExperience.length >= 3) {
    strengths.push("Strong work history with multiple positions");
  }

  // Check education
  if (resumeData.education.length > 0) {
    strengths.push("Relevant educational background");
  }

  // Check skill count
  if (resumeData.skills.length >= 8) {
    strengths.push("Comprehensive skill set");
  }

  // Check for quantified achievements
  const hasMetrics = resumeData.workExperience.some(exp =>
    exp.description.some(d => /\d+%|\d+\+/.test(d))
  );
  if (hasMetrics) {
    strengths.push("Quantified achievements with measurable results");
  }

  return strengths;
}

function generateMockSummary(jobDescription: string, resumeData: ResumeData): string {
  const yearsOfExp = resumeData.workExperience.length * 2; // rough estimate
  const topSkills = resumeData.skills.slice(0, 3).map(s => s.name).join(", ");

  return `Results-driven professional with ${yearsOfExp}+ years of experience in ${topSkills}. Proven track record of delivering high-impact solutions and driving business growth. Seeking to leverage expertise in [key skill from job description] to contribute to [company name]'s success.`;
}

/**
 * Calculate ATS compatibility score
 */
export function calculateATSScore(resumeData: ResumeData): {
  score: number;
  issues: string[];
  recommendations: string[];
} {
  let score = 100;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check contact info
  if (!resumeData.personalInfo.email || !resumeData.personalInfo.phone) {
    score -= 15;
    issues.push("Missing contact information");
    recommendations.push("Add complete contact details (email and phone)");
  }

  // Check work experience
  if (resumeData.workExperience.length === 0) {
    score -= 25;
    issues.push("No work experience listed");
    recommendations.push("Add at least one work experience entry");
  } else {
    // Check for dates
    const missingDates = resumeData.workExperience.some(
      exp => !exp.startDate || (!exp.endDate && !exp.current)
    );
    if (missingDates) {
      score -= 10;
      issues.push("Missing dates in work experience");
      recommendations.push("Add start and end dates for all positions");
    }

    // Check for descriptions
    const emptyDescriptions = resumeData.workExperience.some(
      exp => exp.description.length === 0 || exp.description.every(d => !d.trim())
    );
    if (emptyDescriptions) {
      score -= 15;
      issues.push("Missing job descriptions");
      recommendations.push("Add detailed descriptions for each position");
    }
  }

  // Check education
  if (resumeData.education.length === 0) {
    score -= 10;
    issues.push("No education listed");
    recommendations.push("Add your educational background");
  }

  // Check skills
  if (resumeData.skills.length < 5) {
    score -= 10;
    issues.push("Limited skills listed");
    recommendations.push("Add at least 5-8 relevant skills");
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations,
  };
}
