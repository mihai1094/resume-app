import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWizardSession } from "../use-wizard-session";
import { ResumeData } from "@/lib/types/resume";

const SESSION_KEY = "wizard_session";

const createMockResume = (): ResumeData => ({
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "555-0123",
    location: "New York, NY",
  },
  workExperience: [],
  education: [],
  skills: [],
});

const createMockSessionData = (overrides = {}) => ({
  resumeId: "resume-123",
  step: "keywords" as const,
  workingResume: createMockResume(),
  appliedSuggestions: ["sug-1"],
  skippedSuggestions: [],
  addedKeywords: ["React"],
  summaryApplied: false,
  changes: [
    {
      id: "change-1",
      type: "add_skill" as const,
      section: "skills",
      before: null,
      after: "React",
      timestamp: Date.now(),
    },
  ],
  timestamp: Date.now(),
  ...overrides,
});

describe("useWizardSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe("initialization", () => {
    it("initializes with no recoverable session when storage is empty", () => {
      const { result } = renderHook(() => useWizardSession("resume-123"));

      expect(result.current.hasRecoverableSession).toBe(false);
      expect(result.current.recoveredSession).toBeNull();
    });

    it("detects recoverable session for matching resume", () => {
      const mockSession = createMockSessionData();
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(mockSession));

      const { result } = renderHook(() => useWizardSession("resume-123"));

      expect(result.current.hasRecoverableSession).toBe(true);
      expect(result.current.recoveredSession).not.toBeNull();
      expect(result.current.recoveredSession?.resumeId).toBe("resume-123");
    });

    it("ignores session for different resume", () => {
      const mockSession = createMockSessionData({ resumeId: "different-resume" });
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(mockSession));

      const { result } = renderHook(() => useWizardSession("resume-123"));

      expect(result.current.hasRecoverableSession).toBe(false);
      expect(result.current.recoveredSession).toBeNull();
    });

    it("ignores session with no changes", () => {
      const mockSession = createMockSessionData({ changes: [] });
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(mockSession));

      const { result } = renderHook(() => useWizardSession("resume-123"));

      expect(result.current.hasRecoverableSession).toBe(false);
    });

    it("ignores expired session", () => {
      const expiredSession = createMockSessionData({
        timestamp: Date.now() - 31 * 60 * 1000, // 31 minutes ago (expired)
      });
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(expiredSession));

      const { result } = renderHook(() => useWizardSession("resume-123"));

      expect(result.current.hasRecoverableSession).toBe(false);
    });

    it("handles malformed session data gracefully", () => {
      sessionStorage.setItem(SESSION_KEY, "not-valid-json");

      const { result } = renderHook(() => useWizardSession("resume-123"));

      expect(result.current.hasRecoverableSession).toBe(false);
      expect(result.current.recoveredSession).toBeNull();
    });
  });

  describe("saveSession", () => {
    it("saves session data to sessionStorage", () => {
      const { result } = renderHook(() => useWizardSession("resume-123"));

      const sessionData = {
        resumeId: "resume-123",
        step: "suggestions" as const,
        workingResume: createMockResume(),
        appliedSuggestions: [],
        skippedSuggestions: [],
        addedKeywords: [],
        summaryApplied: false,
        changes: [
          {
            id: "change-1",
            type: "add_skill" as const,
            section: "skills",
            before: null,
            after: "React",
            timestamp: Date.now(),
          },
        ],
      };

      act(() => {
        result.current.saveSession(sessionData);
      });

      const stored = sessionStorage.getItem(SESSION_KEY);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.resumeId).toBe("resume-123");
      expect(parsed.timestamp).toBeDefined();
    });

    it("handles storage errors gracefully", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      const { result } = renderHook(() => useWizardSession("resume-123"));

      const sessionData = {
        resumeId: "resume-123",
        step: "suggestions" as const,
        workingResume: createMockResume(),
        appliedSuggestions: [],
        skippedSuggestions: [],
        addedKeywords: [],
        summaryApplied: false,
        changes: [
          {
            id: "change-1",
            type: "add_skill" as const,
            section: "skills",
            before: null,
            after: "React",
            timestamp: Date.now(),
          },
        ],
      };

      // Should not throw
      act(() => {
        result.current.saveSession(sessionData);
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Failed to save wizard session:",
        expect.any(Error)
      );

      // Restore
      setItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe("clearSession", () => {
    it("removes session from storage", () => {
      const mockSession = createMockSessionData();
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(mockSession));

      const { result } = renderHook(() => useWizardSession("resume-123"));

      expect(result.current.hasRecoverableSession).toBe(true);

      act(() => {
        result.current.clearSession();
      });

      expect(result.current.hasRecoverableSession).toBe(false);
      expect(result.current.recoveredSession).toBeNull();
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    });
  });

  describe("dismissRecovery", () => {
    it("dismisses recovery prompt and clears session", () => {
      const mockSession = createMockSessionData();
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(mockSession));

      const { result } = renderHook(() => useWizardSession("resume-123"));

      expect(result.current.hasRecoverableSession).toBe(true);

      act(() => {
        result.current.dismissRecovery();
      });

      expect(result.current.hasRecoverableSession).toBe(false);
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    });
  });

  describe("session expiry", () => {
    it("considers session valid within 30 minutes", () => {
      const recentSession = createMockSessionData({
        timestamp: Date.now() - 29 * 60 * 1000, // 29 minutes ago
      });
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(recentSession));

      const { result } = renderHook(() => useWizardSession("resume-123"));

      expect(result.current.hasRecoverableSession).toBe(true);
    });

    it("considers session expired after 30 minutes", () => {
      const expiredSession = createMockSessionData({
        timestamp: Date.now() - 31 * 60 * 1000, // 31 minutes ago
      });
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(expiredSession));

      const { result } = renderHook(() => useWizardSession("resume-123"));

      expect(result.current.hasRecoverableSession).toBe(false);
    });
  });
});
