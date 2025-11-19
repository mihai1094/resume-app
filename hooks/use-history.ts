"use client";

import { useState, useCallback, useRef } from "react";

/**
 * Hook for managing undo/redo history
 * @template T - The type of state being managed
 */
export function useHistory<T>(initialState: T, maxHistorySize: number = 50) {
  const [currentState, setCurrentState] = useState<T>(initialState);
  const [history, setHistory] = useState<T[]>([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoingRef = useRef(false);
  const isRedoingRef = useRef(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const pushToHistory = useCallback(
    (newState: T) => {
      if (isUndoingRef.current || isRedoingRef.current) {
        return;
      }

      setHistory((prev) => {
        // Remove any future history if we're not at the end
        const newHistory = prev.slice(0, historyIndex + 1);
        // Add new state
        newHistory.push(newState);
        // Limit history size
        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
          return newHistory;
        }
        return newHistory;
      });

      setHistoryIndex((prev) => {
        const newIndex = prev + 1;
        // If we've hit the max size, we stay at the same relative position
        return Math.min(newIndex, maxHistorySize - 1);
      });
    },
    [historyIndex, maxHistorySize]
  );

  const undo = useCallback(() => {
    if (!canUndo) return;

    isUndoingRef.current = true;
    setHistoryIndex((prev) => {
      const newIndex = prev - 1;
      const newState = history[newIndex];
      setCurrentState(newState);
      return newIndex;
    });
    setTimeout(() => {
      isUndoingRef.current = false;
    }, 0);
  }, [canUndo, history]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    isRedoingRef.current = true;
    setHistoryIndex((prev) => {
      const newIndex = prev + 1;
      const newState = history[newIndex];
      setCurrentState(newState);
      return newIndex;
    });
    setTimeout(() => {
      isRedoingRef.current = false;
    }, 0);
  }, [canRedo, history]);

  const updateState = useCallback(
    (newState: T) => {
      setCurrentState(newState);
      pushToHistory(newState);
    },
    [pushToHistory]
  );

  const reset = useCallback((newState: T) => {
    setCurrentState(newState);
    setHistory([newState]);
    setHistoryIndex(0);
  }, []);

  return {
    state: currentState,
    updateState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  };
}

