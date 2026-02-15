"use client";

import { useState, useEffect, useCallback } from "react";
import { authService } from "@/lib/services/auth";
import { firestoreService, PlanId } from "@/lib/services/firestore";
import { toast } from "sonner";
import { authFetch } from "@/lib/api/auth-fetch";
import { getFirebaseAuth } from "@/lib/firebase/config";

export type UserPlan = PlanId;

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  plan: UserPlan;
}

const DEFAULT_PLAN: UserPlan = "free";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        const baseUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          photoURL: firebaseUser.photoURL || undefined,
        };

        try {
          const metadata = await firestoreService.getUserMetadata(firebaseUser.uid);

          // Backfill metadata if missing
          if (!metadata) {
            await firestoreService.createUserMetadata(
              firebaseUser.uid,
              firebaseUser.email || "",
              firebaseUser.displayName || ""
            );
          }

          const plan = (metadata?.plan as UserPlan | undefined) ?? DEFAULT_PLAN;

          setUser({
            ...baseUser,
            plan,
          });
        } catch (metadataError) {
          console.error("Failed to load user metadata:", metadataError);
          setUser({
            ...baseUser,
            plan: DEFAULT_PLAN,
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register with email/password
  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setIsLoading(true);
      setError(null);

      const result = await authService.registerWithEmail(email, password, name);

      if (result.success && result.user) {
        setUser({
          id: result.user.uid,
          email: result.user.email || "",
          name: result.user.displayName || name,
          plan: DEFAULT_PLAN,
        });
      } else {
        setError(result.error || "Registration failed");
      }

      setIsLoading(false);
      return result.success;
    },
    []
  );

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    const result = await authService.signInWithEmail(email, password);

    if (!result.success) {
      setError(result.error || "Sign in failed");
    }

    setIsLoading(false);
    return result.success;
  }, []);

  // Sign in with Google (popup flow)
  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await authService.signInWithGoogle();

    if (result.success && result.user) {
      // Check if this is a new user and create metadata
      try {
        const userExists = await firestoreService.userExists(result.user.uid);
        if (!userExists) {
          await firestoreService.createUserMetadata(
            result.user.uid,
            result.user.email || "",
            result.user.displayName || ""
          );
        }
      } catch (firestoreError) {
        console.error("Failed to ensure user metadata:", firestoreError);
      }
    } else if (result.error) {
      setError(result.error);
    }

    setIsLoading(false);
    return result.success;
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await authService.signOut();

    if (result.success) {
      toast.success("Logged out successfully.");
    } else {
      const logoutError = result.error || "Logout failed";
      setError(logoutError);
      toast.error(logoutError);
    }

    setIsLoading(false);
    return result.success;
  }, []);

  // Send password reset email
  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    const result = await authService.sendPasswordReset(email);

    if (!result.success) {
      setError(result.error || "Password reset failed");
    }

    return result.success;
  }, []);

  // Update profile
  const updateProfile = useCallback(
    async (displayName: string, photoURL?: string) => {
      setIsLoading(true);
      setError(null);

      if (!user) {
        setError("No user logged in");
        setIsLoading(false);
        return false;
      }

      // 1. Update Auth Profile
      const authResult = await authService.updateProfile(displayName, photoURL);

      if (!authResult.success) {
        setError(authResult.error || "Failed to update profile");
        setIsLoading(false);
        return false;
      }

      // 2. Update Firestore Metadata
      try {
        const firestoreResult = await firestoreService.updateUserMetadata(
          user.id,
          {
            displayName,
            photoURL,
          }
        );

        if (!firestoreResult) {
          console.error("Failed to update firestore metadata");
        }
      } catch (firestoreError) {
        console.error("Failed to update firestore metadata", firestoreError);
      }

      // 3. Update local state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              name: displayName,
              photoURL: photoURL || prev.photoURL,
            }
          : null
      );

      setIsLoading(false);
      return true;
    },
    [user]
  );

  // Re-authenticate with Google (for sensitive operations)
  const reauthenticateWithGoogle = useCallback(async () => {
    setError(null);
    const result = await authService.reauthenticateWithGoogle();

    if (!result.success) {
      setError(result.error || "Re-authentication failed");
    }

    return result.success;
  }, []);

  // Re-authenticate with email/password (for sensitive operations)
  const reauthenticateWithEmail = useCallback(async (password: string) => {
    setError(null);
    const result = await authService.reauthenticateWithEmail(password);

    if (!result.success) {
      setError(result.error || "Re-authentication failed");
    }

    return result.success;
  }, []);

  // Get user's auth provider
  const getUserProvider = useCallback(() => {
    return authService.getUserProvider();
  }, []);

  // Check if re-authentication is needed
  const needsReauthentication = useCallback(() => {
    return authService.needsReauthentication();
  }, []);

  // Delete account (with re-authentication handling)
  const deleteAccount = useCallback(async (): Promise<{
    success: boolean;
    requiresReauth?: boolean;
  }> => {
    setIsLoading(true);
    setError(null);

    if (!user) {
      setError("No user logged in");
      setIsLoading(false);
      return { success: false };
    }

    // Ensure token carries recent auth_time after re-authentication.
    try {
      await getFirebaseAuth().currentUser?.getIdToken(true);
    } catch {
      // Ignore refresh failures; request will still be authenticated if token is valid.
    }

    // Delete all account data + Auth user server-side in a single controlled flow.
    try {
      const response = await authFetch("/api/account/delete", {
        method: "POST",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const code = (payload as { code?: string })?.code;
        if (code === "REQUIRES_REAUTH") {
          setError("Please re-authenticate before deleting your account.");
          setIsLoading(false);
          return { success: false, requiresReauth: true };
        }

        const message =
          (payload as { error?: string })?.error || "Failed to delete account";
        setError(message);
        setIsLoading(false);
        return { success: false };
      }
    } catch (deleteError) {
      console.error("Failed to delete account:", deleteError);
      setError("Failed to delete account");
      setIsLoading(false);
      return { success: false };
    }

    await authService.signOut().catch(() => undefined);
    setUser(null);
    setIsLoading(false);
    return { success: true };
  }, [user]);

  return {
    user,
    isLoading,
    error,
    register,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    updateProfile,
    deleteAccount,
    reauthenticateWithGoogle,
    reauthenticateWithEmail,
    getUserProvider,
    needsReauthentication,
    isAuthenticated: !!user,
  };
}
