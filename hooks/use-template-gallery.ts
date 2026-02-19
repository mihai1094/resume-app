"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  TEMPLATES,
  Template,
  TemplateLayout,
  TemplateStyleCategory,
  TEMPLATE_STYLE_CATEGORIES,
  hasTemplatePhotoSupport,
} from "@/lib/constants/templates";
import {
  COLOR_PALETTES,
  ColorPalette,
  getTemplateDefaultColor,
} from "@/lib/constants/color-palettes";

/**
 * Filter state for the template gallery
 */
export interface TemplateFilters {
  /** Layout filter: any, single-column, or two-column */
  layout: "any" | TemplateLayout;
  /** Style categories (multi-select) */
  styles: TemplateStyleCategory[];
  /** Photo support filter */
  photo: "any" | "with" | "without";
  /** Target industries (multi-select) */
  industries: string[];
}

const DEFAULT_FILTERS: TemplateFilters = {
  layout: "any",
  styles: [],
  photo: "any",
  industries: [],
};

/**
 * Get all unique industries from templates
 */
export function getAvailableIndustries(): string[] {
  const industries = new Set<string>();
  TEMPLATES.forEach((t) => {
    t.targetIndustries.forEach((ind) => industries.add(ind));
  });
  return Array.from(industries).sort();
}

/**
 * Get all unique style categories (ordered by template count, desc)
 */
export function getAvailableStyles(): TemplateStyleCategory[] {
  return ["modern", "classic", "creative", "ats-optimized"];
}

/** Partial filters for counting (one dimension overridden) */
type FilterOverride = Partial<TemplateFilters>;

function matchesFilters(template: Template, filters: TemplateFilters): boolean {
  const templateSupportsPhoto = hasTemplatePhotoSupport(template);

  if (filters.layout !== "any" && template.layout !== filters.layout)
    return false;
  if (
    filters.styles.length > 0 &&
    !filters.styles.includes(template.styleCategory)
  ) {
    return false;
  }
  if (filters.photo === "with" && !templateSupportsPhoto)
    return false;
  if (filters.photo === "without" && templateSupportsPhoto)
    return false;
  if (filters.industries.length > 0) {
    const hasMatch = template.targetIndustries.some((ind) =>
      filters.industries.includes(ind)
    );
    if (!hasMatch) return false;
  }
  return true;
}

/** Count of templates matching each filter option (with other filters applied) */
export interface FilterOptionCounts {
  layout: Record<TemplateFilters["layout"], number>;
  style: Record<TemplateStyleCategory, number>;
  photo: Record<TemplateFilters["photo"], number>;
  industry: Record<string, number>;
}

interface UseTemplateGalleryReturn {
  // Filters
  filters: TemplateFilters;
  setFilters: (filters: TemplateFilters) => void;
  updateFilter: <K extends keyof TemplateFilters>(
    key: K,
    value: TemplateFilters[K]
  ) => void;
  clearFilters: () => void;
  activeFilterCount: number;

  // Templates
  filteredTemplates: Template[];
  templateCount: number;
  allTemplates: Template[];

  // Color selections (per-template)
  selectedColors: Record<string, ColorPalette>;
  setTemplateColor: (templateId: string, color: ColorPalette) => void;
  getTemplateColor: (templateId: string) => ColorPalette;

  // Color palettes
  colorPalettes: ColorPalette[];

  // Selection actions
  selectTemplate: (templateId: string) => void;

  // Available filter options
  availableIndustries: string[];
  availableStyles: TemplateStyleCategory[];
  /** Count per filter option (for showing "ATS-Optimized (4)" and disabling 0-count options) */
  filterOptionCounts: FilterOptionCounts;
}

/**
 * Hook for managing the template gallery state
 * Handles filtering, color selection per template, and navigation
 */
export function useTemplateGallery(): UseTemplateGalleryReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const validIndustries = useMemo(() => getAvailableIndustries(), []);

  // Initialize filters from URL params (validate so invalid values don't yield 0 results)
  const initialFilters = useMemo((): TemplateFilters => {
    const layout = searchParams.get("layout") as TemplateFilters["layout"];
    const stylesParam = searchParams.get("styles");
    const photo = searchParams.get("photo") as TemplateFilters["photo"];
    const industriesParam = searchParams.get("industries");

    const layoutOptions = ["any", "single-column", "two-column", "sidebar"];
    const styles = stylesParam
      ? stylesParam
          .split(",")
          .map((s) => s.trim())
          .filter((s): s is TemplateStyleCategory =>
            TEMPLATE_STYLE_CATEGORIES.includes(s as TemplateStyleCategory)
          )
      : [];
    const industries = industriesParam
      ? industriesParam
          .split(",")
          .map((i) => i.trim())
          .filter((i) => validIndustries.includes(i))
      : [];

    return {
      layout: layout && layoutOptions.includes(layout) ? layout : "any",
      styles,
      photo:
        photo && ["any", "with", "without"].includes(photo) ? photo : "any",
      industries,
    };
  }, [searchParams, validIndustries]);

  const [filters, setFiltersState] = useState<TemplateFilters>(initialFilters);

  // Color selections per template (keyed by template ID)
  const [selectedColors, setSelectedColors] = useState<
    Record<string, ColorPalette>
  >({});

  // Track if this is the initial mount to avoid unnecessary URL updates
  const isInitialMount = useRef(true);

  // Sync filters to URL via useEffect (not during render)
  useEffect(() => {
    // Skip URL update on initial mount since we just read from URL
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (filters.layout !== "any") params.set("layout", filters.layout);
    if (filters.styles.length > 0)
      params.set("styles", filters.styles.join(","));
    if (filters.photo !== "any") params.set("photo", filters.photo);
    if (filters.industries.length > 0)
      params.set("industries", filters.industries.join(","));

    const queryString = params.toString();
    router.replace(`/templates${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  }, [filters, router]);

  // Set all filters at once
  const setFilters = useCallback((newFilters: TemplateFilters) => {
    setFiltersState(newFilters);
  }, []);

  // Update a single filter
  const updateFilter = useCallback(
    <K extends keyof TemplateFilters>(key: K, value: TemplateFilters[K]) => {
      setFiltersState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.layout !== "any") count++;
    if (filters.styles.length > 0) count++;
    if (filters.photo !== "any") count++;
    if (filters.industries.length > 0) count++;
    return count;
  }, [filters]);

  // Filter templates based on current filters
  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((t) => matchesFilters(t, filters));
  }, [filters]);

  // Count per filter option: "if user selects this option, how many templates would show?"
  // Layout/photo: single-select → count with this value. Style/industry: multi-select → count with this option ADDED to selection.
  const filterOptionCounts = useMemo((): FilterOptionCounts => {
    const layoutOptions: TemplateFilters["layout"][] = [
      "any",
      "single-column",
      "two-column",
      "sidebar",
    ];
    const photoOptions: TemplateFilters["photo"][] = ["any", "with", "without"];
    const industries = validIndustries;

    return {
      layout: Object.fromEntries(
        layoutOptions.map((layout) => [
          layout,
          TEMPLATES.filter((t) => matchesFilters(t, { ...filters, layout }))
            .length,
        ])
      ) as Record<TemplateFilters["layout"], number>,
      style: Object.fromEntries(
        TEMPLATE_STYLE_CATEGORIES.map((style) => [
          style,
          TEMPLATES.filter((t) =>
            matchesFilters(t, {
              ...filters,
              styles: filters.styles.includes(style)
                ? filters.styles
                : [...filters.styles, style],
            })
          ).length,
        ])
      ) as Record<TemplateStyleCategory, number>,
      photo: Object.fromEntries(
        photoOptions.map((photo) => [
          photo,
          TEMPLATES.filter((t) => matchesFilters(t, { ...filters, photo }))
            .length,
        ])
      ) as Record<TemplateFilters["photo"], number>,
      industry: Object.fromEntries(
        industries.map((ind) => [
          ind,
          TEMPLATES.filter((t) =>
            matchesFilters(t, {
              ...filters,
              industries: filters.industries.includes(ind)
                ? filters.industries
                : [...filters.industries, ind],
            })
          ).length,
        ])
      ),
    };
  }, [filters, validIndustries]);

  // Style options ordered by count (most templates first)
  const availableStyles = useMemo(() => {
    return [...getAvailableStyles()].sort(
      (a, b) => filterOptionCounts.style[b] - filterOptionCounts.style[a]
    );
  }, [filterOptionCounts.style]);

  // Set color for a specific template
  const setTemplateColor = useCallback(
    (templateId: string, color: ColorPalette) => {
      setSelectedColors((prev) => ({
        ...prev,
        [templateId]: color,
      }));
    },
    []
  );

  // Get color for a specific template (with fallback to default)
  const getTemplateColor = useCallback(
    (templateId: string): ColorPalette => {
      return selectedColors[templateId] || getTemplateDefaultColor(templateId);
    },
    [selectedColors]
  );

  // Navigate to editor with selected template and color
  const selectTemplate = useCallback(
    (templateId: string) => {
      const color = getTemplateColor(templateId);
      const params = new URLSearchParams({
        template: templateId,
        color: color.id,
      });
      router.push(`/editor/new?${params.toString()}`);
    },
    [router, getTemplateColor]
  );

  return {
    // Filters
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    activeFilterCount,

    // Templates
    filteredTemplates,
    templateCount: filteredTemplates.length,
    allTemplates: TEMPLATES,

    // Colors
    selectedColors,
    setTemplateColor,
    getTemplateColor,
    colorPalettes: COLOR_PALETTES,

    // Actions
    selectTemplate,

    // Options
    availableIndustries: validIndustries,
    availableStyles,
    filterOptionCounts,
  };
}
