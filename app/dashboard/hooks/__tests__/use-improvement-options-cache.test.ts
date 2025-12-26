import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ATSSuggestion } from "@/lib/ai/content-types";
import { ResumeData } from "@/lib/types/resume";

// Mock the authPost function
const mockAuthPost = vi.fn();
vi.mock("@/lib/api/auth-fetch", () => ({
  authPost: (...args: unknown[]) => mockAuthPost(...args),
}));

// Import after mocking
import { useImprovementOptionsCache } from "../use-improvement-options-cache";

const createMockSuggestion = (id = "sug-1"): ATSSuggestion => ({
  id,
  type: "skill",
  severity: "high",
  title: "Add React skill",
  description: "The job requires React experience",
  action: "Add React to your skills section",
  estimatedImpact: 10,
});

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

const createMockApiResponse = () => ({
  ok: true,
  json: () =>
    Promise.resolve({
      result: {
        options: [
          {
            id: "opt-1",
            type: "add_skill",
            content: "React",
            preview: "Add React to skills",
            targetSection: "skills",
          },
        ],
        explanation: "Adding React would improve your match",
      },
    }),
});

describe("useImprovementOptionsCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get and set", () => {
    it("returns undefined for uncached suggestions", () => {
      const { result } = renderHook(() => useImprovementOptionsCache());

      const cached = result.current.get("non-existent-id");
      expect(cached).toBeUndefined();
    });

    it("stores and retrieves cached results", () => {
      const { result } = renderHook(() => useImprovementOptionsCache());

      const mockResult = {
        options: [
          {
            id: "opt-1",
            type: "add_skill" as const,
            content: "React",
            preview: "Add React",
            targetSection: "skills" as const,
          },
        ],
        explanation: "Test explanation",
      };

      act(() => {
        result.current.set("unique-sug-1", mockResult);
      });

      const cached = result.current.get("unique-sug-1");
      expect(cached).toEqual(mockResult);
    });
  });

  describe("fetchOptions", () => {
    it("fetches options from API", async () => {
      mockAuthPost.mockResolvedValueOnce(createMockApiResponse());

      const { result } = renderHook(() => useImprovementOptionsCache());

      const suggestion = createMockSuggestion("fetch-test-1");
      const resume = createMockResume();

      let fetchResult;
      await act(async () => {
        fetchResult = await result.current.fetchOptions(
          suggestion,
          resume,
          "We need a React developer"
        );
      });

      expect(mockAuthPost).toHaveBeenCalledWith("/api/ai/generate-improvement", {
        action: "generate_improvement",
        suggestion,
        resumeData: resume,
        jobDescription: "We need a React developer",
      });

      expect(fetchResult).toEqual({
        options: expect.any(Array),
        explanation: expect.any(String),
      });
    });

    it("caches result after fetch", async () => {
      mockAuthPost.mockResolvedValueOnce(createMockApiResponse());

      const { result } = renderHook(() => useImprovementOptionsCache());

      const suggestion = createMockSuggestion("cache-test-1");
      const resume = createMockResume();

      await act(async () => {
        await result.current.fetchOptions(suggestion, resume, "Job description");
      });

      // Result should now be cached
      const cached = result.current.get(suggestion.id);
      expect(cached).toBeDefined();
      expect(cached?.options).toHaveLength(1);
    });

    it("returns cached result on subsequent calls", async () => {
      const { result } = renderHook(() => useImprovementOptionsCache());

      // Pre-populate the cache
      const mockResult = {
        options: [
          {
            id: "opt-1",
            type: "add_skill" as const,
            content: "React",
            preview: "Add React",
            targetSection: "skills" as const,
          },
        ],
        explanation: "Cached explanation",
      };

      const suggestion = createMockSuggestion("cached-fetch-test");
      act(() => {
        result.current.set(suggestion.id, mockResult);
      });

      const resume = createMockResume();

      let fetchResult;
      await act(async () => {
        fetchResult = await result.current.fetchOptions(suggestion, resume, "Job");
      });

      // Should use cache, not call API
      expect(mockAuthPost).not.toHaveBeenCalled();
      expect(fetchResult).toEqual(mockResult);
    });

    it("throws error when API fails", async () => {
      mockAuthPost.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: "API Error" }),
      });

      const { result } = renderHook(() => useImprovementOptionsCache());

      const suggestion = createMockSuggestion("error-test-1");
      const resume = createMockResume();

      await expect(async () => {
        await act(async () => {
          await result.current.fetchOptions(suggestion, resume, "Job");
        });
      }).rejects.toThrow("Failed to generate options");
    });
  });

  describe("clearCache", () => {
    it("clears cached data", () => {
      const { result } = renderHook(() => useImprovementOptionsCache());

      const mockResult = {
        options: [],
        explanation: "Test",
      };

      act(() => {
        result.current.set("clear-test-1", mockResult);
      });

      expect(result.current.get("clear-test-1")).toBeDefined();

      act(() => {
        result.current.clearCache();
      });

      expect(result.current.get("clear-test-1")).toBeUndefined();
    });
  });

  describe("prefetch", () => {
    it("calls fetchOptions without returning promise", () => {
      mockAuthPost.mockResolvedValueOnce(createMockApiResponse());

      const { result } = renderHook(() => useImprovementOptionsCache());

      const suggestion = createMockSuggestion("prefetch-test-1");
      const resume = createMockResume();

      // Prefetch should return immediately (synchronous)
      act(() => {
        result.current.prefetch(suggestion, resume, "Job description");
      });

      // Should have started the fetch
      expect(mockAuthPost).toHaveBeenCalled();
    });
  });
});
