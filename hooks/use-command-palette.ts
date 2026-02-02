"use client";

import React, { useState, useCallback, useEffect, useRef, createContext, useContext } from "react";
import {
  AICommand,
  CommandContext,
  getCommandsForContext,
} from "@/lib/constants/ai-commands";

interface FocusedField {
  context: CommandContext;
  sectionId?: string;
  fieldId?: string;
  value?: string;
}

interface CommandPaletteState {
  isOpen: boolean;
  focusedField: FocusedField | null;
  hasJD: boolean;
  searchQuery: string;
}

interface UseCommandPaletteReturn {
  /** Whether the palette is open */
  isOpen: boolean;
  /** Open the command palette */
  open: () => void;
  /** Close the command palette */
  close: () => void;
  /** Toggle the palette */
  toggle: () => void;
  /** Current search query */
  searchQuery: string;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Register a field as focused (for context-aware commands) */
  registerFocusedField: (field: FocusedField | null) => void;
  /** Current focused field */
  focusedField: FocusedField | null;
  /** Set whether JD is available */
  setHasJD: (hasJD: boolean) => void;
  /** Available commands based on current context */
  availableCommands: AICommand[];
  /** Execute a command */
  executeCommand: (command: AICommand) => void;
  /** Currently selected command index */
  selectedIndex: number;
  /** Set selected index */
  setSelectedIndex: (index: number) => void;
  /** Set callback for command execution */
  setOnCommandExecute: (
    callback: ((command: AICommand, field: FocusedField | null) => void) | null
  ) => void;
}

/**
 * Hook for managing the command palette state
 */
export function useCommandPalette(): UseCommandPaletteReturn {
  const [state, setState] = useState<CommandPaletteState>({
    isOpen: false,
    focusedField: null,
    hasJD: false,
    searchQuery: "",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const onCommandExecuteRef = useRef<
    ((command: AICommand, field: FocusedField | null) => void) | null
  >(null);

  // Get available commands based on context
  const availableCommands = getCommandsForContext(
    state.focusedField?.context || null,
    state.hasJD
  ).filter((cmd) => {
    if (!state.searchQuery) return true;
    const query = state.searchQuery.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query)
    );
  });

  // Reset selected index when commands or search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [state.searchQuery, state.focusedField?.context]);

  const open = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true, searchQuery: "" }));
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false, searchQuery: "" }));
    setSelectedIndex(0);
  }, []);

  const toggle = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
      searchQuery: prev.isOpen ? "" : prev.searchQuery,
    }));
    setSelectedIndex(0);
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const registerFocusedField = useCallback((field: FocusedField | null) => {
    setState((prev) => ({ ...prev, focusedField: field }));
  }, []);

  const setHasJD = useCallback((hasJD: boolean) => {
    setState((prev) => ({ ...prev, hasJD }));
  }, []);

  const executeCommand = useCallback(
    (command: AICommand) => {
      close();
      if (onCommandExecuteRef.current) {
        onCommandExecuteRef.current(command, state.focusedField);
      }
    },
    [close, state.focusedField]
  );

  const setOnCommandExecute = useCallback(
    (callback: ((command: AICommand, field: FocusedField | null) => void) | null) => {
      onCommandExecuteRef.current = callback;
    },
    []
  );

  // Keyboard shortcuts for Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to toggle
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
      // Escape to close
      if (e.key === "Escape" && state.isOpen) {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle, close, state.isOpen]);

  return React.useMemo(() => ({
    isOpen: state.isOpen,
    open,
    close,
    toggle,
    searchQuery: state.searchQuery,
    setSearchQuery,
    registerFocusedField,
    focusedField: state.focusedField,
    setHasJD,
    availableCommands,
    executeCommand,
    selectedIndex,
    setSelectedIndex,
    setOnCommandExecute,
  }), [
    state.isOpen,
    open,
    close,
    toggle,
    state.searchQuery,
    setSearchQuery,
    registerFocusedField,
    state.focusedField,
    setHasJD,
    availableCommands,
    executeCommand,
    selectedIndex,
    setSelectedIndex,
    setOnCommandExecute,
  ]);
}

// Context for sharing command palette state
export interface CommandPaletteContextValue extends UseCommandPaletteReturn {}

export const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

/**
 * Hook to access command palette from context
 */
export function useCommandPaletteContext(): CommandPaletteContextValue {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error("useCommandPaletteContext must be used within CommandPaletteProvider");
  }
  return context;
}
