/**
 * Rate Limiting Utilities
 * Prevents API abuse with per-IP and per-user limits
 */

import rateLimit from "next-rate-limit";
import { NextRequest } from "next/server";

// Create rate limiters for IP-based limiting
const ipLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute window
  uniqueTokenPerInterval: 500, // Support 500 unique tokens per interval
});

// Create rate limiter for user-based limiting (separate pool)
const userLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute window
  uniqueTokenPerInterval: 1000, // More capacity for authenticated users
});

// In-memory store for tracking user requests (hourly limits)
// In production, use Redis or similar for distributed rate limiting
const userHourlyRequests = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limit configuration per endpoint type
 */
export const RATE_LIMITS = {
  // AI endpoints - expensive operations
  AI: {
    // IP-based limits (unauthenticated fallback)
    ipRequestsPerMinute: 5,
    ipRequestsPerHour: 20,
    // User-based limits (authenticated users get higher limits)
    userRequestsPerMinute: 15,
    userRequestsPerHour: 100,
  },
  // General API endpoints
  GENERAL: {
    ipRequestsPerMinute: 20,
    ipRequestsPerHour: 100,
    userRequestsPerMinute: 60,
    userRequestsPerHour: 500,
  },
  // File uploads
  UPLOAD: {
    ipRequestsPerMinute: 3,
    ipRequestsPerHour: 10,
    userRequestsPerMinute: 10,
    userRequestsPerHour: 50,
  },
} as const;

/**
 * Get client IP from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded ? forwarded.split(",")[0].trim() : realIp || "unknown";
}

/**
 * Check hourly rate limit for a user
 * @returns true if within limit, false if exceeded
 */
function checkHourlyLimit(identifier: string, hourlyLimit: number): boolean {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;

  const existing = userHourlyRequests.get(identifier);

  if (!existing || now >= existing.resetAt) {
    // Reset or create new entry
    userHourlyRequests.set(identifier, {
      count: 1,
      resetAt: now + hourMs,
    });
    return true;
  }

  if (existing.count >= hourlyLimit) {
    return false;
  }

  existing.count++;
  return true;
}

/**
 * Get rate limit headers for response
 */
function getRateLimitHeaders(
  remaining: number,
  limit: number,
  resetTime: number
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset": String(Math.ceil(resetTime / 1000)),
  };
}

/**
 * Apply rate limit to a request with user-level support
 * @param request - The incoming request
 * @param type - The type of endpoint for limit configuration
 * @param userId - Optional authenticated user ID for user-level limiting
 * @throws Error if rate limit is exceeded
 */
export async function applyRateLimit(
  request: NextRequest,
  type: keyof typeof RATE_LIMITS = "GENERAL",
  userId?: string
): Promise<void> {
  const limits = RATE_LIMITS[type];
  const ip = getClientIP(request);

  if (userId) {
    // User-level rate limiting (authenticated users)
    const userIdentifier = `user:${userId}:${type}`;
    const minuteLimit = limits.userRequestsPerMinute;
    const hourLimit = limits.userRequestsPerHour;

    // Check hourly limit first
    if (!checkHourlyLimit(userIdentifier, hourLimit)) {
      throw new Error(
        `Rate limit exceeded. Maximum ${hourLimit} requests per hour for authenticated users.`
      );
    }

    // Check per-minute limit
    try {
      userLimiter.checkNext(request, minuteLimit);
    } catch {
      throw new Error(
        `Rate limit exceeded. Maximum ${minuteLimit} requests per minute for authenticated users.`
      );
    }
  } else {
    // IP-level rate limiting (fallback for unauthenticated requests)
    const ipIdentifier = `ip:${ip}:${type}`;
    const minuteLimit = limits.ipRequestsPerMinute;
    const hourLimit = limits.ipRequestsPerHour;

    // Check hourly limit first
    if (!checkHourlyLimit(ipIdentifier, hourLimit)) {
      throw new Error(
        `Rate limit exceeded. Maximum ${hourLimit} requests per hour.`
      );
    }

    // Check per-minute limit
    try {
      ipLimiter.checkNext(request, minuteLimit);
    } catch {
      throw new Error(
        `Rate limit exceeded. Maximum ${minuteLimit} requests per minute.`
      );
    }
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
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}

/**
 * Clean up expired hourly rate limit entries
 * Call this periodically to prevent memory leaks
 */
export function cleanupExpiredRateLimits(): void {
  const now = Date.now();
  for (const [key, value] of userHourlyRequests.entries()) {
    if (now >= value.resetAt) {
      userHourlyRequests.delete(key);
    }
  }
}
