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
  mockGenerateSummary,
} = vi.hoisted(() => ({
  mockVerifyAuth: vi.fn(),
  mockApplyRateLimit: vi.fn(),
  mockEnforceAiAbuseGuard: vi.fn(),
  mockIsLaunchFeatureEnabled: vi.fn(),
  mockReserveCredits: vi.fn(),
  mockConfirmCredits: vi.fn(),
  mockGenerateSummary: vi.fn(),
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
  summaryCache: {
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
  allowPIIForAI: vi.fn(() => true),
  resolvePrivacyMode: vi.fn(() => "standard"),
}));
vi.mock("@/lib/ai/content-generator", () => ({
  generateSummary: mockGenerateSummary,
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
  mockGenerateSummary.mockResolvedValue(
    "Experienced software engineer with 5+ years of expertise in building scalable applications."
  );
});

describe("POST /api/ai/generate-summary", () => {
  it("returns 200 with summary and meta for valid input", async () => {
    const req = makeRequest("/api/ai/generate-summary", {
      tone: "professional",
      length: "medium",
    });

    const res = await POST(req);
    const { status, data } = await parseResponse<{
      summary: string;
      meta: { model: string; fromCache: boolean };
    }>(res);

    expect(status).toBe(200);
    expect(typeof data.summary).toBe("string");
    expect(data.summary.length).toBeGreaterThan(0);
    expect(data.meta).toMatchObject({
      model: "gemini-2.5-flash",
      fromCache: false,
    });
  });

  it("calls generateSummary with parsed input", async () => {
    const req = makeRequest("/api/ai/generate-summary", {
      tone: "professional",
      length: "medium",
      jobTitle: "Software Engineer",
      keySkills: ["TypeScript", "React"],
    });

    await POST(req);

    expect(mockGenerateSummary).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: "professional",
        length: "medium",
        jobTitle: "Software Engineer",
        keySkills: ["TypeScript", "React"],
      })
    );
  });

  it("returns 400 VALIDATION_ERROR for invalid tone value", async () => {
    const req = makeRequest("/api/ai/generate-summary", {
      tone: "invalid-tone",
      length: "medium",
    });

    const res = await POST(req);
    const { status, data } = await parseResponse<{ type: string }>(res);

    expect(status).toBe(400);
    expect(data.type).toBe("VALIDATION_ERROR");
  });
});