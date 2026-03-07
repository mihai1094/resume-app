"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCoverLetter } from "@/hooks/use-cover-letter";
import { useLocalStorage, getSaveStatus } from "@/hooks/use-local-storage";
import { useResume } from "@/hooks/use-resume";
import { useUser } from "@/hooks/use-user";
import { CoverLetterForm } from "./forms/cover-letter-form";
import { CoverLetterRenderer } from "./templates";
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
  Minimize2,
  Minus,
  Plus,
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
import { GenerateCoverLetterDialog } from "./generate-cover-letter-dialog";
import { CoverLetterOutput } from "@/lib/ai/content-generator";
import { logger } from "@/lib/services/logger";

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

export function CoverLetterEditor({ resumeId }: CoverLetterEditorProps) {
  const router = useRouter();
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
  const [fullscreenPreviewZoom, setFullscreenPreviewZoom] = useState(0.85);

  // Get resume data to sync personal info
  const { resumeData } = useResume();
  const { user } = useUser();
  const { saveCoverLetter } = useSavedCoverLetters(user?.id ?? null);

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
  } = useCoverLetter(resumeData.personalInfo);

  // Persist cover letter data
  const {
    value: savedData,
    setValue: saveData,
    clearValue: clearSavedData,
    isSaving,
    lastSaved,
  } = useLocalStorage<CoverLetterData | null>("cover-letter-data", null, 500);

  const hasLoadedInitialData = useRef(false);

  // Check viewport
  const previousIsMobile = useRef<boolean | null>(null);

  useEffect(() => {
    const checkViewport = () => {
      if (typeof window === "undefined") return;
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // Keep preview open on desktop, but default to the form when we enter mobile
      if (previousIsMobile.current === null || previousIsMobile.current !== mobile) {
        setShowPreview(!mobile);
        previousIsMobile.current = mobile;
      }
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  useEffect(() => {
    if (!isFullscreenPreview) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreenPreview]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      const key = typeof event.key === "string" ? event.key.toLowerCase() : "";

      if (key === "escape" && isFullscreenPreview) {
        event.preventDefault();
        setIsFullscreenPreview(false);
        return;
      }

      if (isMobile) return;
      if (key !== "f") return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;

      event.preventDefault();
      setIsFullscreenPreview((prev) => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreenPreview, isMobile]);

  const handleDecreaseFullscreenZoom = useCallback(() => {
    setFullscreenPreviewZoom((prev) => Math.max(0.5, Number((prev - 0.05).toFixed(2))));
  }, []);

  const handleIncreaseFullscreenZoom = useCallback(() => {
    setFullscreenPreviewZoom((prev) => Math.min(1.1, Number((prev + 0.05).toFixed(2))));
  }, []);

  const fullscreenZoomPercent = Math.round(fullscreenPreviewZoom * 100);

  useEffect(() => {
    if (isMobile && isFullscreenPreview) {
      setIsFullscreenPreview(false);
    }
  }, [isMobile, isFullscreenPreview]);

  // Load saved data on mount
  useEffect(() => {
    if (hasLoadedInitialData.current) return;
    hasLoadedInitialData.current = true;

    if (savedData) {
      loadCoverLetter(savedData);
      setSelectedTemplateId(savedData.templateId || "modern");
    }
  }, [loadCoverLetter, savedData]);

  // Auto-save
  useEffect(() => {
    saveData(coverLetterData);
  }, [coverLetterData, saveData]);

  // Handle template change
  const handleTemplateChange = useCallback(
    (templateId: CoverLetterTemplateId) => {
      setSelectedTemplateId(templateId);
      updateTemplate(templateId);
    },
    [updateTemplate]
  );

  // Handle reset
  const handleReset = () => {
    setShowResetDialog(true);
  };

  const handleConfirmReset = useCallback(() => {
    resetCoverLetter();
    clearSavedData();
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
          `cover-letter-${coverLetterData.recipient.company || "draft"
          }-${Date.now()}.pdf`
        );
        toast.success("Cover letter exported as PDF");
      } else {
        toast.error(result.error || "Failed to export PDF");
      }
    } catch {
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

  const getLetterName = useCallback(() => {
    const jobTitle = coverLetterData.jobTitle?.trim();
    const company = coverLetterData.recipient.company?.trim();
    return jobTitle && company
      ? `${jobTitle} - ${company}`
      : company || jobTitle || "Cover Letter";
  }, [coverLetterData]);

  const getSaveErrorMessage = (error: unknown): string => {
    const planError = error as PlanLimitError;
    if (planError?.code === "PLAN_LIMIT") {
      return `You've reached the limit of ${planError.limit} saved cover letters. Upgrade to premium for unlimited.`;
    }
    // Check both the error itself and its cause (DatabaseError wraps Firebase errors)
    const err = error as { code?: string; cause?: unknown };
    const firebaseCode =
      (err?.code !== "FIRESTORE_ERROR" ? err?.code : undefined) ??
      (err?.cause as { code?: string })?.code;
    if (firebaseCode === "permission-denied") {
      return "Permission denied. Please log out and log back in, then try again.";
    }
    if (firebaseCode === "unavailable") {
      return "Service unavailable. Please check your internet connection and try again.";
    }
    return "Failed to save cover letter. Please try again.";
  };

  // Standalone save function (without redirect)
  const handleSave = useCallback(async () => {
    setIsSavingCoverLetter(true);
    try {
      const saved = await saveCoverLetter(getLetterName(), {
        ...coverLetterData,
        templateId: selectedTemplateId,
      });

      if (saved) {
        toast.success("Cover letter saved!");
      } else {
        toast.error("Failed to save cover letter. Please try again.");
      }
    } catch (error) {
      coverLetterEditorLogger.error("Error saving cover letter", error);
      toast.error(getSaveErrorMessage(error));
    } finally {
      setIsSavingCoverLetter(false);
    }
  }, [coverLetterData, selectedTemplateId, saveCoverLetter, getLetterName]);

  const handleSaveAndRedirect = useCallback(async () => {
    if (!validation.valid) {
      const firstError =
        validation.errors[0]?.message ||
        "Please complete all required fields before saving.";
      toast.error(firstError);
      return;
    }

    setIsSavingCoverLetter(true);
    try {
      const saved = await saveCoverLetter(getLetterName(), {
        ...coverLetterData,
        templateId: selectedTemplateId,
      });

      if (saved) {
        toast.success("Cover letter saved");
        clearSavedData();
        router.push("/dashboard");
      } else {
        toast.error("Failed to save cover letter. Please try again.");
      }
    } catch (error) {
      coverLetterEditorLogger.error("Error saving cover letter", error);
      toast.error(getSaveErrorMessage(error));
    } finally {
      setIsSavingCoverLetter(false);
    }
  }, [validation, coverLetterData, selectedTemplateId, saveCoverLetter, clearSavedData, router, getLetterName]);

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


  const saveStatusText = getSaveStatus(isSaving, lastSaved);

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

              {/* Progress - Desktop */}
              <div className="hidden lg:flex items-center gap-3 ml-4">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {progress}%
                  </span>
                </div>
                {validation.valid && (
                  <Badge variant="secondary" className="gap-1">
                    <Check className="w-3 h-3" />
                    Ready
                  </Badge>
                )}
              </div>
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

              {/* Done */}
              <Button
                size="sm"
                variant="default"
                onClick={handleSaveAndRedirect}
                className="h-9 px-4 rounded-full shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0"
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
          <aside className="hidden lg:block w-52 shrink-0 sticky top-24">
            <nav className="space-y-1">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold",
                      activeSection === section.id
                        ? "bg-primary-foreground/20"
                        : "bg-muted"
                    )}
                  >
                    {index + 1}
                  </div>
                  {section.label}
                </button>
              ))}
            </nav>

            {/* AI Assistant */}
            <Card className="mt-6 p-4">
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
            <Card className="p-6">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">
                    {sections.find((s) => s.id === activeSection)?.label}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Step {currentSectionIndex + 1} of {sections.length}
                  </p>
                </div>
              </div>

              {/* Form Content */}
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

              {/* Navigation Buttons */}
              <div className="hidden lg:flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={goToPrevious}
                  disabled={!canGoPrevious}
                  className="h-11 px-5 text-sm font-semibold rounded-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={canGoNext ? goToNext : handleSaveAndRedirect}
                  disabled={!canGoNext && isSavingCoverLetter}
                  className="h-11 px-6 text-sm font-semibold rounded-full ml-auto"
                >
                  {canGoNext
                    ? "Next"
                    : isSavingCoverLetter
                      ? "Saving..."
                      : "Done"}
                  {canGoNext ? (
                    <ArrowRight className="w-4 h-4 ml-2" />
                  ) : (
                    <Check className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right: Preview */}
          {showPreview && (
            <div className="hidden lg:block w-[420px] shrink-0 sticky top-24">
              <Card className="overflow-hidden">
                <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Live Preview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedTemplateId}
                      onValueChange={(value) =>
                        handleTemplateChange(value as CoverLetterTemplateId)
                      }
                    >
                      <SelectTrigger className="h-8 w-40 text-xs font-semibold">
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setIsFullscreenPreview(true)}
                      title="Fullscreen preview"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {renderPreviewCanvas(
                  0.5,
                  "",
                  "max-h-[calc(100vh-12rem)]"
                )}
              </Card>
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
      {isFullscreenPreview && !isMobile && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl p-4 lg:p-8 flex flex-col animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto w-full px-2">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg tracking-tight">
                Cover Letter Preview
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedTemplateId}
                onValueChange={(value) =>
                  handleTemplateChange(value as CoverLetterTemplateId)
                }
              >
                <SelectTrigger className="h-10 w-40 rounded-full border-border/50 bg-card/60 text-xs font-semibold backdrop-blur-md">
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
              <div className="flex items-center gap-1 rounded-full border border-border/50 bg-card/60 backdrop-blur-md px-1.5 py-1 shadow-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleDecreaseFullscreenZoom}
                  disabled={fullscreenPreviewZoom <= 0.5}
                  title="Zoom out"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center text-xs font-medium text-foreground tabular-nums">
                  {fullscreenZoomPercent}%
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleIncreaseFullscreenZoom}
                  disabled={fullscreenPreviewZoom >= 1.1}
                  title="Zoom in"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-full h-10 px-6 shadow-sm border-border/50 bg-card/60 text-foreground backdrop-blur-md hover:bg-muted/50 hover:text-foreground transition-colors"
                onClick={() => setIsFullscreenPreview(false)}
              >
                <Minimize2 className="w-4 h-4" />
                Exit Full Preview
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto">
            <Card className="overflow-hidden h-full">
              {renderPreviewCanvas(fullscreenPreviewZoom, "h-full", "h-full")}
            </Card>
          </div>
        </div>
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
    </div>
  );
}
