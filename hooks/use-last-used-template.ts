"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./use-local-storage";
import { TEMPLATES, Template } from "@/lib/constants/templates";
import {
  COLOR_PALETTES,
  ColorPalette,
  getTemplateDefaultColor,
} from "@/lib/constants/color-palettes";

/** localStorage key for the last-used template preference */
export const LAST_USED_TEMPLATE_KEY = "resume-builder:last-template";

/** Persisted shape — minimal, forward-compatible */
interface StoredLastUsedTemplate {
  templateId: string;
  colorId: string;
}

interface LastUsedTemplateResolved {
  template: Template;
  color: ColorPalette;
}

interface UseLastUsedTemplateReturn {
  /** Validated last-used template + color, or null if none / stale */
  lastUsed: LastUsedTemplateResolved | null;
  /** Persist a template + color choice */
  setLastUsed: (templateId: string, colorId: string) => void;
  /** Remove the stored preference */
  clear: () => void;
  /** True once localStorage has been read on the client */
  hasLoaded: boolean;
}

/**
 * Tracks the user's most recently selected template + color across sessions.
 * Thin wrapper over useLocalStorage with validation on read.
 *
 * - Returns null if the stored templateId is no longer in TEMPLATES
 * - Falls back to the template's default color if the stored colorId was removed
 * - SSR-safe: returns null + hasLoaded=false on the server and initial client render
 */
export function useLastUsedTemplate(): UseLastUsedTemplateReturn {
  const { value, setValue, clearValue, hasLoaded } =
    useLocalStorage<StoredLastUsedTemplate | null>(LAST_USED_TEMPLATE_KEY, null, 0);

  const lastUsed = useMemo<LastUsedTemplateResolved | null>(() => {
    if (!hasLoaded || !value) return null;
    const template = TEMPLATES.find((t) => t.id === value.templateId);
    if (!template) return null;
    const color =
      COLOR_PALETTES.find((c) => c.id === value.colorId) ??
      getTemplateDefaultColor(template.id);
    return { template, color };
  }, [value, hasLoaded]);

  const setLastUsed = useCallback(
    (templateId: string, colorId: string) => {
      setValue({ templateId, colorId });
    },
    [setValue]
  );

  const clear = useCallback(() => {
    clearValue();
  }, [clearValue]);

  return { lastUsed, setLastUsed, clear, hasLoaded };
}
