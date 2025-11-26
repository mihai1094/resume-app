"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useResume } from "@/hooks/use-resume";
import { useResumeEditorShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useFirestoreStorage, getSaveStatus } from "@/hooks/use-firestore-storage";
import { resumeService } from "@/lib/services/resume";
import { useUser } from "@/hooks/use-user";
import { useSavedResumes } from "@/hooks/use-saved-resumes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PersonalInfoForm } from "./forms/personal-info-form";
import { WorkExperienceForm } from "./forms/work-experience-form";
import { EducationForm } from "./forms/education-form";
import { SkillsForm } from "./forms/skills-form";
import { LanguagesForm } from "./forms/languages-form";
import { CoursesForm } from "./forms/courses-form";
import { HobbiesForm } from "./forms/hobbies-form";
import { ExtraCurricularForm } from "./forms/extra-curricular-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EditorHeader } from "./editor-header";
import { MobileSectionTabs } from "./mobile-section-tabs";
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
import {
  BREAKPOINTS,
  DEFAULT_TEMPLATE_CUSTOMIZATION,
  TIMING,
  isValidSectionId,
  type SectionId,
  type TemplateCustomizationDefaults,
} from "@/lib/constants/defaults";
import { downloadBlob, downloadJSON } from "@/lib/utils/download";

interface ResumeEditorProps {
  templateId?: TemplateId;
  jobTitle?: string;
}

// Use SectionId from constants instead of local type
type Section = SectionId;

const sections: Array<{
  id: SectionId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
    {
      id: "personal",
      label: "Personal Information",
      shortLabel: "Personal",
      icon: User,
    },
    {
      id: "experience",
      label: "Work Experience",
      shortLabel: "Experience",
      icon: Briefcase,
    },
    {
      id: "education",
      label: "Education",
      shortLabel: "Education",
      icon: GraduationCap,
    },
    {
      id: "skills",
      label: "Skills & Expertise",
      shortLabel: "Skills",
      icon: Zap,
    },
    {
      id: "languages",
      label: "Languages",
      shortLabel: "Languages",
      icon: Languages,
    },
    {
      id: "courses",
      label: "Courses & Certifications",
      shortLabel: "Courses",
      icon: BookOpen,
    },
    {
      id: "hobbies",
      label: "Hobbies & Interests",
      shortLabel: "Hobbies",
      icon: Heart,
    },
    {
      id: "extra",
      label: "Extra-curricular Activities",
      shortLabel: "Extra",
      icon: Trophy,
    },
  ];

export function ResumeEditor({
  templateId: initialTemplateId = "modern",
  jobTitle,
}: ResumeEditorProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useUser();
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>(
    initialTemplateId
  );
  const [activeSection, setActiveSection] = useState<Section>("personal");
  const [isMobile, setIsMobile] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [templateCustomization, setTemplateCustomization] =
    useState<TemplateCustomizationDefaults>({
      ...DEFAULT_TEMPLATE_CUSTOMIZATION,
    });

  // Track if we're editing an existing resume
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [editingResumeName, setEditingResumeName] = useState<string | null>(null);

  // Ref to track if initial data has been loaded (for useEffect dependency fix)
  const hasLoadedInitialData = useRef(false);

  // Initialize mobile and preview state after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mobile = window.innerWidth < BREAKPOINTS.lg;
      setIsMobile(mobile);
      // On mobile/tablet, show form by default; on desktop, show preview
      setShowPreview(!mobile);
    }
  }, []);

  const {
    resumeData,
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
    removeSkill,
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
    resetResume,
    loadResume,
    validation,
    setWorkExperience,
    setEducation,
    setExtraCurricular,
  } = useResume();

  const {
    value: savedData,
    setValue: saveData,
    clearValue: clearSavedData,
    isSaving,
    lastSaved,
    isLoading: isLoadingData,
  } = useFirestoreStorage(user?.id || null, 500);

  const { saveResume, updateResume } = useSavedResumes(user?.id || null);

  // Detect mobile/desktop viewport changes
  useEffect(() => {
    const checkViewport = () => {
      if (typeof window === "undefined") return;
      const mobile = window.innerWidth < BREAKPOINTS.lg;
      const wasMobile = isMobile;

      setIsMobile(mobile);

      // If switching from desktop to mobile, show form by default
      if (!wasMobile && mobile) {
        setShowPreview(false);
      }
      // If switching from mobile to desktop, show preview by default
      if (wasMobile && !mobile) {
        setShowPreview(true);
      }
    };

    // Check on mount
    checkViewport();

    // Use matchMedia for more reliable breakpoint detection
    const mediaQuery = window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`);
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const isDesktop = e.matches;
      const wasMobile = isMobile;
      setIsMobile(!isDesktop);

      // If switching from desktop to mobile, show form by default
      if (!wasMobile && !isDesktop) {
        setShowPreview(false);
      }
      // If switching from mobile to desktop, show preview by default
      if (wasMobile && isDesktop) {
        setShowPreview(true);
      }
    };

    // Check initial state
    handleMediaChange(mediaQuery);

    // Listen for changes with debounce to avoid excessive updates
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkViewport, TIMING.resizeDebounce);
    };

    window.addEventListener("resize", handleResize);

    // Listen for media query changes
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, [isMobile, showPreview]);

  // Load saved data on mount - using ref to ensure this only runs once
  useEffect(() => {
    if (hasLoadedInitialData.current) return;
    hasLoadedInitialData.current = true;

    // First check if there's a resume to load from sessionStorage (from my-resumes page)
    if (typeof window !== "undefined") {
      const resumeToLoad = sessionStorage.getItem("resume-to-load");
      if (resumeToLoad) {
        try {
          const parsed = JSON.parse(resumeToLoad);
          // Check if this is an existing resume being edited
          if (parsed.id) {
            setEditingResumeId(parsed.id);
            setEditingResumeName(parsed.name || null);
            if (parsed.templateId) {
              setSelectedTemplateId(parsed.templateId);
            }
          }
          // Load the resume data (handle both old format and new format)
          loadResume(parsed.data || parsed);
          sessionStorage.removeItem("resume-to-load");
          return;
        } catch {
          // Silently fail - will fall back to localStorage data
        }
      }
    }

    // Pre-fill headline with job title if provided
    if (jobTitle && !resumeData.personalInfo.summary) {
      updatePersonalInfo({ summary: `${jobTitle}` });
    }

    // Otherwise load from localStorage
    if (savedData) {
      loadResume(savedData);
    }
  }, [loadResume, savedData]);

  // Auto-save to localStorage
  useEffect(() => {
    saveData(resumeData);
  }, [resumeData, saveData]);

  const handleReset = () => {
    if (
      confirm("Are you sure you want to reset all data? This cannot be undone.")
    ) {
      resetResume();
      clearSavedData();
    }
  };

  const handleExport = useCallback(() => {
    downloadJSON(resumeData, `resume-${Date.now()}.json`);
    toast.success("Resume exported as JSON");
  }, [resumeData]);

  const handleExportPDF = useCallback(async () => {
    try {
      // Use @react-pdf/renderer for professional PDF export
      const { exportToPDF } = await import("@/lib/services/export");
      const result = await exportToPDF(resumeData, selectedTemplateId, {
        fileName: `resume-${Date.now()}.pdf`,
      });

      if (result.success && result.blob) {
        downloadBlob(result.blob, `resume-${Date.now()}.pdf`);
        toast.success("Resume exported as PDF");
      } else {
        toast.error(result.error || "Failed to export PDF");
      }
    } catch {
      toast.error("Failed to export PDF. Please try again.");
    }
  }, [resumeData, selectedTemplateId]);

  const saveStatusText = getSaveStatus(isSaving, lastSaved);

  const isSectionComplete = (sectionId: Section): boolean => {
    switch (sectionId) {
      case "personal":
        return !!(
          resumeData.personalInfo.firstName &&
          resumeData.personalInfo.lastName &&
          resumeData.personalInfo.email &&
          resumeData.personalInfo.phone
        );
      case "experience":
        return resumeData.workExperience.length > 0;
      case "education":
        return resumeData.education.length > 0;
      case "skills":
        return resumeData.skills.length > 0;
      case "languages":
        return (resumeData.languages?.length || 0) > 0;
      case "courses":
        return (resumeData.courses?.length || 0) > 0;
      case "hobbies":
        return (resumeData.hobbies?.length || 0) > 0;
      case "extra":
        return (resumeData.extraCurricular?.length || 0) > 0;
      default:
        return false;
    }
  };

  const currentSectionIndex = sections.findIndex((s) => s.id === activeSection);
  const canGoPrevious = currentSectionIndex > 0;
  const canGoNext = currentSectionIndex < sections.length - 1;

  const goToPrevious = () => {
    if (canGoPrevious) {
      setActiveSection(sections[currentSectionIndex - 1].id);
    }
  };

  const goToNext = () => {
    if (canGoNext) {
      setActiveSection(sections[currentSectionIndex + 1].id);
    }
  };

  const handleSectionChange = useCallback((section: string) => {
    if (isValidSectionId(section)) {
      setActiveSection(section);
    }
  }, []);

  const handleIsSectionComplete = useCallback(
    (section: string): boolean => {
      if (isValidSectionId(section)) {
        return isSectionComplete(section);
      }
      return false;
    },
    [isSectionComplete]
  );

  const completedSections = sections.filter((s) =>
    isSectionComplete(s.id)
  ).length;
  const progressPercentage = (completedSections / sections.length) * 100;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Keyboard shortcuts
  useResumeEditorShortcuts({
    onSave: () => {
      // Auto-save is already handled, but we can show a toast
      toast.success("Resume saved");
    },
    onExportPDF: handleExportPDF,
    onExportJSON: handleExport,
  });

  const handleSaveAndExit = async () => {
    if (!user) {
      toast.error("Please log in to save your resume");
      return;
    }

    // Generate a name for the resume based on personal info
    let resumeName = editingResumeName || "My Resume";
    if (!editingResumeName) {
      if (resumeData.personalInfo.firstName && resumeData.personalInfo.lastName) {
        resumeName = `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}`;
      } else if (jobTitle) {
        resumeName = `Resume - ${jobTitle}`;
      } else {
        // Use timestamp as fallback
        resumeName = `Resume - ${new Date().toLocaleDateString()}`;
      }
    }

    try {
      // Save to current resume (auto-save)
      saveData(resumeData);

      // Check if we're editing an existing resume
      if (editingResumeId) {
        // Update existing resume
        const success = await updateResume(editingResumeId, {
          name: resumeName,
          templateId: selectedTemplateId,
          data: resumeData,
        });

        if (success) {
          toast.success("Resume updated successfully!");
          router.push("/my-resumes");
        } else {
          toast.error("Failed to update resume");
        }
      } else {
        // Create new resume
        const savedResume = await saveResume(resumeName, selectedTemplateId, resumeData);

        if (savedResume) {
          toast.success("Resume saved successfully!");
          router.push("/my-resumes");
        } else {
          toast.error("Failed to save resume");
        }
      }
    } catch (error) {
      console.error("Error saving resume:", error);
      toast.error("Failed to save resume");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <EditorHeader
        user={user}
        onExportJSON={handleExport}
        onExportPDF={handleExportPDF}
        onReset={handleReset}
        onLogout={handleLogout}
        onImport={loadResume}
        saveStatus={saveStatusText}
        completedSections={completedSections}
        totalSections={sections.length}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
        showCustomizer={showCustomizer}
        onToggleCustomizer={() => setShowCustomizer(!showCustomizer)}
        resumeData={resumeData}
        templateId={selectedTemplateId}
        onOpenTemplateGallery={() => setShowTemplateGallery(true)}
        onSaveAndExit={handleSaveAndExit}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <MobileSectionTabs
          sections={sections}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isSectionComplete={handleIsSectionComplete}
        />

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <SectionNavigation
            sections={sections}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            isSectionComplete={handleIsSectionComplete}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            templateId={selectedTemplateId}
            progressPercentage={progressPercentage}
            onChangeTemplate={() => setShowTemplateGallery(true)}
          />

          {/* Center: Form */}
          <div className="flex-1 w-full min-w-0">
            {showCustomizer ? (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Customize Template</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCustomizer(false)}
                  >
                    Close
                  </Button>
                </div>
                <Separator className="mb-4" />
                <TemplateCustomizer
                  customization={templateCustomization}
                  onChange={(updates) =>
                    setTemplateCustomization((prev) => ({ ...prev, ...updates }))
                  }
                  onReset={() =>
                    setTemplateCustomization({ ...DEFAULT_TEMPLATE_CUSTOMIZATION })
                  }
                />
              </Card>
            ) : (
              <SectionWrapper
                title={sections.find((s) => s.id === activeSection)?.label || ""}
                description="Fill in the details for this section"
                currentIndex={currentSectionIndex}
                totalSections={sections.length}
                canGoPrevious={canGoPrevious}
                canGoNext={canGoNext || currentSectionIndex === sections.length - 1}
                onPrevious={goToPrevious}
                onNext={currentSectionIndex === sections.length - 1 ? handleSaveAndExit : goToNext}
                nextLabel={currentSectionIndex === sections.length - 1 ? "Finish & Save" : "Next"}
              >
                <div className="space-y-6">
                  {activeSection === "personal" && (
                    <PersonalInfoForm
                      data={resumeData.personalInfo}
                      onChange={updatePersonalInfo}
                      validationErrors={validation.errors
                        .filter((error) =>
                          ['firstName', 'lastName', 'email', 'phone', 'location', 'website', 'linkedin', 'github'].includes(error.field)
                        )
                        .reduce((acc, error) => {
                          acc[error.field] = error.message;
                          return acc;
                        }, {} as Record<string, string>)}
                    />
                  )}

                  {activeSection === "experience" && (
                    <WorkExperienceForm
                      experiences={resumeData.workExperience}
                      onAdd={addWorkExperience}
                      onUpdate={updateWorkExperience}
                      onRemove={removeWorkExperience}
                      onReorder={setWorkExperience}
                    />
                  )}

                  {activeSection === "education" && (
                    <EducationForm
                      education={resumeData.education}
                      onAdd={addEducation}
                      onUpdate={updateEducation}
                      onRemove={removeEducation}
                      onReorder={setEducation}
                    />
                  )}

                  {activeSection === "skills" && (
                    <SkillsForm
                      skills={resumeData.skills}
                      onAdd={addSkill}
                      onRemove={removeSkill}
                      onUpdate={() => { }}
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
                  templateId={selectedTemplateId}
                  resumeData={resumeData}
                  isValid={validation.valid}
                  customization={templateCustomization}
                  onChangeTemplate={() => setShowTemplateGallery(true)}
                  onToggleCustomizer={() => setShowCustomizer(!showCustomizer)}
                  showCustomizer={showCustomizer}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Preview Button */}
      {isMobile && (
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <Button
            size="lg"
            onClick={() => setShowPreview(!showPreview)}
            className="rounded-full shadow-lg"
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
          onClose={() => setShowPreview(false)}
          customization={templateCustomization}
          onToggleCustomizer={() => setShowCustomizer(!showCustomizer)}
          showCustomizer={showCustomizer}
          onChangeTemplate={() => setShowTemplateGallery(true)}
          onCustomizationChange={(updates) =>
            setTemplateCustomization((prev) => ({ ...prev, ...updates }))
          }
          onResetCustomization={() =>
            setTemplateCustomization({ ...DEFAULT_TEMPLATE_CUSTOMIZATION })
          }
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
    </div>
  );
}
