// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { POST } from "../testimonials/route";
import { makeAuthRequest } from "@/tests/mocks/next";

const {
  mockVerifyAuth,
  mockIsAdminUser,
  mockApplyRateLimit,
  mockRateLimitResponse,
  mockUpdateTestimonialStatus,
  mockHandleApiError,
} = vi.hoisted(() => ({
  mockVerifyAuth: vi.fn(),
  mockIsAdminUser: vi.fn(),
  mockApplyRateLimit: vi.fn(),
  mockRateLimitResponse: vi.fn((error: Error) =>
    NextResponse.json({ error: error.message }, { status: 429 })
  ),
  mockUpdateTestimonialStatus: vi.fn(),
  mockHandleApiError: vi.fn((error: Error) =>
    NextResponse.json({ error: error.message }, { status: 500 })
  ),
}));

vi.mock("@/lib/api/auth-middleware", () => ({
  verifyAuth: mockVerifyAuth,
}));

vi.mock("@/lib/config/admin", () => ({
  isAdminUser: mockIsAdminUser,
}));

vi.mock("@/lib/api/rate-limit", () => ({
  applyRateLimit: mockApplyRateLimit,
  rateLimitResponse: mockRateLimitResponse,
}));

vi.mock("@/lib/services/testimonials-server", () => ({
  updateTestimonialStatus: mockUpdateTestimonialStatus,
}));

vi.mock("@/lib/api/error-handler", () => ({
  handleApiError: mockHandleApiError,
}));

describe("POST /api/admin/testimonials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAuth.mockResolvedValue({
      success: true,
      user: { uid: "admin-1", email: "admin@example.com" },
    });
    mockIsAdminUser.mockReturnValue(true);
    mockApplyRateLimit.mockResolvedValue(undefined);
    mockUpdateTestimonialStatus.mockResolvedValue(undefined);
  });

  it("returns 403 for non-admin users", async () => {
    mockIsAdminUser.mockReturnValue(false);

    const response = await POST(
      makeAuthRequest("/api/admin/testimonials", {
        testimonialId: "t-1",
        status: "approved",
      })
    );

    expect(response.status).toBe(403);
  });

  it("returns 400 for invalid status payloads", async () => {
    const response = await POST(
      makeAuthRequest("/api/admin/testimonials", {
        testimonialId: "t-1",
        status: "invalid",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("valid status");
  });

  it("updates testimonial status for admins", async () => {
    const response = await POST(
      makeAuthRequest("/api/admin/testimonials", {
        testimonialId: "t-1",
        status: "approved",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(mockUpdateTestimonialStatus).toHaveBeenCalledWith(
      "t-1",
      "approved",
      "admin@example.com"
    );
  });
});
