"use client";

import { useCallback, useRef } from "react";
import {
  ATSSuggestion,
  GenerateImprovementResult,
} from "@/lib/ai/content-types";
import { ResumeData } from "@/lib/types/resume";
import { authPost } from "@/lib/api/auth-fetch";

interface CacheEntry {
  result: GenerateImprovementResult;
  timestamp: number;
}

// In-memory cache for improvement options
// Shared across component instances via module scope
const optionsCache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<GenerateImprovementResult>>();

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Hook for caching and prefetching improvement options
 * Reduces API calls by caching results and preventing duplicate requests
 */
export function useImprovementOptionsCache() {
  // Track which suggestions we've already started prefetching
  const prefetchedIds = useRef<Set<string>>(new Set());

  /**
   * Generate a cache key for a suggestion
   */
  const getCacheKey = useCallback((suggestionId: string): string => {
    return `suggestion_${suggestionId}`;
  }, []);

  /**
   * Check if cache entry is still valid
   */
  const isValidCacheEntry = useCallback((entry: CacheEntry): boolean => {
    return Date.now() - entry.timestamp < CACHE_TTL;
  }, []);

  /**
   * Get cached options for a suggestion
   */
  const get = useCallback(
    (suggestionId: string): GenerateImprovementResult | undefined => {
      const key = getCacheKey(suggestionId);
      const entry = optionsCache.get(key);

      if (entry && isValidCacheEntry(entry)) {
        return entry.result;
      }

      // Clean up stale entry
      if (entry) {
        optionsCache.delete(key);
      }

      return undefined;
    },
    [getCacheKey, isValidCacheEntry]
  );

  /**
   * Store options in cache
   */
  const set = useCallback(
    (suggestionId: string, result: GenerateImprovementResult): void => {
      const key = getCacheKey(suggestionId);
      optionsCache.set(key, {
        result,
        timestamp: Date.now(),
      });
    },
    [getCacheKey]
  );

  /**
   * Fetch options from API (with deduplication)
   */
  const fetchOptions = useCallback(
    async (
      suggestion: ATSSuggestion,
      resumeData: ResumeData,
      jobDescription: string
    ): Promise<GenerateImprovementResult> => {
      const key = getCacheKey(suggestion.id);

      // Check cache first
      const cached = get(suggestion.id);
      if (cached) {
        return cached;
      }

      // Check if there's already a pending request
      const pending = pendingRequests.get(key);
      if (pending) {
        return pending;
      }

      // Create new request
      const request = (async () => {
        try {
          const response = await authPost("/api/ai/generate-improvement", {
            action: "generate_improvement",
            suggestion,
            resumeData,
            jobDescription,
          });

          if (!response.ok) {
            throw new Error("Failed to generate options");
          }

          const data = await response.json();
          const result = data.result as GenerateImprovementResult;

          // Cache the result
          set(suggestion.id, result);

          return result;
        } finally {
          // Clean up pending request
          pendingRequests.delete(key);
        }
      })();

      // Store pending request to prevent duplicates
      pendingRequests.set(key, request);

      return request;
    },
    [getCacheKey, get, set]
  );

  /**
   * Prefetch options for a suggestion (fire and forget)
   * Returns immediately, doesn't block
   */
  const prefetch = useCallback(
    (
      suggestion: ATSSuggestion,
      resumeData: ResumeData,
      jobDescription: string
    ): void => {
      // Skip if already prefetched or cached
      if (prefetchedIds.current.has(suggestion.id)) {
        return;
      }

      const cached = get(suggestion.id);
      if (cached) {
        return;
      }

      // Mark as prefetched
      prefetchedIds.current.add(suggestion.id);

      // Fire and forget - don't await
      fetchOptions(suggestion, resumeData, jobDescription).catch((error) => {
        console.warn("Prefetch failed for suggestion:", suggestion.id, error);
        // Remove from prefetched so it can be retried
        prefetchedIds.current.delete(suggestion.id);
      });
    },
    [get, fetchOptions]
  );

  /**
   * Clear all cached options
   */
  const clearCache = useCallback((): void => {
    optionsCache.clear();
    pendingRequests.clear();
    prefetchedIds.current.clear();
  }, []);

  /**
   * Check if options are being loaded for a suggestion
   */
  const isLoading = useCallback((suggestionId: string): boolean => {
    const key = getCacheKey(suggestionId);
    return pendingRequests.has(key);
  }, [getCacheKey]);

  return {
    get,
    set,
    fetchOptions,
    prefetch,
    clearCache,
    isLoading,
  };
}
