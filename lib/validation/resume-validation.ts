import { ResumeData, PersonalInfo, WorkExperience, Education } from "@/lib/types/resume";

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
    // Basic phone validation - at least 10 digits
    const phoneRegex = /\d{10,}/;
    if (!phoneRegex.test(value.replace(/\D/g, ""))) {
      return "Invalid phone format";
    }
    return null;
  },

  required: (value: any): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return "This field is required";
    }
    return null;
  },

  url: (value?: string): string | null => {
    if (!value) return null; // Optional field
    try {
      new URL(value);
      return null;
    } catch {
      return "Invalid URL format";
    }
  },

  dateRange: (startDate: string, endDate?: string, current?: boolean): string | null => {
    if (!startDate) return "Start date is required";
    if (!current && !endDate) return "End date is required (or check 'Current')";
    if (endDate && new Date(startDate) > new Date(endDate)) {
      return "Start date must be before end date";
    }
    return null;
  },
};

// Section validators
export function validatePersonalInfo(info: PersonalInfo): ValidationError[] {
  const errors: ValidationError[] = [];

  const emailError = validators.email(info.email);
  if (emailError) errors.push({ field: 'email', message: emailError });

  const phoneError = validators.phone(info.phone);
  if (phoneError) errors.push({ field: 'phone', message: phoneError });

  const requiredFields = ['firstName', 'lastName', 'location'] as const;
  requiredFields.forEach(field => {
    const error = validators.required(info[field]);
    if (error) errors.push({ field, message: error });
  });

  if (info.website) {
    const urlError = validators.url(info.website);
    if (urlError) errors.push({ field: 'website', message: urlError });
  }

  if (info.linkedin && info.linkedin.startsWith("http")) {
    const urlError = validators.url(info.linkedin);
    if (urlError) errors.push({ field: 'linkedin', message: urlError });
  }

  if (info.github && info.github.startsWith("http")) {
    const urlError = validators.url(info.github);
    if (urlError) errors.push({ field: 'github', message: urlError });
  }

  return errors;
}

export function validateWorkExperience(experiences: WorkExperience[]): ValidationError[] {
  const errors: ValidationError[] = [];

  experiences.forEach((exp, index) => {
    if (!exp.company) {
      errors.push({
        field: `experience.${index}.company`,
        message: 'Company name is required'
      });
    }
    if (!exp.position) {
      errors.push({
        field: `experience.${index}.position`,
        message: 'Position is required'
      });
    }

    const dateError = validators.dateRange(exp.startDate, exp.endDate, exp.current);
    if (dateError) {
      errors.push({
        field: `experience.${index}.dates`,
        message: dateError
      });
    }

    if (exp.description.length === 0 || exp.description.every(d => !d.trim())) {
      errors.push({
        field: `experience.${index}.description`,
        message: 'At least one responsibility is required'
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
        message: 'Institution name is required'
      });
    }
    if (!edu.degree) {
      errors.push({
        field: `education.${index}.degree`,
        message: 'Degree is required'
      });
    }

    const dateError = validators.dateRange(edu.startDate, edu.endDate, edu.current);
    if (dateError) {
      errors.push({
        field: `education.${index}.dates`,
        message: dateError
      });
    }
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

  // Warnings (not blocking, but helpful)
  if (data.workExperience.length === 0) {
    warnings.push({
      field: 'workExperience',
      message: 'Consider adding work experience'
    });
  }

  if (data.skills.length < 5) {
    warnings.push({
      field: 'skills',
      message: 'Adding more skills will strengthen your resume'
    });
  }

  if (data.education.length === 0) {
    warnings.push({
      field: 'education',
      message: 'Consider adding education information'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

