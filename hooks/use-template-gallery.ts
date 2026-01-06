"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  TEMPLATES,
  Template,
  TemplateLayout,
  TemplateStyleCategory,
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
 * Get all unique style categories
 */
export function getAvailableStyles(): TemplateStyleCategory[] {
  return ["modern", "classic", "creative", "ats-optimized"];
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
}

/**
 * Hook for managing the template gallery state
 * Handles filtering, color selection per template, and navigation
 */
export function useTemplateGallery(): UseTemplateGalleryReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL params
  const initialFilters = useMemo((): TemplateFilters => {
    const layout = searchParams.get("layout") as TemplateFilters["layout"];
    const stylesParam = searchParams.get("styles");
    const photo = searchParams.get("photo") as TemplateFilters["photo"];
    const industriesParam = searchParams.get("industries");

    return {
      layout: layout && ["any", "single-column", "two-column", "sidebar"].includes(layout)
        ? layout
        : "any",
      styles: stylesParam ? (stylesParam.split(",") as TemplateStyleCategory[]) : [],
      photo: photo && ["any", "with", "without"].includes(photo) ? photo : "any",
      industries: industriesParam ? industriesParam.split(",") : [],
    };
  }, [searchParams]);

  const [filters, setFiltersState] = useState<TemplateFilters>(initialFilters);

  // Color selections per template (keyed by template ID)
  const [selectedColors, setSelectedColors] = useState<Record<string, ColorPalette>>({});

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
    if (filters.styles.length > 0) params.set("styles", filters.styles.join(","));
    if (filters.photo !== "any") params.set("photo", filters.photo);
    if (filters.industries.length > 0) params.set("industries", filters.industries.join(","));

    const queryString = params.toString();
    router.replace(`/templates${queryString ? `?${queryString}` : ""}`, { scroll: false });
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
    return TEMPLATES.filter((template) => {
      // Layout filter
      if (filters.layout !== "any" && template.layout !== filters.layout) {
        return false;
      }

      // Style category filter (multi-select - match any)
      if (
        filters.styles.length > 0 &&
        !filters.styles.includes(template.styleCategory)
      ) {
        return false;
      }

      // Photo support filter
      if (filters.photo === "with" && !template.features.supportsPhoto) {
        return false;
      }
      if (filters.photo === "without" && template.features.supportsPhoto) {
        return false;
      }

      // Industry filter (multi-select - match any)
      if (filters.industries.length > 0) {
        const hasMatchingIndustry = template.targetIndustries.some((ind) =>
          filters.industries.includes(ind)
        );
        if (!hasMatchingIndustry) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

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
    availableIndustries: getAvailableIndustries(),
    availableStyles: getAvailableStyles(),
  };
}
