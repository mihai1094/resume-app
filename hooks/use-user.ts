"use client";

import { useState, useEffect, useCallback } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { authService } from "@/lib/services/auth";
import { firestoreService } from "@/lib/services/firestore";

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          photoURL: firebaseUser.photoURL || undefined,
        });
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
        // Create user metadata in Firestore
        await firestoreService.createUserMetadata(result.user.uid, email, name);

        setUser({
          id: result.user.uid,
          email: result.user.email || "",
          name: result.user.displayName || name,
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
      const userExists = await firestoreService.userExists(result.user.uid);
      if (!userExists) {
        await firestoreService.createUserMetadata(
          result.user.uid,
          result.user.email || "",
          result.user.displayName || ""
        );
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

    if (!result.success) {
      setError(result.error || "Logout failed");
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

    // 1. Delete Firestore Data first
    const firestoreResult = await firestoreService.deleteUserData(user.id);
    if (!firestoreResult) {
      setError("Failed to delete user data");
      setIsLoading(false);
      return { success: false };
    }

    // 2. Delete Auth Account
    const authResult = await authService.deleteAccount();
    if (!authResult.success) {
      setError(authResult.error || "Failed to delete account");
      setIsLoading(false);

      // Return requiresReauth flag if that's the issue
      if (authResult.requiresReauth) {
        return { success: false, requiresReauth: true };
      }

      return { success: false };
    }

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
