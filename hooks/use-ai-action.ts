"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { trackAiEvent } from "@/lib/ai/telemetry";

export type AiActionStatus = "idle" | "running" | "ready" | "applied" | "error";

export interface UseAiActionOptions<T> {
  actionName: string;
  surface: string;
  perform?: () => Promise<T>;
  onApply?: (value: T) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

type HistoryEntry<T> = {
  value: T;
  timestamp: number;
};

/**
 * Centralized AI action state: run → stage → apply → undo.
 */
export function useAiAction<T>(options: UseAiActionOptions<T>) {
  const [status, setStatus] = useState<AiActionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<T | null>(null);
  const historyRef = useRef<HistoryEntry<T>[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const showToast = options.showToast ?? true;

  const track = (event: Parameters<typeof trackAiEvent>[0], payload: object = {}) =>
    trackAiEvent(event, {
      surface: options.surface,
      action: options.actionName,
      ...(payload as Record<string, unknown>),
    });

  const run = useCallback(
    async (performOverride?: () => Promise<T>) => {
      const perform = performOverride || options.perform;
      if (!perform) {
        throw new Error("No perform function provided to useAiAction");
      }

      setStatus("running");
      setError(null);
      startTimeRef.current = Date.now();
      track("trigger");

      try {
        const result = await perform();
        setSuggestion(result);
        setStatus("ready");
        const duration = startTimeRef.current
          ? Date.now() - startTimeRef.current
          : undefined;
        track("success", { durationMs: duration });
        if (showToast) {
          toast.success("AI suggestion ready");
        }
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "AI action failed";
        setError(message);
        setStatus("error");
        const duration = startTimeRef.current
          ? Date.now() - startTimeRef.current
          : undefined;
        track("failure", { durationMs: duration, error: message });
        options.onError?.(err as Error);
        if (showToast) {
          toast.error(message);
        }
        return null;
      }
    },
    [options, showToast, track]
  );

  const apply = useCallback(
    (previousValue?: T) => {
      if (!suggestion) return false;

      if (typeof previousValue !== "undefined") {
        historyRef.current = [
          ...historyRef.current,
          { value: previousValue, timestamp: Date.now() },
        ];
        setHistoryVersion((version) => version + 1);
      }

      options.onApply?.(suggestion);
      setStatus("applied");
      track("apply");
      if (showToast) {
        toast.success("Applied AI suggestion");
      }
      return true;
    },
    [suggestion, options, showToast, track]
  );

  const undo = useCallback(() => {
    const last = historyRef.current.at(-1);
    if (!last) return false;

    historyRef.current = historyRef.current.slice(0, -1);
    setHistoryVersion((version) => version + 1);
    options.onApply?.(last.value);
    setStatus("ready");
    track("undo");
    if (showToast) {
      toast.info("Reverted to previous version");
    }
    return true;
  }, [options, showToast, track]);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setSuggestion(null);
    historyRef.current = [];
    startTimeRef.current = null;
    setHistoryVersion((version) => version + 1);
  }, []);

  const hasSuggestion = useMemo(() => !!suggestion, [suggestion]);
  const canUndo = useMemo(
    () => historyRef.current.length > 0,
    [historyVersion]
  );

  const statusLabel = useMemo(() => {
    switch (status) {
      case "running":
        return "Thinking…";
      case "ready":
        return "Ready to apply";
      case "applied":
        return "Applied";
      case "error":
        return "Error";
      default:
        return "Idle";
    }
  }, [status]);

  return {
    status,
    statusLabel,
    isRunning: status === "running",
    suggestion,
    error,
    hasSuggestion,
    canUndo,
    run,
    apply,
    undo,
    reset,
    setSuggestion,
  };
}

