import { describe, it, expect } from "vitest";
import { analyzeJobMatch, getMatchColor, getMatchBgColor } from "../job-match";
import {
  createCompleteResume,
  createEmptyResume,
  createResumeWith,
  createWorkExperience,
  createSkill,
} from "@/tests/fixtures/resume-data";

describe("analyzeJobMatch", () => {
  it("returns 0% match for empty job description", () => {
    const result = analyzeJobMatch(createCompleteResume(), "");
    expect(result.matchPercentage).toBe(0);
    expect(result.totalKeywords).toBe(0);
    expect(result.summary).toContain("Enter a job description");
  });

  it("returns 0% match for whitespace-only job description", () => {
    const result = analyzeJobMatch(createCompleteResume(), "   ");
    expect(result.matchPercentage).toBe(0);
  });

  it("produces higher match for a resume with matching skills", () => {
    const withSkills = createResumeWith({
      personalInfo: {
        firstName: "A",
        lastName: "B",
        email: "a@b.com",
        phone: "555",
        location: "X",
        summary: "Expert in TypeScript, React, and Node.js development",
      },
      skills: [
        createSkill({ name: "TypeScript" }),
        createSkill({ name: "React" }),
        createSkill({ name: "Node.js" }),
      ],
      workExperience: [
        createWorkExperience({
          description: [
            "Built TypeScript applications with React framework",
            "Developed Node.js microservices for web applications",
          ],
        }),
      ],
    });
    const withoutSkills = createEmptyResume();

    const jd =
      "We need a TypeScript developer with React and Node.js experience. TypeScript React Node.js web applications.";

    const matchWith = analyzeJobMatch(withSkills, jd);
    const matchWithout = analyzeJobMatch(withoutSkills, jd);

    expect(matchWith.matchPercentage).toBeGreaterThan(matchWithout.matchPercentage);
    expect(matchWith.keywordsFound.length).toBeGreaterThan(
      matchWithout.keywordsFound.length
    );
  });

  it("finds keywords in experience descriptions", () => {
    const resume = createResumeWith({
      workExperience: [
        createWorkExperience({
          description: [
            "Led development of microservices architecture",
            "Implemented Docker containerization for CI/CD pipeline",
            "Built microservices with Docker and deployed to production",
          ],
        }),
      ],
    });

    const result = analyzeJobMatch(
      resume,
      "Required: Strong experience with microservices architecture. Must have Docker containerization experience. Docker and microservices are essential for this role."
    );

    expect(result.keywordsFound.length).toBeGreaterThan(0);
    expect(
      result.keywordsFound.some((k) =>
        k.foundIn.includes("experience")
      )
    ).toBe(true);
  });

  it("identifies missing keywords", () => {
    const resume = createResumeWith({
      skills: [createSkill({ name: "JavaScript" })],
    });

    const result = analyzeJobMatch(
      resume,
      "Required: Python, AWS, Kubernetes, machine learning"
    );

    expect(result.keywordsMissing.length).toBeGreaterThan(0);
    expect(
      result.keywordsMissing.some((k) => k.keyword.includes("python") || k.keyword.includes("aws"))
    ).toBe(true);
  });

  it("missing keywords include section suggestions", () => {
    const result = analyzeJobMatch(
      createEmptyResume(),
      "Must have React and TypeScript experience"
    );

    for (const missing of result.keywordsMissing) {
      expect(missing.suggestedSection).toBeTruthy();
      expect(missing.tip).toBeTruthy();
    }
  });

  it("calculates match percentage correctly", () => {
    const result = analyzeJobMatch(createCompleteResume(), "React TypeScript Node.js");
    expect(result.matchPercentage).toBeGreaterThanOrEqual(0);
    expect(result.matchPercentage).toBeLessThanOrEqual(100);
    expect(result.totalKeywords).toBe(
      result.keywordsFound.length + result.keywordsMissing.length
    );
  });

  it("returns appropriate summary for different match levels", () => {
    // Empty resume vs detailed JD = weak match
    const weak = analyzeJobMatch(
      createEmptyResume(),
      "Required: Python, AWS, Kubernetes, Docker, machine learning, deep learning, TensorFlow, PyTorch"
    );
    expect(["Weak match", "Moderate match"].some((s) => weak.summary.includes(s))).toBe(true);
  });

  it("limits keywords to 30", () => {
    const longJD = Array.from({ length: 50 }, (_, i) => `skill${i}`).join(" ");
    const result = analyzeJobMatch(createEmptyResume(), longJD);
    expect(result.totalKeywords).toBeLessThanOrEqual(30);
  });

  it("detects high importance keywords from required section", () => {
    const result = analyzeJobMatch(
      createEmptyResume(),
      "Required: Python, Python scripting, AWS cloud services, AWS infrastructure. Preferred: Kubernetes container orchestration."
    );

    // Keywords appearing in "Required" section or repeated 2+ times should be high importance
    const allKeywords = [...result.keywordsFound, ...result.keywordsMissing];
    const highImportance = allKeywords.filter((k) => k.importance === "high");
    expect(highImportance.length).toBeGreaterThan(0);
  });
});

describe("getMatchColor", () => {
  it("returns green for 75%+", () => {
    expect(getMatchColor(75)).toContain("green");
    expect(getMatchColor(100)).toContain("green");
  });

  it("returns blue for 50-74%", () => {
    expect(getMatchColor(50)).toContain("blue");
    expect(getMatchColor(74)).toContain("blue");
  });

  it("returns orange for 25-49%", () => {
    expect(getMatchColor(25)).toContain("orange");
    expect(getMatchColor(49)).toContain("orange");
  });

  it("returns red for below 25%", () => {
    expect(getMatchColor(0)).toContain("red");
    expect(getMatchColor(24)).toContain("red");
  });
});

describe("getMatchBgColor", () => {
  it("returns green for 75%+", () => {
    expect(getMatchBgColor(85)).toContain("green");
  });

  it("returns red for below 25%", () => {
    expect(getMatchBgColor(10)).toContain("red");
  });
});
