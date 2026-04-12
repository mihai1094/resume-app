// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { GET, POST } from "../route";
import { makeAuthRequest, makeGetRequest, makeRequest } from "@/tests/mocks/next";

const {
  mockVerifyAuth,
  mockApplyRateLimit,
  mockRateLimitResponse,
  mockGetApprovedTestimonials,
  mockSubmitTestimonial,
  mockHandleApiError,
} = vi.hoisted(() => ({
  mockVerifyAuth: vi.fn(),
  mockApplyRateLimit: vi.fn(),
  mockRateLimitResponse: vi.fn((error: Error) =>
    NextResponse.json({ error: error.message }, { status: 429 })
  ),
  mockGetApprovedTestimonials: vi.fn(),
  mockSubmitTestimonial: vi.fn(),
  mockHandleApiError: vi.fn((error: Error) =>
    NextResponse.json({ error: error.message }, { status: 500 })
  ),
}));

vi.mock("@/lib/api/auth-middleware", () => ({
  verifyAuth: mockVerifyAuth,
}));

vi.mock("@/lib/api/rate-limit", () => ({
  applyRateLimit: mockApplyRateLimit,
  rateLimitResponse: mockRateLimitResponse,
}));

vi.mock("@/lib/services/testimonials-server", () => ({
  getApprovedTestimonials: mockGetApprovedTestimonials,
  submitTestimonial: mockSubmitTestimonial,
}));

vi.mock("@/lib/api/error-handler", () => ({
  handleApiError: mockHandleApiError,
}));

describe("GET /api/testimonials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetApprovedTestimonials.mockResolvedValue([
      {
        id: "t-1",
        name: "Jane Doe",
        role: "Designer",
        company: "Acme",
        content: "Great product.",
        rating: 5,
      },
    ]);
  });

  it("returns approved testimonials", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.testimonials).toHaveLength(1);
    expect(mockGetApprovedTestimonials).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/testimonials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAuth.mockResolvedValue({
      success: true,
      user: { uid: "user-1", email: "user@example.com" },
    });
    mockApplyRateLimit.mockResolvedValue(undefined);
    mockSubmitTestimonial.mockResolvedValue({ id: "testimonial-1" });
  });

  it("returns auth middleware response when authentication fails", async () => {
    mockVerifyAuth.mockResolvedValue({
      success: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });

    const response = await POST(
      makeRequest("/api/testimonials", {
        name: "Jane",
        role: "Designer",
        company: "Acme",
        content: "Love it",
        rating: 5,
        consentToPublish: true,
      })
    );

    expect(response.status).toBe(401);
    expect(mockSubmitTestimonial).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid payloads", async () => {
    const response = await POST(
      makeAuthRequest("/api/testimonials", {
        name: "Jane",
        role: "",
        company: "Acme",
        content: "Love it",
        rating: 5,
        consentToPublish: false,
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("required");
    expect(mockSubmitTestimonial).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid ratings", async () => {
    const response = await POST(
      makeAuthRequest("/api/testimonials", {
        name: "Jane",
        role: "Designer",
        company: "Acme",
        content: "Love it",
        rating: 9,
        consentToPublish: true,
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("Rating");
    expect(mockSubmitTestimonial).not.toHaveBeenCalled();
  });

  it("submits valid testimonials", async () => {
    const response = await POST(
      makeAuthRequest("/api/testimonials", {
        name: "Jane Doe",
        role: "Designer",
        company: "Acme",
        content: "ResumeZeus helped me ship a stronger application.",
        rating: 5,
        consentToPublish: true,
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(mockApplyRateLimit).toHaveBeenCalledWith(
      expect.anything(),
      "GENERAL",
      "user-1"
    );
    expect(mockSubmitTestimonial).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Jane Doe",
        role: "Designer",
        company: "Acme",
        content: "ResumeZeus helped me ship a stronger application.",
        rating: 5,
        consentToPublish: true,
      }),
      { uid: "user-1", email: "user@example.com" }
    );
  });

  it("maps rate-limit errors to the shared helper", async () => {
    mockApplyRateLimit.mockRejectedValue(new Error("Rate limit exceeded"));

    const response = await POST(
      makeAuthRequest("/api/testimonials", {
        name: "Jane Doe",
        role: "Designer",
        company: "Acme",
        content: "ResumeZeus helped me ship a stronger application.",
        rating: 5,
        consentToPublish: true,
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.error).toBe("Rate limit exceeded");
  });
});
