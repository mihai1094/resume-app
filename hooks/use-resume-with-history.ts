"use client";

import { useCallback, useEffect, useRef } from "react";
import { useResume } from "./use-resume";
import { useHistory } from "./use-history";
import { ResumeData } from "@/lib/types/resume";

/**
 * Wrapper hook that adds undo/redo functionality to useResume
 */
export function useResumeWithHistory() {
  const resumeHook = useResume();
  const skipHistoryUpdateRef = useRef(false);

  const {
    state: resumeData,
    updateState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useHistory<ResumeData>(resumeHook.resumeData, 50);

  // Sync history state with resume hook state
  useEffect(() => {
    if (skipHistoryUpdateRef.current) {
      skipHistoryUpdateRef.current = false;
      return;
    }

    // Deep comparison to avoid unnecessary updates
    const currentStr = JSON.stringify(resumeHook.resumeData);
    const historyStr = JSON.stringify(resumeData);

    if (currentStr !== historyStr) {
      updateState(resumeHook.resumeData);
    }
  }, [resumeHook.resumeData, resumeData, updateState]);

  // Wrapped undo that updates resume hook
  const handleUndo = useCallback(() => {
    skipHistoryUpdateRef.current = true;
    undo();
    // The state will be updated by the history hook
  }, [undo]);

  // Wrapped redo that updates resume hook
  const handleRedo = useCallback(() => {
    skipHistoryUpdateRef.current = true;
    redo();
    // The state will be updated by the history hook
  }, [redo]);

  // Sync resume hook when history state changes
  useEffect(() => {
    if (skipHistoryUpdateRef.current) {
      const resumeHookStr = JSON.stringify(resumeHook.resumeData);
      const historyStr = JSON.stringify(resumeData);

      if (resumeHookStr !== historyStr) {
        // Update resume hook to match history
        Object.assign(resumeHook.resumeData, resumeData);
        // Force update by calling a setter - we'll need to modify useResume
        // For now, we'll work around this
      }
    }
  }, [resumeData, resumeHook.resumeData]);

  const loadResume = useCallback(
    (data: ResumeData) => {
      skipHistoryUpdateRef.current = true;
      resumeHook.loadResume(data);
      resetHistory(data);
    },
    [resumeHook, resetHistory]
  );

  const resetResume = useCallback(() => {
    skipHistoryUpdateRef.current = true;
    resumeHook.resetResume();
    resetHistory(resumeHook.resumeData);
  }, [resumeHook, resetHistory]);

  return {
    ...resumeHook,
    resumeData: resumeData, // Use history state
    undo: handleUndo,
    redo: handleRedo,
    canUndo,
    canRedo,
    loadResume,
    resetResume,
  };
}

