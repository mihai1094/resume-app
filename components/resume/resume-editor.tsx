"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useResumeEditorShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useResumeEditorContainer } from "@/hooks/use-resume-editor-container";
import { useResumeEditorUI } from "@/hooks/use-resume-editor-ui";
import {
  useSectionNavigation,
  RESUME_SECTIONS,
} from "@/hooks/use-section-navigation";
import { SectionId } from "@/lib/constants/defaults";
import { useUser } from "@/hooks/use-user";
import { downloadBlob, downloadJSON } from "@/lib/utils/download";
import { ResumeData } from "@/lib/types/resume";
import { PersonalInfoForm } from "./forms/personal-info-form";
import { WorkExperienceForm } from "./forms/work-experience-form";
import { EducationForm } from "./forms/education-form";
import { SkillsForm } from "./forms/skills-form";
import { LanguagesForm } from "./forms/languages-form";
import { CoursesForm } from "./forms/courses-form";
import { HobbiesForm } from "./forms/hobbies-form";
import { ExtraCurricularForm } from "./forms/extra-curricular-form";
import { ProjectsForm } from "./forms/projects-form";
import { CertificationsForm } from "./forms/certifications-form";
import { CustomSectionsForm } from "./forms/custom-sections-form";
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
  Eye,
  EyeOff,
  User,
  Briefcase,
  GraduationCap,
  Zap,
  Languages,
  BookOpen,
  Heart,
  Trophy,
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

interface ResumeEditorProps {
  templateId?: TemplateId;
  jobTitle?: string;
  resumeId?: string | null;
  isImporting?: boolean;
}

// Extend sections configuration with icons for use in UI
const sectionsWithIcons = RESUME_SECTIONS.map((section) => {
  const iconMap: Record<
    typeof section.id,
    React.ComponentType<{ className?: string }>
  > = {
    personal: User,
    experience: Briefcase,
    education: GraduationCap,
    skills: Zap,
    projects: FolderGit2,
    certifications: Award,
    languages: Languages,
    courses: BookOpen,
    hobbies: Heart,
    extra: Trophy,
    custom: Layers,
  };
  return { ...section, icon: iconMap[section.id] };
});

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
    // Certifications
    if (fieldPath.startsWith("certifications")) return "certifications";
    // Languages
    if (fieldPath.startsWith("languages")) return "languages";
    // Courses & Certifications
    if (fieldPath.startsWith("courses")) return "courses";
    // Hobbies & Interests
    if (fieldPath.startsWith("hobbies")) return "hobbies";
    // Extra-curricular Activities
    if (
      fieldPath.startsWith("extraCurricular") ||
      fieldPath.startsWith("extra")
    )
      return "extra";
    if (
      fieldPath.startsWith("customSections") ||
      fieldPath.startsWith("custom")
    )
      return "custom";
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
  } = useResumeEditorContainer({ resumeId, jobTitle, isImporting });

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
    goToSection,
    isSectionComplete,
  } = useSectionNavigation({
    resumeData,
    currentSection: activeSection,
    onSectionChange: setActiveSection,
    validationErrors: validation.errors,
    mapFieldToSection: mapFieldToSection,
  });

  // Control when to surface validation banners per section
  const [showSectionErrors, setShowSectionErrors] = useState(false);
  const skippableSections: SectionId[] = [
    "experience",
    "education",
    "projects",
    "certifications",
    "languages",
    "courses",
    "hobbies",
    "extra",
    "custom",
  ];
  const canSkipCurrent = skippableSections.includes(activeSection);
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
    courses: "Add courses or certifications that strengthen your profile.",
    hobbies: "Share hobbies or interests that reflect who you are.",
    extra: "Add extra-curricular activities, volunteering, or clubs.",
    custom: "Create custom sections to showcase anything else.",
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
    } else if ((result as any)?.code === "PLAN_LIMIT") {
      const limit = (result as any).limit ?? 3;
      toast.error(`Free plan limit reached (${limit}). Upgrade to save more.`);
    }
  }, [containerHandleSaveAndExit, router]);

  const handleNext = useCallback(() => {
    if (!isCurrentSectionValid) {
      setShowSectionErrors(true);
      toast.error("Finish required fields before moving on.");
      return;
    }
    goToNext();
  }, [isCurrentSectionValid, goToNext, setShowSectionErrors]);

  const handleSkip = useCallback(() => {
    setShowSectionErrors(false);
    const currentIndex = RESUME_SECTIONS.findIndex(
      (s) => s.id === activeSection
    );
    if (currentIndex >= 0 && currentIndex < RESUME_SECTIONS.length - 1) {
      setActiveSection(RESUME_SECTIONS[currentIndex + 1].id);
    }
  }, [activeSection, setActiveSection, setShowSectionErrors]);

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
      goToSection(section);
    },
    [goToSection]
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
        templateId={selectedTemplateId}
        onOpenTemplateGallery={() => setShowTemplateGallery(true)}
        onSaveAndExit={handleSave}
        onChangeTemplate={(templateId) => setSelectedTemplateId(templateId)}
      />

      {/* Main Content */}
      <div id="resume-editor-main" className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <SectionNavigation
            sections={sectionsWithIcons}
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
                onNext={isLastSection ? handleSave : handleNext}
                nextLabel={isLastSection ? "Finish & Save" : "Next"}
                isSaving={false}
                onSave={handleSave}
                saveLabel="Save & Exit"
                onSkip={
                  canSkipCurrent && hasNextSection ? handleSkip : undefined
                }
                skipLabel="Skip this section"
                sectionErrors={showSectionErrors ? currentSectionErrors : []}
                sections={sectionsWithIcons}
                activeSectionId={activeSection}
                onSectionChange={goToSectionWrapper}
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
                      onAdd={addCertification}
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

                  {activeSection === "courses" && (
                    <CoursesForm
                      courses={resumeData.courses || []}
                      onAdd={addCourse}
                      onUpdate={updateCourse}
                      onRemove={removeCourse}
                    />
                  )}

                  {activeSection === "hobbies" && (
                    <HobbiesForm
                      hobbies={resumeData.hobbies || []}
                      onAdd={addHobby}
                      onUpdate={updateHobby}
                      onRemove={removeHobby}
                    />
                  )}

                  {activeSection === "extra" && (
                    <ExtraCurricularForm
                      activities={resumeData.extraCurricular || []}
                      onAdd={addExtraCurricular}
                      onUpdate={updateExtraCurricular}
                      onRemove={removeExtraCurricular}
                      onReorder={setExtraCurricular}
                      validationErrors={validation.errors}
                      showErrors={showSectionErrors}
                    />
                  )}

                  {activeSection === "custom" && (
                    <CustomSectionsForm
                      sections={resumeData.customSections || []}
                      onAddSection={addCustomSection}
                      onUpdateSection={updateCustomSection}
                      onRemoveSection={removeCustomSection}
                      onAddItem={addCustomSectionItem}
                      onUpdateItem={updateCustomSectionItem}
                      onRemoveItem={removeCustomSectionItem}
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

      {/* Mobile Preview Button */}
      {isMobile && (
        <div className="lg:hidden fixed bottom-6 right-6 left-6 z-40">
          <Button
            size="lg"
            onClick={togglePreview}
            className="rounded-full shadow-lg w-full max-w-sm mx-auto"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-5 h-5 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="w-5 h-5 mr-2" />
                Show Preview
              </>
            )}
          </Button>
        </div>
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
    </div>
  );
}
