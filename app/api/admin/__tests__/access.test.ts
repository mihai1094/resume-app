// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "../access/route";
import { makeGetRequest } from "@/tests/mocks/next";

const { mockVerifyAuth, mockIsAdminUser } = vi.hoisted(() => ({
  mockVerifyAuth: vi.fn(),
  mockIsAdminUser: vi.fn(),
}));

vi.mock("@/lib/api/auth-middleware", () => ({
  verifyAuth: mockVerifyAuth,
}));

vi.mock("@/lib/config/admin", () => ({
  isAdminUser: mockIsAdminUser,
}));

describe("GET /api/admin/access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAuth.mockResolvedValue({
      success: true,
      user: { uid: "admin-1", email: "admin@example.com" },
    });
  });

  it("returns isAdmin false when email is not allowed", async () => {
    mockIsAdminUser.mockReturnValue(false);

    const response = await GET(makeGetRequest("/api/admin/access"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.isAdmin).toBe(false);
  });

  it("returns isAdmin true for allowed admins", async () => {
    mockIsAdminUser.mockReturnValue(true);

    const response = await GET(makeGetRequest("/api/admin/access"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.isAdmin).toBe(true);
  });
});
