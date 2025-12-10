"use client";

import { useMemo, useRef } from "react";
import { ResumeData } from "@/lib/types/resume";
import { calculateResumeScore, ResumeScore } from "@/lib/services/resume-scoring";

/**
 * Creates a stable hash key from resume data for memoization
 * Uses key fields that affect scoring to detect meaningful changes
 */
function getResumeDataHash(data: ResumeData): string {
  const keyFields = {
    // Personal info affects contact scoring
    hasEmail: !!data.personalInfo.email,
    hasPhone: !!data.personalInfo.phone,
    hasLinkedin: !!data.personalInfo.linkedin,
    hasSummary: !!data.personalInfo.summary,
    summaryLength: data.personalInfo.summary?.length || 0,

    // Experience affects multiple metrics
    workCount: data.workExperience.length,
    workDescriptions: data.workExperience.map(w => w.description?.length || 0).join(","),
    workAchievements: data.workExperience.map(w => w.achievements?.length || 0).join(","),

    // Education
    eduCount: data.education.length,

    // Skills are heavily weighted
    skillsCount: data.skills.length,
    skillNames: data.skills.map(s => s.name).sort().join(","),

    // Optional sections
    projectsCount: data.projects?.length || 0,
    certsCount: data.certifications?.length || 0,
    languagesCount: data.languages?.length || 0,
  };

  return JSON.stringify(keyFields);
}

/**
 * Hook for caching expensive resume score calculations
 * Memoizes the result based on meaningful changes to resume data
 * Uses a hash of key fields rather than object reference comparison
 */
export function useCachedResumeScore(resumeData: ResumeData | undefined) {
  const cacheRef = useRef<{ hash: string; score: ResumeScore | null }>({
    hash: "",
    score: null,
  });

  const score = useMemo(() => {
    if (!resumeData) return null;

    const hash = getResumeDataHash(resumeData);

    // Return cached score if data hasn't meaningfully changed
    if (hash === cacheRef.current.hash && cacheRef.current.score !== null) {
      return cacheRef.current.score;
    }

    // Calculate new score and cache it
    const newScore = calculateResumeScore(resumeData);
    cacheRef.current = { hash, score: newScore };

    return newScore;
  }, [resumeData]);

  return score;
}
