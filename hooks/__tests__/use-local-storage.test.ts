import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "../use-local-storage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("deduplicates writes when the value has not changed", () => {
    const setItemSpy = vi.spyOn(window.localStorage.__proto__, "setItem");

    const { result } = renderHook(() =>
      useLocalStorage("test-key", { count: 1 }, 10)
    );

    act(() => {
      vi.runAllTimers();
    });
    expect(setItemSpy).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.setValue((prev) => prev);
      vi.runAllTimers();
    });

    expect(setItemSpy).toHaveBeenCalledTimes(1);
  });

  it("surfaces errors when localStorage writes fail", () => {
    vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    const { result } = renderHook(() =>
      useLocalStorage("error-key", { foo: "bar" }, 10)
    );

    act(() => {
      result.current.setValue({ foo: "baz" });
      vi.runAllTimers();
    });

    expect(result.current.saveError).toMatch(/save to localStorage/i);
  });
});

