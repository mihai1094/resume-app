/**
 * Centralized API error handling utilities
 * Provides consistent error responses across all API routes
 */

import { NextResponse } from "next/server";
import {
  ApiError,
  AuthError,
  ValidationError,
  AIServiceError,
  RateLimitError,
  CreditError,
  isApiError,
  getErrorMessage,
  getErrorCode,
} from "@/lib/types/errors";
import { logger } from "@/lib/services/logger";

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
  timestamp?: string;
}

/**
 * Convert an error to an appropriate HTTP status code
 */
function getStatusCode(error: unknown): number {
  if (isApiError(error)) {
    return error.statusCode;
  }

  if (error instanceof AuthError) {
    return 401;
  }

  if (error instanceof ValidationError) {
    return 400;
  }

  if (error instanceof AIServiceError) {
    // Check for specific AI error types
    const message = getErrorMessage(error);
    if (message.includes("quota")) return 429;
    if (message.includes("timeout")) return 504;
    return 503; // Service unavailable
  }

  // Default to 500 for unknown errors
  return 500;
}

/**
 * Main error handler for API routes
 * Converts errors to consistent NextResponse format
 *
 * @param error - The error to handle
 * @param context - Optional context for logging
 * @returns NextResponse with appropriate status code and error message
 *
 * @example
 * ```ts
 * try {
 *   // API logic
 * } catch (error) {
 *   return handleApiError(error, { module: 'AI', action: 'generate-bullets' });
 * }
 * ```
 */
export function handleApiError(
  error: unknown,
  context?: { module?: string; action?: string }
): NextResponse<ApiErrorResponse> {
  const statusCode = getStatusCode(error);
  const message = getErrorMessage(error);
  const code = getErrorCode(error);

  // Log the error with appropriate level
  if (statusCode >= 500) {
    logger.error(message, error, context);
  } else if (statusCode >= 400) {
    logger.warn(message, { ...context, code });
  }

  // Build error response
  const response: ApiErrorResponse = {
    error: message,
    code,
    timestamp: new Date().toISOString(),
  };

  // Add additional details for specific error types
  if (error instanceof ValidationError && error.fields) {
    response.details = { fields: error.fields };
  }

  if (error instanceof RateLimitError && error.retryAfter) {
    response.details = { retryAfter: error.retryAfter };
  }

  if (error instanceof CreditError) {
    response.details = {
      required: error.required,
      available: error.available,
    };
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === "development" && error instanceof Error) {
    response.details = {
      ...(typeof response.details === "object" && response.details !== null
        ? response.details
        : {}),
      stack: error.stack,
    };
  }

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Create a validation error response
 */
export function validationError(
  message: string,
  fields?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  return handleApiError(new ValidationError(message, fields));
}

/**
 * Create an authentication error response
 */
export function authError(
  message: string = "Authentication required"
): NextResponse<ApiErrorResponse> {
  return handleApiError(new AuthError(message));
}

/**
 * Create a rate limit error response
 */
export function rateLimitError(
  retryAfter?: number
): NextResponse<ApiErrorResponse> {
  return handleApiError(new RateLimitError(undefined, retryAfter));
}

/**
 * Create a credit error response
 */
export function creditError(
  required?: number,
  available?: number
): NextResponse<ApiErrorResponse> {
  return handleApiError(new CreditError(undefined, required, available));
}

/**
 * Create a generic API error response
 */
export function apiError(
  statusCode: number,
  message: string,
  code?: string
): NextResponse<ApiErrorResponse> {
  return handleApiError(new ApiError(statusCode, message, code));
}
