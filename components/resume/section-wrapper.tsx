"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileStepperNav } from "./mobile-stepper-nav";

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
  onSkip?: () => void;
  isSaving?: boolean;
  sectionErrors?: string[];
  saveLabel?: string;
  skipLabel?: string;
  sections?: Section[];
  activeSectionId?: string;
  onSectionChange?: (sectionId: string) => void;
  isSectionComplete?: (sectionId: string) => boolean;
  completedFields?: number;
  totalFields?: number;
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
  onSkip,
  isSaving = false,
  sectionErrors = [],
  saveLabel = "Save",
  skipLabel = "Skip for now",
  sections = [],
  activeSectionId,
  onSectionChange,
  isSectionComplete,
}: SectionWrapperProps) {
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
      <div className="hidden lg:flex mb-8 items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-base text-muted-foreground mt-2">{description}</p>
        </div>
        {onSkip && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-primary hover:text-primary bg-primary/10 hover:bg-primary/15 border border-primary/20 px-3"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            {skipLabel}
          </Button>
        )}
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

        {/* Mobile: Skip button if available */}
        {onSkip && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="lg:hidden text-muted-foreground hover:text-foreground mx-auto"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            {skipLabel}
          </Button>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {onSave && (
            <Button
              variant="outline"
              onClick={onSave}
              disabled={isSaving}
              size="lg"
              className="w-full sm:flex-1 h-12"
            >
              {isSaving ? "Saving..." : saveLabel}
            </Button>
          )}
          <Button
            onClick={onNext}
            disabled={!canGoNext}
            size="lg"
            className={cn(
              "w-full h-12 text-base font-semibold",
              onSave ? "sm:flex-1" : "sm:w-auto sm:ml-auto"
            )}
          >
            {nextLabel}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
