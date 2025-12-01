"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { storageConfig } from "@/config/storage";

const isBrowser = () => typeof window !== "undefined";

function readStoredValue<T>(key: string): { data: T; timestamp?: number } | null {
  if (!isBrowser()) return null;

  try {
    const item = window.localStorage.getItem(key);
    if (!item) {
      return null;
    }
    const parsed = JSON.parse(item);
    if (parsed && typeof parsed === "object" && "data" in parsed) {
      return parsed as { data: T; timestamp?: number };
    }
    return { data: parsed as T };
  } catch (error) {
    console.warn(`Failed to read ${key} from localStorage`, error);
    return null;
  }
}

function persistValue(key: string, value: unknown) {
  if (!isBrowser()) return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to persist ${key} to localStorage`, error);
    return false;
  }
}

function removeValue(key: string) {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove ${key} from localStorage`, error);
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  debounceMs: number = storageConfig.autoSave.debounceMs
) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loaded = readStoredValue<T>(key);
    if (loaded) {
      setStoredValue(loaded.data);
      if (loaded.timestamp) {
        setLastSaved(new Date(loaded.timestamp));
      }
    }
  }, [key]);

  useEffect(() => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    setIsSaving(true);
    saveTimeout.current = setTimeout(() => {
      const now = new Date();
      const success = persistValue(key, {
        data: storedValue,
        timestamp: now.getTime(),
      });

      if (success) {
        setLastSaved(now);
      }
      setIsSaving(false);
    }, debounceMs);

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [key, storedValue, debounceMs]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        return nextValue;
      });
    },
    []
  );

  const clearValue = useCallback(() => {
    removeValue(key);
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

export function useResumeStorage() {
  return useLocalStorage(
    storageConfig.keys.resumeData,
    null,
    storageConfig.autoSave.debounceMs
  );
}

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
