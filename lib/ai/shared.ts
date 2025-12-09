import { ResumeData } from "@/lib/types/resume";
import { CoverLetterOutput } from "./content-types";
import { getModel, SAFETY_SETTINGS } from "./gemini-client";

export const flashModel = () => getModel("FLASH");
export const safety = SAFETY_SETTINGS;

/**
 * Utility: safe JSON extraction from LLM responses (handles code fences / loose JSON).
 */
export function extractJson<T>(text: string): T | null {
  const candidates =
    text.match(/```json\s*([\s\S]*?)```/) ||
    text.match(/```\s*([\s\S]*?)```/) ||
    text.match(/\{[\s\S]*\}/) ||
    text.match(/\[[\s\S]*\]/);

  if (!candidates) return null;
  const jsonText = candidates[1] || candidates[0];

  const tryParse = (payload: string) => {
    try {
      return JSON.parse(payload) as T;
    } catch {
      return null;
    }
  };

  const direct = tryParse(jsonText);
  if (direct) return direct;

  const first = jsonText.indexOf("{");
  const last = jsonText.lastIndexOf("}");
  if (first !== -1 && last > first) {
    return tryParse(jsonText.slice(first, last + 1));
  }

  const arrFirst = jsonText.indexOf("[");
  const arrLast = jsonText.lastIndexOf("]");
  if (arrFirst !== -1 && arrLast > arrFirst) {
    return tryParse(jsonText.slice(arrFirst, arrLast + 1));
  }

  return null;
}

/**
 * Serialize resume data into a prompt-friendly string.
 */
export function serializeResume(resumeData: ResumeData): string {
  if (!resumeData) return "";

  const parts: string[] = [];
  const pi = resumeData.personalInfo;

  if (pi) {
    parts.push(`Name: ${pi.firstName} ${pi.lastName}`);
    if (pi.jobTitle) parts.push(`Title: ${pi.jobTitle}`);
    if (pi.summary) parts.push(`Summary: ${pi.summary}`);
    if (pi.location) parts.push(`Location: ${pi.location}`);
  }

  if (resumeData.workExperience?.length) {
    parts.push("\nWORK EXPERIENCE:");
    resumeData.workExperience.forEach((exp) => {
      parts.push(`\n${exp.position} at ${exp.company}`);
      if (exp.location) parts.push(`Location: ${exp.location}`);
      const start = exp.startDate ? exp.startDate : "N/A";
      const end = exp.current ? "Present" : exp.endDate || "Present";
      parts.push(`Dates: ${start} - ${end}`);
      exp.description?.forEach((line) => {
        if (line?.trim()) parts.push(`- ${line.trim()}`);
      });
      exp.achievements?.forEach((line) => {
        if (line?.trim()) parts.push(`- ${line.trim()}`);
      });
    });
  }

  if (resumeData.projects?.length) {
    parts.push("\nPROJECTS:");
    resumeData.projects.forEach((project) => {
      parts.push(
        `${project.name}${
          project.description ? `: ${project.description}` : ""
        }`
      );
      if (project.technologies?.length) {
        parts.push(`Technologies: ${project.technologies.join(", ")}`);
      }
    });
  }

  if (resumeData.education?.length) {
    parts.push("\nEDUCATION:");
    resumeData.education.forEach((edu) => {
      parts.push(`${edu.degree} in ${edu.field} at ${edu.institution}`);
      const end = edu.current ? "Present" : edu.endDate || "Present";
      parts.push(`Dates: ${edu.startDate} - ${end}`);
    });
  }

  if (resumeData.skills?.length) {
    parts.push("\nSKILLS:");
    parts.push(resumeData.skills.map((s) => s.name).join(", "));
  }

  if (resumeData.languages?.length) {
    parts.push("\nLANGUAGES:");
    resumeData.languages.forEach((lang) => {
      parts.push(`${lang.name}${lang.level ? ` (${lang.level})` : ""}`);
    });
  }

  if (resumeData.certifications?.length) {
    parts.push("\nCERTIFICATIONS:");
    resumeData.certifications.forEach((cert) => {
      parts.push(`${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ""}`);
    });
  }

  return parts.join("\n");
}

/**
 * Heuristic metric extraction from a text snippet.
 */
export function extractMetrics(text: string): string {
  const matches =
    text.match(
      /\b\d+(?:\.\d+)?\s*(?:%|percent|pts|ms|s|sec|seconds|hrs?|hours?|days?|weeks?|x|k|m|b)?\b/gi
    ) || [];
  const unique = Array.from(
    new Set(
      matches.map((m) =>
        m
          .replace(/\s+/g, " ")
          .replace(/percent/i, "%")
          .trim()
      )
    )
  );
  return unique.slice(0, 3).join(", ");
}

/**
 * Fallback parser for cover letter text responses when JSON is not returned.
 */
export function fallbackCoverLetterFromText(
  text: string,
  resumeData: ResumeData
): CoverLetterOutput {
  const cleaned = text.replace(/```[\s\S]*?```/g, "").trim();
  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const defaultSignature = `Sincerely,\n${
    resumeData.personalInfo?.firstName || ""
  } ${resumeData.personalInfo?.lastName || ""}`.trim();

  const salutation =
    paragraphs.find((p) => /^dear/i.test(p)) || "Dear Hiring Manager,";
  const salutationIndex = paragraphs.findIndex((p) => p === salutation);

  const closingIndex = paragraphs.findIndex((p) =>
    /^(sincerely|best regards|thank you)/i.test(p)
  );

  const closing =
    closingIndex !== -1
      ? paragraphs[closingIndex]
      : "Thank you for your consideration.";
  const signature =
    closingIndex !== -1 && paragraphs[closingIndex + 1]
      ? paragraphs[closingIndex + 1]
      : defaultSignature;

  const bodyStart = salutationIndex >= 0 ? salutationIndex + 1 : 0;
  const bodyEnd = closingIndex > bodyStart ? closingIndex : paragraphs.length;
  const body = paragraphs.slice(bodyStart, bodyEnd);

  return {
    salutation,
    introduction: body[0] || "",
    bodyParagraphs: body.slice(1),
    closing,
    signature,
  };
}
