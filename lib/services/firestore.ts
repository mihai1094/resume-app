import {
  collection,
  type DocumentData,
  doc,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  getDoc,
  getCountFromServer,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  onSnapshot,
  limit,
  startAfter,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ResumeData } from "@/lib/types/resume";
import { CoverLetterData } from "@/lib/types/cover-letter";
import { FREE_TIER_LIMITS, PREMIUM_TIER_LIMITS } from "@/lib/config/credits";
import { ConflictError, DatabaseError } from "@/lib/types/errors";
import { authFetch } from "@/lib/api/auth-fetch";
import { TemplateCustomizationDefaults } from "@/lib/constants/defaults";

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
  customization?: TemplateCustomizationDefaults;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Tailored resume fields
  sourceResumeId?: string; // ID of the master resume this was tailored from
  targetJobTitle?: string; // Job title this was tailored for
  targetCompany?: string; // Company this was tailored for
}

export type PlanId = "free" | "premium";

const PLAN_LIMITS: Record<PlanId, { resumes: number; coverLetters: number }> = {
  free: {
    resumes: FREE_TIER_LIMITS.maxResumes,
    coverLetters: FREE_TIER_LIMITS.maxCoverLetters,
  },
  premium: {
    resumes: PREMIUM_TIER_LIMITS.maxResumes,
    coverLetters: PREMIUM_TIER_LIMITS.maxCoverLetters,
  },
};
const DEFAULT_FIRESTORE_PAGE_SIZE = 50;

export interface PlanLimitError {
  code: "PLAN_LIMIT";
  limit: number;
  current: number;
}

export interface CurrentResumeFirestore {
  userId: string;
  data: ResumeData;
  templateId?: string;
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

export interface FirestorePageResult<T> {
  items: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export interface FirestoreWriteResult {
  createdAt?: string;
  updatedAt: string;
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

function timestampToISO(value: unknown): string | undefined {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  if (
    value &&
    typeof value === "object" &&
    "seconds" in value &&
    typeof (value as { seconds?: unknown }).seconds === "number"
  ) {
    const { seconds, nanoseconds = 0 } = value as {
      seconds: number;
      nanoseconds?: number;
    };
    return new Date(seconds * 1000 + nanoseconds / 1000000).toISOString();
  }

  return undefined;
}

function hasWriteConflict(
  expectedUpdatedAt: string | undefined,
  serverUpdatedAt: string | undefined
): boolean {
  if (!expectedUpdatedAt || !serverUpdatedAt) {
    return false;
  }

  return Date.parse(expectedUpdatedAt) !== Date.parse(serverUpdatedAt);
}

/**
 * Firestore collection name constants
 * Centralized to ensure consistency and easy updates
 */
export const FIRESTORE_COLLECTIONS = {
  USERS: "users",
  RESUMES: "resumes",
  SAVED_RESUMES: "savedResumes",
  SAVED_COVER_LETTERS: "savedCoverLetters",
  CURRENT_RESUME_DOC: "current",
} as const;

/**
 * Firestore Service
 * Handles all Firestore database operations
 */
class FirestoreService {
  // Collection references (using centralized constants)
  private readonly USERS_COLLECTION = FIRESTORE_COLLECTIONS.USERS;
  private readonly RESUMES_COLLECTION = FIRESTORE_COLLECTIONS.RESUMES;
  private readonly CURRENT_RESUME_DOC =
    FIRESTORE_COLLECTIONS.CURRENT_RESUME_DOC;
  private readonly SAVED_RESUMES_COLLECTION =
    FIRESTORE_COLLECTIONS.SAVED_RESUMES;
  private readonly SAVED_COVER_LETTERS_COLLECTION =
    FIRESTORE_COLLECTIONS.SAVED_COVER_LETTERS;

  private handleError(action: string, error: unknown): never {
    throw new DatabaseError(action, "FIRESTORE_ERROR", error);
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
   * Add credits used for an operation (atomic via Firestore transaction)
   */
  async addCreditsUsed(userId: string, credits: number): Promise<UserUsage> {
    try {
      const userRef = doc(db, "users", userId);
      const newUsage = await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        const userData = userSnap.data();
        const currentUsage: UserUsage = userData?.usage ?? {
          aiCreditsUsed: 0,
          aiCreditsResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
          lastCreditReset: new Date().toISOString(),
        };
        const updated: UserUsage = {
          ...currentUsage,
          aiCreditsUsed: currentUsage.aiCreditsUsed + credits,
        };
        transaction.set(userRef, { usage: updated, updatedAt: Timestamp.now() }, { merge: true });
        return updated;
      });
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
  async updateUserPlan(
    userId: string,
    plan: "free" | "premium"
  ): Promise<boolean> {
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
  ): Promise<{ data: ResumeData; templateId?: string; updatedAt?: number } | null> {
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
          templateId: data.templateId,
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
    resumeData: ResumeData,
    templateId?: string
  ): Promise<boolean> {
    try {
      const docRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        this.RESUMES_COLLECTION,
        this.CURRENT_RESUME_DOC
      );

      const payload: CurrentResumeFirestore = {
        userId,
        data: resumeData,
        updatedAt: Timestamp.now(),
      };
      if (templateId) {
        payload.templateId = templateId;
      }

      await setDoc(
        docRef,
        sanitizeForFirestore(payload),
        { merge: true }
      );

      return true;
    } catch (error) {
      this.handleError("Failed to save current resume", error);
    }
  }

  /**
   * Clear current resume autosave for a user.
   */
  async clearCurrentResume(userId: string): Promise<boolean> {
    try {
      const docRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        this.RESUMES_COLLECTION,
        this.CURRENT_RESUME_DOC
      );

      await deleteDoc(docRef);
      return true;
    } catch (error) {
      this.handleError("Failed to clear current resume", error);
    }
  }

  /**
   * Get all saved resumes for a user
   */
  async getSavedResumesPage(
    userId: string,
    options: {
      limitCount?: number;
      startAfterDoc?: QueryDocumentSnapshot<DocumentData> | null;
    } = {}
  ): Promise<FirestorePageResult<SavedResumeFirestore>> {
    try {
      const resumesRef = collection(
        db,
        this.USERS_COLLECTION,
        userId,
        this.SAVED_RESUMES_COLLECTION
      );
      const pageSize = options.limitCount ?? DEFAULT_FIRESTORE_PAGE_SIZE;
      const constraints: QueryConstraint[] = [orderBy("updatedAt", "desc")];
      if (options.startAfterDoc) {
        constraints.push(startAfter(options.startAfterDoc));
      }
      constraints.push(limit(pageSize + 1));
      const q = query(resumesRef, ...constraints);
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      const hasMore = docs.length > pageSize;
      const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;

      return {
        items: pageDocs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SavedResumeFirestore[],
        lastDoc: pageDocs.at(-1) ?? null,
        hasMore,
      };
    } catch (error) {
      this.handleError("Failed to get saved resumes", error);
    }
  }

  async getSavedResumes(userId: string): Promise<SavedResumeFirestore[]> {
    const page = await this.getSavedResumesPage(userId);
    return page.items;
  }

  subscribeToSavedResumes(
    userId: string,
    onChange: (
      resumes: SavedResumeFirestore[],
      meta: { lastDoc: QueryDocumentSnapshot<DocumentData> | null }
    ) => void,
    options: { limitCount?: number } = {}
  ): () => void {
    try {
      const resumesRef = collection(
        db,
        this.USERS_COLLECTION,
        userId,
        this.SAVED_RESUMES_COLLECTION
      );
      const pageSize = options.limitCount ?? DEFAULT_FIRESTORE_PAGE_SIZE;
      const q = query(
        resumesRef,
        orderBy("updatedAt", "desc"),
        limit(pageSize)
      );
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(
          (docSnapshot) =>
            ({
              id: docSnapshot.id,
              ...docSnapshot.data(),
            } as SavedResumeFirestore)
        );
        onChange(data, {
          lastDoc: snapshot.docs.at(-1) ?? null,
        });
      });
    } catch (error) {
      this.handleError("Failed to subscribe to saved resumes", error);
    }
  }

  async getSavedResumeCount(userId: string): Promise<number> {
    try {
      const resumesRef = collection(
        db,
        this.USERS_COLLECTION,
        userId,
        this.SAVED_RESUMES_COLLECTION
      );
      const snapshot = await getCountFromServer(resumesRef);
      return snapshot.data().count;
    } catch (error) {
      this.handleError("Failed to count saved resumes", error);
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
        this.SAVED_RESUMES_COLLECTION,
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
    },
    customization?: TemplateCustomizationDefaults
  ): Promise<FirestoreWriteResult | PlanLimitError> {
    try {
      const limit = PLAN_LIMITS[plan]?.resumes ?? PLAN_LIMITS.free.resumes;
      const currentResumeCount = await this.getSavedResumeCount(userId);
      if (currentResumeCount >= limit) {
        return { code: "PLAN_LIMIT", limit, current: currentResumeCount };
      }

      const docRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        this.SAVED_RESUMES_COLLECTION,
        resumeId
      );

      const now = Timestamp.now();
      const resumeDoc: Omit<SavedResumeFirestore, "id"> = {
        userId,
        name,
        templateId,
        data,
        customization,
        createdAt: now,
        updatedAt: now,
        ...(tailoringInfo?.sourceResumeId && {
          sourceResumeId: tailoringInfo.sourceResumeId,
        }),
        ...(tailoringInfo?.targetJobTitle && {
          targetJobTitle: tailoringInfo.targetJobTitle,
        }),
        ...(tailoringInfo?.targetCompany && {
          targetCompany: tailoringInfo.targetCompany,
        }),
      };

      await setDoc(docRef, sanitizeForFirestore(resumeDoc));
      const nowIso = now.toDate().toISOString();
      return {
        createdAt: nowIso,
        updatedAt: nowIso,
      };
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
    updates: Partial<Omit<SavedResumeFirestore, "id" | "userId" | "createdAt">>,
    options: { expectedUpdatedAt?: string } = {}
  ): Promise<FirestoreWriteResult> {
    try {
      const docRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        this.SAVED_RESUMES_COLLECTION,
        resumeId
      );

      const nextUpdatedAt = Timestamp.now();
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(docRef);
        if (!snapshot.exists()) {
          throw new DatabaseError("Resume not found", "NOT_FOUND");
        }

        const serverUpdatedAt = timestampToISO(snapshot.data()?.updatedAt);
        if (hasWriteConflict(options.expectedUpdatedAt, serverUpdatedAt)) {
          throw new ConflictError(undefined, serverUpdatedAt);
        }

        transaction.update(
          docRef,
          sanitizeForFirestore({
            ...updates,
            updatedAt: nextUpdatedAt,
          })
        );
      });

      return {
        updatedAt: nextUpdatedAt.toDate().toISOString(),
      };
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
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
        this.SAVED_RESUMES_COLLECTION,
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
      await setDoc(
        docRef,
        sanitizeForFirestore({
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
        })
      );
      return true;
    } catch (error) {
      this.handleError("Failed to create user metadata", error);
    }
  }

  // ==================== COVER LETTER METHODS ====================

  /**
   * Get all saved cover letters for a user
   */
  async getSavedCoverLettersPage(
    userId: string,
    options: {
      limitCount?: number;
      startAfterDoc?: QueryDocumentSnapshot<DocumentData> | null;
    } = {}
  ): Promise<FirestorePageResult<SavedCoverLetterFirestore>> {
    try {
      const lettersRef = collection(
        db,
        this.USERS_COLLECTION,
        userId,
        this.SAVED_COVER_LETTERS_COLLECTION
      );
      const pageSize = options.limitCount ?? DEFAULT_FIRESTORE_PAGE_SIZE;
      const constraints: QueryConstraint[] = [orderBy("updatedAt", "desc")];
      if (options.startAfterDoc) {
        constraints.push(startAfter(options.startAfterDoc));
      }
      constraints.push(limit(pageSize + 1));
      const q = query(lettersRef, ...constraints);
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      const hasMore = docs.length > pageSize;
      const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;

      return {
        items: pageDocs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SavedCoverLetterFirestore[],
        lastDoc: pageDocs.at(-1) ?? null,
        hasMore,
      };
    } catch (error) {
      this.handleError("Failed to get saved cover letters", error);
    }
  }

  async getSavedCoverLetters(
    userId: string
  ): Promise<SavedCoverLetterFirestore[]> {
    const page = await this.getSavedCoverLettersPage(userId);
    return page.items;
  }

  subscribeToSavedCoverLetters(
    userId: string,
    onChange: (
      letters: SavedCoverLetterFirestore[],
      meta: { lastDoc: QueryDocumentSnapshot<DocumentData> | null }
    ) => void,
    options: { limitCount?: number } = {}
  ): () => void {
    try {
      const lettersRef = collection(
        db,
        this.USERS_COLLECTION,
        userId,
        this.SAVED_COVER_LETTERS_COLLECTION
      );
      const pageSize = options.limitCount ?? DEFAULT_FIRESTORE_PAGE_SIZE;
      const q = query(
        lettersRef,
        orderBy("updatedAt", "desc"),
        limit(pageSize)
      );

      return onSnapshot(q, (snapshot) => {
        const letters = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        })) as SavedCoverLetterFirestore[];
        onChange(letters, {
          lastDoc: snapshot.docs.at(-1) ?? null,
        });
      });
    } catch (error) {
      this.handleError("Failed to subscribe to saved cover letters", error);
    }
  }

  async getSavedCoverLetterCount(userId: string): Promise<number> {
    try {
      const lettersRef = collection(
        db,
        this.USERS_COLLECTION,
        userId,
        this.SAVED_COVER_LETTERS_COLLECTION
      );
      const snapshot = await getCountFromServer(lettersRef);
      return snapshot.data().count;
    } catch (error) {
      this.handleError("Failed to count saved cover letters", error);
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
  ): Promise<FirestoreWriteResult | PlanLimitError> {
    try {
      const limit =
        PLAN_LIMITS[plan]?.coverLetters ?? PLAN_LIMITS.free.coverLetters;
      const currentCount = await this.getSavedCoverLetterCount(userId);
      if (currentCount >= limit) {
        return { code: "PLAN_LIMIT", limit, current: currentCount };
      }

      const docRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        this.SAVED_COVER_LETTERS_COLLECTION,
        letterId
      );

      const now = Timestamp.now();
      const letterDoc = {
        userId,
        name,
        jobTitle: data.jobTitle,
        companyName: data.recipient?.company,
        data,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(docRef, sanitizeForFirestore(letterDoc));
      const nowIso = now.toDate().toISOString();
      return {
        createdAt: nowIso,
        updatedAt: nowIso,
      };
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
    updates: Partial<
      Omit<SavedCoverLetterFirestore, "id" | "userId" | "createdAt">
    >,
    options: { expectedUpdatedAt?: string } = {}
  ): Promise<FirestoreWriteResult> {
    try {
      const docRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        this.SAVED_COVER_LETTERS_COLLECTION,
        letterId
      );

      const nextUpdatedAt = Timestamp.now();
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(docRef);
        if (!snapshot.exists()) {
          throw new DatabaseError("Cover letter not found", "NOT_FOUND");
        }

        const serverUpdatedAt = timestampToISO(snapshot.data()?.updatedAt);
        if (hasWriteConflict(options.expectedUpdatedAt, serverUpdatedAt)) {
          throw new ConflictError(undefined, serverUpdatedAt);
        }

        transaction.update(
          docRef,
          sanitizeForFirestore({
            ...updates,
            updatedAt: nextUpdatedAt,
          })
        );
      });

      return {
        updatedAt: nextUpdatedAt.toDate().toISOString(),
      };
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
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
        this.SAVED_COVER_LETTERS_COLLECTION,
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
  async deleteUserData(_userId: string): Promise<boolean> {
    try {
      // Full account deletion is server-enforced to include all linked data
      // (public resumes, analytics, username index, abuse markers, auth record).
      const response = await authFetch("/api/account/delete", {
        method: "POST",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          (payload as { error?: string })?.error || "Failed to delete account";
        throw new Error(message);
      }

      return true;
    } catch (error) {
      this.handleError("Failed to delete user data", error);
    }
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService();
