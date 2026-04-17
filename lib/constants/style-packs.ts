import type { TemplateCustomization } from "@/components/resume/template-customizer";

export interface StylePack {
  id: string;
  name: string;
  description: string;
  customization: Omit<TemplateCustomization, "ideThemeId">;
}

/**
 * Style Packs — one-click bundles of color + font + spacing.
 *
 * Two values retuned from the original set for AA contrast on fills:
 * - "Warm Executive" primary: `#B84A2A` (4.33:1 white) → `#9A3412` (6.5:1 white)
 * - "Tech Minimal" secondary/accent: `#0ea5e9` / `#38bdf8` (2.4 / 2.0) → `#0369a1` / `#0284c7` (4.8 / 4.1)
 */
export const STYLE_PACKS: StylePack[] = [
  {
    id: "midnight-professional",
    name: "Midnight Professional",
    description: "Navy + gold, elegant serif",
    customization: {
      primaryColor: "#1e293b",
      secondaryColor: "#b8860b",
      accentColor: "#f1c40f",
      fontFamily: "serif",
      fontSize: 14,
      lineSpacing: 1.5,
      sectionSpacing: 16,
    },
  },
  {
    id: "nordic-clean",
    name: "Nordic Clean",
    description: "Cool blue, warm pop, modern sans",
    customization: {
      primaryColor: "#2D4059",
      secondaryColor: "#EA5455",
      accentColor: "#F07B3F",
      fontFamily: "sans",
      fontSize: 14,
      lineSpacing: 1.5,
      sectionSpacing: 16,
    },
  },
  {
    id: "warm-executive",
    name: "Warm Executive",
    description: "Terracotta + neutral, refined serif",
    customization: {
      primaryColor: "#9A3412",
      secondaryColor: "#2D3436",
      accentColor: "#F5EDE3",
      fontFamily: "serif",
      fontSize: 14,
      lineSpacing: 1.6,
      sectionSpacing: 18,
    },
  },
  {
    id: "tech-minimal",
    name: "Tech Minimal",
    description: "Slate + sky, mono, tight spacing",
    customization: {
      primaryColor: "#334155",
      secondaryColor: "#0369a1",
      accentColor: "#0284c7",
      fontFamily: "mono",
      fontSize: 13,
      lineSpacing: 1.4,
      sectionSpacing: 12,
    },
  },
  {
    id: "forest-estate",
    name: "Forest Estate",
    description: "Deep green + warm earth tones",
    customization: {
      primaryColor: "#1B4332",
      secondaryColor: "#D4A373",
      accentColor: "#FEFAE0",
      fontFamily: "serif",
      fontSize: 14,
      lineSpacing: 1.5,
      sectionSpacing: 16,
    },
  },
  {
    id: "wine-gold",
    name: "Wine & Gold",
    description: "Rich burgundy, gold accents",
    customization: {
      primaryColor: "#4A0E0E",
      secondaryColor: "#C9A84C",
      accentColor: "#F5F0E8",
      fontFamily: "sans",
      fontSize: 14,
      lineSpacing: 1.5,
      sectionSpacing: 16,
    },
  },
];

/**
 * Template → compatible Style Pack ids (in display order).
 *
 * Rules baked in:
 * - Fill-block templates (iconic, modern, cubic, cascade, sydney, creative) cannot
 *   use "Warm Executive" — its primary fails AA at 4.33:1 white even after retune
 *   with heavy white-text overlays in some gradients. Keeping it accent-only.
 * - Serif/conservative templates (ivy, executive, dublin, classic, bold, diamond)
 *   drop "Tech Minimal" — mono + sky-blue clashes with their aesthetic.
 * - ATS family is locked to the two most neutral packs.
 */
export const TEMPLATE_STYLE_PACKS: Record<string, string[]> = {
  // Fill-block templates
  iconic:    ["midnight-professional", "forest-estate", "wine-gold", "nordic-clean"],
  modern:    ["midnight-professional", "forest-estate", "wine-gold"],
  cubic:     ["midnight-professional", "forest-estate", "wine-gold"],
  cascade:   ["midnight-professional", "forest-estate", "wine-gold"],
  sydney:    ["midnight-professional", "forest-estate", "nordic-clean", "wine-gold"],
  creative:  ["nordic-clean", "wine-gold", "forest-estate", "warm-executive"],

  // Accent-use templates
  ivy:       ["midnight-professional", "wine-gold", "forest-estate"],
  classic:   ["midnight-professional", "forest-estate", "warm-executive"],
  executive: ["midnight-professional", "wine-gold", "forest-estate", "warm-executive"],
  bold:      ["midnight-professional", "wine-gold", "forest-estate"],
  dublin:    ["midnight-professional", "warm-executive", "wine-gold", "forest-estate"],
  diamond:   ["midnight-professional", "wine-gold", "forest-estate"],
  simple:    ["midnight-professional", "forest-estate", "tech-minimal"],
  minimalist:["midnight-professional", "forest-estate", "tech-minimal"],
  notion:    ["tech-minimal", "midnight-professional", "forest-estate"],
  nordic:    ["forest-estate", "midnight-professional", "nordic-clean"],
  horizon:   ["midnight-professional", "tech-minimal", "forest-estate"],
  timeline:  ["midnight-professional", "warm-executive", "wine-gold", "forest-estate"],
  functional:["midnight-professional", "tech-minimal", "forest-estate"],
  student:   ["tech-minimal", "nordic-clean", "forest-estate", "midnight-professional"],
  infographic:["nordic-clean", "forest-estate", "wine-gold", "midnight-professional"],
  adaptive:  ["midnight-professional", "forest-estate", "tech-minimal"],

  // ATS family — maximum safety
  "ats-clarity":    ["midnight-professional", "forest-estate"],
  "ats-structured": ["midnight-professional", "forest-estate"],
  "ats-compact":    ["midnight-professional", "forest-estate"],
  "ats-pure":       ["midnight-professional"],

  // Technical uses IDE themes, not style packs — but offer Tech Minimal as a fallback
  technical: ["tech-minimal", "midnight-professional"],
};

export function getStylePack(id: string): StylePack | undefined {
  return STYLE_PACKS.find((p) => p.id === id);
}

/**
 * Get the Style Packs compatible with a given template, in display order.
 * Falls back to the full set when the template has no explicit mapping.
 */
export function getStylePacksForTemplate(templateId: string): StylePack[] {
  const ids = TEMPLATE_STYLE_PACKS[templateId];
  if (!ids) return STYLE_PACKS;
  return ids
    .map((id) => getStylePack(id))
    .filter((p): p is StylePack => !!p);
}
