"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { firestoreService } from "@/lib/services/firestore";
import { ResumeData } from "@/lib/types/resume";

/**
 * Hook for managing resume data in Firestore with auto-save
 * Replaces useLocalStorage for authenticated users
 */
const DEFAULT_AUTOSAVE_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes

export function useFirestoreStorage(
  userId: string | null,
  debounceMs: number = DEFAULT_AUTOSAVE_INTERVAL_MS
) {
  const [storedValue, setStoredValue] = useState<ResumeData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load initial value from Firestore
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await firestoreService.getCurrentResume(userId);
        if (data) {
          setStoredValue(data);
        }
      } catch (error) {
        console.error("Failed to load Firestore resume:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId]);

  // Debounced save to Firestore
  useEffect(() => {
    if (!userId || !storedValue || isLoading) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);

    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const success = await firestoreService.saveCurrentResume(
          userId,
          storedValue
        );

        if (success) {
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error("Failed to save resume to Firestore:", error);
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [userId, storedValue, debounceMs, isLoading]);

  // Update value
  const setValue = useCallback(
    (value: ResumeData | ((val: ResumeData | null) => ResumeData)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
      } catch (error) {
        console.error("Error updating resume data:", error);
      }
    },
    [storedValue]
  );

  // Clear value
  const clearValue = useCallback(() => {
    setStoredValue(null);
    setLastSaved(null);
  }, []);

  return {
    value: storedValue,
    setValue,
    clearValue,
    isSaving,
    lastSaved,
    isLoading,
  };
}

/**
 * Get save status message (same as useLocalStorage)
 */
export function getSaveStatus(
  isSaving: boolean,
  lastSaved: Date | null
): string {
  if (isSaving) {
    return "Saving...";
  }

  if (!lastSaved) {
    return "No changes";
  }

  const now = new Date();
  const diffMs = now.getTime() - lastSaved.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);

  if (diffSecs < 10) {
    return "Saved just now";
  } else if (diffSecs < 60) {
    return `Saved ${diffSecs} seconds ago`;
  } else if (diffMins < 60) {
    return `Saved ${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
  } else {
    return `Saved at ${lastSaved.toLocaleTimeString()}`;
  }
}
