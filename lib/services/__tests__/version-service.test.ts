import { describe, it, expect } from "vitest";
import { detectChangedSections } from "../version-service";
import {
  createEmptyResume,
  createCompleteResume,
  createResumeWith,
  createWorkExperience,
  createSkill,
  createEducation,
} from "@/tests/fixtures/resume-data";

// We test the pure function `detectChangedSections` here.
// The VersionService class methods depend on Firestore and are tested via integration.

describe("detectChangedSections", () => {
  it("returns all non-empty sections for first version (null oldData)", () => {
    const newData = createCompleteResume();
    const changed = detectChangedSections(null, newData);

    expect(changed).toContain("personalInfo");
    expect(changed).toContain("workExperience");
    expect(changed).toContain("education");
    expect(changed).toContain("skills");
    expect(changed.length).toBeGreaterThan(0);
  });

  it("returns empty array for first version with empty resume", () => {
    const changed = detectChangedSections(null, createEmptyResume());
    // personalInfo has all empty strings, arrays are empty
    // Depending on the check, personalInfo might not be detected as changed
    expect(changed.length).toBe(0);
  });

  it("returns empty array when nothing changed", () => {
    const data = createCompleteResume();
    const changed = detectChangedSections(data, data);
    expect(changed).toHaveLength(0);
  });

  it("detects changes in personal info", () => {
    const old = createResumeWith({
      personalInfo: {
        firstName: "Alex",
        lastName: "Taylor",
        email: "a@b.com",
        phone: "555",
        location: "NYC",
      },
    });
    const updated = createResumeWith({
      personalInfo: {
        firstName: "Alex",
        lastName: "Taylor",
        email: "new@email.com",
        phone: "555",
        location: "NYC",
      },
    });
    const changed = detectChangedSections(old, updated);
    expect(changed).toContain("personalInfo");
  });

  it("detects changes in work experience", () => {
    const old = createResumeWith({
      workExperience: [createWorkExperience()],
    });
    const updated = createResumeWith({
      workExperience: [
        createWorkExperience(),
        createWorkExperience({ company: "NewCo" }),
      ],
    });
    const changed = detectChangedSections(old, updated);
    expect(changed).toContain("workExperience");
  });

  it("detects changes in skills", () => {
    const old = createResumeWith({
      skills: [createSkill({ name: "TypeScript" })],
    });
    const updated = createResumeWith({
      skills: [
        createSkill({ name: "TypeScript" }),
        createSkill({ name: "React" }),
      ],
    });
    const changed = detectChangedSections(old, updated);
    expect(changed).toContain("skills");
  });

  it("does not report unchanged sections", () => {
    const base = createResumeWith({
      personalInfo: {
        firstName: "A",
        lastName: "B",
        email: "a@b.com",
        phone: "555",
        location: "X",
      },
      workExperience: [createWorkExperience()],
      skills: [createSkill()],
    });
    const updated = createResumeWith({
      personalInfo: {
        firstName: "A",
        lastName: "B",
        email: "a@b.com",
        phone: "555",
        location: "X",
      },
      workExperience: [createWorkExperience()],
      skills: [createSkill(), createSkill({ name: "React" })],
    });

    const changed = detectChangedSections(base, updated);
    expect(changed).toContain("skills");
    expect(changed).not.toContain("personalInfo");
  });
});
