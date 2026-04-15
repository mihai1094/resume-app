"use client";

import { useEffect, useCallback, useState, useRef, useMemo, useTransition } from "react";
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
import { authPost } from "@/lib/api/auth-fetch";
import { ResumeData } from "@/lib/types/resume";
import { ImportedResumeMeta } from "@/hooks/use-file-dialog";
import { SectionFormRenderer, type SectionHandlers } from "./section-form-renderer";
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
  AlertCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  TemplateId,
  TEMPLATES,
  hasTemplatePhotoSupport,
} from "@/lib/constants/templates";
import { DEFAULT_TEMPLATE_CUSTOMIZATION } from "@/lib/constants/defaults";
import {
  ColorPaletteId,
  getColorPalette,
} from "@/lib/constants/color-palettes";
import { LoadingPage } from "@/components/shared/loading";
import { MobileBottomBar } from "./mobile-bottom-bar";
import { useResumeReadiness } from "@/hooks/use-resume-readiness";
import { CommandPaletteProvider } from "@/components/command-palette";
import { useJobDescriptionContext } from "@/hooks/use-job-description-context";
import { AICommand } from "@/lib/constants/ai-commands";
import { useVersionHistory } from "@/hooks/use-version-history";
import { ATSAnalyzer } from "@/lib/ats/engine";
import { getTemplateHiddenContentWarnings } from "@/lib/resume/template-capabilities";
import { PlanLimitDialog } from "@/components/shared/plan-limit-dialog";
import { capture } from "@/lib/analytics/events";
import { launchFlags } from "@/config/launch";
import { LiveAtsPanel } from "./live-ats-panel";
import { useResumeExport } from "@/hooks/use-resume-export";
import { VerificationBanner } from "@/components/shared/verification-banner";

interface ResumeEditorProps {
  templateId?: TemplateId;
  jobTitle?: string;
  resumeId?: string | null;
  colorPaletteId?: ColorPaletteId;
  initializeFromLatest?: boolean;
  openTemplateGalleryOnLoad?: boolean;
  initialSection?: SectionId;
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
  colorPaletteId,
  initializeFromLatest = false,
  openTemplateGalleryOnLoad = false,
  initialSection = "personal",
}: ResumeEditorProps) {
  const router = useRouter();
  const { user, logout } = useUser();

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
    clearCurrentDraftAfterSave,
    loadedTemplateId,
    loadedTemplateCustomization,
    isDirty,
    handleDiscardDraft,
    editingResumeId,
    setAutoSaveTemplateId,
  } = useResumeEditorContainer({
    resumeId,
    jobTitle,
    initializeFromLatest,
  });

  // Calculate which sections have errors for the sidebar navigation
  const sectionsWithErrors = useMemo(() => {
    const errorSections = new Set<string>();
    if (validation.errors) {
      Object.keys(validation.errors).forEach((field) => {
        const section = mapFieldToSection(field);
        if (section) errorSections.add(section);
      });
    }
    return errorSections;
  }, [validation.errors, mapFieldToSection]);

  // Version history hook
  const isPremium = user?.plan === "premium";
  const versionHistory = useVersionHistory({
    userId: user?.id || null,
    resumeId: editingResumeId || resumeId,
    isPremium,
    resumeData,
    onRestoreVersion: loadResume,
  });

  // Plan limit dialog
  const [showPlanLimitDialog, setShowPlanLimitDialog] = useState(false);
  const [planLimitCount, setPlanLimitCount] = useState(3);

  // Navigation guard: protect against losing unsaved changes
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<
    (() => void) | null
  >(null);
  const [isSavingBeforeNav, setIsSavingBeforeNav] = useState(false);
  const completionRewardRequestSentRef = useRef(false);

  // Check if there's content that isn't saved to savedResumes collection
  // This catches the case where auto-save works but user navigates away without explicit save
  const hasUnsavedContent = useMemo(() => {
    const hasName = Boolean(resumeData.personalInfo.firstName?.trim());
    const hasEmail = Boolean(resumeData.personalInfo.email?.trim());
    const hasSummary = Boolean(resumeData.personalInfo.summary?.trim());
    const hasExperience = (resumeData.workExperience?.length ?? 0) > 0;
    const hasEducation = (resumeData.education?.length ?? 0) > 0;
    const hasSkills = (resumeData.skills?.length ?? 0) > 0;
    const hasProjects = (resumeData.projects?.length ?? 0) > 0;
    const hasCertifications = (resumeData.certifications?.length ?? 0) > 0;
    const hasLanguages = (resumeData.languages?.length ?? 0) > 0;
    const hasCourses = (resumeData.courses?.length ?? 0) > 0;
    const hasHobbies = (resumeData.hobbies?.length ?? 0) > 0;
    const hasExtraCurricular = (resumeData.extraCurricular?.length ?? 0) > 0;
    const hasCustomSections = (resumeData.customSections?.length ?? 0) > 0;
    const hasMeaningfulContent =
      hasName || hasEmail || hasSummary ||
      hasExperience || hasEducation ||
      hasSkills || hasProjects || hasCertifications ||
      hasLanguages || hasCourses || hasHobbies ||
      hasExtraCurricular || hasCustomSections;
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
    setShowCustomizer,
    toggleCustomizer,
    showTemplateGallery,
    setShowTemplateGallery,
    showResetConfirmation,
    setShowResetConfirmation,
    isFullscreen,
    setIsFullscreen,
    updateLoadedTemplate,
  } = useResumeEditorUI(initialTemplateId, initialSection);

  const {
    isExporting,
    showExportWarningModal,
    setShowExportWarningModal,
    exportWarnings,
    handleExportJSON: handleExport,
    handleExportPDF,
    performExportPDF: performExport,
  } = useResumeExport({ resumeData, selectedTemplateId, templateCustomization });

  const handleBack = useCallback(() => {
    // If we are in the presentation full screen mode, the back button should exit it
    // but LEAVE the normal side-preview active.
    if (isFullscreen) {
      setIsFullscreen(false);
      return;
    }

    if (shouldWarnOnLeave) {
      setShowUnsavedDialog(true);
      setPendingNavigation(() => () => forceGoBack("/dashboard"));
    } else {
      forceGoBack("/dashboard");
    }
  }, [shouldWarnOnLeave, forceGoBack, isFullscreen, setIsFullscreen]);

  // Navigation callbacks that need selectedTemplateId from UI hook
  const handleSaveAndLeave = useCallback(async () => {
    setIsSavingBeforeNav(true);
    try {
      const result = await containerHandleSaveAndExit(
        selectedTemplateId,
        templateCustomization
      );
      if (result?.success) {
        await clearCurrentDraftAfterSave({ updateUi: false });
        setShowUnsavedDialog(false);
        forceGoBack("/dashboard");
      } else if (result && "code" in result && result.code === "PLAN_LIMIT") {
        setPlanLimitCount("limit" in result ? (result.limit as number) : 3);
        setShowPlanLimitDialog(true);
      }
    } finally {
      setIsSavingBeforeNav(false);
    }
  }, [
    containerHandleSaveAndExit,
    clearCurrentDraftAfterSave,
    forceGoBack,
    selectedTemplateId,
    templateCustomization,
  ]);

  const handleDiscardAndLeave = useCallback(async () => {
    // Explicitly clear recoverable session draft when user discards changes.
    await handleDiscardDraft();
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
    forceGoBack("/dashboard");
  }, [forceGoBack, handleDiscardDraft]);

  const handleCancelNavigation = useCallback(() => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  }, []);

  // Apply color palette from URL param on initial mount
  const hasAppliedColorPalette = useRef(false);
  const hasOpenedTemplateGalleryOnLoad = useRef(false);
  const hasAppliedLoadedCustomization = useRef(false);
  useEffect(() => {
    if (colorPaletteId && !hasAppliedColorPalette.current) {
      const palette = getColorPalette(colorPaletteId);
      setTemplateCustomization((prev) => ({
        ...prev,
        primaryColor: palette.primary,
        secondaryColor: palette.secondary,
        accentColor: palette.secondary,
      }));
      hasAppliedColorPalette.current = true;
    }
  }, [colorPaletteId, setTemplateCustomization]);

  // Fire editor_opened event once initialization completes
  const editorOpenedFiredRef = useRef(false);
  useEffect(() => {
    if (isInitializing || editorOpenedFiredRef.current) return;
    editorOpenedFiredRef.current = true;
    capture("editor_opened", {
      templateId: selectedTemplateId,
      isResume: true,
      continueDraft: Boolean(resumeId),
    });
  }, [isInitializing, selectedTemplateId, resumeId]);

  // Optionally open template gallery directly on load (e.g. dashboard "Design" action)
  useEffect(() => {
    if (
      !isInitializing &&
      openTemplateGalleryOnLoad &&
      !hasOpenedTemplateGalleryOnLoad.current
    ) {
      hasOpenedTemplateGalleryOnLoad.current = true;
      setShowTemplateGallery(true);
    }
  }, [isInitializing, openTemplateGalleryOnLoad, setShowTemplateGallery]);

  const handleOpenTemplateGallery = useCallback(() => {
    if (isInitializing) {
      toast.info("Resume is still loading. Try changing the template in a moment.");
      return;
    }

    setShowTemplateGallery(true);
  }, [isInitializing, setShowTemplateGallery]);

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
    return template ? hasTemplatePhotoSupport(template) : false;
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
  const [isRefreshingJDScore, setIsRefreshingJDScore] = useState(false);

  // Job description context for command palette
  const activeResumeId = editingResumeId ?? resumeId ?? null;
  const jdContext = useJobDescriptionContext({
    resumeId: activeResumeId,
    resumeData,
  });

  const handleRefreshJDScore = useCallback(() => {
    const currentJD = jdContext.context?.jobDescription?.trim();
    if (!currentJD) {
      toast.error("Add a target job description first");
      return;
    }

    setIsRefreshingJDScore(true);
    try {
      const analyzer = new ATSAnalyzer(resumeData, currentJD);
      const result = analyzer.analyze();
      const keywordDensity = result.keywordDensity ?? [];

      jdContext.updateAnalysis({
        matchScore: result.breakdown.jobMatch?.score ?? result.totalScore,
        missingKeywords: keywordDensity
          .filter((item) => item.count === 0 || item.status === "low")
          .map((item) => item.keyword),
        matchedSkills: keywordDensity
          .filter((item) => item.count > 0)
          .map((item) => item.keyword),
      });

      toast.success("Target Job score refreshed");
    } catch {
      toast.error("Could not refresh target job score");
    } finally {
      setIsRefreshingJDScore(false);
    }
  }, [jdContext, resumeData]);

  // Debounced ATS analysis — runs at most once per 500ms to avoid blocking
  // the main thread on every keystroke. Wraps the computation in a transition
  // so React can interrupt it if new user input arrives.
  const [liveAtsResult, setLiveAtsResult] = useState<ReturnType<ATSAnalyzer["analyze"]> | null>(null);
  const [, startTransition] = useTransition();
  const atsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jobDescription = jdContext.context?.jobDescription;
  useEffect(() => {
    if (!launchFlags.features.atsScorePanel) return;
    if (atsDebounceRef.current) clearTimeout(atsDebounceRef.current);
    atsDebounceRef.current = setTimeout(() => {
      startTransition(() => {
        try {
          const analyzer = new ATSAnalyzer(resumeData, jobDescription?.trim() || undefined);
          setLiveAtsResult(analyzer.analyze());
        } catch {
          setLiveAtsResult(null);
        }
      });
    }, 500);
    return () => {
      if (atsDebounceRef.current) clearTimeout(atsDebounceRef.current);
    };
  }, [jobDescription, resumeData]);

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

  const previousSectionCompletionRef = useRef<Record<string, boolean> | null>(
    null
  );
  const previousProgressRef = useRef<number>(0);

  useEffect(() => {
    if (!resumeData || isInitializing) return;

    const currentSectionCompletion = Object.fromEntries(
      RESUME_SECTIONS.map((section) => [section.id, isSectionComplete(section.id)])
    );
    const currentProgress = progressPercentage;

    if (!isDirty || previousSectionCompletionRef.current === null) {
      previousSectionCompletionRef.current = currentSectionCompletion;
      previousProgressRef.current = currentProgress;
      return;
    }

    const previousSectionCompletion = previousSectionCompletionRef.current;

    RESUME_SECTIONS.forEach((section) => {
      if (
        currentSectionCompletion[section.id] &&
        !previousSectionCompletion[section.id]
      ) {
        celebrateSectionComplete(section.id);
      }
    });

    if (previousProgressRef.current < 50 && currentProgress >= 50) {
      celebrateMilestone("Halfway there! 50% complete");
    }

    if (previousProgressRef.current < 100 && currentProgress >= 100) {
      celebrateResumeComplete();
    }

    previousSectionCompletionRef.current = currentSectionCompletion;
    previousProgressRef.current = currentProgress;
  }, [
    resumeData,
    isDirty,
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

  const sectionHandlers = useMemo<SectionHandlers>(() => ({
    updatePersonalInfo,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
    setWorkExperience,
    addEducation,
    updateEducation,
    removeEducation,
    setEducation,
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
    addExtraCurricular,
    updateExtraCurricular,
    removeExtraCurricular,
    setExtraCurricular,
    addHobby,
    updateHobby,
    removeHobby,
    addCustomSection,
    updateCustomSection,
    removeCustomSection,
    addCustomSectionItem,
    updateCustomSectionItem,
    removeCustomSectionItem,
  }), [
    updatePersonalInfo, addWorkExperience, updateWorkExperience, removeWorkExperience, setWorkExperience,
    addEducation, updateEducation, removeEducation, setEducation,
    addSkill, updateSkill, removeSkill,
    addProject, updateProject, removeProject, reorderProjects,
    addCertification, addCourseAsCertification, updateCertification, removeCertification,
    addLanguage, updateLanguage, removeLanguage,
    addExtraCurricular, updateExtraCurricular, removeExtraCurricular, setExtraCurricular,
    addHobby, updateHobby, removeHobby,
    addCustomSection, updateCustomSection, removeCustomSection,
    addCustomSectionItem, updateCustomSectionItem, removeCustomSectionItem,
  ]);

  const hiddenByTemplateWarnings = useMemo(
    () =>
      getTemplateHiddenContentWarnings({
        templateId: selectedTemplateId,
        activeSection,
        resumeData,
      }),
    [selectedTemplateId, activeSection, resumeData]
  );

  useEffect(() => {
    setShowSectionErrors(false);

    // Keep section changes stable: only scroll when we're meaningfully away
    // from the editor top, otherwise avoid micro-jumps ("tremble").
    const mainContent = document.getElementById("resume-editor-main");
    if (!mainContent) return;

    const stickyHeader = document.querySelector(
      "header.sticky.top-0"
    ) as HTMLElement | null;
    const headerOffset = stickyHeader?.offsetHeight ?? 0;
    const contentTop =
      window.scrollY + mainContent.getBoundingClientRect().top;
    const targetY = Math.max(0, contentTop - headerOffset - 8);

    if (Math.abs(window.scrollY - targetY) > 12) {
      window.scrollTo({ top: targetY, behavior: "auto" });
    }
  }, [activeSection]);

  // Update template when loaded from Firestore
  useEffect(() => {
    updateLoadedTemplate(loadedTemplateId);
  }, [loadedTemplateId, updateLoadedTemplate]);

  // Keep auto-save template in sync with current selection
  useEffect(() => {
    setAutoSaveTemplateId(selectedTemplateId);
  }, [selectedTemplateId, setAutoSaveTemplateId]);

  // Apply saved template customization once when loading an existing resume.
  useEffect(() => {
    if (hasAppliedLoadedCustomization.current) return;
    if (!loadedTemplateCustomization) return;

    setTemplateCustomization(loadedTemplateCustomization);
    hasAppliedLoadedCustomization.current = true;
  }, [loadedTemplateCustomization, setTemplateCustomization]);

  const handleReset = () => {
    setShowResetConfirmation(true);
  };

  const handleConfirmReset = () => {
    containerHandleReset();
    setShowResetConfirmation(false);
  };

  const handleSave = useCallback(async () => {
    const tryClaimCompletionReward = async () => {
      if (completionRewardRequestSentRef.current) return;
      completionRewardRequestSentRef.current = true;

      try {
        const response = await authPost("/api/rewards/claim-resume-completion", {});
        if (!response.ok) return;

        const payload = (await response.json()) as {
          claimed?: boolean;
          creditsAwarded?: number;
          creditsRemaining?: number;
        };

        if (payload.claimed && (payload.creditsAwarded ?? 0) > 0) {
          const remaining =
            typeof payload.creditsRemaining === "number"
              ? ` You now have ${payload.creditsRemaining} credits remaining.`
              : "";
          toast.success(
            `Milestone reward unlocked: +${payload.creditsAwarded} AI credits.${remaining}`
          );
        }
      } catch {
        // Keep save flow resilient even if reward claim fails.
        completionRewardRequestSentRef.current = false;
      }
    };

    // Only check core validation (Name) provided by container
    const result = await containerHandleSaveAndExit(
      selectedTemplateId,
      templateCustomization
    );
    if (result?.success) {
      // Clear the current draft BEFORE navigating so it doesn't race with the
      // editor's unmount cleanup (which flushes pending cloud saves) and leave
      // a stale "Continue draft" entry on the dashboard.
      await clearCurrentDraftAfterSave({ updateUi: false });
      capture("resume_saved", {
        resumeId: editingResumeId || "new",
        sectionsCount: completedSections,
        hasPhoto: Boolean(resumeData.personalInfo.photo),
      });
      // Reward claim is non-blocking — don't delay navigation on it.
      void tryClaimCompletionReward();
      router.push("/dashboard");
    } else if (result && "code" in result && result.code === "PLAN_LIMIT") {
      setPlanLimitCount("limit" in result ? (result.limit as number) : 3);
      setShowPlanLimitDialog(true);
    }
  }, [
    containerHandleSaveAndExit,
    clearCurrentDraftAfterSave,
    router,
    selectedTemplateId,
    templateCustomization,
    editingResumeId,
    completedSections,
    resumeData.personalInfo.photo,
  ]);

  useEffect(() => {
    router.prefetch?.("/dashboard");
  }, [router]);

  const handleNext = useCallback(() => {
    // Mark as interacted when user clicks Next
    setHasUserInteracted(true);

    if (!isCurrentSectionValid) {
      setShowSectionErrors(true);
      // Toast summary — tells users something happened even if the first error
      // is scrolled off-screen on tall sections.
      const errorCount = currentSectionErrors?.length ?? 0;
      if (errorCount > 0) {
        toast.error(
          errorCount === 1
            ? "1 field needs attention"
            : `${errorCount} fields need attention`
        );
      }
      // After React paints the aria-invalid state, scroll the first invalid
      // input into view and focus it so users know where to fix things.
      requestAnimationFrame(() => {
        const main = document.getElementById("resume-editor-main");
        const firstInvalid = main?.querySelector<HTMLElement>(
          '[aria-invalid="true"]'
        );
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ block: "center", behavior: "smooth" });
          // Delay focus slightly so the scroll animation doesn't cancel itself.
          setTimeout(() => firstInvalid.focus({ preventScroll: true }), 150);
        }
      });
      return;
    }
    goToNext();
  }, [
    isCurrentSectionValid,
    goToNext,
    setShowSectionErrors,
    currentSectionErrors,
  ]);

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
      // Auto-close the Customize panel when switching sections
      if (showCustomizer && section !== activeSection) {
        setShowCustomizer(false);
      }
      // Mark as interacted when user navigates to a different section
      if (section !== activeSection) {
        setHasUserInteracted(true);
      }
      goToSection(section);
    },
    [goToSection, activeSection, showCustomizer, setShowCustomizer]
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

  useEffect(() => {
    if (resumeId && resumeLoadError) {
      toast.error("Resume not found — it may have been deleted");
      router.replace("/dashboard");
    }
  }, [resumeId, resumeLoadError, router]);

  if (resumeId && isInitializing) {
    return <LoadingPage text="Loading resume..." />;
  }

  if (resumeId && resumeLoadError) {
    return null; // Redirecting to dashboard
  }

  return (
    <CommandPaletteProvider
      onCommandExecute={handleCommandExecute}
      hasJD={jdContext.isActive}
    >
      <div className="min-h-screen bg-background">
          <VerificationBanner />
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
            onImport={(data: ResumeData, meta: ImportedResumeMeta) => {
              loadResume(data);
              if (meta.templateId) setSelectedTemplateId(meta.templateId as TemplateId);
              if (meta.customization) setTemplateCustomization(meta.customization);
            }}
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
            resumeId={editingResumeId ?? resumeId ?? undefined}
            templateId={selectedTemplateId}
            onOpenTemplateGallery={handleOpenTemplateGallery}
            onSaveAndExit={handleSave}
            onChangeTemplate={(templateId) => setSelectedTemplateId(templateId)}
            onJumpToSection={goToSectionWrapper}
            onBack={handleBack}
            jdContext={jdContext}
            onRefreshJDScore={handleRefreshJDScore}
            isRefreshingJDScore={isRefreshingJDScore}
            hasUserInteracted={hasUserInteracted}
          />

          {/* Main Content */}
          <div id="resume-editor-main" className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {(!showPreview || !isMobile) && !isFullscreen && (
                <SectionNavigation
                  sections={visibleSectionsWithIcons}
                  activeSection={activeSection}
                  onSectionChange={goToSectionWrapper}
                  isSectionComplete={isSectionCompleteWrapper}
                  collapsed={sidebarCollapsed}
                  onToggleCollapse={toggleSidebar}
                  progressPercentage={progressPercentage}
                  hasErrors={(sectionId) => sectionsWithErrors.has(sectionId)}
                />
              )}

              {/* Center: Form — hidden in fullscreen preview */}
              <div className={cn("flex-1 w-full min-w-0", isFullscreen && "hidden")}>
                {/* Live ATS score — deferred to future release */}

                {showCustomizer && (
                  <Card
                    className="p-4 mb-6"
                    ref={(el) => {
                      if (el) window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-sm">
                        Customize Template
                      </h3>
                      <button
                        type="button"
                        onClick={toggleCustomizer}
                        className="inline-flex items-center h-7 px-3 rounded-lg text-xs font-medium text-muted-foreground bg-muted/50 hover:text-foreground hover:bg-muted/70 transition-colors"
                      >
                        Close
                      </button>
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
                )}
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
                    <>
                      {hiddenByTemplateWarnings.length > 0 && (
                        <Card className="mb-4 border-amber-300/60 bg-amber-50/60 dark:bg-amber-950/15 dark:border-amber-900/50">
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                                  This template hides some content from this section
                                </p>
                                <ul className="space-y-1">
                                  {hiddenByTemplateWarnings.map((warning) => (
                                    <li
                                      key={warning}
                                      className="text-xs text-amber-800/90 dark:text-amber-300/90"
                                    >
                                      {warning}
                                    </li>
                                  ))}
                                </ul>
                                <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                                  Tip: switch template in Preview to a layout that supports this section.
                                </p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )}

                      <SectionFormRenderer
                        activeSection={activeSection}
                        resumeData={resumeData}
                        jobDescription={jdContext.context?.jobDescription}
                        validationErrors={validation.errors}
                        showErrors={showSectionErrors}
                        templateSupportsPhoto={templateSupportsPhoto}
                        handlers={sectionHandlers}
                      />
                    </>
                  </SectionWrapper>
              </div>

              {/* Right: Preview and Customizer */}
              {showPreview && (
                <div
                  className="hidden lg:block w-[420px] shrink-0 sticky flex items-center"
                  style={{
                    top: "var(--sticky-offset, 5rem)",
                    height: "calc(100vh - var(--sticky-offset, 5rem))",
                  }}
                >
                  <div className="w-full">
                    <PreviewPanel
                      key={selectedTemplateId}
                      templateId={selectedTemplateId}
                      resumeData={resumeData}
                      isValid={validation.valid}
                      customization={templateCustomization}
                      onToggleCustomizer={toggleCustomizer}
                      showCustomizer={showCustomizer}
                      isFullscreen={isFullscreen}
                      setIsFullscreen={setIsFullscreen}
                      onCustomizationChange={(updates) =>
                        setTemplateCustomization((prev) => ({
                          ...prev,
                          ...updates,
                        }))
                      }
                      onResetCustomization={() =>
                        setTemplateCustomization({
                          ...DEFAULT_TEMPLATE_CUSTOMIZATION,
                        })
                      }
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
              sections={visibleSections.map((s) => ({
                id: s.id,
                label: s.label,
              }))}
              activeSectionId={activeSection}
              onJumpToSection={goToSectionWrapper}
            />
          )}

          {/* Export warning modal */}
          <AlertDialog open={showExportWarningModal} onOpenChange={setShowExportWarningModal}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Resume has incomplete sections</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div>
                    <ul className="mt-2 space-y-1 text-sm">
                      {exportWarnings.map((w, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Fix First</AlertDialogCancel>
                <AlertDialogAction onClick={performExport}>Export Anyway</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* All editor dialogs */}
          <PlanLimitDialog
            open={showPlanLimitDialog}
            onOpenChange={setShowPlanLimitDialog}
            limit={planLimitCount}
            resourceType="resumes"
            onManage={() => {
              setShowPlanLimitDialog(false);
              router.push("/dashboard");
            }}
          />
          <EditorDialogs
            resumeData={resumeData}
            resumeId={activeResumeId}
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
          />
        </div>
    </CommandPaletteProvider>
  );
}
