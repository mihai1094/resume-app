import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorDialogs } from "../editor-dialogs";
import { ResumeData } from "@/lib/types/resume";

// Mock child components
vi.mock("../template-preview-gallery", () => ({
  TemplatePreviewGallery: ({ open, onOpenChange, onSelectTemplate }: any) =>
    open ? (
      <div data-testid="template-gallery">
        <button onClick={() => onOpenChange(false)} data-testid="close-gallery">
          Close
        </button>
        <button
          onClick={() => onSelectTemplate("modern")}
          data-testid="select-template"
        >
          Select Modern
        </button>
      </div>
    ) : null,
}));

vi.mock("../readiness-dashboard", () => ({
  ReadinessDashboard: ({ open, onOpenChange, initialTab }: any) =>
    open ? (
      <div data-testid="readiness-dashboard" data-initial-tab={initialTab}>
        <button
          onClick={() => onOpenChange(false)}
          data-testid="close-readiness"
        >
          Close
        </button>
      </div>
    ) : null,
}));

vi.mock("@/components/ai/batch-enhance-dialog", () => ({
  BatchEnhanceDialog: ({ open, onOpenChange, onApply }: any) =>
    open ? (
      <div data-testid="batch-enhance-dialog">
        <button onClick={() => onOpenChange(false)} data-testid="close-batch">
          Close
        </button>
        <button
          onClick={() => onApply({ summary: "test" })}
          data-testid="apply-batch"
        >
          Apply
        </button>
      </div>
    ) : null,
}));

vi.mock("../recovery-prompt", () => ({
  RecoveryPrompt: ({ open, onRecover, onDiscard }: any) =>
    open ? (
      <div data-testid="recovery-prompt">
        <button onClick={onRecover} data-testid="recover-draft">
          Recover
        </button>
        <button onClick={onDiscard} data-testid="discard-draft">
          Discard
        </button>
      </div>
    ) : null,
}));

vi.mock("@/components/shared/unsaved-changes-dialog", () => ({
  UnsavedChangesDialog: ({
    open,
    onOpenChange,
    onSave,
    onDiscard,
    onCancel,
    isSaving,
  }: any) =>
    open ? (
      <div data-testid="unsaved-dialog">
        <button onClick={onSave} data-testid="save-changes" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button onClick={onDiscard} data-testid="discard-changes">
          Discard
        </button>
        <button onClick={onCancel} data-testid="cancel-nav">
          Cancel
        </button>
      </div>
    ) : null,
}));

describe("EditorDialogs", () => {
  const mockResumeData: ResumeData = {
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      location: "New York",
    },
    workExperience: [],
    education: [],
    skills: [],
  };

  const mockTemplateCustomization = {
    primaryColor: "#0d9488",
    secondaryColor: "#2c2c2c",
    accentColor: "#0d9488",
    fontFamily: "sans" as const,
    fontSize: 10,
    lineSpacing: 1.2,
    sectionSpacing: 1,
  };

  const defaultProps = {
    resumeData: mockResumeData,
    resumeId: "test-id",
    templateCustomization: mockTemplateCustomization,
    selectedTemplateId: "modern" as const,

    // Reset dialog
    showResetConfirmation: false,
    setShowResetConfirmation: vi.fn(),
    onConfirmReset: vi.fn(),

    // Unsaved changes dialog
    showUnsavedDialog: false,
    setShowUnsavedDialog: vi.fn(),
    onSaveAndLeave: vi.fn().mockResolvedValue(undefined),
    onDiscardAndLeave: vi.fn(),
    onCancelNavigation: vi.fn(),
    isSavingBeforeNav: false,

    // Template gallery
    showTemplateGallery: false,
    setShowTemplateGallery: vi.fn(),
    onSelectTemplate: vi.fn(),

    // Readiness dashboard
    showReadinessDashboard: false,
    setShowReadinessDashboard: vi.fn(),
    readinessInitialTab: "checklist" as const,
    onJumpToSection: vi.fn(),

    // Batch enhance dialog
    showBatchEnhance: false,
    setShowBatchEnhance: vi.fn(),
    jobDescription: "Software Engineer position",
    onApplyBatchUpdate: vi.fn(),

    // Recovery prompt
    showRecoveryPrompt: false,
    recoveryDraftTimestamp: null,
    onRecoverDraft: vi.fn(),
    onDiscardDraft: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Reset Confirmation Dialog", () => {
    it("should not render reset dialog when showResetConfirmation is false", () => {
      render(<EditorDialogs {...defaultProps} showResetConfirmation={false} />);
      expect(screen.queryByText("Reset Resume?")).not.toBeInTheDocument();
    });

    it("should render reset dialog when showResetConfirmation is true", () => {
      render(<EditorDialogs {...defaultProps} showResetConfirmation={true} />);
      expect(screen.getByText("Reset Resume?")).toBeInTheDocument();
    });

    it("should call onConfirmReset when Reset button is clicked", async () => {
      const user = userEvent.setup();
      const onConfirmReset = vi.fn();

      render(
        <EditorDialogs
          {...defaultProps}
          showResetConfirmation={true}
          onConfirmReset={onConfirmReset}
        />
      );

      const resetButton = screen.getByRole("button", { name: /reset/i });
      await user.click(resetButton);

      expect(onConfirmReset).toHaveBeenCalled();
    });

    it("should call setShowResetConfirmation(false) when Cancel is clicked", async () => {
      const user = userEvent.setup();
      const setShowResetConfirmation = vi.fn();

      render(
        <EditorDialogs
          {...defaultProps}
          showResetConfirmation={true}
          setShowResetConfirmation={setShowResetConfirmation}
        />
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(setShowResetConfirmation).toHaveBeenCalledWith(false);
    });
  });

  describe("Template Gallery", () => {
    it("should not render template gallery when showTemplateGallery is false", () => {
      render(<EditorDialogs {...defaultProps} showTemplateGallery={false} />);
      expect(screen.queryByTestId("template-gallery")).not.toBeInTheDocument();
    });

    it("should render template gallery when showTemplateGallery is true", () => {
      render(<EditorDialogs {...defaultProps} showTemplateGallery={true} />);
      expect(screen.getByTestId("template-gallery")).toBeInTheDocument();
    });

    it("should call onSelectTemplate when a template is selected", async () => {
      const user = userEvent.setup();
      const onSelectTemplate = vi.fn();

      render(
        <EditorDialogs
          {...defaultProps}
          showTemplateGallery={true}
          onSelectTemplate={onSelectTemplate}
        />
      );

      const selectButton = screen.getByTestId("select-template");
      await user.click(selectButton);

      expect(onSelectTemplate).toHaveBeenCalledWith("modern");
    });
  });

  describe("Unsaved Changes Dialog", () => {
    it("should not render unsaved dialog when showUnsavedDialog is false", () => {
      render(<EditorDialogs {...defaultProps} showUnsavedDialog={false} />);
      expect(screen.queryByTestId("unsaved-dialog")).not.toBeInTheDocument();
    });

    it("should render unsaved dialog when showUnsavedDialog is true", () => {
      render(<EditorDialogs {...defaultProps} showUnsavedDialog={true} />);
      expect(screen.getByTestId("unsaved-dialog")).toBeInTheDocument();
    });

    it("should call onSaveAndLeave when Save is clicked", async () => {
      const user = userEvent.setup();
      const onSaveAndLeave = vi.fn().mockResolvedValue(undefined);

      render(
        <EditorDialogs
          {...defaultProps}
          showUnsavedDialog={true}
          onSaveAndLeave={onSaveAndLeave}
        />
      );

      const saveButton = screen.getByTestId("save-changes");
      await user.click(saveButton);

      expect(onSaveAndLeave).toHaveBeenCalled();
    });

    it("should call onDiscardAndLeave when Discard is clicked", async () => {
      const user = userEvent.setup();
      const onDiscardAndLeave = vi.fn();

      render(
        <EditorDialogs
          {...defaultProps}
          showUnsavedDialog={true}
          onDiscardAndLeave={onDiscardAndLeave}
        />
      );

      const discardButton = screen.getByTestId("discard-changes");
      await user.click(discardButton);

      expect(onDiscardAndLeave).toHaveBeenCalled();
    });

    it("should show saving state when isSavingBeforeNav is true", () => {
      render(
        <EditorDialogs
          {...defaultProps}
          showUnsavedDialog={true}
          isSavingBeforeNav={true}
        />
      );

      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });
  });

  describe("Readiness Dashboard", () => {
    it("should not render readiness dashboard when showReadinessDashboard is false", () => {
      render(
        <EditorDialogs {...defaultProps} showReadinessDashboard={false} />
      );
      expect(
        screen.queryByTestId("readiness-dashboard")
      ).not.toBeInTheDocument();
    });

    it("should render readiness dashboard when showReadinessDashboard is true", () => {
      render(<EditorDialogs {...defaultProps} showReadinessDashboard={true} />);
      expect(screen.getByTestId("readiness-dashboard")).toBeInTheDocument();
    });

    it("should pass initialTab to readiness dashboard", () => {
      render(
        <EditorDialogs
          {...defaultProps}
          showReadinessDashboard={true}
          readinessInitialTab="job-match"
        />
      );

      const dashboard = screen.getByTestId("readiness-dashboard");
      expect(dashboard).toHaveAttribute("data-initial-tab", "job-match");
    });
  });

  describe("Batch Enhance Dialog", () => {
    it("should not render batch enhance dialog when showBatchEnhance is false", () => {
      render(<EditorDialogs {...defaultProps} showBatchEnhance={false} />);
      expect(
        screen.queryByTestId("batch-enhance-dialog")
      ).not.toBeInTheDocument();
    });

    it("should render batch enhance dialog when showBatchEnhance is true", () => {
      render(<EditorDialogs {...defaultProps} showBatchEnhance={true} />);
      expect(screen.getByTestId("batch-enhance-dialog")).toBeInTheDocument();
    });

    it("should call onApplyBatchUpdate when Apply is clicked", async () => {
      const user = userEvent.setup();
      const onApplyBatchUpdate = vi.fn();

      render(
        <EditorDialogs
          {...defaultProps}
          showBatchEnhance={true}
          onApplyBatchUpdate={onApplyBatchUpdate}
        />
      );

      const applyButton = screen.getByTestId("apply-batch");
      await user.click(applyButton);

      expect(onApplyBatchUpdate).toHaveBeenCalledWith({ summary: "test" });
    });
  });

  describe("Recovery Prompt", () => {
    it("should not render recovery prompt when recoveryDraftTimestamp is null", () => {
      render(
        <EditorDialogs
          {...defaultProps}
          showRecoveryPrompt={true}
          recoveryDraftTimestamp={null}
        />
      );
      expect(screen.queryByTestId("recovery-prompt")).not.toBeInTheDocument();
    });

    it("should render recovery prompt when conditions are met", () => {
      render(
        <EditorDialogs
          {...defaultProps}
          showRecoveryPrompt={true}
          recoveryDraftTimestamp={new Date()}
        />
      );
      expect(screen.getByTestId("recovery-prompt")).toBeInTheDocument();
    });

    it("should call onRecoverDraft when Recover is clicked", async () => {
      const user = userEvent.setup();
      const onRecoverDraft = vi.fn();

      render(
        <EditorDialogs
          {...defaultProps}
          showRecoveryPrompt={true}
          recoveryDraftTimestamp={new Date()}
          onRecoverDraft={onRecoverDraft}
        />
      );

      const recoverButton = screen.getByTestId("recover-draft");
      await user.click(recoverButton);

      expect(onRecoverDraft).toHaveBeenCalled();
    });

    it("should call onDiscardDraft when Discard is clicked", async () => {
      const user = userEvent.setup();
      const onDiscardDraft = vi.fn();

      render(
        <EditorDialogs
          {...defaultProps}
          showRecoveryPrompt={true}
          recoveryDraftTimestamp={new Date()}
          onDiscardDraft={onDiscardDraft}
        />
      );

      const discardButton = screen.getByTestId("discard-draft");
      await user.click(discardButton);

      expect(onDiscardDraft).toHaveBeenCalled();
    });
  });

  describe("Multiple Dialogs", () => {
    it("should handle multiple dialogs being open", () => {
      render(
        <EditorDialogs
          {...defaultProps}
          showTemplateGallery={true}
          showBatchEnhance={true}
        />
      );

      // Both should be rendered (though typically only one would be open at a time)
      expect(screen.getByTestId("template-gallery")).toBeInTheDocument();
      expect(screen.getByTestId("batch-enhance-dialog")).toBeInTheDocument();
    });
  });
});
