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
 * Export resume data to JSON
 */
export function exportResumeToJSON(resume: ResumeData): string {
  return JSON.stringify(resume, null, 2);
}

/**
 * Import resume data from JSON
 */
export function importResumeFromJSON(json: string): ResumeData {
  return JSON.parse(json) as ResumeData;
}

/**
 * Validate resume data
 */
export function validateResumeData(resume: ResumeData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!resume.personalInfo.firstName) {
    errors.push("First name is required");
  }

  if (!resume.personalInfo.lastName) {
    errors.push("Last name is required");
  }

  if (!resume.personalInfo.email) {
    errors.push("Email is required");
  }

  if (resume.workExperience.length === 0) {
    errors.push("At least one work experience is required");
  }

  if (resume.education.length === 0) {
    errors.push("At least one education entry is required");
  }

  if (resume.skills.length === 0) {
    errors.push("At least one skill is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  // Basic phone validation - at least 10 digits
  const phoneRegex = /\d{10,}/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

