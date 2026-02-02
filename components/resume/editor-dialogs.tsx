"use client";

import { ResumeData } from "@/lib/types/resume";
import { BatchUpdatePayload } from "@/hooks/use-resume";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UnsavedChangesDialog } from "@/components/shared/unsaved-changes-dialog";
import { TemplatePreviewGallery } from "./template-preview-gallery";
import { ReadinessDashboard } from "./readiness-dashboard";
import { BatchEnhanceDialog } from "@/components/ai/batch-enhance-dialog";
import { RecoveryPrompt } from "./recovery-prompt";
import { TemplateCustomization } from "./template-customizer";
import { TemplateId } from "@/lib/constants/templates";

export interface EditorDialogsProps {
  resumeData: ResumeData;
  resumeId?: string | null;
  templateCustomization: TemplateCustomization;
  selectedTemplateId: TemplateId;

  // Reset dialog
  showResetConfirmation: boolean;
  setShowResetConfirmation: (show: boolean) => void;
  onConfirmReset: () => void;

  // Unsaved changes dialog
  showUnsavedDialog: boolean;
  setShowUnsavedDialog: (show: boolean) => void;
  onSaveAndLeave: () => Promise<void>;
  onDiscardAndLeave: () => void;
  onCancelNavigation: () => void;
  isSavingBeforeNav: boolean;

  // Template gallery
  showTemplateGallery: boolean;
  setShowTemplateGallery: (show: boolean) => void;
  onSelectTemplate: (templateId: TemplateId) => void;

  // Readiness dashboard
  showReadinessDashboard: boolean;
  setShowReadinessDashboard: (show: boolean) => void;
  readinessInitialTab: "job-match" | "checklist";
  onJumpToSection: (section: string) => void;

  // Batch enhance dialog
  showBatchEnhance: boolean;
  setShowBatchEnhance: (show: boolean) => void;
  jobDescription?: string;
  onApplyBatchUpdate: (payload: BatchUpdatePayload) => void;

  // Recovery prompt
  showRecoveryPrompt: boolean;
  recoveryDraftTimestamp: Date | null;
  onRecoverDraft: () => void;
  onDiscardDraft: () => void;
}

/**
 * Contains all modal dialogs used in the resume editor.
 * This component extracts dialog rendering from the main ResumeEditor
 * to improve maintainability and reduce the editor's complexity.
 */
export function EditorDialogs({
  resumeData,
  resumeId,
  templateCustomization,
  selectedTemplateId,
  showResetConfirmation,
  setShowResetConfirmation,
  onConfirmReset,
  showUnsavedDialog,
  setShowUnsavedDialog,
  onSaveAndLeave,
  onDiscardAndLeave,
  onCancelNavigation,
  isSavingBeforeNav,
  showTemplateGallery,
  setShowTemplateGallery,
  onSelectTemplate,
  showReadinessDashboard,
  setShowReadinessDashboard,
  readinessInitialTab,
  onJumpToSection,
  showBatchEnhance,
  setShowBatchEnhance,
  jobDescription,
  onApplyBatchUpdate,
  showRecoveryPrompt,
  recoveryDraftTimestamp,
  onRecoverDraft,
  onDiscardDraft,
}: EditorDialogsProps) {
  return (
    <>
      {/* Template Preview Gallery */}
      <TemplatePreviewGallery
        open={showTemplateGallery}
        onOpenChange={setShowTemplateGallery}
        resumeData={resumeData}
        customization={templateCustomization}
        activeTemplateId={selectedTemplateId}
        onSelectTemplate={onSelectTemplate}
      />

      {/* Reset Confirmation Modal */}
      <AlertDialog
        open={showResetConfirmation}
        onOpenChange={setShowResetConfirmation}
      >
        <AlertDialogContent className="w-[95%] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Resume?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all data? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onSave={onSaveAndLeave}
        onDiscard={onDiscardAndLeave}
        onCancel={onCancelNavigation}
        isSaving={isSavingBeforeNav}
      />

      {/* Readiness Dashboard (mobile) */}
      <ReadinessDashboard
        resumeData={resumeData}
        resumeId={resumeId ?? undefined}
        open={showReadinessDashboard}
        onOpenChange={setShowReadinessDashboard}
        onJumpToSection={onJumpToSection}
        initialTab={readinessInitialTab}
      />

      {/* Batch Enhance Dialog */}
      <BatchEnhanceDialog
        resumeData={resumeData}
        jobDescription={jobDescription}
        open={showBatchEnhance}
        onOpenChange={setShowBatchEnhance}
        onApply={onApplyBatchUpdate}
      />

      {/* Recovery Prompt - shown when unsaved draft is detected */}
      {recoveryDraftTimestamp && (
        <RecoveryPrompt
          open={showRecoveryPrompt}
          onRecover={onRecoverDraft}
          onDiscard={onDiscardDraft}
          lastModified={recoveryDraftTimestamp}
        />
      )}
    </>
  );
}
