// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { makeRequest } from "@/tests/mocks/next";

const { mockVerifyAuth, mockApplyRateLimit, mockEnforceAiAbuseGuard, mockIsLaunchFeatureEnabled, mockReserveCredits, mockConfirmCredits } = vi.hoisted(() => ({
  mockVerifyAuth: vi.fn(),
  mockApplyRateLimit: vi.fn(),
  mockEnforceAiAbuseGuard: vi.fn(),
  mockIsLaunchFeatureEnabled: vi.fn(),
  mockReserveCredits: vi.fn(),
  mockConfirmCredits: vi.fn(),
}));

const { mockAnalyzeText } = vi.hoisted(() => ({
  mockAnalyzeText: vi.fn(),
}));

vi.mock("@/lib/api/auth-middleware", () => ({ verifyAuth: mockVerifyAuth }));
vi.mock("@/lib/api/rate-limit", () => ({ applyRateLimit: mockApplyRateLimit, rateLimitResponse: vi.fn((e: Error) => NextResponse.json({ error: e.message }, { status: 429 })) }));
vi.mock("@/lib/services/abuse-guard", () => ({ enforceAiAbuseGuard: mockEnforceAiAbuseGuard }));
vi.mock("@/config/launch", () => ({ isLaunchFeatureEnabled: mockIsLaunchFeatureEnabled }));
vi.mock("@/lib/api/credit-middleware", () => ({ reserveCreditsForOperation: mockReserveCredits, confirmCreditsForOperation: mockConfirmCredits }));
vi.mock("@/lib/services/logger", () => ({ aiLogger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } }));
vi.mock("@/lib/ai/cache-key", () => ({ hashCacheKey: vi.fn(() => "mock-hash") }));
vi.mock("@/lib/ai/privacy", () => ({ sanitizeTextForAI: vi.fn((t: string) => t), resolvePrivacyMode: vi.fn(() => "standard") }));
vi.mock("@/lib/ai/content-generator", () => ({ analyzeText: mockAnalyzeText }));
vi.mock("@/lib/ai/cache", () => ({
  writingAssistantCache: { getStats: () => ({ hitRate: 0, hits: 0, misses: 0, estimatedSavings: 0 }) },
  withCache: vi.fn((_cache: unknown, _params: unknown, fn: () => Promise<unknown>) => fn().then((data: unknown) => ({ data, fromCache: false }))),
}));

import { POST } from "../route";

describe("POST /api/ai/analyze-text", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAuth.mockResolvedValue({ success: true, user: { uid: "user-1", email: "u@e.com", emailVerified: true } });
    mockApplyRateLimit.mockResolvedValue(undefined);
    mockEnforceAiAbuseGuard.mockResolvedValue({ allowed: true });
    mockIsLaunchFeatureEnabled.mockReturnValue(true);
    mockReserveCredits.mockResolvedValue({ success: true, plan: "free", creditsUsed: 0, creditsRemaining: 30, resetDate: "2026-04-01", isPremium: false });
    mockConfirmCredits.mockResolvedValue({ success: true, creditsUsed: 1, creditsRemaining: 29, resetDate: "2026-04-01", isPremium: false });
    mockAnalyzeText.mockResolvedValue({ score: 80, suggestions: [{ text: "Use stronger verbs", type: "improvement" }] });
  });

  it("returns 200 with analysis and meta for valid input", async () => {
    const req = makeRequest("/api/ai/analyze-text", {
      text: "Managed a team of developers to deliver projects on time",
      context: "bullet-point",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.analysis).toBeDefined();
    expect(data.analysis.score).toBe(80);
    expect(data.meta).toBeDefined();
    expect(data.meta.fromCache).toBe(false);
  });

  it("returns 400 when text is too short", async () => {
    const req = makeRequest("/api/ai/analyze-text", { text: "Hi" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(data.type).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for invalid context value", async () => {
    const req = makeRequest("/api/ai/analyze-text", {
      text: "Managed a team of developers to deliver projects on time",
      context: "invalid-context",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.type).toBe("VALIDATION_ERROR");
  });
});
