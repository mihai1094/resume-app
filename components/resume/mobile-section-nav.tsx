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

interface MobileSectionNavProps {
  sections: Section[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  isSectionComplete: (section: string) => boolean;
}

export function MobileSectionNav({
  sections,
  activeSection,
  onSectionChange,
  isSectionComplete,
}: MobileSectionNavProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll active section into view
  useEffect(() => {
    if (activeButtonRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = activeButtonRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      // Calculate if button is outside visible area
      const isOutsideLeft = buttonRect.left < containerRect.left;
      const isOutsideRight = buttonRect.right > containerRect.right;

      if (isOutsideLeft || isOutsideRight) {
        button.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [activeSection]);

  return (
    <div className="lg:hidden w-full mb-6">
      {/* Horizontal scrollable nav */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4"
        role="tablist"
        aria-label="Resume sections"
      >
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const isComplete = isSectionComplete(section.id);
          const SectionIcon = section.icon;

          return (
            <button
              key={section.id}
              ref={isActive ? activeButtonRef : null}
              onClick={() => onSectionChange(section.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`section-${section.id}`}
              className={cn(
                "relative flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <SectionIcon className="w-4 h-4" />
              <span>{section.shortLabel}</span>
              {isComplete && !isActive && (
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-background">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              {isComplete && isActive && (
                <Check className="w-3.5 h-3.5 text-primary-foreground/80" />
              )}
            </button>
          );
        })}
      </div>

      {/* Scroll hint gradient overlays */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-background to-transparent lg:hidden" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent lg:hidden" />
    </div>
  );
}
