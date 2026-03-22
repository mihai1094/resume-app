// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../route";
import { makeAuthRequest, makeRequest } from "@/tests/mocks/next";

const {
  mockVerifyAuthHeader,
  mockRunTransaction,
  mockAnalyzeResumeReadiness,
  mockGetTierLimits,
  mockResumeData,
  mockUserData,
} = vi.hoisted(() => ({
  mockVerifyAuthHeader: vi.fn(),
  mockRunTransaction: vi.fn(),
  mockAnalyzeResumeReadiness: vi.fn(),
  mockGetTierLimits: vi.fn(),
  mockResumeData: vi.fn(),
  mockUserData: vi.fn(),
}));

const mockDocRef = { id: "mock-doc" };
vi.mock("@/lib/firebase/admin", () => ({
  verifyAuthHeader: mockVerifyAuthHeader,
  getAdminDb: () => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        ...mockDocRef,
        collection: vi.fn(() => ({
          doc: vi.fn(() => mockDocRef),
        })),
      })),
    })),
    runTransaction: mockRunTransaction,
  }),
}));

vi.mock("@/lib/api/auth-middleware", async () => {
  const { NextResponse } = await import("next/server");
  return {
    verifyAuth: async (request: Request) => {
      const authHeader = request.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return {
          success: false as const,
          response: NextResponse.json(
            { error: "Authentication required", code: "UNAUTHORIZED" },
            { status: 401 }
          ),
        };
      }
      const decoded = await mockVerifyAuthHeader(authHeader);
      if (!decoded) {
        return {
          success: false as const,
          response: NextResponse.json(
            { error: "Invalid token", code: "UNAUTHORIZED" },
            { status: 401 }
          ),
        };
      }
      return {
        success: true as const,
        user: { uid: decoded.uid, email: decoded.email },
      };
    },
  };
});

vi.mock("@/lib/services/resume-readiness", () => ({
  analyzeResumeReadiness: mockAnalyzeResumeReadiness,
}));

vi.mock("@/lib/config/credits", () => ({
  getTierLimits: mockGetTierLimits,
}));

vi.mock("@/lib/services/credit-service-server", () => ({
  normalizePlan: (rawPlan: unknown) => {
    const normalized = (rawPlan ?? "free").toString().toLowerCase();
    return normalized === "premium" || normalized === "pro" || normalized === "ai"
      ? "premium"
      : "free";
  },
}));

vi.mock("firebase-admin/firestore", () => ({
  Timestamp: {
    now: () => ({ seconds: 1000000, nanoseconds: 0 }),
  },
}));

vi.mock("@/lib/services/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    child: () => ({
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    }),
  },
}));

const API_PATH = "/api/rewards/claim-resume-completion";

describe("POST /api/rewards/claim-resume-completion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAuthHeader.mockResolvedValue({
      uid: "user-1",
      email: "test@example.com",
      email_verified: true,
    });
    // Default: resume exists and is ready
    mockResumeData.mockReturnValue({
      exists: true,
      data: () => ({
        data: {
          personalInfo: { firstName: "John", lastName: "Doe" },
          workExperience: [{ company: "Acme" }],
        },
      }),
    });
    mockUserData.mockReturnValue({
      data: () => ({
        plan: "free",
        rewards: {},
        usage: { aiCreditsUsed: 10 },
      }),
    });
    mockAnalyzeResumeReadiness.mockReturnValue({
      isReady: true,
      summary: { required: { passed: 5, total: 5 } },
    });
    mockGetTierLimits.mockReturnValue({ monthlyAICredits: 20 });
    // Transaction: tx.get is called twice via Promise.all (userRef, resumeRef)
    mockRunTransaction.mockImplementation(async (fn: Function) => {
      let callCount = 0;
      const mockTx = {
        get: vi.fn().mockImplementation(() => {
          callCount++;
          // First call = userRef, second call = resumeRef
          if (callCount === 1) return Promise.resolve(mockUserData());
          return Promise.resolve(mockResumeData());
        }),
        set: vi.fn(),
      };
      return fn(mockTx);
    });
  });

  it("returns 401 when not authenticated", async () => {
    mockVerifyAuthHeader.mockResolvedValue(null);

    const response = await POST(makeRequest(API_PATH, {}));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe("UNAUTHORIZED");
  });

  it("returns 400 when no resume draft exists", async () => {
    mockResumeData.mockReturnValue({ exists: false });

    const response = await POST(makeAuthRequest(API_PATH, {}));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.claimed).toBe(false);
    expect(payload.reason).toBe("no_resume_draft");
  });

  it("returns 400 when resume data is missing", async () => {
    mockResumeData.mockReturnValue({
      exists: true,
      data: () => ({}),
    });

    const response = await POST(makeAuthRequest(API_PATH, {}));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.claimed).toBe(false);
    expect(payload.reason).toBe("invalid_resume_data");
  });

  it("returns 400 when resume is not ready", async () => {
    mockAnalyzeResumeReadiness.mockReturnValue({
      isReady: false,
      summary: { required: { passed: 2, total: 5 } },
    });

    const response = await POST(makeAuthRequest(API_PATH, {}));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.claimed).toBe(false);
    expect(payload.reason).toBe("resume_not_ready");
    expect(payload.requiredPassed).toBe(2);
    expect(payload.requiredTotal).toBe(5);
  });

  it("returns already_claimed when reward was previously claimed", async () => {
    mockUserData.mockReturnValue({
      data: () => ({
        plan: "free",
        rewards: {
          credits: {
            resumeCompletionV1: { credits: 5 },
          },
        },
        usage: { aiCreditsUsed: 5 },
      }),
    });

    const response = await POST(makeAuthRequest(API_PATH, {}));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.claimed).toBe(false);
    expect(payload.reason).toBe("already_claimed");
  });

  it("returns premium_plan for premium users", async () => {
    mockUserData.mockReturnValue({
      data: () => ({
        plan: "premium",
        rewards: {},
        usage: { aiCreditsUsed: 0 },
      }),
    });

    const response = await POST(makeAuthRequest(API_PATH, {}));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.claimed).toBe(false);
    expect(payload.reason).toBe("premium_plan");
  });

  it("successfully claims reward for eligible free user", async () => {
    const response = await POST(makeAuthRequest(API_PATH, {}));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.claimed).toBe(true);
    expect(payload.creditsAwarded).toBe(5);
    expect(payload.creditsRemaining).toBeDefined();
  });
});