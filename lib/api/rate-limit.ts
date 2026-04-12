/**
 * Rate Limiting Utilities
 * Prevents API abuse with per-IP and per-user limits.
 *
 * Uses Vercel KV (Upstash) sliding-window limiters when the KV env vars are
 * present (production on Vercel).  Falls back to the in-memory `next-rate-limit`
 * approach for local development or environments without KV configured.
 */

import { NextRequest } from "next/server";
import { extractClientIp } from "./client-ip";

// ─────────────────────────────────────────────────────────────────────────────
// KV / Upstash distributed limiter (production)
// ─────────────────────────────────────────────────────────────────────────────

type DistributedLimiter = {
  limit(identifier: string): Promise<{ success: boolean; reset: number; remaining: number }>;
};

let kvLimiters:
  | {
      AI_user: DistributedLimiter;
      AI_ip: DistributedLimiter;
      GENERAL_user: DistributedLimiter;
      GENERAL_ip: DistributedLimiter;
      DOWNLOAD_user: DistributedLimiter;
      DOWNLOAD_ip: DistributedLimiter;
      ANALYTICS_user: DistributedLimiter;
      ANALYTICS_ip: DistributedLimiter;
      AUTH_user: DistributedLimiter;
      AUTH_ip: DistributedLimiter;
    }
  | undefined;

function isKvConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKvLimiters(): Promise<typeof kvLimiters> {
  if (!isKvConfigured()) return undefined;
  if (kvLimiters) return kvLimiters;

  const { kv } = await import("@vercel/kv");
  const { Ratelimit } = await import("@upstash/ratelimit");

  kvLimiters = {
    AI_user:        new Ratelimit({ redis: kv, limiter: Ratelimit.slidingWindow(15, "1 m") }),
    AI_ip:          new Ratelimit({ redis: kv, limiter: Ratelimit.slidingWindow(5,  "1 m") }),
    GENERAL_user:   new Ratelimit({ redis: kv, limiter: Ratelimit.slidingWindow(60, "1 m") }),
    GENERAL_ip:     new Ratelimit({ redis: kv, limiter: Ratelimit.slidingWindow(20, "1 m") }),
    DOWNLOAD_user:  new Ratelimit({ redis: kv, limiter: Ratelimit.slidingWindow(20, "1 m") }),
    DOWNLOAD_ip:    new Ratelimit({ redis: kv, limiter: Ratelimit.slidingWindow(10, "1 m") }),
    ANALYTICS_user: new Ratelimit({ redis: kv, limiter: Ratelimit.slidingWindow(30, "1 m") }),
    ANALYTICS_ip:   new Ratelimit({ redis: kv, limiter: Ratelimit.slidingWindow(30, "1 m") }),
    AUTH_user:      new Ratelimit({ redis: kv, limiter: Ratelimit.slidingWindow(10, "1 m") }),
    AUTH_ip:        new Ratelimit({ redis: kv, limiter: Ratelimit.slidingWindow(5,  "1 m") }),
  };

  return kvLimiters;
}

// ─────────────────────────────────────────────────────────────────────────────
// In-memory fallback (local dev / no KV)
// ─────────────────────────────────────────────────────────────────────────────

import rateLimit from "next-rate-limit";

const ipLimiter  = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });
const userLimiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 1000 });

// In-memory hourly tracking – not shared across serverless instances
const userHourlyRequests = new Map<string, { count: number; resetAt: number }>();

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

export const RATE_LIMITS = {
  AI: {
    ipRequestsPerMinute: 5,
    ipRequestsPerHour: 20,
    userRequestsPerMinute: 15,
    userRequestsPerHour: 100,
  },
  GENERAL: {
    ipRequestsPerMinute: 20,
    ipRequestsPerHour: 100,
    userRequestsPerMinute: 60,
    userRequestsPerHour: 500,
  },
  DOWNLOAD: {
    ipRequestsPerMinute: 10,
    ipRequestsPerHour: 30,
    userRequestsPerMinute: 20,
    userRequestsPerHour: 100,
  },
  ANALYTICS: {
    ipRequestsPerMinute: 30,
    ipRequestsPerHour: 200,
    userRequestsPerMinute: 30,
    userRequestsPerHour: 200,
  },
  AUTH: {
    ipRequestsPerMinute: 5,
    ipRequestsPerHour: 15,
    userRequestsPerMinute: 10,
    userRequestsPerHour: 30,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getClientIP(request: NextRequest): string {
  return extractClientIp(request);
}

function checkHourlyLimit(identifier: string, hourlyLimit: number): boolean {
  const now    = Date.now();
  const hourMs = 60 * 60 * 1000;
  const existing = userHourlyRequests.get(identifier);

  if (!existing || now >= existing.resetAt) {
    userHourlyRequests.set(identifier, { count: 1, resetAt: now + hourMs });
    return true;
  }

  if (existing.count >= hourlyLimit) return false;
  existing.count++;
  return true;
}

function getRateLimitHeaders(
  remaining: number,
  limit: number,
  resetTime: number
): Record<string, string> {
  return {
    "X-RateLimit-Limit":     String(limit),
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset":     String(Math.ceil(resetTime / 1000)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply rate limit to a request.
 * Uses Vercel KV sliding-window limiters when available; falls back to
 * in-memory limiters for local development.
 *
 * @throws Error if rate limit is exceeded
 */
export async function applyRateLimit(
  request: NextRequest,
  type: keyof typeof RATE_LIMITS = "GENERAL",
  userId?: string
): Promise<void> {
  const limits = RATE_LIMITS[type];
  const ip     = getClientIP(request);

  // ── Distributed path (KV configured) ───────────────────────────────────────
  const limiters = await getKvLimiters();
  if (limiters) {
    const limiterKey = userId
      ? (`${type}_user` as keyof typeof limiters)
      : (`${type}_ip`   as keyof typeof limiters);

    const identifier = userId ? `user:${userId}` : `ip:${ip}`;
    const limiter    = limiters[limiterKey] as DistributedLimiter;

    const result = await limiter.limit(identifier);
    if (!result.success) {
      const perMinute = userId ? limits.userRequestsPerMinute : limits.ipRequestsPerMinute;
      throw new Error(
        `Rate limit exceeded. Maximum ${perMinute} requests per minute.`
      );
    }
    return;
  }

  // ── In-memory fallback ──────────────────────────────────────────────────────

  // Periodically clean up expired entries (every ~100 requests)
  if (Math.random() < 0.01) {
    cleanupExpiredRateLimits();
  }

  if (userId) {
    const userIdentifier = `user:${userId}:${type}`;
    if (!checkHourlyLimit(userIdentifier, limits.userRequestsPerHour)) {
      throw new Error(
        `Rate limit exceeded. Maximum ${limits.userRequestsPerHour} requests per hour for authenticated users.`
      );
    }
    try {
      userLimiter.checkNext(request, limits.userRequestsPerMinute);
    } catch {
      throw new Error(
        `Rate limit exceeded. Maximum ${limits.userRequestsPerMinute} requests per minute for authenticated users.`
      );
    }
  } else {
    const ipIdentifier = `ip:${ip}:${type}`;
    if (!checkHourlyLimit(ipIdentifier, limits.ipRequestsPerHour)) {
      throw new Error(
        `Rate limit exceeded. Maximum ${limits.ipRequestsPerHour} requests per hour.`
      );
    }
    try {
      ipLimiter.checkNext(request, limits.ipRequestsPerMinute);
    } catch {
      throw new Error(
        `Rate limit exceeded. Maximum ${limits.ipRequestsPerMinute} requests per minute.`
      );
    }
  }
}

/**
 * Rate limit response helper — standardized 429 with Retry-After header.
 */
export function rateLimitResponse(error: Error) {
  return new Response(
    JSON.stringify({
      error: error.message,
      code: "RATE_LIMIT_EXCEEDED",
      details: { retryAfter: 60 },
      timestamp: new Date().toISOString(),
    }),
    {
      status: 429,
      headers: {
        "Content-Type":          "application/json",
        "Retry-After":           "60",
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}

/**
 * Clean up expired in-memory hourly rate limit entries.
 * Only relevant when KV is not configured.
 */
export function cleanupExpiredRateLimits(): void {
  const now = Date.now();
  for (const [key, value] of userHourlyRequests.entries()) {
    if (now >= value.resetAt) {
      userHourlyRequests.delete(key);
    }
  }
}

// Re-export for callers that imported getRateLimitHeaders
export { getRateLimitHeaders };
