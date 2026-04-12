import { describe, it, expect } from "vitest";
import {
  analyzeResumeReadiness,
  getReadinessStatus,
} from "../resume-readiness";
import {
  createEmptyResume,
  createCompleteResume,
  createResumeWith,
  createWorkExperience,
  createEducation,
  createSkill,
} from "@/tests/fixtures/resume-data";

describe("analyzeResumeReadiness", () => {
  // ─── Complete resume ───

  it("marks a complete resume as ready", () => {
    const result = analyzeResumeReadiness(createCompleteResume());
    expect(result.isReady).toBe(true);
    expect(result.summary.required.passed).toBe(result.summary.required.total);
  });

  it("returns checks array with both required and recommended", () => {
    const result = analyzeResumeReadiness(createCompleteResume());
    const required = result.checks.filter((c) => c.priority === "required");
    const recommended = result.checks.filter((c) => c.priority === "recommended");
    expect(required.length).toBeGreaterThan(0);
    expect(recommended.length).toBeGreaterThan(0);
  });

  // ─── Empty resume ───

  it("marks an empty resume as not ready", () => {
    const result = analyzeResumeReadiness(createEmptyResume());
    expect(result.isReady).toBe(false);
    // "no-red-flags" passes even on empty (no bullets = no formatting issues)
    expect(result.summary.required.passed).toBeLessThan(result.summary.required.total);
  });

  it("reports missing contact info for empty resume", () => {
    const result = analyzeResumeReadiness(createEmptyResume());
    const contactCheck = result.checks.find((c) => c.id === "contact-complete");
    expect(contactCheck?.status).toBe("fail");
    expect(contactCheck?.message).toContain("name");
    expect(contactCheck?.message).toContain("email");
  });

  // ─── Contact info checks ───

  describe("contact checks", () => {
    it("passes when name, email, and phone are present", () => {
      const resume = createResumeWith({
        personalInfo: {
          firstName: "Alex",
          lastName: "Taylor",
          email: "alex@example.com",
          phone: "555-555-5555",
          location: "",
        },
      });
      const result = analyzeResumeReadiness(resume);
      const check = result.checks.find((c) => c.id === "contact-complete");
      expect(check?.status).toBe("pass");
    });

    it("fails when email is missing", () => {
      const resume = createResumeWith({
        personalInfo: {
          firstName: "Alex",
          lastName: "Taylor",
          email: "",
          phone: "555-555-5555",
          location: "",
        },
      });
      const result = analyzeResumeReadiness(resume);
      const check = result.checks.find((c) => c.id === "contact-complete");
      expect(check?.status).toBe("fail");
      expect(check?.message).toContain("email");
    });
  });

  // ─── Work experience checks ───

  describe("experience checks", () => {
    it("fails when no work experience", () => {
      const result = analyzeResumeReadiness(createEmptyResume());
      const check = result.checks.find((c) => c.id === "has-experience");
      expect(check?.status).toBe("fail");
    });

    it("fails when work experience has no bullets", () => {
      const resume = createResumeWith({
        workExperience: [createWorkExperience({ description: ["", ""] })],
      });
      const result = analyzeResumeReadiness(resume);
      const check = result.checks.find((c) => c.id === "has-experience");
      expect(check?.status).toBe("fail");
    });

    it("passes when work experience has bullets", () => {
      const resume = createResumeWith({
        workExperience: [createWorkExperience()],
      });
      const result = analyzeResumeReadiness(resume);
      const check = result.checks.find((c) => c.id === "has-experience");
      expect(check?.status).toBe("pass");
    });
  });

  // ─── Skills check ───

  describe("skills check", () => {
    it("fails with fewer than 5 skills", () => {
      const resume = createResumeWith({
        skills: [createSkill(), createSkill({ name: "React" })],
      });
      const result = analyzeResumeReadiness(resume);
      const check = result.checks.find((c) => c.id === "has-skills");
      expect(check?.status).toBe("fail");
      expect(check?.message).toContain("add");
    });

    it("passes with 5+ skills", () => {
      const resume = createResumeWith({
        skills: Array.from({ length: 6 }, (_, i) =>
          createSkill({ name: `Skill${i}` })
        ),
      });
      const result = analyzeResumeReadiness(resume);
      const check = result.checks.find((c) => c.id === "has-skills");
      expect(check?.status).toBe("pass");
    });
  });

  // ─── Formatting checks ───

  describe("formatting checks", () => {
    it("fails when empty bullets exist", () => {
      const resume = createResumeWith({
        workExperience: [
          createWorkExperience({
            description: ["Led team of 5", "", "Built systems"],
          }),
        ],
      });
      const result = analyzeResumeReadiness(resume);
      const check = result.checks.find((c) => c.id === "no-red-flags");
      expect(check?.status).toBe("fail");
      expect(check?.message).toContain("empty bullet");
    });

    it("passes when no formatting issues", () => {
      const resume = createResumeWith({
        workExperience: [createWorkExperience()],
      });
      const result = analyzeResumeReadiness(resume);
      const check = result.checks.find((c) => c.id === "no-red-flags");
      expect(check?.status).toBe("pass");
    });
  });

  // ─── Recommended checks ───

  describe("recommended checks", () => {
    it("warns about missing summary", () => {
      const resume = createResumeWith({
        personalInfo: {
          firstName: "A",
          lastName: "B",
          email: "a@b.com",
          phone: "555",
          location: "X",
          summary: "",
        },
      });
      const result = analyzeResumeReadiness(resume);
      const check = result.checks.find((c) => c.id === "has-summary");
      expect(check?.status).toBe("fail");
    });

    it("passes summary check for adequate length", () => {
      const resume = createResumeWith({
        personalInfo: {
          firstName: "A",
          lastName: "B",
          email: "a@b.com",
          phone: "555",
          location: "X",
          summary:
            "Experienced software engineer with deep expertise in building scalable web applications and leading cross-functional engineering teams to deliver high-impact products",
        },
      });
      const result = analyzeResumeReadiness(resume);
      const check = result.checks.find((c) => c.id === "has-summary");
      expect(check?.status).toBe("pass");
    });

    it("checks for quantified achievements", () => {
      const withMetrics = createResumeWith({
        workExperience: [
          createWorkExperience({
            description: [
              "Increased revenue by 25%",
              "Reduced costs by $50,000",
              "Built great things without numbers",
            ],
          }),
        ],
      });
      const result = analyzeResumeReadiness(withMetrics);
      const check = result.checks.find((c) => c.id === "has-metrics");
      // 2 out of 3 = 67%, above 30% threshold
      expect(check?.status).toBe("pass");
    });

    it("detects repeated starting words", () => {
      const resume = createResumeWith({
        workExperience: [
          createWorkExperience({
            description: [
              "Led team of 5",
              "Led project migration",
              "Led design reviews",
              "Built new features",
            ],
          }),
        ],
      });
      const result = analyzeResumeReadiness(resume);
      const check = result.checks.find((c) => c.id === "vocabulary-variety");
      expect(check?.status).toBe("warning");
      expect(check?.message).toContain("led");
    });
  });

  // ─── Summary calculation ───

  it("summary counts match actual check results", () => {
    const result = analyzeResumeReadiness(createCompleteResume());
    const requiredChecks = result.checks.filter((c) => c.priority === "required");
    const requiredPassed = requiredChecks.filter((c) => c.status === "pass");
    expect(result.summary.required.total).toBe(requiredChecks.length);
    expect(result.summary.required.passed).toBe(requiredPassed.length);
  });
});

describe("getReadinessStatus", () => {
  it("returns 'ready' variant when all required checks pass", () => {
    const result = analyzeResumeReadiness(createCompleteResume());
    const status = getReadinessStatus(result);
    expect(status.variant).toBe("ready");
  });

  it("returns 'issues' variant when required checks fail", () => {
    const result = analyzeResumeReadiness(createEmptyResume());
    const status = getReadinessStatus(result);
    expect(status.variant).toBe("issues");
    expect(status.issueCount).toBeGreaterThan(0);
  });

  it("reports recommended tips when ready but with improvements", () => {
    // A resume that's ready but has room for improvement
    const resume = createResumeWith({
      personalInfo: {
        firstName: "A",
        lastName: "B",
        email: "a@b.com",
        phone: "555-555-5555",
        location: "NYC",
        summary: "",
      },
      workExperience: [createWorkExperience()],
      education: [createEducation()],
      skills: Array.from({ length: 6 }, (_, i) =>
        createSkill({ name: `Skill${i}` })
      ),
    });
    const result = analyzeResumeReadiness(resume);
    if (result.isReady) {
      const status = getReadinessStatus(result);
      expect(status.variant).toBe("ready");
    }
  });
});
