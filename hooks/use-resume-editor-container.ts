"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useResume } from "@/hooks/use-resume";
import { useSavedResumes, SavedResume } from "@/hooks/use-saved-resumes";
import { useSessionDraft, SessionDraftResult } from "@/hooks/use-session-draft";
import { useUser } from "@/hooks/use-user";
import { ResumeData } from "@/lib/types/resume";
import { firestoreService, PlanLimitError } from "@/lib/services/firestore";
import { toast } from "sonner";
import { TemplateId } from "@/lib/constants/templates";

interface UseResumeEditorContainerProps {
  resumeId: string | null;
  jobTitle?: string;
  isImporting?: boolean;
}

/**
 * Container hook for ResumeEditor
 * Handles data persistence, loading, and saving logic
 * Standardized to use the consolidated useSavedResumes hook
 */
export function useResumeEditorContainer({
  resumeId,
  jobTitle,
  isImporting = false,
}: UseResumeEditorContainerProps) {
  const { user, isLoading: isUserLoading } = useUser();
  const userId = user?.id ?? null;

  // Single source of truth for persistence
  const {
    getResumeById,
    getLatestResume,
    upsertResume,
    updateResume
  } = useSavedResumes(userId);

  // Resume state management
  const {
    resumeData,
    resetResume,
    loadResume,
    validation,
    isDirty,
    // ... we can destructure all other handlers if needed, but keeping it brief for the rewrite
    ...resumeHandlers
  } = useResume();

  // Loading & Initialization State
  const [isInitializing, setIsInitializing] = useState(true);
  const [resumeLoadError, setResumeLoadError] = useState<string | null>(null);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(resumeId);
  const [editingResumeName, setEditingResumeName] = useState<string | null>(null);
  const [loadedTemplateId, setLoadedTemplateId] = useState<TemplateId | null>(null);
  const hasInitializedRef = useRef(false);

  /**
   * Centralized Initialization Logic
   * Handles: 
   * 1. Loading specific resume by ID
   * 2. Loading latest "current" resume for new session
   * 3. Handling session draft recovery
   */
  useEffect(() => {
    if (isUserLoading || hasInitializedRef.current) return;

    const init = async () => {
      try {
        if (resumeId) {
          // 1. Loading existing resume
          if (!userId) {
            setResumeLoadError("Please log in to edit resumes");
            return;
          }
          const resume = await getResumeById(resumeId);
          if (resume) {
            loadResume(resume.data);
            setEditingResumeName(resume.name);
            setLoadedTemplateId(resume.templateId as TemplateId);
          } else {
            setResumeLoadError("Resume not found");
          }
        } else {
          // 2. Starting fresh or loading current unsaved resume
          if (userId) {
            const latest = await getLatestResume();
            if (latest) {
              loadResume(latest.data);
            }
          }
        }
      } catch (err) {
        setResumeLoadError("Failed to initialize editor");
      } finally {
        setIsInitializing(false);
        hasInitializedRef.current = true;
      }
    };

    init();
  }, [resumeId, userId, isUserLoading, getResumeById, getLatestResume, loadResume]);

  // Session draft for recovery on refresh
  const { saveDraft, loadDraft, clearDirtyFlag, clearDraft } = useSessionDraft(
    editingResumeId || resumeId
  );

  const [recoveryDraft, setRecoveryDraft] = useState<SessionDraftResult | null>(null);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const hasCheckedForRecoveryRef = useRef(false);

  // Recovery & Auto-save logic (moved from original implementation)
  useEffect(() => {
    if (hasCheckedForRecoveryRef.current || isInitializing || showRecoveryPrompt) return;
    hasCheckedForRecoveryRef.current = true;
    const draft = loadDraft();
    if (draft) {
      setRecoveryDraft(draft);
      setShowRecoveryPrompt(true);
    }
  }, [isInitializing, loadDraft, showRecoveryPrompt]);

  useEffect(() => {
    if (isInitializing || showRecoveryPrompt) return;
    saveDraft(resumeData);
  }, [resumeData, saveDraft, isInitializing, showRecoveryPrompt]);

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

  // Save and exit handler (Refactored to use upsert)
  const handleSaveAndExit = useCallback(
    async (selectedTemplateId: string = "modern") => {
      if (!validation.valid) {
        const criticalError = validation.errors[0]?.message || "Please fix critical errors before saving.";
        toast.error(criticalError);
        return { success: false };
      }

      if (!userId) {
        toast.error("Please log in to save your resume");
        return { success: false };
      }

      const resumeName = editingResumeName ||
        (resumeData.personalInfo.firstName && resumeData.personalInfo.lastName
          ? `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}`
          : jobTitle ? `Resume - ${jobTitle}` : `Resume - ${new Date().toLocaleDateString()}`);

      try {
        const result = await upsertResume({
          id: editingResumeId || undefined,
          name: resumeName,
          templateId: selectedTemplateId,
          data: resumeData,
        });

        if (result && "id" in result) {
          setEditingResumeId(result.id);
          setEditingResumeName(result.name);
          toast.success("Resume saved successfully!");
          return { success: true };
        } else if (result && "code" in result && result.code === "PLAN_LIMIT") {
          toast.error(`Plan limit reached. Upgrade to save more.`);
          return { success: false, code: "PLAN_LIMIT" };
        }

        toast.error("Failed to save resume");
        return { success: false };
      } catch (error) {
        console.error("Error saving resume:", error);
        toast.error("Failed to save resume");
        return { success: false };
      }
    },
    [userId, resumeData, editingResumeName, editingResumeId, jobTitle, upsertResume]
  );

  // Cloud Auto-save state
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [lastCloudSaved, setLastCloudSaved] = useState<Date | null>(null);
  const [cloudSaveError, setCloudSaveError] = useState<string | null>(null);
  const cloudSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced Cloud Save
  useEffect(() => {
    if (!userId || isInitializing) return;

    if (cloudSaveTimeoutRef.current) clearTimeout(cloudSaveTimeoutRef.current);

    setIsCloudSaving(true);
    cloudSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await firestoreService.saveCurrentResume(userId, resumeData);
        setLastCloudSaved(new Date());
        setCloudSaveError(null);
        clearDirtyFlag();
      } catch (err) {
        setCloudSaveError("Cloud save failed — retrying shortly.");
      } finally {
        setIsCloudSaving(false);
      }
    }, 1500);

    return () => {
      if (cloudSaveTimeoutRef.current) clearTimeout(cloudSaveTimeoutRef.current);
    };
  }, [userId, resumeData, isInitializing, clearDirtyFlag]);

  const handleReset = useCallback(() => {
    resetResume();
    setEditingResumeId(null);
    setEditingResumeName(null);
    toast.success("Resume reset successfully");
  }, [resetResume]);

  const saveStatusText = user
    ? cloudSaveError || (isCloudSaving ? "Saving to cloud..." : lastCloudSaved ? "Saved just now" : "Not yet saved")
    : "Not saved";

  return {
    resumeData,
    validation,
    isDirty,
    loadResume,
    resetResume,
    ...resumeHandlers,

    isInitializing,
    resumeLoadError,
    saveStatusText,

    editingResumeId,
    setEditingResumeId,
    editingResumeName,
    setEditingResumeName,
    loadedTemplateId,

    handleSaveAndExit,
    handleReset,

    showRecoveryPrompt,
    recoveryDraftTimestamp: recoveryDraft?.meta.lastModified ? new Date(recoveryDraft.meta.lastModified) : null,
    handleRecoverDraft,
    handleDiscardDraft,

    isCloudSaving,
    cloudSaveError,
  };
}
