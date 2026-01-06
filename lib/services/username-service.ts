/**
 * Username Service
 *
 * Handles username validation, availability checking, and management.
 * Usernames are used for public resume URLs: /u/{username}/{slug}
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  USERNAME_REQUIREMENTS,
  validateUsername,
  UsernameValidation,
} from "@/lib/types/sharing";

/**
 * Username Service
 */
class UsernameService {
  private readonly USERS_COLLECTION = "users";
  private readonly USERNAMES_COLLECTION = "usernames"; // Index collection for lookup

  /**
   * Check if a username is available
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      // First validate format
      const validation = validateUsername(username);
      if (!validation.isValid) {
        return false;
      }

      // Check the usernames index collection
      const docRef = doc(db, this.USERNAMES_COLLECTION, username.toLowerCase());
      const docSnap = await getDoc(docRef);

      return !docSnap.exists();
    } catch (error) {
      console.error("Error checking username availability:", error);
      return false;
    }
  }

  /**
   * Validate username format and check availability
   */
  async validateAndCheckAvailability(
    username: string
  ): Promise<UsernameValidation> {
    // First validate format
    const validation = validateUsername(username);
    if (!validation.isValid) {
      return validation;
    }

    // Check availability
    const isAvailable = await this.isUsernameAvailable(username);
    if (!isAvailable) {
      return {
        isValid: true,
        isAvailable: false,
        error: "This username is already taken",
        suggestion: `${username}${Math.floor(Math.random() * 1000)}`,
      };
    }

    return { isValid: true, isAvailable: true };
  }

  /**
   * Claim a username for a user
   * Creates both the user metadata update and the username index entry
   */
  async claimUsername(userId: string, username: string): Promise<boolean> {
    try {
      const normalizedUsername = username.toLowerCase();

      // Validate and check availability one more time
      const validation = await this.validateAndCheckAvailability(
        normalizedUsername
      );
      if (!validation.isValid || !validation.isAvailable) {
        throw new Error(validation.error || "Username not available");
      }

      // Check if user already has a username
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      // If user already has a different username, we need to release the old one
      if (userData?.username && userData.username !== normalizedUsername) {
        await this.releaseUsername(userData.username);
      }

      // Create the username index entry (username -> userId mapping)
      const usernameRef = doc(db, this.USERNAMES_COLLECTION, normalizedUsername);
      await setDoc(usernameRef, {
        userId,
        username: normalizedUsername,
        claimedAt: Timestamp.now(),
      });

      // Update user metadata with the username
      await setDoc(
        userRef,
        {
          username: normalizedUsername,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      return true;
    } catch (error) {
      console.error("Error claiming username:", error);
      throw error;
    }
  }

  /**
   * Release a username (when user changes username)
   */
  private async releaseUsername(username: string): Promise<void> {
    try {
      const { deleteDoc, doc: docRef } = await import("firebase/firestore");
      const usernameRef = docRef(db, this.USERNAMES_COLLECTION, username.toLowerCase());
      await deleteDoc(usernameRef);
    } catch (error) {
      console.error("Error releasing username:", error);
      // Don't throw - this is a cleanup operation
    }
  }

  /**
   * Get user ID from username
   */
  async getUserIdFromUsername(username: string): Promise<string | null> {
    try {
      const docRef = doc(db, this.USERNAMES_COLLECTION, username.toLowerCase());
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return docSnap.data().userId;
    } catch (error) {
      console.error("Error getting userId from username:", error);
      return null;
    }
  }

  /**
   * Get username from user ID
   */
  async getUsernameFromUserId(userId: string): Promise<string | null> {
    try {
      const docRef = doc(db, this.USERS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return docSnap.data().username || null;
    } catch (error) {
      console.error("Error getting username from userId:", error);
      return null;
    }
  }

  /**
   * Generate username suggestions based on display name
   */
  generateSuggestions(displayName: string): string[] {
    const base = displayName
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 20);

    if (!base) {
      return ["user", "resume-user", "job-seeker"];
    }

    return [
      base,
      `${base}-resume`,
      `${base}${Math.floor(Math.random() * 100)}`,
      `${base}-pro`,
      `the-${base}`,
    ].filter((s) => s.length >= USERNAME_REQUIREMENTS.minLength);
  }
}

// Export singleton instance
export const usernameService = new UsernameService();
