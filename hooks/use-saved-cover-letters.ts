import { useState, useEffect, useCallback } from "react";
import { CoverLetterData } from "@/lib/types/cover-letter";
import { firestoreService } from "@/lib/services/firestore";

export interface SavedCoverLetter {
    id: string;
    name: string;
    jobTitle?: string;
    companyName?: string;
    data: CoverLetterData;
    createdAt: string;
    updatedAt: string;
}

export function useSavedCoverLetters(userId: string | null) {
    const [coverLetters, setCoverLetters] = useState<SavedCoverLetter[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved cover letters
    useEffect(() => {
        const loadCoverLetters = async () => {
            setIsLoading(true);

            if (userId) {
                // Load from Firestore for logged-in users
                const firestoreCoverLetters = await firestoreService.getSavedCoverLetters(userId);
                const letters: SavedCoverLetter[] = firestoreCoverLetters.map((letter) => ({
                    id: letter.id,
                    name: letter.name,
                    jobTitle: letter.jobTitle,
                    companyName: letter.companyName,
                    data: letter.data,
                    createdAt: letter.createdAt.toDate().toISOString(),
                    updatedAt: letter.updatedAt.toDate().toISOString(),
                }));
                setCoverLetters(letters);
            } else {
                // Load from LocalStorage for guests
                try {
                    const localLetters = localStorage.getItem("guest-cover-letters");
                    if (localLetters) {
                        setCoverLetters(JSON.parse(localLetters));
                    } else {
                        setCoverLetters([]);
                    }
                } catch (e) {
                    console.error("Failed to load guest cover letters", e);
                    setCoverLetters([]);
                }
            }

            setIsLoading(false);
        };

        loadCoverLetters();
    }, [userId]);

    // Save a cover letter
    const saveCoverLetter = useCallback(
        async (name: string, data: CoverLetterData) => {
            const newLetterId = `cover-letter-${Date.now()}`;

            if (userId) {
                // Save to Firestore
                const success = await firestoreService.saveCoverLetter(
                    userId,
                    newLetterId,
                    name,
                    data
                );

                if (success) {
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
                    localStorage.setItem("guest-cover-letters", JSON.stringify(updated));
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
                    localStorage.setItem("guest-cover-letters", JSON.stringify(updated));
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
                const success = await firestoreService.deleteCoverLetter(userId, id);

                if (success) {
                    setCoverLetters((prev) => prev.filter((letter) => letter.id !== id));
                    return true;
                }
                return false;
            } else {
                // Delete from LocalStorage
                setCoverLetters((prev) => {
                    const updated = prev.filter((letter) => letter.id !== id);
                    localStorage.setItem("guest-cover-letters", JSON.stringify(updated));
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
