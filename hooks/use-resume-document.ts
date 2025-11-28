"use client";

import { useEffect, useState } from "react";
import { ResumeData } from "@/lib/types/resume";
import { firestoreService } from "@/lib/services/firestore";

interface ResumeDocument {
  id: string;
  name: string;
  templateId: string;
  data: ResumeData;
}

export function useResumeDocument(userId: string | null, resumeId: string | null) {
  const [resume, setResume] = useState<ResumeDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !resumeId) {
      setResume(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    firestoreService
      .getResumeById(userId, resumeId)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setResume({
            id: result.id,
            name: result.name,
            templateId: result.templateId,
            data: result.data,
          });
        } else {
          setResume(null);
          setError("Resume not found");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setResume(null);
        setError(err instanceof Error ? err.message : "Failed to load resume");
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId, resumeId]);

  return { resume, isLoading, error };
}
