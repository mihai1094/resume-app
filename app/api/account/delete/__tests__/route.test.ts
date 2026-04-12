// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../route";

const { mockVerifyAuthHeader, mockDeleteAccount } = vi.hoisted(() => ({
  mockVerifyAuthHeader: vi.fn(),
  mockDeleteAccount: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  verifyAuthHeader: mockVerifyAuthHeader,
}));

vi.mock("@/lib/services/account-deletion-service", () => ({
  accountDeletionService: {
    deleteAccount: mockDeleteAccount,
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

vi.mock("server-only", () => ({}));

function makeDeleteRequest(token?: string): NextRequest {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (token) {
    headers["authorization"] = `Bearer ${token}`;
  }
  return new NextRequest("http://localhost/api/account/delete", {
    method: "POST",
    headers,
  });
}

describe("POST /api/account/delete", () => {
  const recentAuthTime = Math.floor(Date.now() / 1000) - 60;

  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAuthHeader.mockResolvedValue({
      uid: "user-1",
      email: "test@example.com",
      auth_time: recentAuthTime,
    });
    mockDeleteAccount.mockResolvedValue({
      success: true,
      deletedCollections: 3,
    });
  });

  it("returns 401 when no authorization header is present", async () => {
    const response = await POST(makeDeleteRequest());
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe("UNAUTHORIZED");
    expect(mockVerifyAuthHeader).not.toHaveBeenCalled();
  });

  it("returns 401 when token verification fails", async () => {
    mockVerifyAuthHeader.mockResolvedValue(null);

    const response = await POST(makeDeleteRequest("invalid-token"));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 with REQUIRES_REAUTH when auth is stale", async () => {
    const staleAuthTime = Math.floor(Date.now() / 1000) - 600;
    mockVerifyAuthHeader.mockResolvedValue({
      uid: "user-1",
      email: "test@example.com",
      auth_time: staleAuthTime,
    });

    const response = await POST(makeDeleteRequest("valid-token"));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe("REQUIRES_REAUTH");
    expect(mockDeleteAccount).not.toHaveBeenCalled();
  });

  it("returns 401 with REQUIRES_REAUTH when auth_time is missing", async () => {
    mockVerifyAuthHeader.mockResolvedValue({
      uid: "user-1",
      email: "test@example.com",
      auth_time: undefined,
    });

    const response = await POST(makeDeleteRequest("valid-token"));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe("REQUIRES_REAUTH");
    expect(mockDeleteAccount).not.toHaveBeenCalled();
  });

  it("successfully deletes account with recent auth", async () => {
    const response = await POST(makeDeleteRequest("valid-token"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(mockDeleteAccount).toHaveBeenCalledWith("user-1");
  });

  it("returns 500 when deletion service throws", async () => {
    mockDeleteAccount.mockRejectedValue(new Error("Firestore failure"));

    const response = await POST(makeDeleteRequest("valid-token"));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBeDefined();
  });
});