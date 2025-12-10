import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ResumeData } from "@/lib/types/resume";
import { TemplateId } from "@/lib/constants/templates";
import { downloadBlob, downloadJSON } from "@/lib/utils/download";
import { SavedResume } from "@/hooks/use-saved-resumes";
import { PlanLimitError } from "@/lib/services/firestore";

interface UseResumeSaveProps {
    resumeData: ResumeData;
    selectedTemplateId: TemplateId;
    validation: { valid: boolean; errors: Array<{ field: string; message: string }> };
    editingResumeId: string | null;
    editingResumeName: string | null;
    jobTitle?: string;
    userId: string | null;
    saveResume: (name: string, templateId: string, data: ResumeData) => Promise<SavedResume | PlanLimitError | null>;
    updateResume: (id: string, updates: Partial<SavedResume>) => Promise<boolean>;
    setEditingResumeId: (id: string) => void;
    setEditingResumeName: (name: string) => void;
    mapFieldToSection: (field: string) => string;
    setActiveSection: (section: string) => void;
}

export function useResumeSave({
    resumeData,
    selectedTemplateId,
    validation,
    editingResumeId,
    editingResumeName,
    jobTitle,
    userId,
    saveResume,
    updateResume,
    setEditingResumeId,
    setEditingResumeName,
    mapFieldToSection,
    setActiveSection,
}: UseResumeSaveProps) {
    const router = useRouter();

    const handleSave = useCallback(async () => {
        if (!validation.valid) {
            const firstError = validation.errors[0];
            const targetSection = firstError ? mapFieldToSection(firstError.field) : "personal";
            setActiveSection(targetSection);
            toast.error(firstError?.message || "Please fix the highlighted fields.");
            return;
        }

        if (!userId) {
            toast.error("Please log in to save your resume");
            return;
        }

        // Generate a name for the resume
        let resumeName = "My Resume";
        if (resumeData.personalInfo.firstName && resumeData.personalInfo.lastName) {
            resumeName = `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}`;
        } else if (editingResumeName) {
            resumeName = editingResumeName;
        } else if (jobTitle) {
            resumeName = `Resume - ${jobTitle}`;
        } else {
            resumeName = `Resume - ${new Date().toLocaleDateString()}`;
        }

        try {
            if (editingResumeId) {
                // Update existing resume
                const success = await updateResume(editingResumeId, {
                    name: resumeName,
                    templateId: selectedTemplateId,
                    data: resumeData,
                });

                if (success) {
                    toast.success("Resume updated successfully!");
                    router.push("/dashboard");
                } else {
                    toast.error("Failed to update resume");
                }
            } else {
                // Create new resume
                const result = await saveResume(resumeName, selectedTemplateId, resumeData);

                if (result && "id" in result && "name" in result) {
                    // Result is a SavedResume
                    setEditingResumeId(result.id);
                    setEditingResumeName(result.name);
                    toast.success("Resume saved successfully!");
                    router.push("/dashboard");
                } else if (result && "code" in result && result.code === "PLAN_LIMIT") {
                    // Result is a PlanLimitError
                    toast.error(`Plan limit reached. You can only save ${result.limit} resumes.`);
                } else {
                    toast.error("Failed to save resume");
                }
            }
        } catch (error) {
            console.error("Error saving resume:", error);
            toast.error("Failed to save resume");
        }
    }, [
        validation,
        userId,
        resumeData,
        selectedTemplateId,
        editingResumeId,
        editingResumeName,
        jobTitle,
        saveResume,
        updateResume,
        setEditingResumeId,
        setEditingResumeName,
        mapFieldToSection,
        setActiveSection,
        router,
    ]);

    const handleExportJSON = useCallback(() => {
        downloadJSON(resumeData, `resume-${Date.now()}.json`);
        toast.success("Resume exported as JSON");
    }, [resumeData]);

    const handleExportPDF = useCallback(async () => {
        try {
            const { exportToPDF } = await import("@/lib/services/export");
            const result = await exportToPDF(resumeData, selectedTemplateId, {
                fileName: `resume-${Date.now()}.pdf`,
            });

            if (result.success && result.blob) {
                downloadBlob(result.blob, `resume-${Date.now()}.pdf`);
                toast.success("Resume exported as PDF");
            } else {
                toast.error(result.error || "Failed to export PDF");
            }
        } catch {
            toast.error("Failed to export PDF. Please try again.");
        }
    }, [resumeData, selectedTemplateId]);

    return {
        handleSave,
        handleExportJSON,
        handleExportPDF,
    };
}
