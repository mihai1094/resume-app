"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { WizardStep, ChangeRecord } from "@/lib/ai/content-types";
import { ResumeData } from "@/lib/types/resume";

const SESSION_KEY = "wizard_session";
const SESSION_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

interface WizardSessionData {
  resumeId: string;
  step: WizardStep;
  workingResume: ResumeData;
  appliedSuggestions: string[];
  skippedSuggestions: string[];
  addedKeywords: string[];
  summaryApplied: boolean;
  changes: ChangeRecord[];
  timestamp: number;
}

interface UseWizardSessionReturn {
  hasRecoverableSession: boolean;
  recoveredSession: WizardSessionData | null;
  saveSession: (data: Omit<WizardSessionData, "timestamp">) => void;
  clearSession: () => void;
  dismissRecovery: () => void;
}

/**
 * Hook to persist wizard session state to sessionStorage
 * Prevents losing progress if the dialog is accidentally closed
 */
export function useWizardSession(resumeId: string): UseWizardSessionReturn {
  const [recoveredSession, setRecoveredSession] = useState<WizardSessionData | null>(null);
  const [hasRecoverableSession, setHasRecoverableSession] = useState(false);
  const lastSaveRef = useRef<number>(0);

  // Check for recoverable session on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored) return;

      const session = JSON.parse(stored) as WizardSessionData;

      // Check if session is for this resume and not expired
      if (
        session.resumeId === resumeId &&
        Date.now() - session.timestamp < SESSION_EXPIRY_MS &&
        session.changes.length > 0
      ) {
        setRecoveredSession(session);
        setHasRecoverableSession(true);
      } else {
        // Clear expired or mismatched session
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch (error) {
      console.warn("Failed to recover wizard session:", error);
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [resumeId]);

  // Save session to storage (debounced)
  const saveSession = useCallback(
    (data: Omit<WizardSessionData, "timestamp">) => {
      const now = Date.now();

      // Debounce saves to every 500ms
      if (now - lastSaveRef.current < 500) return;
      lastSaveRef.current = now;

      try {
        const sessionData: WizardSessionData = {
          ...data,
          timestamp: now,
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      } catch (error) {
        console.warn("Failed to save wizard session:", error);
      }
    },
    []
  );

  // Clear session
  const clearSession = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      setRecoveredSession(null);
      setHasRecoverableSession(false);
    } catch (error) {
      console.warn("Failed to clear wizard session:", error);
    }
  }, []);

  // Dismiss recovery prompt without clearing (user chose to start fresh)
  const dismissRecovery = useCallback(() => {
    setHasRecoverableSession(false);
    clearSession();
  }, [clearSession]);

  return {
    hasRecoverableSession,
    recoveredSession,
    saveSession,
    clearSession,
    dismissRecovery,
  };
}

/**
 * Helper hook to auto-save wizard state
 */
export function useWizardSessionAutoSave(
  resumeId: string,
  state: {
    step: WizardStep;
    workingResume: ResumeData;
    appliedSuggestions: string[];
    skippedSuggestions: string[];
    addedKeywords: string[];
    summaryApplied: boolean;
    changes: ChangeRecord[];
  }
) {
  const { saveSession, clearSession } = useWizardSession(resumeId);
  const changesCountRef = useRef(0);

  // Auto-save whenever changes are made
  useEffect(() => {
    // Only save if there are changes
    if (state.changes.length === 0) {
      return;
    }

    // Only save if changes have increased
    if (state.changes.length <= changesCountRef.current) {
      return;
    }
    changesCountRef.current = state.changes.length;

    saveSession({
      resumeId,
      step: state.step,
      workingResume: state.workingResume,
      appliedSuggestions: state.appliedSuggestions,
      skippedSuggestions: state.skippedSuggestions,
      addedKeywords: state.addedKeywords,
      summaryApplied: state.summaryApplied,
      changes: state.changes,
    });
  }, [
    resumeId,
    state.step,
    state.workingResume,
    state.appliedSuggestions,
    state.skippedSuggestions,
    state.addedKeywords,
    state.summaryApplied,
    state.changes,
    saveSession,
  ]);

  return { clearSession };
}
