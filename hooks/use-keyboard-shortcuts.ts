"use client";

import { useEffect, useCallback } from "react";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Cmd on Mac
  handler: (e: KeyboardEvent) => void;
  preventDefault?: boolean;
}

/**
 * Hook for managing keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Guard against undefined key
      if (!e.key) return;

      shortcuts.forEach((shortcut) => {
        const ctrlMatch = shortcut.ctrl
          ? e.ctrlKey || e.metaKey
          : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.handler(e);
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts]);
}

/**
 * Common keyboard shortcuts for the resume editor
 */
export function useResumeEditorShortcuts({
  onSave,
  onUndo,
  onRedo,
  onExportPDF,
  onExportJSON,
  onNext,
  onPrevious,
}: {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onExportPDF?: () => void;
  onExportJSON?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}) {
  useKeyboardShortcuts([
    {
      key: "s",
      ctrl: true,
      handler: () => {
        onSave?.();
      },
      preventDefault: true,
    },
    {
      key: "z",
      ctrl: true,
      shift: false,
      handler: () => {
        onUndo?.();
      },
      preventDefault: true,
    },
    {
      key: "z",
      ctrl: true,
      shift: true,
      handler: () => {
        onRedo?.();
      },
      preventDefault: true,
    },
    {
      key: "y",
      ctrl: true,
      handler: () => {
        onRedo?.();
      },
      preventDefault: true,
    },
    {
      key: "p",
      ctrl: true,
      handler: () => {
        onExportPDF?.();
      },
      preventDefault: true,
    },
    {
      key: "e",
      ctrl: true,
      handler: () => {
        onExportJSON?.();
      },
      preventDefault: true,
    },
    {
      key: "Enter",
      handler: (e) => {
        // Don't trigger if typing in an input/textarea or contenteditable
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement)?.isContentEditable
        ) {
          return;
        }
        onNext?.();
      },
      preventDefault: false, // Let the event bubble unless handled
    },
    {
      key: "Backspace",
      handler: (e) => {
        // Don't trigger if typing in an input/textarea or contenteditable
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement)?.isContentEditable
        ) {
          return;
        }
        onPrevious?.();
      },
      preventDefault: false,
    },
  ]);
}
