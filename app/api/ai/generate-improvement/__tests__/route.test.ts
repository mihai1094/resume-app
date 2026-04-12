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

const { mockGenerateImprovement, mockGenerateKeywordPlacements, mockGenerateOptimizedSummary } = vi.hoisted(() => ({
  mockGenerateImprovement: vi.fn(),
  mockGenerateKeywordPlacements: vi.fn(),
  mockGenerateOptimizedSummary: vi.fn(),
}));

vi.mock("@/lib/api/auth-middleware", () => ({ verifyAuth: mockVerifyAuth }));
vi.mock("@/lib/api/rate-limit", () => ({ applyRateLimit: mockApplyRateLimit, rateLimitResponse: vi.fn((e: Error) => NextResponse.json({ error: e.message }, { status: 429 })) }));
vi.mock("@/lib/services/abuse-guard", () => ({ enforceAiAbuseGuard: mockEnforceAiAbuseGuard }));
vi.mock("@/config/launch", () => ({ isLaunchFeatureEnabled: mockIsLaunchFeatureEnabled }));
vi.mock("@/lib/api/credit-middleware", () => ({ reserveCreditsForOperation: mockReserveCredits, confirmCreditsForOperation: mockConfirmCredits }));
vi.mock("@/lib/services/logger", () => ({ aiLogger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } }));
vi.mock("@/lib/ai/cache-key", () => ({ hashCacheKey: vi.fn(() => "mock-hash") }));
vi.mock("@/lib/ai/privacy", () => ({ sanitizeResumeForAI: vi.fn((d: unknown) => d), resolvePrivacyMode: vi.fn(() => "standard") }));
vi.mock("@/lib/ai/improvement", () => ({
  generateImprovement: mockGenerateImprovement,
  generateKeywordPlacements: mockGenerateKeywordPlacements,
  generateOptimizedSummary: mockGenerateOptimizedSummary,
}));

import { POST } from "../route";

const jobDescription = "We are looking for a senior software engineer with experience in React, TypeScript, and cloud infrastructure to build scalable systems.";
const resumeData = { personalInfo: { firstName: "John", lastName: "Doe" }, workExperience: [] };

describe("POST /api/ai/generate-improvement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAuth.mockResolvedValue({ success: true, user: { uid: "user-1", email: "u@e.com", emailVerified: true } });
    mockApplyRateLimit.mockResolvedValue(undefined);
    mockEnforceAiAbuseGuard.mockResolvedValue({ allowed: true });
    mockIsLaunchFeatureEnabled.mockReturnValue(true);
    mockReserveCredits.mockResolvedValue({ success: true, plan: "free", creditsUsed: 0, creditsRemaining: 30, resetDate: "2026-04-01", isPremium: false });
    mockConfirmCredits.mockResolvedValue({ success: true, creditsUsed: 1, creditsRemaining: 29, resetDate: "2026-04-01", isPremium: false });
    mockGenerateImprovement.mockResolvedValue({ improved: "Enhanced bullet point", options: [] });
    mockGenerateKeywordPlacements.mockResolvedValue({ placements: [] });
    mockGenerateOptimizedSummary.mockResolvedValue({ summary: "Optimized summary text" });
  });

  it("returns 200 for generate_improvement action with required fields", async () => {
    const req = makeRequest("/api/ai/generate-improvement", {
      action: "generate_improvement",
      suggestion: { type: "bullet", section: "experience", text: "Improve this" },
      resumeData,
      jobDescription,
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.result).toBeDefined();
    expect(mockGenerateImprovement).toHaveBeenCalledOnce();
  });

  it("returns 400 when required fields are missing for generate_improvement", async () => {
    const req = makeRequest("/api/ai/generate-improvement", {
      action: "generate_improvement",
      suggestion: { type: "bullet", section: "experience", text: "Improve this" },
      // missing resumeData and jobDescription
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("returns 400 for invalid action", async () => {
    const req = makeRequest("/api/ai/generate-improvement", {
      action: "invalid_action",
      resumeData,
      jobDescription,
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.type).toBe("VALIDATION_ERROR");
  });
});
