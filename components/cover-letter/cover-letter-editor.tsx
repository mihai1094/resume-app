"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useCoverLetter } from "@/hooks/use-cover-letter";
import { useLocalStorage, getSaveStatus } from "@/hooks/use-local-storage";
import { useResume } from "@/hooks/use-resume";
import { useSavedResumes } from "@/hooks/use-saved-resumes";
import { useUser } from "@/hooks/use-user";
import { CoverLetterForm } from "./forms/cover-letter-form";
import { CoverLetterRenderer } from "./templates";
import { CoverLetterTemplatePicker } from "./cover-letter-template-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Eye,
  EyeOff,
  Download,
  FileJson,
  FileText,
  ArrowLeft,
  Briefcase,
  Building2,
  User,
  FileCheck,
  RotateCcw,
  Check,
  Sparkles,
  Maximize2,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CoverLetterData,
  CoverLetterTemplateId,
  COVER_LETTER_TEMPLATES,
} from "@/lib/types/cover-letter";
import { downloadBlob, downloadJSON } from "@/lib/utils/download";
import { useSavedCoverLetters } from "@/hooks/use-saved-cover-letters";
import { PlanLimitError } from "@/lib/services/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSectionTabs } from "@/components/resume/mobile-section-tabs";
import { SectionNavigation } from "@/components/resume/section-navigation";
import { SectionWrapper } from "@/components/resume/section-wrapper";
import { GenerateCoverLetterDialog } from "./generate-cover-letter-dialog";
import { CoverLetterOutput } from "@/lib/ai/content-generator";
import { logger } from "@/lib/services/logger";
import { PlanLimitDialog } from "@/components/shared/plan-limit-dialog";

interface CoverLetterEditorProps {
  resumeId?: string;
}

type Section = "job" | "recipient" | "sender" | "content";

const coverLetterEditorLogger = logger.child({ module: "CoverLetterEditor" });

const sections: Array<{
  id: Section;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
    { id: "job", label: "Job Details", shortLabel: "Job", icon: Briefcase },
    {
      id: "recipient",
      label: "Recipient",
      shortLabel: "To",
      icon: Building2,
    },
    { id: "sender", label: "Your Info", shortLabel: "From", icon: User },
    {
      id: "content",
      label: "Letter Content",
      shortLabel: "Content",
      icon: FileCheck,
    },
  ];

const SECTION_DESCRIPTIONS: Record<Section, string> = {
  job: "Tell us about the role and reference details for this application.",
  recipient: "Who is this letter addressed to? Add company and contact info.",
  sender: "Confirm your name and contact details, or sync from your resume.",
  content: "Compose the opening, body, and closing paragraphs of your letter.",
};

export function CoverLetterEditor({ resumeId }: CoverLetterEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const shouldStartFresh = searchParams.get("fresh") === "1";
  const shouldStartInPreview = searchParams.get("preview") === "1";
  const isEditableTarget = (target: EventTarget | null) =>
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable);
  const [activeSection, setActiveSection] = useState<Section>("job");
  const [isMobile, setIsMobile] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<CoverLetterTemplateId>("modern");
  const [isSavingCoverLetter, setIsSavingCoverLetter] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [showExitHint, setShowExitHint] = useState(false);
  const exitHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMoveRef = useRef<number>(0);

  // Get resume data to sync personal info
  const { resumeData } = useResume();
  const { user } = useUser();
  const { resumes: savedResumes, isLoading: isSavedResumesLoading } = useSavedResumes(user?.id ?? null);
  const { coverLetters, isLoading: isLoadingCoverLetters, saveCoverLetter, updateCoverLetter } = useSavedCoverLetters(user?.id ?? null);

  // Cover letter state
  const {
    coverLetterData,
    updateJobInfo,
    updateRecipient,
    updateSenderInfo,
    syncFromPersonalInfo,
    updateSalutation,
    updateOpeningParagraph,
    updateBodyParagraph,
    addBodyParagraph,
    removeBodyParagraph,
    updateClosingParagraph,
    updateSignOff,
    updateTemplate,
    resetCoverLetter,
    loadCoverLetter,
    validateCoverLetter,
    completionPercentage,
    isDirty,
  } = useCoverLetter(resumeData.personalInfo);

  // Persist cover letter data
  const {
    value: savedData,
    setValue: saveData,
    clearValue: clearSavedData,
    hasLoaded: hasLoadedSavedData,
    isSaving,
    lastSaved,
  } = useLocalStorage<CoverLetterData | null>("cover-letter-data", null, 500);

  const hasLoadedInitialData = useRef(false);
  const [hasSessionDraftStatus, setHasSessionDraftStatus] = useState(false);
  const [showPlanLimitDialog, setShowPlanLimitDialog] = useState(false);
  const [planLimitCount, setPlanLimitCount] = useState(3);

  // Check viewport
  const previousIsMobile = useRef<boolean | null>(null);

  useEffect(() => {
    const checkViewport = () => {
      if (typeof window === "undefined") return;
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // Keep preview open on desktop, but default to the form when we enter mobile
      if (previousIsMobile.current === null || previousIsMobile.current !== mobile) {
        setShowPreview(previousIsMobile.current === null ? shouldStartInPreview || !mobile : !mobile);
        previousIsMobile.current = mobile;
      }
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, [shouldStartInPreview]);

  useEffect(() => {
    if (!isFullscreenPreview) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreenPreview]);

  // Handle template change
  const handleTemplateChange = useCallback(
    (templateId: CoverLetterTemplateId) => {
      setSelectedTemplateId(templateId);
      updateTemplate(templateId);
    },
    [updateTemplate]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      const rawKey = typeof event.key === "string" ? event.key : "";
      const key = rawKey.toLowerCase();

      if (key === "escape" && isFullscreenPreview) {
        event.preventDefault();
        setIsFullscreenPreview(false);
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;

      // ←/→ cycle templates while in fullscreen
      if (
        isFullscreenPreview &&
        (rawKey === "ArrowLeft" || rawKey === "ArrowRight")
      ) {
        event.preventDefault();
        const currentIndex = COVER_LETTER_TEMPLATES.findIndex(
          (t) => t.id === selectedTemplateId
        );
        const nextIndex =
          rawKey === "ArrowLeft"
            ? currentIndex <= 0
              ? COVER_LETTER_TEMPLATES.length - 1
              : currentIndex - 1
            : currentIndex >= COVER_LETTER_TEMPLATES.length - 1
              ? 0
              : currentIndex + 1;
        handleTemplateChange(COVER_LETTER_TEMPLATES[nextIndex].id);
        return;
      }

      if (isMobile) return;
      if (key !== "f") return;

      event.preventDefault();
      setIsFullscreenPreview((prev) => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreenPreview, isMobile, selectedTemplateId, handleTemplateChange]);

  // Floating exit pill: show on enter, auto-hide after 4s
  useEffect(() => {
    if (exitHintTimerRef.current) clearTimeout(exitHintTimerRef.current);
    if (!isFullscreenPreview) {
      setShowExitHint(false);
      return;
    }
    setShowExitHint(true);
    exitHintTimerRef.current = setTimeout(() => setShowExitHint(false), 4000);
    return () => {
      if (exitHintTimerRef.current) clearTimeout(exitHintTimerRef.current);
    };
  }, [isFullscreenPreview]);

  // Re-show pill briefly on mouse move (throttled to 500ms)
  const handleFullscreenMouseMove = useCallback(() => {
    const now = Date.now();
    if (now - lastMoveRef.current < 500) return;
    lastMoveRef.current = now;
    setShowExitHint(true);
    if (exitHintTimerRef.current) clearTimeout(exitHintTimerRef.current);
    exitHintTimerRef.current = setTimeout(() => setShowExitHint(false), 2000);
  }, []);

  useEffect(() => {
    if (isMobile && isFullscreenPreview) {
      setIsFullscreenPreview(false);
    }
  }, [isMobile, isFullscreenPreview]);

  useEffect(() => {
    router.prefetch?.("/dashboard");
  }, [router]);

  // Load saved cover letter by ID directly from Firestore
  useEffect(() => {
    if (hasLoadedInitialData.current || !editId || !user) return;

    let cancelled = false;

    async function fetchCoverLetter() {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase/config");

        const docRef = doc(db, "users", user!.id, "savedCoverLetters", editId!);
        const snap = await getDoc(docRef);

        if (cancelled) return;

        if (snap.exists()) {
          const data = snap.data();
          hasLoadedInitialData.current = true;
          loadCoverLetter(data.data as CoverLetterData);
          setSelectedTemplateId((data.data as CoverLetterData).templateId || "modern");
        } else {
          coverLetterEditorLogger.warn("Cover letter not found", { editId });
          hasLoadedInitialData.current = true;
        }
      } catch (error) {
        if (cancelled) return;
        coverLetterEditorLogger.error("Failed to load cover letter", error, { editId });
        hasLoadedInitialData.current = true;
      }
    }

    fetchCoverLetter();
    return () => { cancelled = true; };
  }, [editId, user, loadCoverLetter]);

  // Load from localStorage when not editing by ID
  useEffect(() => {
    if (hasLoadedInitialData.current || editId || !hasLoadedSavedData) return;
    hasLoadedInitialData.current = true;

    if (shouldStartFresh) {
      setHasSessionDraftStatus(false);
      return;
    }

    if (savedData) {
      loadCoverLetter(savedData);
      setSelectedTemplateId(savedData.templateId || "modern");
      setHasSessionDraftStatus(true);
    }
  }, [
    editId,
    hasLoadedSavedData,
    loadCoverLetter,
    savedData,
    shouldStartFresh,
  ]);

  // Auto-save only after the user changes something in this session.
  useEffect(() => {
    if (!hasLoadedInitialData.current || !isDirty) return;
    setHasSessionDraftStatus(true);
    saveData(coverLetterData);
  }, [coverLetterData, isDirty, saveData]);

  // Handle reset
  const handleReset = () => {
    setShowResetDialog(true);
  };

  const handleConfirmReset = useCallback(() => {
    resetCoverLetter();
    clearSavedData();
    setHasSessionDraftStatus(false);
    toast.success("Cover letter reset");
    setShowResetDialog(false);
  }, [clearSavedData, resetCoverLetter]);

  // Handle export PDF
  const handleExportPDF = useCallback(async () => {
    try {
      const { exportCoverLetterToPDF } = await import("@/lib/services/export");
      const result = await exportCoverLetterToPDF(
        coverLetterData,
        selectedTemplateId
      );

      if (result.success && result.blob) {
        downloadBlob(
          result.blob,
          `cover-letter-${coverLetterData.recipient?.company || "draft"
          }-${Date.now()}.pdf`
        );
        toast.success("Cover letter exported as PDF");
      } else {
        toast.error(result.error || "Failed to export PDF");
      }
    } catch (error) {
      logger.error("Cover letter PDF export failed", { error });
      toast.error("Failed to export PDF. Please try again.");
    }
  }, [coverLetterData, selectedTemplateId]);

  // Handle export JSON
  const handleExportJSON = useCallback(() => {
    downloadJSON(coverLetterData, `cover-letter-${Date.now()}.json`);
    toast.success("Cover letter exported as JSON");
  }, [coverLetterData]);

  const validation = validateCoverLetter();
  const progress = completionPercentage();
  const currentSectionIndex = sections.findIndex((s) => s.id === activeSection);
  const canGoPrevious = currentSectionIndex > 0;
  const canGoNext = currentSectionIndex < sections.length - 1;

  const isSectionComplete = useCallback(
    (sectionId: string) => {
      switch (sectionId) {
        case "job":
          return Boolean(coverLetterData.jobTitle?.trim());
        case "recipient":
          return Boolean(coverLetterData.recipient.company?.trim());
        case "sender":
          return Boolean(
            coverLetterData.senderName.trim() &&
              coverLetterData.senderEmail.trim()
          );
        case "content":
          return Boolean(
            coverLetterData.openingParagraph.trim() &&
              coverLetterData.closingParagraph.trim() &&
              coverLetterData.bodyParagraphs.some((p) => p.trim())
          );
        default:
          return false;
      }
    },
    [coverLetterData]
  );

  const completedSectionsCount = sections.filter((s) =>
    isSectionComplete(s.id)
  ).length;
  const sidebarProgress = Math.round(
    (completedSectionsCount / sections.length) * 100
  );

  const getLetterName = useCallback(() => {
    const jobTitle = coverLetterData.jobTitle?.trim();
    const company = coverLetterData.recipient.company?.trim();
    return jobTitle && company
      ? `${jobTitle} - ${company}`
      : company || jobTitle || "Cover Letter";
  }, [coverLetterData]);

  const handleSaveError = useCallback((error: unknown) => {
    const planError = error as PlanLimitError;
    if (planError?.code === "PLAN_LIMIT") {
      setPlanLimitCount(planError.limit ?? 3);
      setShowPlanLimitDialog(true);
      return;
    }
    // Check both the error itself and its cause (DatabaseError wraps Firebase errors)
    const err = error as { code?: string; cause?: unknown };
    const firebaseCode =
      (err?.code !== "FIRESTORE_ERROR" ? err?.code : undefined) ??
      (err?.cause as { code?: string })?.code;
    if (firebaseCode === "permission-denied") {
      toast.error("Permission denied. Please log out and log back in, then try again.");
      return;
    }
    if (firebaseCode === "unavailable") {
      toast.error("Service unavailable. Please check your internet connection and try again.");
      return;
    }
    toast.error("Failed to save cover letter. Please try again.");
  }, []);

  // Standalone save function (without redirect)
  const saveOrUpdate = useCallback(async (): Promise<boolean> => {
    const dataToSave = {
      ...coverLetterData,
      templateId: selectedTemplateId,
    };

    if (editId) {
      return await updateCoverLetter(editId, {
        name: getLetterName(),
        jobTitle: dataToSave.jobTitle,
        companyName: dataToSave.recipient?.company,
        data: dataToSave,
      });
    }

    const saved = await saveCoverLetter(getLetterName(), dataToSave);
    return !!saved;
  }, [coverLetterData, selectedTemplateId, editId, updateCoverLetter, saveCoverLetter, getLetterName]);

  const handleSave = useCallback(async () => {
    setIsSavingCoverLetter(true);
    try {
      const success = await saveOrUpdate();

      if (success) {
        toast.success("Cover letter saved!");
      } else {
        toast.error("Failed to save cover letter. Please try again.");
      }
    } catch (error) {
      coverLetterEditorLogger.error("Error saving cover letter", error);
      handleSaveError(error);
    } finally {
      setIsSavingCoverLetter(false);
    }
  }, [saveOrUpdate, handleSaveError]);

  const handleSaveAndRedirect = useCallback(async () => {
    if (validation.errors.length > 0) {
      toast.error(validation.errors[0].message);
      return;
    }

    setIsSavingCoverLetter(true);
    try {
      const success = await saveOrUpdate();

      if (success) {
        toast.success("Cover letter saved");
        clearSavedData();
        setHasSessionDraftStatus(false);
        router.push("/dashboard");
      } else {
        toast.error("Failed to save cover letter. Please try again.");
      }
    } catch (error) {
      coverLetterEditorLogger.error("Error saving cover letter", error);
      handleSaveError(error);
    } finally {
      setIsSavingCoverLetter(false);
    }
  }, [validation, saveOrUpdate, clearSavedData, router, handleSaveError]);

  // Auto-prefill sender info from most recent saved resume when creating a new cover letter
  // and the active resume draft has no personal info (user navigated directly here)
  const hasPrefillAppliedRef = useRef(false);
  useEffect(() => {
    if (hasPrefillAppliedRef.current) return;
    if (isSavedResumesLoading) return;
    if (editId) return; // editing existing cover letter — don't overwrite
    if (coverLetterData.senderName) return; // already has a name
    if (resumeData.personalInfo.firstName) return; // active draft has data

    const latestResume = savedResumes[0];
    if (!latestResume?.data?.personalInfo?.firstName) return;

    hasPrefillAppliedRef.current = true;
    syncFromPersonalInfo(latestResume.data.personalInfo);
  }, [isSavedResumesLoading, savedResumes, editId, coverLetterData.senderName, resumeData.personalInfo.firstName, syncFromPersonalInfo]);

  // Handle sync from resume
  const handleSyncFromResume = useCallback(() => {
    syncFromPersonalInfo(resumeData.personalInfo);
    toast.success("Contact info synced from resume");
  }, [syncFromPersonalInfo, resumeData.personalInfo]);

  // Handle AI-generated cover letter
  const handleAIGenerate = useCallback(
    (coverLetter: CoverLetterOutput) => {
      // Update the cover letter with AI-generated content
      updateSalutation(coverLetter.salutation);
      updateOpeningParagraph(coverLetter.introduction);

      // Update body paragraphs
      coverLetter.bodyParagraphs.forEach((paragraph, index) => {
        if (index < coverLetterData.bodyParagraphs.length) {
          updateBodyParagraph(index, paragraph);
        } else {
          addBodyParagraph();
          // Wait for state update, then set the paragraph
          setTimeout(() => updateBodyParagraph(index, paragraph), 0);
        }
      });

      updateClosingParagraph(coverLetter.closing);
      updateSignOff(coverLetter.signature.split('\n')[0]); // Get just the sign-off part

      toast.success("Cover letter content generated!", {
        description: "Review and edit the generated content as needed",
      });

      // Switch to content section to show the results
      setActiveSection("content");
    },
    [
      updateSalutation,
      updateOpeningParagraph,
      updateBodyParagraph,
      updateClosingParagraph,
      updateSignOff,
      addBodyParagraph,
      coverLetterData.bodyParagraphs.length,
    ]
  );


  const saveStatusText = hasSessionDraftStatus
    ? getSaveStatus(isSaving, lastSaved)
    : "No changes";

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

  const renderPreviewCanvas = (
    zoom: number,
    wrapperClassName: string,
    contentClassName: string
  ) => (
    <div className={cn("bg-muted/30", wrapperClassName)}>
      <div className={cn("overflow-auto p-4", contentClassName)}>
        <div
          className="w-[210mm] max-w-full mx-auto bg-white shadow-lg"
          style={{ zoom }}
        >
          <CoverLetterRenderer
            data={coverLetterData}
            templateId={selectedTemplateId}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Back + Title + Progress */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>

              <div className="hidden sm:block h-6 w-px bg-border" />

              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <h1 className="font-semibold truncate">Cover Letter</h1>
              </div>

              {/* Ready badge — progress is shown in the sidebar */}
              {validation.valid && (
                <div className="hidden lg:flex items-center ml-4">
                  <Badge variant="secondary" className="gap-1">
                    <Check className="w-3 h-3" />
                    Ready
                  </Badge>
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Save Status */}
              <span className="text-xs text-muted-foreground hidden md:inline">
                {saveStatusText}
              </span>

              <Button
                variant={showPreview ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowPreview((prev) => !prev)}
                className={cn(
                  "hidden lg:flex gap-2 h-9 rounded-full px-4 transition-all",
                  showPreview ? "shadow-sm" : ""
                )}
              >
                {showPreview ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                <span>{showPreview ? "Hide Preview" : "Preview"}</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={handleSave}
                    disabled={isSavingCoverLetter}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {isSavingCoverLetter ? "Saving..." : "Save Draft"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportJSON}>
                    <FileJson className="w-4 h-4 mr-2" />
                    Export JSON
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleReset}
                    className="text-destructive focus:text-destructive"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Done — disabled until at least one field is filled */}
              <Button
                size="sm"
                variant="default"
                onClick={handleSaveAndRedirect}
                disabled={progress === 0}
                className="h-9 px-4 rounded-full shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0 disabled:shadow-sm"
              >
                <Check className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Done</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-6 pb-28 lg:py-6">
        {/* Mobile Section Navigation */}
        <MobileSectionTabs
          sections={sections}
          activeSection={activeSection}
          onSectionChange={(sectionId: string) =>
            setActiveSection(sectionId as Section)
          }
          isSectionComplete={(sectionId) => {
            // Check if section is complete based on validation
            const sectionData = coverLetterData;
            switch (sectionId) {
              case "job":
                return Boolean(
                  sectionData.jobTitle?.trim() ||
                  sectionData.jobReference?.trim() ||
                  sectionData.date
                );
              case "recipient":
                return Boolean(
                  sectionData.recipient.company?.trim() ||
                  sectionData.recipient.name?.trim() ||
                  sectionData.recipient.department?.trim() ||
                  sectionData.recipient.address?.trim() ||
                  sectionData.recipient.title?.trim()
                );
              case "sender":
                return Boolean(
                  sectionData.senderName.trim() &&
                  sectionData.senderEmail.trim()
                );
              case "content":
                return Boolean(
                  sectionData.salutation &&
                  sectionData.openingParagraph.trim() &&
                  sectionData.bodyParagraphs.some((p) => p.trim()) &&
                  sectionData.closingParagraph.trim()
                );
              default:
                return false;
            }
          }}
        />

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Sidebar Navigation */}
          <aside className="hidden lg:flex flex-col gap-6 sticky top-24 self-start">
            <SectionNavigation
              sections={sections}
              activeSection={activeSection}
              onSectionChange={(id) => setActiveSection(id as Section)}
              isSectionComplete={isSectionComplete}
              progressPercentage={sidebarProgress}
            />

            {/* AI Assistant */}
            <Card className="p-4 w-64">
              <div className="flex items-center gap-2 text-primary mb-3">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold">AI Assistant</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Generate a personalized cover letter from your resume and job
                description.
              </p>
              <GenerateCoverLetterDialog
                onGenerate={handleAIGenerate}
                trigger={
                  <Button variant="outline" size="sm" className="w-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate with AI
                  </Button>
                }
              />
            </Card>
          </aside>

          {/* Center: Form */}
          <div className="flex-1 w-full min-w-0">
            <SectionWrapper
              title={sections.find((s) => s.id === activeSection)?.label ?? ""}
              description={SECTION_DESCRIPTIONS[activeSection] ?? ""}
              currentIndex={currentSectionIndex}
              totalSections={sections.length}
              canGoNext={canGoNext || !isSavingCoverLetter}
              canGoPrevious={canGoPrevious}
              onNext={canGoNext ? goToNext : handleSaveAndRedirect}
              onPrevious={goToPrevious}
              nextLabel={
                canGoNext ? "Next" : isSavingCoverLetter ? "Saving..." : "Done"
              }
              sections={sections}
              activeSectionId={activeSection}
              onSectionChange={(id) => setActiveSection(id as Section)}
              isSectionComplete={isSectionComplete}
              completedFields={completedSectionsCount}
              totalFields={sections.length}
            >
              <CoverLetterForm
                data={coverLetterData}
                onUpdateJobInfo={updateJobInfo}
                onUpdateRecipient={updateRecipient}
                onUpdateSenderInfo={updateSenderInfo}
                onSyncFromPersonalInfo={handleSyncFromResume}
                onUpdateSalutation={updateSalutation}
                onUpdateOpeningParagraph={updateOpeningParagraph}
                onUpdateBodyParagraph={updateBodyParagraph}
                onAddBodyParagraph={addBodyParagraph}
                onRemoveBodyParagraph={removeBodyParagraph}
                onUpdateClosingParagraph={updateClosingParagraph}
                onUpdateSignOff={updateSignOff}
                personalInfo={resumeData.personalInfo}
                activeSection={activeSection}
                validationErrors={validation.errors}
              />
            </SectionWrapper>
          </div>

          {/* Right: Preview */}
          {showPreview && (
            <div className="hidden lg:block w-[420px] shrink-0 sticky top-24">
              {/* Controls bar (mirrors resume preview-panel renderSideControls) */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <CoverLetterTemplatePicker
                  templateId={selectedTemplateId}
                  onChange={handleTemplateChange}
                />
                <div className="ml-auto flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsFullscreenPreview(true)}
                    aria-label="Maximize preview"
                    title="Fullscreen preview (F)"
                    className="h-8 w-8 rounded-lg border border-border/40 bg-card/60 hover:bg-muted/60 flex items-center justify-center transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-border/40 bg-card shadow-md overflow-hidden">
                {renderPreviewCanvas(
                  0.5,
                  "",
                  "max-h-[calc(100vh-12rem)]"
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Bar - Resume-like nav */}
      {isMobile && !showPreview && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-sm p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="grid grid-cols-[1fr_auto_1fr] h-14 px-1.5 gap-1.5 items-center">
            <button
              onClick={goToPrevious}
              disabled={!canGoPrevious}
              aria-label="Go to previous section"
              className={cn(
                "flex items-center justify-center gap-1.5 h-11 rounded-xl transition-colors text-sm font-medium",
                !canGoPrevious
                  ? "bg-muted/50 text-muted-foreground/40 cursor-not-allowed"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={() => setShowPreview(true)}
              aria-label="Preview cover letter"
              className="flex items-center justify-center h-11 w-11 rounded-xl transition-colors bg-muted text-muted-foreground hover:bg-muted/80"
            >
              <Eye className="w-6 h-6" />
            </button>

            <button
              onClick={canGoNext ? goToNext : handleSaveAndRedirect}
              className={cn(
                "flex items-center justify-center gap-1.5 h-11 rounded-xl font-medium text-sm transition-colors",
                canGoNext
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              <span>
                {canGoNext
                  ? "Next"
                  : isSavingCoverLetter
                    ? "Saving..."
                    : "Done"}
              </span>
              {canGoNext ? (
                <ArrowRight className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Preview Overlay */}
      {isMobile && showPreview && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <h2 className="font-semibold">Cover Letter Preview</h2>
              </div>
              <Select
                value={selectedTemplateId}
                onValueChange={(value) =>
                  handleTemplateChange(value as CoverLetterTemplateId)
                }
              >
                <SelectTrigger className="h-9 w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COVER_LETTER_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scrollable Preview Content */}
            {renderPreviewCanvas(0.45, "flex-1", "pb-24")}
          </div>

          {/* Bottom "Hide Preview" Button */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-sm p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button
              size="lg"
              onClick={() => setShowPreview(false)}
              className="w-full rounded-xl shadow-lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              Hide Preview
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Fullscreen Preview */}
      {isFullscreenPreview && !isMobile && typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl p-4 lg:p-8 flex flex-col animate-in fade-in duration-300"
            onMouseMove={handleFullscreenMouseMove}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsFullscreenPreview(false);
            }}
          >
            <div className="grid grid-cols-3 items-center gap-4 mb-6 w-full max-w-[1600px] mx-auto px-4">
              {/* Left: Back */}
              <div className="flex justify-start">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 rounded-lg shadow-sm"
                  onClick={() => setIsFullscreenPreview(false)}
                  title="Back to Editor (Esc)"
                  aria-label="Back to Editor"
                >
                  <ArrowLeft className="w-4 h-4 text-foreground/80" />
                </Button>
              </div>

              {/* Center: Template picker */}
              <div className="flex items-center justify-center gap-3">
                <CoverLetterTemplatePicker
                  templateId={selectedTemplateId}
                  onChange={handleTemplateChange}
                />
              </div>

              {/* Right: reserved */}
              <div className="flex justify-end" />
            </div>

            <div className="flex-1 min-h-0 w-full max-w-[1600px] mx-auto">
              {renderPreviewCanvas(0.85, "h-[calc(100vh-9rem)]", "h-full")}
            </div>

            {/* Floating exit pill — bottom-center, auto-hides, reappears on mouse move */}
            <div
              className={cn(
                "fixed bottom-8 left-1/2 -translate-x-1/2 z-[201] pointer-events-none",
                "transition-all duration-500",
                showExitHint
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-3"
              )}
            >
              <button
                type="button"
                onClick={() => setIsFullscreenPreview(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-full px-5 py-2.5",
                  "bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg",
                  "text-sm font-medium text-foreground",
                  "hover:bg-muted/60 transition-colors"
                )}
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                Back to editing
                <kbd className="inline-flex items-center rounded border border-border/50 bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  Esc
                </kbd>
              </button>
            </div>
          </div>,
          document.body
        )}

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset cover letter?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all cover letter content. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmReset}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PlanLimitDialog
        open={showPlanLimitDialog}
        onOpenChange={setShowPlanLimitDialog}
        limit={planLimitCount}
        resourceType="cover letters"
      />
    </div>
  );
}
