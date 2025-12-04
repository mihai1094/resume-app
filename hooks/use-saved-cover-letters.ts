import { useState, useEffect, useCallback } from "react";
import { CoverLetterData, SavedCoverLetter } from "@/lib/types/cover-letter";
import { firestoreService, PlanId, PlanLimitError } from "@/lib/services/firestore";
import { useUser } from "./use-user";

export function useSavedCoverLetters(userId: string | null) {
    const [coverLetters, setCoverLetters] = useState<SavedCoverLetter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        if (userId) {
            setIsLoading(true);
            try {
                const unsubscribe = firestoreService.subscribeToSavedCoverLetters(
                    userId,
                    (letters) => {
                        const mapped: SavedCoverLetter[] = letters.map((letter) => ({
                            id: letter.id,
                            name: letter.name,
                            jobTitle: letter.jobTitle,
                            companyName: letter.companyName,
                            data: letter.data,
                            createdAt: letter.createdAt.toDate().toISOString(),
                            updatedAt: letter.updatedAt.toDate().toISOString(),
                        }));
                        setCoverLetters(mapped);
                        setIsLoading(false);
                    }
                );
                return unsubscribe;
            } catch (error) {
                console.error("Failed to subscribe to cover letters:", error);
                setCoverLetters([]);
                setIsLoading(false);
            }
        } else {
            try {
                const localLetters = typeof window !== "undefined"
                    ? window.localStorage.getItem("guest-cover-letters")
                    : null;
                setCoverLetters(localLetters ? JSON.parse(localLetters) : []);
            } catch (error) {
                console.error("Failed to load guest cover letters", error);
                setCoverLetters([]);
            } finally {
                setIsLoading(false);
            }
        }
    }, [userId]);

    // Save a cover letter
    const saveCoverLetter = useCallback(
        async (name: string, data: CoverLetterData) => {
            const newLetterId = `cover-letter-${Date.now()}`;

            if (userId) {
                // Save to Firestore
                try {
                    const success = await firestoreService.saveCoverLetter(
                        userId,
                        newLetterId,
                        name,
                        data,
                        (user?.plan as PlanId) || "free"
                    );

                    if (success === true) {
                        const newLetter: SavedCoverLetter = {
                            id: newLetterId,
                            name,
                            jobTitle: data.jobTitle,
                            companyName: data.recipient.company,
                            data,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        };

                        setCoverLetters((prev) => [newLetter, ...prev]);
                        return newLetter;
                    }

                    if ((success as PlanLimitError)?.code === "PLAN_LIMIT") {
                        throw success;
                    }
                } catch (error) {
                    console.error("Failed to save cover letter:", error);
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
                    if (typeof window !== "undefined") {
                        window.localStorage.setItem("guest-cover-letters", JSON.stringify(updated));
                    }
                    return updated;
                });
                return newLetter;
            }
        },
        [userId]
    );

    // Update a cover letter
    const updateCoverLetter = useCallback(
        async (id: string, updates: Partial<SavedCoverLetter>) => {
            if (userId) {
                // Update in Firestore
                const { createdAt, updatedAt, ...firestoreUpdates } = updates;
                try {
                    const success = await firestoreService.updateCoverLetter(userId, id, firestoreUpdates);

                    if (success) {
                        setCoverLetters((prev) =>
                            prev.map((letter) =>
                                letter.id === id
                                    ? { ...letter, ...updates, updatedAt: new Date().toISOString() }
                                    : letter
                            )
                        );
                        return true;
                    }
                } catch (error) {
                    console.error("Failed to update cover letter:", error);
                }
                return false;
            } else {
                // Update in LocalStorage
                let success = false;
                setCoverLetters((prev) => {
                    const updated = prev.map((letter) => {
                        if (letter.id === id) {
                            success = true;
                            return { ...letter, ...updates, updatedAt: new Date().toISOString() };
                        }
                        return letter;
                    });
                    if (typeof window !== "undefined") {
                        window.localStorage.setItem("guest-cover-letters", JSON.stringify(updated));
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
                        setCoverLetters((prev) => prev.filter((letter) => letter.id !== id));
                        return true;
                    }
                } catch (error) {
                    console.error("Failed to delete cover letter:", error);
                }
                return false;
            } else {
                // Delete from LocalStorage
                setCoverLetters((prev) => {
                    const updated = prev.filter((letter) => letter.id !== id);
                    if (typeof window !== "undefined") {
                        window.localStorage.setItem("guest-cover-letters", JSON.stringify(updated));
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
        isLoading,
        saveCoverLetter,
        updateCoverLetter,
        deleteCoverLetter,
    };
}
