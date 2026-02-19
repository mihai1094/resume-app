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
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <h3 className="font-semibold tracking-tight text-foreground">Filters</h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5 mr-1.5" />
            Clear all
          </Button>
        )}
      </div>

      {/* Layout Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold tracking-tight text-foreground/90">Layout</Label>
        <RadioGroup
          value={filters.layout}
          onValueChange={(value) =>
            onChange("layout", value as TemplateFilters["layout"])
          }
          className="flex flex-col gap-1"
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
            const isSelected = filters.layout === value;
            return (
              <Label
                key={value}
                htmlFor={`layout-${value === "any" ? "any" : value}`}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all cursor-pointer select-none group",
                  disabled ? "opacity-50 pointer-events-none border-transparent" : "hover:bg-muted/40",
                  isSelected ? "bg-primary/5 border-primary/20 shadow-sm" : "border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
                    isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-muted-foreground/10"
                  )}>
                    {Icon ? (
                      <Icon className={cn("w-4 h-4", iconClass)} />
                    ) : (
                      <LayoutGrid className="w-4 h-4" />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm transition-colors",
                    isSelected ? "font-medium text-foreground" : "font-normal text-muted-foreground group-hover:text-foreground"
                  )}>
                    {label}
                  </span>
                </div>
                <RadioGroupItem
                  value={value}
                  id={`layout-${value === "any" ? "any" : value}`}
                  disabled={disabled}
                  className="sr-only"
                />
                <OptionCount count={count} />
              </Label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Style Filter */}
      <div className="space-y-3 pt-2">
        <Label className="text-sm font-semibold tracking-tight text-foreground/90">Style</Label>
        <div className="space-y-2.5">
          {availableStyles.map((style) => {
            const count = filterOptionCounts.style[style];
            const disabled = count === 0;
            return (
              <div
                key={style}
                className={cn(
                  "flex items-center space-x-3 group",
                  disabled && "opacity-50 pointer-events-none"
                )}
              >
                <Checkbox
                  id={`style-${style}`}
                  checked={filters.styles.includes(style)}
                  onCheckedChange={() => toggleStyle(style)}
                  disabled={disabled}
                  className="rounded-sm"
                />
                <Label
                  htmlFor={`style-${style}`}
                  className="text-sm font-normal cursor-pointer flex items-center justify-between flex-1 text-muted-foreground group-hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {style === "ats-optimized" && (
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                    )}
                    {STYLE_LABELS[style]}
                  </span>
                  <OptionCount count={count} />
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Photo Support Filter */}
      <div className="space-y-3 pt-2">
        <Label className="text-sm font-semibold tracking-tight text-foreground/90">
          Photo Support
        </Label>
        <RadioGroup
          value={filters.photo}
          onValueChange={(value) =>
            onChange("photo", value as TemplateFilters["photo"])
          }
          className="flex bg-muted/40 p-1 rounded-xl border border-border/40"
        >
          {[
            { value: "any" as const, label: "Any", mobileLabel: "Any", icon: LayoutGrid },
            {
              value: "with" as const,
              label: "With photo",
              mobileLabel: "Photo",
              icon: Camera,
            },
            {
              value: "without" as const,
              label: "No photo",
              mobileLabel: "No photo",
              icon: CameraOff,
            },
          ].map(({ value, label, mobileLabel, icon: Icon }) => {
            const count = filterOptionCounts.photo[value];
            const disabled = value !== "any" && count === 0;
            const isSelected = filters.photo === value;
            return (
              <Label
                key={value}
                htmlFor={`photo-${value}`}
                className={cn(
                  "flex-1 min-w-0 flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-lg text-[11px] leading-tight text-center cursor-pointer transition-all select-none",
                  disabled ? "opacity-50 pointer-events-none" : "hover:text-foreground",
                  isSelected ? "bg-background shadow-sm text-foreground font-semibold border border-primary/10" : "text-muted-foreground font-medium border border-transparent hover:bg-muted/50"
                )}
              >
                <RadioGroupItem
                  value={value}
                  id={`photo-${value}`}
                  disabled={disabled}
                  className="sr-only"
                />
                {Icon && <Icon className="w-4 h-4 mb-0.5 shrink-0" />}
                <span className="sm:hidden whitespace-nowrap">{mobileLabel}</span>
                <span className="hidden sm:inline">{label}</span>
              </Label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Industry Filter */}
      <div className="space-y-3 pt-2">
        <Label className="text-sm font-semibold tracking-tight text-foreground/90">
          Industry
        </Label>
        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {availableIndustries.map((industry) => {
            const count = filterOptionCounts.industry[industry] ?? 0;
            const disabled = count === 0;
            return (
              <div
                key={industry}
                className={cn(
                  "flex items-center space-x-3 group",
                  disabled && "opacity-50 pointer-events-none"
                )}
              >
                <Checkbox
                  id={`industry-${industry}`}
                  checked={filters.industries.includes(industry)}
                  onCheckedChange={() => toggleIndustry(industry)}
                  disabled={disabled}
                  className="rounded-sm"
                />
                <Label
                  htmlFor={`industry-${industry}`}
                  className="text-sm font-normal cursor-pointer flex items-center justify-between flex-1 text-muted-foreground group-hover:text-foreground transition-colors"
                >
                  <span>{industry}</span>
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
