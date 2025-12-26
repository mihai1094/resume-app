import {
  InterviewQuestion,
  SkillGap,
  SeniorityLevel,
} from "@/lib/ai/content-types";

/**
 * Self-assessment status for a practice question
 */
export type QuestionAssessment = "nailed" | "needs-practice" | "skipped" | null;

/**
 * Current phase of the practice session
 */
export type PracticeSessionStatus = "setup" | "practicing" | "completed";

/**
 * Extended question with practice state
 */
export interface PracticeQuestion extends InterviewQuestion {
  /** User's typed answer for this question */
  userAnswer: string;
  /** User's self-assessment after revealing the answer */
  assessment: QuestionAssessment;
  /** Whether the sample answer is revealed */
  showAnswer: boolean;
  /** Time spent on this question in seconds */
  timeSpent: number;
}

/**
 * Session configuration from the setup step
 */
export interface SessionConfig {
  /** ID of the resume being used */
  resumeId: string;
  /** The job description text */
  jobDescription: string;
  /** Extracted or user-provided job title */
  jobTitle?: string;
  /** Extracted or user-provided company name */
  companyName?: string;
  /** Seniority level - auto means inferred from resume */
  seniorityLevel: SeniorityLevel | "auto";
  /** Whether the per-question timer is enabled */
  timerEnabled: boolean;
  /** Timer duration in minutes per question */
  timerMinutes: number;
}

/**
 * Statistics for a completed session
 */
export interface SessionStats {
  totalQuestions: number;
  nailedCount: number;
  needsPracticeCount: number;
  skippedCount: number;
  /** Total time spent in seconds */
  totalTimeSpent: number;
  /** Average time per question in seconds */
  averageTimePerQuestion: number;
  /** Breakdown by question type */
  byType: {
    behavioral: { total: number; nailed: number };
    technical: { total: number; nailed: number };
    situational: { total: number; nailed: number };
  };
  /** Breakdown by difficulty */
  byDifficulty: {
    easy: { total: number; nailed: number };
    medium: { total: number; nailed: number };
    hard: { total: number; nailed: number };
  };
}

/**
 * Complete interview prep session data
 */
export interface InterviewPrepSession {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: PracticeSessionStatus;
  config: SessionConfig;

  /** Generated questions with practice state */
  questions: PracticeQuestion[];
  /** Skill gaps identified from the analysis */
  skillGaps: SkillGap[];
  /** Overall readiness score (0-100) */
  overallReadiness: number;
  /** Strengths to highlight in the interview */
  strengthsToHighlight: string[];

  /** Current question index during practice */
  currentQuestionIndex: number;

  /** Session statistics (computed on completion) */
  stats: SessionStats;
}

/**
 * Summary of a session for the history list
 */
export interface SessionSummary {
  id: string;
  createdAt: number;
  /** Job title from config or extracted */
  jobTitle: string;
  /** Company name from config or extracted */
  companyName?: string;
  totalQuestions: number;
  /** Percentage of questions nailed (0-100) */
  nailedPercentage: number;
  /** Overall readiness score from AI analysis */
  overallReadiness: number;
  status: PracticeSessionStatus;
}

/**
 * Creates initial empty session stats
 */
export function createEmptyStats(): SessionStats {
  return {
    totalQuestions: 0,
    nailedCount: 0,
    needsPracticeCount: 0,
    skippedCount: 0,
    totalTimeSpent: 0,
    averageTimePerQuestion: 0,
    byType: {
      behavioral: { total: 0, nailed: 0 },
      technical: { total: 0, nailed: 0 },
      situational: { total: 0, nailed: 0 },
    },
    byDifficulty: {
      easy: { total: 0, nailed: 0 },
      medium: { total: 0, nailed: 0 },
      hard: { total: 0, nailed: 0 },
    },
  };
}

/**
 * Computes session stats from questions
 */
export function computeSessionStats(questions: PracticeQuestion[]): SessionStats {
  const stats = createEmptyStats();
  stats.totalQuestions = questions.length;

  questions.forEach((q) => {
    // Count by assessment
    if (q.assessment === "nailed") {
      stats.nailedCount++;
    } else if (q.assessment === "needs-practice") {
      stats.needsPracticeCount++;
    } else if (q.assessment === "skipped") {
      stats.skippedCount++;
    }

    // Time tracking
    stats.totalTimeSpent += q.timeSpent;

    // By type
    const typeStats = stats.byType[q.type];
    if (typeStats) {
      typeStats.total++;
      if (q.assessment === "nailed") {
        typeStats.nailed++;
      }
    }

    // By difficulty
    const diffStats = stats.byDifficulty[q.difficulty];
    if (diffStats) {
      diffStats.total++;
      if (q.assessment === "nailed") {
        diffStats.nailed++;
      }
    }
  });

  // Compute average
  stats.averageTimePerQuestion =
    stats.totalQuestions > 0
      ? Math.round(stats.totalTimeSpent / stats.totalQuestions)
      : 0;

  return stats;
}

/**
 * Converts an InterviewQuestion to a PracticeQuestion with default values
 */
export function toPracticeQuestion(q: InterviewQuestion): PracticeQuestion {
  return {
    ...q,
    userAnswer: "",
    assessment: null,
    showAnswer: false,
    timeSpent: 0,
  };
}

/**
 * Creates a session summary from a full session
 */
export function toSessionSummary(session: InterviewPrepSession): SessionSummary {
  const nailedPercentage =
    session.stats.totalQuestions > 0
      ? Math.round((session.stats.nailedCount / session.stats.totalQuestions) * 100)
      : 0;

  return {
    id: session.id,
    createdAt: session.createdAt,
    jobTitle: session.config.jobTitle || "Interview Practice",
    companyName: session.config.companyName,
    totalQuestions: session.stats.totalQuestions,
    nailedPercentage,
    overallReadiness: session.overallReadiness,
    status: session.status,
  };
}

/**
 * Creates a new session with default values
 */
export function createNewSession(
  id: string,
  resumeId: string
): InterviewPrepSession {
  return {
    id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: "setup",
    config: {
      resumeId,
      jobDescription: "",
      seniorityLevel: "auto",
      timerEnabled: false,
      timerMinutes: 3,
    },
    questions: [],
    skillGaps: [],
    overallReadiness: 0,
    strengthsToHighlight: [],
    currentQuestionIndex: 0,
    stats: createEmptyStats(),
  };
}
