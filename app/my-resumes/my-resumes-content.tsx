"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useSavedResumes } from "@/hooks/use-saved-resumes";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingPage } from "@/components/shared/loading";
import { TooltipProvider } from "@/components/ui/tooltip";

// Hooks
import { useResumeActions } from "./hooks/use-resume-actions";
import { useOptimizeFlow } from "./hooks/use-optimize-flow";
import { canOptimizeResume } from "./hooks/use-resume-utils";

// Components
import { MyResumesHeader } from "./components/my-resumes-header";
import { EmptyState } from "./components/empty-state";
import { CreateResumeCard } from "./components/create-resume-card";
import { ResumeCard } from "./components/resume-card";
import { PreviewDialog } from "./components/preview-dialog";
import { DeleteConfirmationDialog } from "./components/delete-confirmation-dialog";
import { OptimizeDialog } from "./components/optimize-dialog/optimize-dialog";

export function MyResumesContent() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const { resumes, isLoading: resumesLoading } = useSavedResumes(user?.id || null);

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

  const previewResume = previewResumeId
    ? resumes.find((r) => r.id === previewResumeId)
    : null;

  const handleCreateClick = () => {
    if (hasResumes) {
      router.push("/create");
    } else {
      router.push("/onboarding");
    }
  };

  if (userLoading || resumesLoading) {
    return <LoadingPage text="Loading your resumes..." />;
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

          <div className="container mx-auto px-4 py-8">
            {!hasResumes ? (
              <EmptyState
                onCreateResume={() => router.push("/create")}
                onImportJSON={() => router.push("/create?import=1")}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                <CreateResumeCard
                  hasResumes={hasResumes}
                  onClick={handleCreateClick}
                />

                {resumes.map((resume) => (
                  <ResumeCard
                    key={resume.id}
                    resume={resume}
                    onEdit={() => handleLoadResume(resume)}
                    onPreview={() => setPreviewResumeId(resume.id)}
                    onExportPDF={() => handleExportPDF(resume)}
                    onExportJSON={() => handleExportJSON(resume)}
                    onDelete={() => handleOpenDeleteDialog(resume)}
                    isExportingPdf={exportingPdfId === resume.id}
                    canOptimize={canOptimizeResume(resume.data)}
                  />
                ))}
              </div>
            )}
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
