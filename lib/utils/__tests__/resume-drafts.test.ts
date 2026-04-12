import { describe, expect, it } from "vitest";
import {
  hasMeaningfulResumeContent,
  resumeDraftMatchesSavedResume,
  shouldShowContinueDraft,
} from "../resume-drafts";
import {
  createCompleteResume,
  createEmptyResume,
  createMinimalResume,
} from "@/tests/fixtures/resume-data";

describe("resume draft utilities", () => {
  it("detects empty resumes as not meaningful", () => {
    expect(hasMeaningfulResumeContent(createEmptyResume())).toBe(false);
  });

  it("treats populated resumes as meaningful", () => {
    expect(hasMeaningfulResumeContent(createMinimalResume())).toBe(true);
  });

  it("matches drafts when template and data are identical", () => {
    const resume = createCompleteResume();

    expect(
      resumeDraftMatchesSavedResume(
        { data: resume, templateId: "modern" },
        { data: resume, templateId: "modern" }
      )
    ).toBe(true);
  });

  it("treats template-only differences as unsaved draft changes", () => {
    const resume = createCompleteResume();

    expect(
      resumeDraftMatchesSavedResume(
        { data: resume, templateId: "modern" },
        { data: resume, templateId: "classic" }
      )
    ).toBe(false);
  });

  it("hides Continue Draft when the current draft matches a saved resume", () => {
    const resume = createCompleteResume();

    expect(
      shouldShowContinueDraft(
        { data: resume, templateId: "modern" },
        [{ data: resume, templateId: "modern" }]
      )
    ).toBe(false);
  });

  it("shows Continue Draft when the current draft differs from saved resumes", () => {
    const savedResume = createCompleteResume();
    const currentDraft = {
      ...savedResume,
      personalInfo: {
        ...savedResume.personalInfo,
        summary: `${savedResume.personalInfo.summary} Updated draft.`,
      },
    };

    expect(
      shouldShowContinueDraft(
        { data: currentDraft, templateId: "modern" },
        [{ data: savedResume, templateId: "modern" }]
      )
    ).toBe(true);
  });

  it("shows Continue Draft when there are no saved resumes but a meaningful draft exists", () => {
    const draft = createMinimalResume();

    expect(shouldShowContinueDraft({ data: draft, templateId: "modern" }, [])).toBe(
      true
    );
  });
});
