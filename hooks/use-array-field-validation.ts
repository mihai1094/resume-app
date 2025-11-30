"use client";

import { useCallback, useState } from "react";
import { ValidationError } from "@/lib/validation/resume-validation";

/**
 * Hook for managing validation in array-based forms (work experience, education, etc.)
 *
 * Centralizes the pattern of:
 * - Tracking touched fields with index-based keys
 * - Only showing errors for touched fields
 * - Matching validation errors by field path
 *
 * @param validationErrors - Array of validation errors from parent
 * @param fieldPrefix - The prefix for field paths (e.g., "experience", "education")
 *
 * @example
 * const { getFieldError, markFieldTouched } = useArrayFieldValidation(
 *   validationErrors,
 *   "experience"
 * );
 *
 * <FormField
 *   error={getFieldError(0, "company")} // Only shows if touched
 *   onBlur={() => markFieldTouched(0, "company")}
 * />
 */
export function useArrayFieldValidation(
  validationErrors: ValidationError[],
  fieldPrefix: string
) {
  const [touched, setTouched] = useState<Set<string>>(new Set());

  /**
   * Mark a field as touched (user has interacted with it)
   */
  const markFieldTouched = useCallback(
    (index: number, field: string) => {
      const key = `${fieldPrefix}.${index}.${field}`;
      setTouched((prev) => {
        if (prev.has(key)) return prev;
        const next = new Set(prev);
        next.add(key);
        return next;
      });
    },
    [fieldPrefix]
  );

  /**
   * Check if a field has been touched
   */
  const isFieldTouched = useCallback(
    (index: number, field: string): boolean => {
      return touched.has(`${fieldPrefix}.${index}.${field}`);
    },
    [fieldPrefix, touched]
  );

  /**
   * Get validation error for a field (only if touched)
   * Handles both exact field matches and date field aliases
   */
  const getFieldError = useCallback(
    (index: number, field: string): string | undefined => {
      const key = `${fieldPrefix}.${index}.${field}`;

      // Only show errors for touched fields
      if (!touched.has(key)) {
        return undefined;
      }

      // Find matching validation error
      // Handle date field aliases (startDate/endDate -> dates)
      const error = validationErrors.find((err) => {
        if (err.field === key) return true;
        // Handle date fields that might be validated as a single "dates" field
        if (["startDate", "endDate", "dates"].includes(field)) {
          return err.field === `${fieldPrefix}.${index}.dates`;
        }
        return false;
      });

      return error?.message;
    },
    [fieldPrefix, touched, validationErrors]
  );

  /**
   * Mark all fields for an item as touched (useful for submit validation)
   */
  const markAllFieldsTouched = useCallback(
    (index: number, fields: string[]) => {
      setTouched((prev) => {
        const next = new Set(prev);
        fields.forEach((field) => {
          next.add(`${fieldPrefix}.${index}.${field}`);
        });
        return next;
      });
    },
    [fieldPrefix]
  );

  /**
   * Reset touched state (useful when removing items)
   */
  const reset = useCallback(() => {
    setTouched(new Set());
  }, []);

  return {
    getFieldError,
    markFieldTouched,
    isFieldTouched,
    markAllFieldsTouched,
    reset,
  };
}
