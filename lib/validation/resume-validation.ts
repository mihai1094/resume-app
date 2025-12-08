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

// Section validators
export function validatePersonalInfo(info: PersonalInfo): ValidationError[] {
  const errors: ValidationError[] = [];

  if (info.email) {
    const emailError = validators.email(info.email);
    if (emailError) errors.push({ field: "email", message: emailError });
  }

  if (info.phone) {
    const phoneError = validators.phone(info.phone);
    if (phoneError) errors.push({ field: "phone", message: phoneError });
  }

  const requiredFields: Array<{ key: keyof PersonalInfo; message: string }> = [
    { key: "firstName", message: "First name is required" },
    { key: "lastName", message: "Last name is required" },
  ];
  requiredFields.forEach(({ key, message }) => {
    const error = validators.required(info[key]);
    if (error) errors.push({ field: key, message });
  });

  if (info.website) {
    const urlError = validators.url(info.website);
    if (urlError) errors.push({ field: "website", message: urlError });
  }

  if (info.linkedin && info.linkedin.startsWith("http")) {
    const urlError = validators.url(info.linkedin);
    if (urlError) errors.push({ field: "linkedin", message: urlError });
  }

  if (info.github && info.github.startsWith("http")) {
    const urlError = validators.url(info.github);
    if (urlError) errors.push({ field: "github", message: urlError });
  }

  if (info.summary && info.summary.trim().length < 40) {
    errors.push({
      field: "summary",
      message: "Add a short summary (1–2 sentences works best)",
    });
  }

  return errors;
}

export function validateWorkExperience(
  experiences: WorkExperience[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  experiences.forEach((exp, index) => {
    if (!exp.company) {
      errors.push({
        field: `experience.${index}.company`,
        message: "Company name is required",
      });
    }
    if (!exp.position) {
      errors.push({
        field: `experience.${index}.position`,
        message: "Position is required",
      });
    }
    if (!exp.location) {
      errors.push({
        field: `experience.${index}.location`,
        message: "Location is required",
      });
    }

    const dateError = validators.dateRange(
      exp.startDate,
      exp.endDate,
      exp.current
    );
    if (dateError) {
      errors.push({
        field: `experience.${index}.dates`,
        message: dateError,
      });
    }

    if (
      exp.description.length === 0 ||
      exp.description.every((d) => !d.trim())
    ) {
      errors.push({
        field: `experience.${index}.description`,
        message: "At least one responsibility is required",
      });
    } else if (exp.description.some((d) => d.trim().length < 20)) {
      errors.push({
        field: `experience.${index}.description`,
        message: "Add more detail to your bullet (quantify impact)",
      });
    }
  });

  return errors;
}

export function validateEducation(education: Education[]): ValidationError[] {
  const errors: ValidationError[] = [];

  education.forEach((edu, index) => {
    if (!edu.institution) {
      errors.push({
        field: `education.${index}.institution`,
        message: "Institution name is required",
      });
    }
    if (!edu.degree) {
      errors.push({
        field: `education.${index}.degree`,
        message: "Degree is required",
      });
    }
    if (!edu.field) {
      errors.push({
        field: `education.${index}.field`,
        message: "Field of study is required",
      });
    }
    if (!edu.location) {
      errors.push({
        field: `education.${index}.location`,
        message: "Location is required",
      });
    }

    const dateError = validators.dateRange(
      edu.startDate,
      edu.endDate,
      edu.current
    );
    if (dateError) {
      errors.push({
        field: `education.${index}.dates`,
        message: dateError,
      });
    }
  });

  return errors;
}

function validateSkills(skills: ResumeData["skills"]): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!skills || skills.length === 0) {
    return errors;
  }

  skills.forEach((skill, index) => {
    if (!skill.name?.trim()) {
      errors.push({
        field: `skills.${index}.name`,
        message: "Skill name is required",
      });
    }
    if (!skill.category?.trim()) {
      errors.push({
        field: `skills.${index}.category`,
        message: "Pick a category",
      });
    }
  });

  return errors;
}

function validateLanguages(
  languages: ResumeData["languages"]
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!languages) return errors;

  languages.forEach((lang, index) => {
    if (!lang.name?.trim()) {
      errors.push({
        field: `languages.${index}.name`,
        message: "Language name is required",
      });
    }
    if (!lang.level) {
      errors.push({
        field: `languages.${index}.level`,
        message: "Select proficiency level",
      });
    }
  });

  return errors;
}

function validateProjects(projects: ResumeData["projects"]): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!projects) return errors;

  projects.forEach((project, index) => {
    if (!project.name?.trim()) {
      errors.push({
        field: `projects.${index}.name`,
        message: "Project name is required",
      });
    }
    if (project.startDate && project.endDate) {
      const start = new Date(project.startDate);
      const end = new Date(project.endDate);
      if (start > end) {
        errors.push({
          field: `projects.${index}.dates`,
          message: "Start date must be before end date",
        });
      }
    }
  });

  return errors;
}

function validateCertifications(
  certifications: ResumeData["certifications"]
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!certifications) return errors;

  certifications.forEach((cert, index) => {
    if (!cert.name?.trim()) {
      errors.push({
        field: `certifications.${index}.name`,
        message: "Certification name is required",
      });
    }
    if (cert.expiryDate && cert.date) {
      const start = new Date(cert.date);
      const end = new Date(cert.expiryDate);
      if (start > end) {
        errors.push({
          field: `certifications.${index}.dates`,
          message: "Expiry date must be after issue date",
        });
      }
    }
  });

  return errors;
}

function validateCustomSections(
  customSections: ResumeData["customSections"]
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!customSections) return errors;

  customSections.forEach((section, sectionIndex) => {
    if (!section.title?.trim()) {
      errors.push({
        field: `customSections.${sectionIndex}.title`,
        message: "Section title is required",
      });
    }

    (section.items || []).forEach((item, itemIndex) => {
      if (!item.title?.trim()) {
        errors.push({
          field: `customSections.${sectionIndex}.items.${itemIndex}.title`,
          message: "Item title is required",
        });
      }
    });
  });

  return errors;
}

// Main resume validator
export function validateResume(data: ResumeData): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate each section
  errors.push(...validatePersonalInfo(data.personalInfo));
  errors.push(...validateWorkExperience(data.workExperience));
  errors.push(...validateEducation(data.education));
  errors.push(...validateSkills(data.skills));
  errors.push(...validateLanguages(data.languages));
  errors.push(...validateProjects(data.projects));
  errors.push(...validateCertifications(data.certifications));
  errors.push(...validateCustomSections(data.customSections));

  // Warnings (not blocking, but helpful)
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
