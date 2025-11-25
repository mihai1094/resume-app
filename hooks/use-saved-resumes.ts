"use client";

import { useState, useEffect, useCallback } from "react";
import { ResumeData } from "@/lib/types/resume";
import { firestoreService } from "@/lib/services/firestore";

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

  // Load saved resumes for user from Firestore
  useEffect(() => {
    if (!userId) {
      setResumes([]);
      setIsLoading(false);
      return;
    }

    const loadResumes = async () => {
      setIsLoading(true);
      const firestoreResumes = await firestoreService.getSavedResumes(userId);

      // Convert Firestore timestamps to ISO strings
      const resumes: SavedResume[] = firestoreResumes.map((resume) => ({
        id: resume.id,
        name: resume.name,
        templateId: resume.templateId,
        data: resume.data,
        createdAt: resume.createdAt.toDate().toISOString(),
        updatedAt: resume.updatedAt.toDate().toISOString(),
      }));

      setResumes(resumes);
      setIsLoading(false);
    };

    loadResumes();
  }, [userId]);

  // Save a resume
  const saveResume = useCallback(
    async (name: string, templateId: string, data: ResumeData) => {
      if (!userId) return null;

      const newResumeId = `resume-${Date.now()}`;

      const success = await firestoreService.saveResume(
        userId,
        newResumeId,
        name,
        templateId,
        data
      );

      if (success) {
        const newResume: SavedResume = {
          id: newResumeId,
          name,
          templateId,
          data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setResumes((prev) => [newResume, ...prev]);
        return newResume;
      }

      return null;
    },
    [userId]
  );

  // Update a resume
  const updateResume = useCallback(
    async (id: string, updates: Partial<SavedResume>) => {
      if (!userId) return false;

      // Convert SavedResume updates to Firestore format (remove string dates)
      const { createdAt, updatedAt, ...firestoreUpdates } = updates;

      const success = await firestoreService.updateResume(userId, id, firestoreUpdates);

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

      return false;
    },
    [userId]
  );

  // Delete a resume
  const deleteResume = useCallback(
    async (id: string) => {
      if (!userId) return false;

      const success = await firestoreService.deleteResume(userId, id);

      if (success) {
        setResumes((prev) => prev.filter((resume) => resume.id !== id));
        return true;
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







