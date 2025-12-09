import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { OptimizeForm } from "./optimize-form";
import { OptimizeAnalysisResults } from "./optimize-analysis-results";
import { ATSAnalysisResult } from "@/lib/ai/content-types";
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
    onAnalyze: () => void;
    isAnalyzing: boolean;
    analysis: ATSAnalysisResult | null;
    analysisError?: AnalysisError | null;
    onRetry?: () => void;
    onEditResume: (resume: any) => void;
    onAnalyzeAnother: () => void;
}

export function OptimizeDialog({
    open,
    onOpenChange,
    resumes,
    selectedResumeId,
    setSelectedResumeId,
    jobDescription,
    setJobDescription,
    onAnalyze,
    isAnalyzing,
    analysis,
    analysisError,
    onRetry,
    onEditResume,
    onAnalyzeAnother,
}: OptimizeDialogProps) {
    const selectedResume = resumes.find((r) => r.id === selectedResumeId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
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

                <OptimizeForm
                    resumes={resumes}
                    selectedResumeId={selectedResumeId}
                    setSelectedResumeId={setSelectedResumeId}
                    jobDescription={jobDescription}
                    setJobDescription={setJobDescription}
                    onAnalyze={onAnalyze}
                    isAnalyzing={isAnalyzing}
                    analysisError={analysisError}
                    onRetry={onRetry}
                />

                {analysis && selectedResume && (
                    <OptimizeAnalysisResults
                        analysis={analysis}
                        resume={selectedResume}
                        onEditResume={onEditResume}
                        onAnalyzeAnother={onAnalyzeAnother}
                    />
                )}

                {/* Info Footer */}
                <div className="text-center text-xs text-muted-foreground pt-4 border-t mt-6">
                    <Badge variant="outline" className="mb-2">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI-Powered
                    </Badge>
                    <p>
                        Powered by Google Gemini AI for intelligent resume optimization
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
