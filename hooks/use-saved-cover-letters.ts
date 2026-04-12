import { useState, useEffect, useCallback, useRef } from "react";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { CoverLetterData, SavedCoverLetter } from "@/lib/types/cover-letter";
import {
  firestoreService,
  PlanId,
  PlanLimitError,
  SavedCoverLetterFirestore,
} from "@/lib/services/firestore";
import { getTierLimits } from "@/lib/config/credits";
import { useUser } from "./use-user";
import { createPrefixedId } from "@/lib/utils/id";
import { ConflictError } from "@/lib/types/errors";
import { logger } from "@/lib/services/logger";

const SAVED_COVER_LETTERS_PAGE_SIZE = 50;
const savedCoverLettersLogger = logger.child({ module: "UseSavedCoverLetters" });

function mergeUniqueCoverLetters(
  nextItems: SavedCoverLetter[],
  existingItems: SavedCoverLetter[]
): SavedCoverLetter[] {
  const nextIds = new Set(nextItems.map((letter) => letter.id));
  return [...nextItems, ...existingItems.filter((letter) => !nextIds.has(letter.id))];
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

export function useSavedCoverLetters(userId: string | null) {
  const [coverLetters, setCoverLetters] = useState<SavedCoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [coverLetterCount, setCoverLetterCount] = useState(0);
  const [nextPageCursor, setNextPageCursor] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const { user } = useUser();
  const hasLoadedMoreRef = useRef(false);

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      setIsLoadingMore(false);
      setCoverLetterCount(0);
      setNextPageCursor(null);
      hasLoadedMoreRef.current = false;
      let cancelled = false;
      try {
        const unsubscribe = firestoreService.subscribeToSavedCoverLetters(
          userId,
          (letters: SavedCoverLetterFirestore[], meta) => {
            if (cancelled) return;

            const firstPage: SavedCoverLetter[] = letters.map((letter) => ({
              id: letter.id,
              name: letter.name,
              jobTitle: letter.jobTitle,
              companyName: letter.companyName,
              data: letter.data,
              createdAt: timestampToISO(letter.createdAt),
              updatedAt: timestampToISO(letter.updatedAt),
            }));
            setCoverLetters((prev) => mergeUniqueCoverLetters(firstPage, prev));
            setCoverLetterCount((prev) => Math.max(prev, firstPage.length));
            if (!hasLoadedMoreRef.current) {
              setNextPageCursor(meta.lastDoc);
            }
            setIsLoading(false);
          },
          { limitCount: SAVED_COVER_LETTERS_PAGE_SIZE }
        );

        void firestoreService.getSavedCoverLetterCount(userId).then((count) => {
          if (!cancelled) {
            setCoverLetterCount(count);
          }
        });

        return () => {
          cancelled = true;
          unsubscribe();
        };
      } catch (error) {
        savedCoverLettersLogger.error(
          "Failed to subscribe to cover letters",
          error,
          { userId }
        );
        setCoverLetters([]);
        setIsLoading(false);
        setCoverLetterCount(0);
        setNextPageCursor(null);
      }
    } else {
      try {
        const localLetters =
          typeof window !== "undefined"
            ? window.localStorage.getItem("guest-cover-letters")
            : null;
        const parsedLetters = localLetters ? JSON.parse(localLetters) : [];
        setCoverLetters(parsedLetters);
        setCoverLetterCount(parsedLetters.length);
      } catch (error) {
        savedCoverLettersLogger.error(
          "Failed to load guest cover letters",
          error
        );
        setCoverLetters([]);
        setCoverLetterCount(0);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setNextPageCursor(null);
        hasLoadedMoreRef.current = false;
      }
    }
  }, [userId]);

  const loadMoreCoverLetters = useCallback(async () => {
    if (!userId || !nextPageCursor || coverLetters.length >= coverLetterCount) {
      return false;
    }

    setIsLoadingMore(true);
    try {
      hasLoadedMoreRef.current = true;
      const page = await firestoreService.getSavedCoverLettersPage(userId, {
        limitCount: SAVED_COVER_LETTERS_PAGE_SIZE,
        startAfterDoc: nextPageCursor,
      });

      const olderLetters: SavedCoverLetter[] = page.items.map((letter) => ({
        id: letter.id,
        name: letter.name,
        jobTitle: letter.jobTitle,
        companyName: letter.companyName,
        data: letter.data,
        createdAt: timestampToISO(letter.createdAt),
        updatedAt: timestampToISO(letter.updatedAt),
      }));

      setCoverLetters((prev) => mergeUniqueCoverLetters(prev, olderLetters));
      setNextPageCursor(page.lastDoc);
      return true;
    } catch (error) {
      savedCoverLettersLogger.error(
        "Failed to load more cover letters",
        error,
        { userId }
      );
      return false;
    } finally {
      setIsLoadingMore(false);
    }
  }, [coverLetterCount, coverLetters.length, nextPageCursor, userId]);

  // Save a cover letter
  const saveCoverLetter = useCallback(
    async (name: string, data: CoverLetterData) => {
      // Use safe ID utility for collision-resistant IDs
      const newLetterId = createPrefixedId("cover-letter");
      const plan = (user?.plan as PlanId) || "free";

      if (userId) {
        // Save to Firestore
        try {
          const limit = getTierLimits(plan).maxCoverLetters;

          if (!isLoading && coverLetterCount >= limit) {
            throw {
              code: "PLAN_LIMIT",
              limit,
              current: coverLetterCount,
            } satisfies PlanLimitError;
          }

          const success = await firestoreService.saveCoverLetter(
            userId,
            newLetterId,
            name,
            data,
            plan,
            { skipLimitCheck: !isLoading }
          );

          if (success && "updatedAt" in success) {
            const newLetter: SavedCoverLetter = {
              id: newLetterId,
              name,
              jobTitle: data.jobTitle,
              companyName: data.recipient.company,
              data,
              createdAt: success.createdAt ?? success.updatedAt,
              updatedAt: success.updatedAt,
            };

            setCoverLetters((prev) => [newLetter, ...prev]);
            setCoverLetterCount((prev) => prev + 1);
            return newLetter;
          }

          if ((success as PlanLimitError)?.code === "PLAN_LIMIT") {
            throw success;
          }
        } catch (error) {
          savedCoverLettersLogger.error("Failed to save cover letter", error, {
            userId,
          });
          throw error;
        }
        return null;
      } else {
        // Save to LocalStorage
        const newLetter: SavedCoverLetter = {
          id: newLetterId,
          name,
          jobTitle: data.jobTitle,
          companyName: data.recipient.company,
          data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setCoverLetters((prev) => {
          const updated = [newLetter, ...prev];
          setCoverLetterCount(updated.length);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              "guest-cover-letters",
              JSON.stringify(updated)
            );
          }
          return updated;
        });
        return newLetter;
      }
    },
    [coverLetterCount, isLoading, userId, user?.plan]
  );

  // Update a cover letter
  const updateCoverLetter = useCallback(
    async (id: string, updates: Partial<SavedCoverLetter>) => {
      if (userId) {
        // Update in Firestore
        const { createdAt: _createdAt, updatedAt: _updatedAt, ...firestoreUpdates } = updates;
        try {
          const result = await firestoreService.updateCoverLetter(
            userId,
            id,
            firestoreUpdates,
            {
              expectedUpdatedAt: updates.updatedAt,
            }
          );

          if (result) {
            setCoverLetters((prev) =>
              prev.map((letter) =>
                letter.id === id
                  ? {
                      ...letter,
                      ...updates,
                      updatedAt: result.updatedAt,
                    }
                  : letter
              )
            );
            return true;
          }
        } catch (error) {
          if (error instanceof ConflictError) {
            throw error;
          }

          savedCoverLettersLogger.error(
            "Failed to update cover letter",
            error,
            {
              userId,
              letterId: id,
            }
          );
        }
        return false;
      } else {
        // Update in LocalStorage
        let success = false;
        setCoverLetters((prev) => {
          const updated = prev.map((letter) => {
            if (letter.id === id) {
              success = true;
              return {
                ...letter,
                ...updates,
                updatedAt: new Date().toISOString(),
              };
            }
            return letter;
          });
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              "guest-cover-letters",
              JSON.stringify(updated)
            );
          }
          return updated;
        });
        return success;
      }
    },
    [userId]
  );

  // Delete a cover letter
  const deleteCoverLetter = useCallback(
    async (id: string) => {
      if (userId) {
        // Delete from Firestore
        try {
          const success = await firestoreService.deleteCoverLetter(userId, id);

          if (success) {
            setCoverLetters((prev) =>
              prev.filter((letter) => letter.id !== id)
            );
            setCoverLetterCount((prev) => Math.max(0, prev - 1));
            return true;
          }
        } catch (error) {
          savedCoverLettersLogger.error(
            "Failed to delete cover letter",
            error,
            {
              userId,
              letterId: id,
            }
          );
        }
        return false;
      } else {
        // Delete from LocalStorage
        setCoverLetters((prev) => {
          const updated = prev.filter((letter) => letter.id !== id);
          setCoverLetterCount(updated.length);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              "guest-cover-letters",
              JSON.stringify(updated)
            );
          }
          return updated;
        });
        return true;
      }
    },
    [userId]
  );

  return {
    coverLetters,
    coverLetterCount,
    isLoading,
    isLoadingMore,
    hasMoreCoverLetters: coverLetters.length < coverLetterCount,
    loadMoreCoverLetters,
    saveCoverLetter,
    updateCoverLetter,
    deleteCoverLetter,
  };
}
