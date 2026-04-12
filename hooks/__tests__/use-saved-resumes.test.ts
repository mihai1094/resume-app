import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  mergeUniqueResumes,
  timestampToISO,
  useSavedResumes,
  type SavedResume,
} from "../use-saved-resumes";

const {
  mockSubscribeToSavedResumes,
  mockGetSavedResumeCount,
  mockGetSavedResumesPage,
  mockSaveResume,
  mockUpdateResume,
  mockDeleteResume,
  mockGetResumeById,
  mockGetCurrentResumeWithMeta,
  mockUseUser,
  mockCreatePrefixedId,
} = vi.hoisted(() => ({
  mockSubscribeToSavedResumes: vi.fn(),
  mockGetSavedResumeCount: vi.fn(),
  mockGetSavedResumesPage: vi.fn(),
  mockSaveResume: vi.fn(),
  mockUpdateResume: vi.fn(),
  mockDeleteResume: vi.fn(),
  mockGetResumeById: vi.fn(),
  mockGetCurrentResumeWithMeta: vi.fn(),
  mockUseUser: vi.fn(),
  mockCreatePrefixedId: vi.fn(() => "resume-fixed-id"),
}));

vi.mock("@/lib/services/firestore", () => ({
  firestoreService: {
    subscribeToSavedResumes: mockSubscribeToSavedResumes,
    getSavedResumeCount: mockGetSavedResumeCount,
    getSavedResumesPage: mockGetSavedResumesPage,
    saveResume: mockSaveResume,
    updateResume: mockUpdateResume,
    deleteResume: mockDeleteResume,
    getResumeById: mockGetResumeById,
    getCurrentResumeWithMeta: mockGetCurrentResumeWithMeta,
  },
}));

vi.mock("../use-user", () => ({
  useUser: () => mockUseUser(),
}));

vi.mock("@/lib/utils/id", () => ({
  createPrefixedId: () => mockCreatePrefixedId(),
}));

vi.mock("@/lib/services/logger", () => ({
  logger: {
    child: () => ({
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    }),
  },
}));

const baseResume = {
  personalInfo: {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    phone: "1234567890",
    location: "Madrid",
  },
  workExperience: [],
  education: [],
  skills: [],
};

function makeSavedResume(id: string, updatedAt: string): SavedResume {
  return {
    id,
    name: `Resume ${id}`,
    templateId: "modern",
    data: baseResume,
    createdAt: updatedAt,
    updatedAt,
  };
}

describe("useSavedResumes helpers", () => {
  it("mergeUniqueResumes prefers the incoming items and de-duplicates by id", () => {
    const merged = mergeUniqueResumes(
      [makeSavedResume("b", "2026-04-11T10:00:00.000Z")],
      [
        makeSavedResume("a", "2026-04-10T10:00:00.000Z"),
        makeSavedResume("b", "2026-04-09T10:00:00.000Z"),
      ]
    );

    expect(merged.map((resume) => resume.id)).toEqual(["b", "a"]);
    expect(merged[0].updatedAt).toBe("2026-04-11T10:00:00.000Z");
  });

  it("timestampToISO supports Firestore-like timestamps and serialized timestamps", () => {
    expect(
      timestampToISO({ toDate: () => new Date("2026-04-11T09:15:00.000Z") })
    ).toBe("2026-04-11T09:15:00.000Z");

    expect(
      timestampToISO({ seconds: 1_744_363_300, nanoseconds: 0 })
    ).toBe("2025-04-11T09:21:40.000Z");
  });
});

describe("useSavedResumes", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseUser.mockReturnValue({
      user: { id: "user-1", plan: "free" },
    });

    mockSubscribeToSavedResumes.mockImplementation(
      (_userId: string, onChange: (items: unknown[], meta: { lastDoc: unknown }) => void) => {
        onChange(
          [
            {
              id: "resume-1",
              name: "Resume 1",
              templateId: "modern",
              data: baseResume,
              createdAt: { toDate: () => new Date("2026-04-11T09:00:00.000Z") },
              updatedAt: { toDate: () => new Date("2026-04-11T10:00:00.000Z") },
            },
          ],
          { lastDoc: { id: "cursor-1" } }
        );
        return vi.fn();
      }
    );
    mockGetSavedResumeCount.mockResolvedValue(1);
    mockGetSavedResumesPage.mockResolvedValue({
      items: [
        {
          id: "resume-2",
          name: "Resume 2",
          templateId: "modern",
          data: baseResume,
          createdAt: { toDate: () => new Date("2026-04-10T09:00:00.000Z") },
          updatedAt: { toDate: () => new Date("2026-04-10T10:00:00.000Z") },
        },
      ],
      lastDoc: null,
      hasMore: false,
    });
    mockSaveResume.mockResolvedValue({
      createdAt: "2026-04-11T10:30:00.000Z",
      updatedAt: "2026-04-11T10:30:00.000Z",
    });
    mockUpdateResume.mockResolvedValue({
      updatedAt: "2026-04-11T11:00:00.000Z",
    });
    mockDeleteResume.mockResolvedValue(true);
    mockGetResumeById.mockResolvedValue(null);
    mockGetCurrentResumeWithMeta.mockResolvedValue(null);
  });

  it("loads the first page via subscription and exposes pagination state", async () => {
    const { result } = renderHook(() => useSavedResumes("user-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.resumes).toHaveLength(1);
    expect(result.current.resumes[0].id).toBe("resume-1");
    expect(result.current.resumeCount).toBe(1);
    expect(result.current.hasMoreResumes).toBe(false);
  });

  it("loads more resumes and merges them without duplicating existing ids", async () => {
    mockGetSavedResumeCount.mockResolvedValue(3);
    mockGetSavedResumesPage.mockResolvedValue({
      items: [
        {
          id: "resume-1",
          name: "Resume 1 older copy",
          templateId: "modern",
          data: baseResume,
          createdAt: { toDate: () => new Date("2026-04-11T09:00:00.000Z") },
          updatedAt: { toDate: () => new Date("2026-04-11T10:00:00.000Z") },
        },
        {
          id: "resume-2",
          name: "Resume 2",
          templateId: "modern",
          data: baseResume,
          createdAt: { toDate: () => new Date("2026-04-10T09:00:00.000Z") },
          updatedAt: { toDate: () => new Date("2026-04-10T10:00:00.000Z") },
        },
      ],
      lastDoc: null,
      hasMore: false,
    });

    const { result } = renderHook(() => useSavedResumes("user-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasMoreResumes).toBe(true);

    await act(async () => {
      await result.current.loadMoreResumes();
    });

    expect(result.current.resumes.map((resume) => resume.id)).toEqual([
      "resume-1",
      "resume-2",
    ]);
  });

  it("returns a PlanLimitError before calling Firestore when the free limit is reached", async () => {
    mockGetSavedResumeCount.mockResolvedValue(3);
    mockSubscribeToSavedResumes.mockImplementation(
      (_userId: string, onChange: (items: unknown[], meta: { lastDoc: unknown }) => void) => {
        onChange(
          Array.from({ length: 3 }, (_, index) => ({
            id: `resume-${index + 1}`,
            name: `Resume ${index + 1}`,
            templateId: "modern",
            data: baseResume,
            createdAt: { toDate: () => new Date("2026-04-11T09:00:00.000Z") },
            updatedAt: { toDate: () => new Date("2026-04-11T10:00:00.000Z") },
          })),
          { lastDoc: { id: "cursor-1" } }
        );
        return vi.fn();
      }
    );

    const { result } = renderHook(() => useSavedResumes("user-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const response = await result.current.saveResume("Blocked", "modern", baseResume);

    expect(response).toEqual({
      code: "PLAN_LIMIT",
      current: 3,
      limit: 3,
    });
    expect(mockSaveResume).not.toHaveBeenCalled();
  });

  it("supports save, update, and delete flows", async () => {
    const { result } = renderHook(() => useSavedResumes("user-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let created: Awaited<ReturnType<typeof result.current.saveResume>> | null = null;
    await act(async () => {
      created = await result.current.saveResume("New Resume", "modern", baseResume);
    });

    expect(mockSaveResume).toHaveBeenCalledWith(
      "user-1",
      "resume-fixed-id",
      "New Resume",
      "modern",
      baseResume,
      "free",
      undefined,
      undefined,
      { skipLimitCheck: true }
    );
    expect(created && typeof created === "object" && "id" in (created as Record<string, unknown>) ? (created as { id: string }).id : null).toBe("resume-fixed-id");

    await act(async () => {
      await result.current.updateResume("resume-1", { name: "Updated Resume" });
    });

    expect(mockUpdateResume).toHaveBeenCalledWith(
      "user-1",
      "resume-1",
      { name: "Updated Resume" },
      {}
    );
    await waitFor(() =>
      expect(
        result.current.resumes.find((resume) => resume.id === "resume-1")?.updatedAt
      ).toBe("2026-04-11T11:00:00.000Z")
    );

    let deleted = false;
    await act(async () => {
      deleted = await result.current.deleteResume("resume-1");
    });

    expect(deleted).toBe(true);
    expect(result.current.resumes.some((resume) => resume.id === "resume-1")).toBe(false);
  });
});
