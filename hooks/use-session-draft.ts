import { useCallback, useMemo, useRef, useEffect } from "react";
import { ResumeData } from "@/lib/types/resume";
import { createUUID } from "@/lib/utils/id";

const SESSION_DRAFT_PREFIX = "resume_editor_draft";
const SESSION_DRAFT_META_PREFIX = "resume_editor_draft_meta";

/** Build storage keys scoped by user so anonymous drafts are not shown after login/register. Exported for tests. */
export function draftKeys(userId: string | null, effectiveResumeId: string) {
  const userKey = userId ?? "anon";
  return {
    data: `${SESSION_DRAFT_PREFIX}_${userKey}_${effectiveResumeId}`,
    meta: `${SESSION_DRAFT_META_PREFIX}_${userKey}_${effectiveResumeId}`,
  };
}

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
 * Drafts are scoped by userId so a newly registered user never sees
 * anonymous/pre-login drafts.
 *
 * Usage:
 * - saveDraft(): Call on every state change (synchronous, no debounce)
 * - loadDraft(): Call on mount to check for recoverable draft
 * - clearDirtyFlag(): Call after successful Firestore save
 * - clearDraft(): Call when switching resumes or on explicit discard
 */
export function useSessionDraft(resumeId: string | null, userId: string | null = null) {
  // Use "new" as a placeholder for new resumes without an ID yet
  const effectiveResumeId = resumeId || "new";
  const keys = useMemo(
    () => draftKeys(userId, effectiveResumeId),
    [userId, effectiveResumeId]
  );
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

  // Track previous resumeId and userId to clear old draft when switching
  const prevResumeIdRef = useRef<string | null>(null);
  const prevUserIdRef = useRef<string | null>(null);

  // Clear previous draft when resumeId or userId changes (switching resumes or logging in/out)
  useEffect(() => {
    const prevResumeId = prevResumeIdRef.current;
    const prevUserId = prevUserIdRef.current;
    const changed =
      prevResumeId !== effectiveResumeId || prevUserId !== userId;
    if (changed && (prevResumeId !== null || prevUserId !== null)) {
      const oldKeys = draftKeys(prevUserId, prevResumeId ?? "new");
      try {
        sessionStorage.removeItem(oldKeys.data);
        sessionStorage.removeItem(oldKeys.meta);
      } catch {
        // Ignore
      }
    }
    prevResumeIdRef.current = effectiveResumeId;
    prevUserIdRef.current = userId;
  }, [effectiveResumeId, userId]);

  /**
   * Save draft to sessionStorage.
   * Call this on every state change for immediate backup.
   */
  const saveDraft = useCallback(
    (data: ResumeData) => {
      if (typeof window === "undefined") return;

      try {
        sessionStorage.setItem(keys.data, JSON.stringify(data));
        sessionStorage.setItem(
          keys.meta,
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
    [effectiveResumeId, tabId, keys.data, keys.meta]
  );

  /**
   * Load draft from sessionStorage.
   * Returns null if no draft exists or if it doesn't match current resumeId.
   */
  const loadDraft = useCallback((): SessionDraftResult | null => {
    if (typeof window === "undefined") return null;

    try {
      const metaStr = sessionStorage.getItem(keys.meta);
      if (!metaStr) return null;

      const meta = JSON.parse(metaStr) as DraftMeta;

      // Only load if same resume and has unsaved changes
      if (meta.resumeId !== effectiveResumeId || !meta.isDirty) return null;

      const draftStr = sessionStorage.getItem(keys.data);
      if (!draftStr) return null;

      const data = JSON.parse(draftStr) as ResumeData;
      return { data, meta };
    } catch {
      return null;
    }
  }, [effectiveResumeId, keys.data, keys.meta]);

  /**
   * Get draft meta without loading the full data.
   * Useful for checking if a draft exists before loading.
   */
  const getDraftMeta = useCallback((): DraftMeta | null => {
    if (typeof window === "undefined") return null;

    try {
      const metaStr = sessionStorage.getItem(keys.meta);
      if (!metaStr) return null;
      return JSON.parse(metaStr) as DraftMeta;
    } catch {
      return null;
    }
  }, [keys.meta]);

  /**
   * Clear the dirty flag after successful Firestore save.
   * The draft data remains for quick access but won't trigger recovery.
   */
  const clearDirtyFlag = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const metaStr = sessionStorage.getItem(keys.meta);
      if (metaStr) {
        const meta = JSON.parse(metaStr) as DraftMeta;
        meta.isDirty = false;
        sessionStorage.setItem(keys.meta, JSON.stringify(meta));
      }
    } catch {
      // Ignore
    }
  }, [keys.meta]);

  /**
   * Fully clear the draft from sessionStorage.
   * Call when discarding changes or navigating away.
   */
  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      sessionStorage.removeItem(keys.data);
      sessionStorage.removeItem(keys.meta);
    } catch {
      // Ignore
    }
  }, [keys.data, keys.meta]);

  return {
    saveDraft,
    loadDraft,
    getDraftMeta,
    clearDirtyFlag,
    clearDraft,
    tabId,
  };
}
