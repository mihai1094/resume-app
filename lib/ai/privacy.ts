import type { ResumeData } from "@/lib/types/resume";

export type AIPrivacyMode = "strict" | "standard";

interface SanitizeResumeOptions {
  mode?: AIPrivacyMode;
  profile?: "default" | "ats";
}

function emptyIfHidden(value: string | undefined, keep: boolean): string {
  return keep ? value || "" : "";
}

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_RE = /\b(?:\+?\d[\d\s().-]{7,}\d)\b/g;
const URL_RE = /https?:\/\/[^\s]+/gi;

/**
 * Temporary kill switch:
 * - default behavior is privacy-safe (PII excluded)
 * - PII can be re-enabled only when AI_ALLOW_PII=true
 */
export function allowPIIForAI(): boolean {
  return process.env.AI_ALLOW_PII === "true";
}

export function resolvePrivacyMode(input: unknown): AIPrivacyMode {
  return input === "standard" ? "standard" : "strict";
}

/**
 * Returns a model-safe resume payload.
 * Direct identifiers are removed by default.
 */
export function sanitizeResumeForAI(
  resumeData: ResumeData,
  options: SanitizeResumeOptions = {}
): ResumeData {
  const mode = resolvePrivacyMode(options.mode);
  const piiAllowed = allowPIIForAI() && mode === "standard";
  const atsProfile = options.profile === "ats";

  const personalInfo = resumeData.personalInfo || {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
  };

  return {
    ...resumeData,
    personalInfo: {
      ...personalInfo,
      firstName: emptyIfHidden(personalInfo.firstName, piiAllowed),
      lastName: emptyIfHidden(personalInfo.lastName, piiAllowed),
      email: emptyIfHidden(personalInfo.email, piiAllowed),
      phone: emptyIfHidden(personalInfo.phone, piiAllowed),
      website: emptyIfHidden(personalInfo.website, piiAllowed),
      linkedin: emptyIfHidden(personalInfo.linkedin, piiAllowed),
      github: emptyIfHidden(personalInfo.github, piiAllowed),
      photo: "",
      location: personalInfo.location || "",
      summary: personalInfo.summary || "",
      jobTitle: personalInfo.jobTitle || "",
    },
    projects: (resumeData.projects || []).map((project) => ({
      ...project,
      url: "",
      github: "",
    })),
    certifications: (resumeData.certifications || []).map((cert) => ({
      ...cert,
      url: "",
    })),
    courses: atsProfile
      ? []
      : (resumeData.courses || []).map((course) => ({
          ...course,
          url: "",
        })),
    hobbies: atsProfile ? [] : resumeData.hobbies || [],
    extraCurricular: atsProfile ? [] : resumeData.extraCurricular || [],
    languages: atsProfile ? [] : resumeData.languages || [],
  };
}

interface SanitizeTextOptions {
  maxLength?: number;
}

export function sanitizeTextForAI(
  text: string,
  options: SanitizeTextOptions = {}
): string {
  const { maxLength = 2000 } = options;

  return text
    .replace(EMAIL_RE, "[REDACTED_EMAIL]")
    .replace(PHONE_RE, "[REDACTED_PHONE]")
    .replace(URL_RE, "[REDACTED_URL]")
    .slice(0, Math.max(1, maxLength))
    .trim();
}
