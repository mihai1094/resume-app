import { describe, it, expect, vi, beforeEach } from "vitest";
import { trackAiEvent } from "../telemetry";

vi.mock("@/lib/services/logger", () => ({
  aiLogger: { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

vi.mock("@/lib/privacy/consent", () => ({
  isGrantedCookieConsent: vi.fn(() => true),
  readCookieConsentClient: vi.fn(() => ({})),
}));

describe("trackAiEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clean up any analytics on window
    delete (window as any).analytics;
    delete (window as any).plausible;
  });

  it("does not throw with valid event and payload", () => {
    expect(() =>
      trackAiEvent("trigger", {
        surface: "editor",
        action: "generate-bullets",
      })
    ).not.toThrow();
  });

  it("calls window.analytics.track if available", () => {
    const mockTrack = vi.fn();
    (window as any).analytics = { track: mockTrack };

    trackAiEvent("success", {
      surface: "editor",
      action: "generate-summary",
      durationMs: 500,
    });

    expect(mockTrack).toHaveBeenCalledWith(
      "ai:success",
      expect.objectContaining({
        event: "success",
        surface: "editor",
        action: "generate-summary",
        durationMs: 500,
      })
    );
  });

  it("calls window.plausible if analytics is not available", () => {
    const mockPlausible = vi.fn();
    (window as any).plausible = mockPlausible;

    trackAiEvent("failure", {
      surface: "editor",
      action: "analyze-ats",
      error: "timeout",
    });

    expect(mockPlausible).toHaveBeenCalledWith(
      "ai:failure",
      expect.objectContaining({
        props: expect.objectContaining({
          event: "failure",
          error: "timeout",
        }),
      })
    );
  });

  it("falls back to logger in development mode", async () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", { value: "development", writable: true });

    // Re-import to pick up the mocked module
    const { aiLogger } = await import("@/lib/services/logger");

    trackAiEvent("apply", {
      surface: "editor",
      action: "improve-bullet",
    });

    // The function should call aiLogger.debug as fallback
    // when no analytics or plausible is on window
    expect(aiLogger.debug).toHaveBeenCalled();

    Object.defineProperty(process.env, "NODE_ENV", { value: originalEnv, writable: true });
  });

  it("respects cookie consent", async () => {
    const { isGrantedCookieConsent } = await import("@/lib/privacy/consent");
    vi.mocked(isGrantedCookieConsent).mockReturnValue(false);

    const mockTrack = vi.fn();
    (window as any).analytics = { track: mockTrack };

    trackAiEvent("trigger", { surface: "editor", action: "test" });

    expect(mockTrack).not.toHaveBeenCalled();
  });

  it("handles all event types without error", () => {
    const events = ["trigger", "success", "failure", "apply", "undo"] as const;
    events.forEach((event) => {
      expect(() =>
        trackAiEvent(event, { surface: "test", action: "test" })
      ).not.toThrow();
    });
  });
});
