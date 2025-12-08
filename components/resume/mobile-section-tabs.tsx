import * as React from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MobileSectionTabsProps {
  sections: Section[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  isSectionComplete: (section: string) => boolean;
}

export function MobileSectionTabs({
  sections,
  activeSection,
  onSectionChange,
  isSectionComplete,
}: MobileSectionTabsProps) {
  const currentIndex = sections.findIndex((s) => s.id === activeSection);
  const currentSection = sections[currentIndex];
  const isComplete = currentSection ? isSectionComplete(currentSection.id) : false;
  const SectionIcon = currentSection?.icon;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSectionChange(sections[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < sections.length - 1) {
      onSectionChange(sections[currentIndex + 1].id);
    }
  };

  // Core sections (typically filled)
  const coreSectionIds = ["personal", "work", "education", "skills"];
  const coreSections = sections.filter((s) => coreSectionIds.includes(s.id));
  const optionalSections = sections.filter((s) => !coreSectionIds.includes(s.id));

  // Scroll active tab into view
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollContainerRef.current) {
      const activeTab = scrollContainerRef.current.querySelector(
        `[data-section="${activeSection}"]`
      );
      if (activeTab) {
        activeTab.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeSection]);

  return (
    <div className="lg:hidden sticky top-[57px] z-40 bg-background/95 backdrop-blur border-b shadow-sm -mx-4 px-4 mb-4 pt-2">
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-4 px-4"
      >
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = section.id === activeSection;
          const isComplete = isSectionComplete(section.id);

          return (
            <Button
              key={section.id}
              data-section={section.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "flex-shrink-0 h-10 gap-2 rounded-full transition-all",
                isActive ? "shadow-md" : "border-transparent bg-secondary/50 hover:bg-secondary",
                !isActive && isComplete && "text-green-600 dark:text-green-500"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{section.shortLabel || section.label}</span>
              {isComplete && !isActive && (
                <Check className="w-3 h-3 ml-1" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Navigation Arrows + Progress */}
      <div className="flex items-center justify-between gap-2 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="h-10 px-2 min-w-[40px] text-muted-foreground"
          aria-label="Previous section"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="sr-only">Previous</span>
        </Button>

        <div className="flex-1 flex flex-col items-center">
          <span className="text-xs font-semibold">
            {currentSection?.label}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Step {currentIndex + 1} of {sections.length}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex === sections.length - 1}
          className="h-10 px-2 min-w-[40px] text-primary"
          aria-label="Next section"
        >
          <span className="sr-only">Next</span>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
