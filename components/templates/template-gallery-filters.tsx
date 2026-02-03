"use client";

import {
  TemplateFilters,
  FilterOptionCounts,
} from "@/hooks/use-template-gallery";
import { TemplateStyleCategory } from "@/lib/constants/templates";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  X,
  LayoutGrid,
  Columns2,
  Camera,
  CameraOff,
  Sparkles,
} from "lucide-react";

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
  filterOptionCounts: FilterOptionCounts;
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
function OptionCount({ count }: { count: number }) {
  return (
    <span className="text-xs text-muted-foreground tabular-nums">
      ({count})
    </span>
  );
}

export function TemplateGalleryFilters({
  filters,
  onChange,
  onClear,
  activeFilterCount,
  availableStyles,
  availableIndustries,
  templateCount,
  filterOptionCounts,
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
    <div className={cn("space-y-4", className)}>
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

      {/* Layout Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground/80">Layout</Label>
        <RadioGroup
          value={filters.layout}
          onValueChange={(value) =>
            onChange("layout", value as TemplateFilters["layout"])
          }
          className="space-y-2"
        >
          {[
            { value: "any" as const, label: "Any layout" },
            {
              value: "single-column" as const,
              label: "Single column",
              icon: LayoutGrid,
            },
            {
              value: "two-column" as const,
              label: "Two columns",
              icon: Columns2,
            },
            {
              value: "sidebar" as const,
              label: "Sidebar",
              icon: Columns2,
              iconClass: "rotate-180",
            },
          ].map(({ value, label, icon: Icon, iconClass }) => {
            const count = filterOptionCounts.layout[value];
            const disabled = value !== "any" && count === 0;
            return (
              <div
                key={value}
                className={cn(
                  "flex items-center space-x-2",
                  disabled && "opacity-50 pointer-events-none"
                )}
              >
                <RadioGroupItem
                  value={value}
                  id={`layout-${value === "any" ? "any" : value}`}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`layout-${value === "any" ? "any" : value}`}
                  className="text-sm font-normal cursor-pointer flex items-center gap-1.5 flex-1"
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "w-3.5 h-3.5 text-muted-foreground",
                        iconClass
                      )}
                    />
                  )}
                  {label}
                  <OptionCount count={count} />
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Style Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground/80">Style</Label>
        <div className="space-y-2">
          {availableStyles.map((style) => {
            const count = filterOptionCounts.style[style];
            const disabled = count === 0;
            return (
              <div
                key={style}
                className={cn(
                  "flex items-center space-x-2",
                  disabled && "opacity-50 pointer-events-none"
                )}
              >
                <Checkbox
                  id={`style-${style}`}
                  checked={filters.styles.includes(style)}
                  onCheckedChange={() => toggleStyle(style)}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`style-${style}`}
                  className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
                >
                  {style === "ats-optimized" && (
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  {STYLE_LABELS[style]}
                  <OptionCount count={count} />
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Photo Support Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground/80">
          Photo Support
        </Label>
        <RadioGroup
          value={filters.photo}
          onValueChange={(value) =>
            onChange("photo", value as TemplateFilters["photo"])
          }
          className="space-y-2"
        >
          {[
            { value: "any" as const, label: "Any" },
            {
              value: "with" as const,
              label: "With photo",
              icon: Camera,
            },
            {
              value: "without" as const,
              label: "Without photo",
              icon: CameraOff,
            },
          ].map(({ value, label, icon: Icon }) => {
            const count = filterOptionCounts.photo[value];
            const disabled = value !== "any" && count === 0;
            return (
              <div
                key={value}
                className={cn(
                  "flex items-center space-x-2",
                  disabled && "opacity-50 pointer-events-none"
                )}
              >
                <RadioGroupItem
                  value={value}
                  id={`photo-${value}`}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`photo-${value}`}
                  className="text-sm font-normal cursor-pointer flex items-center gap-1.5 flex-1"
                >
                  {Icon && (
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  {label}
                  <OptionCount count={count} />
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Industry Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground/80">
          Industry
        </Label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {availableIndustries.map((industry) => {
            const count = filterOptionCounts.industry[industry] ?? 0;
            const disabled = count === 0;
            return (
              <div
                key={industry}
                className={cn(
                  "flex items-center space-x-2",
                  disabled && "opacity-50 pointer-events-none"
                )}
              >
                <Checkbox
                  id={`industry-${industry}`}
                  checked={filters.industries.includes(industry)}
                  onCheckedChange={() => toggleIndustry(industry)}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`industry-${industry}`}
                  className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
                >
                  {industry}
                  <OptionCount count={count} />
                </Label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
