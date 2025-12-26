"use client";

import { useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
}: MobileStepperNavProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);
  const activeIndex = sections.findIndex((s) => s.id === activeSection);

  // Calculate completion stats
  const completedCount = sections.filter((s) => isSectionComplete(s.id)).length;
  const progressPercent = Math.round((completedCount / sections.length) * 100);

  // Auto-scroll to active section
  useEffect(() => {
    if (activeButtonRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = activeButtonRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      // Center the active button in the container
      const scrollLeft = button.offsetLeft - (containerRect.width / 2) + (buttonRect.width / 2);
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeSection]);

  return (
    <div className="lg:hidden mb-4 -mx-4">
      {/* Horizontal scrolling tab bar with fade indicators */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide"
          role="tablist"
          aria-label="Resume sections"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
        {sections.map((section, index) => {
          const isActive = section.id === activeSection;
          const isComplete = isSectionComplete(section.id);
          const SectionIcon = section.icon;

          return (
            <button
              key={section.id}
              ref={isActive ? activeButtonRef : null}
              onClick={() => onSectionChange(section.id)}
              role="tab"
              aria-selected={isActive}
              aria-label={`${section.label}${isComplete ? " (complete)" : ""}`}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-full whitespace-nowrap transition-all duration-200 min-h-[48px]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : isComplete
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                  : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted"
              )}
            >
              <div className="relative">
                <SectionIcon className="w-4 h-4" />
                {!isActive && isComplete && (
                  <Check className="w-3 h-3 absolute -top-1 -right-1 text-green-600 dark:text-green-400" />
                )}
              </div>
              <span className="text-sm font-medium">{section.shortLabel}</span>
            </button>
          );
        })}
        </div>
        {/* Fade gradient on right edge to indicate more content */}
        <div className="absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      {/* Progress bar */}
      <div className="px-4 flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 rounded-full",
              progressPercent === 100 ? "bg-green-500" : "bg-primary"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className={cn(
          "text-xs font-medium tabular-nums",
          progressPercent === 100 ? "text-green-600" : "text-muted-foreground"
        )}>
          {activeIndex + 1}/{sections.length}
        </span>
      </div>
    </div>
  );
}
