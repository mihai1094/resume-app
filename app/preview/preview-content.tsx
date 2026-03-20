"use client";

import { Suspense, useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { mockResumeData } from "@/data/mock-resume";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Columns3,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  TEMPLATES,
  TEMPLATE_STYLE_CATEGORIES,
  getATSBadgeInfo,
  type Template,
  type TemplateStyleCategory,
} from "@/lib/constants/templates";
import { TemplateRenderer } from "@/components/resume/template-renderer";
import { BackButton } from "@/components/shared/back-button";
import { cn } from "@/lib/utils";

const STYLE_LABELS: Record<TemplateStyleCategory, string> = {
  modern: "Modern",
  classic: "Classic",
  creative: "Creative",
  "ats-optimized": "ATS-Optimized",
};

function PreviewContentInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedTemplateId = searchParams.get("template") || null;
  const [activeFilter, setActiveFilter] = useState<TemplateStyleCategory | "all">("all");
  const [columns, setColumns] = useState<2 | 3>(3);
  const previewRef = useRef<HTMLDivElement>(null);

  const filteredTemplates = activeFilter === "all"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.styleCategory === activeFilter);

  const selectedTemplate = selectedTemplateId
    ? TEMPLATES.find((t) => t.id === selectedTemplateId)
    : null;

  const selectedIndex = selectedTemplate
    ? TEMPLATES.findIndex((t) => t.id === selectedTemplate.id)
    : -1;

  const handleSelectTemplate = useCallback(
    (templateId: string) => {
      router.push(`/preview?template=${templateId}`, { scroll: false });
    },
    [router]
  );

  const handleClose = useCallback(() => {
    router.push("/preview", { scroll: false });
  }, [router]);

  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) {
      handleSelectTemplate(TEMPLATES[selectedIndex - 1].id);
    }
  }, [selectedIndex, handleSelectTemplate]);

  const handleNext = useCallback(() => {
    if (selectedIndex < TEMPLATES.length - 1) {
      handleSelectTemplate(TEMPLATES[selectedIndex + 1].id);
    }
  }, [selectedIndex, handleSelectTemplate]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!selectedTemplate) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedTemplate, handleClose, handlePrev, handleNext]);

  // Scroll to top of preview when template changes
  useEffect(() => {
    previewRef.current?.scrollTo({ top: 0 });
  }, [selectedTemplateId]);

  // Lightbox / single template view
  if (selectedTemplate) {
    const atsBadge = getATSBadgeInfo(selectedTemplate.features.atsCompatibility);

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
                onClick={handleClose}
                aria-label="Close preview"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold tracking-tight truncate">
                    {selectedTemplate.name}
                  </h1>
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
                  {selectedTemplate.description}
                </p>
              </div>

              {/* Navigation + CTA */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center gap-1 mr-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={handlePrev}
                    disabled={selectedIndex === 0}
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
                    disabled={selectedIndex === TEMPLATES.length - 1}
                    aria-label="Next template"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <Button size="sm" className="rounded-full shadow-sm" asChild>
                  <Link href={`/editor/new?template=${selectedTemplate.id}`}>
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
                  templateId={selectedTemplate.id as any}
                  data={mockResumeData}
                />
              </div>
            </div>

            {/* Template details */}
            <div className="max-w-2xl mx-auto mt-8 space-y-4 pb-8">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs capitalize">
                  {selectedTemplate.category}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {selectedTemplate.columns === 1 ? "Single Column" : "Two Columns"}
                </Badge>
                <Badge variant="secondary" className="text-xs capitalize">
                  {selectedTemplate.style}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedTemplate.longDescription}
              </p>
              {selectedTemplate.highlights.length > 0 && (
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  {selectedTemplate.highlights.map((h, i) => (
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
        <div className="sm:hidden shrink-0 border-t bg-background px-4 py-3 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={handlePrev}
            disabled={selectedIndex === 0}
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
            disabled={selectedIndex === TEMPLATES.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // Gallery view
  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle background accent */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 via-primary/[0.02] to-transparent pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6 py-4 md:py-6 relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <BackButton
              fallback="/"
              label="Back"
              variant="secondary"
              size="sm"
              className="rounded-full shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
                Template Gallery
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Preview all {TEMPLATES.length} templates with sample data. Click any template for a full preview.
              </p>
            </div>
          </div>

          {/* Filters + controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveFilter("all")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                  activeFilter === "all"
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                All ({TEMPLATES.length})
              </button>
              {TEMPLATE_STYLE_CATEGORIES.map((cat) => {
                const count = TEMPLATES.filter((t) => t.styleCategory === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                      activeFilter === cat
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {STYLE_LABELS[cat]} ({count})
                  </button>
                );
              })}
            </div>

            {/* Column toggle — desktop only */}
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              <Button
                variant={columns === 2 ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setColumns(2)}
                aria-label="2 columns"
              >
                <Columns2 className="w-4 h-4" />
              </Button>
              <Button
                variant={columns === 3 ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setColumns(3)}
                aria-label="3 columns"
              >
                <Columns3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Templates grid */}
        <div
          className={cn(
            "grid gap-5 pb-12",
            "grid-cols-1 sm:grid-cols-2",
            columns === 3
              ? "lg:grid-cols-3"
              : "lg:grid-cols-2"
          )}
        >
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onClick={() => handleSelectTemplate(template.id)}
            />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No templates match this filter.
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onClick,
}: {
  template: Template;
  onClick: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);
  const atsBadge = getATSBadgeInfo(template.features.atsCompatibility);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setScale(width / 794); // A4 at 96 DPI = 794px
      }
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Preview ${template.name} template`}
      className={cn(
        "group relative rounded-2xl border border-border/80 bg-card overflow-hidden transition-all duration-300 ease-out cursor-pointer outline-none",
        "hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5",
        "focus-visible:ring-2 focus-visible:ring-primary"
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* ATS badge */}
      <div className="absolute top-3 right-3 z-10">
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] px-2 py-0.5 font-normal shadow-sm backdrop-blur-md",
            atsBadge.bgColor,
            atsBadge.color,
            "border-transparent"
          )}
        >
          {atsBadge.label}
        </Badge>
      </div>

      {/* Template preview */}
      <div className="aspect-[8.5/11] w-full bg-muted p-3">
        <div
          ref={containerRef}
          className="w-full h-full rounded-md overflow-hidden shadow-sm border border-border bg-white relative"
        >
          <div
            className="absolute top-0 left-0 origin-top-left pointer-events-none"
            style={{
              transform: `scale(${scale})`,
              width: "794px",
              minHeight: "1123px",
            }}
          >
            <TemplateRenderer
              templateId={template.id as any}
              data={mockResumeData}
            />
          </div>
        </div>
      </div>

      {/* Info overlay on hover */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 border-t border-border/40 translate-y-2 group-hover:translate-y-0">
        <h3 className="font-semibold text-foreground text-sm tracking-tight">
          {template.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {template.description}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
            {template.columns === 1 ? "1 Column" : "2 Columns"}
          </Badge>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
            {template.style}
          </Badge>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            className="flex-1 rounded-full text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Full Preview
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 rounded-full text-xs"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Link href={`/editor/new?template=${template.id}`}>
              Use Template
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PreviewContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 sm:px-6 py-4 md:py-6">
            <div className="mb-6">
              <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
              <div className="h-4 w-72 bg-muted rounded-lg animate-pulse mt-2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[8.5/11] bg-muted rounded-2xl animate-pulse"
                  style={{ animationDelay: `${i * 70}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <PreviewContentInner />
    </Suspense>
  );
}
