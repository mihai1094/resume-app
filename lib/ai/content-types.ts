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

/**
 * YouTube learning resource for a skill
 */
export interface YouTubeResource {
  title: string;
  channelName: string;
  url: string;
  thumbnailUrl: string;
  duration: string; // e.g., "45 min", "2 hours"
  type: "crash-course" | "full-course" | "tutorial" | "project";
}

/**
 * A skill that can be learned to improve job match
 */
export interface LearnableSkill {
  id: string;
  skill: string;
  category: "technical" | "tool" | "framework" | "language" | "concept" | "soft-skill";
  importance: "critical" | "important" | "nice-to-have";
  difficultyToLearn: "easy" | "medium" | "hard";
  timeToLearn: string; // e.g., "2-3 days", "1 week"
  reason: string; // Why this skill matters for the job
  interviewTip: string; // How to discuss this in interview even as a learner
  youtubeResources: YouTubeResource[];
}

export interface ATSAnalysisResult {
  score: number;
  missingKeywords: string[];
  suggestions: ATSSuggestion[];
  strengths: string[];
  improvements: string[];
  learnableSkills?: LearnableSkill[];
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

/**
 * A skill gap between candidate's resume and job requirements
 */
export interface SkillGap {
  id: string;
  skill: string;
  category: "technical" | "soft" | "tool" | "certification" | "domain";
  importance: "critical" | "important" | "nice-to-have";
  currentLevel: "missing" | "basic" | "intermediate";
  requiredLevel: "basic" | "intermediate" | "advanced";
  learnable: boolean; // Can be learned in 1-3 weeks
  timeToLearn: string; // e.g., "1-2 weeks", "2-3 weeks"
  learningPath: string; // Brief suggestion on how to learn
  interviewTip: string; // How to address this gap in interview
}

export interface InterviewPrepResult {
  questions: InterviewQuestion[];
  skillGaps: SkillGap[];
  overallReadiness: number; // 0-100 score
  strengthsToHighlight: string[];
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

// ============================================
// Improvement Wizard Types
// ============================================

export type ImprovementOptionType =
  | "add_skill"
  | "add_bullet"
  | "update_bullet"
  | "update_summary"
  | "add_keyword_to_skills"
  | "add_keyword_to_bullet";

export interface ImprovementOption {
  id: string;
  type: ImprovementOptionType;
  content: string;
  preview: string;
  targetSection: "skills" | "experience" | "summary" | "education" | "projects";
  targetId?: string; // e.g., work experience ID for bullet updates
  targetIndex?: number; // e.g., bullet index within experience
}

export interface GenerateImprovementInput {
  suggestion: ATSSuggestion;
  resumeData: ResumeData;
  jobDescription: string;
}

export interface GenerateImprovementResult {
  options: ImprovementOption[];
  explanation: string;
}

export interface KeywordPlacement {
  keyword: string;
  placements: Array<{
    type: "skill" | "bullet";
    targetId?: string;
    targetIndex?: number;
    suggestedContent: string;
    preview: string;
  }>;
}

export interface ChangeRecord {
  id: string;
  type: ImprovementOptionType;
  section: string;
  targetId?: string;
  targetIndex?: number;
  before: string | null;
  after: string;
  suggestionId?: string;
  keyword?: string;
  timestamp: number;
}

export type WizardStep = "suggestions" | "keywords" | "summary" | "review";

export interface ImprovementWizardState {
  step: WizardStep;
  originalResume: ResumeData;
  workingResume: ResumeData;
  jobDescription: string;
  jobTitle: string;
  companyName: string;
  analysis: ATSAnalysisResult;

  // Suggestion management
  currentSuggestionIndex: number;
  appliedSuggestions: string[];
  skippedSuggestions: string[];

  // Keywords
  addedKeywords: string[];

  // Summary
  optimizedSummary: string | null;
  summaryApplied: boolean;

  // Change tracking
  changes: ChangeRecord[];

  // AI state
  isGenerating: boolean;
  generationError: string | null;
}
