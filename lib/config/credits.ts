/**
 * AI Credits Configuration
 *
 * Defines credit costs for each AI operation and tier limits.
 * Free users get 30 credits/month, Premium users get unlimited.
 */

export const AI_CREDIT_COSTS = {
  // Quick operations (1 credit)
  "improve-bullet": 1,
  "suggest-skills": 1,
  "analyze-text": 1,
  "ghost-suggest": 1,
  "quantify-achievement": 1,

  // Medium operations (2 credits)
  "generate-bullets": 2,
  "generate-summary": 2,
  "score-resume": 2,

  // Heavy operations (3 credits)
  "analyze-ats": 3,
  "generate-improvement": 3,

  // Intensive operations (5 credits)
  "generate-cover-letter": 5,
  "tailor-resume": 5,
  "interview-prep": 5,
  "batch-enhance": 5,
  "optimize-linkedin": 5,
} as const;

export type AIOperation = keyof typeof AI_CREDIT_COSTS;

/**
 * Free tier limits
 */
export const FREE_TIER_LIMITS = {
  monthlyAICredits: 30,
  maxResumes: 3,
  maxCoverLetters: 3,
  interviewPrepQuestions: 5, // Free gets 5 questions only
  // New premium features - Phase 1-4
  publicLinks: 1, // 1 public resume
  versionHistory: 5, // Last 5 auto-saves
  jobApplications: 10, // Track up to 10 applications
} as const;

/**
 * Premium tier limits
 */
export const PREMIUM_TIER_LIMITS = {
  monthlyAICredits: Infinity,
  maxResumes: Infinity,
  maxCoverLetters: Infinity,
  interviewPrepQuestions: 20, // Full 15-20 questions
  // New premium features - Phase 1-4
  publicLinks: Infinity, // Unlimited public resumes
  versionHistory: Infinity, // Unlimited version history
  jobApplications: Infinity, // Unlimited job tracking
} as const;

/**
 * Get tier limits based on plan
 */
export function getTierLimits(plan: "free" | "premium") {
  return plan === "premium" ? PREMIUM_TIER_LIMITS : FREE_TIER_LIMITS;
}

/**
 * Get credit cost for an operation
 */
export function getCreditCost(operation: AIOperation): number {
  return AI_CREDIT_COSTS[operation] ?? 1;
}

/**
 * Check if an operation is valid
 */
export function isValidOperation(operation: string): operation is AIOperation {
  return operation in AI_CREDIT_COSTS;
}

/**
 * Premium-only features (not just credit-gated)
 */
export const PREMIUM_ONLY_FEATURES = [
  "batch-enhance",
  "optimize-linkedin",
  "interview-prep-full", // Full 15-20 questions
] as const;

export type PremiumFeature = (typeof PREMIUM_ONLY_FEATURES)[number];

/**
 * Check if a feature is premium-only
 */
export function isPremiumOnlyFeature(feature: string): feature is PremiumFeature {
  return PREMIUM_ONLY_FEATURES.includes(feature as PremiumFeature);
}
