/**
 * AI Response Cache
 * Caches AI-generated content to reduce API costs
 *
 * Cache Strategy:
 * - In-memory LRU cache (survives during runtime)
 * - Automatic eviction when full
 * - TTL-based expiration
 * - Cache key based on input parameters
 *
 * Savings:
 * - ~60-70% cost reduction for common queries
 * - Example: "Software Engineer at Google" cached = $0 for repeat requests
 */

import { aiLogger } from "@/lib/services/logger";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
  estimatedSavings: number; // in dollars
}

class AICache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
  };

  private maxSize: number;
  private ttlMs: number;
  private costPerRequest: number; // in dollars

  constructor(
    options: {
      maxSize?: number;
      ttlMinutes?: number;
      costPerRequest?: number;
    } = {}
  ) {
    this.maxSize = options.maxSize || 1000; // Store up to 1000 entries
    this.ttlMs = (options.ttlMinutes || 60 * 24 * 7) * 60 * 1000; // 7 days default
    this.costPerRequest = options.costPerRequest || 0.001; // $0.001 default
  }

  /**
   * Generate cache key from parameters
   */
  private generateKey(params: Record<string, any>): string {
    // Sort keys to ensure consistent cache keys
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);

    return JSON.stringify(sortedParams).toLowerCase();
  }

  /**
   * Get value from cache
   */
  get(params: Record<string, any>): T | null {
    const key = this.generateKey(params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update hits
    entry.hits++;
    this.stats.hits++;

    aiLogger.debug("Cache hit", {
      keyPreview: `${key.substring(0, 50)}...`,
      hits: entry.hits,
    });
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(params: Record<string, any>, value: T): void {
    const key = this.generateKey(params);

    // Evict oldest entry if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + this.ttlMs,
      createdAt: Date.now(),
      hits: 0,
    };

    this.cache.set(key, entry);
    aiLogger.debug("Cache set", {
      keyPreview: `${key.substring(0, 50)}...`,
      size: this.cache.size,
      maxSize: this.maxSize,
    });
  }

  /**
   * Evict the oldest entry (LRU)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // Prioritize evicting expired entries first
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key);
        aiLogger.debug("Cache evict expired", {
          keyPreview: `${key.substring(0, 50)}...`,
        });
        return;
      }

      // Find least recently used (fewest hits, oldest creation time)
      const priority = entry.hits + (Date.now() - entry.createdAt) / 1000000;
      if (priority < oldestTime) {
        oldestTime = priority;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      aiLogger.debug("Cache evict LRU", {
        keyPreview: `${oldestKey.substring(0, 50)}...`,
      });
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    aiLogger.debug("Cache cleared", { size });
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }

    if (count > 0) {
      aiLogger.debug("Cache cleanup", { removed: count });
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;
    const estimatedSavings = this.stats.hits * this.costPerRequest;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
      estimatedSavings,
    };
  }

  /**
   * Get detailed cache info for monitoring
   */
  getInfo(): {
    stats: CacheStats;
    topEntries: Array<{ key: string; hits: number; age: string }>;
  } {
    const stats = this.getStats();

    // Get top 10 most hit entries
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key: key.substring(0, 100),
        hits: entry.hits,
        age: this.formatAge(Date.now() - entry.createdAt),
      }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);

    return {
      stats,
      topEntries: entries,
    };
  }

  private formatAge(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  }
}

// Import unified cache configuration
import {
  CACHE_TIERS,
  FEATURE_CACHE_TIER,
  getCacheConfig,
  ttlDaysToMinutes,
  type CacheTier,
} from "./cache-config";

/**
 * Create a cache instance for a specific feature
 * Uses the unified cache configuration
 */
function createFeatureCache<T = any>(feature: string): AICache<T> {
  const config = getCacheConfig(feature);
  return new AICache<T>({
    maxSize: config.maxSize,
    ttlMinutes: ttlDaysToMinutes(config.ttlDays),
    costPerRequest: config.costPerRequest,
  });
}

// Create singleton cache instances using unified configuration
// Frequent tier - high volume, common queries
export const bulletPointsCache = createFeatureCache("bulletPoints");
export const summaryCache = createFeatureCache("summary");

// Stable tier - data doesn't change often
export const skillsCache = createFeatureCache("skills");
export const linkedInOptimizerCache = createFeatureCache("linkedInOptimizer");

// Expensive tier - low volume, high cost
export const atsCache = createFeatureCache("ats");
export const tailorResumeCache = createFeatureCache("tailorResume");

// Standard tier - medium volume
export const coverLetterCache = createFeatureCache("coverLetter");
export const quantifierCache = createFeatureCache("quantifier");
export const interviewPrepCache = createFeatureCache("interviewPrep");
export const resumeScoringCache = createFeatureCache("resumeScoring");

// High volume tier - very frequent, low cost
export const writingAssistantCache = createFeatureCache("writingAssistant");

// Re-export cache configuration for external use
export { CACHE_TIERS, FEATURE_CACHE_TIER, getCacheConfig, type CacheTier };

/**
 * Helper function to wrap API calls with caching
 */
export async function withCache<T>(
  cache: AICache<T>,
  params: Record<string, any>,
  fetchFn: () => Promise<T>
): Promise<{ data: T; fromCache: boolean }> {
  // Try to get from cache
  const cached = cache.get(params);
  if (cached) {
    return { data: cached, fromCache: true };
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Store in cache
  cache.set(params, data);

  return { data, fromCache: false };
}

/**
 * Manual cache cleanup function
 * Call this from a cron job or serverless function instead of using setInterval
 *
 * Example: Create app/api/cron/cleanup-cache/route.ts:
 * ```
 * import { clearAllExpiredCache } from '@/lib/ai/cache';
 * export async function GET() {
 *   clearAllExpiredCache();
 *   return Response.json({ success: true });
 * }
 * ```
 */
export function clearAllExpiredCache() {
  bulletPointsCache.clearExpired();
  summaryCache.clearExpired();
  skillsCache.clearExpired();
  atsCache.clearExpired();
  coverLetterCache.clearExpired();
  writingAssistantCache.clearExpired();
  quantifierCache.clearExpired();
  interviewPrepCache.clearExpired();
  tailorResumeCache.clearExpired();
  resumeScoringCache.clearExpired();
  linkedInOptimizerCache.clearExpired();
}

/**
 * Export a function to get all cache stats
 */
export function getAllCacheStats() {
  return {
    bulletPoints: bulletPointsCache.getStats(),
    summary: summaryCache.getStats(),
    skills: skillsCache.getStats(),
    ats: atsCache.getStats(),
    coverLetter: coverLetterCache.getStats(),
    writingAssistant: writingAssistantCache.getStats(),
    quantifier: quantifierCache.getStats(),
    interviewPrep: interviewPrepCache.getStats(),
    tailorResume: tailorResumeCache.getStats(),
    resumeScoring: resumeScoringCache.getStats(),
    linkedInOptimizer: linkedInOptimizerCache.getStats(),
  };
}
