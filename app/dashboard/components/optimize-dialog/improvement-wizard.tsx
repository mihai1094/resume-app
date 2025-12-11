"use client";

import { useCallback } from "react";
import { ResumeData } from "@/lib/types/resume";
import { ATSAnalysisResult } from "@/lib/ai/content-types";
import { useImprovementWizard } from "../../hooks/use-improvement-wizard";
import { SuggestionStep } from "./wizard-steps/suggestion-step";
import { KeywordStep } from "./wizard-steps/keyword-step";
import { SummaryStep } from "./wizard-steps/summary-step";
import { ReviewStep } from "./wizard-steps/review-step";
import { WizardHeader } from "./wizard-steps/wizard-header";
import { WizardProgress } from "./wizard-steps/wizard-progress";

interface ImprovementWizardProps {
  resume: ResumeData;
  analysis: ATSAnalysisResult;
  jobDescription: string;
  jobTitle: string;
  companyName: string;
  onComplete: (updatedResume: ResumeData) => void;
  onCancel: () => void;
}

export function ImprovementWizard({
  resume,
  analysis,
  jobDescription,
  jobTitle,
  companyName,
  onComplete,
  onCancel,
}: ImprovementWizardProps) {
  const wizard = useImprovementWizard({
    originalResume: resume,
    analysis,
    jobDescription,
    jobTitle,
    companyName,
  });

  const handleComplete = useCallback(() => {
    onComplete(wizard.workingResume);
  }, [onComplete, wizard.workingResume]);

  const handleCancel = useCallback(() => {
    if (wizard.changes.length > 0) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to discard them?"
      );
      if (!confirmed) return;
    }
    onCancel();
  }, [onCancel, wizard.changes.length]);

  return (
    <div className="flex flex-col h-full max-h-[90vh] md:max-h-[85vh]">
      {/* Header */}
      <WizardHeader
        step={wizard.step}
        jobTitle={jobTitle}
        companyName={companyName}
        onCancel={handleCancel}
        canUndo={wizard.changes.length > 0}
        onUndo={wizard.undoLastChange}
      />

      {/* Progress */}
      <WizardProgress
        step={wizard.step}
        progress={wizard.progress}
        appliedCount={wizard.appliedSuggestions.length}
        skippedCount={wizard.skippedSuggestions.length}
        totalSuggestions={analysis.suggestions.length}
        addedKeywords={wizard.addedKeywords.length}
        totalKeywords={analysis.missingKeywords.length}
        summaryApplied={wizard.summaryApplied}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        {wizard.step === "suggestions" && (
          <SuggestionStep
            wizard={wizard}
            onSkipAll={() => wizard.goToStep("keywords")}
          />
        )}

        {wizard.step === "keywords" && (
          <KeywordStep
            wizard={wizard}
            onSkipAll={() => wizard.goToStep("summary")}
          />
        )}

        {wizard.step === "summary" && (
          <SummaryStep
            wizard={wizard}
            onSkip={() => wizard.goToStep("review")}
          />
        )}

        {wizard.step === "review" && (
          <ReviewStep
            wizard={wizard}
            onComplete={handleComplete}
            onBack={() => wizard.goToStep("summary")}
          />
        )}
      </div>
    </div>
  );
}
