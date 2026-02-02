"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { ResumeData } from "@/lib/types/resume";
import {
  analyzeResumeReadiness,
  ReadinessResult,
  getReadinessStatus,
} from "@/lib/services/resume-readiness";

/**
 * Creates a stable hash key from resume data for memoization
 * Uses key fields that affect readiness checks to detect meaningful changes
 */
function getResumeDataHash(data: ResumeData): string {
  const keyFields = {
    // Contact info checks
    hasName: !!(data.personalInfo.firstName && data.personalInfo.lastName),
    hasEmail: !!data.personalInfo.email,
    hasPhone: !!data.personalInfo.phone,
    hasLocation: !!data.personalInfo.location,
    hasSummary: !!data.personalInfo.summary,
    summaryLength: (data.personalInfo.summary || "").trim().split(/\s+/).filter(Boolean).length,

    // Experience checks
    workCount: data.workExperience.length,
    bulletCounts: data.workExperience.map(w =>
      (w.description || []).filter(d => d.trim()).length
    ).join(","),

    // Education checks
    eduCount: data.education.length,

    // Skills checks
    skillsCount: data.skills.length,

    // Formatting checks (empty bullets)
    emptyBullets: data.workExperience.reduce(
      (count, w) => count + (w.description || []).filter(d => !d.trim()).length,
      0
    ),
  };

  return JSON.stringify(keyFields);
}

/**
 * Hook for caching resume readiness analysis
 * Memoizes the result based on meaningful changes to resume data
 */
export function useResumeReadiness(resumeData: ResumeData | undefined) {
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const cacheRef = useRef<{ hash: string; result: ReadinessResult | null }>({
    hash: "",
    result: null,
  });

  useEffect(() => {
    if (!resumeData) {
      setResult(null);
      return;
    }

    const hash = getResumeDataHash(resumeData);

    // Return cached result if data hasn't meaningfully changed
    if (hash === cacheRef.current.hash && cacheRef.current.result !== null) {
      setResult(cacheRef.current.result);
      return;
    }

    // Calculate new result and cache it
    const newResult = analyzeResumeReadiness(resumeData);
    cacheRef.current = { hash, result: newResult };
    setResult(newResult);
  }, [resumeData]);

  // Get status for header button
  const status = useMemo(() => {
    if (!result) return null;
    return getReadinessStatus(result);
  }, [result]);

  return { result, status };
}
