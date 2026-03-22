import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const mockGetCreditStatus = vi.fn();
const mockCheckCredits = vi.fn();
const mockDeductCredits = vi.fn();

vi.mock("@/lib/services/credit-service", () => ({
  getCreditStatus: (...args: unknown[]) => mockGetCreditStatus(...args),
  checkCredits: (...args: unknown[]) => mockCheckCredits(...args),
  deductCredits: (...args: unknown[]) => mockDeductCredits(...args),
  AI_CREDIT_COSTS: {
    "generate-bullets": 2,
    "suggest-skills": 1,
    "batch-enhance": 5,
  },
  FREE_TIER_LIMITS: { monthlyAICredits: 30 },
}));

vi.mock("@/lib/config/credits", () => ({
  isPremiumOnlyFeature: (op: string) => op === "batch-enhance",
  getCreditCost: (op: string) => {
    const costs: Record<string, number> = {
      "generate-bullets": 2,
      "suggest-skills": 1,
      "batch-enhance": 5,
    };
    return costs[op] ?? 1;
  },
}));

vi.mock("@/lib/config/admin", () => ({
  isAdminUser: () => false,
}));

const mockUser = { id: "user-1", email: "test@test.com", plan: "free" };

vi.mock("../use-user", () => ({
  useUser: () => ({ user: mockUser }),
}));

vi.mock("firebase/auth", () => ({
  getAuth: () => ({
    currentUser: { getIdToken: vi.fn().mockResolvedValue("token") },
  }),
}));

vi.mock("@/lib/services/logger", () => ({
  logger: {
    child: () => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    }),
  },
}));

vi.mock("@/lib/constants/ai-credits-events", () => ({
  AI_CREDITS_UPDATED_EVENT: "ai-credits-updated",
}));

import { useAICredits } from "../use-ai-credits";
import type { AIOperation } from "../use-ai-credits";

const defaultStatus = {
  creditsUsed: 5,
  creditsRemaining: 25,
  totalCredits: 30,
  resetDate: "2026-04-01",
  isPremium: false,
  percentageUsed: 16.67,
};

describe("useAICredits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCreditStatus.mockResolvedValue(defaultStatus);
  });

  it("fetches credit status on mount", async () => {
    const { result } = renderHook(() => useAICredits());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetCreditStatus).toHaveBeenCalledWith("user-1", "free");
    expect(result.current.status).toEqual(defaultStatus);
    expect(result.current.error).toBeNull();
  });

  it("sets error when fetch fails", async () => {
    mockGetCreditStatus.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAICredits());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load credit status");
    expect(result.current.status).toBeNull();
  });

  it("canUseCredits returns true when enough credits", async () => {
    const { result } = renderHook(() => useAICredits());

    await waitFor(() => {
      expect(result.current.status).not.toBeNull();
    });

    expect(result.current.canUseCredits("suggest-skills" as AIOperation)).toBe(true);
    expect(result.current.canUseCredits("generate-bullets" as AIOperation)).toBe(true);
  });

  it("canUseCredits returns false for premium-only features on free plan", async () => {
    const { result } = renderHook(() => useAICredits());

    await waitFor(() => {
      expect(result.current.status).not.toBeNull();
    });

    expect(result.current.canUseCredits("batch-enhance" as AIOperation)).toBe(false);
  });

  it("getCreditsNeeded returns correct cost", () => {
    const { result } = renderHook(() => useAICredits());

    expect(result.current.getCreditsNeeded("generate-bullets" as AIOperation)).toBe(2);
    expect(result.current.getCreditsNeeded("suggest-skills" as AIOperation)).toBe(1);
  });

  it("consumeCredits returns success when credits available (check-only, no deduction)", async () => {
    mockCheckCredits.mockResolvedValue({
      success: true,
      creditsUsed: 5,
      creditsRemaining: 25,
    });

    const { result } = renderHook(() => useAICredits());

    await waitFor(() => {
      expect(result.current.status).not.toBeNull();
    });

    let consumeResult: { success: boolean; error?: string };
    await act(async () => {
      consumeResult = await result.current.consumeCredits("generate-bullets" as AIOperation);
    });

    expect(consumeResult!.success).toBe(true);
    // Status unchanged - actual deduction happens server-side via withAIRoute
    expect(result.current.status?.creditsUsed).toBe(5);
  });

  it("consumeCredits returns error on insufficient credits", async () => {
    mockCheckCredits.mockResolvedValue({
      success: false,
      reason: "insufficient_credits",
      creditsRequired: 2,
      creditsRemaining: 0,
    });

    const { result } = renderHook(() => useAICredits());

    await waitFor(() => {
      expect(result.current.status).not.toBeNull();
    });

    let consumeResult: { success: boolean; error?: string };
    await act(async () => {
      consumeResult = await result.current.consumeCredits("generate-bullets" as AIOperation);
    });

    expect(consumeResult!.success).toBe(false);
    expect(consumeResult!.error).toContain("Not enough credits");
  });

  it("refreshStatus reloads data from service", async () => {
    const { result } = renderHook(() => useAICredits());

    await waitFor(() => {
      expect(result.current.status).not.toBeNull();
    });

    mockGetCreditStatus.mockResolvedValueOnce({
      ...defaultStatus,
      creditsUsed: 10,
      creditsRemaining: 20,
    });

    await act(async () => {
      await result.current.refreshStatus();
    });

    expect(result.current.status?.creditsUsed).toBe(10);
  });

  it("reports plan as free and isPremium false", () => {
    const { result } = renderHook(() => useAICredits());

    expect(result.current.plan).toBe("free");
    expect(result.current.isPremium).toBe(false);
  });
});