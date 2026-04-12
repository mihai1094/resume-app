import { ResumeData } from "@/lib/types/resume";

export interface ResumeDraftLike {
  data: ResumeData;
  templateId?: string | null;
}

export function hasMeaningfulResumeContent(
  data: ResumeData | null | undefined
): boolean {
  if (!data) return false;

  const personalInfoValues = [
    data.personalInfo.firstName,
    data.personalInfo.lastName,
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
    data.personalInfo.website,
    data.personalInfo.linkedin,
    data.personalInfo.github,
    data.personalInfo.summary,
    data.personalInfo.jobTitle,
  ];

  const hasPersonalInfo = personalInfoValues.some((value) =>
    Boolean(value?.trim())
  );

  return (
    hasPersonalInfo ||
    (data.workExperience?.length ?? 0) > 0 ||
    (data.education?.length ?? 0) > 0 ||
    (data.skills?.length ?? 0) > 0 ||
    (data.projects?.length ?? 0) > 0 ||
    (data.languages?.length ?? 0) > 0 ||
    (data.certifications?.length ?? 0) > 0 ||
    (data.courses?.length ?? 0) > 0 ||
    (data.hobbies?.length ?? 0) > 0 ||
    (data.extraCurricular?.length ?? 0) > 0 ||
    (data.customSections?.length ?? 0) > 0
  );
}

export function resumeDraftMatchesSavedResume(
  currentDraft: ResumeDraftLike | null | undefined,
  savedResume: ResumeDraftLike
): boolean {
  if (!currentDraft) return false;

  return (
    (currentDraft.templateId ?? null) === (savedResume.templateId ?? null) &&
    JSON.stringify(currentDraft.data) === JSON.stringify(savedResume.data)
  );
}

export function shouldShowContinueDraft(
  currentDraft: ResumeDraftLike | null | undefined,
  savedResumes: ResumeDraftLike[]
): boolean {
  if (!hasMeaningfulResumeContent(currentDraft?.data)) {
    return false;
  }

  return !savedResumes.some((savedResume) =>
    resumeDraftMatchesSavedResume(currentDraft, savedResume)
  );
}
