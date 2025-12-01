"use client";

import { useMemo } from "react";
import { ResumeData } from "@/lib/types/resume";
import { calculateResumeScore } from "@/lib/services/resume-scoring";

/**
 * Hook for caching expensive resume score calculations
 * Memoizes the result based on resume data to avoid recalculating on every render
 */
export function useCachedResumeScore(resumeData: ResumeData | undefined) {
  const score = useMemo(() => {
    if (!resumeData) return null;
    return calculateResumeScore(resumeData);
  }, [resumeData]);

  return score;
}
