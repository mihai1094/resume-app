"use client";

import { useMemo } from "react";
import { storageConfig } from "@/config/storage";
import { useLocalStorage } from "@/hooks/use-local-storage";

export type AiTone = "professional" | "concise" | "impactful" | "friendly";
export type AiLength = "short" | "medium" | "long";

export type AiPreferences = {
  tone: AiTone;
  length: AiLength;
};

const DEFAULT_PREFERENCES: AiPreferences = {
  tone: "professional",
  length: "medium",
};

export const AI_TONE_OPTIONS: { value: AiTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "concise", label: "Concise" },
  { value: "impactful", label: "Impactful" },
  { value: "friendly", label: "Friendly" },
];

export const AI_LENGTH_OPTIONS: { value: AiLength; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

/**
 * Persisted AI preferences (tone, length) with safe defaults.
 */
export function useAiPreferences() {
  const { value, setValue, isSaving, lastSaved } = useLocalStorage<AiPreferences>(
    storageConfig.keys.aiPreferences,
    DEFAULT_PREFERENCES,
    // We don't need the debounce since changes are infrequent
    150
  );

  const setTone = (tone: AiTone) =>
    setValue((prev) => ({
      ...prev,
      tone,
    }));

  const setLength = (length: AiLength) =>
    setValue((prev) => ({
      ...prev,
      length,
    }));

  const summary = useMemo(
    () => `${value.tone} · ${value.length}`,
    [value.length, value.tone]
  );

  return {
    preferences: value,
    setTone,
    setLength,
    summary,
    isSaving,
    lastSaved,
  };
}


