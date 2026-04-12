import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useCoverLetter } from "../use-cover-letter";
import type { CoverLetterData } from "@/lib/types/cover-letter";
import type { PersonalInfo } from "@/lib/types/resume";

const { mockGenerateId } = vi.hoisted(() => ({
  mockGenerateId: vi.fn(() => "cover-letter-1"),
}));

vi.mock("@/lib/utils", () => ({
  generateId: () => mockGenerateId(),
}));

const personalInfo: PersonalInfo = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "1234567890",
  location: "Madrid",
  linkedin: "https://linkedin.com/in/jane",
  website: "https://janedoe.dev",
};

describe("useCoverLetter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-11T12:00:00.000Z"));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a new cover letter and pre-fills sender info from personal info", () => {
    const { result } = renderHook(() => useCoverLetter(personalInfo));

    expect(result.current.coverLetterData.id).toBe("cover-letter-1");
    expect(result.current.coverLetterData.createdAt).toBe("2026-04-11T12:00:00.000Z");
    expect(result.current.coverLetterData.senderName).toBe("Jane Doe");
    expect(result.current.coverLetterData.senderEmail).toBe("jane@example.com");
    expect(result.current.coverLetterData.senderPhone).toBe("1234567890");
    expect(result.current.coverLetterData.senderLocation).toBe("Madrid");
    expect(result.current.isDirty).toBe(false);
  });

  it("updates nested fields and body paragraphs while marking the draft dirty", () => {
    const { result } = renderHook(() => useCoverLetter());

    vi.setSystemTime(new Date("2026-04-11T12:05:00.000Z"));
    act(() => {
      result.current.updateJobInfo({ jobTitle: "Frontend Engineer" });
      result.current.updateRecipient({ company: "Acme", name: "Alex" });
      result.current.updateBodyParagraph(0, "Built accessible interfaces.");
      result.current.addBodyParagraph();
      result.current.updateBodyParagraph(2, "Collaborated across design and engineering.");
      result.current.reorderBodyParagraphs(2, 1);
      result.current.removeBodyParagraph(0);
    });

    expect(result.current.coverLetterData.jobTitle).toBe("Frontend Engineer");
    expect(result.current.coverLetterData.recipient.company).toBe("Acme");
    expect(result.current.coverLetterData.recipient.name).toBe("Alex");
    expect(result.current.coverLetterData.bodyParagraphs).toEqual([
      "Collaborated across design and engineering.",
      "",
    ]);
    expect(result.current.coverLetterData.updatedAt).toBe("2026-04-11T12:05:00.000Z");
    expect(result.current.isDirty).toBe(true);
  });

  it("validates required narrative fields and email format", () => {
    const { result } = renderHook(() => useCoverLetter());

    act(() => {
      result.current.updateSenderInfo({
        senderName: "",
        senderEmail: "not-an-email",
      });
      result.current.updateOpeningParagraph("");
      result.current.updateClosingParagraph("");
      result.current.updateBodyParagraph(0, "");
      result.current.updateBodyParagraph(1, "");
    });

    const validation = result.current.validateCoverLetter();

    expect(validation.valid).toBe(false);
    expect(validation.errors.map((error) => error.field)).toEqual([
      "senderName",
      "senderEmail",
      "openingParagraph",
      "bodyParagraphs",
      "closingParagraph",
    ]);
  });

  it("calculates completion percentage from the required workflow fields", () => {
    const { result } = renderHook(() => useCoverLetter(personalInfo));

    act(() => {
      result.current.updateJobInfo({ jobTitle: "Frontend Engineer" });
      result.current.updateRecipient({ company: "Acme" });
      result.current.updateOpeningParagraph("I am excited to apply.");
      result.current.updateBodyParagraph(0, "I improved conversion by 18%.");
      result.current.updateClosingParagraph("I would welcome the chance to speak.");
    });

    expect(result.current.completionPercentage()).toBe(100);
  });

  it("supports loading an existing letter and resetting back to a fresh prefilled state", () => {
    const { result } = renderHook(() => useCoverLetter(personalInfo));

    const loadedLetter: CoverLetterData = {
      ...result.current.coverLetterData,
      id: "loaded-letter",
      jobTitle: "Product Designer",
      recipient: {
        company: "Northwind",
      },
      openingParagraph: "Loaded from storage.",
      bodyParagraphs: ["Loaded paragraph"],
      closingParagraph: "Thanks for your time.",
      templateId: "executive",
    };

    act(() => {
      result.current.loadCoverLetter(loadedLetter);
    });

    expect(result.current.coverLetterData.id).toBe("loaded-letter");
    expect(result.current.coverLetterData.templateId).toBe("executive");
    expect(result.current.isDirty).toBe(false);

    vi.setSystemTime(new Date("2026-04-11T12:10:00.000Z"));
    act(() => {
      result.current.resetCoverLetter();
    });

    expect(result.current.coverLetterData.id).toBe("cover-letter-1");
    expect(result.current.coverLetterData.senderName).toBe("Jane Doe");
    expect(result.current.coverLetterData.jobTitle).toBe("");
    expect(result.current.coverLetterData.templateId).toBe("modern");
    expect(result.current.coverLetterData.createdAt).toBe("2026-04-11T12:10:00.000Z");
    expect(result.current.isDirty).toBe(false);
  });
});
