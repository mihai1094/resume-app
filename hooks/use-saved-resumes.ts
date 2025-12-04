"use client";

import { useState, useEffect, useCallback } from "react";
import { ResumeData } from "@/lib/types/resume";
import {
  firestoreService,
  PlanLimitError,
  PlanId,
} from "@/lib/services/firestore";
import { useUser } from "./use-user";

export interface SavedResume {
  id: string;
  name: string;
  templateId: string;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
}

export function useSavedResumes(userId: string | null) {
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (!userId) {
      setResumes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const unsubscribe = firestoreService.subscribeToSavedResumes(
        userId,
        (firestoreResumes) => {
          const next: SavedResume[] = firestoreResumes.map((resume) => ({
            id: resume.id,
            name: resume.name,
            templateId: resume.templateId,
            data: resume.data,
            createdAt: resume.createdAt.toDate().toISOString(),
            updatedAt: resume.updatedAt.toDate().toISOString(),
          }));
          setResumes(next);
          setIsLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Failed to subscribe to saved resumes:", error);
      setResumes([]);
      setIsLoading(false);
    }
  }, [userId]);

  // Save a resume
  const saveResume = useCallback(
    async (name: string, templateId: string, data: ResumeData) => {
      if (!userId) return null;

      const newResumeId = `resume-${Date.now()}`;

      try {
        const result = await firestoreService.saveResume(
          userId,
          newResumeId,
          name,
          templateId,
          data,
          (user?.plan as PlanId) || "free"
        );

        if (result === true) {
          const now = new Date().toISOString();
          const newResume: SavedResume = {
            id: newResumeId,
            name,
            templateId,
            data,
            createdAt: now,
            updatedAt: now,
          };

          setResumes((prev) => [newResume, ...prev]);
          return newResume;
        }

        if ((result as PlanLimitError)?.code === "PLAN_LIMIT") {
          return result as PlanLimitError;
        }
      } catch (error) {
        console.error("Failed to save resume:", error);
        return null;
      }

      return null;
    },
    [userId, user?.plan]
  );

  // Update a resume
  const updateResume = useCallback(
    async (id: string, updates: Partial<SavedResume>) => {
      if (!userId) return false;

      // Convert SavedResume updates to Firestore format (remove string dates)
      const { createdAt, updatedAt, ...firestoreUpdates } = updates;

      try {
        const success = await firestoreService.updateResume(
          userId,
          id,
          firestoreUpdates
        );

        if (success) {
          setResumes((prev) =>
            prev.map((resume) =>
              resume.id === id
                ? { ...resume, ...updates, updatedAt: new Date().toISOString() }
                : resume
            )
          );
          return true;
        }
      } catch (error) {
        console.error("Failed to update resume:", error);
      }

      return false;
    },
    [userId]
  );

  // Delete a resume
  const deleteResume = useCallback(
    async (id: string) => {
      if (!userId) return false;

      try {
        const success = await firestoreService.deleteResume(userId, id);

        if (success) {
          setResumes((prev) => prev.filter((resume) => resume.id !== id));
          return true;
        }
      } catch (error) {
        console.error("Failed to delete resume:", error);
      }

      return false;
    },
    [userId]
  );

  return {
    resumes,
    isLoading,
    saveResume,
    updateResume,
    deleteResume,
  };
}






