import {
  ResumeData,
  PersonalInfo,
  WorkExperience,
  Education,
} from "@/lib/types/resume";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Field-level validators
export const validators = {
  email: (value: string): string | null => {
    if (!value) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Invalid email format";
    }
    return null;
  },

  phone: (value: string): string | null => {
    if (!value) return "Phone is required";
    // E.164-ish check: allow + and 8-15 digits
    const digits = value.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) {
      return "Use a valid phone with country/area code";
    }
    return null;
  },

  required: (value: unknown): string | null => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return "This field is required";
    }
    return null;
  },

  url: (value?: string): string | null => {
    if (!value) return null; // Optional field
    try {
      // If the URL doesn't start with a protocol, prepend https://
      const urlToValidate = value.match(/^https?:\/\//)
        ? value
        : `https://${value}`;
      new URL(urlToValidate);
      return null;
    } catch {
      return "Invalid URL format";
    }
  },

  dateRange: (
    startDate: string,
    endDate?: string,
    current?: boolean
  ): string | null => {
    if (!startDate) return "Start date is required";
    if (!current && !endDate)
      return "End date is required (or check 'Current')";
    if (endDate && new Date(startDate) > new Date(endDate)) {
      return "Start date must be before end date";
    }
    return null;
  },
};

// Section validators - returns { errors, warnings }
// MINIMAL BLOCKING: Only firstName, lastName, and valid email format block progression
export function validatePersonalInfo(info: PersonalInfo): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // HARD ERRORS - these block progression
  const requiredFields: Array<{ key: keyof PersonalInfo; message: string }> = [
    { key: "firstName", message: "First name is required" },
    { key: "lastName", message: "Last name is required" },
  ];
  requiredFields.forEach(({ key, message }) => {
    const error = validators.required(info[key]);
    if (error) errors.push({ field: key, message });
  });

  // Email: required AND must be valid format
  if (!info.email) {
    errors.push({ field: "email", message: "Email is required" });
  } else {
    const emailError = validators.email(info.email);
    if (emailError) errors.push({ field: "email", message: emailError });
  }

  // SOFT WARNINGS - these don't block progression
  if (info.phone) {
    const phoneError = validators.phone(info.phone);
    if (phoneError) warnings.push({ field: "phone", message: phoneError });
  }

  if (info.website) {
    const urlError = validators.url(info.website);
    if (urlError) warnings.push({ field: "website", message: urlError });
  }

  if (info.linkedin && info.linkedin.startsWith("http")) {
    const urlError = validators.url(info.linkedin);
    if (urlError) warnings.push({ field: "linkedin", message: urlError });
  }

  if (info.github && info.github.startsWith("http")) {
    const urlError = validators.url(info.github);
    if (urlError) warnings.push({ field: "github", message: urlError });
  }

  if (info.summary && info.summary.trim().length > 0 && info.summary.trim().length < 40) {
    warnings.push({
      field: "summary",
      message: "Consider adding more detail to your summary",
    });
  }

  return { errors, warnings };
}

// MINIMAL BLOCKING: Work experience validation is entirely non-blocking (warnings only)
export function validateWorkExperience(
  experiences: WorkExperience[]
): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  experiences.forEach((exp, index) => {
    if (!exp.company) {
      warnings.push({
        field: `experience.${index}.company`,
        message: "Add company name for completeness",
      });
    }
    if (!exp.position) {
      warnings.push({
        field: `experience.${index}.position`,
        message: "Add position title for completeness",
      });
    }

    const dateError = validators.dateRange(
      exp.startDate,
      exp.endDate,
      exp.current
    );
    if (dateError) {
      warnings.push({
        field: `experience.${index}.dates`,
        message: dateError,
      });
    }

    if (
      exp.description.length === 0 ||
      exp.description.every((d) => !d.trim())
    ) {
      warnings.push({
        field: `experience.${index}.description`,
        message: "Consider adding responsibilities",
      });
    } else if (exp.description.some((d) => d.trim().length > 0 && d.trim().length < 20)) {
      warnings.push({
        field: `experience.${index}.description`,
        message: "Consider adding more detail to your bullets",
      });
    }
  });

  return { errors, warnings };
}

// MINIMAL BLOCKING: Education validation is entirely non-blocking (warnings only)
export function validateEducation(education: Education[]): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  education.forEach((edu, index) => {
    if (!edu.institution) {
      warnings.push({
        field: `education.${index}.institution`,
        message: "Add institution name for completeness",
      });
    }
    if (!edu.degree) {
      warnings.push({
        field: `education.${index}.degree`,
        message: "Add degree for completeness",
      });
    }
    if (!edu.field) {
      warnings.push({
        field: `education.${index}.field`,
        message: "Add field of study for completeness",
      });
    }
    // Location is optional - no warning needed

    const dateError = validators.dateRange(
      edu.startDate,
      edu.endDate,
      edu.current
    );
    if (dateError) {
      warnings.push({
        field: `education.${index}.dates`,
        message: dateError,
      });
    }
  });

  return { errors, warnings };
}

// MINIMAL BLOCKING: All optional section validators return warnings only
function validateSkills(skills: ResumeData["skills"]): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  if (!skills || skills.length === 0) {
    return { errors, warnings };
  }

  skills.forEach((skill, index) => {
    if (!skill.name?.trim()) {
      warnings.push({
        field: `skills.${index}.name`,
        message: "Add skill name",
      });
    }
    if (!skill.category?.trim()) {
      warnings.push({
        field: `skills.${index}.category`,
        message: "Pick a category",
      });
    }
  });

  return { errors, warnings };
}

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
// MINIMAL BLOCKING: Only firstName, lastName, and valid email block progression
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
