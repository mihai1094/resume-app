import type { ResumeData } from "@/lib/types/resume";
import type { TemplateId } from "@/lib/constants/templates";
import type { SectionId } from "@/lib/constants/defaults";

export type OptionalResumeDisplayKey =
  | "projects"
  | "certifications"
  | "courses"
  | "languages"
  | "hobbies"
  | "extraCurricular"
  | "customSections";

const ALL_TEMPLATES: TemplateId[] = [
  "adaptive",
  "ats-clarity",
  "ats-compact",
  "ats-structured",
  "bold",
  "cascade",
  "classic",
  "creative",
  "cubic",
  "diamond",
  "dublin",
  "executive",
  "functional",
  "horizon",
  "iconic",
  "infographic",
  "ivy",
  "minimalist",
  "modern",
  "nordic",
  "notion",
  "simple",
  "student",
  "technical",
  "timeline",
];

const SUPPORT: Record<OptionalResumeDisplayKey, Set<TemplateId>> = {
  projects: new Set<TemplateId>([
    "adaptive",
    "ats-clarity",
    "ats-compact",
    "ats-structured",
    "bold",
    "cascade",
    "classic",
    "creative",
    "cubic",
    "diamond",
    "dublin",
    "executive",
    "functional",
    "horizon",
    "iconic",
    "infographic",
    "minimalist",
    "modern",
    "nordic",
    "notion",
    "simple",
    "student",
    "technical",
    "timeline",
  ]),
  certifications: new Set<TemplateId>([
    "adaptive",
    "ats-clarity",
    "ats-compact",
    "ats-structured",
    "bold",
    "cascade",
    "classic",
    "creative",
    "cubic",
    "diamond",
    "dublin",
    "executive",
    "functional",
    "horizon",
    "iconic",
    "infographic",
    "ivy",
    "minimalist",
    "modern",
    "nordic",
    "notion",
    "simple",
    "student",
    "technical",
    "timeline",
  ]),
  courses: new Set<TemplateId>([
    "adaptive",
    "ats-clarity",
    "ats-compact",
    "ats-structured",
    "classic",
    "creative",
    "executive",
    "iconic",
    "ivy",
    "minimalist",
    "modern",
    "technical",
    "timeline",
  ]),
  languages: new Set<TemplateId>(ALL_TEMPLATES),
  hobbies: new Set<TemplateId>([
    "bold",
    "cascade",
    "classic",
    "creative",
    "dublin",
    "executive",
    "horizon",
    "iconic",
    "ivy",
    "minimalist",
    "modern",
    "nordic",
    "notion",
    "timeline",
  ]),
  extraCurricular: new Set<TemplateId>(ALL_TEMPLATES),
  customSections: new Set<TemplateId>([
    "ats-clarity",
    "ats-compact",
    "ats-structured",
    "classic",
    "executive",
    "iconic",
    "modern",
    "notion",
  ]),
};

export function templateSupportsOptionalDisplay(
  templateId: TemplateId,
  key: OptionalResumeDisplayKey
): boolean {
  return SUPPORT[key].has(templateId);
}

function countItems<T>(items?: T[]): number {
  return Array.isArray(items) ? items.length : 0;
}

export function getTemplateHiddenContentWarnings(params: {
  templateId: TemplateId;
  activeSection: SectionId;
  resumeData: ResumeData;
}): string[] {
  const { templateId, activeSection, resumeData } = params;
  const warnings: string[] = [];

  if (
    activeSection === "projects" &&
    countItems(resumeData.projects) > 0 &&
    !templateSupportsOptionalDisplay(templateId, "projects")
  ) {
    warnings.push(
      "This template does not display Projects in the resume preview/export layout."
    );
  }

  if (activeSection === "certifications") {
    if (
      countItems(resumeData.certifications) > 0 &&
      !templateSupportsOptionalDisplay(templateId, "certifications")
    ) {
      warnings.push(
        "This template does not display Certifications in the resume layout."
      );
    }

    if (
      countItems(resumeData.courses) > 0 &&
      !templateSupportsOptionalDisplay(templateId, "courses")
    ) {
      warnings.push("This template does not display Courses in the resume layout.");
    }
  }

  if (
    activeSection === "languages" &&
    countItems(resumeData.languages) > 0 &&
    !templateSupportsOptionalDisplay(templateId, "languages")
  ) {
    warnings.push("This template does not display Languages in the resume layout.");
  }

  if (activeSection === "additional") {
    if (
      countItems(resumeData.hobbies) > 0 &&
      !templateSupportsOptionalDisplay(templateId, "hobbies")
    ) {
      warnings.push("This template does not display Hobbies in the resume layout.");
    }

    if (
      countItems(resumeData.customSections) > 0 &&
      !templateSupportsOptionalDisplay(templateId, "customSections")
    ) {
      warnings.push(
        "This template does not display Custom Sections in the resume layout."
      );
    }
  }

  return warnings;
}
