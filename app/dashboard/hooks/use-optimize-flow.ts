import { useState, useEffect } from "react";
import { JobAnalysis, analyzeJobMatch } from "@/lib/ai/mock-analyzer";
import { ResumeData } from "@/lib/types/resume";

interface ResumeItem {
    id: string;
    name: string;
    templateId: string;
    data: ResumeData;
}

export function useOptimizeFlow(resumes: ResumeItem[]) {
    const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);
    const [jobDescription, setJobDescription] = useState("");
    const [selectedResumeId, setSelectedResumeId] = useState<string>("");
    const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

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

    const handleOptimize = () => {
        if (!jobDescription.trim() || !selectedResumeId) return;

        const selectedResume = resumes.find((r) => r.id === selectedResumeId);
        if (!selectedResume) return;

        setIsAnalyzing(true);
        setAnalysis(null);

        // Simulate AI processing delay
        setTimeout(() => {
            const result = analyzeJobMatch(jobDescription, selectedResume.data);
            setAnalysis(result);
            setIsAnalyzing(false);
        }, 1500);
    };

    const resetAnalysis = () => {
        setJobDescription("");
        setAnalysis(null);
        setSelectedResumeId("");
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
        handleOptimize,
        resetAnalysis,
    };
}
