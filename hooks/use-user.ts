"use client";

import { useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

const STORAGE_KEY = "resume-user";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create or update user
  const setUserData = useCallback((userData: User) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  }, []);

  // Create a new user account
  const createUser = useCallback(
    (email: string, name: string) => {
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        createdAt: new Date().toISOString(),
      };
      setUserData(newUser);
      return newUser;
    },
    [setUserData]
  );

  // Logout
  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  }, []);

  return {
    user,
    isLoading,
    createUser,
    setUserData,
    logout,
    isAuthenticated: !!user,
  };
}

