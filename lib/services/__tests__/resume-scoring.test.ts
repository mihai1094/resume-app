import { describe, it, expect } from "vitest";
import { calculateResumeScore, type ResumeScore } from "../resume-scoring";
import {
  createEmptyResume,
  createCompleteResume,
  createWeakResume,
  createResumeWith,
  createWorkExperience,
  createSkill,
  createEducation,
} from "@/tests/fixtures/resume-data";

describe("calculateResumeScore", () => {
  // ─── Overall scoring ───

  it("returns a score with all breakdown categories", () => {
    const result = calculateResumeScore(createCompleteResume());
    expect(result).toHaveProperty("overall");
    expect(result).toHaveProperty("breakdown");
    expect(result).toHaveProperty("recommendations");
    expect(result.breakdown).toHaveProperty("atsCompatibility");
    expect(result.breakdown).toHaveProperty("contentQuality");
    expect(result.breakdown).toHaveProperty("skillsKeywords");
    expect(result.breakdown).toHaveProperty("impactAchievements");
    expect(result.breakdown).toHaveProperty("structureFormatting");
  });

  it("overall score is a weighted average of breakdown scores", () => {
    const result = calculateResumeScore(createCompleteResume());
    const { breakdown } = result;
    const expected = Math.round(
      breakdown.atsCompatibility.score * 0.3 +
        breakdown.contentQuality.score * 0.25 +
        breakdown.skillsKeywords.score * 0.2 +
        breakdown.impactAchievements.score * 0.15 +
        breakdown.structureFormatting.score * 0.1
    );
    expect(result.overall).toBe(expected);
  });

  it("returns at most 5 recommendations sorted by priority", () => {
    const result = calculateResumeScore(createEmptyResume());
    expect(result.recommendations.length).toBeLessThanOrEqual(5);
    const priorities = result.recommendations.map((r) => r.priority);
    const order = { high: 1, medium: 2, low: 3 };
    for (let i = 1; i < priorities.length; i++) {
      expect(order[priorities[i]]).toBeGreaterThanOrEqual(order[priorities[i - 1]]);
    }
  });

  // ─── Empty resume ───

  it("scores an empty resume very low with actionable recommendations", () => {
    const result = calculateResumeScore(createEmptyResume());
    expect(result.overall).toBeLessThan(30);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations.some((r) => r.priority === "high")).toBe(true);
  });

  // ─── Complete resume ───

  it("scores a complete resume higher than an empty one", () => {
    const complete = calculateResumeScore(createCompleteResume());
    const empty = calculateResumeScore(createEmptyResume());
    expect(complete.overall).toBeGreaterThan(empty.overall);
  });

  // ─── ATS Compatibility ───

  describe("ATS Compatibility", () => {
    it("deducts points for missing email", () => {
      const withEmail = createResumeWith({
        personalInfo: {
          firstName: "A",
          lastName: "B",
          email: "a@b.com",
          phone: "1234567890",
          location: "NYC",
        },
        workExperience: [createWorkExperience()],
        skills: Array.from({ length: 15 }, (_, i) =>
          createSkill({ name: `Skill${i}` })
        ),
      });
      const withoutEmail = createResumeWith({
        personalInfo: {
          firstName: "A",
          lastName: "B",
          email: "",
          phone: "1234567890",
          location: "NYC",
        },
        workExperience: [createWorkExperience()],
        skills: Array.from({ length: 15 }, (_, i) =>
          createSkill({ name: `Skill${i}` })
        ),
      });

      const scoreWith = calculateResumeScore(withEmail);
      const scoreWithout = calculateResumeScore(withoutEmail);
      expect(scoreWith.breakdown.atsCompatibility.score).toBeGreaterThan(
        scoreWithout.breakdown.atsCompatibility.score
      );
    });

    it("awards higher keyword score for 15+ skills", () => {
      const manySkills = createResumeWith({
        personalInfo: { firstName: "A", lastName: "B", email: "a@b.com", phone: "1234567890", location: "X" },
        skills: Array.from({ length: 16 }, (_, i) =>
          createSkill({ name: `Skill${i}` })
        ),
      });
      const fewSkills = createResumeWith({
        personalInfo: { firstName: "A", lastName: "B", email: "a@b.com", phone: "1234567890", location: "X" },
        skills: [createSkill({ name: "One" }), createSkill({ name: "Two" })],
      });

      const scoreMany = calculateResumeScore(manySkills);
      const scoreFew = calculateResumeScore(fewSkills);
      expect(scoreMany.breakdown.atsCompatibility.score).toBeGreaterThan(
        scoreFew.breakdown.atsCompatibility.score
      );
    });

    it("awards points for summary >= 100 chars", () => {
      const withSummary = createResumeWith({
        personalInfo: {
          firstName: "A",
          lastName: "B",
          email: "a@b.com",
          phone: "1234567890",
          location: "X",
          summary: "A".repeat(100),
        },
      });
      const withoutSummary = createResumeWith({
        personalInfo: {
          firstName: "A",
          lastName: "B",
          email: "a@b.com",
          phone: "1234567890",
          location: "X",
        },
      });
      const scoreWith = calculateResumeScore(withSummary);
      const scoreWithout = calculateResumeScore(withoutSummary);
      expect(scoreWith.breakdown.atsCompatibility.score).toBeGreaterThan(
        scoreWithout.breakdown.atsCompatibility.score
      );
    });
  });

  // ─── Content Quality ───

  describe("Content Quality", () => {
    it("returns 0 for resume with no bullets", () => {
      const resume = createResumeWith({
        workExperience: [
          createWorkExperience({ description: [] }),
        ],
      });
      const result = calculateResumeScore(resume);
      expect(result.breakdown.contentQuality.score).toBe(0);
      expect(result.breakdown.contentQuality.status).toBe("poor");
    });

    it("scores higher for action verbs than weak verbs", () => {
      const strong = createResumeWith({
        workExperience: [
          createWorkExperience({
            description: [
              "Led development of new platform",
              "Developed microservices architecture",
              "Increased user engagement by 40%",
            ],
          }),
        ],
      });
      const weak = createResumeWith({
        workExperience: [
          createWorkExperience({
            description: [
              "Was responsible for development",
              "Helped with tasks",
              "Worked on the project",
            ],
          }),
        ],
      });

      const strongScore = calculateResumeScore(strong);
      const weakScore = calculateResumeScore(weak);
      expect(strongScore.breakdown.contentQuality.score).toBeGreaterThan(
        weakScore.breakdown.contentQuality.score
      );
    });
  });

  // ─── Skills & Keywords ───

  describe("Skills & Keywords", () => {
    it("returns 0 for no skills", () => {
      const result = calculateResumeScore(
        createResumeWith({ skills: [] })
      );
      expect(result.breakdown.skillsKeywords.score).toBe(0);
      expect(result.breakdown.skillsKeywords.status).toBe("poor");
    });

    it("penalizes too many soft skills", () => {
      const softHeavy = createResumeWith({
        skills: [
          createSkill({ name: "teamwork" }),
          createSkill({ name: "communication" }),
          createSkill({ name: "leadership" }),
          createSkill({ name: "problem solving" }),
          createSkill({ name: "TypeScript" }),
        ],
      });
      const hardHeavy = createResumeWith({
        skills: [
          createSkill({ name: "TypeScript" }),
          createSkill({ name: "React" }),
          createSkill({ name: "Node.js" }),
          createSkill({ name: "PostgreSQL" }),
          createSkill({ name: "Docker" }),
        ],
      });

      const softScore = calculateResumeScore(softHeavy);
      const hardScore = calculateResumeScore(hardHeavy);
      expect(hardScore.breakdown.skillsKeywords.score).toBeGreaterThan(
        softScore.breakdown.skillsKeywords.score
      );
    });
  });

  // ─── Impact & Achievements ───

  describe("Impact & Achievements", () => {
    it("scores higher for bullets with metrics", () => {
      const withMetrics = createResumeWith({
        workExperience: [
          createWorkExperience({
            description: [
              "Increased revenue by 25%",
              "Reduced costs by $50,000",
              "Improved performance by 40%",
            ],
          }),
        ],
      });
      const withoutMetrics = createResumeWith({
        workExperience: [
          createWorkExperience({
            description: [
              "Worked on revenue improvements",
              "Helped reduce costs",
              "Improved performance",
            ],
          }),
        ],
      });

      const scoreWith = calculateResumeScore(withMetrics);
      const scoreWithout = calculateResumeScore(withoutMetrics);
      expect(scoreWith.breakdown.impactAchievements.score).toBeGreaterThan(
        scoreWithout.breakdown.impactAchievements.score
      );
    });

    it("awards progression points for multiple roles", () => {
      const multiRole = createResumeWith({
        workExperience: [
          createWorkExperience({ description: ["Did things"] }),
          createWorkExperience({ description: ["Did more things"] }),
        ],
      });
      const singleRole = createResumeWith({
        workExperience: [
          createWorkExperience({ description: ["Did things"] }),
        ],
      });

      const multiScore = calculateResumeScore(multiRole);
      const singleScore = calculateResumeScore(singleRole);
      expect(multiScore.breakdown.impactAchievements.score).toBeGreaterThan(
        singleScore.breakdown.impactAchievements.score
      );
    });
  });

  // ─── Structure & Formatting ───

  describe("Structure & Formatting", () => {
    it("penalizes empty bullets", () => {
      const clean = createResumeWith({
        workExperience: [
          createWorkExperience({
            description: ["Led team of 5", "Built systems"],
          }),
        ],
      });
      const withEmpty = createResumeWith({
        workExperience: [
          createWorkExperience({
            description: ["Led team of 5", "", "Built systems", ""],
          }),
        ],
      });

      const cleanScore = calculateResumeScore(clean);
      const emptyScore = calculateResumeScore(withEmpty);
      expect(cleanScore.breakdown.structureFormatting.score).toBeGreaterThan(
        emptyScore.breakdown.structureFormatting.score
      );
    });
  });

  // ─── Score status boundaries ───

  describe("Score status mapping", () => {
    it("maps status labels correctly based on score ranges", () => {
      const result = calculateResumeScore(createCompleteResume());
      const { breakdown } = result;

      for (const metric of Object.values(breakdown)) {
        if (metric.score >= 90) expect(metric.status).toBe("excellent");
        else if (metric.score >= 75) expect(metric.status).toBe("good");
        else if (metric.score >= 60) expect(metric.status).toBe("fair");
        else expect(metric.status).toBe("poor");
      }
    });
  });

  // ─── Weak resume ───

  it("identifies issues in a weak resume", () => {
    const result = calculateResumeScore(createWeakResume());
    expect(result.overall).toBeLessThan(50);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});
