/**
 * Error handling utilities
 * Provides type-safe error handling for catch blocks
 */

/**
 * Firebase error shape (common across Auth and Firestore)
 */
export interface FirebaseError extends Error {
  code?: string;
  customData?: Record<string, unknown>;
}

/**
 * Type guard to check if an error is a Firebase error
 */
export function isFirebaseError(error: unknown): error is FirebaseError {
  return (
    error instanceof Error &&
    typeof (error as FirebaseError).code === "string"
  );
}

/**
 * Extracts a FirebaseError from an unknown caught value
 * Use this in catch blocks to get type-safe access to error properties
 *
 * @example
 * ```ts
 * try {
 *   await someFirebaseOperation();
 * } catch (error) {
 *   const err = toFirebaseError(error);
 *   console.error("Error:", err.message);
 *   return { success: false, error: getErrorMessage(err.code) };
 * }
 * ```
 */
export function toFirebaseError(error: unknown): FirebaseError {
  if (isFirebaseError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return error as FirebaseError;
  }

  return new Error(String(error)) as FirebaseError;
}

/**
 * Gets the error message from an unknown error
 * Safe to use in catch blocks without type assertions
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Gets the error code from an unknown error (Firebase-specific)
 * Returns undefined if no code is present
 */
export function getErrorCode(error: unknown): string | undefined {
  if (isFirebaseError(error)) {
    return error.code;
  }
  return undefined;
}

/**
 * Creates a standardized error result for service methods
 */
export interface ErrorResult {
  success: false;
  error: string;
}

export interface SuccessResult<T = void> {
  success: true;
  data?: T;
}

export type ServiceResult<T = void> = SuccessResult<T> | ErrorResult;

/**
 * Creates an error result from a caught error
 */
export function createErrorResult(
  error: unknown,
  fallbackMessage = "An unexpected error occurred"
): ErrorResult {
  return {
    success: false,
    error: error instanceof Error ? error.message : fallbackMessage,
  };
}
