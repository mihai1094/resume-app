"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useSavedResumes, type SavedResume } from "@/hooks/use-saved-resumes";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingPage } from "@/components/shared/loading";
import { TooltipProvider } from "@/components/ui/tooltip";

// Hooks
import { useResumeActions } from "./hooks/use-resume-actions";
import { useOptimizeFlow } from "./hooks/use-optimize-flow";
import { canOptimizeResume } from "./hooks/use-resume-utils";

// Components
import { MyResumesHeader } from "./components/my-resumes-header";
import { CoverLetterCard } from "./components/cover-letter-card";
import { useSavedCoverLetters } from "@/hooks/use-saved-cover-letters";
import { ResumeCard } from "./components/resume-card";
import { DashboardHeader } from "./components/dashboard-header";
import { QuickActions } from "./components/quick-actions";
import { PreviewDialog } from "./components/preview-dialog";
import { DeleteConfirmationDialog } from "./components/delete-confirmation-dialog";
import { OptimizeDialog } from "./components/optimize-dialog/optimize-dialog";


export type ResumeItem = SavedResume;

export function DashboardContent() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const { resumes, isLoading: resumesLoading } = useSavedResumes(user?.id || null);
  const { coverLetters, isLoading: lettersLoading, deleteCoverLetter } = useSavedCoverLetters(user?.id || null);

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
    deleteConfirmation,
    setDeleteConfirmation,
  } = useResumeActions(user?.id || null);

  const [deletingLetterId, setDeletingLetterId] = useState<string | null>(null);

  const handleDeleteLetter = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cover letter?")) return;

    setDeletingLetterId(id);
    try {
      await deleteCoverLetter(id);
    } catch (error) {
      console.error("Failed to delete cover letter:", error);
      alert("Failed to delete cover letter");
    } finally {
      setDeletingLetterId(null);
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
    handleOptimize,
    resetAnalysis,
  } = useOptimizeFlow(resumes);

  const [previewResumeId, setPreviewResumeId] = useState<string | null>(null);

  // Derived State
  const eligibleResumes = resumes.filter((resume) =>
    canOptimizeResume(resume.data)
  );
  const hasEligibleResume = eligibleResumes.length > 0;
  const hasResumes = resumes.length > 0;
  const hasCoverLetters = coverLetters.length > 0;

  const previewResume = previewResumeId
    ? resumes.find((r) => r.id === previewResumeId)
    : null;

  const handleCreateClick = () => {
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
            onOptimizeClick={() => setOptimizeDialogOpen(true)}
          />

          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <DashboardHeader
              user={user}
              resumeCount={resumes.length}
              coverLetterCount={coverLetters.length}
            />

            <QuickActions
              onCreateResume={handleCreateClick}
              onImportResume={() => router.push("/editor/new?import=1")}
            />

            <div className="space-y-8">
              {/* Resumes Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold tracking-tight">
                    Resumes
                  </h2>
                </div>

                {!hasResumes ? (
                  <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                    No resumes yet. Create one to get started!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create Card is now in Quick Actions, but we can keep a mini one or remove it. 
                        Let's keep the list clean with just resumes for now as we have the big buttons. 
                    */}

                    {resumes.map((resume) => (
                      <ResumeCard
                        key={resume.id}
                        resume={resume}
                        onEdit={() => handleLoadResume(resume)}
                        onPreview={() => setPreviewResumeId(resume.id)}
                        onExportPDF={() => handleExportPDF(resume)}
                        onExportJSON={() => handleExportJSON(resume)}
                        onDelete={() => handleOpenDeleteDialog(resume)}
                        onOptimize={() => {
                          setSelectedResumeId(resume.id);
                          setOptimizeDialogOpen(true);
                        }}
                        isExportingPdf={exportingPdfId === resume.id}
                        canOptimize={canOptimizeResume(resume.data)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Cover Letters Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold tracking-tight">
                    Cover Letters
                  </h2>
                </div>

                {!hasCoverLetters ? (
                  <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                    No cover letters yet. Create one to pair with your resume!
                  </div>
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
              </div>
            </div>
          </div>

          <PreviewDialog
            resume={previewResume || null}
            onClose={() => setPreviewResumeId(null)}
          />

          <DeleteConfirmationDialog
            resume={pendingDelete}
            onConfirm={confirmDelete}
            onCancel={() => {
              setPendingDelete(null);
              setDeleteConfirmation("");
            }}
            isDeleting={deletingId === pendingDelete?.id}
            confirmationText={deleteConfirmation}
            setConfirmationText={setDeleteConfirmation}
          />

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
