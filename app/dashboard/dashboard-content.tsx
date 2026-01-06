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
import { DeleteConfirmationDialog } from "./components/delete-confirmation-dialog";
import { OptimizeDialog } from "./components/optimize-dialog/optimize-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, Plus } from "lucide-react";
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

export function DashboardContent({ initialTab }: DashboardContentProps) {
  const router = useRouter();
  const { user, isLoading: userLoading, logout } = useUser();
  const {
    resumes,
    isLoading: resumesLoading,
    deleteResume,
  } = useSavedResumes(user?.id || null);
  const {
    coverLetters,
    isLoading: lettersLoading,
    deleteCoverLetter,
  } = useSavedCoverLetters(user?.id || null);

  // Custom Hooks
  const {
    handleLoadResume,
    handleExportPDF,
    handleExportJSON,
    handleExportDOCX,
    handleOpenDeleteDialog,
    confirmDelete,
    deletingId,
    exportingPdfId,
    exportingDocxId,
    pendingDelete,
    setPendingDelete,
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
      console.error("Failed to delete cover letter:", error);
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
      console.error("Failed to export cover letter PDF:", error);
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

  const { saveResume } = useSavedResumes(user?.id || null);

  const [previewResumeId, setPreviewResumeId] = useState<string | null>(null);
  const [showPlanLimitModal, setShowPlanLimitModal] = useState(false);

  // Derived State
  const eligibleResumes = resumes.filter((resume) =>
    canOptimizeResume(resume.data)
  );
  const hasEligibleResume = eligibleResumes.length > 0;
  const hasResumes = resumes.length > 0;
  const hasCoverLetters = coverLetters.length > 0;
  const aiEnabled = true; // temporarily keep AI tools visible for all plans

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
      console.error("Failed to create tailored resume:", error);
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
      console.error("Failed to save tailored resume:", error);
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
  const isResumeLimitReached = resumes.length >= resumeLimit;
  const isCoverLetterLimitReached = coverLetters.length >= coverLetterLimit;

  const handleCreateClick = () => {
    if (isResumeLimitReached) {
      setShowPlanLimitModal(true);
      return;
    }
    if (hasResumes) {
      router.push("/editor/new");
    } else {
      router.push("/onboarding");
    }
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
            hasEligibleResume={hasEligibleResume}
            hasAiAccess={aiEnabled}
            onCreateResume={handleCreateClick}
            onOptimizeClick={() => handleOptimizeEntry()}
            onLogout={handleLogout}
          />

          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <DashboardHeader
              user={user}
              resumeCount={resumes.length}
              coverLetterCount={coverLetters.length}
              resumeLimit={resumeLimit}
              coverLetterLimit={coverLetterLimit}
            />

            {/* Soft Limit Warning */}
            {resumeLimit - resumes.length === 1 && plan === "free" && (
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
                defaultValue={
                  initialTab === "cover-letters" ? "cover-letters" : "resumes"
                }
                className="w-full space-y-6"
              >
                <TabsList className="grid w-full grid-cols-2 sm:max-w-[400px]">
                  <TabsTrigger value="resumes">
                    Resumes
                    <span className="md:hidden ml-1 text-muted-foreground">
                      ({resumes.length})
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="cover-letters">
                    Letters
                    <span className="md:hidden ml-1 text-muted-foreground">
                      ({coverLetters.length})
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="resumes" className="space-y-4">
                  {!hasResumes ? (
                    <OnboardingChecklist onCreateResume={handleCreateClick} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                onPreview={() => setPreviewResumeId(resume.id)}
                                onExportPDF={() => handleExportPDF(resume)}
                                onExportJSON={() => handleExportJSON(resume)}
                                onExportDOCX={() => handleExportDOCX(resume)}
                                onDelete={() => handleOpenDeleteDialog(resume)}
                                onOptimize={() => handleOptimizeEntry(resume.id)}
                                isExportingPdf={exportingPdfId === resume.id}
                                isExportingDocx={exportingDocxId === resume.id}
                                canOptimize={canOptimizeResume(resume.data)}
                                isOptimizeLocked={!aiEnabled}
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
                          onPreview={() => setPreviewResumeId(resume.id)}
                          onExportPDF={() => handleExportPDF(resume)}
                          onExportJSON={() => handleExportJSON(resume)}
                          onExportDOCX={() => handleExportDOCX(resume)}
                          onDelete={() => handleOpenDeleteDialog(resume)}
                          onOptimize={() => handleOptimizeEntry(resume.id)}
                          isExportingPdf={exportingPdfId === resume.id}
                          isExportingDocx={exportingDocxId === resume.id}
                          canOptimize={canOptimizeResume(resume.data)}
                          isOptimizeLocked={!aiEnabled}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="cover-letters" className="space-y-4">
                  {!hasCoverLetters ? (
                    <EmptyState
                      icon={FileText}
                      title="No cover letters yet"
                      description="Create a personalized cover letter that complements your resume and increases your chances."
                      actionLabel="Create Cover Letter"
                      onAction={() => router.push("/cover-letter")}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {coverLetters.map((letter) => (
                        <CoverLetterCard
                          key={letter.id}
                          letter={letter}
                          onDelete={handleDeleteLetter}
                          onExportPDF={() => handleExportLetterPDF(letter)}
                          isExportingPdf={exportingLetterPdfId === letter.id}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <PreviewDialog
            resume={previewResume || null}
            onClose={() => setPreviewResumeId(null)}
          />

          <DeleteConfirmationDialog
            resume={pendingDelete}
            onConfirm={confirmDelete}
            onCancel={() => setPendingDelete(null)}
            isDeleting={deletingId === pendingDelete?.id}
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
            onAnalyzeAnother={resetAnalysis}
          />
        </div>
      </ErrorBoundary>
    </TooltipProvider>
  );
}
