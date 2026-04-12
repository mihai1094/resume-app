import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDragAndDrop } from "../use-drag-and-drop";

describe("useDragAndDrop", () => {
  const items = ["a", "b", "c"];
  const onReorder = vi.fn();

  it("returns initial state with null indices", () => {
    const { result } = renderHook(() => useDragAndDrop(items, onReorder));

    expect(result.current.draggedIndex).toBeNull();
    expect(result.current.dragOverIndex).toBeNull();
    expect(result.current.dragOffset).toBeNull();
  });

  it("handleDragEnd resets all state", () => {
    const { result } = renderHook(() => useDragAndDrop(items, onReorder));

    act(() => {
      result.current.handleDragEnd();
    });

    expect(result.current.draggedIndex).toBeNull();
    expect(result.current.dragOverIndex).toBeNull();
    expect(result.current.dragOffset).toBeNull();
  });

  it("returns all expected handler functions", () => {
    const { result } = renderHook(() => useDragAndDrop(items, onReorder));

    expect(typeof result.current.handleDragStart).toBe("function");
    expect(typeof result.current.handleDragOver).toBe("function");
    expect(typeof result.current.handleDragLeave).toBe("function");
    expect(typeof result.current.handleDrop).toBe("function");
    expect(typeof result.current.handleDragEnd).toBe("function");
  });
});