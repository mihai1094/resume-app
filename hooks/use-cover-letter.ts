"use client";

import { useState, useCallback } from "react";
import {
  CoverLetterData,
  CoverLetterRecipient,
  DEFAULT_COVER_LETTER,
  CoverLetterTemplateId,
} from "@/lib/types/cover-letter";
import { generateId } from "@/lib/utils";
import { PersonalInfo } from "@/lib/types/resume";
import { validators } from "@/lib/validation";

// Create initial cover letter with generated ID and timestamps
function createInitialCoverLetter(): CoverLetterData {
  const now = new Date().toISOString();
  return {
    ...DEFAULT_COVER_LETTER,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
}

export function useCoverLetter(personalInfo?: PersonalInfo) {
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>(() => {
    const initial = createInitialCoverLetter();
    // Pre-fill from personal info if available
    if (personalInfo) {
      initial.senderName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
      initial.senderEmail = personalInfo.email || "";
      initial.senderPhone = personalInfo.phone || "";
      initial.senderLocation = personalInfo.location || "";
      initial.senderLinkedin = personalInfo.linkedin || "";
      initial.senderWebsite = personalInfo.website || "";
    }
    return initial;
  });
  const [isDirty, setIsDirty] = useState(false);

  // Update the timestamp whenever data changes
  const updateWithTimestamp = useCallback((updates: Partial<CoverLetterData>) => {
    setCoverLetterData((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
    setIsDirty(true);
  }, []);

  // Job info updates
  const updateJobInfo = useCallback(
    (updates: { jobTitle?: string; jobReference?: string; date?: string }) => {
      updateWithTimestamp(updates);
    },
    [updateWithTimestamp]
  );

  // Recipient updates
  const updateRecipient = useCallback(
    (updates: Partial<CoverLetterRecipient>) => {
      setCoverLetterData((prev) => ({
        ...prev,
        recipient: { ...prev.recipient, ...updates },
        updatedAt: new Date().toISOString(),
      }));
      setIsDirty(true);
    },
    []
  );

  // Sender info updates
  const updateSenderInfo = useCallback(
    (updates: {
      senderName?: string;
      senderEmail?: string;
      senderPhone?: string;
      senderLocation?: string;
      senderLinkedin?: string;
      senderWebsite?: string;
    }) => {
      updateWithTimestamp(updates);
    },
    [updateWithTimestamp]
  );

  // Sync sender info from personal info (useful when loading a resume)
  const syncFromPersonalInfo = useCallback((personalInfo: PersonalInfo) => {
    setCoverLetterData((prev) => ({
      ...prev,
      senderName: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
      senderEmail: personalInfo.email || "",
      senderPhone: personalInfo.phone || "",
      senderLocation: personalInfo.location || "",
      senderLinkedin: personalInfo.linkedin || "",
      senderWebsite: personalInfo.website || "",
      updatedAt: new Date().toISOString(),
    }));
    setIsDirty(true);
  }, []);

  // Salutation updates
  const updateSalutation = useCallback(
    (salutation: string) => {
      updateWithTimestamp({ salutation });
    },
    [updateWithTimestamp]
  );

  // Opening paragraph update
  const updateOpeningParagraph = useCallback(
    (openingParagraph: string) => {
      updateWithTimestamp({ openingParagraph });
    },
    [updateWithTimestamp]
  );

  // Body paragraphs updates
  const updateBodyParagraph = useCallback(
    (index: number, content: string) => {
      setCoverLetterData((prev) => {
        const newBodyParagraphs = [...prev.bodyParagraphs];
        newBodyParagraphs[index] = content;
        return {
          ...prev,
          bodyParagraphs: newBodyParagraphs,
          updatedAt: new Date().toISOString(),
        };
      });
      setIsDirty(true);
    },
    []
  );

  const addBodyParagraph = useCallback(() => {
    setCoverLetterData((prev) => ({
      ...prev,
      bodyParagraphs: [...prev.bodyParagraphs, ""],
      updatedAt: new Date().toISOString(),
    }));
    setIsDirty(true);
  }, []);

  const removeBodyParagraph = useCallback((index: number) => {
    setCoverLetterData((prev) => ({
      ...prev,
      bodyParagraphs: prev.bodyParagraphs.filter((_, i) => i !== index),
      updatedAt: new Date().toISOString(),
    }));
    setIsDirty(true);
  }, []);

  const reorderBodyParagraphs = useCallback(
    (startIndex: number, endIndex: number) => {
      setCoverLetterData((prev) => {
        const newBodyParagraphs = [...prev.bodyParagraphs];
        const [removed] = newBodyParagraphs.splice(startIndex, 1);
        newBodyParagraphs.splice(endIndex, 0, removed);
        return {
          ...prev,
          bodyParagraphs: newBodyParagraphs,
          updatedAt: new Date().toISOString(),
        };
      });
      setIsDirty(true);
    },
    []
  );

  // Closing paragraph update
  const updateClosingParagraph = useCallback(
    (closingParagraph: string) => {
      updateWithTimestamp({ closingParagraph });
    },
    [updateWithTimestamp]
  );

  // Sign off update
  const updateSignOff = useCallback(
    (signOff: string) => {
      updateWithTimestamp({ signOff });
    },
    [updateWithTimestamp]
  );

  // Template selection
  const updateTemplate = useCallback(
    (templateId: CoverLetterTemplateId) => {
      updateWithTimestamp({ templateId });
    },
    [updateWithTimestamp]
  );

  // Tone selection
  const updateTone = useCallback(
    (tone: CoverLetterData["tone"]) => {
      updateWithTimestamp({ tone });
    },
    [updateWithTimestamp]
  );

  // Reset to initial state
  const resetCoverLetter = useCallback(() => {
    const initial = createInitialCoverLetter();
    if (personalInfo) {
      initial.senderName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
      initial.senderEmail = personalInfo.email || "";
      initial.senderPhone = personalInfo.phone || "";
      initial.senderLocation = personalInfo.location || "";
      initial.senderLinkedin = personalInfo.linkedin || "";
      initial.senderWebsite = personalInfo.website || "";
    }
    setCoverLetterData(initial);
    setIsDirty(false);
  }, [personalInfo]);

  // Load cover letter data
  const loadCoverLetter = useCallback((data: CoverLetterData) => {
    setCoverLetterData(data);
    setIsDirty(false);
  }, []);

  // Validate cover letter
  const validateCoverLetter = useCallback((): {
    valid: boolean;
    errors: Array<{ field: string; message: string }>;
  } => {
    const errors: Array<{ field: string; message: string }> = [];
    // Only enforce the essentials (contact info + narrative structure) to keep the flow lightweight.
    const trimmedName = coverLetterData.senderName.trim();
    const trimmedEmail = coverLetterData.senderEmail.trim();
    const trimmedOpening = coverLetterData.openingParagraph.trim();
    const hasBodyContent = coverLetterData.bodyParagraphs.some((p) => p.trim());
    const trimmedClosing = coverLetterData.closingParagraph.trim();

    if (!trimmedName) {
      errors.push({ field: "senderName", message: "Add your full name so hiring managers know who wrote this." });
    }

    if (!trimmedEmail) {
      errors.push({ field: "senderEmail", message: "Add a contact email so employers can reach you." });
    } else {
      const emailError = validators.email(trimmedEmail);
      if (emailError) {
        errors.push({ field: "senderEmail", message: emailError });
      }
    }

    if (!trimmedOpening) {
      errors.push({
        field: "openingParagraph",
        message: "Start with a short opening that states your intent and value.",
      });
    }

    if (!hasBodyContent) {
      errors.push({
        field: "bodyParagraphs",
        message: "Include at least one paragraph that highlights your experience.",
      });
    }

    if (!trimmedClosing) {
      errors.push({
        field: "closingParagraph",
        message: "Wrap up with a closing paragraph and call to action.",
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }, [coverLetterData]);

  // Calculate completion percentage
  const completionPercentage = useCallback((): number => {
    const requiredFields = [
      coverLetterData.senderName.trim(),
      coverLetterData.senderEmail.trim() &&
        !validators.email(coverLetterData.senderEmail.trim()),
      coverLetterData.openingParagraph.trim(),
      coverLetterData.bodyParagraphs.some((p) => p.trim()),
      coverLetterData.closingParagraph.trim(),
    ];

    const filledCount = requiredFields.filter(Boolean).length;
    return Math.round((filledCount / requiredFields.length) * 100);
  }, [coverLetterData]);

  return {
    coverLetterData,
    isDirty,
    // Job info
    updateJobInfo,
    // Recipient
    updateRecipient,
    // Sender info
    updateSenderInfo,
    syncFromPersonalInfo,
    // Content
    updateSalutation,
    updateOpeningParagraph,
    updateBodyParagraph,
    addBodyParagraph,
    removeBodyParagraph,
    reorderBodyParagraphs,
    updateClosingParagraph,
    updateSignOff,
    // Settings
    updateTemplate,
    updateTone,
    // Actions
    resetCoverLetter,
    loadCoverLetter,
    validateCoverLetter,
    completionPercentage,
  };
}






