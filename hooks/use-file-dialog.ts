"use client";

import { useCallback } from "react";
import { ResumeData, ResumeExportEnvelope } from "@/lib/types/resume";
import { TemplateCustomizationDefaults } from "@/lib/constants/defaults";
import { toast } from "sonner";

export interface FileDialogOptions {
  accept?: string;
  multiple?: boolean;
}

export interface ImportedResumeMeta {
  templateId?: string;
  customization?: TemplateCustomizationDefaults;
  name?: string;
}

function isValidResumeData(data: unknown): data is ResumeData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return typeof d.personalInfo === "object" && d.personalInfo !== null;
}

function parseResumeJSON(
  raw: unknown
): { data: ResumeData; meta: ImportedResumeMeta } | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  // New envelope format
  if (obj._type === "resumezeus-resume" && obj.data) {
    const envelope = obj as unknown as ResumeExportEnvelope;
    if (!isValidResumeData(envelope.data)) return null;
    return {
      data: envelope.data,
      meta: {
        templateId: typeof envelope.templateId === "string" ? envelope.templateId : undefined,
        customization: envelope.customization as TemplateCustomizationDefaults | undefined,
        name: typeof envelope.name === "string" ? envelope.name : undefined,
      },
    };
  }

  // Legacy format: raw ResumeData at root
  if (isValidResumeData(obj)) {
    return { data: obj, meta: {} };
  }

  return null;
}

/**
 * Hook for managing file input dialogs
 * Handles file selection and loading with proper cleanup
 */
export function useFileDialog() {
  const openFileDialog = useCallback(
    (
      onSelect: (file: File) => void,
      options: FileDialogOptions = {}
    ) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = options.accept ?? "";
      input.multiple = options.multiple || false;

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          onSelect(file);
        }
        input.remove();
      };

      input.click();
    },
    []
  );

  const handleImportJSON = useCallback(
    (onImport: (data: ResumeData, meta: ImportedResumeMeta) => void) => {
      openFileDialog(
        (file) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const raw = JSON.parse(event.target?.result as string);
              const parsed = parseResumeJSON(raw);
              if (!parsed) {
                toast.error("Invalid resume file. Please export a resume first.");
                return;
              }
              onImport(parsed.data, parsed.meta);
              toast.success("Resume imported successfully!");
            } catch {
              toast.error("Failed to import resume. Invalid JSON file.");
            }
          };
          reader.readAsText(file);
        },
        { accept: ".json" }
      );
    },
    [openFileDialog]
  );

  return {
    openFileDialog,
    handleImportJSON,
  };
}
