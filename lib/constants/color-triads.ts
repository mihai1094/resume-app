/**
 * Color triads for the "Color Palette" section in the Template Customizer.
 *
 * Unlike Style Packs, triads apply ONLY to the three color slots and preserve
 * the current font + spacing. They're meant to let users swap the mood without
 * losing their type choices.
 *
 * Every primary here is fill-safe (white text ≥ 4.5:1) so any triad may be
 * applied to any template — what varies is *which* triads we surface per
 * template, matching the template's voice.
 */

export interface ColorTriad {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

export const COLOR_TRIADS: ColorTriad[] = [
  // Neutral / universal
  { id: "ink-stone",        name: "Ink & Stone",        primary: "#0F172A", secondary: "#64748B", accent: "#E2E8F0" }, // 17.4:1
  { id: "graphite-sky",     name: "Graphite & Sky",     primary: "#1F2937", secondary: "#0369A1", accent: "#E0F2FE" }, // 13.6:1
  { id: "midnight-gold",    name: "Midnight & Gold",    primary: "#1E293B", secondary: "#B8860B", accent: "#FEF3C7" }, // 16.6:1

  // Earth / warm
  { id: "oxblood-cream",    name: "Oxblood & Cream",    primary: "#7F1D1D", secondary: "#A16207", accent: "#FAF5EC" }, // 9.2:1
  { id: "espresso-cream",   name: "Espresso & Cream",   primary: "#3F2305", secondary: "#92400E", accent: "#FAF5EC" }, // 13.0:1
  { id: "burgundy-gold",    name: "Burgundy & Gold",    primary: "#881337", secondary: "#C9A84C", accent: "#F5F0E8" }, // 8.4:1

  // Green / cool
  { id: "forest-copper",    name: "Forest & Copper",    primary: "#14532D", secondary: "#B45309", accent: "#FEF3C7" }, // 11.4:1
  { id: "teal-sand",        name: "Teal & Sand",        primary: "#115E59", secondary: "#D4A373", accent: "#FEFAE0" }, // 9.2:1
  { id: "sage-slate",       name: "Sage & Slate",       primary: "#166534", secondary: "#475569", accent: "#F1F5F9" }, // 6.7:1

  // Expressive
  { id: "plum-blush",       name: "Plum & Blush",       primary: "#5B21B6", secondary: "#BE185D", accent: "#FCE7F3" }, // 8.5:1
  { id: "navy-coral",       name: "Navy & Coral",       primary: "#1E3A8A", secondary: "#9F1239", accent: "#FFE4E6" }, // 10.5:1
  { id: "indigo-amber",     name: "Indigo & Amber",     primary: "#3730A3", secondary: "#B45309", accent: "#FEF3C7" }, // 9.7:1
];

/**
 * Template → triad ids surfaced in the Color Palette section.
 *
 * Each template gets 4–6 triads matched to its voice:
 * - Conservative (ivy/executive/bold/classic): neutral + earth, no expressive
 * - Creative (creative/iconic/infographic): expressive + earth, full range
 * - Clinical (ats family): neutral only
 * - Fill-block templates always receive triads with primary ≥ 4.5:1 on white — all
 *   triads above meet this, so the filter here is aesthetic, not a safety gate.
 */
export const TEMPLATE_COLOR_TRIADS: Record<string, string[]> = {
  // Fill-block templates
  iconic:    ["ink-stone", "midnight-gold", "teal-sand", "plum-blush", "burgundy-gold", "indigo-amber"],
  modern:    ["ink-stone", "forest-copper", "teal-sand", "midnight-gold", "graphite-sky"],
  cubic:     ["ink-stone", "graphite-sky", "navy-coral", "teal-sand", "forest-copper"],
  cascade:   ["ink-stone", "midnight-gold", "graphite-sky", "teal-sand", "burgundy-gold"],
  sydney:    ["ink-stone", "navy-coral", "teal-sand", "burgundy-gold", "forest-copper"],
  creative:  ["burgundy-gold", "oxblood-cream", "plum-blush", "indigo-amber", "navy-coral"],

  // Accent-use templates — conservative
  ivy:       ["ink-stone", "midnight-gold", "oxblood-cream", "burgundy-gold", "forest-copper"],
  classic:   ["ink-stone", "midnight-gold", "espresso-cream", "burgundy-gold", "forest-copper"],
  executive: ["midnight-gold", "espresso-cream", "burgundy-gold", "ink-stone", "oxblood-cream"],
  bold:      ["ink-stone", "oxblood-cream", "burgundy-gold", "midnight-gold", "espresso-cream"],
  dublin:    ["midnight-gold", "burgundy-gold", "espresso-cream", "forest-copper", "ink-stone"],
  diamond:   ["midnight-gold", "plum-blush", "burgundy-gold", "teal-sand", "indigo-amber"],

  // Accent-use — minimal / modern
  simple:    ["ink-stone", "graphite-sky", "sage-slate", "midnight-gold", "forest-copper"],
  minimalist:["ink-stone", "graphite-sky", "sage-slate", "midnight-gold"],
  notion:    ["ink-stone", "graphite-sky", "sage-slate", "teal-sand", "plum-blush"],
  nordic:    ["sage-slate", "teal-sand", "forest-copper", "ink-stone"],
  horizon:   ["graphite-sky", "ink-stone", "navy-coral", "teal-sand"],
  timeline:  ["ink-stone", "indigo-amber", "teal-sand", "burgundy-gold", "forest-copper"],
  functional:["graphite-sky", "navy-coral", "plum-blush", "teal-sand", "ink-stone"],
  student:   ["graphite-sky", "teal-sand", "indigo-amber", "forest-copper", "sage-slate"],
  infographic:["indigo-amber", "teal-sand", "plum-blush", "burgundy-gold", "navy-coral"],
  adaptive:  ["ink-stone", "graphite-sky", "teal-sand", "forest-copper"],

  // ATS family — neutrals only
  "ats-clarity":    ["ink-stone", "graphite-sky", "sage-slate"],
  "ats-structured": ["ink-stone", "graphite-sky", "sage-slate", "forest-copper"],
  "ats-compact":    ["ink-stone", "graphite-sky", "sage-slate"],
  "ats-pure":       ["ink-stone", "graphite-sky"],

  // Technical uses IDE themes — show a couple of neutrals as a fallback
  technical: ["ink-stone", "graphite-sky"],
};

export function getColorTriad(id: string): ColorTriad | undefined {
  return COLOR_TRIADS.find((t) => t.id === id);
}

/**
 * Get the color triads surfaced in the Color Palette section for a template.
 * Falls back to a sensible neutral set when the template has no mapping.
 */
export function getColorTriadsForTemplate(templateId: string): ColorTriad[] {
  const ids = TEMPLATE_COLOR_TRIADS[templateId] ?? [
    "ink-stone",
    "graphite-sky",
    "forest-copper",
    "burgundy-gold",
  ];
  return ids
    .map((id) => getColorTriad(id))
    .filter((t): t is ColorTriad => !!t);
}
