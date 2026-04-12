import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { withAIRoute } from "../ai-route-wrapper";
import { AI_CREDITS_HEADERS } from "@/lib/constants/ai-credits-events";
import { verifyAuth } from "../auth-middleware";
import {
  confirmCreditsForOperation,
  refundCreditsForOperation,
} from "../credit-middleware";
import { applyRateLimit } from "../rate-limit";
import { enforceAiAbuseGuard } from "@/lib/services/abuse-guard";
import { isLaunchFeatureEnabled } from "@/config/launch";

vi.mock("../auth-middleware", () => ({
  verifyAuth: vi.fn(),
}));

vi.mock("../credit-middleware", () => ({
  confirmCreditsForOperation: vi.fn(),
  refundCreditsForOperation: vi.fn(),
}));

vi.mock("../rate-limit", () => ({
  applyRateLimit: vi.fn(),
  rateLimitResponse: vi.fn((error: Error) =>
    NextResponse.json({ error: error.message }, { status: 429 })
  ),
}));

vi.mock("@/lib/services/abuse-guard", () => ({
  enforceAiAbuseGuard: vi.fn(),
}));

vi.mock("@/config/launch", () => ({
  isLaunchFeatureEnabled: vi.fn(),
}));

vi.mock("@/lib/services/logger", () => ({
  aiLogger: {
    error: vi.fn(),
  },
}));

function makeRequest(body: unknown = {}) {
  return new NextRequest("http://localhost/api/ai/generate-summary", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("withAIRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(verifyAuth).mockResolvedValue({
      success: true,
      user: {
        uid: "user-1",
        email: "user@example.com",
        emailVerified: true,
      },
    });
    vi.mocked(applyRateLimit).mockResolvedValue(undefined);
    vi.mocked(enforceAiAbuseGuard).mockResolvedValue({ allowed: true });
    vi.mocked(isLaunchFeatureEnabled).mockReturnValue(true);
    vi.mocked(confirmCreditsForOperation).mockResolvedValue({
      success: true,
      userId: "user-1",
      plan: "free",
      creditsUsed: 2,
      creditsRemaining: 28,
      resetDate: "2026-04-01T00:00:00.000Z",
      isPremium: false,
    });
    vi.mocked(refundCreditsForOperation).mockResolvedValue({
      success: true,
      userId: "user-1",
      plan: "free",
      creditsUsed: 0,
      creditsRemaining: 30,
      resetDate: "2026-04-01T00:00:00.000Z",
      isPremium: false,
    });
  });

  it("charges credits before the handler and keeps them on success", async () => {
    const handler = vi.fn(async () => ({ ok: true }));
    const route = withAIRoute(
      handler,
      {
        creditOperation: "generate-summary",
        timeout: 50,
      }
    );

    const response = await route(makeRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true });
    expect(confirmCreditsForOperation).toHaveBeenCalledTimes(1);
    expect(refundCreditsForOperation).not.toHaveBeenCalled();
    expect(
      vi.mocked(confirmCreditsForOperation).mock.invocationCallOrder[0]
    ).toBeLessThan(handler.mock.invocationCallOrder[0]);
    expect(response.headers.get(AI_CREDITS_HEADERS.updated)).toBe("1");
    expect(response.headers.get(AI_CREDITS_HEADERS.remaining)).toBe("28");
  });

  it("refunds credits when the handler times out", async () => {
    const route = withAIRoute(
      async () => new Promise<never>(() => undefined),
      {
        creditOperation: "generate-summary",
        timeout: 1,
      }
    );

    const response = await route(makeRequest());
    const payload = await response.json();

    expect(response.status).toBe(504);
    expect(payload.code).toBe("TIMEOUT");
    expect(confirmCreditsForOperation).toHaveBeenCalledTimes(1);
    expect(refundCreditsForOperation).toHaveBeenCalledTimes(1);
    expect(response.headers.get(AI_CREDITS_HEADERS.updated)).toBe("1");
    expect(response.headers.get(AI_CREDITS_HEADERS.remaining)).toBe("30");
  });

  it("refunds credits when the handler returns an error response", async () => {
    const route = withAIRoute(
      async () => NextResponse.json({ error: "bad" }, { status: 500 }),
      {
        creditOperation: "generate-summary",
        timeout: 50,
      }
    );

    const response = await route(makeRequest());
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("bad");
    expect(confirmCreditsForOperation).toHaveBeenCalledTimes(1);
    expect(refundCreditsForOperation).toHaveBeenCalledTimes(1);
    expect(response.headers.get(AI_CREDITS_HEADERS.remaining)).toBe("30");
  });
});
