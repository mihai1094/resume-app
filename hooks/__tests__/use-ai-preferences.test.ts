import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAiPreferences } from "../use-ai-preferences";

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

describe("useAiPreferences", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns default preferences on first use", () => {
    const { result } = renderHook(() => useAiPreferences());

    expect(result.current.preferences).toEqual({
      tone: "professional",
      length: "medium",
    });
  });

  it("setTone updates the tone preference", () => {
    const { result } = renderHook(() => useAiPreferences());

    act(() => {
      result.current.setTone("concise");
    });

    expect(result.current.preferences.tone).toBe("concise");
    expect(result.current.preferences.length).toBe("medium");
  });

  it("setLength updates the length preference", () => {
    const { result } = renderHook(() => useAiPreferences());

    act(() => {
      result.current.setLength("long");
    });

    expect(result.current.preferences.length).toBe("long");
    expect(result.current.preferences.tone).toBe("professional");
  });

  it("summary reflects current preferences", () => {
    const { result } = renderHook(() => useAiPreferences());

    expect(result.current.summary).toBe("professional \u00b7 medium");

    act(() => {
      result.current.setTone("impactful");
    });

    expect(result.current.summary).toBe("impactful \u00b7 medium");

    act(() => {
      result.current.setLength("short");
    });

    expect(result.current.summary).toBe("impactful \u00b7 short");
  });

  it("persists preferences to localStorage", () => {
    const { result } = renderHook(() => useAiPreferences());

    act(() => {
      result.current.setTone("friendly");
    });

    act(() => {
      vi.runAllTimers();
    });

    const stored = localStorage.getItem("ai-preferences");
    expect(stored).not.toBeNull();
    // useLocalStorage wraps values in { data, timestamp }
    const parsed = JSON.parse(stored!);
    expect(parsed.data.tone).toBe("friendly");
  });

  it("loads persisted preferences from localStorage", () => {
    // useLocalStorage expects { data, timestamp } wrapper
    localStorage.setItem(
      "ai-preferences",
      JSON.stringify({
        data: { tone: "concise", length: "short" },
        timestamp: Date.now(),
      })
    );

    const { result } = renderHook(() => useAiPreferences());

    expect(result.current.preferences.tone).toBe("concise");
    expect(result.current.preferences.length).toBe("short");
  });
});