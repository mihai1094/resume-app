import { useState, useEffect, useRef } from "react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateId } from "@/lib/constants/templates";
import { firestoreService } from "@/lib/services/firestore";

interface UseResumeDataLoaderProps {
  resumeId: string | null;
  userId: string | null;
  isUserLoading: boolean;
  savedData: ResumeData | null;
  lastSaved: Date | null;
  loadResume: (data: ResumeData) => void;
}

export function useResumeDataLoader({
  resumeId,
  userId,
  isUserLoading,
  savedData,
  lastSaved,
  loadResume,
}: UseResumeDataLoaderProps) {
  const [isInitializing, setIsInitializing] = useState<boolean>(!!resumeId);
  const [resumeLoadError, setResumeLoadError] = useState<string | null>(null);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(
    resumeId
  );
  const [editingResumeName, setEditingResumeName] = useState<string | null>(
    null
  );
  const [loadedTemplateId, setLoadedTemplateId] = useState<TemplateId | null>(
    null
  );

  const hasLoadedInitialData = useRef(false);

  // Load saved data for new resumes
  useEffect(() => {
    if (resumeId) return;
    if (hasLoadedInitialData.current) return;

    const loadNewerVersion = async () => {
      let localStorageTimestamp: number | null = null;
      let firestoreTimestamp: number | null = null;
      let localStorageData: ResumeData | null = null;
      let firestoreData: ResumeData | null = null;

      if (savedData) {
        localStorageData = savedData;
        localStorageTimestamp = lastSaved ? lastSaved.getTime() : 0;
      }

      if (userId) {
        try {
          const currentResume = await firestoreService.getCurrentResumeWithMeta(
            userId
          );
          if (currentResume) {
            firestoreData = currentResume.data;
            firestoreTimestamp = currentResume.updatedAt ?? 0;
          }
        } catch (error) {
          console.error("Failed to load current resume:", error);
        }
      }

      if (localStorageData && firestoreData) {
        const newer =
          (localStorageTimestamp || 0) > (firestoreTimestamp || 0)
            ? localStorageData
            : firestoreData;
        loadResume(newer);
      } else if (localStorageData) {
        loadResume(localStorageData);
      } else if (firestoreData) {
        loadResume(firestoreData);
      }
    };

    loadNewerVersion().finally(() => {
      hasLoadedInitialData.current = true;
      setIsInitializing(false);
    });
  }, [resumeId, loadResume, savedData, lastSaved, userId]);

  // Load existing resume data when editing
  useEffect(() => {
    if (!resumeId) return;
    if (hasLoadedInitialData.current) return;
    if (isUserLoading) return;

    const loadExistingResume = async () => {
      // Wait for user to be loaded
      if (userId === undefined) {
        // User is still loading, wait
        return;
      }

      if (!userId) {
        setResumeLoadError("Please log in to edit resumes");
        hasLoadedInitialData.current = true;
        setIsInitializing(false);
        return;
      }

      try {
        const resume = await firestoreService.getResumeById(userId, resumeId);

        if (resume) {
          loadResume(resume.data);
          setEditingResumeId(resume.id);
          setEditingResumeName(resume.name || null);
          if (resume.templateId) {
            setLoadedTemplateId(resume.templateId as TemplateId);
          }
          hasLoadedInitialData.current = true;
          setIsInitializing(false);
          setResumeLoadError(null);
        } else {
          setResumeLoadError("Resume not found");
          hasLoadedInitialData.current = true;
          setIsInitializing(false);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load resume";
        setResumeLoadError(message);
        hasLoadedInitialData.current = true;
        setIsInitializing(false);
      }
    };

    loadExistingResume();
  }, [resumeId, userId, isUserLoading, loadResume]);

  return {
    isInitializing,
    resumeLoadError,
    editingResumeId,
    setEditingResumeId,
    editingResumeName,
    setEditingResumeName,
    loadedTemplateId,
  };
}
