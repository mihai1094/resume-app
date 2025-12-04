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

export interface SavedResumeFirestore {
  id: string;
  userId: string;
  name: string;
  templateId: string;
  data: ResumeData;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type PlanId = "free" | "ai" | "pro";

const PLAN_LIMITS: Record<PlanId, { resumes: number; coverLetters: number }> = {
  free: { resumes: 3, coverLetters: 3 },
  ai: { resumes: 50, coverLetters: 50 },
  pro: { resumes: 999, coverLetters: 999 },
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
  async getUserMetadata(userId: string): Promise<{
    email?: string;
    displayName?: string;
    photoURL?: string;
    plan?: string;
    aiAccess?: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    lastLoginAt?: Timestamp;
  } | null> {
    try {
      const docRef = doc(db, this.USERS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return docSnap.data();
    } catch (error) {
      this.handleError("Failed to get user metadata", error);
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
        {
          userId,
          data: resumeData,
          updatedAt: Timestamp.now(),
        } as CurrentResumeFirestore,
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
    plan: PlanId = "free"
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
      };

      await setDoc(docRef, resumeDoc);
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

      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });

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
    options?: { plan?: string; aiAccess?: boolean }
  ): Promise<boolean> {
    try {
      const docRef = doc(db, this.USERS_COLLECTION, userId);
      await setDoc(docRef, {
        email,
        displayName,
        plan: options?.plan ?? "free",
        aiAccess: options?.aiAccess ?? false,
        createdAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      this.handleError("Failed to create user metadata", error);
    }
  }

  // ==================== COVER LETTER METHODS ====================

  /**
   * Get all saved cover letters for a user
   */
  async getSavedCoverLetters(userId: string): Promise<any[]> {
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
      }));
    } catch (error) {
      this.handleError("Failed to get saved cover letters", error);
    }
  }

  subscribeToSavedCoverLetters(
    userId: string,
    onChange: (letters: any[]) => void
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
        }));
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
    data: any,
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

      await setDoc(docRef, letterDoc);
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
    updates: any
  ): Promise<boolean> {
    try {
      const docRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        "savedCoverLetters",
        letterId
      );

      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });

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
      plan?: string;
      aiAccess?: boolean;
    }
  ): Promise<boolean> {
    try {
      const docRef = doc(db, this.USERS_COLLECTION, userId);

      // Use setDoc merge to allow creation if missing (backfill older users)
      await setDoc(
        docRef,
        {
          ...data,
          updatedAt: Timestamp.now(),
        },
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
