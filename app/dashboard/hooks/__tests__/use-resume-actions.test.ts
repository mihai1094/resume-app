import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useResumeActions } from "../use-resume-actions";
import { toast } from "sonner";
import { ResumeData } from "@/lib/types/resume";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/services/export", () => ({
  exportToPDF: vi.fn(),
}));

vi.mock("@/lib/utils/download", () => ({
  downloadBlob: vi.fn(),
  downloadJSON: vi.fn(),
}));

vi.mock("@/lib/services/logger", () => ({
  logger: {
    error: vi.fn(),
    child: () => ({ error: vi.fn() }),
  },
}));

const mockResume = { id: "r1", name: "My Resume" };

describe("useResumeActions - delete confirmation", () => {
  let deleteResume: any;

  beforeEach(() => {
    vi.clearAllMocks();
    deleteResume = vi.fn().mockResolvedValue(true);
  });

  it("starts with no pending delete", () => {
    const { result } = renderHook(() => useResumeActions(deleteResume));

    expect(result.current.pendingDelete).toBeNull();
    expect(result.current.isDeletingResume).toBe(false);
  });

  it("sets pendingDelete when handleOpenDeleteDialog is called", () => {
    const { result } = renderHook(() => useResumeActions(deleteResume));

    act(() => {
      result.current.handleOpenDeleteDialog(mockResume);
    });

    expect(result.current.pendingDelete).toEqual(mockResume);
  });

  it("clears pendingDelete when handleCancelDelete is called", () => {
    const { result } = renderHook(() => useResumeActions(deleteResume));

    act(() => {
      result.current.handleOpenDeleteDialog(mockResume);
    });
    expect(result.current.pendingDelete).toEqual(mockResume);

    act(() => {
      result.current.handleCancelDelete();
    });
    expect(result.current.pendingDelete).toBeNull();
  });

  it("does not call deleteResume until confirmed", () => {
    const { result } = renderHook(() => useResumeActions(deleteResume));

    act(() => {
      result.current.handleOpenDeleteDialog(mockResume);
    });

    expect(deleteResume).not.toHaveBeenCalled();
  });

  it("calls deleteResume and shows success toast on confirm", async () => {
    const { result } = renderHook(() => useResumeActions(deleteResume));

    act(() => {
      result.current.handleOpenDeleteDialog(mockResume);
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(deleteResume).toHaveBeenCalledWith("r1");
    expect(toast.success).toHaveBeenCalledWith('"My Resume" has been deleted.');
    expect(result.current.pendingDelete).toBeNull();
    expect(result.current.isDeletingResume).toBe(false);
  });

  it("shows error toast when deleteResume returns false", async () => {
    deleteResume.mockResolvedValue(false);
    const { result } = renderHook(() => useResumeActions(deleteResume));

    act(() => {
      result.current.handleOpenDeleteDialog(mockResume);
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Failed to delete resume. Please try again."
    );
    expect(result.current.pendingDelete).toBeNull();
  });

  it("shows error toast when deleteResume throws", async () => {
    deleteResume.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useResumeActions(deleteResume));

    act(() => {
      result.current.handleOpenDeleteDialog(mockResume);
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Failed to delete resume. Please try again."
    );
    expect(result.current.pendingDelete).toBeNull();
    expect(result.current.isDeletingResume).toBe(false);
  });

  it("sets isDeletingResume to true while deleting", async () => {
    let resolveDelete: (value: boolean) => void;
    deleteResume.mockImplementation(
      () => new Promise<boolean>((resolve) => { resolveDelete = resolve; })
    );

    const { result } = renderHook(() => useResumeActions(deleteResume));

    act(() => {
      result.current.handleOpenDeleteDialog(mockResume);
    });

    let deletePromise: Promise<void>;
    act(() => {
      deletePromise = result.current.handleConfirmDelete();
    });

    expect(result.current.isDeletingResume).toBe(true);

    await act(async () => {
      resolveDelete!(true);
      await deletePromise!;
    });

    expect(result.current.isDeletingResume).toBe(false);
  });

  it("does nothing when handleConfirmDelete is called without pending delete", async () => {
    const { result } = renderHook(() => useResumeActions(deleteResume));

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(deleteResume).not.toHaveBeenCalled();
  });
});
