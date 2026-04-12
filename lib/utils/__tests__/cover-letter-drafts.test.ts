import { describe, expect, it } from "vitest";
import {
  coverLetterDraftMatchesSavedCoverLetter,
  hasMeaningfulCoverLetterContent,
  shouldShowContinueCoverLetterDraft,
} from "../cover-letter-drafts";
import {
  CoverLetterData,
  DEFAULT_COVER_LETTER,
} from "@/lib/types/cover-letter";

function createEmptyCoverLetter(): CoverLetterData {
  return {
    ...DEFAULT_COVER_LETTER,
    id: "cover-letter-1",
    date: "2026-03-29",
    createdAt: "2026-03-29T10:00:00.000Z",
    updatedAt: "2026-03-29T10:00:00.000Z",
    recipient: {
      ...DEFAULT_COVER_LETTER.recipient,
    },
    bodyParagraphs: [...DEFAULT_COVER_LETTER.bodyParagraphs],
  };
}

function createMeaningfulCoverLetter(): CoverLetterData {
  return {
    ...createEmptyCoverLetter(),
    jobTitle: "Product Designer",
    senderName: "Jane Doe",
    senderEmail: "jane@example.com",
    recipient: {
      ...DEFAULT_COVER_LETTER.recipient,
      company: "Acme",
    },
    openingParagraph: "I am excited to apply for the Product Designer role.",
    bodyParagraphs: [
      "I have led product design work across complex SaaS flows.",
      "",
    ],
    closingParagraph: "I would welcome the chance to discuss the role further.",
  };
}

describe("cover letter draft utilities", () => {
  it("detects empty cover letters as not meaningful", () => {
    expect(hasMeaningfulCoverLetterContent(createEmptyCoverLetter())).toBe(false);
  });

  it("treats populated cover letters as meaningful", () => {
    expect(hasMeaningfulCoverLetterContent(createMeaningfulCoverLetter())).toBe(
      true
    );
  });

  it("matches drafts even when only metadata differs", () => {
    const savedCoverLetter = createMeaningfulCoverLetter();
    const currentDraft = {
      ...savedCoverLetter,
      id: "draft-2",
      createdAt: "2026-03-30T10:00:00.000Z",
      updatedAt: "2026-03-30T11:00:00.000Z",
    };

    expect(
      coverLetterDraftMatchesSavedCoverLetter(
        { data: currentDraft },
        { data: savedCoverLetter }
      )
    ).toBe(true);
  });

  it("hides Continue Draft when the draft matches a saved cover letter", () => {
    const savedCoverLetter = createMeaningfulCoverLetter();

    expect(
      shouldShowContinueCoverLetterDraft(
        { data: savedCoverLetter },
        [{ data: savedCoverLetter }]
      )
    ).toBe(false);
  });

  it("shows Continue Draft when the draft differs from saved cover letters", () => {
    const savedCoverLetter = createMeaningfulCoverLetter();
    const currentDraft = {
      ...savedCoverLetter,
      closingParagraph: "I'd love to continue the conversation with your team.",
    };

    expect(
      shouldShowContinueCoverLetterDraft(
        { data: currentDraft },
        [{ data: savedCoverLetter }]
      )
    ).toBe(true);
  });
});
