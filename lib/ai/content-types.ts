import { ResumeData } from "@/lib/types/resume";

export type Tone = "professional" | "creative" | "technical";
export type AnalyzeTextContext = "bullet-point" | "summary" | "description";
export type SkillCategory =
  | "Technical"
  | "Languages"
  | "Frameworks"
  | "Tools"
  | "Soft Skills"
  | "Other";

/**
 * Locale/region for resume conventions
 * Different regions have different resume standards
 */
export type Locale = "US" | "UK" | "EU" | "APAC";

/**
 * Seniority level affects content complexity and scope
 */
export type SeniorityLevel = "entry" | "mid" | "senior" | "executive";

/**
 * Common industry categories for context-aware content
 */
export type Industry =
  | "technology"
  | "finance"
  | "healthcare"
  | "marketing"
  | "sales"
  | "engineering"
  | "education"
  | "legal"
  | "consulting"
  | "manufacturing"
  | "retail"
  | "hospitality"
  | "nonprofit"
  | "government"
  | "other";

/**
 * Interview question difficulty level
 */
export type DifficultyLevel = "easy" | "medium" | "hard";

/**
 * Base options that can be applied to most AI functions
 */
export interface AIBaseOptions {
  locale?: Locale;
  industry?: Industry;
  seniorityLevel?: SeniorityLevel;
}

export interface GenerateBulletsInput extends AIBaseOptions {
  position: string;
  company: string;
  customPrompt?: string;
}

export interface GenerateSummaryInput extends AIBaseOptions {
  firstName: string;
  lastName: string;
  jobTitle?: string;
  yearsOfExperience?: number;
  keySkills: string[];
  recentPosition?: string;
  recentCompany?: string;
  tone?: Tone;
}

export interface ATSSuggestion {
  id: string;
  type: "skill" | "keyword" | "experience" | "achievement";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  current?: string;
  suggested?: string;
  action: string;
  estimatedImpact?: number;
}

export interface ATSAnalysisResult {
  score: number;
  missingKeywords: string[];
  suggestions: ATSSuggestion[];
  strengths: string[];
  improvements: string[];
}

export interface GenerateCoverLetterInput extends AIBaseOptions {
  resumeData: ResumeData;
  jobDescription: string;
  companyName: string;
  positionTitle: string;
  hiringManagerName?: string;
  companyInfo?: string; // Optional additional company context
}

export interface CoverLetterOutput {
  salutation: string;
  introduction: string;
  bodyParagraphs: string[];
  closing: string;
  signature: string;
}

export interface WritingSuggestion {
  id: string;
  type:
    | "weak-verb"
    | "missing-metric"
    | "passive-voice"
    | "too-long"
    | "too-short"
    | "vague"
    | "improvement";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  suggestion: string;
  original?: string;
  improved?: string;
}

export interface TextAnalysisResult {
  suggestions: WritingSuggestion[];
  overallScore: number;
  strengths: string[];
}

export interface QuantificationSuggestion {
  id: string;
  approach: string;
  example: string;
  metrics: string;
  reasoning: string;
}

export interface QuantifyAchievementInput extends AIBaseOptions {
  statement: string;
  role?: string;
  companySize?: "startup" | "small" | "medium" | "large" | "enterprise";
}

export interface SuggestedSkill {
  name: string;
  category: SkillCategory;
  relevance: "high" | "medium";
  reason: string;
}

export interface SuggestSkillsInput extends AIBaseOptions {
  jobTitle: string;
  jobDescription?: string;
}

export interface InterviewQuestion {
  id: string;
  type: "behavioral" | "technical" | "situational";
  difficulty: DifficultyLevel;
  question: string;
  sampleAnswer: string;
  keyPoints: string[];
  followUps: string[];
}

export interface GenerateInterviewPrepInput extends AIBaseOptions {
  resumeData: ResumeData;
  jobDescription: string;
}

export interface TailoredResumeResult {
  summary: string;
  enhancedBullets: Record<string, string[]>;
  addedKeywords: string[];
  changes: string[];
}

export interface ResumeScore {
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
}

export interface LinkedInProfile {
  headline: string;
  about: string;
  experienceBullets: Record<string, string[]>;
  topSkills: string[];
}
