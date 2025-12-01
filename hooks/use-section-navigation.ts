"use client";

import { useCallback } from "react";
import { ResumeData } from "@/lib/types/resume";
import { SectionId } from "@/lib/constants/defaults";
import { toast } from "sonner";

// Sections configuration
export const RESUME_SECTIONS: Array<{
  id: SectionId;
  label: string;
  shortLabel: string;
}> = [
  { id: "personal", label: "Personal Information", shortLabel: "Personal" },
  { id: "experience", label: "Work Experience", shortLabel: "Experience" },
  { id: "education", label: "Education", shortLabel: "Education" },
  { id: "skills", label: "Skills & Expertise", shortLabel: "Skills" },
  { id: "languages", label: "Languages", shortLabel: "Languages" },
  { id: "courses", label: "Courses & Certifications", shortLabel: "Courses" },
  { id: "hobbies", label: "Hobbies & Interests", shortLabel: "Hobbies" },
  { id: "extra", label: "Extra-curricular Activities", shortLabel: "Extra" },
];

interface UseSectionNavigationProps {
  resumeData: ResumeData;
  currentSection: SectionId;
  onSectionChange: (section: SectionId) => void;
  validationErrors: Array<{ field: string; message: string }>;
  mapFieldToSection: (field: string) => string;
}

/**
 * Hook for managing section navigation logic
 * Handles completion tracking, error routing, and navigation validation
 */
export function useSectionNavigation({
  resumeData,
  currentSection,
  onSectionChange,
  validationErrors,
  mapFieldToSection,
}: UseSectionNavigationProps) {
  // Check if a section is complete
  const isSectionComplete = useCallback(
    (sectionId: SectionId): boolean => {
      switch (sectionId) {
        case "personal":
          return !!(
            resumeData.personalInfo.firstName &&
            resumeData.personalInfo.lastName &&
            resumeData.personalInfo.email &&
            resumeData.personalInfo.phone
          );
        case "experience":
          return resumeData.workExperience.length > 0;
        case "education":
          return resumeData.education.length > 0;
        case "skills":
          return resumeData.skills.length > 0;
        case "languages":
          return (resumeData.languages?.length || 0) > 0;
        case "courses":
          return (resumeData.courses?.length || 0) > 0;
        case "hobbies":
          return (resumeData.hobbies?.length || 0) > 0;
        case "extra":
          return (resumeData.extraCurricular?.length || 0) > 0;
        default:
          return false;
      }
    },
    [resumeData]
  );

  // Get errors for a section
  const getSectionErrors = useCallback(
    (section: SectionId): string[] =>
      validationErrors
        .filter((err) => mapFieldToSection(err.field) === section)
        .map((err) => err.message),
    [validationErrors, mapFieldToSection]
  );

  const currentIndex = RESUME_SECTIONS.findIndex((s) => s.id === currentSection);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < RESUME_SECTIONS.length - 1;
  const isLastSection = currentIndex === RESUME_SECTIONS.length - 1;

  const currentErrors = getSectionErrors(currentSection);
  const isCurrentSectionValid = currentErrors.length === 0;

  // Navigate to previous section
  const goToPrevious = useCallback(() => {
    if (canGoPrevious) {
      onSectionChange(RESUME_SECTIONS[currentIndex - 1].id);
    }
  }, [canGoPrevious, currentIndex, onSectionChange]);

  // Navigate to next section
  const goToNext = useCallback(() => {
    if (!isCurrentSectionValid) {
      toast.error("Finish required fields before moving on.");
      return;
    }

    if (canGoNext) {
      onSectionChange(RESUME_SECTIONS[currentIndex + 1].id);
    }
  }, [isCurrentSectionValid, canGoNext, currentIndex, onSectionChange]);

  // Navigate to section with validation
  const goToSection = useCallback(
    (section: string) => {
      if (RESUME_SECTIONS.some((s) => s.id === section)) {
        onSectionChange(section as SectionId);
      }
    },
    [onSectionChange]
  );

  // Calculate progress
  const completedSections = RESUME_SECTIONS.filter((s) =>
    isSectionComplete(s.id)
  ).length;
  const progressPercentage = (completedSections / RESUME_SECTIONS.length) * 100;

  return {
    // Navigation state
    currentIndex,
    canGoPrevious,
    canGoNext,
    isLastSection,
    progressPercentage,
    completedSections,
    totalSections: RESUME_SECTIONS.length,

    // Validation state
    currentErrors,
    isCurrentSectionValid,

    // Navigation methods
    goToPrevious,
    goToNext,
    goToSection,

    // Utility methods
    isSectionComplete,
    getSectionErrors,
  };
}
