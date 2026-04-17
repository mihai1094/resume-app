"use client";

import { Suspense, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTemplateGallery } from "@/hooks/use-template-gallery";
import { useLastUsedTemplate } from "@/hooks/use-last-used-template";
import { TemplateGalleryFilters } from "./template-gallery-filters";
import { TemplateGalleryCard } from "./template-gallery-card";
import { TemplatePreviewLightbox } from "./template-preview-lightbox";
import { TemplateMagazineView } from "./template-magazine-view";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, ArrowRight, FileText, Sparkles, Clock, X } from "lucide-react";
import Link from "next/link";
import { TEMPLATES, type Template } from "@/lib/constants/templates";
import { capture } from "@/lib/analytics/events";

/**
 * Main template gallery with filters and template cards
 * Responsive: sidebar on desktop, bottom sheet on mobile
 */
function TemplateGalleryInner() {
  const router = useRouter();
  const {
    filters,
    updateFilter,
    clearFilters,
    activeFilterCount,
    filteredTemplates,
    templateCount,
    setTemplateColor,
    getTemplateColor,
    selectTemplate,
    availableStyles,
    filterOptionCounts,
  } = useTemplateGallery();

  const { lastUsed, clear: clearLastUsed, hasLoaded } = useLastUsedTemplate();
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const handleQuickStart = useCallback(() => {
    if (!lastUsed) return;
    capture("template_picked", {
      templateId: lastUsed.template.id,
      colorId: lastUsed.color.id,
      source: "quick_start",
    });
    router.push(`/editor/new?template=${lastUsed.template.id}&color=${lastUsed.color.id}`);
  }, [lastUsed, router]);

  const handlePreview = useCallback((templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template) setPreviewTemplate(template);
  }, []);

  const handlePreviewNavigate = useCallback((templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template) setPreviewTemplate(template);
  }, []);

  if (previewTemplate) {
    return (
      <TemplatePreviewLightbox
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onNavigate={handlePreviewNavigate}
      />
    );
  }

  return (
    <>
      {/* Desktop (lg+): editorial magazine spread layout */}
      <div className="hidden lg:flex h-full min-h-0">
        <div className="flex-1 min-h-0">
          <TemplateMagazineView />
        </div>
      </div>

      {/* Mobile (<lg): existing grid of cards */}
      <div className="lg:hidden flex flex-col gap-8 h-full min-h-0">
      {/* Mobile: Filter button + sheet */}
      <div className="shrink-0">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Templates</SheetTitle>
            </SheetHeader>
            <div className="mt-4 pb-8">
              <TemplateGalleryFilters
                filters={filters}
                onChange={updateFilter}
                onClear={clearFilters}
                activeFilterCount={activeFilterCount}
                availableStyles={availableStyles}
                templateCount={templateCount}
                filterOptionCounts={filterOptionCounts}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Template Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1">
        <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-muted-foreground">
            Showing {templateCount} template{templateCount !== 1 ? "s" : ""}
          </p>
          {filters.supports === "skills-first" && (
            <span
              className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/15"
              role="status"
              aria-label="Filtered to templates that support Skills above Experience"
            >
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              Skills-first
              <button
                type="button"
                onClick={() => updateFilter("supports", undefined)}
                aria-label="Show all templates"
                className="w-5 h-5 rounded-full hover:bg-primary/15 flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-2xl border border-dashed border-border/60 bg-muted/30">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
              <FileText className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2 tracking-tight">
              No templates found
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              We couldn&apos;t find any templates matching your current filters. Try adjusting them to see more options.
            </p>
            <Button variant="default" onClick={clearFilters} className="rounded-full px-8 shadow-md">
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {hasLoaded && lastUsed && (
              <div
                className="rounded-2xl border border-primary/25 bg-primary/5 p-4 flex flex-col gap-3 cursor-pointer hover:bg-primary/10 transition-colors group"
                onClick={handleQuickStart}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Clock className="w-3.5 h-3.5" />
                  Continue editing
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{lastUsed.template.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{lastUsed.color.name}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    className="rounded-full shadow-sm font-medium"
                    onClick={(e) => { e.stopPropagation(); handleQuickStart(); }}
                  >
                    Quick start
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                  <button
                    type="button"
                    aria-label="Dismiss"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(e) => { e.stopPropagation(); clearLastUsed(); }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
            {filteredTemplates.map((template, index) => (
              <TemplateGalleryCard
                key={template.id}
                template={template}
                selectedColor={getTemplateColor(template.id)}
                onColorChange={(color) => setTemplateColor(template.id, color)}
                onSelect={() => selectTemplate(template.id)}
                onPreview={() => handlePreview(template.id)}
                index={index}
                isRecommended={index === 0 && activeFilterCount === 0}
              />
            ))}
          </div>
        )}

        {/* Skip template selection — use default (Modern) */}
        <div className="mt-16 mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl -z-10 blur-xl opacity-50" />
          <div className="bg-card/80 backdrop-blur-md rounded-2xl border border-primary/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 justify-center md:justify-start">
                <Sparkles className="w-5 h-5 text-primary" />
                Skip template selection
              </h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Start with our default layout (Modern) and build your resume
                step by step. You can change the template anytime.
              </p>
            </div>
            <Button size="lg" className="rounded-full shadow-md w-full md:w-auto" asChild>
              <Link href="/editor/new">
                Use default template
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export function TemplateGalleryContent() {
  return (
    <Suspense fallback={<TemplateGallerySkeleton />}>
      <TemplateGalleryInner />
    </Suspense>
  );
}

function TemplateGallerySkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar skeleton */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="bg-muted rounded-xl h-96 animate-pulse" />
      </div>
      {/* Grid skeleton */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-muted rounded-xl h-96 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
