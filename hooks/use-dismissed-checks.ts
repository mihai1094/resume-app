"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY_PREFIX = "dismissed-checks-";

/**
 * Hook for managing dismissed readiness checks per resume
 * Stores dismissed check IDs in localStorage, keyed by resume ID
 */
export function useDismissedChecks(resumeId: string | undefined) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Load dismissed checks from localStorage on mount
  useEffect(() => {
    if (!resumeId) {
      setDismissedIds(new Set());
      return;
    }

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${resumeId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setDismissedIds(new Set(parsed));
        }
      }
    } catch (error) {
      console.error("Failed to load dismissed checks:", error);
    }
  }, [resumeId]);

  // Save to localStorage whenever dismissedIds changes
  const saveToStorage = useCallback((ids: Set<string>) => {
    if (!resumeId) return;
    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${resumeId}`,
        JSON.stringify(Array.from(ids))
      );
    } catch (error) {
      console.error("Failed to save dismissed checks:", error);
    }
  }, [resumeId]);

  // Dismiss a check
  const dismissCheck = useCallback((checkId: string) => {
    setDismissedIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(checkId);
      saveToStorage(newSet);
      return newSet;
    });
  }, [saveToStorage]);

  // Restore a dismissed check
  const restoreCheck = useCallback((checkId: string) => {
    setDismissedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(checkId);
      saveToStorage(newSet);
      return newSet;
    });
  }, [saveToStorage]);

  // Reset all dismissed checks
  const resetAll = useCallback(() => {
    setDismissedIds(new Set());
    if (resumeId) {
      try {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${resumeId}`);
      } catch (error) {
        console.error("Failed to reset dismissed checks:", error);
      }
    }
  }, [resumeId]);

  // Check if a specific check is dismissed
  const isDismissed = useCallback((checkId: string) => {
    return dismissedIds.has(checkId);
  }, [dismissedIds]);

  return {
    dismissedIds,
    dismissCheck,
    restoreCheck,
    resetAll,
    isDismissed,
    hasDismissed: dismissedIds.size > 0,
  };
}
