import {
  ResumeData,
  PersonalInfo,
  WorkExperience,
  Education,
  Skill,
} from "@/lib/types/resume";
import {
  MinimalPersonalInfoSchema,
  FullPersonalInfoSchema,
  FullWorkExperienceSchema,
  FullEducationSchema,
  FullSkillSchema,
} from "./schema";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Section validators - returns { errors, warnings }
 * MINIMAL BLOCKING: Only firstName, lastName, and valid email format block progression.
 * All other issues are treated as warnings.
 */

export function validatePersonalInfo(info: PersonalInfo): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // 1. Validate against Minimal Schema (Hard Errors)
  const minimalResult = MinimalPersonalInfoSchema.safeParse(info);
  if (!minimalResult.success) {
    minimalResult.error.issues.forEach((issue) => {
      errors.push({
        field: issue.path[0] as string,
        message: issue.message,
      });
    });
  }

  // 2. Validate against Full Schema (Warnings)
  const fullResult = FullPersonalInfoSchema.safeParse(info);
  if (!fullResult.success) {
    fullResult.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      // Only add to warnings if not already in errors
      if (!errors.some((e) => e.field === field)) {
        warnings.push({
          field,
          message: issue.message,
        });
      }
    });
  }

  return { errors, warnings };
}

export function validateWorkExperience(
  experiences: WorkExperience[]
): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  experiences.forEach((exp, index) => {
    const result = FullWorkExperienceSchema.safeParse(exp);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        warnings.push({
          field: `experience.${index}.${String(issue.path[0])}`,
          message: issue.message,
        });
      });
    }
  });

  return { errors, warnings };
}

export function validateEducation(education: Education[]): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  education.forEach((edu, index) => {
    const result = FullEducationSchema.safeParse(edu);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        warnings.push({
          field: `education.${index}.${String(issue.path[0])}`,
          message: issue.message,
        });
      });
    }
  });

  return { errors, warnings };
}

function validateSkills(skills: Skill[]): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (!skills || skills.length === 0) {
    return { errors, warnings };
  }

  skills.forEach((skill, index) => {
    const result = FullSkillSchema.safeParse(skill);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        warnings.push({
          field: `skills.${index}.${String(issue.path[0])}`,
          message: issue.message,
        });
      });
    }
  });

  return { errors, warnings };
}

// Optional section validators (simplified for now, can be expanded with more Zod schemas if needed)
function validateLanguages(
  languages: ResumeData["languages"]
): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (!languages) return { errors, warnings };

  languages.forEach((lang, index) => {
    if (!lang.name?.trim()) {
      warnings.push({
        field: `languages.${index}.name`,
        message: "Add language name",
      });
    }
    if (!lang.level) {
      warnings.push({
        field: `languages.${index}.level`,
        message: "Select proficiency level",
      });
    }
  });

  return { errors, warnings };
}

function validateProjects(projects: ResumeData["projects"]): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (!projects) return { errors, warnings };

  projects.forEach((project, index) => {
    if (!project.name?.trim()) {
      warnings.push({
        field: `projects.${index}.name`,
        message: "Add project name",
      });
    }
    if (project.startDate && project.endDate) {
      const start = new Date(project.startDate);
      const end = new Date(project.endDate);
      if (start > end) {
        warnings.push({
          field: `projects.${index}.dates`,
          message: "Start date should be before end date",
        });
      }
    }
  });

  return { errors, warnings };
}

function validateCertifications(
  certifications: ResumeData["certifications"]
): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (!certifications) return { errors, warnings };

  certifications.forEach((cert, index) => {
    if (!cert.name?.trim()) {
      warnings.push({
        field: `certifications.${index}.name`,
        message: "Add certification name",
      });
    }
    if (cert.expiryDate && cert.date) {
      const start = new Date(cert.date);
      const end = new Date(cert.expiryDate);
      if (start > end) {
        warnings.push({
          field: `certifications.${index}.dates`,
          message: "Expiry date should be after issue date",
        });
      }
    }
  });

  return { errors, warnings };
}

function validateCustomSections(
  customSections: ResumeData["customSections"]
): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (!customSections) return { errors, warnings };

  customSections.forEach((section, sectionIndex) => {
    if (!section.title?.trim()) {
      warnings.push({
        field: `customSections.${sectionIndex}.title`,
        message: "Add section title",
      });
    }

    (section.items || []).forEach((item, itemIndex) => {
      if (!item.title?.trim()) {
        warnings.push({
          field: `customSections.${sectionIndex}.items.${itemIndex}.title`,
          message: "Add item title",
        });
      }
    });
  });

  return { errors, warnings };
}

// Main resume validator
export function validateResume(data: ResumeData): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate each section - collect both errors and warnings
  const personalResult = validatePersonalInfo(data.personalInfo);
  errors.push(...personalResult.errors);
  warnings.push(...personalResult.warnings);

  const workResult = validateWorkExperience(data.workExperience);
  errors.push(...workResult.errors);
  warnings.push(...workResult.warnings);

  const eduResult = validateEducation(data.education);
  errors.push(...eduResult.errors);
  warnings.push(...eduResult.warnings);

  const skillsResult = validateSkills(data.skills);
  errors.push(...skillsResult.errors);
  warnings.push(...skillsResult.warnings);

  const langResult = validateLanguages(data.languages);
  errors.push(...langResult.errors);
  warnings.push(...langResult.warnings);

  const projectsResult = validateProjects(data.projects);
  errors.push(...projectsResult.errors);
  warnings.push(...projectsResult.warnings);

  const certsResult = validateCertifications(data.certifications);
  errors.push(...certsResult.errors);
  warnings.push(...certsResult.warnings);

  const customResult = validateCustomSections(data.customSections);
  errors.push(...customResult.errors);
  warnings.push(...customResult.warnings);

  // General improvement suggestions (non-blocking)
  if (data.workExperience.length === 0) {
    warnings.push({
      field: "workExperience",
      message: "Consider adding work experience",
    });
  }

  if (data.skills.length < 5) {
    warnings.push({
      field: "skills",
      message: "Adding more skills will strengthen your resume",
    });
  }

  if (data.education.length === 0) {
    warnings.push({
      field: "education",
      message: "Consider adding education information",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Backward compatibility (if needed by other components)
export const validators = {
  required: (value: unknown): string | null => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return "This field is required";
    }
    return null;
  },
  email: (value: string): string | null => {
    if (!value) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Invalid email format";
    }
    return null;
  },
  phone: (value: string): string | null => {
    if (!value) return "Phone is required";
    const digits = value.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) {
      return "Use a valid phone with country/area code";
    }
    return null;
  },
  url: (value?: string): string | null => {
    if (!value) return null;
    try {
      const urlToValidate = value.match(/^https?:\/\//) ? value : `https://${value}`;
      new URL(urlToValidate);
      return null;
    } catch {
      return "Invalid URL format";
    }
  },
};
