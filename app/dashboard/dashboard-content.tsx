"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useSavedResumes, type SavedResume } from "@/hooks/use-saved-resumes";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingPage } from "@/components/shared/loading";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
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

// Hooks
import { useResumeActions } from "./hooks/use-resume-actions";
import { useOptimizeFlow } from "./hooks/use-optimize-flow";
import { canOptimizeResume } from "./hooks/use-resume-utils";

// Components
import { MyResumesHeader } from "./components/my-resumes-header";
import { CoverLetterCard } from "./components/cover-letter-card";
import {
  useSavedCoverLetters,
  type SavedCoverLetter,
} from "@/hooks/use-saved-cover-letters";
import { ResumeCard } from "./components/resume-card";
import { DashboardHeader } from "./components/dashboard-header";
import { QuickActions } from "./components/quick-actions";
import { PreviewDialog } from "./components/preview-dialog";
import { DeleteConfirmationDialog } from "./components/delete-confirmation-dialog";
import { OptimizeDialog } from "./components/optimize-dialog/optimize-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, Plus } from "lucide-react";

export type ResumeItem = SavedResume;

export function DashboardContent() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
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
              <Tabs defaultValue="resumes" className="w-full space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                  <TabsTrigger value="resumes">Resumes</TabsTrigger>
                  <TabsTrigger value="cover-letters">Cover Letters</TabsTrigger>
                </TabsList>

                <TabsContent value="resumes" className="space-y-4">
                  {!hasResumes ? (
                    <EmptyState
                      icon={FileText}
                      title="No resumes yet"
                      description="Create your first professional resume in minutes. Choose from our ATS-friendly templates."
                      actionLabel="Create Resume"
                      onAction={handleCreateClick}
                    />
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
