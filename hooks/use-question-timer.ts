import { useState, useCallback, useEffect, useRef } from "react";

interface UseQuestionTimerProps {
  /** Whether the timer is enabled */
  enabled: boolean;
  /** Duration in minutes */
  durationMinutes: number;
  /** Callback when time is up */
  onTimeUp?: () => void;
}

interface UseQuestionTimerReturn {
  /** Time remaining in seconds */
  timeRemaining: number;
  /** Whether the timer is currently running */
  isRunning: boolean;
  /** Whether the timer has expired */
  isExpired: boolean;
  /** Formatted time string (e.g., "2:30") */
  formattedTime: string;
  /** Percentage of time remaining (0-100) */
  percentageRemaining: number;
  /** Start the timer */
  start: () => void;
  /** Pause the timer */
  pause: () => void;
  /** Reset the timer to initial duration */
  reset: () => void;
  /** Add extra time (in seconds) */
  addTime: (seconds: number) => void;
}

/**
 * Hook for managing a countdown timer for interview questions
 */
export function useQuestionTimer({
  enabled,
  durationMinutes,
  onTimeUp,
}: UseQuestionTimerProps): UseQuestionTimerReturn {
  const totalSeconds = durationMinutes * 60;
  const [timeRemaining, setTimeRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep callback ref updated
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer tick effect
  useEffect(() => {
    if (!enabled || !isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          // Call onTimeUp callback
          onTimeUpRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, isRunning]);

  // Reset timer when duration changes
  useEffect(() => {
    setTimeRemaining(totalSeconds);
    setIsRunning(false);
  }, [totalSeconds]);

  const start = useCallback(() => {
    if (enabled && timeRemaining > 0) {
      setIsRunning(true);
    }
  }, [enabled, timeRemaining]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setTimeRemaining(totalSeconds);
    setIsRunning(false);
  }, [totalSeconds]);

  const addTime = useCallback((seconds: number) => {
    setTimeRemaining((prev) => prev + seconds);
  }, []);

  // Format time as "M:SS"
  const formattedTime = (() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  })();

  const percentageRemaining = totalSeconds > 0
    ? Math.round((timeRemaining / totalSeconds) * 100)
    : 0;

  const isExpired = timeRemaining === 0;

  return {
    timeRemaining,
    isRunning,
    isExpired,
    formattedTime,
    percentageRemaining,
    start,
    pause,
    reset,
    addTime,
  };
}
