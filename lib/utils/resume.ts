import { ResumeData, WorkExperience, Education } from "@/lib/types/resume";

/**
 * Generate a unique ID for resume items
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format date for display
 */
export function formatDate(date: string): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * Calculate duration between two dates
 */
export function calculateDuration(
  startDate: string,
  endDate?: string
): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();

  const totalMonths = years * 12 + months;

  if (totalMonths < 12) {
    return `${totalMonths} ${totalMonths === 1 ? "month" : "months"}`;
  }

  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;

  if (m === 0) {
    return `${y} ${y === 1 ? "year" : "years"}`;
  }

  return `${y} ${y === 1 ? "year" : "years"} ${m} ${m === 1 ? "month" : "months"}`;
}

/**
 * Sort work experience by date (most recent first)
 */
export function sortWorkExperienceByDate(
  experiences: WorkExperience[]
): WorkExperience[] {
  return [...experiences].sort((a, b) => {
    const dateA = a.current ? new Date() : new Date(a.endDate || a.startDate);
    const dateB = b.current ? new Date() : new Date(b.endDate || b.startDate);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Sort education by date (most recent first)
 */
export function sortEducationByDate(education: Education[]): Education[] {
  return [...education].sort((a, b) => {
    const dateA = a.current ? new Date() : new Date(a.endDate || a.startDate);
    const dateB = b.current ? new Date() : new Date(b.endDate || b.startDate);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Validate resume data
 */
export function validateResumeData(resume: ResumeData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!resume.personalInfo.firstName?.trim()) {
    errors.push("First name is required");
  }

  if (!resume.personalInfo.lastName?.trim()) {
    errors.push("Last name is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get warnings for resume completeness (best practices)
 */
export function getResumeWarnings(resume: ResumeData): string[] {
  const warnings: string[] = [];

  if (!resume.personalInfo.email?.trim()) {
    warnings.push("Missing email address");
  }

  if (!resume.personalInfo.phone?.trim()) {
    warnings.push("Missing phone number");
  }

  if (resume.workExperience.length === 0) {
    warnings.push("No work experience listed");
  }

  if (resume.education.length === 0) {
    warnings.push("No education listed");
  }

  if (resume.skills.length === 0) {
    warnings.push("No skills listed");
  }

  return warnings;
}

// Re-export validators from resume-validation for backwards compatibility
// These are simple wrappers that convert the validator return type
import { validators } from "@/lib/validation/resume-validation";

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return validators.email(email) === null;
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  return validators.phone(phone) === null;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  return validators.url(url) === null;
}

