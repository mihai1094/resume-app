import {
  CoverLetterData,
  DEFAULT_COVER_LETTER,
  SavedCoverLetter,
} from "@/lib/types/cover-letter";

export interface CoverLetterDraftLike {
  data: CoverLetterData;
}

function normalizeCoverLetterForComparison(data: CoverLetterData) {
  return {
    jobTitle: data.jobTitle,
    jobReference: data.jobReference ?? "",
    date: data.date,
    recipient: {
      name: data.recipient.name ?? "",
      title: data.recipient.title ?? "",
      company: data.recipient.company ?? "",
      department: data.recipient.department ?? "",
      address: data.recipient.address ?? "",
    },
    senderName: data.senderName,
    senderEmail: data.senderEmail,
    senderPhone: data.senderPhone,
    senderLocation: data.senderLocation,
    senderLinkedin: data.senderLinkedin ?? "",
    senderWebsite: data.senderWebsite ?? "",
    salutation: data.salutation,
    openingParagraph: data.openingParagraph,
    bodyParagraphs: data.bodyParagraphs,
    closingParagraph: data.closingParagraph,
    signOff: data.signOff,
    templateId: data.templateId,
    tone: data.tone ?? DEFAULT_COVER_LETTER.tone,
  };
}

export function hasMeaningfulCoverLetterContent(
  data: CoverLetterData | null | undefined
): boolean {
  if (!data) return false;

  const textFields = [
    data.jobTitle,
    data.jobReference,
    data.recipient.name,
    data.recipient.title,
    data.recipient.company,
    data.recipient.department,
    data.recipient.address,
    data.senderName,
    data.senderEmail,
    data.senderPhone,
    data.senderLocation,
    data.senderLinkedin,
    data.senderWebsite,
    data.openingParagraph,
    data.closingParagraph,
  ];

  const hasTextContent = textFields.some((value) => Boolean(value?.trim()));
  const hasBodyContent = data.bodyParagraphs.some((paragraph) =>
    Boolean(paragraph?.trim())
  );
  const hasCustomSalutation =
    data.salutation.trim() !== DEFAULT_COVER_LETTER.salutation;
  const hasCustomSignOff = data.signOff.trim() !== DEFAULT_COVER_LETTER.signOff;
  const hasCustomTemplate = data.templateId !== DEFAULT_COVER_LETTER.templateId;
  const hasCustomTone =
    (data.tone ?? DEFAULT_COVER_LETTER.tone) !== DEFAULT_COVER_LETTER.tone;

  return (
    hasTextContent ||
    hasBodyContent ||
    hasCustomSalutation ||
    hasCustomSignOff ||
    hasCustomTemplate ||
    hasCustomTone
  );
}

export function coverLetterDraftMatchesSavedCoverLetter(
  currentDraft: CoverLetterDraftLike | null | undefined,
  savedCoverLetter: CoverLetterDraftLike | SavedCoverLetter
): boolean {
  if (!currentDraft) return false;

  return (
    JSON.stringify(normalizeCoverLetterForComparison(currentDraft.data)) ===
    JSON.stringify(normalizeCoverLetterForComparison(savedCoverLetter.data))
  );
}

export function shouldShowContinueCoverLetterDraft(
  currentDraft: CoverLetterDraftLike | null | undefined,
  savedCoverLetters: Array<CoverLetterDraftLike | SavedCoverLetter>
): boolean {
  if (!hasMeaningfulCoverLetterContent(currentDraft?.data)) {
    return false;
  }

  return !savedCoverLetters.some((savedCoverLetter) =>
    coverLetterDraftMatchesSavedCoverLetter(currentDraft, savedCoverLetter)
  );
}
