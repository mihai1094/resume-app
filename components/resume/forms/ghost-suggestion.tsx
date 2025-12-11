"use client";

import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GhostSuggestionProps {
  /** The suggested text */
  suggestion: string | null;
  /** Whether suggestion is loading */
  isLoading: boolean;
  /** Whether suggestion is visible */
  isVisible: boolean;
  /** Called when user accepts (Tab) */
  onAccept: () => void;
  /** Called when user dismisses (Escape) */
  onDismiss: () => void;
  /** Class name for positioning */
  className?: string;
}

/**
 * Ghost suggestion UI component.
 * Shows AI suggestion below an input with Tab to accept.
 */
export function GhostSuggestion({
  suggestion,
  isLoading,
  isVisible,
  onAccept,
  onDismiss,
  className,
}: GhostSuggestionProps) {
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isVisible && !isLoading) return;

      if (e.key === "Tab" && isVisible && suggestion) {
        e.preventDefault();
        onAccept();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onDismiss();
      }
    },
    [isVisible, isLoading, suggestion, onAccept, onDismiss]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Don't render if nothing to show
  if (!isLoading && !isVisible) return null;

  return (
    <div
      className={cn(
        "mt-2 p-3 rounded-lg border bg-muted/50 animate-in fade-in-50 slide-in-from-top-2 duration-200",
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Getting AI suggestion...</span>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-foreground leading-relaxed flex-1">
              {suggestion}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={onDismiss}
              aria-label="Dismiss suggestion"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px] font-mono">
                Tab
              </kbd>
              <span>to accept</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px] font-mono">
                Esc
              </kbd>
              <span>to dismiss</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Inline ghost text that appears after the current text.
 * Alternative presentation for ghost suggestions.
 */
interface InlineGhostTextProps {
  /** Original text */
  originalText: string;
  /** Full suggested text */
  suggestion: string | null;
  /** Whether visible */
  isVisible: boolean;
}

export function InlineGhostText({
  originalText,
  suggestion,
  isVisible,
}: InlineGhostTextProps) {
  if (!isVisible || !suggestion) return null;

  // Find the difference between original and suggestion
  const diff = suggestion.startsWith(originalText)
    ? suggestion.slice(originalText.length)
    : ` → ${suggestion}`;

  return (
    <span className="text-muted-foreground/50 italic pointer-events-none">
      {diff}
    </span>
  );
}
