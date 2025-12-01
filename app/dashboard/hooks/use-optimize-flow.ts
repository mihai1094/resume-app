import { useState, useEffect, useRef } from "react";
import { JobAnalysis, analyzeJobMatch } from "@/lib/ai/mock-analyzer";
import { SavedResume } from "@/hooks/use-saved-resumes";

export function useOptimizeFlow(resumes: SavedResume[]) {
    const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);
    const [jobDescription, setJobDescription] = useState("");
    const [selectedResumeId, setSelectedResumeId] = useState<string>("");
    const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-select first eligible resume when dialog opens or resumes change
    useEffect(() => {
        if (resumes.length === 0) {
            setSelectedResumeId("");
            return;
        }

        if (
            selectedResumeId &&
            resumes.some((resume) => resume.id === selectedResumeId)
        ) {
            return;
        }

        setSelectedResumeId(resumes[0].id);
    }, [resumes, selectedResumeId]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (analysisTimeoutRef.current) {
                clearTimeout(analysisTimeoutRef.current);
            }
        };
    }, []);

    const handleOptimize = () => {
        if (!jobDescription.trim() || !selectedResumeId) return;

        const selectedResume = resumes.find((r) => r.id === selectedResumeId);
        if (!selectedResume) return;

        setIsAnalyzing(true);
        setAnalysis(null);
        setAnalysisError(null);

        // Simulate AI processing delay with proper cleanup
        analysisTimeoutRef.current = setTimeout(() => {
            try {
                const result = analyzeJobMatch(jobDescription, selectedResume.data);
                setAnalysis(result);
                setIsAnalyzing(false);
                setAnalysisError(null);
            } catch (error) {
                setAnalysisError(
                    error instanceof Error ? error.message : "Failed to analyze resume"
                );
                setIsAnalyzing(false);
                setAnalysis(null);
            }
        }, 1500);
    };

    const resetAnalysis = () => {
        setJobDescription("");
        setAnalysis(null);
        setSelectedResumeId("");
        setAnalysisError(null);
    };

    return {
        optimizeDialogOpen,
        setOptimizeDialogOpen,
        jobDescription,
        setJobDescription,
        selectedResumeId,
        setSelectedResumeId,
        analysis,
        setAnalysis,
        isAnalyzing,
        analysisError,
        handleOptimize,
        resetAnalysis,
    };
}
