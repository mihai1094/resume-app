// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { POST } from "../route";

const mockApplyRateLimit = vi.fn();
const mockRateLimitResponse = vi.fn((error: Error) =>
  NextResponse.json({ error: error.message }, { status: 429 })
);
const mockCheckAndRecordSignupAttempt = vi.fn();

vi.mock("@/lib/api/rate-limit", () => ({
  applyRateLimit: (...args: unknown[]) => mockApplyRateLimit(...args),
  rateLimitResponse: (...args: unknown[]) => mockRateLimitResponse(...args),
}));

vi.mock("@/lib/services/abuse-guard", () => ({
  checkAndRecordSignupAttempt: (...args: unknown[]) =>
    mockCheckAndRecordSignupAttempt(...args),
}));

vi.mock("@/lib/services/logger", () => ({
  logger: {
    child: () => ({
      error: vi.fn(),
    }),
  },
}));

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/security/signup-check", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/security/signup-check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApplyRateLimit.mockResolvedValue(undefined);
    mockCheckAndRecordSignupAttempt.mockResolvedValue({ allowed: true });
  });

  it("rejects invalid payloads", async () => {
    const response = await POST(makeRequest({ deviceId: "short" }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      error: "Invalid request",
      code: "VALIDATION_ERROR",
    });
    expect(mockCheckAndRecordSignupAttempt).not.toHaveBeenCalled();
  });

  it("returns allowed when the abuse guard passes", async () => {
    const response = await POST(makeRequest({ deviceId: "device-12345" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ allowed: true });
    expect(mockApplyRateLimit).toHaveBeenCalledWith(
      expect.any(NextRequest),
      "GENERAL"
    );
    expect(mockCheckAndRecordSignupAttempt).toHaveBeenCalledWith(
      expect.any(NextRequest),
      "device-12345"
    );
  });

  it("returns a throttled response when signup attempts are blocked", async () => {
    mockCheckAndRecordSignupAttempt.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 300,
    });

    const response = await POST(makeRequest({ deviceId: "device-12345" }));
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload).toEqual({
      error: "Too many signup attempts from this network/device.",
      code: "SIGNUP_THROTTLED",
      retryAfterSeconds: 300,
    });
  });

  it("maps rate-limit failures to the shared helper response", async () => {
    mockApplyRateLimit.mockRejectedValue(new Error("Rate limited"));

    const response = await POST(makeRequest({ deviceId: "device-12345" }));
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload).toEqual({ error: "Rate limited" });
    expect(mockRateLimitResponse).toHaveBeenCalledTimes(1);
  });

  it("returns a 500 response when the abuse guard throws", async () => {
    mockCheckAndRecordSignupAttempt.mockRejectedValue(new Error("boom"));

    const response = await POST(makeRequest({ deviceId: "device-12345" }));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({
      error: "Unable to verify signup eligibility.",
      code: "SIGNUP_CHECK_FAILED",
    });
  });
});
