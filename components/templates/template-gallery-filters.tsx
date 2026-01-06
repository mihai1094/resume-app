"use client";

import { TemplateFilters } from "@/hooks/use-template-gallery";
import { TemplateStyleCategory } from "@/lib/constants/templates";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { X, LayoutGrid, Columns2, Camera, CameraOff, Sparkles } from "lucide-react";

interface TemplateGalleryFiltersProps {
  filters: TemplateFilters;
  onChange: <K extends keyof TemplateFilters>(
    key: K,
    value: TemplateFilters[K]
  ) => void;
  onClear: () => void;
  activeFilterCount: number;
  availableStyles: TemplateStyleCategory[];
  availableIndustries: string[];
  templateCount: number;
  className?: string;
}

const STYLE_LABELS: Record<TemplateStyleCategory, string> = {
  modern: "Modern",
  classic: "Classic",
  creative: "Creative",
  "ats-optimized": "ATS-Optimized",
};

/**
 * Filter sidebar for the template gallery
 * Supports layout, style, photo, and industry filters
 */
export function TemplateGalleryFilters({
  filters,
  onChange,
  onClear,
  activeFilterCount,
  availableStyles,
  availableIndustries,
  templateCount,
  className,
}: TemplateGalleryFiltersProps) {
  // Toggle style in multi-select
  const toggleStyle = (style: TemplateStyleCategory) => {
    const newStyles = filters.styles.includes(style)
      ? filters.styles.filter((s) => s !== style)
      : [...filters.styles, style];
    onChange("styles", newStyles);
  };

  // Toggle industry in multi-select
  const toggleIndustry = (industry: string) => {
    const newIndustries = filters.industries.includes(industry)
      ? filters.industries.filter((i) => i !== industry)
      : [...filters.industries, industry];
    onChange("industries", newIndustries);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with clear button */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {templateCount} template{templateCount !== 1 ? "s" : ""}
      </p>

      {/* Layout Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground/80">Layout</Label>
        <RadioGroup
          value={filters.layout}
          onValueChange={(value) => onChange("layout", value as TemplateFilters["layout"])}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="any" id="layout-any" />
            <Label htmlFor="layout-any" className="text-sm font-normal cursor-pointer">
              Any layout
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single-column" id="layout-single" />
            <Label htmlFor="layout-single" className="text-sm font-normal cursor-pointer flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground" />
              Single column
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="two-column" id="layout-two" />
            <Label htmlFor="layout-two" className="text-sm font-normal cursor-pointer flex items-center gap-1.5">
              <Columns2 className="w-3.5 h-3.5 text-muted-foreground" />
              Two columns
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sidebar" id="layout-sidebar" />
            <Label htmlFor="layout-sidebar" className="text-sm font-normal cursor-pointer flex items-center gap-1.5">
              <Columns2 className="w-3.5 h-3.5 text-muted-foreground rotate-180" />
              Sidebar
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Style Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground/80">Style</Label>
        <div className="space-y-2">
          {availableStyles.map((style) => (
            <div key={style} className="flex items-center space-x-2">
              <Checkbox
                id={`style-${style}`}
                checked={filters.styles.includes(style)}
                onCheckedChange={() => toggleStyle(style)}
              />
              <Label
                htmlFor={`style-${style}`}
                className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
              >
                {style === "ats-optimized" && (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                )}
                {STYLE_LABELS[style]}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Support Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground/80">Photo Support</Label>
        <RadioGroup
          value={filters.photo}
          onValueChange={(value) => onChange("photo", value as TemplateFilters["photo"])}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="any" id="photo-any" />
            <Label htmlFor="photo-any" className="text-sm font-normal cursor-pointer">
              Any
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="with" id="photo-with" />
            <Label htmlFor="photo-with" className="text-sm font-normal cursor-pointer flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-muted-foreground" />
              With photo
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="without" id="photo-without" />
            <Label htmlFor="photo-without" className="text-sm font-normal cursor-pointer flex items-center gap-1.5">
              <CameraOff className="w-3.5 h-3.5 text-muted-foreground" />
              Without photo
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Industry Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground/80">Industry</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {availableIndustries.map((industry) => (
            <div key={industry} className="flex items-center space-x-2">
              <Checkbox
                id={`industry-${industry}`}
                checked={filters.industries.includes(industry)}
                onCheckedChange={() => toggleIndustry(industry)}
              />
              <Label
                htmlFor={`industry-${industry}`}
                className="text-sm font-normal cursor-pointer"
              >
                {industry}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
