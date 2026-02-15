/**
 * AI Features Unit Tests
 *
 * Tests all 7 AI features (5-11, 13) by mocking the underlying AI model
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generateCoverLetter,
  analyzeText,
  quantifyAchievement,
  tailorResume,
  generateInterviewPrep,
  optimizeLinkedInProfile,
  scoreResume,
} from "../content-generator";
import { ResumeData } from "../../types/resume";

// Mock the Gemini client
vi.mock("../gemini-client", () => ({
  getModel: vi.fn(),
  SAFETY_SETTINGS: [],
}));

// Mock resume data
const mockResumeData: ResumeData = {
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "555-0123",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/johndoe",
    summary:
      "Experienced software engineer with 8+ years building scalable web applications.",
    jobTitle: "Senior Software Engineer",
  },
  workExperience: [
    {
      id: "exp-1",
      company: "Tech Corp",
      position: "Senior Software Engineer",
      location: "San Francisco, CA",
      startDate: "2020-01",
      endDate: "2024-12",
      current: false,
      description: [
        "Led development of React-based dashboard",
        "Improved system performance by 40%",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Tech University",
      degree: "B.Sc.",
      field: "Computer Science",
      location: "San Francisco, CA",
      startDate: "2012-08",
      endDate: "2016-05",
      current: false,
      description: ["Graduated with honors"],
    },
  ],
  skills: [
    { id: "skill-1", name: "React", category: "Frameworks" },
    { id: "skill-2", name: "TypeScript", category: "Technical" },
    { id: "skill-3", name: "Node.js", category: "Technical" },
    { id: "skill-4", name: "AWS", category: "Tools" },
    { id: "skill-5", name: "Leadership", category: "Soft Skills" },
  ],
};

describe("AI Features Unit Tests", () => {
  let mockGenerateContent: any;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock generation function
    mockGenerateContent = vi.fn();

    // Import and mock getModel
    const { getModel } = await import("../gemini-client");
    (getModel as any).mockReturnValue({
      generateContent: mockGenerateContent,
    });
  });

  describe("Feature 5: Cover Letter Generator", () => {
    it("should parse cover letter response correctly", async () => {
      // Mock AI response with valid JSON
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            "```json\n" +
            JSON.stringify({
              salutation: "Dear Hiring Team,",
              introduction:
                "I am writing to express my interest in the Senior Software Engineer position at Google.",
              bodyParagraphs: [
                "Paragraph 1 content here.",
                "Paragraph 2 content here.",
                "Paragraph 3 content here.",
              ],
              closing: "Thank you for your time.",
              signature: "John Doe",
            }) +
            "\n```",
        },
      });

      const result = await generateCoverLetter({
        resumeData: mockResumeData,
        jobDescription: "Seeking Senior Engineer",
        companyName: "Google",
        positionTitle: "Senior Software Engineer",
      });

      expect(result.salutation).toBe("Dear Hiring Team,");
      expect(result.introduction).toContain("Senior Software Engineer");
      expect(result.bodyParagraphs).toHaveLength(3);
      expect(result.closing).toBe("Thank you for your time.");
      expect(result.signature).toBe("John Doe");
    });
  });

  describe("Feature 6: Real-Time Writing Assistant", () => {
    it("should parse analysis response correctly", async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              score: 85,
              strengths: ["Clear communication", "Good use of keywords"],
              suggestions: [
                {
                  type: "missing-metric",
                  severity: "medium",
                  issue: "Consider adding more metrics to the second bullet",
                  fix: "Add numbers",
                  example: "Improved by 20%",
                },
                {
                  type: "weak-verb",
                  severity: "low",
                  issue: "Use stronger action verbs",
                  fix: 'Change "worked" to "engineered"',
                  example: "Engineered the system",
                },
              ],
            }),
        },
      });

      const result = await analyzeText(
        "Led development of React dashboard",
        { context: "bullet-point" }
      );

      expect(result.overallScore).toBe(85);
      expect(result.suggestions).toHaveLength(2);
      expect(result.suggestions[0].type).toBe("missing-metric");
      expect(result.strengths).toHaveLength(2);
    });
  });

  describe("Feature 7: Achievement Quantifier", () => {
    it("should parse quantification suggestions correctly", async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              suggestions: [
                {
                  example: "Improved user engagement by 20%",
                  why: "Shows impact clearly",
                },
                {
                  example: "Reduced load time by 500ms",
                  why: "Shows technical proficiency",
                },
              ],
            }),
        },
      });

      const result = await quantifyAchievement({ statement: "Improved performance" });

      expect(result).toHaveLength(2);
      expect(result[0].example).toContain("20%");
      expect(result[0].reasoning).toBe("Shows impact clearly");
      expect(result[1].metrics).toBeTruthy();
    });
  });

  describe("Feature 9: Resume Tailoring Assistant", () => {
    it("should parse tailored resume sections correctly", async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              summary:
                "Experienced Senior Software Engineer specializing in React and Node.js.",
              enhancedBullets: {
                "exp-1": [
                  "Spearheaded React dashboard development leading to 40% efficiency gain",
                  "Optimized system performance by 40% reducing server costs",
                ],
                "exp-2": ["Developed REST APIs"],
              },
              addedKeywords: [
                "Scalability",
                "Cloud Infrastructure",
                "Mentorship",
              ],
              changes: [
                "Added summary focused on full stack skills",
                "Quantified impact in bullet points",
              ],
            }),
        },
      });

      const result = await tailorResume(
        mockResumeData,
        "Seeking scalable systems expert"
      );

      expect(result.summary).toContain("Senior Software Engineer");
      expect(Object.keys(result.enhancedBullets)).toHaveLength(2);
      expect(result.addedKeywords).toContain("Scalability");
      expect(result.changes).toHaveLength(2);
    });
  });

  describe("Feature 10: Interview Prep Generator", () => {
    it("should parse interview questions correctly", async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              questions: [
                {
                  type: "behavioral",
                  difficulty: "medium",
                  question: "Tell me about a time you led a team.",
                  answer: "In my previous role at Tech Corp...",
                  keyPoints: ["Leadership", "Mentorship"],
                  followUps: ["How did you handle conflicts?"],
                },
                {
                  type: "technical",
                  difficulty: "medium",
                  question: "Explain React useEffect.",
                  answer: "It handles side effects...",
                  keyPoints: ["Dependencies", "Cleanup"],
                  followUps: ["When does it run?"],
                },
              ],
              skillGaps: [],
              overallReadiness: 75,
              strengthsToHighlight: ["Strong React experience"],
            }),
        },
      });

      const result = await generateInterviewPrep({
        resumeData: mockResumeData,
        jobDescription: "React Developer"
      });

      expect(result.questions).toHaveLength(2);
      expect(result.questions[0].question).toContain("led a team");
      expect(result.questions[0].type).toBe("behavioral");
      expect(result.questions[0].keyPoints).toHaveLength(2);
      expect(result.questions[0].followUps).toHaveLength(1);
      expect(result.questions[1].type).toBe("technical");
    });
  });

  describe("Feature 11: LinkedIn Profile Optimizer", () => {
    it("should parse LinkedIn profile sections correctly", async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              headline:
                "Senior Software Engineer | React & Node.js Expert | Cloud Architecture",
              about:
                "I am a passionate engineer with 8+ years of experience. I love building scalable systems.",
              experienceBullets: {
                "exp-1": [
                  "Led major dashboard initiative",
                  "Mentored junior engineers",
                ],
              },
              topSkills: ["React", "Node.js", "AWS", "Leadership"],
            }),
        },
      });

      const result = await optimizeLinkedInProfile({ resumeData: mockResumeData });

      expect(result.headline).toContain("React & Node.js Expert");
      expect(result.about).toContain("passionate engineer");

      // Check bullets
      const expKey = Object.keys(result.experienceBullets)[0];
      expect(result.experienceBullets[expKey]).toHaveLength(2);

      expect(result.topSkills).toContain("React");
      expect(result.topSkills).toHaveLength(4);
    });
  });

  describe("Feature 13: Resume Scoring Dashboard", () => {
    it("should parse resume score correctly", async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              overallScore: 85,
              categoryScores: {
                keywords: 90,
                metrics: 75,
                formatting: 80,
                atsCompatibility: 95,
                impact: 85,
              },
              strengths: [
                "Strong technical keywords",
                "Good formatting",
              ],
              improvements: [
                "Add more numbers",
                "Use stronger verbs",
              ],
              industryBenchmark: "Top 15%",
            }),
        },
      });

      const result = await scoreResume(mockResumeData);

      expect(result.overallScore).toBe(85);
      expect(result.categoryScores.keywords).toBe(90);
      expect(result.categoryScores.metrics).toBe(75);
      expect(result.strengths).toHaveLength(2);
      expect(result.improvements).toHaveLength(2);
      expect(result.industryBenchmark).toContain("Top 15%");
    });
  });
});
