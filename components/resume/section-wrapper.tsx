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
  isSaving?: boolean;
  sectionErrors?: string[];
  saveLabel?: string;
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
  isSaving = false,
  sectionErrors = [],
  saveLabel = "Save",
}: SectionWrapperProps) {
  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="text-base text-muted-foreground mt-2">{description}</p>
      </div>

      {sectionErrors.length > 0 && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {sectionErrors.length === 1 ? (
            <p>{sectionErrors[0]}</p>
          ) : (
            <ul className="list-disc pl-4 space-y-1">
              {sectionErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Form Content */}
      <div className="space-y-8 min-h-[400px]">{children}</div>

      {/* Navigation Buttons - Fixed at bottom or inline depending on preference, keeping inline for now but cleaner */}
      <div className="flex items-center justify-between mt-12 pt-6 border-t">
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={cn(!canGoPrevious && "invisible")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-1">
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

        <div className="flex gap-2">
          {onSave && (
            <Button
              variant="outline"
              onClick={onSave}
              disabled={isSaving}
              size="lg"
            >
              {isSaving ? "Saving..." : saveLabel}
            </Button>
          )}
          <Button onClick={onNext} disabled={!canGoNext} size="lg">
            {nextLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
