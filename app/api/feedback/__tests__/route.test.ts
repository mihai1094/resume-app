// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../route";
import { makeAuthRequest, makeRequest } from "@/tests/mocks/next";

const {
  mockVerifyAuthHeader,
  mockSet,
  mockCollection,
  mockApplyRateLimit,
  mockRateLimitResponse,
} = vi.hoisted(() => {
  const mockSet = vi.fn();
  return {
    mockVerifyAuthHeader: vi.fn(),
    mockSet,
    mockCollection: vi.fn(() => ({
      doc: vi.fn(() => ({
        id: "feedback-123",
        set: mockSet,
      })),
    })),
    mockApplyRateLimit: vi.fn(),
    mockRateLimitResponse: vi.fn((error: Error) => Response.json({ error: error.message }, { status: 429 })),
  };
});

vi.mock("@/lib/firebase/admin", () => ({
  verifyAuthHeader: mockVerifyAuthHeader,
  getAdminDb: () => ({
    collection: mockCollection,
  }),
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

vi.mock("@/lib/api/rate-limit", () => ({
  applyRateLimit: mockApplyRateLimit,
  rateLimitResponse: mockRateLimitResponse,
}));

const API_PATH = "/api/feedback";

describe("POST /api/feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAuthHeader.mockResolvedValue({
      uid: "user-1",
      email: "test@example.com",
    });
    mockSet.mockResolvedValue(undefined);
    mockApplyRateLimit.mockResolvedValue(undefined);
  });

  it("returns 401 when not authenticated", async () => {
    mockVerifyAuthHeader.mockResolvedValue(null);

    const response = await POST(
      makeRequest(API_PATH, { category: "bug", message: "Something broke" })
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Authentication required");
  });

  it("returns 400 when category is missing", async () => {
    const response = await POST(
      makeAuthRequest(API_PATH, { message: "Something broke" })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Category and message are required");
  });

  it("returns 400 when message is missing", async () => {
    const response = await POST(
      makeAuthRequest(API_PATH, { category: "bug" })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Category and message are required");
  });

  it("returns 400 when message is whitespace only", async () => {
    const response = await POST(
      makeAuthRequest(API_PATH, { category: "bug", message: "   " })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Category and message are required");
  });

  it("returns 400 for invalid category", async () => {
    const response = await POST(
      makeAuthRequest(API_PATH, { category: "spam", message: "Hello" })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Invalid category");
  });

  it("successfully submits feedback", async () => {
    const response = await POST(
      makeAuthRequest(API_PATH, {
        category: "feature",
        message: "Add dark mode",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.id).toBe("feedback-123");

    expect(mockCollection).toHaveBeenCalledWith("feedback");
    expect(mockApplyRateLimit).toHaveBeenCalledWith(
      expect.anything(),
      "GENERAL",
      "user-1"
    );
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "feedback-123",
        userId: "user-1",
        userEmail: "test@example.com",
        category: "feature",
        message: "Add dark mode",
        status: "new",
      })
    );
  });

  it("maps rate-limit failures to the shared helper response", async () => {
    mockApplyRateLimit.mockRejectedValue(new Error("Rate limit exceeded"));

    const response = await POST(
      makeAuthRequest(API_PATH, {
        category: "feature",
        message: "Add dark mode",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.error).toBe("Rate limit exceeded");
    expect(mockSet).not.toHaveBeenCalled();
  });

  it("accepts all valid categories", async () => {
    for (const category of ["bug", "feature", "general"]) {
      mockSet.mockResolvedValue(undefined);
      const response = await POST(
        makeAuthRequest(API_PATH, { category, message: "Test" })
      );
      expect(response.status).toBe(200);
    }
  });

  it("truncates message to 2000 characters", async () => {
    const longMessage = "x".repeat(3000);
    const response = await POST(
      makeAuthRequest(API_PATH, {
        category: "general",
        message: longMessage,
      })
    );

    expect(response.status).toBe(200);
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "x".repeat(2000),
      })
    );
  });
});
