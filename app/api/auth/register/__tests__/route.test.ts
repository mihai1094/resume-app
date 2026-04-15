// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { POST } from "../route";

const {
  mockApplyRateLimit,
  mockRateLimitResponse,
  mockCheckAndRecordSignupAttempt,
  mockCreateUser,
  mockDeleteUser,
  mockCreateCustomToken,
  mockSet,
  mockCollection,
} = vi.hoisted(() => {
  const mockSet = vi.fn();
  return {
    mockApplyRateLimit: vi.fn(),
    mockRateLimitResponse: vi.fn((error: Error) =>
      NextResponse.json({ error: error.message }, { status: 429 })
    ),
    mockCheckAndRecordSignupAttempt: vi.fn(),
    mockCreateUser: vi.fn(),
    mockDeleteUser: vi.fn(),
    mockCreateCustomToken: vi.fn(),
    mockSet,
    mockCollection: vi.fn(() => ({
      doc: vi.fn(() => ({
        set: mockSet,
      })),
    })),
  };
});

vi.mock("@/lib/api/rate-limit", () => ({
  applyRateLimit: mockApplyRateLimit,
  rateLimitResponse: mockRateLimitResponse,
}));

vi.mock("@/lib/services/abuse-guard", () => ({
  checkAndRecordSignupAttempt: mockCheckAndRecordSignupAttempt,
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => ({
    createUser: mockCreateUser,
    deleteUser: mockDeleteUser,
    createCustomToken: mockCreateCustomToken,
  }),
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

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApplyRateLimit.mockResolvedValue(undefined);
    mockCheckAndRecordSignupAttempt.mockResolvedValue({ allowed: true });
    mockSet.mockResolvedValue(undefined);
    mockCreateUser.mockResolvedValue({
      uid: "user-1",
      email: "new@example.com",
      displayName: "New User",
    });
    mockDeleteUser.mockResolvedValue(undefined);
    mockCreateCustomToken.mockResolvedValue("custom-token-123");
  });

  it("rejects invalid payloads", async () => {
    const response = await POST(makeRequest({ email: "bad" }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      error: "Invalid registration payload",
      code: "VALIDATION_ERROR",
    });
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("rejects weak passwords before touching Firebase Admin", async () => {
    const response = await POST(
      makeRequest({
        email: "new@example.com",
        password: "password",
        displayName: "New User",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("WEAK_PASSWORD");
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("returns a throttled response when signup abuse checks fail", async () => {
    mockCheckAndRecordSignupAttempt.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 120,
    });

    const response = await POST(
      makeRequest({
        email: "new@example.com",
        password: "Password1!",
        displayName: "New User",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload).toEqual({
      error: "Too many signup attempts from this network/device.",
      code: "SIGNUP_THROTTLED",
      retryAfterSeconds: 120,
    });
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("creates the auth user, metadata document, and custom token", async () => {
    const response = await POST(
      makeRequest({
        email: "new@example.com",
        password: "Password1!",
        displayName: "New User",
        deviceId: "device-12345",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(mockApplyRateLimit).toHaveBeenCalledWith(
      expect.any(NextRequest),
      "AUTH"
    );
    expect(mockCheckAndRecordSignupAttempt).toHaveBeenCalledWith(
      expect.any(NextRequest),
      "device-12345"
    );
    expect(mockCreateUser).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "Password1!",
      displayName: "New User",
      emailVerified: false,
      disabled: false,
    });
    expect(mockCollection).toHaveBeenCalledWith("users");
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockCreateCustomToken).toHaveBeenCalledWith("user-1");
    expect(payload).toEqual({
      success: true,
      customToken: "custom-token-123",
      uid: "user-1",
      email: "new@example.com",
      displayName: "New User",
    });
  });

  it("maps Firebase email conflicts to 409 responses", async () => {
    mockCreateUser.mockRejectedValue(
      Object.assign(new Error("email exists"), {
        code: "auth/email-already-exists",
      })
    );

    const response = await POST(
      makeRequest({
        email: "new@example.com",
        password: "Password1!",
        displayName: "New User",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.code).toBe("REGISTRATION_FAILED");
  });

  it("rolls back the auth user when metadata creation fails", async () => {
    mockSet.mockRejectedValue(new Error("firestore write failed"));

    const response = await POST(
      makeRequest({
        email: "new@example.com",
        password: "Password1!",
        displayName: "New User",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBeDefined();
    expect(payload.timestamp).toBeDefined();
    expect(mockDeleteUser).toHaveBeenCalledWith("user-1");
  });

  it("surfaces missing Firebase Admin credentials clearly", async () => {
    mockCreateUser.mockRejectedValue(
      new Error("Could not load the default credentials")
    );

    const response = await POST(
      makeRequest({
        email: "new@example.com",
        password: "Password1!",
        displayName: "New User",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.code).toBe("FIREBASE_ADMIN_NOT_CONFIGURED");
  });
});
