import { ResumeData, WorkExperience, Education, Skill } from "@/lib/types/resume";

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

/**
 * Returns true when the resume has at least one populated core section.
 * Personal info alone should not qualify as export-ready content.
 */
export function hasPopulatedCoreResumeSection(resume: ResumeData): boolean {
  return (
    (resume.workExperience?.length ?? 0) > 0 ||
    (resume.education?.length ?? 0) > 0 ||
    (resume.skills?.length ?? 0) > 0
  );
}

/**
 * Normalized course shape used by template utilities.
 * Merges legacy `data.courses` with `data.certifications` entries typed as "course".
 */
export interface NormalizedCourse {
  id: string;
  name: string;
  institution?: string;
  date?: string;
  credentialId?: string;
  url?: string;
}

/**
 * Returns certifications only (excludes entries tagged as type="course").
 */
export function getCertifications(data: ResumeData) {
  return data.certifications?.filter((c) => c.type !== "course") ?? [];
}

/**
 * Returns all courses: certifications tagged as type="course" (mapped to NormalizedCourse)
 * plus legacy data.courses entries.
 */
export function getAllCourses(data: ResumeData): NormalizedCourse[] {
  const fromCerts = (data.certifications?.filter((c) => c.type === "course") ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    institution: c.issuer,
    date: c.date,
    credentialId: c.credentialId,
    url: c.url,
  }));
  return [...fromCerts, ...(data.courses ?? [])];
}

/**
 * Groups skills by their category. Consistent with the reduce pattern used in templates.
 */
export function groupSkillsByCategory(skills: Skill[]): Record<string, Skill[]> {
  return skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});
}

/**
 * Returns the unique skill categories in the order they first appear in `skills`.
 * This matches the iteration order templates use (via `Object.keys/entries` on the
 * grouped map), so it's the source of truth for "how categories are currently shown".
 */
export function getSkillCategoryOrder(skills: Skill[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const skill of skills) {
    const category = skill.category || "Other";
    if (seen.has(category)) continue;
    seen.add(category);
    order.push(category);
  }
  return order;
}

/**
 * Reorders a flat skills array so that when grouped by category, the categories
 * appear in `newCategoryOrder`. Skills within each category keep their relative
 * order. Any categories present in `skills` but missing from `newCategoryOrder`
 * are appended at the end in their original relative order (defensive fallback).
 */
export function reorderSkillCategories(
  skills: Skill[],
  newCategoryOrder: string[]
): Skill[] {
  const grouped = groupSkillsByCategory(skills);
  const seen = new Set<string>();
  const result: Skill[] = [];

  for (const category of newCategoryOrder) {
    if (seen.has(category)) continue;
    seen.add(category);
    const bucket = grouped[category];
    if (bucket) result.push(...bucket);
  }

  // Append any untouched categories in their original first-seen order so the
  // operation never silently drops skills if the caller passes a partial list.
  for (const category of getSkillCategoryOrder(skills)) {
    if (seen.has(category)) continue;
    seen.add(category);
    const bucket = grouped[category];
    if (bucket) result.push(...bucket);
  }

  return result;
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
