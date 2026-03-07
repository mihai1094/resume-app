"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { ResumeData } from "@/lib/types/resume";
import {
  firestoreService,
  PlanLimitError,
  PlanId,
} from "@/lib/services/firestore";
import { useUser } from "./use-user";
import { createPrefixedId } from "@/lib/utils/id";
import { TemplateCustomizationDefaults } from "@/lib/constants/defaults";
import { ConflictError } from "@/lib/types/errors";
import { logger } from "@/lib/services/logger";

const SAVED_RESUMES_PAGE_SIZE = 50;
const savedResumesLogger = logger.child({ module: "UseSavedResumes" });

function mergeUniqueResumes(
  nextItems: SavedResume[],
  existingItems: SavedResume[]
): SavedResume[] {
  const nextIds = new Set(nextItems.map((resume) => resume.id));
  return [...nextItems, ...existingItems.filter((resume) => !nextIds.has(resume.id))];
}

/**
 * Safely converts a Firestore timestamp to ISO string.
 * Handles: Firestore Timestamp, plain {seconds, nanoseconds} objects, Date, string, or undefined.
 */
function timestampToISO(ts: unknown): string {
  if (!ts) return new Date().toISOString();

  // Firestore Timestamp with toDate method
  if (
    typeof ts === "object" &&
    ts !== null &&
    "toDate" in ts &&
    typeof (ts as { toDate: unknown }).toDate === "function"
  ) {
    return (ts as { toDate: () => Date }).toDate().toISOString();
  }

  // Plain object with seconds (serialized Timestamp)
  if (typeof ts === "object" && ts !== null && "seconds" in ts) {
    const { seconds, nanoseconds = 0 } = ts as {
      seconds: number;
      nanoseconds?: number;
    };
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
  customization?: TemplateCustomizationDefaults;
  createdAt: string;
  updatedAt: string;
  // Tailored resume fields
  sourceResumeId?: string; // ID of the master resume this was tailored from
  targetJobTitle?: string; // Job title this was tailored for
  targetCompany?: string; // Company this was tailored for
}

export function useSavedResumes(userId: string | null) {
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [resumeCount, setResumeCount] = useState(0);
  const [nextPageCursor, setNextPageCursor] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const { user } = useUser();
  const hasLoadedMoreRef = useRef(false);

  useEffect(() => {
    if (!userId) {
      setResumes([]);
      setIsLoading(false);
      setIsLoadingMore(false);
      setResumeCount(0);
      setNextPageCursor(null);
      hasLoadedMoreRef.current = false;
      return;
    }

    setIsLoading(true);
    setIsLoadingMore(false);
    setResumeCount(0);
    setNextPageCursor(null);
    hasLoadedMoreRef.current = false;
    let cancelled = false;
    try {
      const unsubscribe = firestoreService.subscribeToSavedResumes(
        userId,
        (firestoreResumes, meta) => {
          if (cancelled) return;

          const firstPage: SavedResume[] = firestoreResumes.map((resume) => ({
            id: resume.id,
            name: resume.name,
            templateId: resume.templateId,
            data: resume.data,
            customization: resume.customization,
            createdAt: timestampToISO(resume.createdAt),
            updatedAt: timestampToISO(resume.updatedAt),
            sourceResumeId: resume.sourceResumeId,
            targetJobTitle: resume.targetJobTitle,
            targetCompany: resume.targetCompany,
          }));
          setResumes((prev) => mergeUniqueResumes(firstPage, prev));
          setResumeCount((prev) => Math.max(prev, firstPage.length));
          if (!hasLoadedMoreRef.current) {
            setNextPageCursor(meta.lastDoc);
          }
          setIsLoading(false);
        },
        { limitCount: SAVED_RESUMES_PAGE_SIZE }
      );

      void firestoreService.getSavedResumeCount(userId).then((count) => {
        if (!cancelled) {
          setResumeCount(count);
        }
      });

      return () => {
        cancelled = true;
        unsubscribe();
      };
    } catch (error) {
      savedResumesLogger.error("Failed to subscribe to saved resumes", error, {
        userId,
      });
      setResumes([]);
      setIsLoading(false);
      setResumeCount(0);
      setNextPageCursor(null);
    }
  }, [userId]);

  const loadMoreResumes = useCallback(async () => {
    if (!userId || !nextPageCursor || resumes.length >= resumeCount) {
      return false;
    }

    setIsLoadingMore(true);
    try {
      hasLoadedMoreRef.current = true;
      const page = await firestoreService.getSavedResumesPage(userId, {
        limitCount: SAVED_RESUMES_PAGE_SIZE,
        startAfterDoc: nextPageCursor,
      });

      const olderResumes = page.items.map((resume) => ({
        id: resume.id,
        name: resume.name,
        templateId: resume.templateId,
        data: resume.data,
        customization: resume.customization,
        createdAt: timestampToISO(resume.createdAt),
        updatedAt: timestampToISO(resume.updatedAt),
        sourceResumeId: resume.sourceResumeId,
        targetJobTitle: resume.targetJobTitle,
        targetCompany: resume.targetCompany,
      })) as SavedResume[];

      setResumes((prev) => mergeUniqueResumes(prev, olderResumes));
      setNextPageCursor(page.lastDoc);
      return true;
    } catch (error) {
      savedResumesLogger.error("Failed to load more resumes", error, {
        userId,
      });
      return false;
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextPageCursor, resumeCount, resumes.length, userId]);

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
      },
      customization?: TemplateCustomizationDefaults
    ) => {
      if (!userId) return null;

      // Use safe ID utility for collision-resistant IDs
      const newResumeId = createPrefixedId("resume");

      try {
        const result = await firestoreService.saveResume(
          userId,
          newResumeId,
          name,
          templateId,
          data,
          (user?.plan as PlanId) || "free",
          tailoringInfo,
          customization
        );

        if (result && "updatedAt" in result) {
          const newResume: SavedResume = {
            id: newResumeId,
            name,
            templateId,
            data,
            customization,
            createdAt: result.createdAt ?? result.updatedAt,
            updatedAt: result.updatedAt,
            sourceResumeId: tailoringInfo?.sourceResumeId,
            targetJobTitle: tailoringInfo?.targetJobTitle,
            targetCompany: tailoringInfo?.targetCompany,
          };

          setResumes((prev) => [newResume, ...prev]);
          setResumeCount((prev) => prev + 1);
          return newResume;
        }

        if ((result as PlanLimitError)?.code === "PLAN_LIMIT") {
          return result as PlanLimitError;
        }
      } catch (error) {
        savedResumesLogger.error("Failed to save resume", error, {
          userId,
          templateId,
        });
        return null;
      }

      return null;
    },
    [userId, user?.plan]
  );

  // Update a resume
  const updateResume = useCallback(
    async (
      id: string,
      updates: Partial<SavedResume>,
      options: { expectedUpdatedAt?: string } = {}
    ) => {
      if (!userId) return null;

      // Convert SavedResume updates to Firestore format (remove string dates)
      const { createdAt: _createdAt, updatedAt: _updatedAt, ...firestoreUpdates } = updates;

      try {
        const result = await firestoreService.updateResume(
          userId,
          id,
          firestoreUpdates,
          options
        );

        if (result) {
          let updatedResume: SavedResume | null = null;
          setResumes((prev) =>
            prev.map((resume) => {
              if (resume.id !== id) {
                return resume;
              }

              updatedResume = {
                ...resume,
                ...updates,
                updatedAt: result.updatedAt,
              };
              return updatedResume;
            })
          );
          return updatedResume;
        }
      } catch (error) {
        if (error instanceof ConflictError) {
          throw error;
        }

        savedResumesLogger.error("Failed to update resume", error, {
          userId,
          resumeId: id,
        });
      }

      return null;
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
          setResumeCount((prev) => Math.max(0, prev - 1));
          return true;
        }
      } catch (error) {
        savedResumesLogger.error("Failed to delete resume", error, {
          userId,
          resumeId: id,
        });
      }

      return false;
    },
    [userId]
  );

  // Get a single resume by ID (direct fetch, non-subscription)
  const getResumeById = useCallback(
    async (id: string): Promise<SavedResume | null> => {
      if (!userId) return null;
      try {
        const resume = await firestoreService.getResumeById(userId, id);
        if (!resume) return null;
        return {
          ...resume,
          createdAt: timestampToISO(resume.createdAt),
          updatedAt: timestampToISO(resume.updatedAt),
        } as SavedResume;
      } catch (error) {
        savedResumesLogger.error("Failed to fetch resume", error, {
          userId,
          resumeId: id,
        });
        return null;
      }
    },
    [userId]
  );

  // Get the most recently updated resume
  const getLatestResume = useCallback(async (): Promise<SavedResume | null> => {
    if (!userId) return null;
    try {
      const resume = await firestoreService.getCurrentResumeWithMeta(userId);
      if (!resume) return null;
      return {
        ...resume,
        createdAt: timestampToISO(resume.updatedAt), // Fallback if createdAt is missing
        updatedAt: timestampToISO(resume.updatedAt),
      } as SavedResume;
    } catch (error) {
      savedResumesLogger.error("Failed to fetch latest resume", error, {
        userId,
      });
      return null;
    }
  }, [userId]);

  /**
   * Upsert a resume: updates if ID exists, saves as new if not.
   */
  const upsertResume = useCallback(
    async (
      resume: Partial<SavedResume> & { id?: string; name: string; data: ResumeData }
    ) => {
      if (!userId) return null;

      const { id, name, templateId, data, customization, ...tailoringInfo } =
        resume;

      if (id) {
        // Update existing
        const success = await updateResume(id, {
          name,
          templateId,
          data,
          customization,
          ...tailoringInfo,
        }, {
          expectedUpdatedAt: resume.updatedAt,
        });
        if (success) return success;
        return null;
      } else {
        // Save new
        return await saveResume(
          name,
          templateId || "modern",
          data,
          tailoringInfo as any,
          customization
        );
      }
    },
    [userId, updateResume, saveResume]
  );

  return {
    resumes,
    resumeCount,
    isLoading,
    isLoadingMore,
    hasMoreResumes: resumes.length < resumeCount,
    loadMoreResumes,
    saveResume,
    updateResume,
    deleteResume,
    getResumeById,
    getLatestResume,
    upsertResume,
  };
}
