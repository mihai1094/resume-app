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

const { mockGetModel } = vi.hoisted(() => ({
  mockGetModel: vi.fn(),
}));

vi.mock("@/lib/api/auth-middleware", () => ({ verifyAuth: mockVerifyAuth }));
vi.mock("@/lib/api/rate-limit", () => ({ applyRateLimit: mockApplyRateLimit, rateLimitResponse: vi.fn((e: Error) => NextResponse.json({ error: e.message }, { status: 429 })) }));
vi.mock("@/lib/services/abuse-guard", () => ({ enforceAiAbuseGuard: mockEnforceAiAbuseGuard }));
vi.mock("@/config/launch", () => ({ isLaunchFeatureEnabled: mockIsLaunchFeatureEnabled }));
vi.mock("@/lib/api/credit-middleware", () => ({ reserveCreditsForOperation: mockReserveCredits, confirmCreditsForOperation: mockConfirmCredits }));
vi.mock("@/lib/services/logger", () => ({ aiLogger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } }));
vi.mock("@/lib/ai/cache-key", () => ({ hashCacheKey: vi.fn(() => "mock-hash") }));
vi.mock("@/lib/ai/privacy", () => ({ sanitizeTextForAI: vi.fn((t: string) => t), resolvePrivacyMode: vi.fn(() => "standard") }));
vi.mock("@/lib/ai/gemini-client", () => ({
  getModel: mockGetModel,
  SAFETY_SETTINGS: [],
}));
vi.mock("@/lib/ai/prompt-utils", () => ({
  buildSystemInstruction: vi.fn(() => "system"),
  PROMPT_VERSION: "1.0",
  wrapTag: vi.fn((_t: string, v: string) => v),
}));
vi.mock("@/lib/ai/cache", () => ({
  bulletPointsCache: { getStats: () => ({ hitRate: 0, hits: 0, misses: 0, estimatedSavings: 0 }) },
  withCache: vi.fn((_cache: unknown, _params: unknown, fn: () => Promise<unknown>) => fn().then((data: unknown) => ({ data, fromCache: false }))),
}));

import { POST } from "../route";

describe("POST /api/ai/ghost-suggest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAuth.mockResolvedValue({ success: true, user: { uid: "user-1", email: "u@e.com", emailVerified: true } });
    mockApplyRateLimit.mockResolvedValue(undefined);
    mockEnforceAiAbuseGuard.mockResolvedValue({ allowed: true });
    mockIsLaunchFeatureEnabled.mockReturnValue(true);
    mockReserveCredits.mockResolvedValue({ success: true, plan: "free", creditsUsed: 0, creditsRemaining: 30, resetDate: "2026-04-01", isPremium: false });
    mockConfirmCredits.mockResolvedValue({ success: true, creditsUsed: 1, creditsRemaining: 29, resetDate: "2026-04-01", isPremium: false });
    mockGetModel.mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: { text: () => "Improved text here" },
      }),
    });
  });

  it("returns 200 with suggestion and meta for valid input", async () => {
    const req = makeRequest("/api/ai/ghost-suggest", {
      text: "Managed a team of software engineers to deliver projects",
      context: { position: "Engineering Manager", sectionType: "bullet" },
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.suggestion).toBe("Improved text here");
    expect(data.meta).toBeDefined();
  });

  it("returns 400 when text is too short", async () => {
    const req = makeRequest("/api/ai/ghost-suggest", { text: "Short" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(data.type).toBe("VALIDATION_ERROR");
  });
});
