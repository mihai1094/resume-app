import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  JobApplication,
  JobApplicationFirestore,
  ApplicationStatus,
  ApplicationStats,
  CreateApplicationInput,
  UpdateApplicationInput,
  hasResponded,
  isActiveApplication,
} from "@/lib/types/application";
import { FREE_TIER_LIMITS, PREMIUM_TIER_LIMITS } from "@/lib/config/credits";

export type PlanId = "free" | "premium";

const PLAN_LIMITS: Record<PlanId, { applications: number }> = {
  free: { applications: FREE_TIER_LIMITS.jobApplications },
  premium: { applications: PREMIUM_TIER_LIMITS.jobApplications },
};

export interface PlanLimitError {
  code: "PLAN_LIMIT";
  limit: number;
  current: number;
}

/**
 * Recursively removes undefined values from an object.
 * Firestore doesn't accept undefined - only null or actual values.
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
 * Safely converts a Firestore timestamp to ISO string.
 */
function timestampToISO(ts: unknown): string {
  if (!ts) return new Date().toISOString();

  if (
    typeof ts === "object" &&
    ts !== null &&
    "toDate" in ts &&
    typeof (ts as { toDate: unknown }).toDate === "function"
  ) {
    return (ts as { toDate: () => Date }).toDate().toISOString();
  }

  if (typeof ts === "object" && ts !== null && "seconds" in ts) {
    const { seconds, nanoseconds = 0 } = ts as {
      seconds: number;
      nanoseconds?: number;
    };
    return new Date(seconds * 1000 + nanoseconds / 1000000).toISOString();
  }

  if (ts instanceof Date) {
    return ts.toISOString();
  }

  if (typeof ts === "string") {
    return ts;
  }

  return new Date().toISOString();
}

/**
 * Convert Firestore document to client-side JobApplication
 */
function firestoreToApplication(
  doc: JobApplicationFirestore
): JobApplication {
  return {
    ...doc,
    appliedAt: doc.appliedAt ? timestampToISO(doc.appliedAt) : undefined,
    createdAt: timestampToISO(doc.createdAt),
    updatedAt: timestampToISO(doc.updatedAt),
  };
}

class ApplicationServiceError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "ApplicationServiceError";
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}

/**
 * Application Service
 * Handles all Firestore operations for job applications
 */
class ApplicationService {
  private readonly USERS_COLLECTION = "users";
  private readonly APPLICATIONS_COLLECTION = "applications";

  private handleError(action: string, error: unknown): never {
    throw new ApplicationServiceError(action, { cause: error });
  }

  /**
   * Get collection reference for user's applications
   */
  private getApplicationsRef(userId: string) {
    return collection(
      db,
      this.USERS_COLLECTION,
      userId,
      this.APPLICATIONS_COLLECTION
    );
  }

  /**
   * Get document reference for a specific application
   */
  private getApplicationDocRef(userId: string, applicationId: string) {
    return doc(
      db,
      this.USERS_COLLECTION,
      userId,
      this.APPLICATIONS_COLLECTION,
      applicationId
    );
  }

  /**
   * Create a new job application
   */
  async createApplication(
    userId: string,
    data: CreateApplicationInput,
    plan: PlanId = "free"
  ): Promise<JobApplication | PlanLimitError> {
    try {
      // Check plan limit
      const limit = PLAN_LIMITS[plan]?.applications ?? PLAN_LIMITS.free.applications;
      const currentApplications = await this.getApplications(userId);
      
      if (currentApplications.length >= limit) {
        return {
          code: "PLAN_LIMIT",
          limit,
          current: currentApplications.length,
        };
      }

      const applicationId = `app-${Date.now()}`;
      const docRef = this.getApplicationDocRef(userId, applicationId);
      const now = Timestamp.now();

      const applicationDoc: Omit<JobApplicationFirestore, "id"> = {
        userId,
        company: data.company,
        position: data.position,
        status: data.status,
        resumeId: data.resumeId,
        appliedAt: data.appliedAt ? Timestamp.fromDate(new Date(data.appliedAt)) : undefined,
        salary: data.salary,
        location: data.location,
        jobUrl: data.jobUrl,
        notes: data.notes,
        contacts: data.contacts,
        interviews: data.interviews,
        priority: data.priority,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(docRef, sanitizeForFirestore(applicationDoc));

      return {
        id: applicationId,
        userId,
        ...data,
        createdAt: now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString(),
      };
    } catch (error) {
      this.handleError("Failed to create application", error);
    }
  }

  /**
   * Update an existing application
   */
  async updateApplication(
    userId: string,
    applicationId: string,
    updates: UpdateApplicationInput
  ): Promise<boolean> {
    try {
      const docRef = this.getApplicationDocRef(userId, applicationId);

      const firestoreUpdates: Record<string, unknown> = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Convert appliedAt string to Timestamp if provided
      if (updates.appliedAt) {
        firestoreUpdates.appliedAt = Timestamp.fromDate(
          new Date(updates.appliedAt)
        );
      }

      await updateDoc(docRef, sanitizeForFirestore(firestoreUpdates));
      return true;
    } catch (error) {
      this.handleError("Failed to update application", error);
    }
  }

  /**
   * Delete an application
   */
  async deleteApplication(
    userId: string,
    applicationId: string
  ): Promise<boolean> {
    try {
      const docRef = this.getApplicationDocRef(userId, applicationId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      this.handleError("Failed to delete application", error);
    }
  }

  /**
   * Get all applications for a user
   */
  async getApplications(userId: string): Promise<JobApplication[]> {
    try {
      const applicationsRef = this.getApplicationsRef(userId);
      const q = query(applicationsRef, orderBy("updatedAt", "desc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) =>
        firestoreToApplication({
          id: doc.id,
          ...doc.data(),
        } as JobApplicationFirestore)
      );
    } catch (error) {
      this.handleError("Failed to get applications", error);
    }
  }

  /**
   * Get a single application by ID
   */
  async getApplicationById(
    userId: string,
    applicationId: string
  ): Promise<JobApplication | null> {
    try {
      const docRef = this.getApplicationDocRef(userId, applicationId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return firestoreToApplication({
        id: docSnap.id,
        ...docSnap.data(),
      } as JobApplicationFirestore);
    } catch (error) {
      this.handleError("Failed to get application", error);
    }
  }

  /**
   * Move application to a new status (for drag-and-drop)
   */
  async moveApplication(
    userId: string,
    applicationId: string,
    newStatus: ApplicationStatus
  ): Promise<boolean> {
    try {
      const updates: UpdateApplicationInput = { status: newStatus };

      // If moving to "applied" status, set appliedAt if not already set
      if (newStatus === "applied") {
        const app = await this.getApplicationById(userId, applicationId);
        if (app && !app.appliedAt) {
          updates.appliedAt = new Date().toISOString();
        }
      }

      return this.updateApplication(userId, applicationId, updates);
    } catch (error) {
      this.handleError("Failed to move application", error);
    }
  }

  /**
   * Subscribe to real-time updates for applications
   */
  subscribeToApplications(
    userId: string,
    onChange: (applications: JobApplication[]) => void
  ): () => void {
    try {
      const applicationsRef = this.getApplicationsRef(userId);
      const q = query(applicationsRef, orderBy("updatedAt", "desc"));

      return onSnapshot(q, (snapshot) => {
        const applications = snapshot.docs.map((doc) =>
          firestoreToApplication({
            id: doc.id,
            ...doc.data(),
          } as JobApplicationFirestore)
        );
        onChange(applications);
      });
    } catch (error) {
      this.handleError("Failed to subscribe to applications", error);
    }
  }

  /**
   * Calculate application statistics
   */
  getApplicationStats(applications: JobApplication[]): ApplicationStats {
    const total = applications.length;
    
    // Count by status
    const byStatus: Record<ApplicationStatus, number> = {
      wishlist: 0,
      applied: 0,
      screening: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0,
    };

    applications.forEach((app) => {
      byStatus[app.status]++;
    });

    // Calculate rates (excluding wishlist from calculations)
    const submitted = total - byStatus.wishlist;
    const responded = applications.filter((app) => hasResponded(app.status)).length;
    const interviewed = byStatus.interviewing + byStatus.offer;
    const offers = byStatus.offer;

    const responseRate = submitted > 0 ? (responded / submitted) * 100 : 0;
    const interviewRate = submitted > 0 ? (interviewed / submitted) * 100 : 0;
    const offerRate = submitted > 0 ? (offers / submitted) * 100 : 0;

    const activeApplications = applications.filter((app) =>
      isActiveApplication(app.status)
    ).length;

    return {
      total,
      byStatus,
      responseRate: Math.round(responseRate),
      interviewRate: Math.round(interviewRate),
      offerRate: Math.round(offerRate),
      activeApplications,
    };
  }
}

// Export singleton instance
export const applicationService = new ApplicationService();
