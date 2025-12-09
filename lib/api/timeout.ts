/**
 * Request Timeout Utilities
 * Implements timeouts for AI API calls with proper error handling
 */

/**
 * Timeout duration in milliseconds
 */
export const TIMEOUT_DURATION = 15000; // 15 seconds

/**
 * Timeout error class
 */
export class TimeoutError extends Error {
  constructor(message = "Request timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * Execute a promise with a timeout
 * @param promise - Promise to execute
 * @param timeoutMs - Timeout in milliseconds (default: 15s)
 * @returns Promise result or throws TimeoutError
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = TIMEOUT_DURATION
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(
        `Request timed out after ${timeoutMs / 1000} seconds`
      ));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Create a timeout response helper
 */
export function timeoutResponse(error: TimeoutError) {
  return new Response(
    JSON.stringify({
      error: error.message,
      type: "TIMEOUT",
      suggestion: "Please try again. The AI service may be experiencing high load.",
    }),
    {
      status: 504, // Gateway Timeout
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Retry a function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries (default: 2)
 * @param baseDelay - Base delay in milliseconds (default: 1000)
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on timeout errors or final attempt
      if (error instanceof TimeoutError || attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
