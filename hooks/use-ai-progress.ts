import { useState, useCallback, useRef, useEffect } from "react";
import {
  ProgressTracker,
  ProgressState,
  ProgressStage,
} from "@/lib/ai/progress-tracker";

export interface UseAiProgressOptions {
  stages: ProgressStage[];
  onComplete?: () => void;
  onCancel?: () => void;
}

/**
 * Hook to manage AI operation progress tracking with cancellation support
 */
export function useAiProgress(options: UseAiProgressOptions) {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const trackerRef = useRef<ProgressTracker | null>(null);

  // Create progress tracker
  const createTracker = useCallback(() => {
    const tracker = new ProgressTracker(options.stages, (state) => {
      setProgress(state);

      // Call onComplete when finished
      if (state.isComplete && options.onComplete) {
        options.onComplete();
      }

      // Call onCancel when cancelled
      if (state.isCancelled && options.onCancel) {
        options.onCancel();
      }
    });

    trackerRef.current = tracker;
    return tracker;
  }, [options]);

  // Start tracking
  const start = useCallback(() => {
    const tracker = createTracker();
    tracker.start();
    return tracker;
  }, [createTracker]);

  // Move to next stage
  const nextStage = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.nextStage();
    }
  }, []);

  // Complete tracking
  const complete = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.complete();
    }
  }, []);

  // Cancel tracking
  const cancel = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.cancel();
    }
  }, []);

  // Reset tracking
  const reset = useCallback(() => {
    setProgress(null);
    trackerRef.current = null;
  }, []);

  // Get abort signal for fetch requests
  const getSignal = useCallback((): AbortSignal | undefined => {
    return trackerRef.current?.getSignal();
  }, []);

  // Check if cancelled
  const isCancelled = useCallback((): boolean => {
    return trackerRef.current?.isCancelledOperation() || false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trackerRef.current) {
        trackerRef.current.cancel();
      }
    };
  }, []);

  const getTracker = () => trackerRef.current;

  return {
    progress,
    start,
    nextStage,
    complete,
    cancel,
    reset,
    getSignal,
    isCancelled,
    getTracker,
  };
}
