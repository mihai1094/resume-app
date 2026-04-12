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
  mockGenerateBulletPoints,
} = vi.hoisted(() => ({
  mockVerifyAuth: vi.fn(),
  mockApplyRateLimit: vi.fn(),
  mockEnforceAiAbuseGuard: vi.fn(),
  mockIsLaunchFeatureEnabled: vi.fn(),
  mockReserveCredits: vi.fn(),
  mockConfirmCredits: vi.fn(),
  mockGenerateBulletPoints: vi.fn(),
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
vi.mock("@/lib/api/sanitization", () => ({
  sanitizeText: vi.fn((text: string) => text),
}));
vi.mock("@/lib/ai/content-generator", () => ({
  generateBulletPoints: mockGenerateBulletPoints,
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
  mockGenerateBulletPoints.mockResolvedValue([
    "Led cross-functional team to deliver project on time",
    "Improved system performance by 40%",
  ]);
});

describe("POST /api/ai/generate-bullets", () => {
  it("returns 200 with bulletPoints and meta for valid input", async () => {
    const req = makeRequest("/api/ai/generate-bullets", {
      position: "Engineer",
      company: "Acme",
    });

    const res = await POST(req);
    const { status, data } = await parseResponse<{
      bulletPoints: string[];
      meta: { model: string; fromCache: boolean };
    }>(res);

    expect(status).toBe(200);
    expect(data.bulletPoints).toHaveLength(2);
    expect(data.meta).toMatchObject({
      model: "gemini-2.5-flash",
      fromCache: false,
    });
  });

  it("calls generateBulletPoints with sanitized input", async () => {
    const req = makeRequest("/api/ai/generate-bullets", {
      position: "Engineer",
      company: "Acme",
      industry: "technology",
    });

    await POST(req);

    expect(mockGenerateBulletPoints).toHaveBeenCalledWith(
      expect.objectContaining({
        position: "Engineer",
        company: "Acme",
        industry: "technology",
      })
    );
  });

  it("returns 400 VALIDATION_ERROR when position is missing", async () => {
    const req = makeRequest("/api/ai/generate-bullets", {
      company: "Acme",
    });

    const res = await POST(req);
    const { status, data } = await parseResponse<{ type: string }>(res);

    expect(status).toBe(400);
    expect(data.type).toBe("VALIDATION_ERROR");
  });

  it("returns 400 VALIDATION_ERROR when position is too short", async () => {
    const req = makeRequest("/api/ai/generate-bullets", {
      position: "E",
      company: "Acme",
    });

    const res = await POST(req);
    const { status, data } = await parseResponse<{ type: string }>(res);

    expect(status).toBe(400);
    expect(data.type).toBe("VALIDATION_ERROR");
  });
});