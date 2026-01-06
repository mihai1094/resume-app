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
import { ResumeData } from "@/lib/types/resume";
import { CoverLetterData } from "@/lib/types/cover-letter";
import { FREE_TIER_LIMITS, PREMIUM_TIER_LIMITS } from "@/lib/config/credits";

// ========= USAGE TRACKING TYPES =========

/**
 * Tracks AI credit usage for a user
 */
export interface UserUsage {
  aiCreditsUsed: number;
  aiCreditsResetDate: string; // ISO date of next reset (1st of next month)
  lastCreditReset: string; // ISO date of last reset
}

/**
 * Subscription status for premium users
 */
export interface UserSubscription {
  plan: "free" | "premium";
  status: "active" | "canceled" | "past_due";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

/**
 * Full user metadata stored in Firestore
 */
export interface UserMetadata {
  email?: string;
  displayName?: string;
  photoURL?: string;
  plan: "free" | "premium";
  subscription?: UserSubscription;
  usage?: UserUsage;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  lastLoginAt?: Timestamp;
  // Public sharing
  username?: string; // Unique URL-safe username for public profiles
}

export interface SavedResumeFirestore {
  id: string;
  userId: string;
  name: string;
  templateId: string;
  data: ResumeData;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Tailored resume fields
  sourceResumeId?: string;  // ID of the master resume this was tailored from
  targetJobTitle?: string;  // Job title this was tailored for
  targetCompany?: string;   // Company this was tailored for
}

export type PlanId = "free" | "premium";

const PLAN_LIMITS: Record<PlanId, { resumes: number; coverLetters: number }> = {
  free: { resumes: FREE_TIER_LIMITS.maxResumes, coverLetters: FREE_TIER_LIMITS.maxCoverLetters },
  premium: { resumes: PREMIUM_TIER_LIMITS.maxResumes, coverLetters: PREMIUM_TIER_LIMITS.maxCoverLetters },
};

export interface PlanLimitError {
  code: "PLAN_LIMIT";
  limit: number;
  current: number;
}

export interface CurrentResumeFirestore {
  userId: string;
  data: ResumeData;
  updatedAt: Timestamp;
}

export interface SavedCoverLetterFirestore {
  id: string;
  userId: string;
  name: string;
  jobTitle?: string;
  companyName?: string;
  data: CoverLetterData;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class FirestoreServiceError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "FirestoreServiceError";
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
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
 * Firestore Service
 * Handles all Firestore database operations
 */
class FirestoreService {
  // Collection references
  private readonly USERS_COLLECTION = "users";
  private readonly RESUMES_COLLECTION = "resumes";
  private readonly CURRENT_RESUME_DOC = "current";

  private handleError(action: string, error: unknown): never {
    throw new FirestoreServiceError(action, { cause: error });
  }

  // ========= USER METADATA =========
  /**
   * User metadata stored alongside auth user
   */
  async getUserMetadata(userId: string): Promise<UserMetadata | null> {
    try {
      const docRef = doc(db, this.USERS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return docSnap.data() as UserMetadata;
    } catch (error) {
      this.handleError("Failed to get user metadata", error);
    }
  }

  // ========= AI CREDITS & USAGE =========

  /**
   * Get next month's first day as ISO string
   */
  private getNextResetDate(): string {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toISOString();
  }

  /**
   * Get user usage, checking for monthly reset
   */
  async getUserUsage(userId: string): Promise<UserUsage> {
    try {
      const metadata = await this.getUserMetadata(userId);
      const usage = metadata?.usage;

      // Default usage for new users
      const defaultUsage: UserUsage = {
        aiCreditsUsed: 0,
        aiCreditsResetDate: this.getNextResetDate(),
        lastCreditReset: new Date().toISOString(),
      };

      if (!usage) {
        // Initialize usage for user
        await this.updateUserUsage(userId, defaultUsage);
        return defaultUsage;
      }

      // Check if reset is due
      if (new Date() >= new Date(usage.aiCreditsResetDate)) {
        const newUsage: UserUsage = {
          aiCreditsUsed: 0,
          aiCreditsResetDate: this.getNextResetDate(),
          lastCreditReset: new Date().toISOString(),
        };
        await this.updateUserUsage(userId, newUsage);
        return newUsage;
      }

      return usage;
    } catch (error) {
      this.handleError("Failed to get user usage", error);
    }
  }

  /**
   * Update user usage (credits used, reset date)
   */
  async updateUserUsage(userId: string, usage: UserUsage): Promise<boolean> {
    try {
      const docRef = doc(db, this.USERS_COLLECTION, userId);
      await setDoc(
        docRef,
        sanitizeForFirestore({ usage, updatedAt: Timestamp.now() }),
        { merge: true }
      );
      return true;
    } catch (error) {
      this.handleError("Failed to update user usage", error);
    }
  }

  /**
   * Add credits used for an operation
   */
  async addCreditsUsed(userId: string, credits: number): Promise<UserUsage> {
    try {
      const usage = await this.getUserUsage(userId);
      const newUsage: UserUsage = {
        ...usage,
        aiCreditsUsed: usage.aiCreditsUsed + credits,
      };
      await this.updateUserUsage(userId, newUsage);
      return newUsage;
    } catch (error) {
      this.handleError("Failed to add credits used", error);
    }
  }

  /**
   * Reset user credits (for dev/testing)
   */
  async resetUserCredits(userId: string): Promise<UserUsage> {
    try {
      const newUsage: UserUsage = {
        aiCreditsUsed: 0,
        aiCreditsResetDate: this.getNextResetDate(),
        lastCreditReset: new Date().toISOString(),
      };
      await this.updateUserUsage(userId, newUsage);
      return newUsage;
    } catch (error) {
      this.handleError("Failed to reset user credits", error);
    }
  }

  /**
   * Update user plan (for dev mode switching)
   */
  async updateUserPlan(userId: string, plan: "free" | "premium"): Promise<boolean> {
    try {
      const docRef = doc(db, this.USERS_COLLECTION, userId);
      await setDoc(
        docRef,
        sanitizeForFirestore({
          plan,
          subscription: {
            plan,
            status: "active" as const,
          },
          updatedAt: Timestamp.now(),
        }),
        { merge: true }
      );
      return true;
    } catch (error) {
      this.handleError("Failed to update user plan", error);
    }
  }

  /**
   * Get current resume for a user with metadata
   */
  async getCurrentResumeWithMeta(
    userId: string
  ): Promise<{ data: ResumeData; updatedAt?: number } | null> {
    try {
      const docRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        this.RESUMES_COLLECTION,
        this.CURRENT_RESUME_DOC
      );
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as CurrentResumeFirestore;
        return {
          data: data.data,
          updatedAt:
            typeof data.updatedAt?.toMillis === "function"
              ? data.updatedAt.toMillis()
              : undefined,
        };
      }
      return null;
    } catch (error) {
      this.handleError("Failed to get current resume", error);
    }
  }

  /**
   * Get current resume data only (legacy callers)
   */
  async getCurrentResume(userId: string): Promise<ResumeData | null> {
    const result = await this.getCurrentResumeWithMeta(userId);
    return result?.data ?? null;
  }

  /**
   * Save current resume for a user (auto-save target)
   */
  async saveCurrentResume(
    userId: string,
    resumeData: ResumeData
  ): Promise<boolean> {
    try {
      const docRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        this.RESUMES_COLLECTION,
        this.CURRENT_RESUME_DOC
      );

      await setDoc(
        docRef,
        sanitizeForFirestore({
          userId,
          data: resumeData,
          updatedAt: Timestamp.now(),
        } as CurrentResumeFirestore),
        { merge: true }
      );

      return true;
    } catch (error) {
      this.handleError("Failed to save current resume", error);
    }
  }

  /**
   * Get all saved resumes for a user
   */
  async getSavedResumes(userId: string): Promise<SavedResumeFirestore[]> {
    try {
      const resumesRef = collection(
        db,
        this.USERS_COLLECTION,
        userId,
        "savedResumes"
      );
      const q = query(resumesRef, orderBy("updatedAt", "desc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SavedResumeFirestore[];
    } catch (error) {
      this.handleError("Failed to get saved resumes", error);
    }
  }

  subscribeToSavedResumes(
    userId: string,
    onChange: (resumes: SavedResumeFirestore[]) => void
  ): () => void {
    try {
      const resumesRef = collection(
        db,
        this.USERS_COLLECTION,
        userId,
        "savedResumes"
      );
      const q = query(resumesRef, orderBy("updatedAt", "desc"));
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(
          (docSnapshot) =>
            ({
              id: docSnapshot.id,
              ...docSnapshot.data(),
            } as SavedResumeFirestore)
        );
        onChange(data);
      });
    } catch (error) {
      this.handleError("Failed to subscribe to saved resumes", error);
    }
  }

  /**
   * Get a single saved resume by id
   */
  async getResumeById(
    userId: string,
    resumeId: string
  ): Promise<SavedResumeFirestore | null> {
    try {
      const docRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        "savedResumes",
        resumeId
      );
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data() as Omit<SavedResumeFirestore, "id">;
      return {
        id: docSnap.id,
        ...data,
      };
    } catch (error) {
      this.handleError("Failed to load resume", error);
    }
  }

  /**
   * Save a named resume
   */
  async saveResume(
    userId: string,
    resumeId: string,
    name: string,
    templateId: string,
    data: ResumeData,
    plan: PlanId = "free",
    tailoringInfo?: {
      sourceResumeId: string;
      targetJobTitle?: string;
      targetCompany?: string;
    }
  ): Promise<boolean | PlanLimitError> {
    try {
      const limit = PLAN_LIMITS[plan]?.resumes ?? PLAN_LIMITS.free.resumes;
      const currentResumes = await this.getSavedResumes(userId);
      if (currentResumes.length >= limit) {
        return { code: "PLAN_LIMIT", limit, current: currentResumes.length };
      }

      const docRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        "savedResumes",
        resumeId
      );

      const resumeDoc: Omit<SavedResumeFirestore, "id"> = {
        userId,
        name,
        templateId,
        data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ...(tailoringInfo?.sourceResumeId && { sourceResumeId: tailoringInfo.sourceResumeId }),
        ...(tailoringInfo?.targetJobTitle && { targetJobTitle: tailoringInfo.targetJobTitle }),
        ...(tailoringInfo?.targetCompany && { targetCompany: tailoringInfo.targetCompany }),
      };

      await setDoc(docRef, sanitizeForFirestore(resumeDoc));
      return true;
    } catch (error) {
      this.handleError("Failed to save resume", error);
    }
  }

  /**
   * Update a saved resume
   */
  async updateResume(
    userId: string,
    resumeId: string,
    updates: Partial<Omit<SavedResumeFirestore, "id" | "userId" | "createdAt">>
  ): Promise<boolean> {
    try {
      const docRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        "savedResumes",
        resumeId
      );

      await updateDoc(docRef, sanitizeForFirestore({
        ...updates,
        updatedAt: Timestamp.now(),
      }));

      return true;
    } catch (error) {
      this.handleError("Failed to update resume", error);
    }
  }

  /**
   * Delete a saved resume
   */
  async deleteResume(userId: string, resumeId: string): Promise<boolean> {
    try {
      const docRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        "savedResumes",
        resumeId
      );

      await deleteDoc(docRef);
      return true;
    } catch (error) {
      this.handleError("Failed to delete resume", error);
    }
  }

  /**
   * Check if user document exists (for first-time setup)
   */
  async userExists(userId: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.USERS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      this.handleError("Failed to check user existence", error);
    }
  }

  /**
   * Create user metadata document
   */
  async createUserMetadata(
    userId: string,
    email: string,
    displayName: string,
    options?: { plan?: PlanId }
  ): Promise<boolean> {
    try {
      const plan = options?.plan ?? "free";
      const docRef = doc(db, this.USERS_COLLECTION, userId);
      await setDoc(docRef, sanitizeForFirestore({
        email,
        displayName,
        plan,
        subscription: {
          plan,
          status: "active" as const,
        },
        usage: {
          aiCreditsUsed: 0,
          aiCreditsResetDate: this.getNextResetDate(),
          lastCreditReset: new Date().toISOString(),
        },
        createdAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
      }));
      return true;
    } catch (error) {
      this.handleError("Failed to create user metadata", error);
    }
  }

  // ==================== COVER LETTER METHODS ====================

  /**
   * Get all saved cover letters for a user
   */
  async getSavedCoverLetters(userId: string): Promise<SavedCoverLetterFirestore[]> {
    try {
      const lettersRef = collection(
        db,
        this.USERS_COLLECTION,
        userId,
        "savedCoverLetters"
      );
      const q = query(lettersRef, orderBy("updatedAt", "desc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SavedCoverLetterFirestore[];
    } catch (error) {
      this.handleError("Failed to get saved cover letters", error);
    }
  }

  subscribeToSavedCoverLetters(
    userId: string,
    onChange: (letters: SavedCoverLetterFirestore[]) => void
  ): () => void {
    try {
      const lettersRef = collection(
        db,
        this.USERS_COLLECTION,
        userId,
        "savedCoverLetters"
      );
      const q = query(lettersRef, orderBy("updatedAt", "desc"));

      return onSnapshot(q, (snapshot) => {
        const letters = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        })) as SavedCoverLetterFirestore[];
        onChange(letters);
      });
    } catch (error) {
      this.handleError("Failed to subscribe to saved cover letters", error);
    }
  }

  /**
   * Save a cover letter
   */
  async saveCoverLetter(
    userId: string,
    letterId: string,
    name: string,
    data: CoverLetterData,
    plan: PlanId = "free"
  ): Promise<boolean | PlanLimitError> {
    try {
      const limit =
        PLAN_LIMITS[plan]?.coverLetters ?? PLAN_LIMITS.free.coverLetters;
      const current = await this.getSavedCoverLetters(userId);
      if (current.length >= limit) {
        return { code: "PLAN_LIMIT", limit, current: current.length };
      }

      const docRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        "savedCoverLetters",
        letterId
      );

      const letterDoc = {
        userId,
        name,
        jobTitle: data.jobTitle,
        companyName: data.recipient?.company,
        data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(docRef, sanitizeForFirestore(letterDoc));
      return true;
    } catch (error) {
      this.handleError("Failed to save cover letter", error);
    }
  }

  /**
   * Update a saved cover letter
   */
  async updateCoverLetter(
    userId: string,
    letterId: string,
    updates: Partial<Omit<SavedCoverLetterFirestore, "id" | "userId" | "createdAt">>
  ): Promise<boolean> {
    try {
      const docRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        "savedCoverLetters",
        letterId
      );

      await updateDoc(docRef, sanitizeForFirestore({
        ...updates,
        updatedAt: Timestamp.now(),
      }));

      return true;
    } catch (error) {
      this.handleError("Failed to update cover letter", error);
    }
  }

  /**
   * Delete a saved cover letter
   */
  async deleteCoverLetter(userId: string, letterId: string): Promise<boolean> {
    try {
      const docRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        "savedCoverLetters",
        letterId
      );

      await deleteDoc(docRef);
      return true;
    } catch (error) {
      this.handleError("Failed to delete cover letter", error);
    }
  }
  /**
   * Update user metadata
   */
  async updateUserMetadata(
    userId: string,
    data: {
      displayName?: string;
      email?: string;
      photoURL?: string;
      plan?: PlanId;
    }
  ): Promise<boolean> {
    try {
      const docRef = doc(db, this.USERS_COLLECTION, userId);

      // Use setDoc merge to allow creation if missing (backfill older users)
      await setDoc(
        docRef,
        sanitizeForFirestore({
          ...data,
          updatedAt: Timestamp.now(),
        }),
        { merge: true }
      );
      return true;
    } catch (error) {
      this.handleError("Failed to update user metadata", error);
    }
  }

  /**
   * Delete all user data
   */
  async deleteUserData(userId: string): Promise<boolean> {
    try {
      // 1. Delete all saved resumes
      const resumes = await this.getSavedResumes(userId);
      for (const resume of resumes) {
        await this.deleteResume(userId, resume.id);
      }

      // 2. Delete all saved cover letters
      const coverLetters = await this.getSavedCoverLetters(userId);
      for (const letter of coverLetters) {
        await this.deleteCoverLetter(userId, letter.id);
      }

      // 3. Delete current resume draft
      const currentResumeRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        this.RESUMES_COLLECTION,
        this.CURRENT_RESUME_DOC
      );
      await deleteDoc(currentResumeRef);

      // 4. Delete user metadata document
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      await deleteDoc(userRef);

      return true;
    } catch (error) {
      this.handleError("Failed to delete user data", error);
    }
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService();
