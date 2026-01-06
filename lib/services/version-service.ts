import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ResumeData } from "@/lib/types/resume";
import {
  ResumeVersion,
  ResumeVersionMeta,
  VersionChangeType,
  TRACKED_SECTIONS,
  TrackedSection,
} from "@/lib/types/version";
import { generateId } from "@/lib/utils";

/**
 * Recursively removes undefined values from an object for Firestore compatibility
 */
function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore) as T;
  }

  if (typeof obj === "object" && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = sanitizeForFirestore(value);
      }
    }
    return result as T;
  }

  return obj;
}

/**
 * Detect which sections changed between two resume versions
 */
export function detectChangedSections(
  oldData: ResumeData | null,
  newData: ResumeData
): TrackedSection[] {
  if (!oldData) {
    // First version - all non-empty sections are "changed"
    return TRACKED_SECTIONS.filter((section) => {
      const value = newData[section as keyof ResumeData];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object" && value !== null) {
        return Object.values(value).some((v) => v !== "" && v !== undefined);
      }
      return false;
    });
  }

  const changed: TrackedSection[] = [];

  for (const section of TRACKED_SECTIONS) {
    const oldValue = oldData[section as keyof ResumeData];
    const newValue = newData[section as keyof ResumeData];

    // Simple JSON comparison for deep equality
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changed.push(section);
    }
  }

  return changed;
}

/**
 * Version Service for managing resume version history
 *
 * Versions are stored in: users/{userId}/resumes/{resumeId}/versions/{versionId}
 */
class VersionService {
  private getVersionsCollection(userId: string, resumeId: string) {
    return collection(db, "users", userId, "savedResumes", resumeId, "versions");
  }

  private getVersionDoc(userId: string, resumeId: string, versionId: string) {
    return doc(db, "users", userId, "savedResumes", resumeId, "versions", versionId);
  }

  /**
   * Save a new version of a resume
   */
  async saveVersion(
    userId: string,
    resumeId: string,
    data: ResumeData,
    changeType: VersionChangeType,
    label?: string,
    previousData?: ResumeData | null
  ): Promise<ResumeVersion> {
    const versionId = generateId();
    const changedSections = detectChangedSections(previousData || null, data);

    const version: ResumeVersion = {
      id: versionId,
      resumeId,
      createdAt: Timestamp.now(),
      data,
      changeType,
      label,
      changedSections,
    };

    const docRef = this.getVersionDoc(userId, resumeId, versionId);
    await setDoc(docRef, sanitizeForFirestore(version));

    return version;
  }

  /**
   * Get all versions for a resume (most recent first)
   */
  async getVersions(
    userId: string,
    resumeId: string,
    limitCount?: number
  ): Promise<ResumeVersionMeta[]> {
    const versionsRef = this.getVersionsCollection(userId, resumeId);
    let q = query(versionsRef, orderBy("createdAt", "desc"));

    if (limitCount) {
      q = query(q, firestoreLimit(limitCount));
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        resumeId: data.resumeId,
        createdAt: data.createdAt,
        changeType: data.changeType,
        label: data.label,
        changedSections: data.changedSections,
      } as ResumeVersionMeta;
    });
  }

  /**
   * Get a specific version with full data
   */
  async getVersion(
    userId: string,
    resumeId: string,
    versionId: string
  ): Promise<ResumeVersion | null> {
    const docRef = this.getVersionDoc(userId, resumeId, versionId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as ResumeVersion;
  }

  /**
   * Restore a resume to a specific version
   * This creates a new version with changeType='restore' and returns the data
   */
  async restoreVersion(
    userId: string,
    resumeId: string,
    versionId: string
  ): Promise<ResumeData | null> {
    const version = await this.getVersion(userId, resumeId, versionId);

    if (!version) {
      return null;
    }

    // Get the current version to detect changes
    const currentVersions = await this.getVersions(userId, resumeId, 1);
    const currentData = currentVersions.length > 0
      ? (await this.getVersion(userId, resumeId, currentVersions[0].id))?.data
      : null;

    // Create a new "restore" version
    await this.saveVersion(
      userId,
      resumeId,
      version.data,
      "restore",
      `Restored from ${version.label || new Date(version.createdAt.toMillis()).toLocaleString()}`,
      currentData || null
    );

    return version.data;
  }

  /**
   * Delete old auto-save versions, keeping the most recent ones
   */
  async deleteOldVersions(
    userId: string,
    resumeId: string,
    keepCount: number
  ): Promise<number> {
    const versionsRef = this.getVersionsCollection(userId, resumeId);
    const q = query(versionsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const autoVersions = snapshot.docs.filter(
      (doc) => doc.data().changeType === "auto"
    );

    if (autoVersions.length <= keepCount) {
      return 0;
    }

    const versionsToDelete = autoVersions.slice(keepCount);
    const batch = writeBatch(db);

    for (const doc of versionsToDelete) {
      batch.delete(doc.ref);
    }

    await batch.commit();
    return versionsToDelete.length;
  }

  /**
   * Delete a specific version (only manual versions can be deleted by user)
   */
  async deleteVersion(
    userId: string,
    resumeId: string,
    versionId: string
  ): Promise<boolean> {
    const version = await this.getVersion(userId, resumeId, versionId);

    if (!version || version.changeType !== "manual") {
      return false;
    }

    const docRef = this.getVersionDoc(userId, resumeId, versionId);
    await deleteDoc(docRef);
    return true;
  }

  /**
   * Update version label
   */
  async updateVersionLabel(
    userId: string,
    resumeId: string,
    versionId: string,
    label: string
  ): Promise<boolean> {
    const docRef = this.getVersionDoc(userId, resumeId, versionId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return false;
    }

    await setDoc(docRef, { label }, { merge: true });
    return true;
  }

  /**
   * Count total versions for a resume
   */
  async countVersions(userId: string, resumeId: string): Promise<number> {
    const versionsRef = this.getVersionsCollection(userId, resumeId);
    const snapshot = await getDocs(versionsRef);
    return snapshot.size;
  }
}

export const versionService = new VersionService();
