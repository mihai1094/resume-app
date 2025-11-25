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

  // Handle redirect result on mount (for Google sign-in redirect flow)
  useEffect(() => {
    const handleRedirect = async () => {
      const result = await authService.handleRedirectResult();
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
      }
    };

    handleRedirect();
  }, []);

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

      const result = await authService.registerWithEmail(
        email,
        password,
        name
      );

      if (result.success && result.user) {
        // Create user metadata in Firestore
        await firestoreService.createUserMetadata(
          result.user.uid,
          email,
          name
        );

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

  // Sign in with Google (redirect flow)
  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await authService.signInWithGoogle();

    // With redirect flow, this will redirect the user to Google
    // The result is handled in the useEffect above on page load
    if (!result.success && result.error) {
      setError(result.error);
      setIsLoading(false);
    }

    // Don't set isLoading to false here - user is being redirected
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

  return {
    user,
    isLoading,
    error,
    register,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    isAuthenticated: !!user,
  };
}

