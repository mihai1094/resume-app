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
import { Filter, ArrowRight, FileText } from "lucide-react";
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
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mobile: Filter button + sheet */}
      <div className="lg:hidden">
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
        <div className="sticky top-8 bg-card rounded-xl border border-border p-5">
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
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {templateCount} template{templateCount !== 1 ? "s" : ""}
          </p>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No templates match your filters
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters to see more templates.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
        <div className="mt-12 pt-8 border-t border-border">
          <div className="bg-muted/50 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-foreground">
                Skip template selection
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start with our default layout (Modern) and build your resume
                step by step. You can change the template anytime.
              </p>
            </div>
            <Button variant="outline" asChild>
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
