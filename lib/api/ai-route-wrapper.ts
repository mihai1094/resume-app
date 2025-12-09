/**
 * AI Route Wrapper
 * Standardized wrapper for all AI API routes with security features
 */

import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, rateLimitResponse } from "./rate-limit";
import { withTimeout, TimeoutError, timeoutResponse } from "./timeout";
import { z } from "zod";

export interface AIRouteOptions {
  /** Enable rate limiting (default: true) */
  rateLimit?: boolean;
  /** Timeout in milliseconds (default: 15000) */
  timeout?: number;
  /** Validation schema for request body */
  schema?: z.ZodSchema;
}

/**
 * Wrap an AI route handler with security features
 * - Rate limiting
 * - Timeout handling
 * - Error handling with retry info
 * - Input validation
 */
export function withAIRoute<T = any>(
  handler: (request: NextRequest, body: T) => Promise<any>,
  options: AIRouteOptions = {}
) {
  const {
    rateLimit: enableRateLimit = true,
    timeout = 15000,
    schema,
  } = options;

  return async function (request: NextRequest) {
    try {
      // 1. Rate limiting
      if (enableRateLimit) {
        try {
          await applyRateLimit(request, "AI");
        } catch (error) {
          return rateLimitResponse(error as Error);
        }
      }

      // 2. Parse request body
      let body: T;
      try {
        body = await request.json();
      } catch (error) {
        return NextResponse.json(
          {
            error: "Invalid JSON in request body",
            type: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }

      // 3. Validate request body if schema provided
      if (schema) {
        try {
          body = schema.parse(body) as T;
        } catch (error) {
          return NextResponse.json(
            {
              error: "Invalid request data",
              type: "VALIDATION_ERROR",
              details: error instanceof z.ZodError ? error.issues : undefined,
            },
            { status: 400 }
          );
        }
      }

      // 4. Execute handler with timeout
      const result = await withTimeout(
        handler(request, body),
        timeout
      );

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      console.error("[AI Route] Error:", error);

      // Handle timeout errors
      if (error instanceof TimeoutError) {
        return timeoutResponse(error);
      }

      // Handle quota errors
      if (error instanceof Error && error.message.includes("quota")) {
        return NextResponse.json(
          {
            error: "AI service quota exceeded. Please try again in a few moments.",
            type: "QUOTA_EXCEEDED",
            retryable: true,
          },
          { status: 429 }
        );
      }

      // Handle validation errors
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            type: "VALIDATION_ERROR",
            details: error.issues,
          },
          { status: 400 }
        );
      }

      // Generic error
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred. Please try again.",
          type: "SERVER_ERROR",
          retryable: true,
          details: process.env.NODE_ENV === "development" ? String(error) : undefined,
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Error response with retry information
 */
export function errorResponse(
  message: string,
  type: string,
  status: number = 500,
  retryable: boolean = true
) {
  return NextResponse.json(
    {
      error: message,
      type,
      retryable,
    },
    { status }
  );
}
