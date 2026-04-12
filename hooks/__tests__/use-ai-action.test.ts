import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAiAction } from "../use-ai-action";

// Mock dependencies
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock("@/lib/ai/telemetry", () => ({
  trackAiEvent: vi.fn(),
}));

describe("useAiAction", () => {
  const defaultOptions = {
    actionName: "test-action",
    surface: "test-surface",
    showToast: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts in idle state with no suggestion", () => {
    const { result } = renderHook(() => useAiAction(defaultOptions));
    expect(result.current.status).toBe("idle");
    expect(result.current.suggestion).toBeNull();
    expect(result.current.hasSuggestion).toBe(false);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.statusLabel).toBe("Idle");
  });

  it("transitions to running then ready on successful run", async () => {
    const perform = vi.fn().mockResolvedValue("AI result");
    const { result } = renderHook(() =>
      useAiAction({ ...defaultOptions, perform })
    );

    await act(async () => {
      await result.current.run();
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.suggestion).toBe("AI result");
    expect(result.current.hasSuggestion).toBe(true);
    expect(result.current.statusLabel).toBe("Ready to apply");
  });

  it("transitions to error on failed run", async () => {
    const perform = vi.fn().mockRejectedValue(new Error("API failed"));
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAiAction({ ...defaultOptions, perform, onError })
    );

    await act(async () => {
      await result.current.run();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("API failed");
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it("run returns null on failure", async () => {
    const perform = vi.fn().mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() =>
      useAiAction({ ...defaultOptions, perform })
    );

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.run();
    });

    expect(returnValue).toBeNull();
  });

  it("apply calls onApply with suggestion and sets applied status", async () => {
    const onApply = vi.fn();
    const perform = vi.fn().mockResolvedValue("suggestion text");
    const { result } = renderHook(() =>
      useAiAction({ ...defaultOptions, perform, onApply })
    );

    await act(async () => {
      await result.current.run();
    });

    act(() => {
      result.current.apply();
    });

    expect(onApply).toHaveBeenCalledWith("suggestion text");
    expect(result.current.status).toBe("applied");
  });

  it("apply with previousValue enables undo", async () => {
    const onApply = vi.fn();
    const perform = vi.fn().mockResolvedValue("new text");
    const { result } = renderHook(() =>
      useAiAction({ ...defaultOptions, perform, onApply })
    );

    await act(async () => {
      await result.current.run();
    });

    act(() => {
      result.current.apply("old text");
    });

    expect(result.current.canUndo).toBe(true);
  });

  it("undo reverts to previous value", async () => {
    const onApply = vi.fn();
    const perform = vi.fn().mockResolvedValue("new text");
    const { result } = renderHook(() =>
      useAiAction({ ...defaultOptions, perform, onApply })
    );

    await act(async () => {
      await result.current.run();
    });

    act(() => {
      result.current.apply("old text");
    });

    act(() => {
      result.current.undo();
    });

    expect(onApply).toHaveBeenLastCalledWith("old text");
    expect(result.current.status).toBe("ready");
    expect(result.current.canUndo).toBe(false);
  });

  it("undo returns false when no history", () => {
    const { result } = renderHook(() => useAiAction(defaultOptions));

    let undoResult: boolean;
    act(() => {
      undoResult = result.current.undo();
    });

    expect(undoResult!).toBe(false);
  });

  it("apply returns false when no suggestion", () => {
    const { result } = renderHook(() => useAiAction(defaultOptions));

    let applyResult: boolean;
    act(() => {
      applyResult = result.current.apply();
    });

    expect(applyResult!).toBe(false);
  });

  it("reset clears all state back to idle", async () => {
    const perform = vi.fn().mockResolvedValue("result");
    const { result } = renderHook(() =>
      useAiAction({ ...defaultOptions, perform })
    );

    await act(async () => {
      await result.current.run();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.suggestion).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.hasSuggestion).toBe(false);
  });

  it("run accepts override perform function", async () => {
    const defaultPerform = vi.fn().mockResolvedValue("default");
    const overridePerform = vi.fn().mockResolvedValue("override");
    const { result } = renderHook(() =>
      useAiAction({ ...defaultOptions, perform: defaultPerform })
    );

    await act(async () => {
      await result.current.run(overridePerform);
    });

    expect(overridePerform).toHaveBeenCalled();
    expect(defaultPerform).not.toHaveBeenCalled();
    expect(result.current.suggestion).toBe("override");
  });

  it("throws if no perform function provided", async () => {
    const { result } = renderHook(() => useAiAction(defaultOptions));

    await expect(
      act(async () => {
        await result.current.run();
      })
    ).rejects.toThrow("No perform function provided");
  });

  it("tracks telemetry events", async () => {
    const { trackAiEvent } = await import("@/lib/ai/telemetry");
    const perform = vi.fn().mockResolvedValue("result");
    const { result } = renderHook(() =>
      useAiAction({ ...defaultOptions, perform })
    );

    await act(async () => {
      await result.current.run();
    });

    expect(trackAiEvent).toHaveBeenCalledWith("trigger", expect.objectContaining({
      surface: "test-surface",
      action: "test-action",
    }));
    expect(trackAiEvent).toHaveBeenCalledWith("success", expect.objectContaining({
      surface: "test-surface",
    }));
  });
});
