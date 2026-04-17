/**
 * Color palettes for the 5-swatch preview picker.
 *
 * Two tiers — each palette tagged by how contrast-safe its primary is:
 * - `heavy`: primary ≥ 4.5:1 against white — safe on fill blocks (sidebars, colored headers)
 * - `medium`: primary ≥ 4.5:1 as dark text on white — safe as headings/accents only
 *
 * Templates that paint `primaryColor` as a full fill (Iconic, Modern, Cubic, Cascade,
 * Sydney, Creative) only receive `heavy` palettes.
 */

import { IDE_THEMES, type IDETheme, getIDETheme } from "./ide-themes";

export type ColorTier = "heavy" | "medium";

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  tier: ColorTier;
  /** For IDE themes, includes full theme data */
  ideTheme?: IDETheme;
}

export const COLOR_PALETTES: ColorPalette[] = [
  // HEAVY — white text on primary ≥ 4.5:1
  { id: "midnight",  name: "Midnight",  primary: "#0F172A", secondary: "#1E293B", tier: "heavy"  }, // 17.4:1
  { id: "graphite",  name: "Graphite",  primary: "#1F2937", secondary: "#374151", tier: "heavy"  }, // 13.6:1
  { id: "navy",      name: "Navy",      primary: "#1E3A8A", secondary: "#1D4ED8", tier: "heavy"  }, // 10.5:1
  { id: "indigo",    name: "Indigo",    primary: "#3730A3", secondary: "#4F46E5", tier: "heavy"  }, // 9.7:1
  { id: "teal",      name: "Teal",      primary: "#115E59", secondary: "#0F766E", tier: "heavy"  }, // 9.2:1
  { id: "forest",    name: "Forest",    primary: "#14532D", secondary: "#166534", tier: "heavy"  }, // 11.4:1
  { id: "plum",      name: "Plum",      primary: "#5B21B6", secondary: "#6D28D9", tier: "heavy"  }, // 8.5:1
  { id: "burgundy",  name: "Burgundy",  primary: "#881337", secondary: "#9F1239", tier: "heavy"  }, // 8.4:1
  { id: "oxblood",   name: "Oxblood",   primary: "#7F1D1D", secondary: "#991B1B", tier: "heavy"  }, // 9.2:1
  { id: "espresso",  name: "Espresso",  primary: "#3F2305", secondary: "#78350F", tier: "heavy"  }, // 13.0:1

  // MEDIUM — dark-on-white ≥ 4.5:1 (accent/heading use only)
  { id: "slate",     name: "Slate",     primary: "#475569", secondary: "#64748B", tier: "medium" }, // 7.5:1 text
  { id: "sapphire",  name: "Sapphire",  primary: "#1D4ED8", secondary: "#2563EB", tier: "medium" }, // 8.0:1 text
  { id: "emerald",   name: "Emerald",   primary: "#047857", secondary: "#059669", tier: "medium" }, // 5.3:1 text
  { id: "rust",      name: "Rust",      primary: "#9A3412", secondary: "#C2410C", tier: "medium" }, // 6.5:1 text
];

export const DEFAULT_PALETTE = COLOR_PALETTES.find((p) => p.id === "graphite")!;

export type ColorPaletteId = (typeof COLOR_PALETTES)[number]["id"];

export function getColorPalette(id: string): ColorPalette {
  return COLOR_PALETTES.find((p) => p.id === id) ?? DEFAULT_PALETTE;
}

/**
 * Templates that render `primaryColor` as a full fill block (sidebar, colored
 * header, gradient stop). These may only use `heavy` palettes — their options
 * are filtered at render time.
 */
export const FILL_BLOCK_TEMPLATES = new Set<string>([
  "iconic",
  "modern",
  "cubic",
  "cascade",
  "sydney",
  "creative",
]);

/** Template → default palette id */
export const TEMPLATE_DEFAULT_COLORS: Record<string, ColorPaletteId> = {
  // Fill-block templates — heavy only
  iconic:    "indigo",
  modern:    "teal",
  cubic:     "navy",
  cascade:   "graphite",
  sydney:    "navy",
  creative:  "burgundy",

  // Accent templates — can use medium or heavy
  ivy:       "midnight",
  classic:   "graphite",
  executive: "midnight",
  bold:      "midnight",
  dublin:    "midnight",
  diamond:   "sapphire",
  simple:    "graphite",
  minimalist:"graphite",
  notion:    "graphite",
  nordic:    "slate",
  horizon:   "navy",
  timeline:  "graphite",
  functional:"sapphire",
  student:   "sapphire",
  infographic:"indigo",
  adaptive:  "indigo",

  // ATS family — maximum safety
  "ats-clarity":    "navy",
  "ats-structured": "graphite",
  "ats-compact":    "midnight",
  "ats-pure":       "midnight",
};

/**
 * Template → recommended palette ids (order shown in the 5-swatch picker).
 * Fill-block templates only reference `heavy` tier palettes. Others mix tiers
 * to match the template's voice.
 */
export const TEMPLATE_COLOR_OPTIONS: Record<string, ColorPaletteId[]> = {
  // ── Fill-block templates (heavy only) ──
  iconic:    ["indigo", "midnight", "teal", "plum", "burgundy"],
  modern:    ["teal", "forest", "indigo", "plum", "graphite"],
  cubic:     ["navy", "teal", "graphite", "forest", "plum"],
  cascade:   ["graphite", "midnight", "navy", "teal", "plum"],
  sydney:    ["navy", "teal", "burgundy", "forest", "graphite"],
  creative:  ["burgundy", "rust", "plum", "indigo", "teal"],

  // ── Accent-use templates ──
  ivy:       ["midnight", "graphite", "navy", "oxblood", "forest"],
  classic:   ["graphite", "navy", "slate", "burgundy", "espresso"],
  executive: ["midnight", "espresso", "navy", "burgundy", "graphite"],
  bold:      ["midnight", "oxblood", "burgundy", "navy", "espresso"],
  dublin:    ["midnight", "navy", "burgundy", "forest", "espresso"],
  diamond:   ["sapphire", "plum", "burgundy", "emerald", "graphite"],
  simple:    ["graphite", "slate", "midnight", "navy", "emerald"],
  minimalist:["graphite", "slate", "midnight", "emerald", "navy"],
  notion:    ["graphite", "slate", "sapphire", "emerald", "plum"],
  nordic:    ["slate", "graphite", "emerald", "teal", "navy"],
  horizon:   ["navy", "sapphire", "midnight", "teal", "slate"],
  timeline:  ["graphite", "indigo", "teal", "burgundy", "forest"],
  functional:["sapphire", "navy", "plum", "teal", "graphite"],
  student:   ["sapphire", "emerald", "indigo", "teal", "navy"],
  infographic:["indigo", "teal", "burgundy", "plum", "rust"],
  adaptive:  ["indigo", "navy", "teal", "emerald", "graphite"],

  // ── ATS family ──
  "ats-clarity":    ["navy", "sapphire", "graphite", "emerald", "slate"],
  "ats-structured": ["graphite", "navy", "emerald", "sapphire", "slate"],
  "ats-compact":    ["midnight", "graphite", "navy", "emerald", "slate"],
  "ats-pure":       ["midnight", "graphite", "slate"],
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
    tier: "heavy" as ColorTier,
    ideTheme: theme,
  }));
}

/**
 * Get the recommended color palettes for a template
 * Returns IDE themes for Technical template, regular palettes for others
 */
export function getTemplateColorOptions(templateId: string): ColorPalette[] {
  if (templateId === "technical") return ideThemesToPalettes();

  const ids = TEMPLATE_COLOR_OPTIONS[templateId] ?? ["graphite", "navy", "teal", "burgundy", "slate"];
  return ids.map((id) => getColorPalette(id));
}

/**
 * Get the default color palette for a template
 * Returns VS Code Dark+ theme for Technical template
 */
export function getTemplateDefaultColor(templateId: string): ColorPalette {
  if (templateId === "technical") {
    const theme = getIDETheme("vscode-dark");
    return {
      id: theme.id,
      name: theme.name,
      primary: theme.colors.keyword,
      secondary: theme.colors.function,
      tier: "heavy",
      ideTheme: theme,
    };
  }

  const id = TEMPLATE_DEFAULT_COLORS[templateId] ?? "graphite";
  return getColorPalette(id);
}

/** True when the template paints `primaryColor` as a fill block (sidebar, band, gradient). */
export function isFillBlockTemplate(templateId: string): boolean {
  return FILL_BLOCK_TEMPLATES.has(templateId);
}

/** Get IDE theme by palette ID (for Technical template) */
export function getIDEThemeFromPalette(palette: ColorPalette): IDETheme | undefined {
  return palette.ideTheme;
}

// Re-export IDE theme utilities for convenience
export { IDE_THEMES, getIDETheme, type IDETheme } from "./ide-themes";
