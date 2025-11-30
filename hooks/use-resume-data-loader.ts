import { useState, useEffect, useRef } from "react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateId } from "@/lib/constants/templates";
import { firestoreService } from "@/lib/services/firestore";

interface UseResumeDataLoaderProps {
    resumeId: string | null;
    userId: string | null;
    savedData: ResumeData | null;
    lastSaved: Date | null;
    loadResume: (data: ResumeData) => void;
}

export function useResumeDataLoader({
    resumeId,
    userId,
    savedData,
    lastSaved,
    loadResume,
}: UseResumeDataLoaderProps) {
    const [isInitializing, setIsInitializing] = useState<boolean>(!!resumeId);
    const [resumeLoadError, setResumeLoadError] = useState<string | null>(null);
    const [editingResumeId, setEditingResumeId] = useState<string | null>(resumeId);
    const [editingResumeName, setEditingResumeName] = useState<string | null>(null);
    const [loadedTemplateId, setLoadedTemplateId] = useState<TemplateId | null>(null);

    const hasLoadedInitialData = useRef(false);

    // Load saved data for new resumes
    useEffect(() => {
        if (resumeId) return;
        if (hasLoadedInitialData.current) return;

        const loadNewerVersion = async () => {
            let localStorageTimestamp: number | null = null;
            let firestoreTimestamp: number | null = null;
            let localStorageData = null;
            let firestoreData = null;

            if (savedData) {
                localStorageData = savedData;
                localStorageTimestamp = lastSaved ? lastSaved.getTime() : 0;
            }

            if (userId) {
                const currentResume = await firestoreService.getCurrentResume(userId);
                if (currentResume) {
                    firestoreData = currentResume;
                    firestoreTimestamp = Date.now();
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
        if (!userId) return;
        if (hasLoadedInitialData.current) return;

        const loadExistingResume = async () => {
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
                setResumeLoadError(error instanceof Error ? error.message : "Failed to load resume");
                hasLoadedInitialData.current = true;
                setIsInitializing(false);
            }
        };

        loadExistingResume();
    }, [resumeId, userId, loadResume]);

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
