import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDismissedChecks } from "../use-dismissed-checks";

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

describe("useDismissedChecks", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads dismissed IDs from localStorage on mount", () => {
    localStorage.setItem(
      "dismissed-checks-resume-1",
      JSON.stringify(["check-a", "check-b"])
    );

    const { result } = renderHook(() => useDismissedChecks("resume-1"));

    expect(result.current.isDismissed("check-a")).toBe(true);
    expect(result.current.isDismissed("check-b")).toBe(true);
    expect(result.current.hasDismissed).toBe(true);
  });

  it("returns empty set when no resumeId", () => {
    const { result } = renderHook(() => useDismissedChecks(undefined));

    expect(result.current.hasDismissed).toBe(false);
    expect(result.current.isDismissed("any")).toBe(false);
  });

  it("dismissCheck adds ID to set and saves to storage", () => {
    const { result } = renderHook(() => useDismissedChecks("resume-1"));

    act(() => {
      result.current.dismissCheck("check-1");
    });

    expect(result.current.isDismissed("check-1")).toBe(true);
    expect(result.current.hasDismissed).toBe(true);

    const stored = JSON.parse(
      localStorage.getItem("dismissed-checks-resume-1")!
    );
    expect(stored).toContain("check-1");
  });

  it("restoreCheck removes ID from set and saves to storage", () => {
    localStorage.setItem(
      "dismissed-checks-resume-1",
      JSON.stringify(["check-1", "check-2"])
    );

    const { result } = renderHook(() => useDismissedChecks("resume-1"));

    act(() => {
      result.current.restoreCheck("check-1");
    });

    expect(result.current.isDismissed("check-1")).toBe(false);
    expect(result.current.isDismissed("check-2")).toBe(true);

    const stored = JSON.parse(
      localStorage.getItem("dismissed-checks-resume-1")!
    );
    expect(stored).not.toContain("check-1");
    expect(stored).toContain("check-2");
  });

  it("resetAll clears all dismissed checks", () => {
    localStorage.setItem(
      "dismissed-checks-resume-1",
      JSON.stringify(["check-1", "check-2"])
    );

    const { result } = renderHook(() => useDismissedChecks("resume-1"));

    act(() => {
      result.current.resetAll();
    });

    expect(result.current.hasDismissed).toBe(false);
    expect(localStorage.getItem("dismissed-checks-resume-1")).toBeNull();
  });

  it("isDismissed returns correct boolean", () => {
    const { result } = renderHook(() => useDismissedChecks("resume-1"));

    expect(result.current.isDismissed("check-1")).toBe(false);

    act(() => {
      result.current.dismissCheck("check-1");
    });

    expect(result.current.isDismissed("check-1")).toBe(true);
    expect(result.current.isDismissed("check-2")).toBe(false);
  });

  it("handles corrupted localStorage data gracefully", () => {
    localStorage.setItem("dismissed-checks-resume-1", "not-valid-json{");

    const { result } = renderHook(() => useDismissedChecks("resume-1"));

    expect(result.current.hasDismissed).toBe(false);
  });

  it("handles non-array localStorage data gracefully", () => {
    localStorage.setItem(
      "dismissed-checks-resume-1",
      JSON.stringify({ not: "an array" })
    );

    const { result } = renderHook(() => useDismissedChecks("resume-1"));

    expect(result.current.hasDismissed).toBe(false);
  });
});