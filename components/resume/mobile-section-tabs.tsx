"use client";

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

  return (
    <div className="lg:hidden sticky top-[57px] z-40 bg-background border-b shadow-sm -mx-4 px-4 mb-4">
      <Card className="p-3 border-0 shadow-none">
        {/* Dropdown Selector */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1">
            <Select value={activeSection} onValueChange={onSectionChange}>
              <SelectTrigger className="w-full h-auto py-2.5 text-left">
                <div className="flex items-center gap-2 w-full">
                  {SectionIcon && <SectionIcon className="w-5 h-5 flex-shrink-0" />}
                  <div className="flex-1 font-medium">
                    {currentSection?.label}
                  </div>
                  {isComplete && (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                {/* Core Sections */}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Core Sections
                </div>
                {coreSections.map((section) => {
                  const Icon = section.icon;
                  const complete = isSectionComplete(section.id);
                  return (
                    <SelectItem key={section.id} value={section.id}>
                      <div className="flex items-center gap-2 py-0.5">
                        <Icon className="w-4 h-4" />
                        <span className="flex-1">{section.label}</span>
                        {complete && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </SelectItem>
                  );
                })}

                {/* Optional Sections */}
                {optionalSections.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                      Optional Sections
                    </div>
                    {optionalSections.map((section) => {
                      const Icon = section.icon;
                      const complete = isSectionComplete(section.id);
                      return (
                        <SelectItem key={section.id} value={section.id}>
                          <div className="flex items-center gap-2 py-0.5">
                            <Icon className="w-4 h-4" />
                            <span className="flex-1">{section.label}</span>
                            {complete && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Navigation Arrows + Progress */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="h-8"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="text-xs font-medium text-muted-foreground">
            {currentIndex + 1} / {sections.length}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === sections.length - 1}
            className="h-8"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
