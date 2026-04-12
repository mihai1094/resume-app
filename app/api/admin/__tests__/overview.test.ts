// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { GET } from "../overview/route";
import { makeGetRequest } from "@/tests/mocks/next";

const {
  mockVerifyAuth,
  mockIsAdminUser,
  mockApplyRateLimit,
  mockRateLimitResponse,
  mockGetAdminDashboardData,
  mockHandleApiError,
} = vi.hoisted(() => ({
  mockVerifyAuth: vi.fn(),
  mockIsAdminUser: vi.fn(),
  mockApplyRateLimit: vi.fn(),
  mockRateLimitResponse: vi.fn((error: Error) =>
    NextResponse.json({ error: error.message }, { status: 429 })
  ),
  mockGetAdminDashboardData: vi.fn(),
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
  getAdminDashboardData: mockGetAdminDashboardData,
}));

vi.mock("@/lib/api/error-handler", () => ({
  handleApiError: mockHandleApiError,
}));

describe("GET /api/admin/overview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAuth.mockResolvedValue({
      success: true,
      user: { uid: "admin-1", email: "admin@example.com" },
    });
    mockIsAdminUser.mockReturnValue(true);
    mockApplyRateLimit.mockResolvedValue(undefined);
    mockGetAdminDashboardData.mockResolvedValue({
      stats: {
        totalFeedback: 1,
        newFeedback: 1,
        totalTestimonials: 2,
        pendingTestimonials: 1,
        approvedTestimonials: 1,
      },
      feedback: [],
      testimonials: [],
    });
  });

  it("returns 403 for non-admin users", async () => {
    mockIsAdminUser.mockReturnValue(false);

    const response = await GET(makeGetRequest("/api/admin/overview"));
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.code).toBe("ADMIN_REQUIRED");
  });

  it("returns admin overview data for admins", async () => {
    const response = await GET(makeGetRequest("/api/admin/overview"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.stats.pendingTestimonials).toBe(1);
    expect(mockGetAdminDashboardData).toHaveBeenCalledTimes(1);
  });
});
