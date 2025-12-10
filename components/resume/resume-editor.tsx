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
import { UnsavedChangesDialog } from "@/components/shared/unsaved-changes-dialog";
import { ResumeData } from "@/lib/types/resume";
import { PersonalInfoForm } from "./forms/personal-info-form";
import { WorkExperienceForm } from "./forms/work-experience-form";
import { EducationForm } from "./forms/education-form";
import { SkillsForm } from "./forms/skills-form";
import { LanguagesForm } from "./forms/languages-form";
import { ProjectsForm } from "./forms/projects-form";
import { CertificationsForm } from "./forms/certifications-form";
import { AdditionalSectionsForm } from "./forms/additional-sections-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { TemplatePreviewGallery } from "./template-preview-gallery";
import { TemplateId } from "@/lib/constants/templates";
import { DEFAULT_TEMPLATE_CUSTOMIZATION } from "@/lib/constants/defaults";
import { LoadingPage } from "@/components/shared/loading";
import { WizardProvider } from "@/components/wizard";
import { MobileBottomBar } from "./mobile-bottom-bar";
import { useResumeReadiness } from "@/hooks/use-resume-readiness";
import { ReadinessDashboard } from "./readiness-dashboard";

interface ResumeEditorProps {
  templateId?: TemplateId;
  jobTitle?: string;
  resumeId?: string | null;
  isImporting?: boolean;
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
    if (fieldPath.startsWith("certifications") || fieldPath.startsWith("courses"))
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
    isInitializing,
    resumeLoadError,
    cloudSaveError,
    saveStatusText,
    handleSaveAndExit: containerHandleSaveAndExit,
    handleReset: containerHandleReset,
    loadedTemplateId,
    isDirty,
  } = useResumeEditorContainer({ resumeId, jobTitle, isImporting });

  // Navigation guard: protect against losing unsaved changes
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [isSavingBeforeNav, setIsSavingBeforeNav] = useState(false);

  const handleNavigationAttempt = useCallback(() => {
    if (isDirty) {
      setShowUnsavedDialog(true);
      return false;
    }
    return true;
  }, [isDirty]);

  const { safeGoBack, forceGoBack } = useNavigationGuard({
    isDirty,
    onNavigateAway: handleNavigationAttempt,
  });

  const handleBack = useCallback(() => {
    if (isDirty) {
      setShowUnsavedDialog(true);
      setPendingNavigation(() => () => forceGoBack("/dashboard"));
    } else {
      forceGoBack("/dashboard");
    }
  }, [isDirty, forceGoBack]);

  const handleSaveAndLeave = useCallback(async () => {
    setIsSavingBeforeNav(true);
    try {
      const result = await containerHandleSaveAndExit();
      if (result?.success) {
        setShowUnsavedDialog(false);
        forceGoBack("/dashboard");
      } else if (result && "code" in result && result.code === "PLAN_LIMIT") {
        const limit = "limit" in result ? result.limit : 3;
        toast.error(`Free plan limit reached (${limit}). Upgrade to save more.`);
      }
    } finally {
      setIsSavingBeforeNav(false);
    }
  }, [containerHandleSaveAndExit, forceGoBack]);

  const handleDiscardAndLeave = useCallback(() => {
    setShowUnsavedDialog(false);
    forceGoBack("/dashboard");
  }, [forceGoBack]);

  const handleCancelNavigation = useCallback(() => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  }, []);

  // UI hook: Handles UI state (mobile, preview, templates, etc.)
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

  // Celebration hook for section completion
  const { celebrateSectionComplete, celebrateResumeComplete, celebrateMilestone } = useCelebration();

  // Resume readiness for mobile bottom bar
  const { status: readinessStatus } = useResumeReadiness(resumeData);
  const [showReadinessDashboard, setShowReadinessDashboard] = useState(false);
  const [readinessInitialTab, setReadinessInitialTab] = useState<
    "job-match" | "checklist"
  >("checklist");

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
  }, [resumeData, isSectionComplete, progressPercentage, isInitializing, celebrateSectionComplete, celebrateMilestone, celebrateResumeComplete]);

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
  }, [resumeData, selectedTemplateId]);

  const handleSave = useCallback(async () => {
    // Only check core validation (Name) provided by container
    const result = await containerHandleSaveAndExit();
    if (result?.success) {
      router.push("/dashboard");
    } else if (result && "code" in result && result.code === "PLAN_LIMIT") {
      const limit = "limit" in result ? result.limit : 3;
      toast.error(`Free plan limit reached (${limit}). Upgrade to save more.`);
    }
  }, [containerHandleSaveAndExit, router]);

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
                  <h3 className="font-semibold text-sm">Customize Template</h3>
                  <Button variant="ghost" size="sm" onClick={toggleCustomizer}>
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
                  RESUME_SECTIONS.find((s) => s.id === activeSection)?.label ||
                  ""
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
                sectionErrors={showSectionErrors ? currentSectionErrors : []}
                onForceNext={hasNextSection ? handleForceNext : undefined}
                sections={visibleSectionsWithIcons}
                activeSectionId={activeSection}
                onSectionChange={goToSectionWrapper}
                isSectionComplete={isSectionCompleteWrapper}
              >
                <div className="space-y-6">
                  {activeSection === "personal" && (
                    <PersonalInfoForm
                      data={resumeData.personalInfo}
                      onChange={updatePersonalInfo}
                      validationErrors={validation.errors}
                      showErrors={showSectionErrors}
                    />
                  )}

                  {activeSection === "experience" && (
                    <WorkExperienceForm
                      experiences={resumeData.workExperience}
                      onAdd={addWorkExperience}
                      onUpdate={updateWorkExperience}
                      onRemove={removeWorkExperience}
                      onReorder={setWorkExperience}
                      validationErrors={validation.errors}
                      showErrors={showSectionErrors}
                    />
                  )}

                  {activeSection === "education" && (
                    <EducationForm
                      education={resumeData.education}
                      onAdd={addEducation}
                      onUpdate={updateEducation}
                      onRemove={removeEducation}
                      onReorder={setEducation}
                      validationErrors={validation.errors}
                      showErrors={showSectionErrors}
                    />
                  )}

                  {activeSection === "skills" && (
                    <SkillsForm
                      skills={resumeData.skills}
                      onAdd={addSkill}
                      onRemove={removeSkill}
                      onUpdate={updateSkill}
                      jobTitle={resumeData.personalInfo.jobTitle}
                    />
                  )}

                  {activeSection === "projects" && (
                    <ProjectsForm
                      projects={resumeData.projects || []}
                      onAdd={addProject}
                      onUpdate={updateProject}
                      onRemove={removeProject}
                      onReorder={reorderProjects}
                    />
                  )}

                  {activeSection === "certifications" && (
                    <CertificationsForm
                      certifications={resumeData.certifications || []}
                      onAddCertification={addCertification}
                      onAddCourse={addCourseAsCertification}
                      onUpdate={updateCertification}
                      onRemove={removeCertification}
                    />
                  )}

                  {activeSection === "languages" && (
                    <LanguagesForm
                      languages={resumeData.languages || []}
                      onAdd={addLanguage}
                      onUpdate={updateLanguage}
                      onRemove={removeLanguage}
                    />
                  )}

                  {activeSection === "additional" && (
                    <AdditionalSectionsForm
                      extraCurricular={resumeData.extraCurricular || []}
                      hobbies={resumeData.hobbies || []}
                      customSections={resumeData.customSections || []}
                      onAddExtra={addExtraCurricular}
                      onUpdateExtra={updateExtraCurricular}
                      onRemoveExtra={removeExtraCurricular}
                      onReorderExtra={setExtraCurricular}
                      onAddHobby={addHobby}
                      onUpdateHobby={updateHobby}
                      onRemoveHobby={removeHobby}
                      onAddCustomSection={addCustomSection}
                      onUpdateCustomSection={updateCustomSection}
                      onRemoveCustomSection={removeCustomSection}
                      onAddCustomItem={addCustomSectionItem}
                      onUpdateCustomItem={updateCustomSectionItem}
                      onRemoveCustomItem={removeCustomSectionItem}
                      validationErrors={validation.errors}
                      showErrors={showSectionErrors}
                    />
                  )}
                </div>
              </SectionWrapper>
            )}
          </div>

          {/* Right: Preview and Customizer */}
          {showPreview && (
            <div className="hidden lg:block w-[420px] shrink-0 sticky top-24">
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
          issuesCount={hasUserInteracted ? (readinessStatus?.issueCount ?? 0) : 0}
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
          onChangeTemplate={(templateId) => setSelectedTemplateId(templateId)}
        />
      )}

      <TemplatePreviewGallery
        open={showTemplateGallery}
        onOpenChange={setShowTemplateGallery}
        resumeData={resumeData}
        customization={templateCustomization}
        activeTemplateId={selectedTemplateId}
        onSelectTemplate={setSelectedTemplateId}
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
              onClick={handleConfirmReset}
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
        onSave={handleSaveAndLeave}
        onDiscard={handleDiscardAndLeave}
        onCancel={handleCancelNavigation}
        isSaving={isSavingBeforeNav}
      />

      {/* Readiness Dashboard (mobile) */}
      <ReadinessDashboard
        resumeData={resumeData}
        resumeId={resumeId ?? undefined}
        open={showReadinessDashboard}
        onOpenChange={setShowReadinessDashboard}
        onJumpToSection={goToSectionWrapper}
        initialTab={readinessInitialTab}
      />
      </div>
    </WizardProvider>
  );
}
