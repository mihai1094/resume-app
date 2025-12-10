"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileStepperNav } from "./mobile-stepper-nav";
import { useState, useEffect, useRef } from "react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateId } from "@/lib/constants/templates";

interface Section {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SectionWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
  currentIndex: number;
  totalSections: number;
  canGoNext: boolean;
  canGoPrevious?: boolean;
  onNext: () => void;
  onPrevious?: () => void;
  nextLabel?: string;
  onSave?: () => void;
  isSaving?: boolean;
  sectionErrors?: string[];
  saveLabel?: string;
  sections?: Section[];
  onForceNext?: () => void;
  activeSectionId?: string;
  onSectionChange?: (sectionId: string) => void;
  isSectionComplete?: (sectionId: string) => boolean;
  completedFields?: number;
  totalFields?: number;
  resumeData?: ResumeData;
  templateId?: TemplateId;
  onPreviewClick?: () => void;
}

export function SectionWrapper({
  title,
  description,
  children,
  currentIndex,
  totalSections,
  canGoNext,
  canGoPrevious = false,
  onNext,
  onPrevious,
  nextLabel = "Next",
  onSave,
  isSaving = false,
  sectionErrors = [],
  saveLabel = "Save",
  sections = [],
  onForceNext,
  activeSectionId,
  onSectionChange,
  isSectionComplete,
  resumeData,
  templateId,
  onPreviewClick,
}: SectionWrapperProps) {
  const [showWarningBanner, setShowWarningBanner] = useState(false);
  const warningBannerRef = useRef<HTMLDivElement>(null);
  const hasErrors = sectionErrors.length > 0;

  // Show banner when errors appear, hide when they're resolved
  // Auto-scroll to warning banner first, or to input errors if banner not visible
  useEffect(() => {
    if (hasErrors) {
      setShowWarningBanner(true);
      // Auto-scroll after a short delay to let the DOM update
      const timeoutId = setTimeout(() => {
        // First try to scroll to the warning banner
        if (warningBannerRef.current) {
          warningBannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // Fallback: scroll to first error field if banner not visible
          const firstErrorField = document.querySelector('[aria-invalid="true"]');
          if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (firstErrorField as HTMLElement).focus?.();
          }
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    } else {
      setShowWarningBanner(false);
    }
  }, [hasErrors]);

  // Hide banner when section changes
  useEffect(() => {
    setShowWarningBanner(false);
  }, [activeSectionId]);

  const handleFixNow = () => {
    // Scroll to first error field
    const firstErrorField = document.querySelector('[aria-invalid="true"]');
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (firstErrorField as HTMLElement).focus?.();
    }
  };

  const handleContinueAnyway = () => {
    setShowWarningBanner(false);
    onForceNext?.();
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="sr-only" aria-live="assertive">
        {sectionErrors?.join(". ")}
      </div>

      {/* Mobile: Compact Stepper Navigation */}
      {sections.length > 0 && onSectionChange && activeSectionId && isSectionComplete && onPrevious && (
        <MobileStepperNav
          sections={sections}
          activeSection={activeSectionId}
          onSectionChange={onSectionChange}
          isSectionComplete={isSectionComplete}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          onPrevious={onPrevious}
          onNext={onNext}
        />
      )}

      {/* Desktop: Section Header */}
      <div className="hidden lg:block mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-base text-muted-foreground mt-2">{description}</p>
      </div>

      {/* Form Content */}
      <div className="space-y-8 min-h-[400px]">{children}</div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-4 mt-12 pt-6 border-t w-full">
        {/* Progress Dots - Desktop only (mobile has horizontal nav) */}
        <div className="hidden lg:flex gap-1.5 justify-center">
          {Array.from({ length: totalSections }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                i === currentIndex
                  ? "bg-primary scale-110"
                  : i < currentIndex
                  ? "bg-primary/40"
                  : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Validation Warning Banner */}
        {showWarningBanner && hasErrors && onForceNext && (
          <div
            ref={warningBannerRef}
            className="relative rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4 animate-in slide-in-from-top-2 duration-200"
          >
            <button
              onClick={() => setShowWarningBanner(false)}
              className="absolute top-2 right-2 p-1 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-400"
              aria-label="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                    Some fields need attention
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {sectionErrors.slice(0, 3).map((error, i) => (
                      <li key={i} className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-amber-500" />
                        {error}
                      </li>
                    ))}
                    {sectionErrors.length > 3 && (
                      <li className="text-sm text-amber-600 dark:text-amber-400">
                        +{sectionErrors.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFixNow}
                    className="border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200"
                  >
                    Fix Now
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleContinueAnyway}
                    className="text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                  >
                    Continue Anyway
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Desktop only (mobile uses MobileBottomBar) */}
        <div className="hidden lg:flex flex-row gap-3 w-full">
          {canGoPrevious && onPrevious && (
            <Button
              onClick={onPrevious}
              variant="outline"
              size="lg"
              className="h-12 text-base font-semibold"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          )}
          <Button
            onClick={onNext}
            size="lg"
            className="w-auto ml-auto h-12 text-base font-semibold"
          >
            {nextLabel}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
