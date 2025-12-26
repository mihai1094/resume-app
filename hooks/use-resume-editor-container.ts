"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useResume } from "@/hooks/use-resume";
import { useResumeDataLoader } from "@/hooks/use-resume-data-loader";
import { useSavedResumes, SavedResume } from "@/hooks/use-saved-resumes";
import { useSessionDraft, SessionDraftResult } from "@/hooks/use-session-draft";
import { useUser } from "@/hooks/use-user";
import { ResumeData } from "@/lib/types/resume";
import { firestoreService, PlanLimitError } from "@/lib/services/firestore";
import { toast } from "sonner";

interface UseResumeEditorContainerProps {
  resumeId: string | null;
  jobTitle?: string;
  isImporting?: boolean;
}

/**
 * Container hook for ResumeEditor
 * Handles data persistence, loading, and saving logic
 * Separates persistence concerns from UI concerns
 */
export function useResumeEditorContainer({
  resumeId,
  jobTitle,
  isImporting = false,
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
    updateSkill,
    removeSkill,
    addProject,
    updateProject,
    removeProject,
    reorderProjects,
    addCertification,
    addCourseAsCertification,
    updateCertification,
    removeCertification,
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
    addCustomSection,
    updateCustomSection,
    removeCustomSection,
    addCustomSectionItem,
    updateCustomSectionItem,
    removeCustomSectionItem,
    batchUpdate,
  } = useResume();

  // Data loading from Firestore
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
    loadResume,
  });

  // Saved resumes (Firestore)
  const { saveResume, updateResume } = useSavedResumes(user?.id || null);

  // Session draft for recovery on refresh
  const { saveDraft, loadDraft, clearDirtyFlag, clearDraft } = useSessionDraft(
    editingResumeId || resumeId
  );

  // Recovery state
  const [recoveryDraft, setRecoveryDraft] = useState<SessionDraftResult | null>(null);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const hasCheckedForRecoveryRef = useRef(false);

  // Check for recoverable draft on mount
  useEffect(() => {
    if (hasCheckedForRecoveryRef.current) return;
    if (isInitializing) return;

    hasCheckedForRecoveryRef.current = true;
    const draft = loadDraft();
    if (draft) {
      setRecoveryDraft(draft);
      setShowRecoveryPrompt(true);
    }
  }, [isInitializing, loadDraft]);

  // Save to sessionStorage on every state change (immediate backup)
  useEffect(() => {
    if (isInitializing) return;
    // Don't save while showing recovery prompt
    if (showRecoveryPrompt) return;

    saveDraft(resumeData);
  }, [resumeData, saveDraft, isInitializing, showRecoveryPrompt]);

  // Handle recovery actions
  const handleRecoverDraft = useCallback(() => {
    if (recoveryDraft) {
      loadResume(recoveryDraft.data);
      toast.success("Changes recovered successfully!");
    }
    setShowRecoveryPrompt(false);
    setRecoveryDraft(null);
    clearDraft();
  }, [recoveryDraft, loadResume, clearDraft]);

  const handleDiscardDraft = useCallback(() => {
    setShowRecoveryPrompt(false);
    setRecoveryDraft(null);
    clearDraft();
  }, [clearDraft]);

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

  // Load imported resume data from sessionStorage
  useEffect(() => {
    if (!isImporting) return;
    if (isInitializing) return;
    // Check if we already have imported data loaded (firstName will be set)
    if (resumeData.personalInfo.firstName) return;

    try {
      if (typeof window !== "undefined") {
        const importedData = sessionStorage.getItem("importedResumeData");
        if (importedData) {
          const parsedData = JSON.parse(importedData) as ResumeData;
          loadResume(parsedData);
          // Clear the sessionStorage after loading
          sessionStorage.removeItem("importedResumeData");
          toast.success("Resume data imported successfully!");
        }
      }
    } catch (error) {
      console.error("Failed to load imported resume data:", error);
      toast.error("Failed to load imported resume data");
    }
  }, [
    isImporting,
    isInitializing,
    resumeData.personalInfo.firstName,
    loadResume,
  ]);

  // Save and exit handler
  const handleSaveAndExit = useCallback(async () => {
    // Only require first name for saving - allow partial resumes
    const hasName = resumeData.personalInfo.firstName?.trim();
    if (!hasName) {
      toast.error("Please provide at least a first name to save.");
      return { success: false };
    }

    if (!user) {
      toast.error("Please log in to save your resume");
      return { success: false };
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

        // Check for plan limit error
        if (savedResume && "code" in savedResume && savedResume.code === "PLAN_LIMIT") {
          const planError = savedResume as PlanLimitError;
          toast.error(
            `Free plan limit reached (${planError.limit}). Upgrade to add more.`
          );
          return { success: false, code: "PLAN_LIMIT", limit: planError.limit };
        }

        // Success - savedResume is a SavedResume
        if (savedResume && "id" in savedResume) {
          const resume = savedResume as SavedResume;
          setEditingResumeId(resume.id);
          setEditingResumeName(resume.name);
          toast.success("Resume saved successfully!");
          return { success: true };
        } else {
          toast.error("Failed to save resume");
          return { success: false };
        }
      }
    } catch (error) {
      // Check for plan limit error in catch block
      if (error && typeof error === "object" && "code" in error && (error as PlanLimitError).code === "PLAN_LIMIT") {
        const planError = error as PlanLimitError;
        toast.error(`Free plan limit reached (${planError.limit}). Upgrade to add more.`);
        return { success: false, code: "PLAN_LIMIT", limit: planError.limit };
      }
      console.error("Error saving resume:", error);
      toast.error("Failed to save resume");
      return { success: false };
    }
  }, [
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

  // Firestore auto-save for authenticated users (debounced)
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [lastCloudSaved, setLastCloudSaved] = useState<Date | null>(null);
  const [cloudSaveError, setCloudSaveError] = useState<string | null>(null);
  const [cloudRetryAttempt, setCloudRetryAttempt] = useState(0);
  const cloudSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    if (isInitializing) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setCloudSaveError("Offline — will resume when you're back online.");
      return;
    }

    if (cloudSaveTimeoutRef.current) {
      clearTimeout(cloudSaveTimeoutRef.current);
    }

    const baseDelay = 600;
    const retryDelay = Math.min(
      5000,
      baseDelay * Math.max(1, cloudRetryAttempt + 1)
    );

    setIsCloudSaving(true);
    cloudSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await firestoreService.saveCurrentResume(user.id!, resumeData);
        setLastCloudSaved(new Date());
        setCloudSaveError(null);
        setCloudRetryAttempt(0);
        // Clear dirty flag in session draft after successful cloud save
        clearDirtyFlag();
      } catch (error) {
        console.error("Failed to autosave to Firestore:", error);
        setCloudSaveError("Cloud save failed — retrying shortly.");
        setCloudRetryAttempt((prev) => Math.min(prev + 1, 5));
      } finally {
        setIsCloudSaving(false);
      }
    }, retryDelay);

    return () => {
      if (cloudSaveTimeoutRef.current) {
        clearTimeout(cloudSaveTimeoutRef.current);
      }
    };
  }, [user?.id, resumeData, isInitializing, cloudRetryAttempt, clearDirtyFlag]);

  const handleReset = useCallback(() => {
    resetResume();
    setEditingResumeId(null);
    setEditingResumeName(null);
    toast.success("Resume reset successfully");
  }, [resetResume, setEditingResumeId, setEditingResumeName]);

  const getSaveStatus = (saving: boolean, last: Date | null) => {
    if (saving) return "Saving to cloud...";
    if (!last) return "Not yet saved";
    const now = Date.now();
    const diffMs = now - last.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    if (diffSecs < 10) return "Saved just now";
    if (diffSecs < 60) return `Saved ${diffSecs}s ago`;
    if (diffMins < 60) return `Saved ${diffMins}m ago`;
    return `Saved at ${last.toLocaleTimeString()}`;
  };

  const saveStatusText = user
    ? cloudSaveError
      ? `${cloudSaveError}${
          cloudRetryAttempt ? ` (retry ${cloudRetryAttempt} of 5)` : ""
        }`
      : getSaveStatus(isCloudSaving, lastCloudSaved)
    : "Not saved";

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
    updateSkill,
    removeSkill,
    addProject,
    updateProject,
    removeProject,
    reorderProjects,
    addCertification,
    addCourseAsCertification,
    updateCertification,
    removeCertification,
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
    addCustomSection,
    updateCustomSection,
    removeCustomSection,
    addCustomSectionItem,
    updateCustomSectionItem,
    removeCustomSectionItem,
    setWorkExperience,
    setEducation,
    setExtraCurricular,
    loadResume,
    resetResume,
    batchUpdate,

    // State
    isInitializing,
    resumeLoadError,
    cloudSaveError,
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

    // Recovery
    showRecoveryPrompt,
    recoveryDraftTimestamp: recoveryDraft?.meta.lastModified
      ? new Date(recoveryDraft.meta.lastModified)
      : null,
    handleRecoverDraft,
    handleDiscardDraft,
  };
}
