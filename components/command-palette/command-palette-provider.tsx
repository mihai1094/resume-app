"use client";

import { ReactNode, useCallback, useEffect } from "react";
import {
  useCommandPalette,
  CommandPaletteContext,
} from "@/hooks/use-command-palette";
import { CommandPalette } from "./command-palette";
import { AICommand } from "@/lib/constants/ai-commands";

interface CommandPaletteProviderProps {
  children: ReactNode;
  /** Callback when a command is executed */
  onCommandExecute?: (command: AICommand, context: { fieldId?: string; value?: string } | null) => void;
  /** Whether a job description is set */
  hasJD?: boolean;
}

export function CommandPaletteProvider({
  children,
  onCommandExecute,
  hasJD = false,
}: CommandPaletteProviderProps) {
  const palette = useCommandPalette();
  const { setHasJD, setOnCommandExecute } = palette;

  // Set JD state whenever it changes
  useEffect(() => {
    setHasJD(hasJD);
  }, [hasJD, setHasJD]);

  // Set command execute callback
  const handleCommandExecute = useCallback(
    (command: AICommand, field: { context?: string; fieldId?: string; value?: string } | null) => {
      if (onCommandExecute) {
        onCommandExecute(command, field ? { fieldId: field.fieldId, value: field.value } : null);
      }
    },
    [onCommandExecute]
  );

  // Register the callback
  useEffect(() => {
    setOnCommandExecute(handleCommandExecute);
  }, [handleCommandExecute, setOnCommandExecute]);

  return (
    <CommandPaletteContext.Provider value={palette}>
      {children}
      <CommandPalette />
    </CommandPaletteContext.Provider>
  );
}
