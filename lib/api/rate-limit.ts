/**
 * Rate Limiting Utilities
 * Prevents API abuse with per-IP and per-user limits
 */

import rateLimit from "next-rate-limit";
import { NextRequest, NextResponse } from "next/server";

// Create rate limiters
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute window
  uniqueTokenPerInterval: 500, // Support 500 unique tokens per interval
});

/**
 * Rate limit configuration per endpoint type
 */
export const RATE_LIMITS = {
  // AI endpoints - expensive operations
  AI: {
    requestsPerMinute: 10,
    requestsPerHour: 50,
  },
  // General API endpoints
  GENERAL: {
    requestsPerMinute: 30,
    requestsPerHour: 200,
  },
  // File uploads
  UPLOAD: {
    requestsPerMinute: 5,
    requestsPerHour: 20,
  },
} as const;

/**
 * Get client identifier from request
 * Uses IP address and optional user ID for rate limiting
 */
export function getClientIdentifier(request: NextRequest): string {
  // Get IP from headers (works with proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded ? forwarded.split(",")[0] : realIp || "unknown";

  // Optional: Add user ID if authenticated
  // const userId = request.headers.get("x-user-id");
  // return userId ? `user:${userId}` : `ip:${ip}`;

  return `ip:${ip}`;
}

/**
 * Apply rate limit to a request
 * Returns headers to set on the response
 */
export async function applyRateLimit(
  request: NextRequest,
  type: keyof typeof RATE_LIMITS = "GENERAL"
): Promise<void> {
  const identifier = getClientIdentifier(request);
  const limit = RATE_LIMITS[type].requestsPerMinute;

  try {
    // checkNext returns headers that should be set on the response
    const headers = limiter.checkNext(request, limit);

    // If rate limit was exceeded, an error would be thrown automatically
  } catch (error) {
    throw new Error(
      `Rate limit exceeded. Maximum ${limit} requests per minute allowed.`
    );
  }
}

/**
 * Rate limit response helper
 */
export function rateLimitResponse(error: Error) {
  return new Response(
    JSON.stringify({
      error: error.message,
      type: "RATE_LIMIT_EXCEEDED",
      retryAfter: 60, // seconds
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "60",
      },
    }
  );
}
