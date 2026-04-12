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
  mockTailorResume,
} = vi.hoisted(() => ({
  mockVerifyAuth: vi.fn(),
  mockApplyRateLimit: vi.fn(),
  mockEnforceAiAbuseGuard: vi.fn(),
  mockIsLaunchFeatureEnabled: vi.fn(),
  mockReserveCredits: vi.fn(),
  mockConfirmCredits: vi.fn(),
  mockTailorResume: vi.fn(),
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
  tailorResume: mockTailorResume,
}));

vi.mock("@/lib/ai/privacy", () => ({
  sanitizeResumeForAI: vi.fn((data: unknown) => data),
  resolvePrivacyMode: vi.fn(() => "standard"),
}));

vi.mock("@/lib/ai/cache", () => ({
  tailorResumeCache: {
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

describe("POST /api/ai/tailor-resume", () => {
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
    mockTailorResume.mockResolvedValue({ tailoredData: {} });
  });

  it("returns 200 with result and meta for valid input", async () => {
    const req = makeRequest("/api/ai/tailor-resume", {
      resumeData: { personalInfo: {} },
      jobDescription: "A".repeat(60),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.result).toEqual({ tailoredData: {} });
    expect(body.meta).toBeDefined();
    expect(body.meta.model).toBe("gemini-2.5-flash");
    expect(body.meta.fromCache).toBe(false);
  });

  it("returns 400 when jobDescription is too short", async () => {
    const req = makeRequest("/api/ai/tailor-resume", {
      resumeData: { personalInfo: {} },
      jobDescription: "Too short",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when resumeData is missing", async () => {
    const req = makeRequest("/api/ai/tailor-resume", {
      jobDescription: "A".repeat(60),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});