"use client";

import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  TEMPLATES,
  getATSBadgeInfo,
  type Template,
} from "@/lib/constants/templates";
import { TemplateRenderer } from "@/components/resume/template-renderer";
import { mockResumeData } from "@/data/mock-resume";
import { cn } from "@/lib/utils";

interface TemplatePreviewLightboxProps {
  template: Template;
  onClose: () => void;
  onNavigate?: (templateId: string) => void;
}

export function TemplatePreviewLightbox({
  template,
  onClose,
  onNavigate,
}: TemplatePreviewLightboxProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const atsBadge = getATSBadgeInfo(template.features.atsCompatibility);

  const selectedIndex = TEMPLATES.findIndex((t) => t.id === template.id);
  const canPrev = selectedIndex > 0;
  const canNext = selectedIndex < TEMPLATES.length - 1;

  const handlePrev = useCallback(() => {
    if (canPrev && onNavigate) {
      onNavigate(TEMPLATES[selectedIndex - 1].id);
    }
  }, [canPrev, selectedIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (canNext && onNavigate) {
      onNavigate(TEMPLATES[selectedIndex + 1].id);
    }
  }, [canNext, selectedIndex, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, handlePrev, handleNext]);

  // Scroll to top when template changes
  useEffect(() => {
    previewRef.current?.scrollTo({ top: 0 });
  }, [template.id]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header bar */}
      <header className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full shadow-sm shrink-0"
              onClick={onClose}
              aria-label="Close preview"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight truncate">
                  {template.name}
                </h2>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0 font-normal shrink-0",
                    atsBadge.bgColor,
                    atsBadge.color,
                    "border-transparent"
                  )}
                >
                  {atsBadge.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate hidden sm:block">
                {template.description}
              </p>
            </div>

            {/* Navigation + CTA */}
            <div className="flex items-center gap-2 shrink-0">
              {onNavigate && (
                <div className="hidden sm:flex items-center gap-1 mr-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={handlePrev}
                    disabled={!canPrev}
                    aria-label="Previous template"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground tabular-nums px-1">
                    {selectedIndex + 1} / {TEMPLATES.length}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={handleNext}
                    disabled={!canNext}
                    aria-label="Next template"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <Button size="sm" className="rounded-full shadow-sm" asChild>
                <Link href={`/editor/new?template=${template.id}`}>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Use Template
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Preview area */}
      <div ref={previewRef} className="flex-1 overflow-auto bg-muted/40">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="max-w-[210mm] mx-auto">
            <div className="bg-white shadow-2xl shadow-black/10 rounded-sm overflow-hidden">
              <TemplateRenderer
                templateId={template.id as any}
                data={mockResumeData}
              />
            </div>
          </div>

          {/* Template details */}
          <div className="max-w-2xl mx-auto mt-8 space-y-4 pb-8">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {template.category}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {template.columns === 1 ? "Single Column" : "Two Columns"}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                {template.style}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {template.longDescription}
            </p>
            {template.highlights.length > 0 && (
              <ul className="text-sm text-muted-foreground space-y-1.5">
                {template.highlights.map((h, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary mt-0.5 shrink-0">-</span>
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation footer */}
      {onNavigate && (
        <div className="sm:hidden shrink-0 border-t bg-background px-4 py-3 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={handlePrev}
            disabled={!canPrev}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Prev
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {selectedIndex + 1} / {TEMPLATES.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={handleNext}
            disabled={!canNext}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
