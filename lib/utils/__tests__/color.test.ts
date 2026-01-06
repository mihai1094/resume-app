import { describe, it, expect } from "vitest";
import {
  hexToRgb,
  rgbToHex,
  adjustColor,
  withOpacity,
  createGradient,
  getContrastColor,
} from "../color";

describe("hexToRgb", () => {
  it("converts 6-digit hex to RGB", () => {
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#00ff00")).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb("#0000ff")).toEqual({ r: 0, g: 0, b: 255 });
    expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("returns null for 3-digit hex (not supported)", () => {
    // hexToRgb only supports 6-digit hex
    expect(hexToRgb("#f00")).toBeNull();
    expect(hexToRgb("#0f0")).toBeNull();
    expect(hexToRgb("#00f")).toBeNull();
  });

  it("handles hex without hash", () => {
    expect(hexToRgb("ff0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("returns null for invalid hex", () => {
    expect(hexToRgb("invalid")).toBeNull();
    expect(hexToRgb("#gg0000")).toBeNull();
    expect(hexToRgb("")).toBeNull();
  });
});

describe("rgbToHex", () => {
  it("converts RGB to hex", () => {
    expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
    expect(rgbToHex(0, 255, 0)).toBe("#00ff00");
    expect(rgbToHex(0, 0, 255)).toBe("#0000ff");
    expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
    expect(rgbToHex(0, 0, 0)).toBe("#000000");
  });

  it("pads single-digit values", () => {
    expect(rgbToHex(10, 10, 10)).toBe("#0a0a0a");
  });
});

describe("adjustColor", () => {
  it("lightens color with positive percent", () => {
    const lighter = adjustColor("#808080", 20);
    // Should be lighter than original
    const originalRgb = hexToRgb("#808080")!;
    const lighterRgb = hexToRgb(lighter)!;
    expect(lighterRgb.r).toBeGreaterThan(originalRgb.r);
  });

  it("darkens color with negative percent", () => {
    const darker = adjustColor("#808080", -20);
    // Should be darker than original
    const originalRgb = hexToRgb("#808080")!;
    const darkerRgb = hexToRgb(darker)!;
    expect(darkerRgb.r).toBeLessThan(originalRgb.r);
  });

  it("returns original for invalid hex", () => {
    expect(adjustColor("invalid", 20)).toBe("invalid");
  });

  it("clamps values to valid range", () => {
    const result = adjustColor("#ffffff", 100);
    const rgb = hexToRgb(result)!;
    expect(rgb.r).toBeLessThanOrEqual(255);
    expect(rgb.g).toBeLessThanOrEqual(255);
    expect(rgb.b).toBeLessThanOrEqual(255);
  });
});

describe("withOpacity", () => {
  it("returns rgba string with correct opacity", () => {
    expect(withOpacity("#ff0000", 0.5)).toBe("rgba(255, 0, 0, 0.5)");
    expect(withOpacity("#00ff00", 1)).toBe("rgba(0, 255, 0, 1)");
    expect(withOpacity("#0000ff", 0)).toBe("rgba(0, 0, 255, 0)");
  });

  it("returns original string for invalid hex", () => {
    // withOpacity returns the input if it can't parse it
    expect(withOpacity("invalid", 0.5)).toBe("invalid");
  });
});

describe("createGradient", () => {
  it("creates linear gradient with default direction (to bottom)", () => {
    const gradient = createGradient("#ff0000", "#0000ff");
    expect(gradient).toContain("linear-gradient");
    expect(gradient).toContain("to bottom");
    expect(gradient).toContain("#ff0000");
    expect(gradient).toContain("#0000ff");
  });

  it("creates gradient with to-r direction", () => {
    const gradient = createGradient("#ff0000", "#0000ff", "to-r");
    expect(gradient).toContain("to right");
  });

  it("creates gradient with to-br direction", () => {
    const gradient = createGradient("#ff0000", "#0000ff", "to-br");
    expect(gradient).toContain("to bottom right");
  });
});

describe("getContrastColor", () => {
  it("returns white for dark colors", () => {
    expect(getContrastColor("#000000")).toBe("#ffffff");
    expect(getContrastColor("#333333")).toBe("#ffffff");
    expect(getContrastColor("#0000ff")).toBe("#ffffff");
  });

  it("returns black for light colors", () => {
    expect(getContrastColor("#ffffff")).toBe("#000000");
    expect(getContrastColor("#ffff00")).toBe("#000000");
    expect(getContrastColor("#00ff00")).toBe("#000000");
  });

  it("returns white for invalid hex", () => {
    expect(getContrastColor("invalid")).toBe("#ffffff");
  });
});
