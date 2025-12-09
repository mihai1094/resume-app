import { useState, useEffect, useRef } from "react";
import { SavedResume } from "@/hooks/use-saved-resumes";
import { ATSAnalysisResult } from "@/lib/ai/content-types";
import { toast } from "sonner";

export interface AnalysisError {
    message: string;
    type: string;
    retryable?: boolean;
}

export function useOptimizeFlow(resumes: SavedResume[]) {
    const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);
    const [jobDescription, setJobDescription] = useState("");
    const [selectedResumeId, setSelectedResumeId] = useState<string>("");
    const [analysis, setAnalysis] = useState<ATSAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<AnalysisError | null>(null);
    const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef<number>(0);

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

    const handleOptimize = async (isRetry: boolean = false) => {
        if (!jobDescription.trim() || !selectedResumeId) return;

        const selectedResume = resumes.find((r) => r.id === selectedResumeId);
        if (!selectedResume) return;

        // Increment retry count if this is a retry
        if (isRetry) {
            retryCountRef.current += 1;
        } else {
            retryCountRef.current = 0;
        }

        setIsAnalyzing(true);
        setAnalysis(null);
        setAnalysisError(null);

        try {
            const response = await fetch("/api/ai/analyze-ats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeData: selectedResume.data,
                    jobDescription,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const error: AnalysisError = {
                    message: errorData.error || "Failed to analyze resume",
                    type: errorData.type || "UNKNOWN",
                    retryable: errorData.retryable !== false,
                };

                // Show toast notification based on error type
                if (error.type === "RATE_LIMIT_EXCEEDED") {
                    toast.error("Rate limit exceeded", {
                        description: "Please wait a minute before trying again.",
                    });
                } else if (error.type === "TIMEOUT") {
                    toast.error("Request timed out", {
                        description: "The AI service is experiencing high load. Please try again.",
                    });
                } else if (error.type === "VALIDATION_ERROR") {
                    toast.error("Invalid input", {
                        description: error.message,
                    });
                } else {
                    toast.error("Analysis failed", {
                        description: error.message,
                    });
                }

                throw error;
            }

            const data = await response.json();
            setAnalysis(data.analysis);
            setIsAnalyzing(false);
            setAnalysisError(null);
            retryCountRef.current = 0;

            // Show success toast
            toast.success("Analysis complete", {
                description: `Resume scored ${data.analysis.score}% match`,
            });

            // Log cache performance for monitoring
            if (data.meta?.fromCache) {
                console.log('[ATS] Analysis from cache:', data.meta.cacheStats);
            }
        } catch (error) {
            console.error('[ATS] Error analyzing resume:', error);

            const analysisErr: AnalysisError = error instanceof Error && 'type' in error
                ? (error as AnalysisError)
                : {
                    message: error instanceof Error ? error.message : "Failed to analyze resume",
                    type: "UNKNOWN",
                    retryable: true,
                };

            setAnalysisError(analysisErr);
            setIsAnalyzing(false);
            setAnalysis(null);
        }
    };

    const resetAnalysis = () => {
        setJobDescription("");
        setAnalysis(null);
        setSelectedResumeId("");
        setAnalysisError(null);
        retryCountRef.current = 0;
    };

    const handleRetry = () => {
        handleOptimize(true);
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
        handleRetry,
        resetAnalysis,
        retryCount: retryCountRef.current,
    };
}
