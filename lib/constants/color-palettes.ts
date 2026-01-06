/**
 * Color palettes for template customization
 * These are carefully curated to work across all templates
 */

import { IDE_THEMES, type IDETheme, getIDETheme } from "./ide-themes";

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  /** For IDE themes, includes full theme data */
  ideTheme?: IDETheme;
}

export const COLOR_PALETTES: ColorPalette[] = [
  { id: "ocean", name: "Ocean", primary: "#0ea5e9", secondary: "#22d3ee" },
  { id: "forest", name: "Forest", primary: "#059669", secondary: "#10b981" },
  { id: "sunset", name: "Sunset", primary: "#f97316", secondary: "#fb923c" },
  { id: "plum", name: "Plum", primary: "#7c3aed", secondary: "#a78bfa" },
  { id: "charcoal", name: "Charcoal", primary: "#334155", secondary: "#64748b" },
  { id: "rose", name: "Rose", primary: "#e11d48", secondary: "#fb7185" },
  { id: "amber", name: "Amber", primary: "#d97706", secondary: "#fbbf24" },
  { id: "navy", name: "Navy", primary: "#1e40af", secondary: "#3b82f6" },
  { id: "sage", name: "Sage", primary: "#4d7c0f", secondary: "#84cc16" },
  { id: "slate", name: "Slate", primary: "#475569", secondary: "#94a3b8" },
];

export const DEFAULT_PALETTE = COLOR_PALETTES[0]; // Ocean

export type ColorPaletteId = (typeof COLOR_PALETTES)[number]["id"];

/**
 * Get a color palette by ID
 */
export function getColorPalette(id: string): ColorPalette {
  return COLOR_PALETTES.find((p) => p.id === id) ?? DEFAULT_PALETTE;
}

/**
 * Template-specific default colors
 * Maps template IDs to their natural/default color palette
 */
export const TEMPLATE_DEFAULT_COLORS: Record<string, ColorPaletteId> = {
  modern: "ocean",
  classic: "charcoal",
  executive: "amber",
  minimalist: "slate",
  creative: "sunset",
  technical: "navy",
  adaptive: "plum",
  timeline: "charcoal",
  ivy: "slate",
  "ats-clarity": "ocean",
  "ats-structured": "forest",
  "ats-compact": "plum",
  cascade: "navy",
  dublin: "charcoal",
  infographic: "sunset",
  cubic: "ocean",
  bold: "charcoal",
  simple: "slate",
  diamond: "ocean",
  iconic: "plum",
  student: "forest",
  functional: "rose",
};

/**
 * Template-specific recommended color palettes
 * Each template gets a curated set of colors that work best with its design
 */
export const TEMPLATE_COLOR_OPTIONS: Record<string, ColorPaletteId[]> = {
  // Modern: Tech-forward, vibrant colors
  modern: ["ocean", "plum", "forest", "navy", "rose"],
  // Classic: Traditional, professional tones
  classic: ["charcoal", "navy", "slate", "forest", "amber"],
  // Executive: Premium, sophisticated colors
  executive: ["amber", "charcoal", "navy", "slate", "forest"],
  // Minimalist: Muted, understated palettes
  minimalist: ["slate", "charcoal", "sage", "ocean", "navy"],
  // Creative: Bold, expressive colors
  creative: ["sunset", "rose", "plum", "ocean", "amber"],
  // Technical: Developer-friendly, cool tones
  technical: ["navy", "ocean", "charcoal", "plum", "slate"],
  // Adaptive: Versatile, modern palette
  adaptive: ["plum", "ocean", "forest", "navy", "rose"],
  // Timeline: Story-telling, warm/cool mix
  timeline: ["charcoal", "sunset", "navy", "plum", "forest"],
  // Ivy League: Conservative, traditional
  ivy: ["slate", "charcoal", "navy", "forest", "amber"],
  // ATS Clarity: Professional, clean colors
  "ats-clarity": ["ocean", "navy", "forest", "charcoal", "plum"],
  // ATS Structured: Organized, professional
  "ats-structured": ["forest", "navy", "ocean", "charcoal", "slate"],
  // ATS Compact: Fresh, accessible colors
  "ats-compact": ["plum", "ocean", "forest", "navy", "rose"],
  // Cascade: Corporate, professional elegance
  cascade: ["navy", "charcoal", "forest", "ocean", "slate"],
  // Dublin: Professional with personality
  dublin: ["charcoal", "navy", "slate", "forest", "amber"],
  // Infographic: Visual, creative
  infographic: ["sunset", "rose", "ocean", "plum", "forest"],
  // Cubic: Clean, tech-forward
  cubic: ["ocean", "navy", "forest", "charcoal", "plum"],
  // Bold: Executive, strong typography
  bold: ["charcoal", "navy", "slate", "amber", "forest"],
  // Simple: Minimal, professional
  simple: ["slate", "charcoal", "navy", "forest", "ocean"],
  // Diamond: Clean with accents
  diamond: ["ocean", "navy", "plum", "forest", "charcoal"],
  // Iconic: Bold, creative
  iconic: ["plum", "ocean", "rose", "sunset", "navy"],
  // Student: Fresh, entry-level
  student: ["forest", "ocean", "plum", "navy", "sage"],
  // Functional: Skills-focused
  functional: ["rose", "plum", "ocean", "navy", "charcoal"],
};

/**
 * Convert IDE themes to ColorPalette format
 * Uses keyword as primary and function as secondary for swatch preview
 */
function ideThemesToPalettes(): ColorPalette[] {
  return IDE_THEMES.map((theme) => ({
    id: theme.id,
    name: theme.name,
    primary: theme.colors.keyword,
    secondary: theme.colors.function,
    ideTheme: theme,
  }));
}

/**
 * Get the recommended color palettes for a template
 * Returns IDE themes for Technical template, regular palettes for others
 */
export function getTemplateColorOptions(templateId: string): ColorPalette[] {
  // Technical template uses IDE themes instead of color palettes
  if (templateId === "technical") {
    return ideThemesToPalettes();
  }

  const colorIds = TEMPLATE_COLOR_OPTIONS[templateId] ?? ["ocean", "charcoal", "navy", "forest", "plum"];
  return colorIds.map((id) => getColorPalette(id));
}

/**
 * Get the default color palette for a template
 * Returns VS Code Dark+ theme for Technical template
 */
export function getTemplateDefaultColor(templateId: string): ColorPalette {
  // Technical template defaults to VS Code Dark+
  if (templateId === "technical") {
    const theme = getIDETheme("vscode-dark");
    return {
      id: theme.id,
      name: theme.name,
      primary: theme.colors.keyword,
      secondary: theme.colors.function,
      ideTheme: theme,
    };
  }

  const colorId = TEMPLATE_DEFAULT_COLORS[templateId] ?? "ocean";
  return getColorPalette(colorId);
}

/**
 * Get IDE theme by palette ID (for Technical template)
 */
export function getIDEThemeFromPalette(palette: ColorPalette): IDETheme | undefined {
  return palette.ideTheme;
}

// Re-export IDE theme utilities for convenience
export { IDE_THEMES, getIDETheme, type IDETheme } from "./ide-themes";
