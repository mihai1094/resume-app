"use client";

import { useCallback } from "react";
import { ResumeData } from "@/lib/types/resume";
import { toast } from "sonner";

export interface FileDialogOptions {
  accept?: string;
  multiple?: boolean;
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
    (onImport: (data: ResumeData) => void) => {
      openFileDialog(
        (file) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target?.result as string);
              onImport(data);
              toast.success("Resume imported successfully!");
            } catch (error) {
              toast.error("Failed to import resume. Invalid file.");
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
