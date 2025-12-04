"use client";

import { useCallback, useState } from "react";

/**
 * Hook for managing validation in simple (non-array) forms
 *
 * Tracks touched fields and only shows errors for fields the user has interacted with.
 *
 * @param validationErrors - Array of validation errors with field names
 *
 * @example
 * const { getFieldError, markTouched } = useSimpleFieldValidation(validationErrors);
 *
 * <FormField
 *   error={getFieldError("email")} // Only shows if touched
 *   onBlur={() => markTouched("email")}
 * />
 */
export function useSimpleFieldValidation(
  validationErrors: Array<{ field: string; message: string }>
) {
  const [touched, setTouched] = useState<Set<string>>(new Set());

  /**
   * Mark a field as touched (user has interacted with it)
   */
  const markTouched = useCallback((field: string) => {
    setTouched((prev) => {
      if (prev.has(field)) return prev;
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  }, []);

  /**
   * Check if a field has been touched
   */
  const isTouched = useCallback(
    (field: string): boolean => {
      return touched.has(field);
    },
    [touched]
  );

  /**
   * Get validation error for a field (only if touched)
   */
  const getFieldError = useCallback(
    (field: string): string | undefined => {
      // Only show errors for touched fields
      if (!touched.has(field)) {
        return undefined;
      }

      const error = validationErrors.find((err) => err.field === field);
      return error?.message;
    },
    [touched, validationErrors]
  );

  /**
   * Mark multiple fields as touched (useful for submit validation)
   */
  const markAllTouched = useCallback((fields: string[]) => {
    setTouched((prev) => {
      const next = new Set(prev);
      fields.forEach((field) => next.add(field));
      return next;
    });
  }, []);

  /**
   * Reset touched state
   */
  const reset = useCallback(() => {
    setTouched(new Set());
  }, []);

  return {
    getFieldError,
    markTouched,
    isTouched,
    markAllTouched,
    reset,
  };
}

