"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useSavedResumes, type SavedResume } from "@/hooks/use-saved-resumes";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingPage } from "@/components/shared/loading";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { PlanLimitDialog } from "@/components/shared/plan-limit-dialog";
import { exportCoverLetterToPDF } from "@/lib/services/export";
import { downloadJSON } from "@/lib/utils/download";
import { ResumeData } from "@/lib/types/resume";
import { getTierLimits } from "@/lib/config/credits";
import { TemplateCustomization } from "@/components/resume/template-customizer";
import { launchFlags } from "@/config/launch";
import { logger } from "@/lib/services/logger";
import { shouldShowContinueDraft } from "@/lib/utils/resume-drafts";
import { shouldShowContinueCoverLetterDraft } from "@/lib/utils/cover-letter-drafts";

const DEFAULT_CUSTOMIZATION: TemplateCustomization = {
  primaryColor: "#0d9488",
  secondaryColor: "#2c2c2c",
  accentColor: "#0d9488",
  fontFamily: "sans",
  fontSize: 10,
  lineSpacing: 1.2,
  sectionSpacing: 1,
};

// Hooks
import { useResumeActions } from "./hooks/use-resume-actions";
import { useOptimizeFlow } from "./hooks/use-optimize-flow";
import { canOptimizeResume } from "./hooks/use-resume-utils";

// Components
import { MyResumesHeader } from "./components/my-resumes-header";
import { CoverLetterCard } from "./components/cover-letter-card";
import { useSavedCoverLetters } from "@/hooks/use-saved-cover-letters";
import { type CoverLetterData, type SavedCoverLetter } from "@/lib/types/cover-letter";
import { ResumeCard } from "./components/resume-card";
import { ResumeGroup } from "./components/resume-group";
import { DashboardHeader } from "./components/dashboard-header";
import { PreviewDialog } from "./components/preview-dialog";
import { OptimizeDialog } from "./components/optimize-dialog/optimize-dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { FileText, Plus } from "lucide-react";
import { FeedbackWidget } from "@/components/dashboard/feedback-widget";
import { TestimonialRequestCard } from "./components/testimonial-request-card";

export type ResumeItem = SavedResume;

type DashboardContentProps = {
  initialTab?: string;
};

function isStoredCoverLetterData(value: unknown): value is CoverLetterData {
  return Boolean(
    value &&
      typeof value === "object" &&
      "recipient" in value &&
      "bodyParagraphs" in value &&
      Array.isArray((value as CoverLetterData).bodyParagraphs)
  );
}

const dashboardLogger = logger.child({ module: "DashboardContent" });

export function DashboardContent({ initialTab }: DashboardContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"resumes" | "cover-letters">(
    initialTab === "cover-letters" ? "cover-letters" : "resumes"
  );
  const { user, isLoading: userLoading, logout } = useUser();
  const {
    resumes,
    resumeCount,
    isLoading: resumesLoading,
    isLoadingMore: isLoadingMoreResumes,
    hasMoreResumes,
    loadMoreResumes,
    deleteResume,
    saveResume,
    getLatestResume,
  } = useSavedResumes(user?.id || null);
  const {
    coverLetters,
    coverLetterCount,
    isLoading: lettersLoading,
    isLoadingMore: isLoadingMoreCoverLetters,
    hasMoreCoverLetters,
    loadMoreCoverLetters,
    deleteCoverLetter,
  } = useSavedCoverLetters(user?.id || null);

  // Custom Hooks
  const {
    handleLoadResume,
    handleExportPDF,
    handleExportJSON,
    handleOpenDeleteDialog,
    handleConfirmDelete,
    handleCancelDelete,
    exportingPdfId,
    pendingDelete,
    isDeletingResume,
  } = useResumeActions(deleteResume);

  const [deletingLetterId, setDeletingLetterId] = useState<string | null>(null);
  const [pendingLetterDelete, setPendingLetterDelete] =
    useState<SavedCoverLetter | null>(null);
  const [exportingLetterPdfId, setExportingLetterPdfId] = useState<string | null>(null);

  const handleDeleteLetter = (letter: SavedCoverLetter) => {
    setPendingLetterDelete(letter);
  };

  const confirmDeleteLetter = async () => {
    if (!pendingLetterDelete) return;
    setDeletingLetterId(pendingLetterDelete.id);
    try {
      await deleteCoverLetter(pendingLetterDelete.id);
      toast.success("Cover letter deleted.");
    } catch (error) {
      dashboardLogger.error("Failed to delete cover letter", error, {
        coverLetterId: pendingLetterDelete.id,
      });
      toast.error("Failed to delete cover letter. Please try again.");
    } finally {
      setDeletingLetterId(null);
      setPendingLetterDelete(null);
    }
  };

  const handleExportLetterPDF = async (letter: SavedCoverLetter) => {
    setExportingLetterPdfId(letter.id);
    try {
      const result = await exportCoverLetterToPDF(
        letter.data,
        letter.data.templateId,
        { fileName: letter.name }
      );
      if (result.success && result.blob) {
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${letter.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Cover letter exported as PDF.");
      } else {
        toast.error(result.error || "Failed to export PDF.");
      }
    } catch (error) {
      dashboardLogger.error("Failed to export cover letter PDF", error, {
        coverLetterId: letter.id,
      });
      toast.error("Failed to export cover letter. Please try again.");
    } finally {
      setExportingLetterPdfId(null);
    }
  };

  const handlePreviewLetter = useCallback(
    (letter: SavedCoverLetter) => {
      router.push(`/cover-letter?id=${letter.id}&preview=1`);
    },
    [router]
  );

  const handleExportLetterJSON = useCallback((letter: SavedCoverLetter) => {
    downloadJSON(
      letter.data,
      `${letter.name.replace(/[^a-zA-Z0-9]/g, "_")}-${letter.id}.json`
    );
    toast.success("Cover letter exported as JSON.");
  }, []);

  const {
    optimizeDialogOpen,
    setOptimizeDialogOpen,
    jobDescription,
    setJobDescription,
    jobTitle,
    setJobTitle,
    companyName,
    setCompanyName,
    selectedResumeId,
    setSelectedResumeId,
    analysis,
    isAnalyzing,
    analysisError,
    handleOptimize,
    handleRetry,
    resetAnalysis,
  } = useOptimizeFlow(resumes);

  const [previewResumeId, setPreviewResumeId] = useState<string | null>(null);
  const [showPlanLimitModal, setShowPlanLimitModal] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<SavedResume | null>(null);
  const [currentCoverLetterDraft, setCurrentCoverLetterDraft] = useState<{
    data: SavedCoverLetter["data"];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCurrentDraft = async () => {
      if (!user?.id) {
        setCurrentDraft(null);
        return;
      }

      try {
        const latestDraft = await getLatestResume();

        if (!cancelled) {
          setCurrentDraft(latestDraft);
        }
      } catch (error) {
        dashboardLogger.error("Failed to load current draft", error, {
          userId: user.id,
        });

        if (!cancelled) {
          setCurrentDraft(null);
        }
      }
    };

    void loadCurrentDraft();

    return () => {
      cancelled = true;
    };
  }, [user?.id, getLatestResume]);

  const hasCurrentDraft = useMemo(
    () => shouldShowContinueDraft(currentDraft, resumes),
    [currentDraft, resumes]
  );
  const hasCurrentCoverLetterDraft = useMemo(
    () =>
      shouldShowContinueCoverLetterDraft(currentCoverLetterDraft, coverLetters),
    [currentCoverLetterDraft, coverLetters]
  );

  useEffect(() => {
    if (!user?.id) {
      setCurrentCoverLetterDraft(null);
      return;
    }

    if (typeof window === "undefined") return;

    try {
      const rawDraft = window.localStorage.getItem("cover-letter-data");

      if (!rawDraft) {
        setCurrentCoverLetterDraft(null);
        return;
      }

      const parsedDraft = JSON.parse(rawDraft) as
        | { data?: SavedCoverLetter["data"] }
        | SavedCoverLetter["data"];
      const draftData =
        parsedDraft &&
        typeof parsedDraft === "object" &&
        "data" in parsedDraft &&
        parsedDraft.data
          ? parsedDraft.data
          : parsedDraft;

      if (isStoredCoverLetterData(draftData)) {
        setCurrentCoverLetterDraft({ data: draftData });
      } else {
        setCurrentCoverLetterDraft(null);
      }
    } catch (error) {
      dashboardLogger.warn("Failed to read cover letter draft", {
        error,
        userId: user?.id ?? null,
      });
      setCurrentCoverLetterDraft(null);
    }
  }, [user?.id]);

  // Derived State
  const eligibleResumes = resumes.filter((resume) =>
    canOptimizeResume(resume.data)
  );
  const hasEligibleResume = eligibleResumes.length > 0;
  const hasResumes = resumes.length > 0;
  const hasCoverLetters = coverLetters.length > 0;
  const aiEnabled = launchFlags.features.resumeOptimize;

  // Group resumes: master resumes and their tailored versions
  const groupedResumes = useMemo(() => {
    // Master resumes are those without sourceResumeId
    const masterResumes = resumes.filter((r) => !r.sourceResumeId);

    // Create a map of tailored resumes by their source
    const tailoredBySource = new Map<string, SavedResume[]>();
    resumes.forEach((r) => {
      if (r.sourceResumeId) {
        const existing = tailoredBySource.get(r.sourceResumeId) || [];
        existing.push(r);
        tailoredBySource.set(r.sourceResumeId, existing);
      }
    });

    // Orphaned tailored resumes (source was deleted)
    const orphanedTailored = resumes.filter(
      (r) => r.sourceResumeId && !masterResumes.some((m) => m.id === r.sourceResumeId)
    );

    return {
      masterResumes,
      tailoredBySource,
      orphanedTailored,
    };
  }, [resumes]);

  const handleOptimizeEntry = (resumeId?: string) => {
    if (userLoading) return;

    const targetResumeId =
      resumeId || eligibleResumes[0]?.id || resumes[0]?.id || "";

    if (!targetResumeId) {
      toast.error("Add a resume to optimize.");
      return;
    }

    setSelectedResumeId(targetResumeId);
    setOptimizeDialogOpen(true);
  };

  const handleCreateTailoredCopy = async (
    sourceResume: SavedResume,
    targetJobTitle: string,
    targetCompanyName: string
  ) => {
    if (!user?.id) {
      toast.error("Please log in to create a tailored resume.");
      return;
    }

    // Generate name for the tailored copy
    const tailoredName = targetCompanyName
      ? `${sourceResume.name} - ${targetCompanyName}`
      : targetJobTitle
      ? `${sourceResume.name} - ${targetJobTitle}`
      : `${sourceResume.name} - Tailored`;

    try {
      const result = await saveResume(
        tailoredName,
        sourceResume.templateId,
        sourceResume.data,
        {
          sourceResumeId: sourceResume.id,
          targetJobTitle: targetJobTitle || undefined,
          targetCompany: targetCompanyName || undefined,
        }
      );

      if (result && "id" in result) {
        toast.success("Tailored resume created!", {
          description: "Opening editor to apply recommendations...",
        });
        setOptimizeDialogOpen(false);
        resetAnalysis();
        router.push(`/editor/${result.id}`);
      } else if (result && "code" in result && result.code === "PLAN_LIMIT") {
        setShowPlanLimitModal(true);
      } else {
        toast.error("Failed to create tailored resume.");
      }
    } catch (error) {
      dashboardLogger.error("Failed to create tailored resume", error, {
        sourceResumeId: sourceResume.id,
      });
      toast.error("Failed to create tailored resume. Please try again.");
    }
  };

  const handleSaveTailoredResume = async (
    sourceResume: SavedResume,
    tailoredData: ResumeData,
    targetJobTitle: string,
    targetCompanyName: string
  ) => {
    if (!user?.id) {
      toast.error("Please log in to save the tailored resume.");
      return;
    }

    // Generate name for the tailored copy
    const tailoredName = targetCompanyName
      ? `${sourceResume.name} - ${targetCompanyName}`
      : targetJobTitle
      ? `${sourceResume.name} - ${targetJobTitle}`
      : `${sourceResume.name} - Tailored`;

    try {
      const result = await saveResume(
        tailoredName,
        sourceResume.templateId,
        tailoredData,
        {
          sourceResumeId: sourceResume.id,
          targetJobTitle: targetJobTitle || undefined,
          targetCompany: targetCompanyName || undefined,
        }
      );

      if (result && "id" in result) {
        toast.success("Tailored resume saved!", {
          description: "Your optimized resume has been saved.",
        });
        setOptimizeDialogOpen(false);
        resetAnalysis();
        router.push(`/editor/${result.id}`);
      } else if (result && "code" in result && result.code === "PLAN_LIMIT") {
        setShowPlanLimitModal(true);
      } else {
        toast.error("Failed to save tailored resume.");
      }
    } catch (error) {
      dashboardLogger.error("Failed to save tailored resume", error, {
        sourceResumeId: sourceResume.id,
      });
      toast.error("Failed to save tailored resume. Please try again.");
    }
  };

  const previewResume = previewResumeId
    ? resumes.find((r) => r.id === previewResumeId)
    : null;

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/");
  }, [logout, router]);

  const plan = user?.plan ?? "free";
  const limits = getTierLimits(plan);
  const resumeLimit = limits.maxResumes;
  const coverLetterLimit = limits.maxCoverLetters;
  const isResumeLimitReached = resumeCount >= resumeLimit;
  const isCoverLetterLimitReached = coverLetterCount >= coverLetterLimit;

  const handleCreateClick = () => {
    if (isResumeLimitReached) {
      setShowPlanLimitModal(true);
      return;
    }
    // Always route through the template gallery so users see filled-in
    // previews before starting a new resume. The gallery has its own
    // "Skip template selection" escape hatch for users who want the default.
    router.push("/templates");
  };

  const handleContinueDraft = () => {
    router.push("/editor/new?continue=1");
  };

  const handleCreateCoverLetter = useCallback(() => {
    if (isCoverLetterLimitReached) {
      setShowPlanLimitModal(true);
      return;
    }
    router.push("/cover-letter?fresh=1");
  }, [isCoverLetterLimitReached, router]);

  const handleContinueCoverLetterDraft = useCallback(() => {
    router.push("/cover-letter?continue=1");
  }, [router]);

  if (userLoading || resumesLoading || lettersLoading) {
    return <LoadingPage text="Loading your dashboard..." />;
  }

  return (
    <TooltipProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <MyResumesHeader
            user={user}
            activeTab={activeTab}
            showOptimize={launchFlags.features.resumeOptimize}
            showContinueDraft={
              activeTab === "resumes"
                ? hasCurrentDraft
                : hasCurrentCoverLetterDraft
            }
            hasEligibleResume={hasEligibleResume}
            hasAiAccess={aiEnabled}
            createLabel={hasResumes ? "New Resume" : "Create Your First Resume"}
            onCreateResume={handleCreateClick}
            onCreateCoverLetter={handleCreateCoverLetter}
            onContinueDraft={
              activeTab === "resumes"
                ? handleContinueDraft
                : handleContinueCoverLetterDraft
            }
            onOptimizeClick={() => handleOptimizeEntry()}
            onLogout={handleLogout}
          />

          <div className="container mx-auto px-4 pt-2 pb-8 sm:pt-4 md:py-8 max-w-6xl">
            <DashboardHeader
              user={user}
              resumeCount={resumeCount}
              coverLetterCount={coverLetterCount}
              resumeLimit={resumeLimit}
              coverLetterLimit={coverLetterLimit}
              activeTab={activeTab}
              onSelectResumes={() => setActiveTab("resumes")}
              onSelectCoverLetters={() => setActiveTab("cover-letters")}
            />

            <div className="space-y-8">
              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(
                    value === "cover-letters" ? "cover-letters" : "resumes"
                  )
                }
                className="w-full space-y-6"
              >
                <TabsContent value="resumes" className="space-y-4">
                  {!hasResumes && hasCurrentDraft ? (
                    <EmptyState
                      icon={FileText}
                      title="Continue your draft"
                      description="You have an unsaved draft resume. Pick up where you left off, or start fresh."
                      actionLabel="Continue draft"
                      onAction={handleContinueDraft}
                      secondaryActionLabel="Start new resume"
                      onSecondaryAction={handleCreateClick}
                    />
                  ) : !hasResumes ? (
                    <EmptyState
                      icon={FileText}
                      title="Create your first resume"
                      description="Use our AI builder or choose from premium templates to get started."
                      actionLabel="Start my Resume"
                      onAction={handleCreateClick}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* New resume card */}
                      <button
                        type="button"
                        onClick={handleCreateClick}
                        className="group flex flex-col items-center justify-center gap-3 min-h-[200px] rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 bg-muted/20 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                          <Plus className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                          New Resume
                        </span>
                      </button>

                      {/* Master resumes with their tailored versions */}
                      {groupedResumes.masterResumes.map((resume) => {
                        const tailoredVersions = groupedResumes.tailoredBySource.get(resume.id) || [];

                        return (
                          <ResumeGroup
                            key={resume.id}
                            masterResume={resume}
                            tailoredResumes={tailoredVersions}
                            masterCardComponent={
                              <ResumeCard
                                resume={resume}
                                onEdit={() => handleLoadResume(resume)}
                                onDesign={() =>
                                  router.push(`/editor/${resume.id}?openTemplate=1`)
                                }
                                onPreview={() => setPreviewResumeId(resume.id)}
                                onExportPDF={() => handleExportPDF(resume)}
                                onExportJSON={() => handleExportJSON(resume)}
                                onDelete={() => handleOpenDeleteDialog(resume)}
                                onOptimize={() => handleOptimizeEntry(resume.id)}
                                isExportingPdf={exportingPdfId === resume.id}
                                canOptimize={
                                  aiEnabled ? canOptimizeResume(resume.data) : false
                                }
                                isOptimizeLocked={false}
                              />
                            }
                            onEditTailored={(r) => handleLoadResume(r)}
                            onPreviewTailored={(r) => setPreviewResumeId(r.id)}
                            onExportPDFTailored={(r) => handleExportPDF(r)}
                            onDeleteTailored={(r) => handleOpenDeleteDialog(r)}
                            exportingPdfId={exportingPdfId}
                          />
                        );
                      })}

                      {/* Orphaned tailored resumes (master was deleted) */}
                      {groupedResumes.orphanedTailored.map((resume) => (
                        <ResumeCard
                          key={resume.id}
                          resume={resume}
                          onEdit={() => handleLoadResume(resume)}
                          onDesign={() =>
                            router.push(`/editor/${resume.id}?openTemplate=1`)
                          }
                          onPreview={() => setPreviewResumeId(resume.id)}
                          onExportPDF={() => handleExportPDF(resume)}
                          onExportJSON={() => handleExportJSON(resume)}
                          onDelete={() => handleOpenDeleteDialog(resume)}
                          onOptimize={() => handleOptimizeEntry(resume.id)}
                          isExportingPdf={exportingPdfId === resume.id}
                          canOptimize={
                            aiEnabled ? canOptimizeResume(resume.data) : false
                          }
                          isOptimizeLocked={false}
                        />
                      ))}

                      {hasMoreResumes && (
                        <div className="md:col-span-2 lg:col-span-3 flex justify-center pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => void loadMoreResumes()}
                            disabled={isLoadingMoreResumes}
                          >
                            {isLoadingMoreResumes ? "Loading..." : "Load More Resumes"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="cover-letters" className="space-y-4">
                  {!hasCoverLetters ? (
                    <EmptyState
                      icon={ScrollText}
                      title="No cover letters yet"
                      description="Create a personalized cover letter that complements your resume and increases your chances."
                      actionLabel="Create Cover Letter"
                      onAction={handleCreateCoverLetter}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* New cover letter card */}
                      <button
                        type="button"
                        onClick={handleCreateCoverLetter}
                        className="group flex flex-col items-center justify-center gap-3 min-h-[200px] rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-blue-500/40 bg-muted/20 hover:bg-blue-500/5 transition-all duration-200 cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                          <Plus className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-blue-500 transition-colors">
                          New Cover Letter
                        </span>
                      </button>

                      {coverLetters.map((letter) => (
                        <CoverLetterCard
                          key={letter.id}
                          letter={letter}
                          onPreview={() => handlePreviewLetter(letter)}
                          onExportJSON={() => handleExportLetterJSON(letter)}
                          onDelete={handleDeleteLetter}
                          onExportPDF={() => handleExportLetterPDF(letter)}
                          isExportingPdf={exportingLetterPdfId === letter.id}
                        />
                      ))}

                      {hasMoreCoverLetters && (
                        <div className="md:col-span-2 lg:col-span-3 flex justify-center pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => void loadMoreCoverLetters()}
                            disabled={isLoadingMoreCoverLetters}
                          >
                            {isLoadingMoreCoverLetters
                              ? "Loading..."
                              : "Load More Cover Letters"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {(hasResumes || hasCoverLetters) && (
              <div className="mt-8">
                <TestimonialRequestCard defaultName={user?.name} />
              </div>
            )}
          </div>

          <PreviewDialog
            resume={previewResume || null}
            customization={previewResume?.customization}
            onClose={() => setPreviewResumeId(null)}
            onEdit={() => {
              if (!previewResume) return;
              setPreviewResumeId(null);
              router.push(`/editor/${previewResume.id}`);
            }}
          />

          <PlanLimitDialog
            open={showPlanLimitModal}
            onOpenChange={setShowPlanLimitModal}
            limit={resumeLimit}
            onManage={() => setShowPlanLimitModal(false)}
            onUpgrade={() => {
              setShowPlanLimitModal(false);
              router.push("/pricing#pro");
            }}
          />

          <AlertDialog
            open={!!pendingDelete}
            onOpenChange={(open) => {
              if (!open) handleCancelDelete();
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this resume?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.{" "}
                  <span className="font-semibold">
                    {pendingDelete?.name}
                  </span>{" "}
                  will be permanently removed from your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleConfirmDelete}
                  disabled={!pendingDelete || isDeletingResume}
                >
                  {isDeletingResume ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog
            open={!!pendingLetterDelete}
            onOpenChange={(open) => {
              if (!open) setPendingLetterDelete(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete this cover letter?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.{" "}
                  <span className="font-semibold">
                    {pendingLetterDelete?.name}
                  </span>{" "}
                  will be permanently removed from your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={confirmDeleteLetter}
                  disabled={
                    !pendingLetterDelete ||
                    deletingLetterId === pendingLetterDelete.id
                  }
                >
                  {deletingLetterId === pendingLetterDelete?.id
                    ? "Deleting..."
                    : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <OptimizeDialog
            open={optimizeDialogOpen}
            onOpenChange={setOptimizeDialogOpen}
            resumes={eligibleResumes}
            selectedResumeId={selectedResumeId}
            setSelectedResumeId={setSelectedResumeId}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            companyName={companyName}
            setCompanyName={setCompanyName}
            onAnalyze={handleOptimize}
            isAnalyzing={isAnalyzing}
            analysis={analysis}
            analysisError={analysisError}
            onRetry={handleRetry}
            onCreateTailoredCopy={handleCreateTailoredCopy}
            onSaveTailoredResume={handleSaveTailoredResume}
          />

          <FeedbackWidget />
        </div>
      </ErrorBoundary>
    </TooltipProvider>
  );
}
