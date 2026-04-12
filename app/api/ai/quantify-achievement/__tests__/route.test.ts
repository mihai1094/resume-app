// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { makeRequest } from "@/tests/mocks/next";

const {
  mockVerifyAuth,
  mockApplyRateLimit,
  mockEnforceAiAbuseGuard,
  mockIsLaunchFeatureEnabled,
  mockReserveCredits,
  mockConfirmCredits,
  mockQuantifyAchievement,
} = vi.hoisted(() => ({
  mockVerifyAuth: vi.fn(),
  mockApplyRateLimit: vi.fn(),
  mockEnforceAiAbuseGuard: vi.fn(),
  mockIsLaunchFeatureEnabled: vi.fn(),
  mockReserveCredits: vi.fn(),
  mockConfirmCredits: vi.fn(),
  mockQuantifyAchievement: vi.fn(),
}));

vi.mock("@/lib/api/auth-middleware", () => ({ verifyAuth: mockVerifyAuth }));
vi.mock("@/lib/api/rate-limit", () => ({
  applyRateLimit: mockApplyRateLimit,
  rateLimitResponse: vi.fn((e: Error) =>
    NextResponse.json({ error: e.message }, { status: 429 })
  ),
}));
vi.mock("@/lib/services/abuse-guard", () => ({
  enforceAiAbuseGuard: mockEnforceAiAbuseGuard,
}));
vi.mock("@/config/launch", () => ({
  isLaunchFeatureEnabled: mockIsLaunchFeatureEnabled,
}));
vi.mock("@/lib/api/credit-middleware", () => ({
  reserveCreditsForOperation: mockReserveCredits,
  confirmCreditsForOperation: mockConfirmCredits,
}));
vi.mock("@/lib/services/logger", () => ({
  aiLogger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/lib/ai/content-generator", () => ({
  quantifyAchievement: mockQuantifyAchievement,
}));

vi.mock("@/lib/ai/privacy", () => ({
  sanitizeTextForAI: vi.fn((text: string) => text),
  resolvePrivacyMode: vi.fn(() => "standard"),
}));

vi.mock("@/lib/ai/cache", () => ({
  quantifierCache: {
    getStats: () => ({
      hitRate: 0,
      hits: 0,
      misses: 0,
      estimatedSavings: 0,
    }),
  },
  withCache: vi.fn((_cache, _params, fn) =>
    fn().then((data: unknown) => ({ data, fromCache: false }))
  ),
}));
vi.mock("@/lib/ai/cache-key", () => ({
  hashCacheKey: vi.fn(() => "mock-hash"),
}));

import { POST } from "../route";

describe("POST /api/ai/quantify-achievement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAuth.mockResolvedValue({
      success: true,
      user: { uid: "user-1", email: "u@e.com", emailVerified: true },
    });
    mockApplyRateLimit.mockResolvedValue(undefined);
    mockEnforceAiAbuseGuard.mockResolvedValue({ allowed: true });
    mockIsLaunchFeatureEnabled.mockReturnValue(true);
    mockReserveCredits.mockResolvedValue({
      success: true,
      plan: "free",
      creditsUsed: 0,
      creditsRemaining: 30,
      resetDate: "2026-04-01",
      isPremium: false,
    });
    mockConfirmCredits.mockResolvedValue({
      success: true,
      creditsUsed: 1,
      creditsRemaining: 29,
      resetDate: "2026-04-01",
      isPremium: false,
    });
    mockQuantifyAchievement.mockResolvedValue([
      "Increased revenue by 25% through process optimization",
      "Reduced costs by $50K annually via automation",
    ]);
  });

  it("returns 200 with suggestions and meta for valid input", async () => {
    const req = makeRequest("/api/ai/quantify-achievement", {
      statement: "Improved team productivity significantly",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.suggestions).toEqual([
      "Increased revenue by 25% through process optimization",
      "Reduced costs by $50K annually via automation",
    ]);
    expect(body.meta).toBeDefined();
    expect(body.meta.model).toBe("gemini-2.5-flash");
    expect(body.meta.fromCache).toBe(false);
  });

  it("returns 400 when statement is missing", async () => {
    const req = makeRequest("/api/ai/quantify-achievement", {});

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when statement is too short", async () => {
    const req = makeRequest("/api/ai/quantify-achievement", {
      statement: "Short",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when statement exceeds 500 characters", async () => {
    const req = makeRequest("/api/ai/quantify-achievement", {
      statement: "A".repeat(501),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});