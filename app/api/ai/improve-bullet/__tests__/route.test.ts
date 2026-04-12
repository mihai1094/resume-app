// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { makeRequest, parseResponse } from "@/tests/mocks/next";

const {
  mockVerifyAuth,
  mockApplyRateLimit,
  mockEnforceAiAbuseGuard,
  mockIsLaunchFeatureEnabled,
  mockReserveCredits,
  mockConfirmCredits,
  mockImproveBulletPoint,
} = vi.hoisted(() => ({
  mockVerifyAuth: vi.fn(),
  mockApplyRateLimit: vi.fn(),
  mockEnforceAiAbuseGuard: vi.fn(),
  mockIsLaunchFeatureEnabled: vi.fn(),
  mockReserveCredits: vi.fn(),
  mockConfirmCredits: vi.fn(),
  mockImproveBulletPoint: vi.fn(),
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
vi.mock("@/lib/ai/cache", () => ({
  bulletPointsCache: {
    getStats: () => ({ hitRate: 0, hits: 0, misses: 0, estimatedSavings: 0 }),
  },
  withCache: vi.fn((_cache, _params, fn) =>
    fn().then((data: unknown) => ({ data, fromCache: false }))
  ),
}));
vi.mock("@/lib/ai/cache-key", () => ({
  hashCacheKey: vi.fn(() => "mock-hash"),
}));
vi.mock("@/lib/ai/privacy", () => ({
  sanitizeTextForAI: vi.fn((text: string) => text),
  resolvePrivacyMode: vi.fn(() => "standard"),
}));
vi.mock("@/lib/ai/content-generator", () => ({
  improveBulletPoint: mockImproveBulletPoint,
}));

import { POST } from "../route";

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
  mockImproveBulletPoint.mockResolvedValue({
    improved:
      "Spearheaded development of new platform features, resulting in 25% increase in user engagement",
    suggestions: ["Add metrics", "Use stronger action verbs"],
  });
});

describe("POST /api/ai/improve-bullet", () => {
  it("returns 200 with result and meta for valid input", async () => {
    const req = makeRequest("/api/ai/improve-bullet", {
      bulletPoint: "Led development of new platform features",
    });

    const res = await POST(req);
    const { status, data } = await parseResponse<{
      result: { improved: string; suggestions: string[] };
      meta: { model: string; fromCache: boolean };
    }>(res);

    expect(status).toBe(200);
    expect(data.result).toBeDefined();
    expect(data.result.improved).toBeTruthy();
    expect(data.meta).toMatchObject({
      model: "gemini-2.5-flash",
      fromCache: false,
    });
  });

  it("calls improveBulletPoint with sanitized text", async () => {
    const req = makeRequest("/api/ai/improve-bullet", {
      bulletPoint: "Led development of new platform features",
      role: "Senior Engineer",
    });

    await POST(req);

    expect(mockImproveBulletPoint).toHaveBeenCalledWith(
      "Led development of new platform features",
      expect.objectContaining({ role: "Senior Engineer" })
    );
  });

  it("returns 400 VALIDATION_ERROR when bulletPoint is too short", async () => {
    const req = makeRequest("/api/ai/improve-bullet", {
      bulletPoint: "Short",
    });

    const res = await POST(req);
    const { status, data } = await parseResponse<{ type: string }>(res);

    expect(status).toBe(400);
    expect(data.type).toBe("VALIDATION_ERROR");
  });

  it("returns 400 VALIDATION_ERROR when bulletPoint is missing", async () => {
    const req = makeRequest("/api/ai/improve-bullet", {
      role: "Engineer",
    });

    const res = await POST(req);
    const { status, data } = await parseResponse<{ type: string }>(res);

    expect(status).toBe(400);
    expect(data.type).toBe("VALIDATION_ERROR");
  });
});