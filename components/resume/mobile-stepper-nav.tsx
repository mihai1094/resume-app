"use client";

import { useRef, useEffect } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Section {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MobileStepperNavProps {
  sections: Section[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  isSectionComplete: (section: string) => boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function MobileStepperNav({
  sections,
  activeSection,
  onSectionChange,
  isSectionComplete,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: MobileStepperNavProps) {
  const activeIndex = sections.findIndex((s) => s.id === activeSection);
  const activeSection_ = sections[activeIndex];
  const ActiveIcon = activeSection_?.icon;

  // Calculate completion stats
  const completedCount = sections.filter((s) => isSectionComplete(s.id)).length;
  const progressPercent = Math.round((completedCount / sections.length) * 100);

  return (
    <div className="lg:hidden mb-4">
      {/* Compact stepper showing all sections as dots */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Previous button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="h-8 w-8 shrink-0"
          aria-label="Previous section"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Dots stepper */}
        <div
          className="flex items-center justify-center gap-1.5 flex-1"
          role="tablist"
          aria-label="Resume sections"
        >
          {sections.map((section, index) => {
            const isActive = section.id === activeSection;
            const isComplete = isSectionComplete(section.id);
            const SectionIcon = section.icon;

            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                role="tab"
                aria-selected={isActive}
                aria-label={`${section.label}${isComplete ? ' (complete)' : ''}`}
                className={cn(
                  "relative transition-all duration-200 rounded-full",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                  isActive
                    ? "w-8 h-8 bg-primary shadow-md"
                    : isComplete
                    ? "w-3 h-3 bg-green-500 hover:scale-125"
                    : "w-3 h-3 bg-muted hover:bg-muted-foreground/30 hover:scale-125"
                )}
              >
                {isActive && (
                  <SectionIcon className="w-4 h-4 text-primary-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
                {!isActive && isComplete && (
                  <Check className="w-2 h-2 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          disabled={!canGoNext}
          className="h-8 w-8 shrink-0"
          aria-label="Next section"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Current section info bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {ActiveIcon && (
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <ActiveIcon className="w-3.5 h-3.5 text-primary" />
            </div>
          )}
          <div>
            <h2 className="font-semibold text-sm leading-tight">
              {activeSection_?.label}
            </h2>
            <p className="text-xs text-muted-foreground">
              Step {activeIndex + 1} of {sections.length}
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className={cn(
              "text-sm font-semibold",
              progressPercent === 100 ? "text-green-600" : "text-foreground"
            )}>
              {progressPercent}%
            </span>
            <p className="text-xs text-muted-foreground">complete</p>
          </div>
          {/* Mini progress ring */}
          <div className="relative w-9 h-9">
            <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                className="stroke-muted"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                className={cn(
                  "transition-all duration-500",
                  progressPercent === 100 ? "stroke-green-500" : "stroke-primary"
                )}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${progressPercent}, 100`}
              />
            </svg>
            {progressPercent === 100 && (
              <Check className="w-4 h-4 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
