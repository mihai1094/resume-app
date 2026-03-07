import {
  ResumeData,
  Certification,
  Course,
  CURRENT_RESUME_SCHEMA_VERSION,
} from "@/lib/types/resume";

export interface ResumeMigrationResult {
  data: ResumeData;
  migrated: boolean;
  fromVersion: number;
  toVersion: number;
}

function getResumeSchemaVersion(data: ResumeData): number {
  return typeof data.schemaVersion === "number" ? data.schemaVersion : 0;
}

export function withCurrentResumeSchemaVersion(data: ResumeData): ResumeData {
  if (data.schemaVersion === CURRENT_RESUME_SCHEMA_VERSION) {
    return data;
  }

  return {
    ...data,
    schemaVersion: CURRENT_RESUME_SCHEMA_VERSION,
  };
}

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
  const withVersion = withCurrentResumeSchemaVersion(data);

  if (!needsCourseMigration(withVersion)) {
    return withVersion;
  }

  const migratedCerts: Certification[] = (withVersion.courses || []).map(
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
    ...withVersion,
    certifications: [...(withVersion.certifications || []), ...migratedCerts],
    courses: [], // Clear courses after migration
  };
}

function migrateV0ToV1(data: ResumeData): ResumeData {
  const withVersion = withCurrentResumeSchemaVersion(data);
  return needsCourseMigration(withVersion)
    ? migrateCoursesToCertifications(withVersion)
    : withVersion;
}

/**
 * Full migration function that applies all necessary data migrations
 * Call this when loading resume data from storage
 */
export function migrateResumeData(data: ResumeData): ResumeMigrationResult {
  const fromVersion = getResumeSchemaVersion(data);
  let migratedData = data;
  let currentVersion = fromVersion;

  while (currentVersion < CURRENT_RESUME_SCHEMA_VERSION) {
    switch (currentVersion) {
      case 0:
        migratedData = migrateV0ToV1(migratedData);
        break;
      default:
        migratedData = withCurrentResumeSchemaVersion(migratedData);
        break;
    }

    currentVersion = getResumeSchemaVersion(migratedData);
  }

  if (currentVersion === 0) {
    migratedData = withCurrentResumeSchemaVersion(migratedData);
    currentVersion = CURRENT_RESUME_SCHEMA_VERSION;
  }

  const migrated =
    migratedData !== data || fromVersion !== CURRENT_RESUME_SCHEMA_VERSION;

  return {
    data: migratedData,
    migrated,
    fromVersion,
    toVersion: currentVersion,
  };
}

/**
 * Check if any migration was applied
 */
export function wasMigrationApplied(
  originalData: ResumeData,
  migratedData: ResumeData
): boolean {
  return (
    originalData !== migratedData ||
    getResumeSchemaVersion(originalData) !== getResumeSchemaVersion(migratedData)
  );
}
