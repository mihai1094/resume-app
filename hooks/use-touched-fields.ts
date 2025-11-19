"use client";

import { useState, useCallback } from 'react';

/**
 * Hook to track which form fields have been touched/interacted with.
 * Only shows validation errors for touched fields to improve UX.
 *
 * @returns Object with touched state, markTouched function, and getFieldError helper
 *
 * @example
 * const { touched, markTouched, getFieldError } = useTouchedFields();
 * const validationErrors = validatePersonalInfo(data);
 *
 * <FormField
 *   value={data.email}
 *   onChange={(val) => {
 *     onChange({ email: val });
 *     markTouched('email');
 *   }}
 *   onBlur={() => markTouched('email')}
 *   error={getFieldError(validationErrors, 'email')}
 * />
 */
export function useTouchedFields() {
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const markTouched = useCallback((field: string) => {
    setTouched((prev) => {
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  }, []);

  const markTouchedMultiple = useCallback((fields: string[]) => {
    setTouched((prev) => {
      const next = new Set(prev);
      fields.forEach((field) => next.add(field));
      return next;
    });
  }, []);

  const isTouched = useCallback((field: string) => {
    return touched.has(field);
  }, [touched]);

  const getFieldError = useCallback((
    validationErrors: Array<{ field: string; message: string }>,
    field: string
  ): string | undefined => {
    if (!isTouched(field)) {
      return undefined;
    }
    return validationErrors.find((e) => e.field === field)?.message;
  }, [isTouched]);

  const reset = useCallback(() => {
    setTouched(new Set());
  }, []);

  return {
    touched,
    markTouched,
    markTouchedMultiple,
    isTouched,
    getFieldError,
    reset,
  };
}

