"use client";

import { useState, useEffect, useCallback } from "react";
import { storageService } from "@/lib/services/storage";
import { storageConfig } from "@/config/storage";

/**
 * @deprecated This hook is deprecated as of the Firebase migration.
 * Use useFirestoreStorage from @/hooks/use-firestore-storage instead for resume data persistence.
 * This file is kept for reference only and should not be used in new code.
 *
 * Hook for managing data in localStorage with auto-save
 * Uses storageService for all storage operations
 * @param key - The localStorage key
 * @param initialValue - Initial value if no data in localStorage
 * @param debounceMs - Debounce time for auto-save (default from config)
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  debounceMs: number = storageConfig.autoSave.debounceMs
) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load initial value from localStorage using storage service
  useEffect(() => {
    const loaded = storageService.load<T>(key);
    if (loaded !== null) {
      setStoredValue(loaded);
    }
  }, [key]);

  // Debounced save to localStorage using storage service
  useEffect(() => {
    setIsSaving(true);
    const handler = setTimeout(() => {
      const success = storageService.save(key, storedValue);
      if (success) {
        setLastSaved(new Date());
      }
      setIsSaving(false);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [key, storedValue, debounceMs]);

  // Function to update the stored value
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
      } catch (error) {
        console.error(`Error updating ${key}:`, error);
      }
    },
    [key, storedValue]
  );

  // Function to clear the stored value using storage service
  const clearValue = useCallback(() => {
    storageService.remove(key);
    setStoredValue(initialValue);
    setLastSaved(null);
  }, [key, initialValue]);

  return {
    value: storedValue,
    setValue,
    clearValue,
    isSaving,
    lastSaved,
  };
}

/**
 * Hook specifically for resume data with auto-save
 * Uses storageConfig for the key
 */
export function useResumeStorage() {
  return useLocalStorage(
    storageConfig.keys.resumeData,
    null,
    storageConfig.autoSave.debounceMs
  );
}

/**
 * Get save status message
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
