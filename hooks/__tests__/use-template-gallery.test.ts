import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTemplateGallery, getAvailableIndustries, getAvailableStyles } from "../use-template-gallery";
import {
  TEMPLATES,
  PHOTO_SUPPORTED_TEMPLATE_IDS,
  hasTemplatePhotoSupport,
} from "@/lib/constants/templates";
import { COLOR_PALETTES, getTemplateDefaultColor } from "@/lib/constants/color-palettes";

// Mock Next.js navigation
const mockReplace = vi.fn();
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe("useTemplateGallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete("layout");
    mockSearchParams.delete("styles");
    mockSearchParams.delete("photo");
    mockSearchParams.delete("industries");
  });

  describe("initialization", () => {
    it("initializes with default filters", () => {
      const { result } = renderHook(() => useTemplateGallery());

      expect(result.current.filters).toEqual({
        layout: "any",
        styles: [],
        photo: "any",
        industries: [],
      });
    });

    it("returns all templates when no filters applied", () => {
      const { result } = renderHook(() => useTemplateGallery());

      expect(result.current.filteredTemplates.length).toBe(TEMPLATES.length);
      expect(result.current.templateCount).toBe(TEMPLATES.length);
    });

    it("provides all color palettes", () => {
      const { result } = renderHook(() => useTemplateGallery());

      expect(result.current.colorPalettes).toEqual(COLOR_PALETTES);
    });
  });

  describe("filtering", () => {
    it("filters by layout", () => {
      const { result } = renderHook(() => useTemplateGallery());

      act(() => {
        result.current.updateFilter("layout", "two-column");
      });

      expect(result.current.filters.layout).toBe("two-column");
      expect(
        result.current.filteredTemplates.every((t) => t.layout === "two-column")
      ).toBe(true);
    });

    it("filters by style category", () => {
      const { result } = renderHook(() => useTemplateGallery());

      act(() => {
        result.current.updateFilter("styles", ["modern"]);
      });

      expect(result.current.filters.styles).toEqual(["modern"]);
      expect(
        result.current.filteredTemplates.every((t) => t.styleCategory === "modern")
      ).toBe(true);
    });

    it("filters by photo support (with)", () => {
      const { result } = renderHook(() => useTemplateGallery());

      act(() => {
        result.current.updateFilter("photo", "with");
      });

      expect(result.current.filters.photo).toBe("with");
      const expected = new Set(PHOTO_SUPPORTED_TEMPLATE_IDS);
      expect(
        result.current.filteredTemplates.every((t) => expected.has(t.id))
      ).toBe(true);
      expect(result.current.filteredTemplates).toHaveLength(
        PHOTO_SUPPORTED_TEMPLATE_IDS.length
      );
    });

    it("filters by photo support (without)", () => {
      const { result } = renderHook(() => useTemplateGallery());

      act(() => {
        result.current.updateFilter("photo", "without");
      });

      expect(result.current.filters.photo).toBe("without");
      const expected = new Set(PHOTO_SUPPORTED_TEMPLATE_IDS);
      expect(
        result.current.filteredTemplates.every((t) => !expected.has(t.id))
      ).toBe(true);
      expect(result.current.filteredTemplates).toHaveLength(
        TEMPLATES.length - PHOTO_SUPPORTED_TEMPLATE_IDS.length
      );
    });

    it("filters by industry", () => {
      const { result } = renderHook(() => useTemplateGallery());

      act(() => {
        result.current.updateFilter("industries", ["Tech"]);
      });

      expect(result.current.filters.industries).toEqual(["Tech"]);
      expect(
        result.current.filteredTemplates.every((t) =>
          t.targetIndustries.includes("Tech")
        )
      ).toBe(true);
    });

    it("combines multiple filters", () => {
      const { result } = renderHook(() => useTemplateGallery());

      act(() => {
        result.current.updateFilter("layout", "two-column");
        result.current.updateFilter("styles", ["modern"]);
      });

      expect(
        result.current.filteredTemplates.every(
          (t) => t.layout === "two-column" && t.styleCategory === "modern"
        )
      ).toBe(true);
    });

    it("clears all filters", () => {
      const { result } = renderHook(() => useTemplateGallery());

      act(() => {
        result.current.updateFilter("layout", "two-column");
        result.current.updateFilter("styles", ["modern"]);
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({
        layout: "any",
        styles: [],
        photo: "any",
        industries: [],
      });
      expect(result.current.filteredTemplates.length).toBe(TEMPLATES.length);
    });

    it("counts active filters correctly", () => {
      const { result } = renderHook(() => useTemplateGallery());

      expect(result.current.activeFilterCount).toBe(0);

      act(() => {
        result.current.updateFilter("layout", "two-column");
      });
      expect(result.current.activeFilterCount).toBe(1);

      act(() => {
        result.current.updateFilter("styles", ["modern"]);
      });
      expect(result.current.activeFilterCount).toBe(2);

      act(() => {
        result.current.updateFilter("photo", "with");
      });
      expect(result.current.activeFilterCount).toBe(3);

      act(() => {
        result.current.updateFilter("industries", ["Tech"]);
      });
      expect(result.current.activeFilterCount).toBe(4);
    });
  });

  describe("color selection", () => {
    it("returns default color for unselected template", () => {
      const { result } = renderHook(() => useTemplateGallery());

      const color = result.current.getTemplateColor("modern");
      const defaultColor = getTemplateDefaultColor("modern");

      expect(color).toEqual(defaultColor);
    });

    it("sets and retrieves custom color for template", () => {
      const { result } = renderHook(() => useTemplateGallery());
      const forestPalette = COLOR_PALETTES.find((p) => p.id === "forest")!;

      act(() => {
        result.current.setTemplateColor("modern", forestPalette);
      });

      expect(result.current.getTemplateColor("modern")).toEqual(forestPalette);
    });

    it("maintains separate colors per template", () => {
      const { result } = renderHook(() => useTemplateGallery());
      const forestPalette = COLOR_PALETTES.find((p) => p.id === "forest")!;
      const sunsetPalette = COLOR_PALETTES.find((p) => p.id === "sunset")!;

      act(() => {
        result.current.setTemplateColor("modern", forestPalette);
        result.current.setTemplateColor("classic", sunsetPalette);
      });

      expect(result.current.getTemplateColor("modern")).toEqual(forestPalette);
      expect(result.current.getTemplateColor("classic")).toEqual(sunsetPalette);
    });
  });

  describe("template selection", () => {
    it("navigates to editor with template and color params", () => {
      const { result } = renderHook(() => useTemplateGallery());

      act(() => {
        result.current.selectTemplate("modern");
      });

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("/editor/new?")
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("template=modern")
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("color=")
      );
    });

    it("uses selected color when navigating", () => {
      const { result } = renderHook(() => useTemplateGallery());
      const forestPalette = COLOR_PALETTES.find((p) => p.id === "forest")!;

      act(() => {
        result.current.setTemplateColor("modern", forestPalette);
      });

      act(() => {
        result.current.selectTemplate("modern");
      });

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("color=forest")
      );
    });
  });

  describe("URL sync", () => {
    it("updates URL when filter changes", async () => {
      const { result } = renderHook(() => useTemplateGallery());

      act(() => {
        result.current.updateFilter("layout", "two-column");
      });

      // Wait for useEffect to run
      await vi.waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          expect.stringContaining("layout=two-column"),
          { scroll: false }
        );
      });
    });

    it("does not update URL on initial mount", () => {
      renderHook(() => useTemplateGallery());

      // Should not call replace on initial render
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  it("keeps metadata photo flags aligned with audited support", () => {
    expect(
      TEMPLATES.every(
        (template) => template.features.supportsPhoto === hasTemplatePhotoSupport(template)
      )
    ).toBe(true);
  });
});

describe("getAvailableIndustries", () => {
  it("returns unique sorted industries from templates", () => {
    const industries = getAvailableIndustries();

    expect(Array.isArray(industries)).toBe(true);
    expect(industries.length).toBeGreaterThan(0);

    // Check sorted
    const sorted = [...industries].sort();
    expect(industries).toEqual(sorted);

    // Check unique
    const unique = [...new Set(industries)];
    expect(industries.length).toBe(unique.length);
  });
});

describe("getAvailableStyles", () => {
  it("returns all style categories", () => {
    const styles = getAvailableStyles();

    expect(styles).toContain("modern");
    expect(styles).toContain("classic");
    expect(styles).toContain("creative");
    expect(styles).toContain("ats-optimized");
  });
});
