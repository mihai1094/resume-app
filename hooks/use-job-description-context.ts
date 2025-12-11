"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { storageConfig } from "@/config/storage";
import {
  JobDescriptionContext,
  CachedATSAnalysis,
  JDQuickAction,
} from "@/lib/types/job-context";
import { ResumeData } from "@/lib/types/resume";

const isBrowser = () => typeof window !== "undefined";

/**
 * Simple hash function for detecting resume changes
 */
function hashResumeData(data: ResumeData): string {
  const skills = data.skills?.map((s) => s.name).sort().join(",") || "";
  const bullets = data.workExperience
    ?.flatMap((w) => w.description || [])
    .join("|") || "";
  const summary = data.personalInfo?.summary || "";
  return btoa(skills + bullets + summary).slice(0, 32);
}

/**
 * Read JD context from localStorage
 */
function readContext(resumeId: string): JobDescriptionContext | null {
  if (!isBrowser()) return null;

  try {
    const key = storageConfig.keys.jobDescriptionContext(resumeId);
    const item = window.localStorage.getItem(key);
    if (!item) return null;

    const parsed = JSON.parse(item);
    // Handle both wrapped and unwrapped formats
    if (parsed && typeof parsed === "object") {
      if ("data" in parsed) {
        return parsed.data as JobDescriptionContext;
      }
      return parsed as JobDescriptionContext;
    }
    return null;
  } catch (error) {
    console.warn("Failed to read JD context from localStorage", error);
    return null;
  }
}

/**
 * Persist JD context to localStorage
 */
function persistContext(resumeId: string, context: JobDescriptionContext): boolean {
  if (!isBrowser()) return false;

  try {
    const key = storageConfig.keys.jobDescriptionContext(resumeId);
    const payload = { data: context, version: 1 };
    window.localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn("Failed to persist JD context to localStorage", error);
    return false;
  }
}

/**
 * Remove JD context from localStorage
 */
function removeContext(resumeId: string): void {
  if (!isBrowser()) return;

  try {
    const key = storageConfig.keys.jobDescriptionContext(resumeId);
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to remove JD context from localStorage", error);
  }
}

interface UseJobDescriptionContextOptions {
  resumeId: string | null;
  resumeData?: ResumeData;
  onScoreUpdate?: (score: number) => void;
}

interface UseJobDescriptionContextReturn {
  /** Current JD context (null if not set) */
  context: JobDescriptionContext | null;

  /** Whether a JD is active */
  isActive: boolean;

  /** Current match score (0-100, or null if not analyzed) */
  matchScore: number | null;

  /** Missing keywords from last analysis */
  missingKeywords: string[];

  /** Matched skills from last analysis */
  matchedSkills: string[];

  /** Whether analysis is needed (resume changed since last analysis) */
  needsRefresh: boolean;

  /** Set or update the job description */
  setJobDescription: (jd: string, jobTitle?: string, company?: string) => void;

  /** Clear the job description context */
  clearContext: () => void;

  /** Update cached analysis results */
  updateAnalysis: (analysis: Omit<CachedATSAnalysis, "analyzedAt" | "resumeHash">) => void;

  /** Whether we're loading context */
  isLoading: boolean;
}

/**
 * Hook for managing persistent job description context per resume.
 *
 * Features:
 * - Persists JD to localStorage per resume ID
 * - Caches ATS analysis results
 * - Detects when resume changes require re-analysis
 * - Provides quick action hooks
 */
export function useJobDescriptionContext({
  resumeId,
  resumeData,
  onScoreUpdate,
}: UseJobDescriptionContextOptions): UseJobDescriptionContextReturn {
  const [context, setContext] = useState<JobDescriptionContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const previousResumeIdRef = useRef<string | null>(null);

  // Load context when resumeId changes
  useEffect(() => {
    if (!resumeId) {
      setContext(null);
      setIsLoading(false);
      return;
    }

    // Only reload if resumeId actually changed
    if (previousResumeIdRef.current !== resumeId) {
      previousResumeIdRef.current = resumeId;
      setIsLoading(true);

      const loaded = readContext(resumeId);
      setContext(loaded);
      setIsLoading(false);
    }
  }, [resumeId]);

  // Persist context changes
  useEffect(() => {
    if (!resumeId || !context) return;
    persistContext(resumeId, context);
  }, [resumeId, context]);

  // Notify when score updates
  useEffect(() => {
    if (context?.cachedAnalysis?.matchScore != null && onScoreUpdate) {
      onScoreUpdate(context.cachedAnalysis.matchScore);
    }
  }, [context?.cachedAnalysis?.matchScore, onScoreUpdate]);

  // Calculate if refresh is needed
  const needsRefresh = useMemo(() => {
    if (!context?.cachedAnalysis || !resumeData) return false;
    const currentHash = hashResumeData(resumeData);
    return context.cachedAnalysis.resumeHash !== currentHash;
  }, [context?.cachedAnalysis, resumeData]);

  // Set job description
  const setJobDescription = useCallback(
    (jd: string, jobTitle?: string, company?: string) => {
      if (!resumeId) return;

      const now = Date.now();
      const newContext: JobDescriptionContext = {
        resumeId,
        jobDescription: jd,
        jobTitle,
        company,
        createdAt: context?.createdAt || now,
        updatedAt: now,
        // Clear cached analysis when JD changes
        cachedAnalysis: undefined,
      };

      setContext(newContext);
    },
    [resumeId, context?.createdAt]
  );

  // Clear context
  const clearContext = useCallback(() => {
    if (!resumeId) return;
    removeContext(resumeId);
    setContext(null);
  }, [resumeId]);

  // Update analysis cache
  const updateAnalysis = useCallback(
    (analysis: Omit<CachedATSAnalysis, "analyzedAt" | "resumeHash">) => {
      if (!context || !resumeData) return;

      const cachedAnalysis: CachedATSAnalysis = {
        ...analysis,
        analyzedAt: Date.now(),
        resumeHash: hashResumeData(resumeData),
      };

      setContext((prev) =>
        prev
          ? {
              ...prev,
              cachedAnalysis,
              updatedAt: Date.now(),
            }
          : prev
      );
    },
    [context, resumeData]
  );

  return {
    context,
    isActive: context !== null && context.jobDescription.length > 0,
    matchScore: context?.cachedAnalysis?.matchScore ?? null,
    missingKeywords: context?.cachedAnalysis?.missingKeywords ?? [],
    matchedSkills: context?.cachedAnalysis?.matchedSkills ?? [],
    needsRefresh,
    setJobDescription,
    clearContext,
    updateAnalysis,
    isLoading,
  };
}
