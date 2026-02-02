import { useCallback, useMemo, useRef, useEffect } from "react";
import { ResumeData } from "@/lib/types/resume";
import { createUUID } from "@/lib/utils/id";

const SESSION_DRAFT_KEY = "resume_editor_draft";
const SESSION_DRAFT_META_KEY = "resume_editor_draft_meta";

export interface DraftMeta {
  resumeId: string;
  tabId: string;
  lastModified: number;
  isDirty: boolean;
}

export interface SessionDraftResult {
  data: ResumeData;
  meta: DraftMeta;
}

/**
 * Hook for managing sessionStorage-based draft persistence.
 *
 * Provides immediate backup of resume data to sessionStorage to prevent
 * data loss on browser refresh. Works alongside Firestore sync.
 *
 * Usage:
 * - saveDraft(): Call on every state change (synchronous, no debounce)
 * - loadDraft(): Call on mount to check for recoverable draft
 * - clearDirtyFlag(): Call after successful Firestore save
 * - clearDraft(): Call when switching resumes or on explicit discard
 */
export function useSessionDraft(resumeId: string | null) {
  // Use "new" as a placeholder for new resumes without an ID yet
  const effectiveResumeId = resumeId || "new";
  // Generate stable tab ID for this session
  const tabId = useMemo(() => {
    if (typeof window === "undefined") return "";
    // Check if we already have a tab ID in this session
    const existingTabId = sessionStorage.getItem("resume_editor_tab_id");
    if (existingTabId) return existingTabId;
    const newTabId = createUUID();
    sessionStorage.setItem("resume_editor_tab_id", newTabId);
    return newTabId;
  }, []);

  // Track the previous resumeId to detect changes
  const prevResumeIdRef = useRef<string | null>(null);

  // Clear draft when resumeId changes (switching resumes)
  useEffect(() => {
    if (
      prevResumeIdRef.current !== null &&
      prevResumeIdRef.current !== effectiveResumeId
    ) {
      // Resume ID changed, clear old draft
      try {
        sessionStorage.removeItem(SESSION_DRAFT_KEY);
        sessionStorage.removeItem(SESSION_DRAFT_META_KEY);
      } catch {
        // Ignore
      }
    }
    prevResumeIdRef.current = effectiveResumeId;
  }, [effectiveResumeId]);

  /**
   * Save draft to sessionStorage.
   * Call this on every state change for immediate backup.
   */
  const saveDraft = useCallback(
    (data: ResumeData) => {
      if (typeof window === "undefined") return;

      try {
        sessionStorage.setItem(SESSION_DRAFT_KEY, JSON.stringify(data));
        sessionStorage.setItem(
          SESSION_DRAFT_META_KEY,
          JSON.stringify({
            resumeId: effectiveResumeId,
            tabId,
            lastModified: Date.now(),
            isDirty: true,
          } satisfies DraftMeta)
        );
      } catch (e) {
        // Handle quota exceeded silently
        console.warn("Session draft save failed:", e);
      }
    },
    [effectiveResumeId, tabId]
  );

  /**
   * Load draft from sessionStorage.
   * Returns null if no draft exists or if it doesn't match current resumeId.
   */
  const loadDraft = useCallback((): SessionDraftResult | null => {
    if (typeof window === "undefined") return null;

    try {
      const metaStr = sessionStorage.getItem(SESSION_DRAFT_META_KEY);
      if (!metaStr) return null;

      const meta = JSON.parse(metaStr) as DraftMeta;

      // Only load if same resume and has unsaved changes
      if (meta.resumeId !== effectiveResumeId || !meta.isDirty) return null;

      const draftStr = sessionStorage.getItem(SESSION_DRAFT_KEY);
      if (!draftStr) return null;

      const data = JSON.parse(draftStr) as ResumeData;
      return { data, meta };
    } catch {
      return null;
    }
  }, [effectiveResumeId]);

  /**
   * Get draft meta without loading the full data.
   * Useful for checking if a draft exists before loading.
   */
  const getDraftMeta = useCallback((): DraftMeta | null => {
    if (typeof window === "undefined") return null;

    try {
      const metaStr = sessionStorage.getItem(SESSION_DRAFT_META_KEY);
      if (!metaStr) return null;
      return JSON.parse(metaStr) as DraftMeta;
    } catch {
      return null;
    }
  }, []);

  /**
   * Clear the dirty flag after successful Firestore save.
   * The draft data remains for quick access but won't trigger recovery.
   */
  const clearDirtyFlag = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const metaStr = sessionStorage.getItem(SESSION_DRAFT_META_KEY);
      if (metaStr) {
        const meta = JSON.parse(metaStr) as DraftMeta;
        meta.isDirty = false;
        sessionStorage.setItem(SESSION_DRAFT_META_KEY, JSON.stringify(meta));
      }
    } catch {
      // Ignore
    }
  }, []);

  /**
   * Fully clear the draft from sessionStorage.
   * Call when discarding changes or navigating away.
   */
  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      sessionStorage.removeItem(SESSION_DRAFT_KEY);
      sessionStorage.removeItem(SESSION_DRAFT_META_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    saveDraft,
    loadDraft,
    getDraftMeta,
    clearDirtyFlag,
    clearDraft,
    tabId,
  };
}
