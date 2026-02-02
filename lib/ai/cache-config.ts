/**
 * Unified Cache Configuration for AI Services
 *
 * Organizes cache settings into tiers based on usage patterns:
 * - frequent: High-volume, lower-cost operations (bullets, summary, writing)
 * - standard: Medium-volume operations (cover letter, quantifier, scoring)
 * - expensive: Low-volume, higher-cost operations (ATS, tailor, interview)
 * - stable: Rarely-changing data with long TTL (skills, LinkedIn)
 */

export interface CacheTierConfig {
  /** Maximum number of entries in the cache */
  maxSize: number;
  /** Time-to-live in days */
  ttlDays: number;
  /** Estimated cost per API request in dollars */
  costPerRequest: number;
}

/**
 * Cache tier configurations
 * Each tier is optimized for a specific usage pattern
 */
export const CACHE_TIERS = {
  /**
   * Frequent tier: High-volume, lower-cost operations
   * - Large cache size to maximize hit rate
   * - Medium TTL for balance between freshness and hits
   */
  frequent: {
    maxSize: 500,
    ttlDays: 7,
    costPerRequest: 0.001,
  },

  /**
   * Standard tier: Medium-volume operations
   * - Moderate cache size
   * - Standard TTL
   */
  standard: {
    maxSize: 200,
    ttlDays: 7,
    costPerRequest: 0.002,
  },

  /**
   * Expensive tier: Low-volume, higher-cost operations
   * - Smaller cache (more unique inputs)
   * - Shorter TTL (data changes frequently)
   * - Higher cost per request
   */
  expensive: {
    maxSize: 100,
    ttlDays: 1,
    costPerRequest: 0.05,
  },

  /**
   * Stable tier: Rarely-changing data
   * - Moderate cache size
   * - Long TTL (data doesn't change often)
   */
  stable: {
    maxSize: 200,
    ttlDays: 30,
    costPerRequest: 0.001,
  },

  /**
   * High-volume tier: Very high-volume, low-cost operations
   * - Largest cache size
   * - Long TTL
   */
  highVolume: {
    maxSize: 1000,
    ttlDays: 14,
    costPerRequest: 0.0005,
  },
} as const;

export type CacheTier = keyof typeof CACHE_TIERS;

/**
 * Feature-to-tier mapping
 * Maps each AI feature to its appropriate cache tier
 */
export const FEATURE_CACHE_TIER: Record<string, CacheTier> = {
  // Frequent tier - high volume, common queries
  bulletPoints: "frequent",
  summary: "frequent",

  // Standard tier - medium volume
  coverLetter: "standard",
  quantifier: "standard",
  resumeScoring: "standard",
  interviewPrep: "standard",

  // Expensive tier - low volume, high cost
  ats: "expensive",
  tailorResume: "expensive",

  // Stable tier - data doesn't change often
  skills: "stable",
  linkedInOptimizer: "stable",

  // High volume tier - very frequent, low cost
  writingAssistant: "highVolume",
};

/**
 * Get cache configuration for a feature
 */
export function getCacheConfig(feature: string): CacheTierConfig {
  const tier = FEATURE_CACHE_TIER[feature] || "standard";
  return CACHE_TIERS[tier];
}

/**
 * Convert TTL days to milliseconds
 */
export function ttlDaysToMs(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

/**
 * Convert TTL days to minutes (for legacy compatibility)
 */
export function ttlDaysToMinutes(days: number): number {
  return days * 24 * 60;
}
