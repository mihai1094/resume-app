import type { TemplateCustomization } from "@/components/resume/template-customizer";

export type TemplateCategory = "professional" | "executive" | "creative" | "technical";

interface FontPairing {
  heading: string;
  body: string;
}

/**
 * Category defaults — used when the user hasn't picked a custom font.
 * Tuned so each category has a distinct, fit-for-purpose pairing:
 * - professional: modern sans body + bold sans heading (broadest appeal, ATS-friendly)
 * - executive: editorial serif body + display serif heading (gravitas)
 * - creative: geometric sans body + display serif heading (editorial contrast)
 * - technical: neo-grotesque body + monospace heading (code accent)
 *
 * IMPORTANT: Use the raw next/font variable names (e.g. --font-jetbrains-mono-raw)
 * rather than aliases (e.g. --font-jetbrains-mono). The aliases are defined on :root
 * but the raw variables are only set on editor/template wrapper elements via
 * getTemplateFontClassNames(). CSS resolves custom-property var() references at the
 * declaration site, so aliases on :root become "guaranteed-invalid" when their source
 * variables aren't present there. Using raw names ensures fonts resolve correctly in
 * portals (fullscreen preview) and any element with the font classNames applied.
 */
export const CATEGORY_FONTS: Record<TemplateCategory, FontPairing> = {
  professional: {
    heading: "var(--font-dm-sans), var(--font-sans)",
    body: "var(--font-inter), var(--font-sans)",
  },
  executive: {
    heading: "var(--font-playfair), var(--font-cormorant-garamond), Georgia, serif",
    body: "var(--font-source-serif-4), Georgia, 'Times New Roman', serif",
  },
  creative: {
    heading: "var(--font-playfair), Georgia, serif",
    body: "var(--font-dm-sans), var(--font-sans)",
  },
  technical: {
    heading: "var(--font-jetbrains-mono-raw), 'Courier New', monospace",
    body: "var(--font-inter), var(--font-sans)",
  },
};

/**
 * Semantic font keys → resolved CSS stacks.
 * Every key here maps to a font loaded via `next/font` (editor-fonts.ts)
 * and aliased in app/globals.css.
 *
 * Keep `sans` / `serif` / `mono` — they are persisted in saved resumes
 * (Firestore) and used by style packs.
 */
export const FONT_STACKS: Record<string, string> = {
  sans: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  serif: "var(--font-source-serif-4), Georgia, 'Times New Roman', serif",
  mono: "var(--font-jetbrains-mono-raw), 'Courier New', monospace",
  humanist: "var(--font-lato-raw), 'Helvetica Neue', Arial, sans-serif",
  geometric: "var(--font-dm-sans), var(--font-inter), sans-serif",
  "classic-serif": "var(--font-eb-garamond-raw), Georgia, 'Times New Roman', serif",
  modern: "var(--font-montserrat-raw), 'Helvetica Neue', Arial, sans-serif",
  "reading-serif": "var(--font-merriweather-raw), Georgia, 'Times New Roman', serif",
  "display-serif": "var(--font-playfair), Georgia, 'Times New Roman', serif",
  "refined-serif": "var(--font-cormorant-garamond), Georgia, 'Times New Roman', serif",
  versatile: "var(--font-roboto-raw), 'Helvetica Neue', Arial, sans-serif",
  friendly: "var(--font-open-sans-raw), 'Helvetica Neue', Arial, sans-serif",
  "pop-geometric": "var(--font-poppins-raw), 'Helvetica Neue', Arial, sans-serif",
  elegant: "var(--font-raleway-raw), 'Helvetica Neue', Arial, sans-serif",
  "soft-rounded": "var(--font-nunito-sans-raw), 'Helvetica Neue', Arial, sans-serif",
  "transitional-serif": "var(--font-libre-baskerville-raw), Georgia, 'Times New Roman', serif",
};

/**
 * Returns the resolved font-family string for a template body.
 *
 * Resolution order:
 * 1. No value at all → category body default.
 * 2. Known semantic key (including "sans") → loaded stack from FONT_STACKS.
 * 3. Legacy raw font-stack string → return unchanged (backward-compat with
 *    saved resumes that stored raw strings like "'IBM Plex Sans',...").
 */
export function getTemplateFontFamily(
  customization?: Pick<TemplateCustomization, "fontFamily">,
  category: TemplateCategory = "professional"
): string {
  const value = customization?.fontFamily;

  if (!value) {
    return CATEGORY_FONTS[category].body;
  }

  if (value in FONT_STACKS) {
    return FONT_STACKS[value];
  }

  // Legacy saved value (raw CSS font-family string) → return unchanged.
  return value;
}

/**
 * Returns the heading font for a template category.
 * Useful for templates that use different heading vs body fonts.
 */
export function getTemplateHeadingFont(
  category: TemplateCategory = "professional"
): string {
  return CATEGORY_FONTS[category].heading;
}
