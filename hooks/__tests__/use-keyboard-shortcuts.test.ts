import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  useKeyboardShortcuts,
  useResumeEditorShortcuts,
} from "../use-keyboard-shortcuts";

function fireKey(
  key: string,
  opts: Partial<KeyboardEventInit> = {}
): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    ...opts,
  });
  vi.spyOn(event, "preventDefault");
  window.dispatchEvent(event);
  return event;
}

describe("useKeyboardShortcuts", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls handler when matching key combo (Ctrl+S)", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "s", ctrl: true, handler }])
    );

    fireKey("s", { ctrlKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not call handler when modifier does not match", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "s", ctrl: true, handler }])
    );

    fireKey("s");
    expect(handler).not.toHaveBeenCalled();
  });

  it("matches metaKey as ctrl (Cmd on Mac)", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "s", ctrl: true, handler }])
    );

    fireKey("s", { metaKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("calls preventDefault by default", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "s", ctrl: true, handler }])
    );

    const event = fireKey("s", { ctrlKey: true });
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("does not call preventDefault when preventDefault is false", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([
        { key: "Enter", handler, preventDefault: false },
      ])
    );

    const event = fireKey("Enter");
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("supports multiple shortcuts", () => {
    const saveHandler = vi.fn();
    const undoHandler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([
        { key: "s", ctrl: true, handler: saveHandler },
        { key: "z", ctrl: true, handler: undoHandler },
      ])
    );

    fireKey("s", { ctrlKey: true });
    fireKey("z", { ctrlKey: true });

    expect(saveHandler).toHaveBeenCalledTimes(1);
    expect(undoHandler).toHaveBeenCalledTimes(1);
  });

  it("ignores events with undefined key", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "s", ctrl: true, handler }])
    );

    const event = new KeyboardEvent("keydown", { bubbles: true });
    window.dispatchEvent(event);
    expect(handler).not.toHaveBeenCalled();
  });

  it("cleans up listener on unmount", () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([{ key: "s", ctrl: true, handler }])
    );

    unmount();
    fireKey("s", { ctrlKey: true });
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("useResumeEditorShortcuts", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls onSave on Ctrl+S", () => {
    const onSave = vi.fn();
    renderHook(() => useResumeEditorShortcuts({ onSave }));

    fireKey("s", { ctrlKey: true });
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("calls onUndo on Ctrl+Z", () => {
    const onUndo = vi.fn();
    renderHook(() => useResumeEditorShortcuts({ onUndo }));

    fireKey("z", { ctrlKey: true });
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it("calls onRedo on Ctrl+Shift+Z", () => {
    const onRedo = vi.fn();
    renderHook(() => useResumeEditorShortcuts({ onRedo }));

    fireKey("z", { ctrlKey: true, shiftKey: true });
    expect(onRedo).toHaveBeenCalledTimes(1);
  });

  it("calls onRedo on Ctrl+Y", () => {
    const onRedo = vi.fn();
    renderHook(() => useResumeEditorShortcuts({ onRedo }));

    fireKey("y", { ctrlKey: true });
    expect(onRedo).toHaveBeenCalledTimes(1);
  });

  it("calls onExportPDF on Ctrl+P", () => {
    const onExportPDF = vi.fn();
    renderHook(() => useResumeEditorShortcuts({ onExportPDF }));

    fireKey("p", { ctrlKey: true });
    expect(onExportPDF).toHaveBeenCalledTimes(1);
  });

  it("does not throw when optional handlers are not provided", () => {
    renderHook(() => useResumeEditorShortcuts({}));

    fireKey("s", { ctrlKey: true });
    fireKey("z", { ctrlKey: true });
  });
});