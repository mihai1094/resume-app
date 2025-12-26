"use client";

import { useState, useEffect, useCallback } from "react";
import { ResumeData } from "@/lib/types/resume";
import {
  firestoreService,
  PlanLimitError,
  PlanId,
} from "@/lib/services/firestore";
import { useUser } from "./use-user";

/**
 * Safely converts a Firestore timestamp to ISO string.
 * Handles: Firestore Timestamp, plain {seconds, nanoseconds} objects, Date, string, or undefined.
 */
function timestampToISO(
  ts: unknown
): string {
  if (!ts) return new Date().toISOString();

  // Firestore Timestamp with toDate method
  if (typeof ts === "object" && ts !== null && "toDate" in ts && typeof (ts as { toDate: unknown }).toDate === "function") {
    return (ts as { toDate: () => Date }).toDate().toISOString();
  }

  // Plain object with seconds (serialized Timestamp)
  if (typeof ts === "object" && ts !== null && "seconds" in ts) {
    const { seconds, nanoseconds = 0 } = ts as { seconds: number; nanoseconds?: number };
    return new Date(seconds * 1000 + nanoseconds / 1000000).toISOString();
  }

  // Already a Date
  if (ts instanceof Date) {
    return ts.toISOString();
  }

  // Already a string
  if (typeof ts === "string") {
    return ts;
  }

  return new Date().toISOString();
}

export interface SavedResume {
  id: string;
  name: string;
  templateId: string;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
  // Tailored resume fields
  sourceResumeId?: string;  // ID of the master resume this was tailored from
  targetJobTitle?: string;  // Job title this was tailored for
  targetCompany?: string;   // Company this was tailored for
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
            createdAt: timestampToISO(resume.createdAt),
            updatedAt: timestampToISO(resume.updatedAt),
            sourceResumeId: resume.sourceResumeId,
            targetJobTitle: resume.targetJobTitle,
            targetCompany: resume.targetCompany,
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
    async (
      name: string,
      templateId: string,
      data: ResumeData,
      tailoringInfo?: {
        sourceResumeId: string;
        targetJobTitle?: string;
        targetCompany?: string;
      }
    ) => {
      if (!userId) return null;

      const newResumeId = `resume-${Date.now()}`;

      try {
        const result = await firestoreService.saveResume(
          userId,
          newResumeId,
          name,
          templateId,
          data,
          (user?.plan as PlanId) || "free",
          tailoringInfo
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
            sourceResumeId: tailoringInfo?.sourceResumeId,
            targetJobTitle: tailoringInfo?.targetJobTitle,
            targetCompany: tailoringInfo?.targetCompany,
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






