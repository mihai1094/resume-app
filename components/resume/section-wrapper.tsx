"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
  currentIndex: number;
  totalSections: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  nextLabel?: string;
  onSave?: () => void;
  onSkip?: () => void;
  isSaving?: boolean;
  sectionErrors?: string[];
  saveLabel?: string;
  skipLabel?: string;
}

export function SectionWrapper({
  title,
  description,
  children,
  currentIndex,
  totalSections,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  nextLabel = "Next",
  onSave,
  onSkip,
  isSaving = false,
  sectionErrors = [],
  saveLabel = "Save",
  skipLabel = "Skip for now",
}: SectionWrapperProps) {
  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="sr-only" aria-live="assertive">
        {sectionErrors?.join(". ")}
      </div>
      {/* Section Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
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
            <ArrowRight className="w-4 h-4 mr-2" />
            {skipLabel}
          </Button>
        )}
      </div>

      {/* Form Content */}
      <div className="space-y-8 min-h-[400px]">{children}</div>

      {/* Navigation Buttons - Fixed at bottom or inline depending on preference, keeping inline for now but cleaner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-12 pt-6 border-t w-full">
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={cn(
            !canGoPrevious && "invisible",
            "w-full sm:w-auto"
          )}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-1 justify-center order-first sm:order-none">
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

        <div className="flex gap-2 w-full sm:w-auto">
          {onSave && (
            <Button
              variant="outline"
              onClick={onSave}
              disabled={isSaving}
              size="lg"
              className="flex-1 sm:flex-none"
            >
              {isSaving ? "Saving..." : saveLabel}
            </Button>
          )}
          <Button onClick={onNext} disabled={!canGoNext} size="lg" className="flex-1 sm:flex-none">
            {nextLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
