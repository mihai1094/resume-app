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

    // Load saved cover letters for user from Firestore
    useEffect(() => {
        if (!userId) {
            setCoverLetters([]);
            setIsLoading(false);
            return;
        }

        const loadCoverLetters = async () => {
            setIsLoading(true);
            const firestoreCoverLetters = await firestoreService.getSavedCoverLetters(userId);

            // Convert Firestore timestamps to ISO strings
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
            setIsLoading(false);
        };

        loadCoverLetters();
    }, [userId]);

    // Save a cover letter
    const saveCoverLetter = useCallback(
        async (name: string, data: CoverLetterData) => {
            if (!userId) return null;

            const newLetterId = `cover-letter-${Date.now()}`;

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
        },
        [userId]
    );

    // Update a cover letter
    const updateCoverLetter = useCallback(
        async (id: string, updates: Partial<SavedCoverLetter>) => {
            if (!userId) return false;

            // Convert SavedCoverLetter updates to Firestore format (remove string dates)
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
        },
        [userId]
    );

    // Delete a cover letter
    const deleteCoverLetter = useCallback(
        async (id: string) => {
            if (!userId) return false;

            const success = await firestoreService.deleteCoverLetter(userId, id);

            if (success) {
                setCoverLetters((prev) => prev.filter((letter) => letter.id !== id));
                return true;
            }

            return false;
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
