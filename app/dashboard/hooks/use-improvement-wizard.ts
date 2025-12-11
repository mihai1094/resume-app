"use client";

import { useState, useCallback, useMemo } from "react";
import { ResumeData } from "@/lib/types/resume";
import {
  ATSAnalysisResult,
  ATSSuggestion,
  ChangeRecord,
  ImprovementOption,
  WizardStep,
} from "@/lib/ai/content-types";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";

interface UseImprovementWizardProps {
  originalResume: ResumeData;
  analysis: ATSAnalysisResult;
  jobDescription: string;
  jobTitle: string;
  companyName: string;
}

export function useImprovementWizard({
  originalResume,
  analysis,
  jobDescription,
  jobTitle,
  companyName,
}: UseImprovementWizardProps) {
  // Current wizard step
  const [step, setStep] = useState<WizardStep>("suggestions");

  // Working copy of resume (accumulated changes)
  const [workingResume, setWorkingResume] = useState<ResumeData>(
    JSON.parse(JSON.stringify(originalResume))
  );

  // Suggestion tracking
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([]);
  const [skippedSuggestions, setSkippedSuggestions] = useState<string[]>([]);

  // Keywords tracking
  const [addedKeywords, setAddedKeywords] = useState<string[]>([]);

  // Summary tracking
  const [optimizedSummary, setOptimizedSummary] = useState<string | null>(null);
  const [summaryApplied, setSummaryApplied] = useState(false);

  // Change history for undo
  const [changes, setChanges] = useState<ChangeRecord[]>([]);

  // AI generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Current suggestion
  const currentSuggestion = useMemo(() => {
    return analysis.suggestions[currentSuggestionIndex] || null;
  }, [analysis.suggestions, currentSuggestionIndex]);

  // Remaining suggestions count
  const remainingSuggestions = useMemo(() => {
    return analysis.suggestions.length - currentSuggestionIndex;
  }, [analysis.suggestions.length, currentSuggestionIndex]);

  // Missing keywords that haven't been added yet
  const remainingKeywords = useMemo(() => {
    return analysis.missingKeywords.filter((kw) => !addedKeywords.includes(kw));
  }, [analysis.missingKeywords, addedKeywords]);

  // Progress percentage
  const progress = useMemo(() => {
    const totalSuggestions = analysis.suggestions.length;
    const processedSuggestions = appliedSuggestions.length + skippedSuggestions.length;
    const suggestionsProgress = totalSuggestions > 0
      ? (processedSuggestions / totalSuggestions) * 40
      : 40;

    const totalKeywords = analysis.missingKeywords.length;
    const keywordsProgress = totalKeywords > 0
      ? (addedKeywords.length / totalKeywords) * 30
      : 30;

    const summaryProgress = summaryApplied ? 20 : 0;

    const baseProgress = step === "review" ? 10 : 0;

    return Math.min(100, Math.round(suggestionsProgress + keywordsProgress + summaryProgress + baseProgress));
  }, [
    analysis.suggestions.length,
    analysis.missingKeywords.length,
    appliedSuggestions.length,
    skippedSuggestions.length,
    addedKeywords.length,
    summaryApplied,
    step,
  ]);

  // Record a change for undo support
  const recordChange = useCallback((change: Omit<ChangeRecord, "id" | "timestamp">) => {
    const record: ChangeRecord = {
      ...change,
      id: generateId(),
      timestamp: Date.now(),
    };
    setChanges((prev) => [...prev, record]);
    return record;
  }, []);

  // Apply an improvement option to the working resume
  const applyImprovement = useCallback(
    (option: ImprovementOption, suggestionId?: string) => {
      setWorkingResume((prev) => {
        const updated = JSON.parse(JSON.stringify(prev)) as ResumeData;

        switch (option.type) {
          case "add_skill":
          case "add_keyword_to_skills": {
            const newSkill = {
              id: generateId(),
              name: option.content,
              category: "Technical" as const,
              level: "intermediate" as const,
            };
            updated.skills = [...(updated.skills || []), newSkill];
            recordChange({
              type: option.type,
              section: "skills",
              before: null,
              after: option.content,
              suggestionId,
            });
            break;
          }

          case "add_bullet":
          case "add_keyword_to_bullet": {
            if (option.targetId) {
              const expIndex = updated.workExperience?.findIndex(
                (exp) => exp.id === option.targetId
              );
              if (expIndex !== undefined && expIndex >= 0 && updated.workExperience) {
                const exp = updated.workExperience[expIndex];
                exp.description = [...(exp.description || []), option.content];
                recordChange({
                  type: option.type,
                  section: "experience",
                  targetId: option.targetId,
                  before: null,
                  after: option.content,
                  suggestionId,
                });
              }
            }
            break;
          }

          case "update_bullet": {
            if (option.targetId && option.targetIndex !== undefined) {
              const expIndex = updated.workExperience?.findIndex(
                (exp) => exp.id === option.targetId
              );
              if (expIndex !== undefined && expIndex >= 0 && updated.workExperience) {
                const exp = updated.workExperience[expIndex];
                const oldBullet = exp.description?.[option.targetIndex] || "";
                if (exp.description) {
                  exp.description[option.targetIndex] = option.content;
                }
                recordChange({
                  type: option.type,
                  section: "experience",
                  targetId: option.targetId,
                  targetIndex: option.targetIndex,
                  before: oldBullet,
                  after: option.content,
                  suggestionId,
                });
              }
            }
            break;
          }

          case "update_summary": {
            const oldSummary = updated.personalInfo?.summary || "";
            if (updated.personalInfo) {
              updated.personalInfo.summary = option.content;
            }
            recordChange({
              type: option.type,
              section: "summary",
              before: oldSummary,
              after: option.content,
              suggestionId,
            });
            break;
          }
        }

        return updated;
      });

      // Track applied suggestion
      if (suggestionId) {
        setAppliedSuggestions((prev) => [...prev, suggestionId]);
      }
    },
    [recordChange]
  );

  // Skip current suggestion
  const skipSuggestion = useCallback((suggestionId: string) => {
    setSkippedSuggestions((prev) => [...prev, suggestionId]);
    setCurrentSuggestionIndex((prev) => prev + 1);
  }, []);

  // Move to next suggestion
  const nextSuggestion = useCallback(() => {
    if (currentSuggestionIndex < analysis.suggestions.length - 1) {
      setCurrentSuggestionIndex((prev) => prev + 1);
    } else {
      // All suggestions processed, move to keywords step
      setStep("keywords");
    }
  }, [currentSuggestionIndex, analysis.suggestions.length]);

  // Add a keyword
  const addKeyword = useCallback(
    (keyword: string, placement: ImprovementOption) => {
      applyImprovement(placement);
      setAddedKeywords((prev) => [...prev, keyword]);
    },
    [applyImprovement]
  );

  // Skip a keyword
  const skipKeyword = useCallback((keyword: string) => {
    // Just mark as processed by not adding to addedKeywords
    // The keyword will be removed from remainingKeywords naturally
  }, []);

  // Apply optimized summary
  const applySummary = useCallback(
    (summary: string) => {
      const option: ImprovementOption = {
        id: generateId(),
        type: "update_summary",
        content: summary,
        preview: summary,
        targetSection: "summary",
      };
      applyImprovement(option);
      setOptimizedSummary(summary);
      setSummaryApplied(true);
    },
    [applyImprovement]
  );

  // Undo last change
  const undoLastChange = useCallback(() => {
    if (changes.length === 0) return;

    const lastChange = changes[changes.length - 1];
    setChanges((prev) => prev.slice(0, -1));

    setWorkingResume((prev) => {
      const updated = JSON.parse(JSON.stringify(prev)) as ResumeData;

      switch (lastChange.type) {
        case "add_skill":
        case "add_keyword_to_skills": {
          updated.skills = updated.skills?.filter(
            (s) => s.name !== lastChange.after
          );
          break;
        }

        case "add_bullet":
        case "add_keyword_to_bullet": {
          if (lastChange.targetId) {
            const exp = updated.workExperience?.find(
              (e) => e.id === lastChange.targetId
            );
            if (exp && exp.description) {
              exp.description = exp.description.filter(
                (d) => d !== lastChange.after
              );
            }
          }
          break;
        }

        case "update_bullet": {
          if (lastChange.targetId && lastChange.targetIndex !== undefined) {
            const exp = updated.workExperience?.find(
              (e) => e.id === lastChange.targetId
            );
            if (exp && exp.description && lastChange.before) {
              exp.description[lastChange.targetIndex] = lastChange.before;
            }
          }
          break;
        }

        case "update_summary": {
          if (updated.personalInfo && lastChange.before !== null) {
            updated.personalInfo.summary = lastChange.before;
          }
          setSummaryApplied(false);
          break;
        }
      }

      return updated;
    });

    // Remove from applied suggestions if applicable
    if (lastChange.suggestionId) {
      setAppliedSuggestions((prev) =>
        prev.filter((id) => id !== lastChange.suggestionId)
      );
    }

    // Remove from added keywords if applicable
    if (lastChange.keyword) {
      setAddedKeywords((prev) =>
        prev.filter((kw) => kw !== lastChange.keyword)
      );
    }

    toast.info("Change undone");
  }, [changes]);

  // Navigation between steps
  const goToStep = useCallback((newStep: WizardStep) => {
    setStep(newStep);
  }, []);

  const nextStep = useCallback(() => {
    const steps: WizardStep[] = ["suggestions", "keywords", "summary", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  }, [step]);

  const prevStep = useCallback(() => {
    const steps: WizardStep[] = ["suggestions", "keywords", "summary", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  }, [step]);

  // Check if we can skip to review (all steps optional)
  const canSkipToReview = useMemo(() => {
    return changes.length > 0;
  }, [changes.length]);

  // Reset wizard
  const reset = useCallback(() => {
    setStep("suggestions");
    setWorkingResume(JSON.parse(JSON.stringify(originalResume)));
    setCurrentSuggestionIndex(0);
    setAppliedSuggestions([]);
    setSkippedSuggestions([]);
    setAddedKeywords([]);
    setOptimizedSummary(null);
    setSummaryApplied(false);
    setChanges([]);
    setIsGenerating(false);
    setGenerationError(null);
  }, [originalResume]);

  return {
    // State
    step,
    workingResume,
    originalResume,
    jobDescription,
    jobTitle,
    companyName,
    analysis,
    currentSuggestion,
    currentSuggestionIndex,
    remainingSuggestions,
    appliedSuggestions,
    skippedSuggestions,
    remainingKeywords,
    addedKeywords,
    optimizedSummary,
    summaryApplied,
    changes,
    progress,
    isGenerating,
    generationError,
    canSkipToReview,

    // Actions
    setIsGenerating,
    setGenerationError,
    applyImprovement,
    skipSuggestion,
    nextSuggestion,
    addKeyword,
    skipKeyword,
    applySummary,
    undoLastChange,
    goToStep,
    nextStep,
    prevStep,
    reset,
  };
}

export type ImprovementWizardReturn = ReturnType<typeof useImprovementWizard>;
