"use client";

import { useEffect, useCallback, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useResumeEditorShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useResumeEditorContainer } from "@/hooks/use-resume-editor-container";
import { useResumeEditorUI } from "@/hooks/use-resume-editor-ui";
import {
  useSectionNavigation,
  RESUME_SECTIONS,
  SectionConfig,
} from "@/hooks/use-section-navigation";
import { useCelebration } from "@/hooks/use-celebration";
import { SectionId } from "@/lib/constants/defaults";
import { useUser } from "@/hooks/use-user";
import { useNavigationGuard } from "@/hooks/use-navigation-guard";
import { downloadBlob, downloadJSON } from "@/lib/utils/download";
import { ResumeData } from "@/lib/types/resume";
import { SectionFormRenderer } from "./section-form-renderer";
import { EditorDialogs } from "./editor-dialogs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Briefcase,
  GraduationCap,
  Zap,
  Languages,
  AlertTriangle,
  FolderGit2,
  Award,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EditorHeader } from "./editor-header";
import { SectionNavigation } from "./section-navigation";
import { PreviewPanel } from "./preview-panel";
import { MobilePreviewOverlay } from "./mobile-preview-overlay";
import { SectionWrapper } from "./section-wrapper";
import {
  TemplateCustomizer,
  TemplateCustomization,
} from "./template-customizer";
import { TemplateId, TEMPLATES } from "@/lib/constants/templates";
import { DEFAULT_TEMPLATE_CUSTOMIZATION } from "@/lib/constants/defaults";
import {
  ColorPaletteId,
  getColorPalette,
} from "@/lib/constants/color-palettes";
import { LoadingPage } from "@/components/shared/loading";
import { WizardProvider } from "@/components/wizard";
import { MobileBottomBar } from "./mobile-bottom-bar";
import { useResumeReadiness } from "@/hooks/use-resume-readiness";
import { CommandPaletteProvider } from "@/components/command-palette";
import { useJobDescriptionContext } from "@/hooks/use-job-description-context";
import { AICommand } from "@/lib/constants/ai-commands";
import { useVersionHistory } from "@/hooks/use-version-history";

interface ResumeEditorProps {
  templateId?: TemplateId;
  jobTitle?: string;
  resumeId?: string | null;
  isImporting?: boolean;
  colorPaletteId?: ColorPaletteId;
}

// Icon map for section icons
const sectionIconMap: Record<
  SectionId,
  React.ComponentType<{ className?: string }>
> = {
  personal: User,
  experience: Briefcase,
  education: GraduationCap,
  skills: Zap,
  projects: FolderGit2,
  certifications: Award,
  languages: Languages,
  additional: Layers,
};

// Helper to add icons to sections
function addIconsToSections(sections: SectionConfig[]) {
  return sections.map((section) => ({
    ...section,
    icon: sectionIconMap[section.id],
  }));
}

// All sections with icons (used for static references like descriptions)
const allSectionsWithIcons = addIconsToSections(RESUME_SECTIONS);

export function ResumeEditor({
  templateId: initialTemplateId = "modern",
  jobTitle,
  resumeId = null,
  isImporting = false,
  colorPaletteId,
}: ResumeEditorProps) {
  const router = useRouter();
  const { user, logout } = useUser();
  const [isExporting, setIsExporting] = useState(false);

  // Define mapFieldToSection early so it can be used in other hooks
  // Maps validation error field paths to the new consolidated sections (8 sections)
  const mapFieldToSection = useCallback((fieldPath: string) => {
    // Work experience
    if (
      fieldPath.startsWith("workExperience") ||
      fieldPath.startsWith("experience")
    )
      return "experience";
    // Education
    if (fieldPath.startsWith("education")) return "education";
    // Skills
    if (fieldPath.startsWith("skills")) return "skills";
    // Projects
    if (fieldPath.startsWith("projects")) return "projects";
    // Certifications & Courses (merged section)
    if (
      fieldPath.startsWith("certifications") ||
      fieldPath.startsWith("courses")
    )
      return "certifications";
    // Languages
    if (fieldPath.startsWith("languages")) return "languages";
    // Additional sections (extra-curricular, hobbies, custom)
    if (
      fieldPath.startsWith("extraCurricular") ||
      fieldPath.startsWith("extra") ||
      fieldPath.startsWith("hobbies") ||
      fieldPath.startsWith("customSections") ||
      fieldPath.startsWith("custom")
    )
      return "additional";
    // Personal information (default)
    const personalFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "location",
      "summary",
      "website",
      "linkedin",
      "github",
      "personalInfo",
    ];
    if (personalFields.some((key) => fieldPath.startsWith(key))) {
      return "personal";
    }
    // Fallback to personal for unknown fields
    return "personal";
  }, []);

  // Container hook: Handles data persistence and loading
  const {
    resumeData,
    validation,
    updatePersonalInfo,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
    reorderWorkExperience,
    addEducation,
    updateEducation,
    removeEducation,
    reorderEducation,
    addSkill,
    updateSkill,
    removeSkill,
    addProject,
    updateProject,
    removeProject,
    reorderProjects,
    addCertification,
    addCourseAsCertification,
    updateCertification,
    removeCertification,
    addLanguage,
    updateLanguage,
    removeLanguage,
    addCourse,
    updateCourse,
    removeCourse,
    addHobby,
    updateHobby,
    removeHobby,
    addExtraCurricular,
    updateExtraCurricular,
    removeExtraCurricular,
    reorderExtraCurricular,
    addCustomSection,
    updateCustomSection,
    removeCustomSection,
    addCustomSectionItem,
    updateCustomSectionItem,
    removeCustomSectionItem,
    setWorkExperience,
    setEducation,
    setExtraCurricular,
    loadResume,
    resetResume,
    batchUpdate,
    isInitializing,
    resumeLoadError,
    cloudSaveError,
    saveStatusText,
    handleSaveAndExit: containerHandleSaveAndExit,
    handleReset: containerHandleReset,
    loadedTemplateId,
    isDirty,
    showRecoveryPrompt,
    recoveryDraftTimestamp,
    handleRecoverDraft,
    handleDiscardDraft,
    editingResumeId,
  } = useResumeEditorContainer({ resumeId, jobTitle, isImporting });

  // Version history hook
  const isPremium = user?.plan === "premium";
  const versionHistory = useVersionHistory({
    userId: user?.id || null,
    resumeId: editingResumeId || resumeId,
    isPremium,
    resumeData,
    onRestoreVersion: loadResume,
  });

  // Navigation guard: protect against losing unsaved changes
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<
    (() => void) | null
  >(null);
  const [isSavingBeforeNav, setIsSavingBeforeNav] = useState(false);

  // Check if there's content that isn't saved to savedResumes collection
  // This catches the case where auto-save works but user navigates away without explicit save
  const hasUnsavedContent = useMemo(() => {
    const hasName = Boolean(resumeData.personalInfo.firstName?.trim());
    const hasExperience = (resumeData.workExperience?.length ?? 0) > 0;
    const hasEducation = (resumeData.education?.length ?? 0) > 0;
    const hasMeaningfulContent = hasName || hasExperience || hasEducation;
    const notSavedPermanently = !editingResumeId;
    return hasMeaningfulContent && notSavedPermanently;
  }, [resumeData, editingResumeId]);

  // Warn if form is dirty OR if there's content not saved to savedResumes
  const shouldWarnOnLeave = isDirty || hasUnsavedContent;

  const handleNavigationAttempt = useCallback(() => {
    if (shouldWarnOnLeave) {
      setShowUnsavedDialog(true);
      return false;
    }
    return true;
  }, [shouldWarnOnLeave]);

  const { safeGoBack, forceGoBack } = useNavigationGuard({
    isDirty: shouldWarnOnLeave,
    onNavigateAway: handleNavigationAttempt,
  });

  const handleBack = useCallback(() => {
    if (shouldWarnOnLeave) {
      setShowUnsavedDialog(true);
      setPendingNavigation(() => () => forceGoBack("/dashboard"));
    } else {
      forceGoBack("/dashboard");
    }
  }, [shouldWarnOnLeave, forceGoBack]);

  // UI hook: Handles UI state (mobile, preview, templates, etc.)
  // Note: Defined before navigation callbacks that need selectedTemplateId
  const {
    selectedTemplateId,
    setSelectedTemplateId,
    templateCustomization,
    setTemplateCustomization,
    activeSection,
    setActiveSection,
    isMobile,
    showPreview,
    togglePreview,
    sidebarCollapsed,
    toggleSidebar,
    showCustomizer,
    toggleCustomizer,
    showTemplateGallery,
    setShowTemplateGallery,
    showResetConfirmation,
    setShowResetConfirmation,
    updateLoadedTemplate,
  } = useResumeEditorUI(initialTemplateId);

  // Navigation callbacks that need selectedTemplateId from UI hook
  const handleSaveAndLeave = useCallback(async () => {
    setIsSavingBeforeNav(true);
    try {
      const result = await containerHandleSaveAndExit(selectedTemplateId);
      if (result?.success) {
        setShowUnsavedDialog(false);
        forceGoBack("/dashboard");
      } else if (result && "code" in result && result.code === "PLAN_LIMIT") {
        const limit = "limit" in result ? result.limit : 3;
        toast.error(
          `Free plan limit reached (${limit}). Upgrade to save more.`
        );
      }
    } finally {
      setIsSavingBeforeNav(false);
    }
  }, [containerHandleSaveAndExit, forceGoBack, selectedTemplateId]);

  const handleDiscardAndLeave = useCallback(() => {
    setShowUnsavedDialog(false);
    forceGoBack("/dashboard");
  }, [forceGoBack]);

  const handleCancelNavigation = useCallback(() => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  }, []);

  // Apply color palette from URL param on initial mount
  const hasAppliedColorPalette = useRef(false);
  useEffect(() => {
    if (colorPaletteId && !hasAppliedColorPalette.current) {
      const palette = getColorPalette(colorPaletteId);
      setTemplateCustomization((prev) => ({
        ...prev,
        primaryColor: palette.primary,
        secondaryColor: palette.secondary,
        accentColor: palette.primary,
      }));
      hasAppliedColorPalette.current = true;
    }
  }, [colorPaletteId, setTemplateCustomization]);

  // Section navigation hook: Handles section navigation and validation
  const {
    canGoPrevious,
    canGoNext: hasNextSection,
    isLastSection,
    progressPercentage,
    completedSections,
    totalSections,
    currentErrors: currentSectionErrors,
    isCurrentSectionValid,
    goToPrevious,
    goToNext,
    forceGoToNext,
    goToSection,
    isSectionComplete,
    visibleSections,
  } = useSectionNavigation({
    resumeData,
    currentSection: activeSection,
    onSectionChange: setActiveSection,
    validationErrors: validation.errors,
    mapFieldToSection: mapFieldToSection,
  });

  // Add icons to visible sections for navigation components
  const visibleSectionsWithIcons = useMemo(
    () => addIconsToSections(visibleSections),
    [visibleSections]
  );

  // Check if current template supports profile photo
  const templateSupportsPhoto = useMemo(() => {
    const template = TEMPLATES.find((t) => t.id === selectedTemplateId);
    return template?.features.supportsPhoto ?? false;
  }, [selectedTemplateId]);

  // Celebration hook for section completion
  const {
    celebrateSectionComplete,
    celebrateResumeComplete,
    celebrateMilestone,
  } = useCelebration();

  // Resume readiness for mobile bottom bar
  const { status: readinessStatus } = useResumeReadiness(resumeData);
  const [showReadinessDashboard, setShowReadinessDashboard] = useState(false);
  const [readinessInitialTab, setReadinessInitialTab] = useState<
    "job-match" | "checklist"
  >("checklist");

  // Batch enhance dialog
  const [showBatchEnhance, setShowBatchEnhance] = useState(false);

  // Job description context for command palette
  const jdContext = useJobDescriptionContext({
    resumeId: resumeId || null,
    resumeData,
  });

  // Handle command palette command execution
  const handleCommandExecute = useCallback(
    (
      command: AICommand,
      context: { fieldId?: string; value?: string } | null
    ) => {
      // Route command to appropriate action
      switch (command.action) {
        case "ats-analysis":
          // Open readiness dashboard with ATS focus
          setReadinessInitialTab("job-match");
          setShowReadinessDashboard(true);
          break;
        case "enhance-all":
          // Open batch enhance dialog
          setShowBatchEnhance(true);
          break;
        case "tailor-resume":
        case "interview-prep":
        case "cover-letter":
          // These require dialogs - show toast with info for now
          // The dialogs will be accessible via the header
          toast.info(
            `Use the ${command.label} feature from the header menu or JD panel`
          );
          break;
        default:
          toast.info(`Command: ${command.label}`);
      }
    },
    []
  );

  // Track if user has interacted enough to show issues
  // Issues only shown after user navigates to another section or clicks Next
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Track which sections have been celebrated to avoid duplicates
  const celebratedSectionsRef = useRef<Set<string>>(new Set());
  const previousProgressRef = useRef<number>(0);

  // Celebrate when a section becomes complete
  useEffect(() => {
    if (!resumeData || isInitializing) return;

    // Check all sections for completion
    RESUME_SECTIONS.forEach((section) => {
      const isComplete = isSectionComplete(section.id);
      const wasCelebrated = celebratedSectionsRef.current.has(section.id);

      if (isComplete && !wasCelebrated) {
        celebratedSectionsRef.current.add(section.id);
        celebrateSectionComplete(section.id);
      }
    });

    // Check for milestone celebrations (50%, 100%)
    const currentProgress = progressPercentage;
    const previousProgress = previousProgressRef.current;

    if (previousProgress < 50 && currentProgress >= 50) {
      celebrateMilestone("Halfway there! 50% complete");
    }

    if (previousProgress < 100 && currentProgress >= 100) {
      celebrateResumeComplete();
    }

    previousProgressRef.current = currentProgress;
  }, [
    resumeData,
    isSectionComplete,
    progressPercentage,
    isInitializing,
    celebrateSectionComplete,
    celebrateMilestone,
    celebrateResumeComplete,
  ]);

  // Control when to surface validation banners per section
  const [showSectionErrors, setShowSectionErrors] = useState(false);
  type SectionKey = (typeof RESUME_SECTIONS)[number]["id"];
  const sectionDescriptions: Record<SectionKey, string> = {
    personal: "Add your contact details so employers can reach you.",
    experience:
      "Add your relevant work experience, starting with the most recent.",
    education: "Add your educational background.",
    skills: "Highlight your key skills and expertise.",
    projects: "Highlight notable projects with impact and technologies.",
    certifications: "List certifications that validate your expertise.",
    languages: "List the languages you speak and your proficiency.",
    additional: "Add hobbies, activities, or custom sections to stand out.",
  };

  useEffect(() => {
    setShowSectionErrors(false);
  }, [activeSection]);

  // Update template when loaded from Firestore
  useEffect(() => {
    updateLoadedTemplate(loadedTemplateId);
  }, [loadedTemplateId, updateLoadedTemplate]);

  const handleReset = () => {
    setShowResetConfirmation(true);
  };

  const handleConfirmReset = () => {
    containerHandleReset();
    setShowResetConfirmation(false);
  };

  const handleExport = useCallback(() => {
    setIsExporting(true);
    try {
      downloadJSON(resumeData, `resume-${Date.now()}.json`);
      toast.success("Resume exported as JSON");
    } finally {
      setIsExporting(false);
    }
  }, [resumeData]);

  const handleExportPDF = useCallback(async () => {
    // Check for completeness warnings
    const { getResumeWarnings } = await import("@/lib/utils/resume");
    const warnings = getResumeWarnings(resumeData);

    if (warnings.length > 0) {
      toast.warning("Exporting incomplete resume", {
        description: `Missing: ${warnings.slice(0, 3).join(", ")}${
          warnings.length > 3 ? "..." : ""
        }`,
        duration: 4000,
      });
    }

    setIsExporting(true);
    const loadingId = toast.loading("Preparing PDF...");
    try {
      const { exportToPDF } = await import("@/lib/services/export");
      const result = await exportToPDF(resumeData, selectedTemplateId, {
        fileName: `resume-${Date.now()}.pdf`,
        customization: templateCustomization,
      });

      if (result.success && result.blob) {
        downloadBlob(result.blob, `resume-${Date.now()}.pdf`);
        toast.success("Resume exported as PDF");
      } else {
        toast.error(
          result.error ||
            "Failed to export PDF. Check your content or try another template."
        );
      }
    } catch {
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      toast.dismiss(loadingId);
      setIsExporting(false);
    }
  }, [resumeData, selectedTemplateId, templateCustomization]);

  const handleSave = useCallback(async () => {
    // Only check core validation (Name) provided by container
    const result = await containerHandleSaveAndExit(selectedTemplateId);
    if (result?.success) {
      router.push("/dashboard");
    } else if (result && "code" in result && result.code === "PLAN_LIMIT") {
      const limit = "limit" in result ? result.limit : 3;
      toast.error(`Free plan limit reached (${limit}). Upgrade to save more.`);
    }
  }, [containerHandleSaveAndExit, router, selectedTemplateId]);

  const handleNext = useCallback(() => {
    // Mark as interacted when user clicks Next
    setHasUserInteracted(true);

    if (!isCurrentSectionValid) {
      setShowSectionErrors(true);
      // Don't block - just show errors, let user decide via banner
      return;
    }
    goToNext();
  }, [isCurrentSectionValid, goToNext, setShowSectionErrors]);

  // Force proceed even with validation errors
  const handleForceNext = useCallback(() => {
    setShowSectionErrors(false);
    setHasUserInteracted(true);
    forceGoToNext();
  }, [forceGoToNext, setShowSectionErrors]);

  // Wrapper for isSectionComplete to satisfy component type requirements
  const isSectionCompleteWrapper = useCallback(
    (section: string): boolean => {
      if (RESUME_SECTIONS.some((s) => s.id === section)) {
        return isSectionComplete(section as any);
      }
      return false;
    },
    [isSectionComplete]
  );

  // Wrapper for goToSection to satisfy component type requirements
  const goToSectionWrapper = useCallback(
    (section: string) => {
      // Mark as interacted when user navigates to a different section
      if (section !== activeSection) {
        setHasUserInteracted(true);
      }
      goToSection(section);
    },
    [goToSection, activeSection]
  );

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Keyboard shortcuts
  useResumeEditorShortcuts({
    onSave: () => {
      handleSave();
    },
    onExportPDF: handleExportPDF,
    onExportJSON: handleExport,
    onNext: isLastSection ? handleSave : handleNext,
    onPrevious: canGoPrevious ? goToPrevious : undefined,
  });

  const canProceedToNext = isLastSection || hasNextSection;

  if (resumeId && isInitializing) {
    return <LoadingPage text="Loading resume..." />;
  }

  if (resumeId && resumeLoadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
            <h2 className="text-xl font-semibold">Unable to load resume</h2>
            <p className="text-muted-foreground">
              {resumeLoadError ||
                "We couldn't find this resume or you might not have access to it."}
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard")}>
            Return to dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <CommandPaletteProvider
      onCommandExecute={handleCommandExecute}
      hasJD={jdContext.isActive}
    >
      <WizardProvider>
        <div className="min-h-screen bg-background">
          <a
            href="#resume-editor-main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary text-primary-foreground px-4 py-2 rounded shadow-lg"
          >
            Skip to editor content
          </a>
          <EditorHeader
            user={user}
            onExportJSON={handleExport}
            onExportPDF={handleExportPDF}
            onReset={handleReset}
            onLogout={handleLogout}
            onImport={loadResume}
            saveStatus={saveStatusText}
            saveError={cloudSaveError || null}
            isExporting={isExporting}
            planLimitReached={resumeLoadError === "PLAN_LIMIT"}
            completedSections={completedSections}
            totalSections={totalSections}
            showPreview={showPreview}
            onTogglePreview={togglePreview}
            showCustomizer={showCustomizer}
            onToggleCustomizer={toggleCustomizer}
            resumeData={resumeData}
            resumeId={resumeId ?? undefined}
            templateId={selectedTemplateId}
            onOpenTemplateGallery={() => setShowTemplateGallery(true)}
            onSaveAndExit={handleSave}
            onChangeTemplate={(templateId) => setSelectedTemplateId(templateId)}
            onJumpToSection={goToSectionWrapper}
            onBack={handleBack}
          />

          {/* Main Content */}
          <div id="resume-editor-main" className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <SectionNavigation
                sections={visibleSectionsWithIcons}
                activeSection={activeSection}
                onSectionChange={goToSectionWrapper}
                isSectionComplete={isSectionCompleteWrapper}
                collapsed={sidebarCollapsed}
                onToggleCollapse={toggleSidebar}
                progressPercentage={progressPercentage}
              />

              {/* Center: Form */}
              <div className="flex-1 w-full min-w-0">
                {showCustomizer ? (
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-sm">
                        Customize Template
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleCustomizer}
                      >
                        Close
                      </Button>
                    </div>
                    <Separator className="mb-4" />
                    <TemplateCustomizer
                      customization={templateCustomization}
                      onChange={(updates) =>
                        setTemplateCustomization((prev) => ({
                          ...prev,
                          ...updates,
                        }))
                      }
                      onReset={() =>
                        setTemplateCustomization({
                          ...DEFAULT_TEMPLATE_CUSTOMIZATION,
                        })
                      }
                    />
                  </Card>
                ) : (
                  <SectionWrapper
                    title={
                      RESUME_SECTIONS.find((s) => s.id === activeSection)
                        ?.label || ""
                    }
                    description={
                      sectionDescriptions[activeSection as SectionKey] ||
                      "Fill in the details for this section"
                    }
                    currentIndex={RESUME_SECTIONS.findIndex(
                      (s) => s.id === activeSection
                    )}
                    totalSections={totalSections}
                    canGoNext={canProceedToNext}
                    canGoPrevious={canGoPrevious}
                    onNext={isLastSection ? handleSave : handleNext}
                    onPrevious={goToPrevious}
                    nextLabel={isLastSection ? "Finish & Save" : "Next"}
                    isSaving={false}
                    onSave={handleSave}
                    saveLabel="Save & Exit"
                    sectionErrors={
                      showSectionErrors ? currentSectionErrors : []
                    }
                    onForceNext={hasNextSection ? handleForceNext : undefined}
                    sections={visibleSectionsWithIcons}
                    activeSectionId={activeSection}
                    onSectionChange={goToSectionWrapper}
                    isSectionComplete={isSectionCompleteWrapper}
                  >
                    <SectionFormRenderer
                      activeSection={activeSection}
                      resumeData={resumeData}
                      validationErrors={validation.errors}
                      showErrors={showSectionErrors}
                      templateSupportsPhoto={templateSupportsPhoto}
                      updatePersonalInfo={updatePersonalInfo}
                      addWorkExperience={addWorkExperience}
                      updateWorkExperience={updateWorkExperience}
                      removeWorkExperience={removeWorkExperience}
                      setWorkExperience={setWorkExperience}
                      addEducation={addEducation}
                      updateEducation={updateEducation}
                      removeEducation={removeEducation}
                      setEducation={setEducation}
                      addSkill={addSkill}
                      updateSkill={updateSkill}
                      removeSkill={removeSkill}
                      addProject={addProject}
                      updateProject={updateProject}
                      removeProject={removeProject}
                      reorderProjects={reorderProjects}
                      addCertification={addCertification}
                      addCourseAsCertification={addCourseAsCertification}
                      updateCertification={updateCertification}
                      removeCertification={removeCertification}
                      addLanguage={addLanguage}
                      updateLanguage={updateLanguage}
                      removeLanguage={removeLanguage}
                      addExtraCurricular={addExtraCurricular}
                      updateExtraCurricular={updateExtraCurricular}
                      removeExtraCurricular={removeExtraCurricular}
                      setExtraCurricular={setExtraCurricular}
                      addHobby={addHobby}
                      updateHobby={updateHobby}
                      removeHobby={removeHobby}
                      addCustomSection={addCustomSection}
                      updateCustomSection={updateCustomSection}
                      removeCustomSection={removeCustomSection}
                      addCustomSectionItem={addCustomSectionItem}
                      updateCustomSectionItem={updateCustomSectionItem}
                      removeCustomSectionItem={removeCustomSectionItem}
                    />
                  </SectionWrapper>
                )}
              </div>

              {/* Right: Preview and Customizer */}
              {showPreview && (
                <div
                  className="hidden lg:block w-[420px] shrink-0 sticky"
                  style={{ top: "var(--sticky-offset, 5rem)" }}
                >
                  <div className="space-y-4">
                    <PreviewPanel
                      key={selectedTemplateId}
                      templateId={selectedTemplateId}
                      resumeData={resumeData}
                      isValid={validation.valid}
                      customization={templateCustomization}
                      onToggleCustomizer={toggleCustomizer}
                      showCustomizer={showCustomizer}
                      onChangeTemplate={(templateId) =>
                        setSelectedTemplateId(templateId)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Bottom Bar */}
          {isMobile && (
            <MobileBottomBar
              showPreview={showPreview}
              onTogglePreview={togglePreview}
              issuesCount={
                hasUserInteracted ? readinessStatus?.issueCount ?? 0 : 0
              }
              isReady={readinessStatus?.variant === "ready"}
              hasUserInteracted={hasUserInteracted}
              onShowIssues={() => {
                setReadinessInitialTab("checklist");
                setShowReadinessDashboard(true);
              }}
              onBack={goToPrevious}
              onNext={isLastSection ? handleSave : handleNext}
              nextLabel={isLastSection ? "Finish" : "Next"}
              isFirstSection={!canGoPrevious}
              isLastSection={isLastSection}
            />
          )}

          {/* Mobile Preview Overlay */}
          {isMobile && showPreview && (
            <MobilePreviewOverlay
              templateId={selectedTemplateId}
              resumeData={resumeData}
              onClose={togglePreview}
              customization={templateCustomization}
              onToggleCustomizer={toggleCustomizer}
              showCustomizer={showCustomizer}
              onCustomizationChange={(updates) =>
                setTemplateCustomization((prev) => ({ ...prev, ...updates }))
              }
              onResetCustomization={() =>
                setTemplateCustomization({ ...DEFAULT_TEMPLATE_CUSTOMIZATION })
              }
              onChangeTemplate={(templateId) =>
                setSelectedTemplateId(templateId)
              }
            />
          )}

          {/* All editor dialogs */}
          <EditorDialogs
            resumeData={resumeData}
            resumeId={resumeId}
            templateCustomization={templateCustomization}
            selectedTemplateId={selectedTemplateId}
            showResetConfirmation={showResetConfirmation}
            setShowResetConfirmation={setShowResetConfirmation}
            onConfirmReset={handleConfirmReset}
            showUnsavedDialog={showUnsavedDialog}
            setShowUnsavedDialog={setShowUnsavedDialog}
            onSaveAndLeave={handleSaveAndLeave}
            onDiscardAndLeave={handleDiscardAndLeave}
            onCancelNavigation={handleCancelNavigation}
            isSavingBeforeNav={isSavingBeforeNav}
            showTemplateGallery={showTemplateGallery}
            setShowTemplateGallery={setShowTemplateGallery}
            onSelectTemplate={setSelectedTemplateId}
            showReadinessDashboard={showReadinessDashboard}
            setShowReadinessDashboard={setShowReadinessDashboard}
            readinessInitialTab={readinessInitialTab}
            onJumpToSection={goToSectionWrapper}
            showBatchEnhance={showBatchEnhance}
            setShowBatchEnhance={setShowBatchEnhance}
            jobDescription={jdContext.context?.jobDescription}
            onApplyBatchUpdate={batchUpdate}
            showRecoveryPrompt={showRecoveryPrompt}
            recoveryDraftTimestamp={recoveryDraftTimestamp}
            onRecoverDraft={handleRecoverDraft}
            onDiscardDraft={handleDiscardDraft}
          />
        </div>
      </WizardProvider>
    </CommandPaletteProvider>
  );
}
