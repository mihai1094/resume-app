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

export interface CurrentResumeFirestore {
  userId: string;
  data: ResumeData;
  updatedAt: Timestamp;
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

  /**
   * Get current resume for a user
   */
  async getCurrentResume(userId: string): Promise<ResumeData | null> {
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
        return data.data;
      }
      return null;
    } catch (error) {
      console.error("Error getting current resume:", error);
      return null;
    }
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
      console.error("Error saving current resume:", error);
      return false;
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
      console.error("Error getting saved resumes:", error);
      return [];
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
      console.error("Error loading resume:", error);
      return null;
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
    data: ResumeData
  ): Promise<boolean> {
    try {
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
      console.error("Error saving resume:", error);
      return false;
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
      console.error("Error updating resume:", error);
      return false;
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
      console.error("Error deleting resume:", error);
      return false;
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
      console.error("Error checking user existence:", error);
      return false;
    }
  }

  /**
   * Create user metadata document
   */
  async createUserMetadata(
    userId: string,
    email: string,
    displayName: string
  ): Promise<boolean> {
    try {
      const docRef = doc(db, this.USERS_COLLECTION, userId);
      await setDoc(docRef, {
        email,
        displayName,
        createdAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error("Error creating user metadata:", error);
      return false;
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
      console.error("Error getting saved cover letters:", error);
      return [];
    }
  }

  /**
   * Save a cover letter
   */
  async saveCoverLetter(
    userId: string,
    letterId: string,
    name: string,
    data: any
  ): Promise<boolean> {
    try {
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
      console.error("Error saving cover letter:", error);
      return false;
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
      console.error("Error updating cover letter:", error);
      return false;
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
      console.error("Error deleting cover letter:", error);
      return false;
    }
  }
  /**
   * Update user metadata
   */
  async updateUserMetadata(
    userId: string,
    data: { displayName?: string; email?: string; photoURL?: string }
  ): Promise<boolean> {
    try {
      const docRef = doc(db, this.USERS_COLLECTION, userId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error("Error updating user metadata:", error);
      return false;
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
      console.error("Error deleting user data:", error);
      return false;
    }
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService();
