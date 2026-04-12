// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { makeRequest } from "@/tests/mocks/next";

const { mockVerifyAuth, mockApplyRateLimit, mockEnforceAiAbuseGuard, mockIsLaunchFeatureEnabled, mockReserveCredits, mockConfirmCredits, mockGetModel } = vi.hoisted(() => ({
  mockVerifyAuth: vi.fn(),
  mockApplyRateLimit: vi.fn(),
  mockEnforceAiAbuseGuard: vi.fn(),
  mockIsLaunchFeatureEnabled: vi.fn(),
  mockReserveCredits: vi.fn(),
  mockConfirmCredits: vi.fn(),
  mockGetModel: vi.fn(),
}));

vi.mock("@/lib/api/auth-middleware", () => ({ verifyAuth: mockVerifyAuth }));
vi.mock("@/lib/api/rate-limit", () => ({ applyRateLimit: mockApplyRateLimit, rateLimitResponse: vi.fn((e: Error) => NextResponse.json({ error: e.message }, { status: 429 })) }));
vi.mock("@/lib/services/abuse-guard", () => ({ enforceAiAbuseGuard: mockEnforceAiAbuseGuard }));
vi.mock("@/config/launch", () => ({ isLaunchFeatureEnabled: mockIsLaunchFeatureEnabled }));
vi.mock("@/lib/api/credit-middleware", () => ({ reserveCreditsForOperation: mockReserveCredits, confirmCreditsForOperation: mockConfirmCredits }));
vi.mock("@/lib/services/logger", () => ({ aiLogger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } }));
vi.mock("@/lib/ai/privacy", () => ({ sanitizeResumeForAI: vi.fn((d: unknown) => d), resolvePrivacyMode: vi.fn(() => "standard") }));
vi.mock("@/lib/ai/gemini-client", () => ({ getModel: mockGetModel, SAFETY_SETTINGS: [] }));
vi.mock("@/lib/ai/shared", () => ({ extractJson: vi.fn(() => null), serializeResume: vi.fn(() => "") }));

import { POST } from "../route";

beforeEach(() => {
  vi.clearAllMocks();
  mockVerifyAuth.mockResolvedValue({ success: true, user: { uid: "user-1", email: "u@e.com", emailVerified: true } });
  mockApplyRateLimit.mockResolvedValue(undefined);
  mockEnforceAiAbuseGuard.mockResolvedValue({ allowed: true });
  mockIsLaunchFeatureEnabled.mockReturnValue(true);
  mockReserveCredits.mockResolvedValue({ success: true, plan: "free", creditsUsed: 0, creditsRemaining: 30, resetDate: "2026-04-01", isPremium: false });
  mockConfirmCredits.mockResolvedValue({ success: true, creditsUsed: 1, creditsRemaining: 29, resetDate: "2026-04-01", isPremium: false });
  mockGetModel.mockReturnValue({
    generateContent: vi.fn().mockResolvedValue({ response: { text: () => '{"enhanced": "Better summary"}' } }),
  });
});

describe("POST /api/ai/batch-enhance", () => {
  it("returns 200 for valid input with resume data", async () => {
    const res = await POST(makeRequest("/api/ai/batch-enhance", {
      resumeData: {
        personalInfo: { summary: "" },
        workExperience: [],
      },
    }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("experiences");
    expect(data).toHaveProperty("meta");
  });

  it("returns 400 for missing resumeData", async () => {
    const res = await POST(makeRequest("/api/ai/batch-enhance", {}));
    expect(res.status).toBe(400);
  });
});
