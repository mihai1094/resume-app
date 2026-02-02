/**
 * Centralized error type definitions for the application
 * Provides a consistent error hierarchy for better error handling
 */

/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
        public readonly cause?: unknown
    ) {
        super(message);
        this.name = this.constructor.name;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * API-related errors with HTTP status codes
 */
export class ApiError extends AppError {
    constructor(
        public readonly statusCode: number,
        message: string,
        code?: string,
        cause?: unknown
    ) {
        super(message, code, cause);
    }
}

/**
 * Authentication and authorization errors
 */
export class AuthError extends AppError {
    constructor(message: string, code?: string, cause?: unknown) {
        super(message, code, cause);
    }
}

/**
 * Validation errors for user input
 */
export class ValidationError extends AppError {
    constructor(
        message: string,
        public readonly fields?: Record<string, string[]>,
        cause?: unknown
    ) {
        super(message, "VALIDATION_ERROR", cause);
    }
}

/**
 * Firestore/database operation errors
 */
export class DatabaseError extends AppError {
    constructor(message: string, code?: string, cause?: unknown) {
        super(message, code, cause);
    }
}

/**
 * AI service errors (quota, timeout, etc.)
 */
export class AIServiceError extends AppError {
    constructor(
        message: string,
        public readonly retryable: boolean = false,
        code?: string,
        cause?: unknown
    ) {
        super(message, code, cause);
    }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends ApiError {
    constructor(
        message: string = "Too many requests. Please try again later.",
        public readonly retryAfter?: number,
        cause?: unknown
    ) {
        super(429, message, "RATE_LIMIT_EXCEEDED", cause);
    }
}

/**
 * Credit/quota errors
 */
export class CreditError extends ApiError {
    constructor(
        message: string = "Insufficient credits for this operation.",
        public readonly required?: number,
        public readonly available?: number,
        cause?: unknown
    ) {
        super(402, message, "INSUFFICIENT_CREDITS", cause);
    }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

/**
 * Type guard to check if an error is a standard Error
 */
export function isError(error: unknown): error is Error {
    return error instanceof Error;
}

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
    if (isError(error)) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    if (error && typeof error === "object" && "message" in error) {
        return String(error.message);
    }
    return "An unknown error occurred";
}

/**
 * Safely extract error code from unknown error type
 */
export function getErrorCode(error: unknown): string | undefined {
    if (isAppError(error)) {
        return error.code;
    }
    if (error && typeof error === "object" && "code" in error) {
        return String(error.code);
    }
    return undefined;
}
