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
  mockSuggestSkills,
} = vi.hoisted(() => ({
  mockVerifyAuth: vi.fn(),
  mockApplyRateLimit: vi.fn(),
  mockEnforceAiAbuseGuard: vi.fn(),
  mockIsLaunchFeatureEnabled: vi.fn(),
  mockReserveCredits: vi.fn(),
  mockConfirmCredits: vi.fn(),
  mockSuggestSkills: vi.fn(),
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
  skillsCache: {
    getStats: () => ({ hitRate: 0, hits: 0, misses: 0, estimatedSavings: 0 }),
  },
  withCache: vi.fn((_cache, _params, fn) =>
    fn().then((data: unknown) => ({ data, fromCache: false }))
  ),
}));
vi.mock("@/lib/ai/cache-key", () => ({
  hashCacheKey: vi.fn(() => "mock-hash"),
}));
vi.mock("@/lib/ai/content-generator", () => ({
  suggestSkills: mockSuggestSkills,
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
  mockSuggestSkills.mockResolvedValue([
    { name: "TypeScript", category: "technical" },
    { name: "React", category: "technical" },
    { name: "Node.js", category: "technical" },
  ]);
});

describe("POST /api/ai/suggest-skills", () => {
  it("returns 200 with skills and meta for valid input", async () => {
    const req = makeRequest("/api/ai/suggest-skills", {
      jobTitle: "Software Engineer",
    });

    const res = await POST(req);
    const { status, data } = await parseResponse<{
      skills: Array<{ name: string; category: string }>;
      meta: { model: string; fromCache: boolean };
    }>(res);

    expect(status).toBe(200);
    expect(data.skills).toHaveLength(3);
    expect(data.skills[0]).toHaveProperty("name");
    expect(data.meta).toMatchObject({
      model: "gemini-2.5-flash",
      fromCache: false,
    });
  });

  it("calls suggestSkills with correct parameters", async () => {
    const req = makeRequest("/api/ai/suggest-skills", {
      jobTitle: "Software Engineer",
      industry: "technology",
      seniorityLevel: "senior",
    });

    await POST(req);

    expect(mockSuggestSkills).toHaveBeenCalledWith(
      expect.objectContaining({
        jobTitle: "Software Engineer",
        industry: "technology",
        seniorityLevel: "senior",
      })
    );
  });

  it("returns 400 VALIDATION_ERROR for invalid industry value", async () => {
    const req = makeRequest("/api/ai/suggest-skills", {
      jobTitle: "Software Engineer",
      industry: "invalid-industry",
    });

    const res = await POST(req);
    const { status, data } = await parseResponse<{ type: string }>(res);

    expect(status).toBe(400);
    expect(data.type).toBe("VALIDATION_ERROR");
  });

  it("returns 400 VALIDATION_ERROR when jobTitle is too short", async () => {
    const req = makeRequest("/api/ai/suggest-skills", {
      jobTitle: "E",
    });

    const res = await POST(req);
    const { status, data } = await parseResponse<{ type: string }>(res);

    expect(status).toBe(400);
    expect(data.type).toBe("VALIDATION_ERROR");
  });

  it("forwards resume-derived context to suggestSkills", async () => {
    const workHistory = [
      {
        position: "Senior Engineer",
        companyLabel: "a technology company",
        yearsAgo: 0,
        durationMonths: 24,
        isCurrent: true,
        bullets: ["Led TypeScript migration across 80K LOC frontend"],
      },
    ];
    const existingSkills = [
      { name: "TypeScript", category: "Technical" },
    ];

    const req = makeRequest("/api/ai/suggest-skills", {
      jobTitle: "Senior Engineer",
      workHistory,
      existingSkills,
      summary: "6 years building SaaS products.",
      certifications: ["AWS Solutions Architect"],
    });

    await POST(req);

    expect(mockSuggestSkills).toHaveBeenCalledWith(
      expect.objectContaining({
        jobTitle: "Senior Engineer",
        workHistory: expect.arrayContaining([
          expect.objectContaining({ position: "Senior Engineer" }),
        ]),
        existingSkills: expect.arrayContaining([
          expect.objectContaining({ name: "TypeScript" }),
        ]),
        summary: "6 years building SaaS products.",
        certifications: ["AWS Solutions Architect"],
      })
    );
  });

  it("filters duplicates at the route even on cached responses", async () => {
    // AI returns TypeScript, which the user already has — route must strip it.
    mockSuggestSkills.mockResolvedValueOnce([
      { name: "TypeScript", category: "Technical", source: "industry-trend" },
      { name: "Kubernetes", category: "Tools", source: "experience" },
    ]);

    const req = makeRequest("/api/ai/suggest-skills", {
      jobTitle: "Senior Engineer",
      existingSkills: [{ name: "typescript", category: "Technical" }],
    });

    const res = await POST(req);
    const { status, data } = await parseResponse<{
      skills: Array<{ name: string }>;
    }>(res);

    expect(status).toBe(200);
    expect(data.skills.map((s) => s.name)).toEqual(["Kubernetes"]);
  });

  it("filters alias duplicates (JS vs JavaScript)", async () => {
    mockSuggestSkills.mockResolvedValueOnce([
      { name: "JavaScript", category: "Technical", source: "industry-trend" },
      { name: "Go", category: "Technical", source: "experience" },
    ]);

    const req = makeRequest("/api/ai/suggest-skills", {
      jobTitle: "Backend Engineer",
      existingSkills: [{ name: "JS", category: "Technical" }],
    });

    const res = await POST(req);
    const { status, data } = await parseResponse<{
      skills: Array<{ name: string }>;
    }>(res);

    expect(status).toBe(200);
    expect(data.skills.map((s) => s.name)).toEqual(["Go"]);
  });

  it("accepts a resume with no work history (student case)", async () => {
    const req = makeRequest("/api/ai/suggest-skills", {
      jobTitle: "Junior Developer",
      educationField: "Computer Science",
      projects: [
        {
          name: "Portfolio Site",
          description: "Personal site built with Next.js",
          technologies: ["Next.js", "Tailwind"],
        },
      ],
    });

    const res = await POST(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(200);
  });

  it("rejects malformed workHistory entries", async () => {
    const req = makeRequest("/api/ai/suggest-skills", {
      jobTitle: "Senior Engineer",
      workHistory: [
        { position: "", yearsAgo: -1, durationMonths: 0, isCurrent: false, bullets: [] },
      ],
    });

    const res = await POST(req);
    const { status, data } = await parseResponse<{ type: string }>(res);
    expect(status).toBe(400);
    expect(data.type).toBe("VALIDATION_ERROR");
  });
});