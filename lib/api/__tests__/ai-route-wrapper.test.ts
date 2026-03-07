import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { withAIRoute } from "../ai-route-wrapper";
import { AI_CREDITS_HEADERS } from "@/lib/constants/ai-credits-events";
import { verifyAuth } from "../auth-middleware";
import {
  reserveCreditsForOperation,
  confirmCreditsForOperation,
} from "../credit-middleware";
import { applyRateLimit } from "../rate-limit";
import { enforceAiAbuseGuard } from "@/lib/services/abuse-guard";
import { isLaunchFeatureEnabled } from "@/config/launch";

vi.mock("../auth-middleware", () => ({
  verifyAuth: vi.fn(),
}));

vi.mock("../credit-middleware", () => ({
  reserveCreditsForOperation: vi.fn(),
  confirmCreditsForOperation: vi.fn(),
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
    vi.mocked(reserveCreditsForOperation).mockResolvedValue({
      success: true,
      userId: "user-1",
      plan: "free",
      creditsUsed: 0,
      creditsRemaining: 30,
      resetDate: "2026-04-01T00:00:00.000Z",
      isPremium: false,
    });
    vi.mocked(confirmCreditsForOperation).mockResolvedValue({
      success: true,
      userId: "user-1",
      plan: "free",
      creditsUsed: 2,
      creditsRemaining: 28,
      resetDate: "2026-04-01T00:00:00.000Z",
      isPremium: false,
    });
  });

  it("confirms credits only after a successful handler response", async () => {
    const route = withAIRoute(
      async () => ({ ok: true }),
      {
        creditOperation: "generate-summary",
        timeout: 50,
      }
    );

    const response = await route(makeRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true });
    expect(reserveCreditsForOperation).toHaveBeenCalledTimes(1);
    expect(confirmCreditsForOperation).toHaveBeenCalledTimes(1);
    expect(response.headers.get(AI_CREDITS_HEADERS.updated)).toBe("1");
    expect(response.headers.get(AI_CREDITS_HEADERS.remaining)).toBe("28");
  });

  it("does not deduct credits when the handler times out", async () => {
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
    expect(reserveCreditsForOperation).toHaveBeenCalledTimes(1);
    expect(confirmCreditsForOperation).not.toHaveBeenCalled();
    expect(response.headers.get(AI_CREDITS_HEADERS.updated)).toBeNull();
  });
});
