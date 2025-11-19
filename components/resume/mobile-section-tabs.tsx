"use client";

import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
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
  return (
    <div className="lg:hidden mb-4">
      <Card className="p-2">
        <nav className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] touch-pan-x">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            const isComplete = isSectionComplete(section.id);
            const SectionIcon = section.icon;

            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg text-xs transition-all shrink-0 min-w-[70px] touch-manipulation",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "active:bg-muted text-muted-foreground active:text-foreground"
                )}
                title={section.shortLabel}
              >
                <div className="relative">
                  <SectionIcon className="w-5 h-5" />
                  {isComplete && (
                    <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium text-center leading-tight">
                  {section.shortLabel}
                </span>
              </button>
            );
          })}
        </nav>
      </Card>
    </div>
  );
}

