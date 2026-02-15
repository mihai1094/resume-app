import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useImprovementWizard } from "../use-improvement-wizard";
import { ATSAnalysisResult, ATSSuggestion } from "@/lib/ai/content-types";
import { ResumeData } from "@/lib/types/resume";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const createMockResume = (): ResumeData => ({
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "555-0123",
    location: "New York, NY",
    summary: "Experienced developer",
  },
  workExperience: [
    {
      id: "exp-1",
      company: "Tech Corp",
      position: "Software Engineer",
      location: "New York, NY",
      startDate: "2020-01",
      endDate: "2023-01",
      current: false,
      description: ["Built web applications", "Led team of 5"],
    },
  ],
  education: [],
  skills: [
    { id: "skill-1", name: "JavaScript", category: "Technical", level: "advanced" },
  ],
});

const createMockSuggestion = (overrides?: Partial<ATSSuggestion>): ATSSuggestion => ({
  id: "sug-1",
  type: "skill",
  severity: "high",
  title: "Add React skill",
  description: "The job requires React experience",
  action: "Add React to your skills section",
  estimatedImpact: 10,
  ...overrides,
});

const createMockAnalysis = (suggestions: ATSSuggestion[] = []): ATSAnalysisResult => ({
  score: 72,
  missingKeywords: ["React", "TypeScript", "Node.js"],
  suggestions: suggestions.length > 0 ? suggestions : [createMockSuggestion()],
  strengths: ["JavaScript experience", "Team leadership"],
  improvements: ["Add more technical skills"],
});

describe("useImprovementWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("initializes with correct default state", () => {
      const mockResume = createMockResume();
      const mockAnalysis = createMockAnalysis();

      const { result } = renderHook(() =>
        useImprovementWizard({
          originalResume: mockResume,
          analysis: mockAnalysis,
          jobDescription: "We need a React developer",
          jobTitle: "Senior Developer",
          companyName: "Tech Inc",
        })
      );

      expect(result.current.step).toBe("suggestions");
      expect(result.current.appliedSuggestions).toHaveLength(0);
      expect(result.current.skippedSuggestions).toHaveLength(0);
      expect(result.current.addedKeywords).toHaveLength(0);
      expect(result.current.summaryApplied).toBe(false);
      expect(result.current.changes).toHaveLength(0);
      expect(result.current.progress).toBe(0);
    });

    it("creates a working copy of the resume", () => {
      const mockResume = createMockResume();
      const mockAnalysis = createMockAnalysis();

      const { result } = renderHook(() =>
        useImprovementWizard({
          originalResume: mockResume,
          analysis: mockAnalysis,
          jobDescription: "Test",
          jobTitle: "Developer",
          companyName: "Company",
        })
      );

      // Working resume should be a copy, not the same reference
      expect(result.current.workingResume).toEqual(mockResume);
      expect(result.current.workingResume).not.toBe(mockResume);
    });
  });

  describe("liveScore calculation", () => {
    it("starts with the analysis score", () => {
      const mockResume = createMockResume();
      const mockAnalysis = createMockAnalysis();

      const { result } = renderHook(() =>
        useImprovementWizard({
          originalResume: mockResume,
          analysis: mockAnalysis,
          jobDescription: "Test",
          jobTitle: "Developer",
          companyName: "Company",
        })
      );

      expect(result.current.liveScore).toBe(72);
    });

    it("increases liveScore when suggestion is applied", () => {
      const mockResume = createMockResume();
      const suggestion = createMockSuggestion({ estimatedImpact: 10 });
      const mockAnalysis = createMockAnalysis([suggestion]);

      const { result } = renderHook(() =>
        useImprovementWizard({
          originalResume: mockResume,
          analysis: mockAnalysis,
          jobDescription: "Test",
          jobTitle: "Developer",
          companyName: "Company",
        })
      );

      act(() => {
        result.current.applyImprovement(
          {
            id: "opt-1",
            type: "add_skill",
            content: "React",
            preview: "Add React skill",
            targetSection: "skills",
          },
          suggestion.id
        );
      });

      expect(result.current.liveScore).toBe(82); // 72 + 10
    });

    it("increases liveScore by 2 per keyword added", () => {
      const mockResume = createMockResume();
      const mockAnalysis = createMockAnalysis([]);

      const { result } = renderHook(() =>
        useImprovementWizard({
          originalResume: mockResume,
          analysis: mockAnalysis,
          jobDescription: "Test",
          jobTitle: "Developer",
          companyName: "Company",
        })
      );

      act(() => {
        result.current.addKeyword("React", {
          id: "opt-1",
          type: "add_keyword_to_skills",
          content: "React",
          preview: "Add React",
          targetSection: "skills",
        });
      });

      expect(result.current.liveScore).toBe(74); // 72 + 2
    });

    it("caps liveScore at 100", () => {
      const mockResume = createMockResume();
      const suggestion = createMockSuggestion({ estimatedImpact: 50 });
      const mockAnalysis: ATSAnalysisResult = {
        ...createMockAnalysis([suggestion]),
        score: 90,
      };

      const { result } = renderHook(() =>
        useImprovementWizard({
          originalResume: mockResume,
          analysis: mockAnalysis,
          jobDescription: "Test",
          jobTitle: "Developer",
          companyName: "Company",
        })
      );

      act(() => {
        result.current.applyImprovement(
          {
            id: "opt-1",
            type: "add_skill",
            content: "React",
            preview: "Add React skill",
            targetSection: "skills",
          },
          suggestion.id
        );
      });

      expect(result.current.liveScore).toBe(100); // Capped at 100
    });
  });

  describe("suggestion navigation", () => {
    it("tracks current suggestion correctly", () => {
      const mockResume = createMockResume();
      const suggestions = [
        createMockSuggestion({ id: "sug-1" }),
        createMockSuggestion({ id: "sug-2" }),
        createMockSuggestion({ id: "sug-3" }),
      ];
      const mockAnalysis = createMockAnalysis(suggestions);

      const { result } = renderHook(() =>
        useImprovementWizard({
          originalResume: mockResume,
          analysis: mockAnalysis,
          jobDescription: "Test",
          jobTitle: "Developer",
          companyName: "Company",
        })
      );

      expect(result.current.currentSuggestion?.id).toBe("sug-1");
      expect(result.current.remainingSuggestions).toBe(3);

      act(() => {
        result.current.nextSuggestion();
      });

      expect(result.current.currentSuggestion?.id).toBe("sug-2");
      expect(result.current.remainingSuggestions).toBe(2);
    });

    it("skips suggestion and tracks it", () => {
      const mockResume = createMockResume();
      const suggestion = createMockSuggestion();
      const mockAnalysis = createMockAnalysis([suggestion]);

      const { result } = renderHook(() =>
        useImprovementWizard({
          originalResume: mockResume,
          analysis: mockAnalysis,
          jobDescription: "Test",
          jobTitle: "Developer",
          companyName: "Company",
        })
      );

      act(() => {
        result.current.skipSuggestion(suggestion.id);
      });

      expect(result.current.skippedSuggestions).toContain(suggestion.id);
    });
  });

  describe("step navigation", () => {
    it("allows navigation between steps", () => {
      const mockResume = createMockResume();
      const mockAnalysis = createMockAnalysis();

      const { result } = renderHook(() =>
        useImprovementWizard({
          originalResume: mockResume,
          analysis: mockAnalysis,
          jobDescription: "Test",
          jobTitle: "Developer",
          companyName: "Company",
        })
      );

      expect(result.current.step).toBe("suggestions");

      act(() => {
        result.current.goToStep("keywords");
      });
      expect(result.current.step).toBe("keywords");

      act(() => {
        result.current.goToStep("summary");
      });
      expect(result.current.step).toBe("summary");

      act(() => {
        result.current.goToStep("review");
      });
      expect(result.current.step).toBe("review");
    });

    it("supports nextStep and prevStep", () => {
      const mockResume = createMockResume();
      const mockAnalysis = createMockAnalysis();

      const { result } = renderHook(() =>
        useImprovementWizard({
          originalResume: mockResume,
          analysis: mockAnalysis,
          jobDescription: "Test",
          jobTitle: "Developer",
          companyName: "Company",
        })
      );

      act(() => {
        result.current.nextStep();
      });
      expect(result.current.step).toBe("keywords");

      act(() => {
        result.current.nextStep();
      });
      expect(result.current.step).toBe("summary");

      act(() => {
        result.current.prevStep();
      });
      expect(result.current.step).toBe("keywords");
    });
  });

  describe("undo functionality", () => {
    it("can undo applied skill addition", () => {
      const mockResume = createMockResume();
      const mockAnalysis = createMockAnalysis();

      const { result } = renderHook(() =>
        useImprovementWizard({
          originalResume: mockResume,
          analysis: mockAnalysis,
          jobDescription: "Test",
          jobTitle: "Developer",
          companyName: "Company",
        })
      );

      const initialSkillCount = result.current.workingResume.skills?.length || 0;

      act(() => {
        result.current.applyImprovement({
          id: "opt-1",
          type: "add_skill",
          content: "React",
          preview: "Add React skill",
          targetSection: "skills",
        });
      });

      expect(result.current.workingResume.skills?.length).toBe(initialSkillCount + 1);
      expect(result.current.changes).toHaveLength(1);

      act(() => {
        result.current.undoLastChange();
      });

      expect(result.current.workingResume.skills?.length).toBe(initialSkillCount);
      expect(result.current.changes).toHaveLength(0);
    });
  });

  describe("progress calculation", () => {
    it("calculates progress based on processed suggestions", () => {
      const mockResume = createMockResume();
      const suggestions = [
        createMockSuggestion({ id: "sug-1" }),
        createMockSuggestion({ id: "sug-2" }),
      ];
      const mockAnalysis = createMockAnalysis(suggestions);

      const { result } = renderHook(() =>
        useImprovementWizard({
          originalResume: mockResume,
          analysis: mockAnalysis,
          jobDescription: "Test",
          jobTitle: "Developer",
          companyName: "Company",
        })
      );

      expect(result.current.progress).toBe(0);

      act(() => {
        result.current.applyImprovement(
          {
            id: "opt-1",
            type: "add_skill",
            content: "React",
            preview: "Add React skill",
            targetSection: "skills",
          },
          "sug-1"
        );
      });

      // Progress should increase after applying suggestion
      expect(result.current.progress).toBeGreaterThan(0);
    });
  });

  describe("reset functionality", () => {
    it("resets all state to initial values", () => {
      const mockResume = createMockResume();
      const mockAnalysis = createMockAnalysis();

      const { result } = renderHook(() =>
        useImprovementWizard({
          originalResume: mockResume,
          analysis: mockAnalysis,
          jobDescription: "Test",
          jobTitle: "Developer",
          companyName: "Company",
        })
      );

      // Make some changes
      act(() => {
        result.current.goToStep("keywords");
        result.current.applyImprovement({
          id: "opt-1",
          type: "add_skill",
          content: "React",
          preview: "Add React skill",
          targetSection: "skills",
        });
      });

      expect(result.current.step).toBe("keywords");
      expect(result.current.changes).toHaveLength(1);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.step).toBe("suggestions");
      expect(result.current.changes).toHaveLength(0);
      expect(result.current.appliedSuggestions).toHaveLength(0);
      expect(result.current.addedKeywords).toHaveLength(0);
    });
  });
});
