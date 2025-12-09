"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useSavedResumes, type SavedResume } from "@/hooks/use-saved-resumes";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingPage } from "@/components/shared/loading";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { PlanLimitDialog } from "@/components/shared/plan-limit-dialog";

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
import { DashboardHeader } from "./components/dashboard-header";
import { QuickActions } from "./components/quick-actions";
import { PreviewDialog } from "./components/preview-dialog";
import { DeleteConfirmationDialog } from "./components/delete-confirmation-dialog";
import { OptimizeDialog } from "./components/optimize-dialog/optimize-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, Plus } from "lucide-react";
import { hasAiAccess } from "@/lib/utils/user";
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
    handleOpenDeleteDialog,
    confirmDelete,
    deletingId,
    exportingPdfId,
    pendingDelete,
    setPendingDelete,
  } = useResumeActions(deleteResume);

  const [deletingLetterId, setDeletingLetterId] = useState<string | null>(null);
  const [pendingLetterDelete, setPendingLetterDelete] =
    useState<SavedCoverLetter | null>(null);

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

  const {
    optimizeDialogOpen,
    setOptimizeDialogOpen,
    jobDescription,
    setJobDescription,
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

  // Derived State
  const eligibleResumes = resumes.filter((resume) =>
    canOptimizeResume(resume.data)
  );
  const hasEligibleResume = eligibleResumes.length > 0;
  const hasResumes = resumes.length > 0;
  const hasCoverLetters = coverLetters.length > 0;
  const aiEnabled = hasAiAccess(user);

  const redirectToOffers = () => {
    router.push("/pricing?from=optimize#ultra");
    toast.message("Upgrade to unlock AI Optimize");
  };

  const handleOptimizeEntry = (resumeId?: string) => {
    if (userLoading) return;

    if (!aiEnabled) {
      redirectToOffers();
      return;
    }

    const targetResumeId =
      resumeId || eligibleResumes[0]?.id || resumes[0]?.id || "";

    if (!targetResumeId) {
      toast.error("Add a resume to optimize.");
      return;
    }

    setSelectedResumeId(targetResumeId);
    setOptimizeDialogOpen(true);
  };

  const previewResume = previewResumeId
    ? resumes.find((r) => r.id === previewResumeId)
    : null;

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/");
  }, [logout, router]);

  const plan = user?.plan ?? "free";
  const resumeLimit = plan === "free" ? 3 : plan === "ai" ? 50 : 999;
  const coverLetterLimit = plan === "free" ? 3 : plan === "ai" ? 50 : 999;
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

            <QuickActions
              onCreateResume={handleCreateClick}
              onImportResume={() => {
                if (isResumeLimitReached) {
                  toast.error("Free plan limit reached (3 resumes). Upgrade to add more.");
                  return;
                }
                router.push("/editor/new?import=1");
              }}
            />

            <div className="space-y-8">
              <Tabs
                defaultValue={
                  initialTab === "cover-letters" ? "cover-letters" : "resumes"
                }
                className="w-full space-y-6"
              >
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                  <TabsTrigger value="resumes">Resumes</TabsTrigger>
                  <TabsTrigger value="cover-letters">Cover Letters</TabsTrigger>
                </TabsList>

                <TabsContent value="resumes" className="space-y-4">
                  {!hasResumes ? (
                    <OnboardingChecklist onCreateResume={handleCreateClick} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {resumes.map((resume) => (
                        <ResumeCard
                          key={resume.id}
                          resume={resume}
                          onEdit={() => handleLoadResume(resume)}
                          onPreview={() => setPreviewResumeId(resume.id)}
                          onExportPDF={() => handleExportPDF(resume)}
                          onExportJSON={() => handleExportJSON(resume)}
                          onDelete={() => handleOpenDeleteDialog(resume)}
                          onOptimize={() => handleOptimizeEntry(resume.id)}
                          isExportingPdf={exportingPdfId === resume.id}
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
                          isExportingPdf={false}
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
            onAnalyze={handleOptimize}
            isAnalyzing={isAnalyzing}
            analysis={analysis}
            analysisError={analysisError}
            onRetry={handleRetry}
            onEditResume={(resume) => {
              handleLoadResume(resume);
              setOptimizeDialogOpen(false);
            }}
            onAnalyzeAnother={resetAnalysis}
          />
        </div>
      </ErrorBoundary>
    </TooltipProvider>
  );
}
