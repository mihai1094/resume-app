import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSessionDraft } from "../use-session-draft";
import { ResumeData } from "@/lib/types/resume";

// Mock crypto.randomUUID
const mockUUID = "test-uuid-1234";
vi.stubGlobal("crypto", {
  randomUUID: vi.fn(() => mockUUID),
});

describe("useSessionDraft", () => {
  const mockResumeData: ResumeData = {
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      location: "New York",
      summary: "A software developer",
    },
    workExperience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    certifications: [],
    courses: [],
    hobbies: [],
    extraCurricular: [],
    customSections: [],
  };

  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("saveDraft", () => {
    it("should save draft to sessionStorage", () => {
      const { result } = renderHook(() => useSessionDraft("resume-123"));

      act(() => {
        result.current.saveDraft(mockResumeData);
      });

      const saved = sessionStorage.getItem("resume_editor_draft");
      expect(saved).not.toBeNull();
      expect(JSON.parse(saved!)).toEqual(mockResumeData);

      const meta = sessionStorage.getItem("resume_editor_draft_meta");
      expect(meta).not.toBeNull();
      const parsedMeta = JSON.parse(meta!);
      expect(parsedMeta.resumeId).toBe("resume-123");
      expect(parsedMeta.isDirty).toBe(true);
      expect(parsedMeta.lastModified).toBeDefined();
    });

    it("should save with 'new' as resumeId when resumeId is null", () => {
      const { result } = renderHook(() => useSessionDraft(null));

      act(() => {
        result.current.saveDraft(mockResumeData);
      });

      const saved = sessionStorage.getItem("resume_editor_draft");
      expect(saved).not.toBeNull();
      expect(JSON.parse(saved!)).toEqual(mockResumeData);

      const meta = sessionStorage.getItem("resume_editor_draft_meta");
      const parsedMeta = JSON.parse(meta!);
      expect(parsedMeta.resumeId).toBe("new");
    });

    it("should handle quota exceeded error silently", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Render the hook first (before mocking setItem to throw)
      const { result } = renderHook(() => useSessionDraft("resume-123"));

      // Now mock setItem to throw only for subsequent calls
      const setItemSpy = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("QuotaExceededError");
        });

      // Should not throw
      act(() => {
        result.current.saveDraft(mockResumeData);
      });

      expect(warnSpy).toHaveBeenCalledWith(
        "Session draft save failed:",
        expect.any(Error)
      );

      setItemSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });

  describe("loadDraft", () => {
    it("should load draft from sessionStorage when resumeId matches", () => {
      // First save a draft
      const { result: saveResult } = renderHook(() =>
        useSessionDraft("resume-123")
      );
      act(() => {
        saveResult.current.saveDraft(mockResumeData);
      });

      // Then load it
      const { result: loadResult } = renderHook(() =>
        useSessionDraft("resume-123")
      );
      let loadedDraft;
      act(() => {
        loadedDraft = loadResult.current.loadDraft();
      });

      expect(loadedDraft).not.toBeNull();
      expect(loadedDraft!.data).toEqual(mockResumeData);
      expect(loadedDraft!.meta.resumeId).toBe("resume-123");
    });

    it("should return null when resumeId does not match", () => {
      // Save a draft for resume-123
      const { result: saveResult } = renderHook(() =>
        useSessionDraft("resume-123")
      );
      act(() => {
        saveResult.current.saveDraft(mockResumeData);
      });

      // Try to load for different resume
      const { result: loadResult } = renderHook(() =>
        useSessionDraft("resume-456")
      );
      let loadedDraft;
      act(() => {
        loadedDraft = loadResult.current.loadDraft();
      });

      expect(loadedDraft).toBeNull();
    });

    it("should return null when no draft exists", () => {
      const { result } = renderHook(() => useSessionDraft("resume-123"));

      let loadedDraft;
      act(() => {
        loadedDraft = result.current.loadDraft();
      });

      expect(loadedDraft).toBeNull();
    });

    it("should load draft for new resumes when resumeId is null", () => {
      // First save a draft with null resumeId (uses "new" internally)
      const { result: saveResult } = renderHook(() => useSessionDraft(null));
      act(() => {
        saveResult.current.saveDraft(mockResumeData);
      });

      // Then load it with another null resumeId
      const { result: loadResult } = renderHook(() => useSessionDraft(null));
      let loadedDraft;
      act(() => {
        loadedDraft = loadResult.current.loadDraft();
      });

      expect(loadedDraft).not.toBeNull();
      expect(loadedDraft!.data).toEqual(mockResumeData);
      expect(loadedDraft!.meta.resumeId).toBe("new");
    });
  });

  describe("clearDirtyFlag", () => {
    it("should clear isDirty flag in meta", () => {
      const { result } = renderHook(() => useSessionDraft("resume-123"));

      // Save a draft
      act(() => {
        result.current.saveDraft(mockResumeData);
      });

      // Verify dirty flag is true
      let meta = JSON.parse(
        sessionStorage.getItem("resume_editor_draft_meta")!
      );
      expect(meta.isDirty).toBe(true);

      // Clear the flag
      act(() => {
        result.current.clearDirtyFlag();
      });

      // Verify dirty flag is now false
      meta = JSON.parse(sessionStorage.getItem("resume_editor_draft_meta")!);
      expect(meta.isDirty).toBe(false);
    });

    it("should not throw when no meta exists", () => {
      const { result } = renderHook(() => useSessionDraft("resume-123"));

      // Should not throw
      act(() => {
        result.current.clearDirtyFlag();
      });
    });
  });

  describe("clearDraft", () => {
    it("should remove draft and meta from sessionStorage", () => {
      const { result } = renderHook(() => useSessionDraft("resume-123"));

      // Save a draft
      act(() => {
        result.current.saveDraft(mockResumeData);
      });

      // Verify items exist
      expect(sessionStorage.getItem("resume_editor_draft")).not.toBeNull();
      expect(sessionStorage.getItem("resume_editor_draft_meta")).not.toBeNull();

      // Clear the draft
      act(() => {
        result.current.clearDraft();
      });

      // Verify items are removed
      expect(sessionStorage.getItem("resume_editor_draft")).toBeNull();
      expect(sessionStorage.getItem("resume_editor_draft_meta")).toBeNull();
    });
  });

  describe("getDraftMeta", () => {
    it("should return meta without loading full data", () => {
      const { result } = renderHook(() => useSessionDraft("resume-123"));

      // Save a draft
      act(() => {
        result.current.saveDraft(mockResumeData);
      });

      // Get meta only
      let meta;
      act(() => {
        meta = result.current.getDraftMeta();
      });

      expect(meta).not.toBeNull();
      expect(meta!.resumeId).toBe("resume-123");
      expect(meta!.isDirty).toBe(true);
    });

    it("should return null when no meta exists", () => {
      const { result } = renderHook(() => useSessionDraft("resume-123"));

      let meta;
      act(() => {
        meta = result.current.getDraftMeta();
      });

      expect(meta).toBeNull();
    });
  });

  describe("resumeId change", () => {
    it("should not load draft when dirty flag is false", () => {
      const { result: saveResult } = renderHook(() =>
        useSessionDraft("resume-123")
      );

      // Save a draft
      act(() => {
        saveResult.current.saveDraft(mockResumeData);
      });

      // Clear dirty flag (simulating successful cloud save)
      act(() => {
        saveResult.current.clearDirtyFlag();
      });

      // Try to load - should return null because isDirty is false
      const { result: loadResult } = renderHook(() =>
        useSessionDraft("resume-123")
      );
      let loadedDraft;
      act(() => {
        loadedDraft = loadResult.current.loadDraft();
      });

      expect(loadedDraft).toBeNull();
    });
  });
});
