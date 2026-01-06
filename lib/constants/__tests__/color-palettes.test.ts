import { describe, it, expect } from "vitest";
import {
  COLOR_PALETTES,
  DEFAULT_PALETTE,
  getColorPalette,
  getTemplateDefaultColor,
  TEMPLATE_DEFAULT_COLORS,
} from "../color-palettes";

describe("COLOR_PALETTES", () => {
  it("has 10 color palettes", () => {
    expect(COLOR_PALETTES).toHaveLength(10);
  });

  it("all palettes have required fields", () => {
    COLOR_PALETTES.forEach((palette) => {
      expect(palette.id).toBeDefined();
      expect(palette.name).toBeDefined();
      expect(palette.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(palette.secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it("all palette IDs are unique", () => {
    const ids = COLOR_PALETTES.map((p) => p.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });
});

describe("DEFAULT_PALETTE", () => {
  it("is the ocean palette", () => {
    expect(DEFAULT_PALETTE.id).toBe("ocean");
  });
});

describe("getColorPalette", () => {
  it("returns the correct palette by ID", () => {
    const forest = getColorPalette("forest");
    expect(forest.id).toBe("forest");
    expect(forest.name).toBe("Forest");
  });

  it("returns default palette for unknown ID", () => {
    const unknown = getColorPalette("nonexistent");
    expect(unknown).toEqual(DEFAULT_PALETTE);
  });

  it("returns default palette for empty string", () => {
    const empty = getColorPalette("");
    expect(empty).toEqual(DEFAULT_PALETTE);
  });
});

describe("TEMPLATE_DEFAULT_COLORS", () => {
  it("has mappings for common templates", () => {
    expect(TEMPLATE_DEFAULT_COLORS.modern).toBe("ocean");
    expect(TEMPLATE_DEFAULT_COLORS.classic).toBe("charcoal");
    expect(TEMPLATE_DEFAULT_COLORS.executive).toBe("amber");
  });
});

describe("getTemplateDefaultColor", () => {
  it("returns correct default for known template", () => {
    const modernDefault = getTemplateDefaultColor("modern");
    expect(modernDefault.id).toBe("ocean");

    const classicDefault = getTemplateDefaultColor("classic");
    expect(classicDefault.id).toBe("charcoal");
  });

  it("returns ocean for unknown template", () => {
    const unknown = getTemplateDefaultColor("nonexistent");
    expect(unknown.id).toBe("ocean");
  });
});
