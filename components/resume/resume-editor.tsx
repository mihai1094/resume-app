"use client";

import { useEffect, useState } from "react";
import { useResume } from "@/hooks/use-resume";
import { useResumeEditorShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useLocalStorage, getSaveStatus } from "@/hooks/use-local-storage";
import { resumeService } from "@/lib/services/resume";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
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

interface ResumeEditorProps {
  templateId?: TemplateId;
}

type Section =
  | "personal"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "courses"
  | "hobbies"
  | "extra";

const sections: Array<{
  id: Section;
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
}: ResumeEditorProps) {
  const router = useRouter();
  const { user, createUser, isAuthenticated, logout } = useUser();
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>(
    initialTemplateId
  );
  const [activeSection, setActiveSection] = useState<Section>("personal");
  const [isMobile, setIsMobile] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [templateCustomization, setTemplateCustomization] = useState({
    primaryColor: "#0ea5e9",
    secondaryColor: "#0f172a",
    fontFamily: "sans",
    fontSize: 14,
    lineSpacing: 1.5,
    sectionSpacing: 16,
  });

  // Create user account if not exists
  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      // Create a default user account
      createUser("user@example.com", "User");
    }
  }, [isAuthenticated, createUser]);

  // Initialize mobile and preview state after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mobile = window.innerWidth < 1024;
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
    resetResume,
    loadResume,
    validation,
  } = useResume();

  const {
    value: savedData,
    setValue: saveData,
    clearValue: clearSavedData,
    isSaving,
    lastSaved,
  } = useLocalStorage<typeof resumeData | null>("resume-data", null, 500);

  // Detect mobile/desktop viewport changes
  useEffect(() => {
    const checkViewport = () => {
      if (typeof window === "undefined") return;
      const mobile = window.innerWidth < 1024; // lg breakpoint
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
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
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
      resizeTimeout = setTimeout(checkViewport, 100);
    };

    window.addEventListener("resize", handleResize);

    // Listen for media query changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleMediaChange);
    }

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, [isMobile, showPreview]);

  // Load saved data on mount
  useEffect(() => {
    // First check if there's a resume to load from sessionStorage (from my-resumes page)
    if (typeof window !== "undefined") {
      const resumeToLoad = sessionStorage.getItem("resume-to-load");
      if (resumeToLoad) {
        try {
          const data = JSON.parse(resumeToLoad);
          loadResume(data);
          sessionStorage.removeItem("resume-to-load");
          return;
        } catch (error) {
          console.error("Failed to load resume from session:", error);
        }
      }
    }

    // Otherwise load from localStorage
    if (savedData) {
      loadResume(savedData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    saveData(resumeData);
  }, [resumeData]);

  const handleReset = () => {
    if (
      confirm("Are you sure you want to reset all data? This cannot be undone.")
    ) {
      resetResume();
      clearSavedData();
    }
  };

  const handleExport = () => {
    // Use resumeService for export
    const dataStr = resumeService.exportToJSON(resumeData, true);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resume-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    try {
      // Use @react-pdf/renderer for professional PDF export
      const { exportToPDF } = await import("@/lib/services/export");
      const result = await exportToPDF(resumeData, selectedTemplateId, {
        fileName: `resume-${Date.now()}.pdf`,
      });

      if (result.success && result.blob) {
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `resume-${Date.now()}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        alert(result.error || "Failed to export PDF");
      }
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Failed to export PDF. Please try again.");
    }
  };

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

  const handleSectionChange = (section: string) => {
    // Type guard to ensure the section is a valid Section type
    if (
      section === "personal" ||
      section === "experience" ||
      section === "education" ||
      section === "skills" ||
      section === "languages" ||
      section === "courses" ||
      section === "hobbies" ||
      section === "extra"
    ) {
      setActiveSection(section);
    }
  };

  const handleIsSectionComplete = (section: string): boolean => {
    // Type guard to ensure the section is a valid Section type
    if (
      section === "personal" ||
      section === "experience" ||
      section === "education" ||
      section === "skills" ||
      section === "languages" ||
      section === "courses" ||
      section === "hobbies" ||
      section === "extra"
    ) {
      return isSectionComplete(section);
    }
    return false;
  };

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
      console.log("Saved (Ctrl+S)");
    },
    onExportPDF: handleExportPDF,
    onExportJSON: handleExport,
  });

  const handleSaveAndExit = () => {
    saveData(resumeData);
    router.push("/my-resumes");
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
                    setTemplateCustomization({
                      primaryColor: "#0ea5e9",
                      secondaryColor: "#0f172a",
                      fontFamily: "sans",
                      fontSize: 14,
                      lineSpacing: 1.5,
                      sectionSpacing: 16,
                    })
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
                    />
                  )}

                  {activeSection === "experience" && (
                    <WorkExperienceForm
                      experiences={resumeData.workExperience}
                      onAdd={addWorkExperience}
                      onUpdate={updateWorkExperience}
                      onRemove={removeWorkExperience}
                      onReorder={reorderWorkExperience}
                    />
                  )}

                  {activeSection === "education" && (
                    <EducationForm
                      education={resumeData.education}
                      onAdd={addEducation}
                      onUpdate={updateEducation}
                      onRemove={removeEducation}
                      onReorder={reorderEducation}
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
