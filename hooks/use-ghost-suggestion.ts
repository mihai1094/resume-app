"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { authFetch } from "@/lib/api/auth-fetch";

interface UseGhostSuggestionOptions {
  /** Current text value */
  text: string;
  /** Minimum text length before suggestions trigger */
  minLength?: number;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Whether suggestions are enabled */
  enabled?: boolean;
  /** Additional context for better suggestions */
  context?: {
    position?: string;
    company?: string;
    sectionType?: "bullet" | "summary" | "description";
  };
  /** Job description for tailored suggestions */
  jobDescription?: string;
}

interface UseGhostSuggestionReturn {
  /** The AI suggestion (null if none) */
  suggestion: string | null;
  /** Whether we're loading a suggestion */
  isLoading: boolean;
  /** Whether the suggestion is visible */
  isVisible: boolean;
  /** Accept the suggestion */
  accept: () => string | null;
  /** Dismiss the suggestion */
  dismiss: () => void;
  /** Error message if request failed */
  error: string | null;
}

// Simple in-memory cache for suggestions
const suggestionCache = new Map<string, { suggestion: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(
  text: string,
  context?: UseGhostSuggestionOptions["context"],
  jobDescription?: string
): string {
  const contextStr = context ? `${context.position || ""}_${context.company || ""}` : "";
  const jdKey = jobDescription
    ? jobDescription.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 200)
    : "";
  return `${text.trim().toLowerCase()}_${contextStr}_${jdKey}`;
}

function getCachedSuggestion(key: string): string | null {
  const cached = suggestionCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    suggestionCache.delete(key);
    return null;
  }
  return cached.suggestion;
}

function setCachedSuggestion(key: string, suggestion: string): void {
  suggestionCache.set(key, { suggestion, timestamp: Date.now() });
  // Limit cache size
  if (suggestionCache.size > 100) {
    const oldest = suggestionCache.keys().next().value;
    if (oldest) suggestionCache.delete(oldest);
  }
}

/**
 * Hook for showing AI ghost suggestions after a pause in typing.
 *
 * Features:
 * - Debounced API calls (default 2.5s)
 * - In-memory caching
 * - Cancellable requests
 * - Tab to accept, Escape to dismiss
 */
export function useGhostSuggestion({
  text,
  minLength = 15,
  debounceMs = 2500,
  enabled = true,
  context,
  jobDescription,
}: UseGhostSuggestionOptions): UseGhostSuggestionReturn {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTextRef = useRef<string>("");

  // Clear suggestion when text changes significantly
  useEffect(() => {
    // If user types more, hide suggestion
    if (text !== lastTextRef.current) {
      lastTextRef.current = text;
      setIsVisible(false);
      setSuggestion(null);
    }
  }, [text]);

  // Debounced suggestion fetching
  useEffect(() => {
    // Clear existing timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't fetch if disabled or text too short
    if (!enabled || text.trim().length < minLength) {
      setIsLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = getCacheKey(text, context, jobDescription);
    const cached = getCachedSuggestion(cacheKey);
    if (cached) {
      setSuggestion(cached);
      setIsVisible(true);
      return;
    }

    // Set debounce timer
    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await authFetch("/api/ai/ghost-suggest", {
          method: "POST",
          body: JSON.stringify({
            text: text.trim(),
            context,
            jobDescription,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to get suggestion");
        }

        const data = await response.json();

        if (data.suggestion && data.suggestion !== text.trim()) {
          setSuggestion(data.suggestion);
          setIsVisible(true);
          setCachedSuggestion(cacheKey, data.suggestion);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Request was cancelled, ignore
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to get suggestion");
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [text, minLength, debounceMs, enabled, context, jobDescription]);

  const accept = useCallback(() => {
    if (suggestion) {
      setIsVisible(false);
      const accepted = suggestion;
      setSuggestion(null);
      return accepted;
    }
    return null;
  }, [suggestion]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    setSuggestion(null);
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  return {
    suggestion,
    isLoading,
    isVisible,
    accept,
    dismiss,
    error,
  };
}
