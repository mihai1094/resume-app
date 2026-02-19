"use client";

import { Suspense } from "react";
import { useTemplateGallery } from "@/hooks/use-template-gallery";
import { TemplateGalleryFilters } from "./template-gallery-filters";
import { TemplateGalleryCard } from "./template-gallery-card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, ArrowRight, FileText, Sparkles } from "lucide-react";
import Link from "next/link";

/**
 * Main template gallery with filters and template cards
 * Responsive: sidebar on desktop, bottom sheet on mobile
 */
function TemplateGalleryInner() {
  const {
    filters,
    updateFilter,
    clearFilters,
    activeFilterCount,
    filteredTemplates,
    templateCount,
    selectedColors,
    setTemplateColor,
    getTemplateColor,
    colorPalettes,
    selectTemplate,
    availableIndustries,
    availableStyles,
    filterOptionCounts,
  } = useTemplateGallery();

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-0">
      {/* Mobile: Filter button + sheet */}
      <div className="lg:hidden shrink-0">
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
                availableIndustries={availableIndustries}
                templateCount={templateCount}
                filterOptionCounts={filterOptionCounts}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-8 bg-card/50 backdrop-blur-md rounded-2xl border border-primary/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
          <TemplateGalleryFilters
            filters={filters}
            onChange={updateFilter}
            onClear={clearFilters}
            activeFilterCount={activeFilterCount}
            availableStyles={availableStyles}
            availableIndustries={availableIndustries}
            templateCount={templateCount}
            filterOptionCounts={filterOptionCounts}
          />
        </div>
      </div>

      {/* Template Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {templateCount} template{templateCount !== 1 ? "s" : ""}
          </p>
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
              We couldn't find any templates matching your current filters. Try adjusting them to see more options.
            </p>
            <Button variant="default" onClick={clearFilters} className="rounded-full px-8 shadow-md">
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xlg:grid-cols-3 gap-6">
            {filteredTemplates.map((template, index) => (
              <TemplateGalleryCard
                key={template.id}
                template={template}
                selectedColor={getTemplateColor(template.id)}
                onColorChange={(color) => setTemplateColor(template.id, color)}
                onSelect={() => selectTemplate(template.id)}
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
