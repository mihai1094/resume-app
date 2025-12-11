"use client";

import { useState, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    onAnalyzeAnother: () => void;
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
    onAnalyzeAnother,
}: OptimizeDialogProps) {
    const [view, setView] = useState<DialogView>("form");

    const selectedResume = resumes.find((r) => r.id === selectedResumeId);
    const hasResults = analysis && selectedResume;
    const showWizard = view === "wizard" && hasResults;

    // Handle starting the wizard
    const handleStartWizard = useCallback(() => {
        setView("wizard");
    }, []);

    // Handle wizard completion
    const handleWizardComplete = useCallback((tailoredData: ResumeData) => {
        if (selectedResume) {
            onSaveTailoredResume(selectedResume, tailoredData, jobTitle, companyName);
            setView("form");
            onOpenChange(false);
        }
    }, [selectedResume, jobTitle, companyName, onSaveTailoredResume, onOpenChange]);

    // Handle wizard close
    const handleWizardClose = useCallback(() => {
        setView("results");
    }, []);

    // Handle analyze another
    const handleAnalyzeAnother = useCallback(() => {
        setView("form");
        onAnalyzeAnother();
    }, [onAnalyzeAnother]);

    // Update view when analysis results come in
    const currentView: DialogView = !hasResults ? "form" : view === "wizard" ? "wizard" : "results";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-full h-[100dvh] max-h-[100dvh] md:h-auto md:max-h-[95vh] overflow-y-auto p-0 md:p-6 gap-0 rounded-none md:rounded-lg">
                {/* Mobile Header - Fixed (hidden when wizard is shown) */}
                {!showWizard && (
                    <div className="sticky top-0 z-10 bg-background border-b md:hidden">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                {currentView === "results" && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleAnalyzeAnother}
                                        className="shrink-0"
                                        aria-label="Back to form"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                )}
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="font-semibold">
                                        {currentView === "results" ? "Analysis Results" : "Optimize Resume"}
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onOpenChange(false)}
                                aria-label="Close dialog"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Desktop Header (hidden when wizard is shown) */}
                {!showWizard && (
                    <DialogHeader className="hidden md:block px-0">
                        <DialogTitle className="flex items-center gap-3 text-3xl">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            Optimize Resume for Job
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Get AI-powered insights on how well your resume matches a job posting
                        </DialogDescription>
                    </DialogHeader>
                )}

                {/* Content */}
                <div className="px-4 pb-4 md:px-0 md:pb-0">
                    {/* Show wizard when in wizard view */}
                    {showWizard && (
                        <ImprovementWizard
                            resume={selectedResume.data}
                            analysis={analysis}
                            jobDescription={jobDescription}
                            jobTitle={jobTitle}
                            companyName={companyName}
                            onComplete={handleWizardComplete}
                            onCancel={handleWizardClose}
                        />
                    )}

                    {/* Show form when no results */}
                    {currentView === "form" && (
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

                    {/* Show results when analysis complete */}
                    {currentView === "results" && hasResults && (
                        <OptimizeAnalysisResults
                            analysis={analysis}
                            resume={selectedResume}
                            jobTitle={jobTitle}
                            companyName={companyName}
                            jobDescription={jobDescription}
                            onCreateTailoredCopy={() => onCreateTailoredCopy(selectedResume, jobTitle, companyName)}
                            onAnalyzeAnother={handleAnalyzeAnother}
                            onStartWizard={handleStartWizard}
                        />
                    )}
                </div>

                {/* Info Footer (hidden when wizard is shown) */}
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
