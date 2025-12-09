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
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SectionWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
  currentIndex: number;
  totalSections: number;
  canGoNext: boolean;
  onNext: () => void;
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
}

export function SectionWrapper({
  title,
  description,
  children,
  currentIndex,
  totalSections,
  canGoNext,
  onNext,
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
}: SectionWrapperProps) {
  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="sr-only" aria-live="assertive">
        {sectionErrors?.join(". ")}
      </div>
      {/* Section Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1">
          {sections.length > 0 && onSectionChange && activeSectionId ? (
            <>
              {/* Mobile: Dropdown */}
              <div className="lg:hidden">
                <Select
                  value={activeSectionId}
                  onValueChange={onSectionChange}
                >
                  <SelectTrigger className="h-auto py-2 px-3 text-3xl font-bold tracking-tight border-none shadow-none hover:bg-muted/50 w-auto min-w-[200px] focus:ring-0 focus:ring-offset-0 [&>svg]:w-6 [&>svg]:h-6 [&>svg]:ml-2">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const currentSection = sections.find((s) => s.id === activeSectionId);
                          const Icon = currentSection?.icon;
                          return Icon ? <Icon className="w-6 h-6" /> : null;
                        })()}
                        <span>{title}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <SelectItem key={section.id} value={section.id}>
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className="w-4 h-4" />}
                            <span>{section.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              {/* Desktop: Regular Title */}
              <h2 className="hidden lg:block text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h2>
            </>
          ) : (
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
          )}
          <p className="text-base text-muted-foreground mt-2">{description}</p>
        </div>
        {onSkip && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-primary hover:text-primary bg-primary/10 hover:bg-primary/15 border border-primary/20 px-3"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            {skipLabel}
          </Button>
        )}
      </div>

      {/* Form Content */}
      <div className="space-y-8 min-h-[400px]">{children}</div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-4 mt-12 pt-6 border-t w-full">
        {/* Progress Dots */}
        <div className="flex gap-1 justify-center">
          {Array.from({ length: totalSections }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i === currentIndex ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          {onSave && (
            <Button
              variant="outline"
              onClick={onSave}
              disabled={isSaving}
              size="lg"
              className="w-full sm:flex-1"
            >
              {isSaving ? "Saving..." : saveLabel}
            </Button>
          )}
          <Button
            onClick={onNext}
            disabled={!canGoNext}
            size="lg"
            className={cn(
              "w-full",
              onSave ? "sm:flex-1" : "sm:w-auto sm:ml-auto"
            )}
          >
            {nextLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
