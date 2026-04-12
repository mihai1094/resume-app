import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useResumeEditorContainer } from "../use-resume-editor-container";
import {
  createCompleteResume,
  createMinimalResume,
} from "@/tests/fixtures/resume-data";

const {
  mockGetResumeById,
  mockGetLatestResume,
  mockUpsertResume,
  mockSaveCurrentResume,
  mockClearCurrentResume,
  mockLoadResume,
  mockResetResume,
  mockSaveDraft,
  mockLoadDraft,
  mockClearDirtyFlag,
  mockClearDraft,
  mockResumeStateRef,
} = vi.hoisted(() => ({
  mockGetResumeById: vi.fn(),
  mockGetLatestResume: vi.fn(),
  mockUpsertResume: vi.fn(),
  mockSaveCurrentResume: vi.fn(),
  mockClearCurrentResume: vi.fn(),
  mockLoadResume: vi.fn(),
  mockResetResume: vi.fn(),
  mockSaveDraft: vi.fn(),
  mockLoadDraft: vi.fn(),
  mockClearDirtyFlag: vi.fn(),
  mockClearDraft: vi.fn(),
  mockResumeStateRef: {
    current: {
      resumeData: null as ReturnType<typeof createMinimalResume> | null,
      isDirty: false,
      validation: {
        valid: true,
        errors: [] as Array<{ field: string; message: string }>,
      },
    },
  },
}));

vi.mock("@/hooks/use-user", () => ({
  useUser: () => ({
    user: { id: "user-1" },
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-saved-resumes", () => ({
  useSavedResumes: () => ({
    getResumeById: mockGetResumeById,
    getLatestResume: mockGetLatestResume,
    upsertResume: mockUpsertResume,
  }),
}));

vi.mock("@/hooks/use-session-draft", () => ({
  useSessionDraft: () => ({
    saveDraft: mockSaveDraft,
    loadDraft: mockLoadDraft,
    clearDirtyFlag: mockClearDirtyFlag,
    clearDraft: mockClearDraft,
  }),
}));

vi.mock("@/hooks/use-resume", () => ({
  useResume: () => ({
    resumeData: mockResumeStateRef.current.resumeData,
    resetResume: mockResetResume,
    loadResume: mockLoadResume,
    validation: mockResumeStateRef.current.validation,
    isDirty: mockResumeStateRef.current.isDirty,
  }),
}));

vi.mock("@/lib/services/firestore", () => ({
  firestoreService: {
    saveCurrentResume: mockSaveCurrentResume,
    clearCurrentResume: mockClearCurrentResume,
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/services/logger", () => ({
  logger: {
    child: () => ({
      error: vi.fn(),
    }),
  },
}));

describe("useResumeEditorContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockResumeStateRef.current = {
      resumeData: createMinimalResume(),
      isDirty: false,
      validation: { valid: true, errors: [] },
    };

    mockGetResumeById.mockResolvedValue({
      id: "resume-1",
      name: "Saved Resume",
      templateId: "modern",
      data: createCompleteResume(),
      updatedAt: new Date().toISOString(),
      customization: null,
    });
    mockGetLatestResume.mockResolvedValue(null);
    mockUpsertResume.mockResolvedValue(null);
    mockSaveCurrentResume.mockResolvedValue(true);
    mockClearCurrentResume.mockResolvedValue(true);
    mockLoadDraft.mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function flushMicrotasks() {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  it("does not autosave a pristine loaded resume", async () => {
    renderHook(() =>
      useResumeEditorContainer({
        resumeId: "resume-1",
      })
    );

    await flushMicrotasks();

    expect(mockGetResumeById).toHaveBeenCalledWith("resume-1");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });

    expect(mockSaveCurrentResume).not.toHaveBeenCalled();
  });

  it("autosaves when the editor has dirty changes", async () => {
    mockResumeStateRef.current = {
      resumeData: createMinimalResume(),
      isDirty: true,
      validation: { valid: true, errors: [] },
    };

    renderHook(() =>
      useResumeEditorContainer({
        resumeId: null,
      })
    );

    await flushMicrotasks();

    expect(mockSaveDraft).toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });

    expect(mockSaveCurrentResume).toHaveBeenCalledWith(
      "user-1",
      mockResumeStateRef.current.resumeData,
      undefined
    );
  });

  it("clears the cloud draft when explicitly finalized after save", async () => {
    const { result } = renderHook(() =>
      useResumeEditorContainer({
        resumeId: null,
      })
    );

    await flushMicrotasks();

    expect(result.current.isInitializing).toBe(false);

    await act(async () => {
      await result.current.clearCurrentDraftAfterSave();
    });

    expect(mockClearCurrentResume).toHaveBeenCalledWith("user-1");
  });
});
