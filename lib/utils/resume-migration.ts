import { ResumeData, Certification, Course } from "@/lib/types/resume";

/**
 * Check if resume data needs migration (has courses to migrate)
 */
export function needsCourseMigration(data: ResumeData): boolean {
  return (data.courses?.length || 0) > 0;
}

/**
 * Migrate courses to certifications with type='course' discriminator
 * This preserves backward compatibility while consolidating sections
 */
export function migrateCoursesToCertifications(data: ResumeData): ResumeData {
  if (!needsCourseMigration(data)) {
    return data;
  }

  const migratedCerts: Certification[] = (data.courses || []).map(
    (course: Course) => ({
      id: course.id,
      name: course.name,
      issuer: course.institution || "",
      date: course.date || "",
      credentialId: course.credentialId,
      url: course.url,
      type: "course" as const,
    })
  );

  return {
    ...data,
    certifications: [...(data.certifications || []), ...migratedCerts],
    courses: [], // Clear courses after migration
  };
}

/**
 * Full migration function that applies all necessary data migrations
 * Call this when loading resume data from storage
 */
export function migrateResumeData(data: ResumeData): ResumeData {
  let migratedData = data;

  // Apply courses migration
  if (needsCourseMigration(migratedData)) {
    migratedData = migrateCoursesToCertifications(migratedData);
  }

  // Future migrations can be added here

  return migratedData;
}

/**
 * Check if any migration was applied
 */
export function wasMigrationApplied(
  originalData: ResumeData,
  migratedData: ResumeData
): boolean {
  return originalData !== migratedData;
}
