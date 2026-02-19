/**
 * Sharing Service
 *
 * Handles publishing/unpublishing resumes to public URLs.
 * Public resumes are stored in a separate collection for efficient querying.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization } from "@/components/resume/template-customizer";
import {
  PublicResume,
  ShareSettings,
  ShareableLink,
  generateSlug,
  DEFAULT_PRIVACY_SETTINGS,
} from "@/lib/types/sharing";
import { usernameService } from "./username-service";
import { FREE_TIER_LIMITS, PREMIUM_TIER_LIMITS } from "@/lib/config/credits";
import { getAppUrl } from "@/lib/config/site-url";
import { launchFlags } from "@/config/launch";

/**
 * App base URL for generating public links
 */
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getAppUrl();
};

/**
 * Sharing Service
 */
class SharingService {
  private readonly PUBLIC_RESUMES_COLLECTION = "publicResumes";
  private readonly USERS_COLLECTION = "users";

  private isPublicSharingEnabled(): boolean {
    return launchFlags.features.publicSharing;
  }

  private normalizePrivacySettings(
    privacy?: Partial<ShareSettings["privacy"]>
  ): ShareSettings["privacy"] {
    return {
      ...DEFAULT_PRIVACY_SETTINGS,
      ...(privacy || {}),
    };
  }

  /**
   * Get the number of public resumes for a user
   */
  async getPublicResumeCount(userId: string): Promise<number> {
    if (!this.isPublicSharingEnabled()) {
      return 0;
    }

    try {
      const q = query(
        collection(db, this.PUBLIC_RESUMES_COLLECTION),
        where("userId", "==", userId),
        where("isPublic", "==", true)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Error getting public resume count:", error);
      return 0;
    }
  }

  /**
   * Check if user can publish more resumes based on their plan
   */
  async canPublishResume(
    userId: string,
    plan: "free" | "premium"
  ): Promise<{ allowed: boolean; current: number; limit: number }> {
    if (!this.isPublicSharingEnabled()) {
      return {
        allowed: false,
        current: 0,
        limit: 0,
      };
    }

    const limit =
      plan === "premium"
        ? PREMIUM_TIER_LIMITS.publicLinks
        : FREE_TIER_LIMITS.publicLinks;
    const current = await this.getPublicResumeCount(userId);

    return {
      allowed: current < limit,
      current,
      limit: limit === Infinity ? -1 : limit, // -1 indicates unlimited
    };
  }

  /**
   * Publish a resume to a public URL
   */
  async publishResume(
    userId: string,
    resumeId: string,
    data: ResumeData,
    templateId: string,
    customization: TemplateCustomization,
    options?: {
      customSlug?: string;
      privacy?: ShareSettings["privacy"];
    }
  ): Promise<ShareableLink> {
    if (!this.isPublicSharingEnabled()) {
      throw new Error("Public sharing is disabled in this release.");
    }

    try {
      // Get user's username
      const username = await usernameService.getUsernameFromUserId(userId);
      if (!username) {
        throw new Error("You need to set a username before publishing");
      }

      // Generate or use custom slug
      const slug =
        options?.customSlug ||
        generateSlug(
          data.personalInfo.jobTitle ||
            `${data.personalInfo.firstName}-${data.personalInfo.lastName}`
        );

      // Check for slug collision for this user
      const existingSlug = await this.getPublicResumeBySlug(username, slug);
      if (existingSlug && existingSlug.resumeId !== resumeId) {
        throw new Error(
          "This URL slug is already in use. Please choose a different one."
        );
      }

      // Create or update the public resume document
      const docRef = doc(db, this.PUBLIC_RESUMES_COLLECTION, resumeId);
      const existingDoc = await getDoc(docRef);
      const existingData = existingDoc.exists()
        ? (existingDoc.data() as Partial<PublicResume>)
        : undefined;
      const effectivePrivacy = this.normalizePrivacySettings(
        options?.privacy || existingData?.privacy
      );
      const sanitizedData = this.applyPrivacySettings(data, effectivePrivacy);

      const publicResume: PublicResume = {
        resumeId,
        userId,
        username,
        slug,
        isPublic: true,
        publishedAt: existingDoc.exists()
          ? existingDoc.data().publishedAt
          : Timestamp.now(),
        lastUpdated: Timestamp.now(),
        viewCount: existingDoc.exists() ? existingDoc.data().viewCount || 0 : 0,
        downloadCount: existingDoc.exists()
          ? existingDoc.data().downloadCount || 0
          : 0,
        data: sanitizedData,
        privacy: effectivePrivacy,
        customization,
        templateId,
      };

      await setDoc(docRef, publicResume);

      // Generate the public URL
      const url = `${getBaseUrl()}/u/${username}/${slug}`;

      return {
        url,
        username,
        slug,
      };
    } catch (error) {
      console.error("Error publishing resume:", error);
      throw error;
    }
  }

  /**
   * Unpublish a resume (remove from public access)
   */
  async unpublishResume(resumeId: string): Promise<boolean> {
    if (!this.isPublicSharingEnabled()) {
      return false;
    }

    try {
      const docRef = doc(db, this.PUBLIC_RESUMES_COLLECTION, resumeId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Error unpublishing resume:", error);
      throw error;
    }
  }

  /**
   * Get public resume by username and slug
   */
  async getPublicResumeBySlug(
    username: string,
    slug: string
  ): Promise<PublicResume | null> {
    if (!this.isPublicSharingEnabled()) {
      return null;
    }

    try {
      const q = query(
        collection(db, this.PUBLIC_RESUMES_COLLECTION),
        where("username", "==", username.toLowerCase()),
        where("slug", "==", slug),
        where("isPublic", "==", true)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data() as PublicResume;
    } catch (error) {
      console.error("Error getting public resume:", error);
      return null;
    }
  }

  /**
   * Get all public resumes for a user
   */
  async getPublicResumesForUser(username: string): Promise<PublicResume[]> {
    if (!this.isPublicSharingEnabled()) {
      return [];
    }

    try {
      const q = query(
        collection(db, this.PUBLIC_RESUMES_COLLECTION),
        where("username", "==", username.toLowerCase()),
        where("isPublic", "==", true),
        orderBy("publishedAt", "desc")
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => doc.data() as PublicResume);
    } catch (error) {
      console.error("Error getting public resumes:", error);
      return [];
    }
  }

  /**
   * Check if a resume is published
   */
  async isResumePublished(resumeId: string): Promise<boolean> {
    if (!this.isPublicSharingEnabled()) {
      return false;
    }

    try {
      const docRef = doc(db, this.PUBLIC_RESUMES_COLLECTION, resumeId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return false;
      }

      return docSnap.data().isPublic === true;
    } catch (error) {
      console.error("Error checking resume publish status:", error);
      return false;
    }
  }

  /**
   * Get public resume info for a resume ID
   */
  async getPublicResumeInfo(
    resumeId: string
  ): Promise<{
    isPublic: boolean;
    url?: string;
    slug?: string;
    privacy?: ShareSettings["privacy"];
  } | null> {
    if (!this.isPublicSharingEnabled()) {
      return { isPublic: false };
    }

    try {
      const docRef = doc(db, this.PUBLIC_RESUMES_COLLECTION, resumeId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { isPublic: false };
      }

      const data = docSnap.data() as PublicResume;
      return {
        isPublic: data.isPublic,
        url: `${getBaseUrl()}/u/${data.username}/${data.slug}`,
        slug: data.slug,
        privacy: this.normalizePrivacySettings(data.privacy),
      };
    } catch (error) {
      console.error("Error getting public resume info:", error);
      return null;
    }
  }

  /**
   * Increment view count for a public resume
   */
  async incrementViewCount(resumeId: string): Promise<void> {
    if (!this.isPublicSharingEnabled()) {
      return;
    }

    try {
      const docRef = doc(db, this.PUBLIC_RESUMES_COLLECTION, resumeId);
      await setDoc(
        docRef,
        { viewCount: increment(1), lastUpdated: Timestamp.now() },
        { merge: true }
      );
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  }

  /**
   * Increment download count for a public resume
   */
  async incrementDownloadCount(resumeId: string): Promise<void> {
    if (!this.isPublicSharingEnabled()) {
      return;
    }

    try {
      const docRef = doc(db, this.PUBLIC_RESUMES_COLLECTION, resumeId);
      await setDoc(
        docRef,
        { downloadCount: increment(1), lastUpdated: Timestamp.now() },
        { merge: true }
      );
    } catch (error) {
      console.error("Error incrementing download count:", error);
    }
  }

  /**
   * Apply privacy settings to resume data
   */
  private applyPrivacySettings(
    data: ResumeData,
    privacy: ShareSettings["privacy"]
  ): ResumeData {
    const sanitized = { ...data };
    sanitized.personalInfo = { ...data.personalInfo };

    if (privacy.hideFullName) {
      sanitized.personalInfo.firstName = "";
      sanitized.personalInfo.lastName = "";
    }

    if (privacy.hideEmail) {
      sanitized.personalInfo.email = "";
    }

    if (privacy.hidePhone) {
      sanitized.personalInfo.phone = "";
    }

    if (privacy.hideLocation) {
      sanitized.personalInfo.location = "";
    }

    if (privacy.hideWebsite) {
      sanitized.personalInfo.website = "";
    }

    if (privacy.hideLinkedin) {
      sanitized.personalInfo.linkedin = "";
    }

    if (privacy.hideGithub) {
      sanitized.personalInfo.github = "";
    }

    return sanitized;
  }

  /**
   * Update the public resume data (when user edits their resume)
   */
  async updatePublicResumeData(
    resumeId: string,
    data: ResumeData,
    customization: TemplateCustomization,
    templateId: string
  ): Promise<boolean> {
    if (!this.isPublicSharingEnabled()) {
      return false;
    }

    try {
      const docRef = doc(db, this.PUBLIC_RESUMES_COLLECTION, resumeId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return false;
      }
      const publicResume = docSnap.data() as PublicResume;
      const privacy = this.normalizePrivacySettings(publicResume.privacy);
      const sanitizedData = this.applyPrivacySettings(data, privacy);

      await setDoc(
        docRef,
        {
          data: sanitizedData,
          privacy,
          customization,
          templateId,
          lastUpdated: Timestamp.now(),
        },
        { merge: true }
      );

      return true;
    } catch (error) {
      console.error("Error updating public resume:", error);
      return false;
    }
  }
}

// Export singleton instance
export const sharingService = new SharingService();
