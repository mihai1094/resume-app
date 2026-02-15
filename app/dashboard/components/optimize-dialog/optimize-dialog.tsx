"use client";

import { useState, useCallback, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, X, ArrowLeft } from "lucide-react";
import { OptimizeForm } from "./optimize-form";
import { OptimizeAnalysisResults } from "./optimize-analysis-results";
import { ImprovementWizard } from "./improvement-wizard";
import { ATSAnalysisResult } from "@/lib/ai/content-types";
import { ResumeData } from "@/lib/types/resume";
import type { SavedResume as ResumeItem } from "@/hooks/use-saved-resumes";
import type { AnalysisError } from "@/app/dashboard/hooks/use-optimize-flow";

interface OptimizeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resumes: ResumeItem[];
    selectedResumeId: string;
    setSelectedResumeId: (id: string) => void;
    jobDescription: string;
    setJobDescription: (desc: string) => void;
    jobTitle: string;
    setJobTitle: (title: string) => void;
    companyName: string;
    setCompanyName: (name: string) => void;
    onAnalyze: () => void;
    isAnalyzing: boolean;
    analysis: ATSAnalysisResult | null;
    analysisError?: AnalysisError | null;
    onRetry?: () => void;
    onCreateTailoredCopy: (resume: ResumeItem, jobTitle: string, companyName: string) => void;
    onSaveTailoredResume: (resume: ResumeItem, tailoredData: ResumeData, jobTitle: string, companyName: string) => void;
}

type DialogView = "form" | "results" | "wizard";

export function OptimizeDialog({
    open,
    onOpenChange,
    resumes,
    selectedResumeId,
    setSelectedResumeId,
    jobDescription,
    setJobDescription,
    jobTitle,
    setJobTitle,
    companyName,
    setCompanyName,
    onAnalyze,
    isAnalyzing,
    analysis,
    analysisError,
    onRetry,
    onCreateTailoredCopy,
    onSaveTailoredResume,
}: OptimizeDialogProps) {
    const [view, setView] = useState<DialogView>("form");

    const selectedResume = resumes.find((r) => r.id === selectedResumeId);
    const hasResults = Boolean(analysis && selectedResume);
    const showWizard = view === "wizard" && hasResults;
    const showResults = view === "results" && hasResults;
    const mobileStageLabel = showResults ? "Step 2 of 2" : "Step 1 of 2";

    useEffect(() => {
        if (open) {
            setView("form");
        }
    }, [open]);

    useEffect(() => {
        if (analysis && selectedResume) {
            setView("results");
        }
    }, [analysis, selectedResume]);

    const handleDialogOpenChange = useCallback(
        (nextOpen: boolean) => {
            if (!nextOpen && (isAnalyzing || showWizard)) {
                return;
            }
            onOpenChange(nextOpen);
        },
        [isAnalyzing, onOpenChange, showWizard]
    );

    const handleStartWizard = useCallback(() => {
        setView("wizard");
    }, []);

    const handleWizardComplete = useCallback((tailoredData: ResumeData) => {
        if (selectedResume) {
            onSaveTailoredResume(selectedResume, tailoredData, jobTitle, companyName);
            setView("form");
            onOpenChange(false);
        }
    }, [selectedResume, jobTitle, companyName, onSaveTailoredResume, onOpenChange]);

    const handleWizardClose = useCallback(() => {
        setView("results");
    }, []);

    const handleBackToEdit = useCallback(() => {
        setView("form");
    }, []);

    return (
        <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogContent
                className="max-w-6xl w-full h-[100dvh] max-h-[100dvh] md:h-auto md:max-h-[95vh] overflow-y-auto overscroll-y-contain p-0 md:p-6 gap-0 rounded-none md:rounded-lg [&>button:last-child]:hidden"
                onInteractOutside={(event) => {
                    if (isAnalyzing || showWizard) {
                        event.preventDefault();
                    }
                }}
                onEscapeKeyDown={(event) => {
                    if (isAnalyzing || showWizard) {
                        event.preventDefault();
                    }
                }}
            >
                {showWizard && (
                    <VisuallyHidden>
                        <DialogTitle>Improvement Wizard</DialogTitle>
                    </VisuallyHidden>
                )}

                {!showWizard && (
                    <div className="sticky top-0 z-10 bg-background border-b md:hidden">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                {showResults && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleBackToEdit}
                                        className="shrink-0"
                                        aria-label="Back to edit"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                )}
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex flex-col leading-tight">
                                        <span className="font-semibold">
                                            {showResults ? "Analysis Results" : "Optimize Resume"}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">
                                            {mobileStageLabel}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDialogOpenChange(false)}
                                disabled={isAnalyzing}
                                aria-label="Close dialog"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                )}

                {!showWizard && (
                    <DialogHeader className="hidden md:flex md:flex-row md:items-start md:justify-between px-0">
                        <div>
                            <DialogTitle className="flex items-center gap-3 text-3xl">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                Optimize Resume for Job
                            </DialogTitle>
                            <DialogDescription className="text-base mt-1.5">
                                Get AI-powered insights on how well your resume matches a job posting
                            </DialogDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDialogOpenChange(false)}
                            disabled={isAnalyzing}
                            className="shrink-0 rounded-full"
                            aria-label="Close dialog"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </DialogHeader>
                )}

                <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-0 md:pb-0">
                    {showWizard && (
                        <ImprovementWizard
                            resume={selectedResume!.data}
                            templateId={selectedResume!.templateId as import("@/lib/constants/templates").TemplateId}
                            analysis={analysis!}
                            jobDescription={jobDescription}
                            jobTitle={jobTitle}
                            companyName={companyName}
                            onComplete={handleWizardComplete}
                            onCancel={handleWizardClose}
                        />
                    )}

                    {view === "form" && (
                        <OptimizeForm
                            resumes={resumes}
                            selectedResumeId={selectedResumeId}
                            setSelectedResumeId={setSelectedResumeId}
                            jobDescription={jobDescription}
                            setJobDescription={setJobDescription}
                            jobTitle={jobTitle}
                            setJobTitle={setJobTitle}
                            companyName={companyName}
                            setCompanyName={setCompanyName}
                            onAnalyze={onAnalyze}
                            isAnalyzing={isAnalyzing}
                            analysisError={analysisError}
                            onRetry={onRetry}
                        />
                    )}

                    {showResults && (
                        <OptimizeAnalysisResults
                            analysis={analysis!}
                            jobTitle={jobTitle}
                            companyName={companyName}
                            onCreateTailoredCopy={() => onCreateTailoredCopy(selectedResume!, jobTitle, companyName)}
                            onAnalyzeAnother={handleBackToEdit}
                            onStartWizard={handleStartWizard}
                        />
                    )}
                </div>

                {!showWizard && (
                    <div className="text-center text-xs text-muted-foreground pt-4 pb-6 md:pb-0 border-t mt-6 px-4 md:px-0">
                        <Badge variant="outline" className="mb-2">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI-Powered Analysis
                        </Badge>
                        <p>
                            Powered by Google Gemini AI for intelligent resume optimization
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
