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
import { ResumeData } from "@/lib/types/resume";
import { getTierLimits } from "@/lib/config/credits";
import { TemplateCustomization } from "@/components/resume/template-customizer";
import { launchFlags } from "@/config/launch";
import { logger } from "@/lib/services/logger";

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
import { type SavedCoverLetter } from "@/lib/types/cover-letter";
import { ResumeCard } from "./components/resume-card";
import { ResumeGroup } from "./components/resume-group";
import { DashboardHeader } from "./components/dashboard-header";
import { PreviewDialog } from "./components/preview-dialog";
import { OptimizeDialog } from "./components/optimize-dialog/optimize-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, ScrollText } from "lucide-react";
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
import { OnboardingChecklist } from "./components/onboarding-checklist";

export type ResumeItem = SavedResume;

type DashboardContentProps = {
  initialTab?: string;
};
const dashboardLogger = logger.child({ module: "DashboardContent" });

function hasMeaningfulResumeContent(data: ResumeData | null | undefined) {
  if (!data) return false;

  const personalInfoValues = [
    data.personalInfo.firstName,
    data.personalInfo.lastName,
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
    data.personalInfo.website,
    data.personalInfo.linkedin,
    data.personalInfo.github,
    data.personalInfo.summary,
    data.personalInfo.jobTitle,
  ];

  const hasPersonalInfo = personalInfoValues.some((value) => Boolean(value?.trim()));

  return (
    hasPersonalInfo ||
    (data.workExperience?.length ?? 0) > 0 ||
    (data.education?.length ?? 0) > 0 ||
    (data.skills?.length ?? 0) > 0 ||
    (data.projects?.length ?? 0) > 0 ||
    (data.languages?.length ?? 0) > 0 ||
    (data.certifications?.length ?? 0) > 0 ||
    (data.courses?.length ?? 0) > 0 ||
    (data.hobbies?.length ?? 0) > 0 ||
    (data.extraCurricular?.length ?? 0) > 0 ||
    (data.customSections?.length ?? 0) > 0
  );
}

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
    exportingPdfId,
    pendingDeleteIds,
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
  const [hasCurrentDraft, setHasCurrentDraft] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadCurrentDraft = async () => {
      if (!user?.id) {
        setHasCurrentDraft(false);
        return;
      }

      try {
        const currentDraft = await getLatestResume();

        if (!cancelled) {
          setHasCurrentDraft(hasMeaningfulResumeContent(currentDraft?.data));
        }
      } catch (error) {
        dashboardLogger.error("Failed to load current draft", error, {
          userId: user.id,
        });

        if (!cancelled) {
          setHasCurrentDraft(false);
        }
      }
    };

    void loadCurrentDraft();

    return () => {
      cancelled = true;
    };
  }, [user?.id, getLatestResume]);

  // Derived State
  const visibleResumes = resumes.filter((r) => !pendingDeleteIds.has(r.id));
  const eligibleResumes = visibleResumes.filter((resume) =>
    canOptimizeResume(resume.data)
  );
  const hasEligibleResume = eligibleResumes.length > 0;
  const hasResumes = visibleResumes.length > 0;
  const hasCoverLetters = coverLetters.length > 0;
  const aiEnabled = launchFlags.features.resumeOptimize;

  // Group resumes: master resumes and their tailored versions
  const groupedResumes = useMemo(() => {
    // Master resumes are those without sourceResumeId
    const masterResumes = visibleResumes.filter((r) => !r.sourceResumeId);

    // Create a map of tailored resumes by their source
    const tailoredBySource = new Map<string, SavedResume[]>();
    visibleResumes.forEach((r) => {
      if (r.sourceResumeId) {
        const existing = tailoredBySource.get(r.sourceResumeId) || [];
        existing.push(r);
        tailoredBySource.set(r.sourceResumeId, existing);
      }
    });

    // Orphaned tailored resumes (source was deleted)
    const orphanedTailored = visibleResumes.filter(
      (r) => r.sourceResumeId && !masterResumes.some((m) => m.id === r.sourceResumeId)
    );

    return {
      masterResumes,
      tailoredBySource,
      orphanedTailored,
    };
  }, [visibleResumes]);

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
    if (hasResumes) {
      router.push("/editor/new");
    } else {
      router.push("/templates");
    }
  };

  const handleContinueDraft = () => {
    router.push("/editor/new?continue=1");
  };

  if (userLoading || resumesLoading || lettersLoading) {
    return <LoadingPage text="Loading your dashboard..." />;
  }

  return (
    <TooltipProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <MyResumesHeader
            user={user}
            showOptimize={launchFlags.features.resumeOptimize}
            showContinueDraft={hasCurrentDraft}
            hasEligibleResume={hasEligibleResume}
            hasAiAccess={aiEnabled}
            createLabel={hasResumes ? "New Resume" : "Create Your First Resume"}
            onCreateResume={handleCreateClick}
            onContinueDraft={handleContinueDraft}
            onOptimizeClick={() => handleOptimizeEntry()}
            onLogout={handleLogout}
          />

          <div className="container mx-auto px-4 py-8 max-w-6xl">
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

            {/* Soft Limit Warning */}
            {resumeLimit - resumeCount === 1 && plan === "free" && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                    You have 1 resume creation left on the Free plan.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-yellow-500/20 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-500/10"
                  onClick={() => router.push("/pricing#pro")}
                >
                  Upgrade for Unlimited
                </Button>
              </div>
            )}

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
                <TabsList className="grid w-full grid-cols-2 sm:max-w-[400px] rounded-full p-1 bg-muted/50 backdrop-blur-sm border shadow-sm">
                  <TabsTrigger value="resumes" className="rounded-full data-[state=active]:shadow-md transition-all">
                    Resumes
                    <span className="md:hidden ml-1 text-muted-foreground">
                      ({resumeCount})
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="cover-letters" className="rounded-full data-[state=active]:shadow-md transition-all">
                    Letters
                    <span className="md:hidden ml-1 text-muted-foreground">
                      ({coverLetterCount})
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="resumes" className="space-y-4">
                  {!hasResumes ? (
                    <OnboardingChecklist onCreateResume={handleCreateClick} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Inline Create Card for Resumes */}
                      <button
                        onClick={handleCreateClick}
                        className="group relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-muted/5 hover:bg-muted/20 hover:border-primary/50 transition-all duration-300 min-h-[260px] cursor-pointer text-left overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-transform duration-300 relative z-10 text-primary">
                          <Plus className="h-7 w-7" />
                        </div>
                        <h3 className="font-semibold text-lg pb-1 relative z-10 text-center">Create New Resume</h3>
                        <p className="text-sm text-muted-foreground text-center px-4 relative z-10">
                          Start from scratch or choose from our premium templates.
                        </p>
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
                      onAction={() => router.push("/cover-letter")}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Inline Create Card for Cover Letters */}
                      <button
                        onClick={() => router.push("/cover-letter")}
                        className="group relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-muted/5 hover:bg-muted/20 hover:border-blue-500/50 transition-all duration-300 min-h-[260px] cursor-pointer text-left overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-500/20 transition-transform duration-300 relative z-10 text-blue-500">
                          <ScrollText className="h-7 w-7" />
                        </div>
                        <h3 className="font-semibold text-lg pb-1 relative z-10 text-center">Create Cover Letter</h3>
                        <p className="text-sm text-muted-foreground text-center px-4 relative z-10">
                          Generate a highly tailored cover letter for your target job.
                        </p>
                      </button>

                      {coverLetters.map((letter) => (
                        <CoverLetterCard
                          key={letter.id}
                          letter={letter}
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
        </div>
      </ErrorBoundary>
    </TooltipProvider>
  );
}
