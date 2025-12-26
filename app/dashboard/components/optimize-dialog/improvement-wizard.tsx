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
import { WizardPreviewPane, WizardPreviewMobile } from "./wizard-steps/wizard-preview-pane";
import { TemplateId } from "@/lib/constants/templates";

interface ImprovementWizardProps {
  resume: ResumeData;
  templateId?: TemplateId;
  analysis: ATSAnalysisResult;
  jobDescription: string;
  jobTitle: string;
  companyName: string;
  onComplete: (updatedResume: ResumeData) => void;
  onCancel: () => void;
}

export function ImprovementWizard({
  resume,
  templateId: propTemplateId,
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

  // Get template ID from prop or use default
  const templateId = propTemplateId || "modern";

  return (
    <div className="flex flex-col h-full max-h-[90vh] md:max-h-[85vh]">
      {/* Header */}
      <WizardHeader
        step={wizard.step}
        jobTitle={jobTitle}
        companyName={companyName}
        currentScore={analysis.score}
        liveScore={wizard.liveScore}
        recentPointsGain={wizard.recentPointsGain}
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
        onStepClick={wizard.goToStep}
      />

      {/* Main content area - split layout on desktop */}
      <div className="flex-1 flex overflow-hidden">
        {/* Wizard steps content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 lg:border-r">
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

        {/* Preview pane - desktop only */}
        <div className="hidden lg:block w-[400px] xl:w-[450px] flex-shrink-0 bg-muted/10">
          <WizardPreviewPane
            resumeData={wizard.workingResume}
            templateId={templateId}
            recentChanges={wizard.changes}
          />
        </div>
      </div>

      {/* Mobile preview button */}
      <WizardPreviewMobile
        resumeData={wizard.workingResume}
        templateId={templateId}
        recentChanges={wizard.changes}
        changesCount={wizard.changes.length}
      />
    </div>
  );
}
