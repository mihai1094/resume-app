// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { GET } from "../route";

const mockVerifyAuth = vi.fn();
const mockGet = vi.fn();
const mockDoc = vi.fn(() => ({
  get: mockGet,
}));
const mockCollection = vi.fn(() => ({
  doc: mockDoc,
}));

vi.mock("@/lib/api/auth-middleware", () => ({
  verifyAuth: (...args: unknown[]) => mockVerifyAuth(...args),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminDb: () => ({
    collection: mockCollection,
  }),
}));

function makeRequest() {
  return new NextRequest("http://localhost/api/user/export", {
    method: "GET",
    headers: {
      authorization: "Bearer token",
    },
  });
}

describe("GET /api/user/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAuth.mockResolvedValue({
      success: true,
      user: {
        uid: "user-1",
        email: "user@example.com",
        emailVerified: true,
      },
    });
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        displayName: "Test User",
        createdAt: {
          toDate: () => new Date("2025-01-02T03:04:05.000Z"),
        },
        nested: {
          updatedAt: new Date("2025-01-03T04:05:06.000Z"),
        },
        history: [
          {
            generatedAt: {
              toDate: () => new Date("2025-01-04T05:06:07.000Z"),
            },
          },
        ],
      }),
    });
  });

  it("returns the auth error response when authentication fails", async () => {
    mockVerifyAuth.mockResolvedValue({
      success: false,
      response: NextResponse.json(
        {
          error: "Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      ),
    });

    const response = await GET(makeRequest());
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe("UNAUTHORIZED");
    expect(mockCollection).not.toHaveBeenCalled();
  });

  it("returns exported account data with serialized metadata", async () => {
    const response = await GET(makeRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(mockCollection).toHaveBeenCalledWith("users");
    expect(mockDoc).toHaveBeenCalledWith("user-1");
    expect(payload.account).toMatchObject({
      uid: "user-1",
      email: "user@example.com",
      emailVerified: true,
      displayName: "Test User",
      createdAt: "2025-01-02T03:04:05.000Z",
      nested: {
        updatedAt: "2025-01-03T04:05:06.000Z",
      },
      history: [
        {
          generatedAt: "2025-01-04T05:06:07.000Z",
        },
      ],
    });
    expect(typeof payload.exportedAt).toBe("string");
  });

  it("returns base account info when the user metadata document does not exist", async () => {
    mockGet.mockResolvedValue({
      exists: false,
      data: () => undefined,
    });

    const response = await GET(makeRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.account).toEqual({
      uid: "user-1",
      email: "user@example.com",
      emailVerified: true,
    });
  });
});
