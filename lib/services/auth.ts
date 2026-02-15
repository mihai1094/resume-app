import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signInWithPopup,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/config";
import { toFirebaseError } from "@/lib/utils/error";
import { getOrCreateClientDeviceId } from "@/lib/client/device-id";

/**
 * Password validation requirements
 */
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push(
      'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Authentication Service
 * Handles all Firebase Authentication operations
 */
class AuthService {
  private googleProvider: GoogleAuthProvider;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.setCustomParameters({
      prompt: "select_account",
    });
  }

  private get auth() {
    return getFirebaseAuth();
  }

  /**
   * Register with email and password.
   * Sends a verification email so the user can confirm they own the address.
   */
  async registerWithEmail(
    email: string,
    password: string,
    displayName: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-Device-Id": getOrCreateClientDeviceId(),
        },
        body: JSON.stringify({
          email,
          password,
          displayName,
          deviceId: getOrCreateClientDeviceId(),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorCode = (payload as { code?: string })?.code;
        if (
          errorCode === "FIREBASE_ADMIN_NOT_CONFIGURED" &&
          process.env.NODE_ENV !== "production"
        ) {
          // Local/dev compatibility: fall back to direct client registration
          // when Firebase Admin credentials are intentionally not configured.
          return this.registerWithEmailClientFallback(
            email,
            password,
            displayName
          );
        }

        return {
          success: false,
          error:
            (payload as { error?: string })?.error ||
            "Registration failed. Please try again.",
        };
      }

      const customToken = (payload as { customToken?: string }).customToken;
      if (!customToken) {
        return {
          success: false,
          error: "Registration succeeded but sign-in token is missing.",
        };
      }

      const userCredential = await signInWithCustomToken(this.auth, customToken);
      const user = userCredential.user;

      // Defensive: keep profile in sync on client as well.
      if (displayName && user.displayName !== displayName) {
        await updateProfile(user, { displayName });
      }

      // Send verification email so we know the email is real (user has access to inbox)
      try {
        const actionCodeSettings =
          typeof window !== "undefined"
            ? { url: window.location.origin }
            : undefined;
        await sendEmailVerification(user, actionCodeSettings);
      } catch (verifyErr) {
        // Log but don't fail registration; user can request resend later
        console.warn("Failed to send verification email:", verifyErr);
      }

      return { success: true, user };
    } catch (error: unknown) {
      const err = toFirebaseError(error);
      console.error("Registration error:", err);
      return {
        success: false,
        error: this.getErrorMessage(err.code),
      };
    }
  }

  private async registerWithEmailClientFallback(
    email: string,
    password: string,
    displayName: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;

      if (displayName && user.displayName !== displayName) {
        await updateProfile(user, { displayName });
      }

      try {
        const actionCodeSettings =
          typeof window !== "undefined"
            ? { url: window.location.origin }
            : undefined;
        await sendEmailVerification(user, actionCodeSettings);
      } catch (verifyErr) {
        console.warn(
          "Failed to send verification email in fallback flow:",
          verifyErr
        );
      }

      return { success: true, user };
    } catch (error: unknown) {
      const err = toFirebaseError(error);
      console.error("Fallback registration error:", err);
      return {
        success: false,
        error: this.getErrorMessage(err.code),
      };
    }
  }

  /**
   * Send email verification to the current user (e.g. resend after signup).
   */
  async sendEmailVerificationToCurrentUser(): Promise<{
    success: boolean;
    error?: string;
  }> {
    const user = this.auth.currentUser;
    if (!user) {
      return { success: false, error: "Not signed in." };
    }
    if (user.emailVerified) {
      return { success: true };
    }
    try {
      const actionCodeSettings =
        typeof window !== "undefined"
          ? { url: window.location.origin }
          : undefined;
      await sendEmailVerification(user, actionCodeSettings);
      return { success: true };
    } catch (error: unknown) {
      const err = toFirebaseError(error);
      return {
        success: false,
        error: this.getErrorMessage(err.code),
      };
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error: unknown) {
      const err = toFirebaseError(error);
      console.error("Sign in error:", err);
      return {
        success: false,
        error: this.getErrorMessage(err.code),
      };
    }
  }

  /**
   * Sign in with Google (uses popup)
   */
  async signInWithGoogle(): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      return { success: true, user: result.user };
    } catch (error: unknown) {
      const err = toFirebaseError(error);
      console.error("Google sign in error:", err);
      return {
        success: false,
        error: this.getErrorMessage(err.code),
      };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await firebaseSignOut(this.auth);
      return { success: true };
    } catch (error: unknown) {
      const err = toFirebaseError(error);
      console.error("Sign out error:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return { success: true };
    } catch (error: unknown) {
      const err = toFirebaseError(error);
      console.error("Password reset error:", err);
      return {
        success: false,
        error: this.getErrorMessage(err.code),
      };
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, callback);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Get user-friendly error messages
   */
  getErrorMessage(errorCode: string | undefined): string {
    if (!errorCode) return "An unexpected error occurred.";
    const errorMessages: Record<string, string> = {
      "auth/email-already-in-use": "This email is already registered.",
      "auth/email-already-exists": "This email is already registered.",
      "auth/invalid-email": "Invalid email address.",
      "auth/operation-not-allowed": "Operation not allowed.",
      "auth/weak-password":
        "Password should be at least 8 characters with uppercase, lowercase, number, and special character.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/too-many-requests": "Too many failed attempts. Try again later.",
      "auth/network-request-failed": "Network error. Check your connection.",
      "auth/popup-closed-by-user": "Sign-in popup was closed.",
      "auth/cancelled-popup-request": "Sign-in was cancelled.",
      "auth/requires-recent-login":
        "This action requires you to sign in again for security.",
      "auth/credential-already-in-use":
        "This credential is already associated with another account.",
    };

    return errorMessages[errorCode] || "An unexpected error occurred.";
  }
  /**
   * Update user profile
   */
  async updateProfile(
    displayName: string,
    photoURL?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("No user logged in");

      await updateProfile(user, {
        displayName,
        photoURL,
      });

      return { success: true };
    } catch (error: unknown) {
      const err = toFirebaseError(error);
      console.error("Update profile error:", err);
      return {
        success: false,
        error: this.getErrorMessage(err.code),
      };
    }
  }

  /**
   * Re-authenticate user with Google (required before sensitive operations)
   */
  async reauthenticateWithGoogle(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("No user logged in");

      await reauthenticateWithPopup(user, this.googleProvider);
      return { success: true };
    } catch (error: unknown) {
      const err = toFirebaseError(error);
      console.error("Google re-authentication error:", err);
      return {
        success: false,
        error: this.getErrorMessage(err.code),
      };
    }
  }

  /**
   * Re-authenticate user with email/password (required before sensitive operations)
   */
  async reauthenticateWithEmail(
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = this.auth.currentUser;
      if (!user || !user.email) throw new Error("No user logged in");

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      return { success: true };
    } catch (error: unknown) {
      const err = toFirebaseError(error);
      console.error("Email re-authentication error:", err);
      return {
        success: false,
        error: this.getErrorMessage(err.code),
      };
    }
  }

  /**
   * Check if user needs re-authentication
   * Firebase requires recent login for sensitive operations
   */
  needsReauthentication(): boolean {
    const user = this.auth.currentUser;
    if (!user || !user.metadata.lastSignInTime) return true;

    const lastSignIn = new Date(user.metadata.lastSignInTime).getTime();
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    return lastSignIn < fiveMinutesAgo;
  }

  /**
   * Get user's auth provider (google, password, etc.)
   */
  getUserProvider(): "google" | "password" | "unknown" {
    const user = this.auth.currentUser;
    if (!user) return "unknown";

    const googleProvider = user.providerData.find(
      (p) => p.providerId === "google.com"
    );
    if (googleProvider) return "google";

    const passwordProvider = user.providerData.find(
      (p) => p.providerId === "password"
    );
    if (passwordProvider) return "password";

    return "unknown";
  }

  /**
   * Delete account (requires recent authentication)
   */
  async deleteAccount(): Promise<{
    success: boolean;
    error?: string;
    requiresReauth?: boolean;
  }> {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("No user logged in");

      await user.delete();
      return { success: true };
    } catch (error: unknown) {
      const err = toFirebaseError(error);
      console.error("Delete account error:", err);

      // Check if re-authentication is required
      if (err.code === "auth/requires-recent-login") {
        return {
          success: false,
          error: this.getErrorMessage(err.code),
          requiresReauth: true,
        };
      }

      return {
        success: false,
        error: this.getErrorMessage(err.code),
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
