import type { TemplateCustomization } from "@/components/resume/template-customizer";

type TemplateCategory = "professional" | "executive" | "creative" | "technical";

interface FontPairing {
  heading: string;
  body: string;
}

const CATEGORY_FONTS: Record<TemplateCategory, FontPairing> = {
  professional: {
    heading: "var(--font-dm-sans), var(--font-sans)",
    body: "var(--font-source-serif)",
  },
  executive: {
    heading: "var(--font-cormorant)",
    body: "var(--font-inter), var(--font-sans)",
  },
  creative: {
    heading: "var(--font-dm-sans), var(--font-sans)",
    body: "var(--font-source-serif)",
  },
  technical: {
    heading: "var(--font-jetbrains-mono)",
    body: "var(--font-inter), var(--font-sans)",
  },
};

/**
 * Returns the resolved font-family string for a template.
 * When the user has explicitly chosen a font (not the "sans" default),
 * their choice is honored. Otherwise the category default is used.
 */
export function getTemplateFontFamily(
  customization?: Pick<TemplateCustomization, "fontFamily">,
  category: TemplateCategory = "professional"
): string {
  if (customization?.fontFamily && customization.fontFamily !== "sans") {
    if (customization.fontFamily === "serif") {
      return "'Georgia', 'Times New Roman', serif";
    }
    if (customization.fontFamily === "mono") {
      return "'Courier New', 'Courier', monospace";
    }
    return customization.fontFamily;
  }

  return CATEGORY_FONTS[category].body;
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
