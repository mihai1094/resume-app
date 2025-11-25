import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";

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

  /**
   * Register with email and password
   */
  async registerWithEmail(
    email: string,
    password: string,
    displayName: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update display name
      await updateProfile(userCredential.user, { displayName });

      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
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
        auth,
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error("Sign in error:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }

  /**
   * Sign in with Google (uses redirect for better COOP compatibility)
   */
  async signInWithGoogle(): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      // Use redirect instead of popup for better cross-origin compatibility
      await signInWithRedirect(auth, this.googleProvider);
      // This won't return immediately - user will be redirected to Google
      return { success: true };
    } catch (error: any) {
      console.error("Google sign in error:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }

  /**
   * Handle redirect result after Google sign-in
   * Call this on app initialization to check for redirect results
   */
  async handleRedirectResult(): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        return { success: true, user: result.user };
      }
      return { success: false }; // No redirect result
    } catch (error: any) {
      console.error("Redirect result error:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error: any) {
      console.error("Sign out error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error("Password reset error:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Get user-friendly error messages
   */
  private getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      "auth/email-already-in-use": "This email is already registered.",
      "auth/invalid-email": "Invalid email address.",
      "auth/operation-not-allowed": "Operation not allowed.",
      "auth/weak-password": "Password should be at least 6 characters.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/too-many-requests": "Too many failed attempts. Try again later.",
      "auth/network-request-failed": "Network error. Check your connection.",
      "auth/popup-closed-by-user": "Sign-in popup was closed.",
      "auth/cancelled-popup-request": "Sign-in was cancelled.",
    };

    return errorMessages[errorCode] || "An unexpected error occurred.";
  }
}

// Export singleton instance
export const authService = new AuthService();
