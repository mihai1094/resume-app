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
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CoverLetterData,
  CoverLetterTemplateId,
  COVER_LETTER_TEMPLATES,
} from "@/lib/types/cover-letter";
import { downloadBlob, downloadJSON } from "@/lib/utils/download";
import { useSavedCoverLetters } from "@/hooks/use-saved-cover-letters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MobileSectionTabs } from "@/components/resume/mobile-section-tabs";

interface CoverLetterEditorProps {
  resumeId?: string;
}

type Section = "job" | "recipient" | "sender" | "content";

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
  const [activeSection, setActiveSection] = useState<Section>("job");
  const [isMobile, setIsMobile] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<CoverLetterTemplateId>("modern");
  const [isSavingCoverLetter, setIsSavingCoverLetter] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

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
  useEffect(() => {
    const checkViewport = () => {
      if (typeof window === "undefined") return;
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setShowPreview(true);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

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
          `cover-letter-${
            coverLetterData.recipient.company || "draft"
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

  // Standalone save function (without redirect)
  const handleSave = useCallback(async () => {
    // if (!user?.id) {
    //   toast.error("Please sign in to save your cover letter.");
    //   router.push("/login?redirect=/cover-letter");
    //   return;
    // }

    setIsSavingCoverLetter(true);
    try {
      const jobTitle = coverLetterData.jobTitle?.trim();
      const company = coverLetterData.recipient.company?.trim();
      const letterName =
        jobTitle && company
          ? `${jobTitle} - ${company}`
          : company || jobTitle || "Cover Letter";

      const saved = await saveCoverLetter(letterName, {
        ...coverLetterData,
        templateId: selectedTemplateId,
      });

      if (saved) {
        toast.success("Cover letter saved!");
      } else {
        toast.error("Failed to save cover letter");
      }
    } catch (error) {
      console.error("Error saving cover letter:", error);
      toast.error("Failed to save cover letter");
    } finally {
      setIsSavingCoverLetter(false);
    }
  }, [user?.id, coverLetterData, selectedTemplateId, saveCoverLetter, router]);

  const handleSaveAndRedirect = useCallback(async () => {
    if (!validation.valid) {
      const firstError =
        validation.errors[0]?.message ||
        "Please complete all required fields before saving.";
      toast.error(firstError);
      return;
    }

    // if (!user?.id) {
    //   toast.error("Please sign in to save your cover letter.");
    //   router.push("/login?redirect=/cover-letter");
    //   return;
    // }

    setIsSavingCoverLetter(true);
    try {
      const jobTitle = coverLetterData.jobTitle?.trim();
      const company = coverLetterData.recipient.company?.trim();
      const letterName =
        jobTitle && company
          ? `${jobTitle} - ${company}`
          : company || jobTitle || "Cover Letter";

      const saved = await saveCoverLetter(letterName, {
        ...coverLetterData,
        templateId: selectedTemplateId,
      });

      if (saved) {
        toast.success("Cover letter saved");
        clearSavedData();
        router.push("/dashboard");
      } else {
        toast.error("Failed to save cover letter");
      }
    } catch (error) {
      console.error("Error saving cover letter:", error);
      toast.error("Failed to save cover letter");
    } finally {
      setIsSavingCoverLetter(false);
    }
  }, [
    validation,
    user?.id,
    coverLetterData,
    selectedTemplateId,
    saveCoverLetter,
    clearSavedData,
    router,
  ]);

  // Handle sync from resume
  const handleSyncFromResume = useCallback(() => {
    syncFromPersonalInfo(resumeData.personalInfo);
    toast.success("Contact info synced from resume");
  }, [syncFromPersonalInfo, resumeData.personalInfo]);

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

              {/* Template Selector - Desktop */}
              <Select
                value={selectedTemplateId}
                onValueChange={(value) =>
                  handleTemplateChange(value as CoverLetterTemplateId)
                }
              >
                <SelectTrigger className="w-28 h-9 hidden md:flex">
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

              {/* Export PDF */}
              <Button size="sm" onClick={handleExportPDF}>
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">PDF</span>
              </Button>

              {/* Save & Exit */}
              <Button
                size="sm"
                variant="default"
                onClick={handleSaveAndRedirect}
              >
                <Check className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Save & Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
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

            {/* AI Assistant Placeholder */}
            <Card className="mt-6 p-4 border-dashed">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI Assistant</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Coming soon: AI-powered cover letter generation based on your
                resume and job description.
              </p>
              <Badge variant="secondary" className="mt-2">
                V1.5
              </Badge>
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
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={goToPrevious}
                  disabled={!canGoPrevious}
                >
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    disabled={isSavingCoverLetter}
                  >
                    {isSavingCoverLetter ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    onClick={canGoNext ? goToNext : handleSaveAndRedirect}
                    disabled={!canGoNext && isSavingCoverLetter}
                  >
                    {canGoNext
                      ? "Next"
                      : isSavingCoverLetter
                      ? "Saving..."
                      : "Finish & Save"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Preview */}
          {showPreview && (
            <div className="hidden lg:block w-[420px] shrink-0 sticky top-24">
              <Card className="overflow-hidden">
                <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                  <span className="text-sm font-medium">Live Preview</span>
                  <Badge variant="outline" className="text-xs">
                    {
                      COVER_LETTER_TEMPLATES.find(
                        (t) => t.id === selectedTemplateId
                      )?.name
                    }
                  </Badge>
                </div>
                <div className="overflow-y-auto max-h-[calc(100vh-12rem)] bg-muted/30 p-4">
                  <div className="w-[210mm] mx-auto" style={{ zoom: 0.5 }}>
                    <CoverLetterRenderer
                      data={coverLetterData}
                      templateId={selectedTemplateId}
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Preview Toggle */}
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
                Preview
              </>
            )}
          </Button>
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
              <Badge variant="outline" className="text-xs">
                {
                  COVER_LETTER_TEMPLATES.find(
                    (t) => t.id === selectedTemplateId
                  )?.name
                }
              </Badge>
            </div>

            {/* Scrollable Preview Content */}
            <div className="flex-1 overflow-auto p-4 bg-muted/30">
              <div
                className="w-[210mm] max-w-full mx-auto bg-white shadow-lg"
                style={{ zoom: 0.45 }}
              >
                <CoverLetterRenderer
                  data={coverLetterData}
                  templateId={selectedTemplateId}
                />
              </div>
            </div>
          </div>

          {/* Floating "Show Form" Button */}
          <div className="fixed bottom-6 right-6 z-40">
            <Button
              size="lg"
              onClick={() => setShowPreview(false)}
              className="rounded-full shadow-lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              Show Form
            </Button>
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
