import { describe, it, expect } from "vitest";
import { MOCK_RESUME_DATA, MOCK_RESUME_CONDENSED } from "../mock-resume";

describe("MOCK_RESUME_DATA", () => {
  it("has valid personal info", () => {
    const { personalInfo } = MOCK_RESUME_DATA;
    expect(personalInfo.firstName).toBeTruthy();
    expect(personalInfo.lastName).toBeTruthy();
    expect(personalInfo.email).toContain("@");
    expect(personalInfo.phone).toBeTruthy();
    expect(personalInfo.location).toBeTruthy();
    expect(personalInfo.summary).toBeTruthy();
    expect(personalInfo.jobTitle).toBeTruthy();
  });

  it("has work experience entries", () => {
    expect(MOCK_RESUME_DATA.workExperience.length).toBeGreaterThanOrEqual(2);
    MOCK_RESUME_DATA.workExperience.forEach((exp) => {
      expect(exp.id).toBeTruthy();
      expect(exp.company).toBeTruthy();
      expect(exp.position).toBeTruthy();
      expect(exp.startDate).toBeTruthy();
      expect(exp.description.length).toBeGreaterThan(0);
    });
  });

  it("has education entries", () => {
    expect(MOCK_RESUME_DATA.education.length).toBeGreaterThanOrEqual(1);
    MOCK_RESUME_DATA.education.forEach((edu) => {
      expect(edu.id).toBeTruthy();
      expect(edu.institution).toBeTruthy();
      expect(edu.degree).toBeTruthy();
      expect(edu.field).toBeTruthy();
    });
  });

  it("has skills with categories", () => {
    expect(MOCK_RESUME_DATA.skills.length).toBeGreaterThanOrEqual(5);
    MOCK_RESUME_DATA.skills.forEach((skill) => {
      expect(skill.id).toBeTruthy();
      expect(skill.name).toBeTruthy();
      expect(skill.category).toBeTruthy();
    });
  });

  it("has optional sections", () => {
    expect(MOCK_RESUME_DATA.languages).toBeDefined();
    expect(MOCK_RESUME_DATA.languages!.length).toBeGreaterThan(0);
    expect(MOCK_RESUME_DATA.certifications).toBeDefined();
    expect(MOCK_RESUME_DATA.certifications!.length).toBeGreaterThan(0);
    expect(MOCK_RESUME_DATA.projects).toBeDefined();
    expect(MOCK_RESUME_DATA.projects!.length).toBeGreaterThan(0);
  });
});

describe("MOCK_RESUME_CONDENSED", () => {
  it("has fewer work experiences than full data", () => {
    expect(MOCK_RESUME_CONDENSED.workExperience.length).toBeLessThan(
      MOCK_RESUME_DATA.workExperience.length
    );
  });

  it("has fewer education entries than full data", () => {
    expect(MOCK_RESUME_CONDENSED.education.length).toBeLessThanOrEqual(
      MOCK_RESUME_DATA.education.length
    );
  });

  it("has fewer skills than full data", () => {
    expect(MOCK_RESUME_CONDENSED.skills.length).toBeLessThan(
      MOCK_RESUME_DATA.skills.length
    );
  });

  it("has same personal info as full data", () => {
    expect(MOCK_RESUME_CONDENSED.personalInfo).toEqual(
      MOCK_RESUME_DATA.personalInfo
    );
  });

  it("excludes projects and certifications for cleaner preview", () => {
    expect(MOCK_RESUME_CONDENSED.projects).toBeUndefined();
    expect(MOCK_RESUME_CONDENSED.certifications).toBeUndefined();
  });
});
