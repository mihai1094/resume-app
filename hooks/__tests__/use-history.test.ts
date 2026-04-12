import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHistory } from "../use-history";

describe("useHistory", () => {
  it("initializes with the given state", () => {
    const { result } = renderHook(() => useHistory("initial"));
    expect(result.current.state).toBe("initial");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("updates state and pushes to history", () => {
    const { result } = renderHook(() => useHistory("v1"));

    act(() => {
      result.current.updateState("v2");
    });

    expect(result.current.state).toBe("v2");
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("undo reverts to previous state", () => {
    const { result } = renderHook(() => useHistory("v1"));

    act(() => result.current.updateState("v2"));
    act(() => result.current.undo());

    expect(result.current.state).toBe("v1");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it("redo restores undone state", () => {
    const { result } = renderHook(() => useHistory("v1"));

    act(() => result.current.updateState("v2"));
    act(() => result.current.undo());
    act(() => result.current.redo());

    expect(result.current.state).toBe("v2");
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("undo does nothing when at beginning", () => {
    const { result } = renderHook(() => useHistory("v1"));

    act(() => result.current.undo());

    expect(result.current.state).toBe("v1");
  });

  it("redo does nothing when at end", () => {
    const { result } = renderHook(() => useHistory("v1"));

    act(() => result.current.redo());

    expect(result.current.state).toBe("v1");
  });

  it("new update after undo clears redo history", async () => {
    const { result } = renderHook(() => useHistory("v1"));

    act(() => result.current.updateState("v2"));
    act(() => result.current.updateState("v3"));
    act(() => result.current.undo());
    // Now at v2, v3 should be in redo
    expect(result.current.canRedo).toBe(true);

    // Wait for isUndoingRef to clear (setTimeout(0) in undo)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    act(() => result.current.updateState("v4"));
    // Redo should now be cleared
    expect(result.current.canRedo).toBe(false);
    expect(result.current.state).toBe("v4");
  });

  it("respects maxHistorySize", () => {
    const { result } = renderHook(() => useHistory(0, 5));

    // Push 10 states (more than max of 5)
    for (let i = 1; i <= 10; i++) {
      act(() => result.current.updateState(i));
    }

    expect(result.current.state).toBe(10);

    // Should only be able to undo a limited number of times
    let undoCount = 0;
    while (result.current.canUndo) {
      act(() => result.current.undo());
      undoCount++;
    }
    expect(undoCount).toBeLessThanOrEqual(5);
  });

  it("reset clears history and sets new state", () => {
    const { result } = renderHook(() => useHistory("v1"));

    act(() => result.current.updateState("v2"));
    act(() => result.current.updateState("v3"));
    act(() => result.current.reset("fresh"));

    expect(result.current.state).toBe("fresh");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("works with complex object state", () => {
    const initial = { name: "Alex", count: 0 };
    const { result } = renderHook(() => useHistory(initial));

    act(() => result.current.updateState({ name: "Alex", count: 1 }));
    act(() => result.current.updateState({ name: "Alex", count: 2 }));
    act(() => result.current.undo());

    expect(result.current.state).toEqual({ name: "Alex", count: 1 });
  });

  it("multiple undo/redo cycles work correctly", () => {
    const { result } = renderHook(() => useHistory("a"));

    act(() => result.current.updateState("b"));
    act(() => result.current.updateState("c"));

    // Undo twice
    act(() => result.current.undo());
    act(() => result.current.undo());
    expect(result.current.state).toBe("a");

    // Redo twice
    act(() => result.current.redo());
    act(() => result.current.redo());
    expect(result.current.state).toBe("c");
  });
});
