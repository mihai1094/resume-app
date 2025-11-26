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
import { JobAnalysis } from "@/lib/ai/mock-analyzer";
import { ResumeData } from "@/lib/types/resume";

interface ResumeItem {
    id: string;
    name: string;
    templateId: string;
    data: ResumeData;
}

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
    analysis: JobAnalysis | null;
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
    onEditResume,
    onAnalyzeAnother,
}: OptimizeDialogProps) {
    const selectedResume = resumes.find((r) => r.id === selectedResumeId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Sparkles className="w-6 h-6 text-primary" />
                        Optimize Resume for Job
                    </DialogTitle>
                    <DialogDescription>
                        Paste a job description and select which resume to optimize
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
                        Mock AI - Real AI coming in V1.5
                    </Badge>
                    <p>
                        Currently using mock AI for demo purposes. Real AI optimization with
                        OpenAI GPT-4 will be available in the next release.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
