"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useResume } from "@/hooks/use-resume";
import { useSavedResumes } from "@/hooks/use-saved-resumes";
import { useSessionDraft, SessionDraftResult } from "@/hooks/use-session-draft";
import { useUser } from "@/hooks/use-user";
import { ResumeData } from "@/lib/types/resume";
import { firestoreService } from "@/lib/services/firestore";
import { toast } from "sonner";
import { TemplateId } from "@/lib/constants/templates";
import { TemplateCustomizationDefaults } from "@/lib/constants/defaults";
import { logger } from "@/lib/services/logger";
import { ConflictError } from "@/lib/types/errors";

const resumeEditorLogger = logger.child({ module: "UseResumeEditorContainer" });

interface UseResumeEditorContainerProps {
  resumeId: string | null;
  jobTitle?: string;
  initializeFromLatest?: boolean;
}

/**
 * Container hook for ResumeEditor
 * Handles data persistence, loading, and saving logic
 * Standardized to use the consolidated useSavedResumes hook
 */
export function useResumeEditorContainer({
  resumeId,
  jobTitle,
  initializeFromLatest = false,
}: UseResumeEditorContainerProps) {
  const { user, isLoading: isUserLoading } = useUser();
  const userId = user?.id ?? null;

  // Single source of truth for persistence
  const {
    getResumeById,
    getLatestResume,
    upsertResume,
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
  const [editingResumeUpdatedAt, setEditingResumeUpdatedAt] = useState<string | null>(null);
  const [loadedTemplateId, setLoadedTemplateId] = useState<TemplateId | null>(null);
  const [loadedTemplateCustomization, setLoadedTemplateCustomization] =
    useState<TemplateCustomizationDefaults | null>(null);
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
            setEditingResumeUpdatedAt(resume.updatedAt);
            setLoadedTemplateId(resume.templateId as TemplateId);
            setLoadedTemplateCustomization(resume.customization ?? null);
          } else {
            setResumeLoadError("Resume not found");
          }
        } else {
          // 2. Starting fresh by default (best practice for /editor/new)
          // Only load latest draft when explicitly requested.
          if (userId && initializeFromLatest) {
            const latest = await getLatestResume();
            if (latest) {
              loadResume(latest.data);
              if (latest.templateId) {
                setLoadedTemplateId(latest.templateId as TemplateId);
              }
              if (latest.customization) {
                setLoadedTemplateCustomization(latest.customization);
              }
            }
          }
          setEditingResumeUpdatedAt(null);
        }
      } catch {
        setResumeLoadError("Failed to initialize editor");
      } finally {
        setIsInitializing(false);
        hasInitializedRef.current = true;
      }
    };

    init();
  }, [resumeId, userId, isUserLoading, getResumeById, getLatestResume, loadResume, initializeFromLatest]);

  // Session draft for recovery on refresh (scoped by userId so post-register never sees anon draft)
  const { saveDraft, loadDraft, clearDirtyFlag, clearDraft } = useSessionDraft(
    editingResumeId || resumeId,
    userId
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

  const handleDiscardDraft = useCallback(async () => {
    setShowRecoveryPrompt(false);
    setRecoveryDraft(null);
    clearDraft();

    // For brand-new resumes (/editor/new), also clear the cloud autosave target
    // so "Continue draft" doesn't resurrect discarded content.
    const isNewResumeFlow = !resumeId && !editingResumeId;
    if (!isNewResumeFlow || !userId) return;

    try {
      await firestoreService.clearCurrentResume(userId);
    } catch (error) {
      resumeEditorLogger.error("Failed to clear current resume draft", error, {
        userId,
      });
    }
  }, [clearDraft, editingResumeId, resumeId, userId]);

  // Save and exit handler (Refactored to use upsert)
  const handleSaveAndExit = useCallback(
    async (
      selectedTemplateId: string = "modern",
      customization?: TemplateCustomizationDefaults
    ) => {
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
          customization,
          updatedAt: editingResumeUpdatedAt ?? undefined,
        });

        if (result && "id" in result) {
          setEditingResumeId(result.id);
          setEditingResumeName(result.name);
          setEditingResumeUpdatedAt(result.updatedAt);
          setCloudSaveError(null);
          toast.success("Resume saved successfully!");
          return { success: true };
        } else if (result && "code" in result && result.code === "PLAN_LIMIT") {
          toast.error(`Plan limit reached. Upgrade to save more.`);
          return { success: false, code: "PLAN_LIMIT" };
        }

        toast.error("Failed to save resume");
        return { success: false };
      } catch (error) {
        if (error instanceof ConflictError) {
          const conflictMessage =
            "Conflict detected. This resume was updated in another tab. Reload the latest version before saving again.";
          setCloudSaveError(conflictMessage);
          toast.error(conflictMessage);
          return { success: false, code: "CONFLICT" as const };
        }

        resumeEditorLogger.error("Failed to save resume", error, {
          userId,
          editingResumeId,
          selectedTemplateId,
        });
        toast.error("Failed to save resume");
        return { success: false };
      }
    },
    [
      userId,
      resumeData,
      editingResumeName,
      editingResumeUpdatedAt,
      editingResumeId,
      jobTitle,
      upsertResume,
      validation.valid,
      validation.errors,
    ]
  );

  // Cloud Auto-save state
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [lastCloudSaved, setLastCloudSaved] = useState<Date | null>(null);
  const [cloudSaveError, setCloudSaveError] = useState<string | null>(null);
  const cloudSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestResumeDataRef = useRef(resumeData);
  const latestUserIdRef = useRef<string | null>(userId);
  const hasPendingCloudSaveRef = useRef(false);
  // Latched once clearCurrentDraftAfterSave runs so later debounce re-runs and
  // the unmount flush don't race-write the draft back to Firestore. Cleared
  // only by explicit reset/load.
  const suppressAutoSaveRef = useRef(false);
  // Track current template for auto-save (set by editor via setAutoSaveTemplateId)
  const autoSaveTemplateIdRef = useRef<string | undefined>(undefined);
  latestResumeDataRef.current = resumeData;
  latestUserIdRef.current = userId;

  const persistCurrentResume = useCallback(
    async (
      targetUserId: string,
      data: ResumeData,
      options: { updateUi?: boolean } = {}
    ) => {
      const shouldUpdateUi = options.updateUi !== false;

      try {
        await firestoreService.saveCurrentResume(targetUserId, data, autoSaveTemplateIdRef.current);

        clearDirtyFlag();

        if (shouldUpdateUi) {
          setLastCloudSaved(new Date());
          setCloudSaveError(null);
        }

        return true;
      } catch {
        if (shouldUpdateUi) {
          setCloudSaveError("Cloud save failed — retrying shortly.");
        }

        return false;
      } finally {
        if (shouldUpdateUi) {
          setIsCloudSaving(false);
        }
      }
    },
    [clearDirtyFlag]
  );

  // Debounced Cloud Save
  useEffect(() => {
    if (!userId || isInitializing) return;
    // Save & Exit already cleared the draft — don't revive it.
    if (suppressAutoSaveRef.current) return;

    if (cloudSaveTimeoutRef.current) clearTimeout(cloudSaveTimeoutRef.current);

    if (!isDirty) {
      setIsCloudSaving(false);
      hasPendingCloudSaveRef.current = false;
      return;
    }

    hasPendingCloudSaveRef.current = true;
    cloudSaveTimeoutRef.current = setTimeout(async () => {
      cloudSaveTimeoutRef.current = null;
      hasPendingCloudSaveRef.current = false;
      setIsCloudSaving(true);
      await persistCurrentResume(userId, resumeData);
    }, 2000);

    return () => {
      if (cloudSaveTimeoutRef.current) clearTimeout(cloudSaveTimeoutRef.current);
    };
  }, [userId, resumeData, isDirty, isInitializing, persistCurrentResume]);

  useEffect(() => {
    return () => {
      const pendingUserId = latestUserIdRef.current;

      if (!pendingUserId || !hasPendingCloudSaveRef.current) return;
      // Save & Exit already cleared the draft — don't flush it back on unmount.
      if (suppressAutoSaveRef.current) return;

      if (cloudSaveTimeoutRef.current) {
        clearTimeout(cloudSaveTimeoutRef.current);
        cloudSaveTimeoutRef.current = null;
      }

      hasPendingCloudSaveRef.current = false;
      void persistCurrentResume(pendingUserId, latestResumeDataRef.current, {
        updateUi: false,
      });
    };
  }, [persistCurrentResume]);

  const handleReset = useCallback(() => {
    resetResume();
    setEditingResumeId(null);
    setEditingResumeName(null);
    setEditingResumeUpdatedAt(null);
    suppressAutoSaveRef.current = false;
    toast.success("Resume reset successfully");
  }, [resetResume]);

  const clearCurrentDraftAfterSave = useCallback(async (
    options: { updateUi?: boolean } = {}
  ) => {
    const currentUserId = latestUserIdRef.current;
    if (!currentUserId) return false;
    const shouldUpdateUi = options.updateUi !== false;

    if (cloudSaveTimeoutRef.current) {
      clearTimeout(cloudSaveTimeoutRef.current);
      cloudSaveTimeoutRef.current = null;
    }

    hasPendingCloudSaveRef.current = false;
    // Latch the suppression so the next debounce useEffect run + the unmount
    // cleanup can't race-write the draft back to Firestore after we cleared it.
    suppressAutoSaveRef.current = true;
    if (shouldUpdateUi) {
      setIsCloudSaving(false);
    }

    try {
      await firestoreService.clearCurrentResume(currentUserId);
      if (shouldUpdateUi) {
        setCloudSaveError(null);
      }
      return true;
    } catch (error) {
      resumeEditorLogger.error("Failed to clear current resume after save", error, {
        userId: currentUserId,
      });
      return false;
    }
  }, []);

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
    loadedTemplateCustomization,

    handleSaveAndExit,
    handleReset,
    clearCurrentDraftAfterSave,

    showRecoveryPrompt,
    recoveryDraftTimestamp: recoveryDraft?.meta.lastModified ? new Date(recoveryDraft.meta.lastModified) : null,
    handleRecoverDraft,
    handleDiscardDraft,

    isCloudSaving,
    cloudSaveError,

    /** Set the current template ID for auto-save persistence */
    setAutoSaveTemplateId: useCallback((id: string) => {
      autoSaveTemplateIdRef.current = id;
    }, []),
  };
}
