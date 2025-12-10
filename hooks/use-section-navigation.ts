"use client";

import { useCallback, useMemo } from "react";
import { ResumeData } from "@/lib/types/resume";
import { SectionId, SectionTier, SECTION_TIERS } from "@/lib/constants/defaults";
import { toast } from "sonner";

// Section configuration with tier information
export interface SectionConfig {
  id: SectionId;
  label: string;
  shortLabel: string;
  tier: SectionTier;
}

// All available sections (consolidated from 11 to 8)
export const RESUME_SECTIONS: SectionConfig[] = [
  { id: "personal", label: "Personal Information", shortLabel: "Personal", tier: "essential" },
  { id: "experience", label: "Work Experience", shortLabel: "Experience", tier: "essential" },
  { id: "education", label: "Education", shortLabel: "Education", tier: "essential" },
  { id: "skills", label: "Skills & Expertise", shortLabel: "Skills", tier: "essential" },
  { id: "projects", label: "Projects", shortLabel: "Projects", tier: "recommended" },
  { id: "certifications", label: "Certifications & Courses", shortLabel: "Certs", tier: "recommended" },
  { id: "languages", label: "Languages", shortLabel: "Languages", tier: "optional" },
  { id: "additional", label: "Additional", shortLabel: "More", tier: "optional" },
];

/**
 * Check if a section has data (used for styling/indicators)
 * All sections are always navigable, but this helps show which have content
 */
export function sectionHasData(sectionId: SectionId, resumeData: ResumeData): boolean {
  switch (sectionId) {
    case "personal":
      return !!(resumeData.personalInfo.firstName || resumeData.personalInfo.lastName);
    case "experience":
      return (resumeData.workExperience?.length || 0) > 0;
    case "education":
      return (resumeData.education?.length || 0) > 0;
    case "skills":
      return (resumeData.skills?.length || 0) > 0;
    case "projects":
      return (resumeData.projects?.length || 0) > 0;
    case "certifications":
      return (resumeData.certifications?.length || 0) > 0;
    case "languages":
      return (resumeData.languages?.length || 0) > 0;
    case "additional":
      return (
        (resumeData.extraCurricular?.length || 0) > 0 ||
        (resumeData.hobbies?.length || 0) > 0 ||
        (resumeData.customSections?.length || 0) > 0
      );
    default:
      return false;
  }
}

/**
 * Check if a section should be visible in navigation
 * All sections are always visible so users can navigate to add content
 */
export function isSectionVisible(_sectionId: SectionId, _resumeData: ResumeData): boolean {
  // All sections are always visible - users need to navigate to add content
  return true;
}

/**
 * Get the list of visible sections based on resume data
 */
export function getVisibleSections(resumeData: ResumeData): SectionConfig[] {
  return RESUME_SECTIONS.filter((section) => isSectionVisible(section.id, resumeData));
}

/**
 * Get hidden sections that can be added
 */
export function getHiddenSections(resumeData: ResumeData): SectionConfig[] {
  return RESUME_SECTIONS.filter((section) => !isSectionVisible(section.id, resumeData));
}

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
  // Get visible sections based on data
  const visibleSections = useMemo(
    () => getVisibleSections(resumeData),
    [resumeData]
  );

  // Get hidden sections that can be added
  const hiddenSections = useMemo(
    () => getHiddenSections(resumeData),
    [resumeData]
  );

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
        case "projects":
          return (resumeData.projects?.length || 0) > 0;
        case "certifications":
          return (resumeData.certifications?.length || 0) > 0;
        case "languages":
          return (resumeData.languages?.length || 0) > 0;
        case "additional":
          return (
            (resumeData.extraCurricular?.length || 0) > 0 ||
            (resumeData.hobbies?.length || 0) > 0 ||
            (resumeData.customSections?.some(
              (section) =>
                section.title?.trim() &&
                (section.items?.length || 0) > 0 &&
                section.items?.some((item) => item.title?.trim())
            ) || false)
          );
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

  // Navigation based on visible sections
  const currentIndex = visibleSections.findIndex((s) => s.id === currentSection);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < visibleSections.length - 1;
  const isLastSection = currentIndex === visibleSections.length - 1;

  // Get next section label for better UX
  const nextSectionLabel = useMemo(() => {
    if (currentIndex < visibleSections.length - 1) {
      return visibleSections[currentIndex + 1].shortLabel;
    }
    return null;
  }, [currentIndex, visibleSections]);

  const currentErrors = getSectionErrors(currentSection);
  const isCurrentSectionValid = currentErrors.length === 0;

  // Navigate to previous section
  const goToPrevious = useCallback(() => {
    if (canGoPrevious) {
      onSectionChange(visibleSections[currentIndex - 1].id);
    }
  }, [canGoPrevious, currentIndex, onSectionChange, visibleSections]);

  // Navigate to next section (with validation)
  const goToNext = useCallback(() => {
    if (!isCurrentSectionValid) {
      toast.error("Finish required fields before moving on.");
      return;
    }

    if (canGoNext) {
      onSectionChange(visibleSections[currentIndex + 1].id);
    }
  }, [isCurrentSectionValid, canGoNext, currentIndex, onSectionChange, visibleSections]);

  // Navigate to next section (skip validation - for "Continue Anyway")
  const forceGoToNext = useCallback(() => {
    if (canGoNext) {
      onSectionChange(visibleSections[currentIndex + 1].id);
    }
  }, [canGoNext, currentIndex, onSectionChange, visibleSections]);

  // Navigate to section with validation
  const goToSection = useCallback(
    (section: string) => {
      if (visibleSections.some((s) => s.id === section)) {
        onSectionChange(section as SectionId);
      }
    },
    [onSectionChange, visibleSections]
  );

  // Calculate progress based on visible sections
  const completedSections = visibleSections.filter((s) =>
    isSectionComplete(s.id)
  ).length;
  const progressPercentage = (completedSections / visibleSections.length) * 100;

  return {
    // Navigation state
    currentIndex,
    canGoPrevious,
    canGoNext,
    isLastSection,
    progressPercentage,
    completedSections,
    totalSections: visibleSections.length,
    nextSectionLabel,

    // Section visibility
    visibleSections,
    hiddenSections,

    // Validation state
    currentErrors,
    isCurrentSectionValid,

    // Navigation methods
    goToPrevious,
    goToNext,
    forceGoToNext,
    goToSection,

    // Utility methods
    isSectionComplete,
    getSectionErrors,
  };
}
