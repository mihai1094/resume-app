"use client";

import { useEffect, useCallback } from "react";
import { useResume } from "@/hooks/use-resume";
import {
  useLocalStorage,
  getSaveStatus as getLocalStorageSaveStatus,
} from "@/hooks/use-local-storage";
import { useResumeDataLoader } from "@/hooks/use-resume-data-loader";
import { useSavedResumes } from "@/hooks/use-saved-resumes";
import { useUser } from "@/hooks/use-user";
import { ResumeData } from "@/lib/types/resume";
import { TemplateId } from "@/lib/constants/templates";
import { toast } from "sonner";

interface UseResumeEditorContainerProps {
  resumeId: string | null;
  jobTitle?: string;
}

/**
 * Container hook for ResumeEditor
 * Handles data persistence, loading, and saving logic
 * Separates persistence concerns from UI concerns
 */
export function useResumeEditorContainer({
  resumeId,
  jobTitle,
}: UseResumeEditorContainerProps) {
  const { user, isLoading: isUserLoading } = useUser();

  // Resume state management
  const {
    resumeData,
    updatePersonalInfo,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
    reorderWorkExperience,
    addEducation,
    updateEducation,
    removeEducation,
    reorderEducation,
    addSkill,
    removeSkill,
    addLanguage,
    updateLanguage,
    removeLanguage,
    addCourse,
    updateCourse,
    removeCourse,
    addHobby,
    updateHobby,
    removeHobby,
    addExtraCurricular,
    updateExtraCurricular,
    removeExtraCurricular,
    reorderExtraCurricular,
    resetResume,
    loadResume,
    validation,
    isDirty,
    setWorkExperience,
    setEducation,
    setExtraCurricular,
  } = useResume();

  // Local storage (auto-save)
  const {
    value: savedData,
    setValue: saveData,
    clearValue: clearSavedData,
    isSaving,
    lastSaved,
  } = useLocalStorage<ResumeData | null>("resume-data", null, 500);

  // Data loading from Firestore or localStorage
  const {
    isInitializing,
    resumeLoadError,
    editingResumeId,
    setEditingResumeId,
    editingResumeName,
    setEditingResumeName,
    loadedTemplateId,
  } = useResumeDataLoader({
    resumeId,
    userId: user?.id ?? null,
    isUserLoading,
    savedData,
    lastSaved,
    loadResume,
  });

  // Saved resumes (Firestore)
  const { saveResume, updateResume } = useSavedResumes(user?.id || null);

  // Prefill summary when starting from onboarding
  useEffect(() => {
    if (resumeId) return;
    if (!jobTitle) return;
    if (isInitializing) return;
    if (resumeData.personalInfo.summary) return;

    updatePersonalInfo({ summary: `${jobTitle}` });
  }, [
    resumeId,
    jobTitle,
    isInitializing,
    resumeData.personalInfo.summary,
    updatePersonalInfo,
  ]);

  // Auto-save to localStorage
  useEffect(() => {
    saveData(resumeData);
  }, [resumeData, saveData]);

  // Save and exit handler
  const handleSaveAndExit = useCallback(async () => {
    if (!validation.valid) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    if (!user) {
      toast.error("Please log in to save your resume");
      return;
    }

    // Generate a name for the resume based on personal info
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
      // Check if we're editing an existing resume
      if (editingResumeId) {
        // Update existing resume
        const success = await updateResume(editingResumeId, {
          name: resumeName,
          templateId: "modern", // Will be updated by caller if needed
          data: resumeData,
        });

        if (success) {
          toast.success("Resume updated successfully!");
          return { success: true };
        } else {
          toast.error("Failed to update resume");
          return { success: false };
        }
      } else {
        // Create new resume and update editingResumeId so subsequent saves are updates
        const savedResume = await saveResume(
          resumeName,
          "modern", // Will be updated by caller if needed
          resumeData
        );

        if (savedResume && (savedResume as any).code === "PLAN_LIMIT") {
          const limit = (savedResume as any).limit ?? 3;
          toast.error(`Free plan limit reached (${limit}). Upgrade to add more.`);
          return { success: false, code: "PLAN_LIMIT", limit };
        }

        if (savedResume) {
          setEditingResumeId((savedResume as any).id);
          setEditingResumeName((savedResume as any).name);
          toast.success("Resume saved successfully!");
          return { success: true };
        } else {
          toast.error("Failed to save resume");
          return { success: false };
        }
      }
    } catch (error) {
      if ((error as any)?.code === "PLAN_LIMIT") {
        const limit = (error as any).limit ?? 3;
        toast.error(`Free plan limit reached (${limit}). Upgrade to add more.`);
        return { success: false, code: "PLAN_LIMIT", limit };
      }
      console.error("Error saving resume:", error);
      toast.error("Failed to save resume");
      return { success: false };
    }
  }, [
    validation.valid,
    user,
    resumeData,
    editingResumeName,
    jobTitle,
    editingResumeId,
    updateResume,
    saveResume,
    setEditingResumeId,
    setEditingResumeName,
  ]);

  const handleReset = useCallback(() => {
    resetResume();
    clearSavedData();
    setEditingResumeId(null);
    setEditingResumeName(null);
    toast.success("Resume reset successfully");
  }, [resetResume, clearSavedData, setEditingResumeId, setEditingResumeName]);

  const saveStatusText = getLocalStorageSaveStatus(isSaving, lastSaved);

  return {
    // Resume data
    resumeData,
    validation,
    isDirty,

    // Resume operations
    updatePersonalInfo,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
    reorderWorkExperience,
    addEducation,
    updateEducation,
    removeEducation,
    reorderEducation,
    addSkill,
    removeSkill,
    addLanguage,
    updateLanguage,
    removeLanguage,
    addCourse,
    updateCourse,
    removeCourse,
    addHobby,
    updateHobby,
    removeHobby,
    addExtraCurricular,
    updateExtraCurricular,
    removeExtraCurricular,
    reorderExtraCurricular,
    setWorkExperience,
    setEducation,
    setExtraCurricular,
    loadResume,
    resetResume,

    // State
    isInitializing,
    resumeLoadError,
    isSaving,
    lastSaved,
    saveStatusText,

    // Editing state
    editingResumeId,
    setEditingResumeId,
    editingResumeName,
    setEditingResumeName,
    loadedTemplateId,

    // Handlers
    handleSaveAndExit,
    handleReset,
  };
}
