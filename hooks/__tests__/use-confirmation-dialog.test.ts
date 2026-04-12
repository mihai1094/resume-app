import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConfirmationDialog } from "../use-confirmation-dialog";

describe("useConfirmationDialog", () => {
  it("starts with null state and isConfirming false", () => {
    const { result } = renderHook(() => useConfirmationDialog());

    expect(result.current.confirmationState).toBeNull();
    expect(result.current.isConfirming).toBe(false);
  });

  it("openConfirmation sets state correctly", () => {
    const { result } = renderHook(() => useConfirmationDialog());
    const onConfirm = vi.fn();

    act(() => {
      result.current.openConfirmation(
        "Delete item",
        "Are you sure?",
        onConfirm
      );
    });

    expect(result.current.confirmationState).toEqual({
      isOpen: true,
      title: "Delete item",
      description: "Are you sure?",
      onConfirm,
      isDangerous: false,
    });
  });

  it("isDangerous flag propagates when set to true", () => {
    const { result } = renderHook(() => useConfirmationDialog());

    act(() => {
      result.current.openConfirmation(
        "Delete account",
        "This is permanent",
        vi.fn(),
        true
      );
    });

    expect(result.current.confirmationState?.isDangerous).toBe(true);
  });

  it("closeConfirmation clears state", () => {
    const { result } = renderHook(() => useConfirmationDialog());

    act(() => {
      result.current.openConfirmation("Title", "Desc", vi.fn());
    });
    expect(result.current.confirmationState).not.toBeNull();

    act(() => {
      result.current.closeConfirmation();
    });
    expect(result.current.confirmationState).toBeNull();
    expect(result.current.isConfirming).toBe(false);
  });

  it("handleConfirm calls onConfirm and closes", async () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => useConfirmationDialog());

    act(() => {
      result.current.openConfirmation("Title", "Desc", onConfirm);
    });

    await act(async () => {
      await result.current.handleConfirm();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(result.current.confirmationState).toBeNull();
    expect(result.current.isConfirming).toBe(false);
  });

  it("handleConfirm handles async onConfirm", async () => {
    let resolvePromise!: () => void;
    const asyncConfirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() => useConfirmationDialog());

    act(() => {
      result.current.openConfirmation("Title", "Desc", asyncConfirm);
    });

    let confirmPromise: Promise<void>;
    act(() => {
      confirmPromise = result.current.handleConfirm();
    });

    expect(asyncConfirm).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolvePromise();
      await confirmPromise;
    });

    expect(result.current.confirmationState).toBeNull();
    expect(result.current.isConfirming).toBe(false);
  });

  it("handleConfirm does nothing when no confirmation state", async () => {
    const { result } = renderHook(() => useConfirmationDialog());

    await act(async () => {
      await result.current.handleConfirm();
    });

    expect(result.current.confirmationState).toBeNull();
  });

  it("handleConfirm closes even if onConfirm throws", async () => {
    const failingConfirm = vi.fn(() => {
      throw new Error("boom");
    });

    const { result } = renderHook(() => useConfirmationDialog());

    act(() => {
      result.current.openConfirmation("Title", "Desc", failingConfirm);
    });

    await act(async () => {
      try {
        await result.current.handleConfirm();
      } catch {
        // expected
      }
    });

    expect(result.current.confirmationState).toBeNull();
  });
});