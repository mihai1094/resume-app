import { describe, it, expect, beforeEach } from "vitest";
import { buildSkillsContext, parseYearMonth, truncateAtSentence } from "../skills-context";
import type { ResumeData } from "@/lib/types/resume";
import {
  createCompleteResume,
  createEmptyResume,
  createWorkExperience,
  resetIdCounter,
} from "@/tests/fixtures/resume-data";

beforeEach(() => {
  resetIdCounter();
});

// A stable "now" lets date-based assertions be deterministic.
const FIXED_NOW = new Date(2025, 5, 15); // 2025-06-15

describe("parseYearMonth", () => {
  it("parses YYYY-MM", () => {
    const d = parseYearMonth("2023-06");
    expect(d?.getFullYear()).toBe(2023);
    expect(d?.getMonth()).toBe(5); // 0-indexed
  });
  it("accepts single-digit month", () => {
    const d = parseYearMonth("2023-3");
    expect(d?.getMonth()).toBe(2);
  });
  it("rejects invalid input", () => {
    expect(parseYearMonth("")).toBeUndefined();
    expect(parseYearMonth("garbage")).toBeUndefined();
    expect(parseYearMonth("2023-13")).toBeUndefined();
    expect(parseYearMonth(undefined)).toBeUndefined();
  });
});

describe("truncateAtSentence", () => {
  it("returns input unchanged when under max", () => {
    expect(truncateAtSentence("Short sentence.", 100)).toBe("Short sentence.");
  });

  it("cuts at sentence boundary when available", () => {
    // First sentence is 60 chars, well past the 50% threshold of max=100.
    const long =
      "Led complex migration to TypeScript across 80K LOC frontend. Mentored four engineers through weekly reviews.";
    const result = truncateAtSentence(long, 100);
    expect(result.endsWith(".")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(100);
  });

  it("falls back to word boundary when no sentence boundary is suitable", () => {
    const long = "A phrase without sentence enders just flowing along for testing purposes here";
    const result = truncateAtSentence(long, 40);
    // Result ends with ellipsis after a complete word
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(41);
    // Should not cut in the middle of a word: the char before "…" should be
    // the end of a complete token that appeared in the original text.
    const body = result.slice(0, -1);
    expect(long.startsWith(body)).toBe(true);
    expect(long[body.length]).toBe(" "); // cut at a space in the original
  });
});

describe("buildSkillsContext — empty resume", () => {
  it("returns undefined for all optional fields when resume is blank", () => {
    const resume = createEmptyResume();
    const ctx = buildSkillsContext(resume, { now: FIXED_NOW });
    expect(ctx.workHistory).toBeUndefined();
    expect(ctx.projects).toBeUndefined();
    expect(ctx.certifications).toBeUndefined();
    expect(ctx.educationField).toBeUndefined();
    expect(ctx.existingSkills).toBeUndefined();
    expect(ctx.summary).toBeUndefined();
  });
});

describe("buildSkillsContext — complete resume", () => {
  it("extracts existing skills as ExistingSkillRef[]", () => {
    const resume = createCompleteResume();
    const ctx = buildSkillsContext(resume, { now: FIXED_NOW });
    expect(ctx.existingSkills).toBeDefined();
    expect(ctx.existingSkills!.length).toBeGreaterThan(0);
    expect(ctx.existingSkills![0]).toHaveProperty("name");
    expect(ctx.existingSkills![0]).toHaveProperty("category");
    // Level must not leak
    expect(ctx.existingSkills![0]).not.toHaveProperty("level");
  });

  it("carries summary, industry, seniority through", () => {
    const resume = createCompleteResume();
    const ctx = buildSkillsContext(resume, { now: FIXED_NOW });
    expect(ctx.summary).toBeDefined();
    expect(ctx.industry).toBe("technology");
    expect(ctx.seniorityLevel).toBe("senior");
  });

  it("orders work history recency-first", () => {
    const resume = createCompleteResume();
    const ctx = buildSkillsContext(resume, { now: FIXED_NOW });
    expect(ctx.workHistory).toBeDefined();
    // First entry should be the current role
    expect(ctx.workHistory![0].isCurrent).toBe(true);
    expect(ctx.workHistory![0].yearsAgo).toBe(0);
  });

  it("caps work history at 3 entries", () => {
    const many = [
      createWorkExperience({ position: "Role A", startDate: "2023-01", current: true, endDate: undefined }),
      createWorkExperience({ position: "Role B", startDate: "2021-01", endDate: "2023-01" }),
      createWorkExperience({ position: "Role C", startDate: "2019-01", endDate: "2021-01" }),
      createWorkExperience({ position: "Role D", startDate: "2017-01", endDate: "2019-01" }),
      createWorkExperience({ position: "Role E", startDate: "2015-01", endDate: "2017-01" }),
    ];
    const resume: ResumeData = { ...createEmptyResume(), workExperience: many };
    const ctx = buildSkillsContext(resume, { now: FIXED_NOW });
    expect(ctx.workHistory!.length).toBeLessThanOrEqual(3);
  });

  it("filters out work experiences older than 5 years", () => {
    const resume: ResumeData = {
      ...createEmptyResume(),
      workExperience: [
        createWorkExperience({
          position: "Ancient Role",
          startDate: "2010-01",
          endDate: "2012-01",
        }),
      ],
    };
    const ctx = buildSkillsContext(resume, { now: FIXED_NOW });
    expect(ctx.workHistory).toBeUndefined();
  });

  it("truncates bullets at sentence boundary", () => {
    const resume: ResumeData = {
      ...createEmptyResume(),
      workExperience: [
        createWorkExperience({
          current: true,
          endDate: undefined,
          description: [
            "A".repeat(300), // 300-char bullet forces truncation
          ],
        }),
      ],
    };
    const ctx = buildSkillsContext(resume, { now: FIXED_NOW });
    expect(ctx.workHistory![0].bullets[0].length).toBeLessThanOrEqual(181); // 180 + ellipsis
  });

  it("caps bullets at 5 per role", () => {
    const bullets = Array.from({ length: 10 }, (_, i) => `Bullet ${i + 1}`);
    const resume: ResumeData = {
      ...createEmptyResume(),
      workExperience: [
        createWorkExperience({
          current: true,
          endDate: undefined,
          description: bullets,
        }),
      ],
    };
    const ctx = buildSkillsContext(resume, { now: FIXED_NOW });
    expect(ctx.workHistory![0].bullets.length).toBeLessThanOrEqual(5);
  });
});

describe("buildSkillsContext — anonymization", () => {
  it("keeps real company names when anonymizeCompanies is false", () => {
    const resume = createCompleteResume();
    const ctx = buildSkillsContext(resume, {
      now: FIXED_NOW,
      anonymizeCompanies: false,
    });
    expect(ctx.workHistory![0].companyLabel).toBe("TechFlow Inc.");
  });

  it("replaces company with industry-based label when anonymize is on", () => {
    const resume = createCompleteResume();
    const ctx = buildSkillsContext(resume, {
      now: FIXED_NOW,
      anonymizeCompanies: true,
    });
    expect(ctx.workHistory![0].companyLabel).toBe("a technology company");
  });

  it("uses generic 'a company' label when industry missing", () => {
    const resume = createCompleteResume();
    resume.personalInfo.industry = undefined;
    const ctx = buildSkillsContext(resume, {
      now: FIXED_NOW,
      anonymizeCompanies: true,
    });
    expect(ctx.workHistory![0].companyLabel).toBe("a company");
  });
});

describe("buildSkillsContext — summary truncation", () => {
  it("truncates summary longer than 400 chars", () => {
    const resume = createEmptyResume();
    resume.personalInfo.summary = "A".repeat(800);
    const ctx = buildSkillsContext(resume, { now: FIXED_NOW });
    expect(ctx.summary!.length).toBeLessThanOrEqual(401);
  });

  it("preserves short summary as-is", () => {
    const resume = createEmptyResume();
    resume.personalInfo.summary = "Short summary.";
    const ctx = buildSkillsContext(resume, { now: FIXED_NOW });
    expect(ctx.summary).toBe("Short summary.");
  });
});
