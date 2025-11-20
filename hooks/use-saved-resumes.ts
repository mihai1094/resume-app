"use client";

import { useState, useEffect, useCallback } from "react";
import { ResumeData } from "@/lib/types/resume";

export interface SavedResume {
  id: string;
  name: string;
  templateId: string;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_PREFIX = "resume-saved-";

export function useSavedResumes(userId: string | null) {
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved resumes for user
  useEffect(() => {
    if (!userId) {
      setResumes([]);
      setIsLoading(false);
      return;
    }

    try {
      const storageKey = `${STORAGE_PREFIX}${userId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setResumes(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load saved resumes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Save a resume
  const saveResume = useCallback(
    (name: string, templateId: string, data: ResumeData) => {
      if (!userId) return null;

      const newResume: SavedResume = {
        id: `resume-${Date.now()}`,
        name,
        templateId,
        data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        const storageKey = `${STORAGE_PREFIX}${userId}`;
        const updated = [...resumes, newResume];
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setResumes(updated);
        return newResume;
      } catch (error) {
        console.error("Failed to save resume:", error);
        return null;
      }
    },
    [userId, resumes]
  );

  // Update a resume
  const updateResume = useCallback(
    (id: string, updates: Partial<SavedResume>) => {
      if (!userId) return false;

      try {
        const storageKey = `${STORAGE_PREFIX}${userId}`;
        const updated = resumes.map((resume) =>
          resume.id === id
            ? { ...resume, ...updates, updatedAt: new Date().toISOString() }
            : resume
        );
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setResumes(updated);
        return true;
      } catch (error) {
        console.error("Failed to update resume:", error);
        return false;
      }
    },
    [userId, resumes]
  );

  // Delete a resume
  const deleteResume = useCallback(
    (id: string) => {
      if (!userId) return false;

      try {
        const storageKey = `${STORAGE_PREFIX}${userId}`;
        const updated = resumes.filter((resume) => resume.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setResumes(updated);
        return true;
      } catch (error) {
        console.error("Failed to delete resume:", error);
        return false;
      }
    },
    [userId, resumes]
  );

  return {
    resumes,
    isLoading,
    saveResume,
    updateResume,
    deleteResume,
  };
}



