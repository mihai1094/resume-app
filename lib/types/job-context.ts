/**
 * Job Description Context Types
 *
 * Used for persisting job description per resume and sharing across AI features.
 */

export interface JobDescriptionContext {
  /** Resume ID this context belongs to */
  resumeId: string;

  /** The full job description text */
  jobDescription: string;

  /** Extracted or user-provided job title */
  jobTitle?: string;

  /** Extracted or user-provided company name */
  company?: string;

  /** When the context was created */
  createdAt: number;

  /** When the context was last updated */
  updatedAt: number;

  /** Cached ATS analysis results (to avoid repeated API calls) */
  cachedAnalysis?: CachedATSAnalysis;
}

export interface CachedATSAnalysis {
  /** Overall match score (0-100) */
  matchScore: number;

  /** Keywords from JD not found in resume */
  missingKeywords: string[];

  /** Skills from resume that match JD */
  matchedSkills: string[];

  /** Timestamp when analysis was performed */
  analyzedAt: number;

  /** Hash of resume data at time of analysis (to detect changes) */
  resumeHash: string;
}

/**
 * Storage wrapper with metadata
 */
export interface StoredJobContext {
  data: JobDescriptionContext;
  version: number;
}

/**
 * Quick action types available from JD context panel
 */
export type JDQuickAction =
  | "add-skills"
  | "tailor-bullets"
  | "generate-cover"
  | "interview-prep"
  | "refresh-score";
