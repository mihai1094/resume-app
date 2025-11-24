"use client";

import { useState, useCallback } from 'react';

/**
 * Hook for real-time field validation
 *
 * @param validator - A function that takes a value and returns an error message or null
 * @returns Object with error state, validate function, and setError function
 *
 * @example
 * const { error, validate } = useFieldValidation(validators.email);
 *
 * <FormField
 *   value={email}
 *   onChange={(val) => {
 *     setEmail(val);
 *     validate(val);
 *   }}
 *   error={error}
 * />
 */
export function useFieldValidation<T = unknown>(
  validator: (value: T) => string | null
) {
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback((value: T) => {
    const errorMsg = validator(value);
    setError(errorMsg);
    return errorMsg === null;
  }, [validator]);

  return { error, validate, setError };
}

