"use client";

import { useState, useCallback } from "react";

export interface ConfirmationState {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  isDangerous?: boolean;
}

/**
 * Hook for managing confirmation dialogs
 * Provides a shared, accessible confirmation pattern instead of window.confirm
 */
export function useConfirmationDialog() {
  const [confirmationState, setConfirmationState] =
    useState<ConfirmationState | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const openConfirmation = useCallback(
    (
      title: string,
      description: string,
      onConfirm: () => void | Promise<void>,
      isDangerous = false
    ) => {
      setConfirmationState({
        isOpen: true,
        title,
        description,
        onConfirm,
        isDangerous,
      });
    },
    []
  );

  const closeConfirmation = useCallback(() => {
    setConfirmationState(null);
    setIsConfirming(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!confirmationState) return;
    setIsConfirming(true);
    try {
      const result = confirmationState.onConfirm();
      if (result instanceof Promise) {
        await result;
      }
    } finally {
      closeConfirmation();
    }
  }, [confirmationState, closeConfirmation]);

  return {
    confirmationState,
    openConfirmation,
    closeConfirmation,
    handleConfirm,
    isConfirming,
  };
}
