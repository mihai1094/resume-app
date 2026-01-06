import { Font } from "@react-pdf/renderer";

/**
 * PDF Font Registration
 *
 * Registers custom fonts from local files for use in PDF templates.
 * Fonts are bundled locally to avoid CDN/network dependency issues.
 *
 * Fonts:
 * - Inter: Modern sans-serif (default for most templates)
 * - Playfair Display: Elegant serif (executive/ivy templates)
 * - Roboto Mono: Monospace (technical template)
 */

// Track registration status
let fontsRegistered = false;

/**
 * Font URLs - using local files from public folder
 * Inter font is bundled locally for full character support
 */
const FONT_URLS = {
  inter: {
    regular: "/fonts/Inter-Regular.ttf",
    medium: "/fonts/Inter-Medium.ttf",
    semibold: "/fonts/Inter-SemiBold.ttf",
    bold: "/fonts/Inter-Bold.ttf",
  },
};

/**
 * Register all PDF fonts
 * Safe to call multiple times - will only register once
 */
export function registerPDFFonts(): void {
  if (fontsRegistered) return;

  try {
    // Inter - Modern sans-serif (full font with all characters)
    Font.register({
      family: "Inter",
      fonts: [
        { src: FONT_URLS.inter.regular, fontWeight: 400 },
        { src: FONT_URLS.inter.medium, fontWeight: 500 },
        { src: FONT_URLS.inter.semibold, fontWeight: 600 },
        { src: FONT_URLS.inter.bold, fontWeight: 700 },
      ],
    });

    // Note: Serif and Mono fonts use built-in PDF fonts (Times-Roman, Courier)
    // which have full character support without network requests

    // Configure hyphenation (disable for cleaner layouts)
    Font.registerHyphenationCallback((word) => [word]);

    fontsRegistered = true;
  } catch (error) {
    console.warn("Failed to register PDF fonts:", error);
  }
}

/**
 * Font family constants for templates
 * - Inter: Custom font (bundled locally)
 * - Times-Roman/Courier: Built-in PDF fonts with full character support
 */
export const PDF_FONTS = {
  sans: "Inter",
  serif: "Times-Roman",  // Built-in PDF font
  mono: "Courier",       // Built-in PDF font
  // Fallbacks
  fallbackSans: "Helvetica",
  fallbackSerif: "Times-Roman",
  fallbackMono: "Courier",
} as const;

/**
 * Get font family based on customization setting
 */
export function getPDFFont(
  fontFamily: "sans" | "serif" | "mono" | string
): string {
  switch (fontFamily) {
    case "sans":
      return PDF_FONTS.sans;
    case "serif":
      return PDF_FONTS.serif;
    case "mono":
      return PDF_FONTS.mono;
    default:
      return PDF_FONTS.sans;
  }
}

/**
 * Unicode icons for PDF templates
 * Using simple Unicode characters that render well in most fonts
 */
export const PDF_ICONS = {
  email: "✉",
  phone: "☎",
  location: "◉",
  link: "🔗",
  linkedin: "in",
  github: "⌘",
  website: "🌐",
  achievement: "★",
  bullet: "●",
  check: "✓",
  diamond: "◆",
  arrow: "→",
  calendar: "📅",
  briefcase: "💼",
  graduation: "🎓",
} as const;

/**
 * Color utilities for PDF templates
 */
export const PDF_COLORS = {
  // Modern template
  modern: {
    primary: "#0d9488",
    accent: "#14b8a6",
    text: "#1f2937",
    muted: "#6b7280",
    background: "#ffffff",
    sidebar: "#0d9488",
  },
  // Classic template
  classic: {
    primary: "#2c2c2c",
    accent: "#8b2942",
    text: "#333333",
    muted: "#666666",
    background: "#ffffff",
    border: "#cccccc",
  },
  // Executive template
  executive: {
    primary: "#1e293b",
    accent: "#b8860b",
    text: "#1e293b",
    muted: "#64748b",
    background: "#ffffff",
    sidebar: "#1e293b",
  },
  // Minimalist template
  minimalist: {
    primary: "#000000",
    accent: "#0ea5e9",
    text: "#111111",
    muted: "#6b7280",
    background: "#ffffff",
    subtle: "#f5f5f5",
  },
  // Creative template
  creative: {
    primary: "#E85D4C",
    accent: "#1a1a1a",
    text: "#1a1a1a",
    muted: "#666666",
    background: "#ffffff",
    sidebar: "#1a1a1a",
  },
  // Technical template
  technical: {
    primary: "#1e1e1e",
    accent: "#569cd6",
    text: "#d4d4d4",
    muted: "#808080",
    background: "#1e1e1e",
    sidebar: "#252526",
    keyword: "#569cd6",
    string: "#ce9178",
    comment: "#6a9955",
  },
  // Timeline template
  timeline: {
    primary: "#4f46e5",
    accent: "#818cf8",
    text: "#1f2937",
    muted: "#6b7280",
    background: "#ffffff",
    line: "#e5e7eb",
  },
  // Adaptive template
  adaptive: {
    primary: "#4f46e5",
    accent: "#10b981",
    text: "#1f2937",
    muted: "#6b7280",
    background: "#ffffff",
    sidebar: "#4f46e5",
  },
  // Ivy template
  ivy: {
    primary: "#14532d",
    accent: "#166534",
    text: "#1f2937",
    muted: "#6b7280",
    background: "#ffffff",
    border: "#14532d",
  },
  // Clarity template (ATS-optimized)
  clarity: {
    primary: "#0f172a",
    accent: "#0ea5e9",
    text: "#334155",
    muted: "#64748b",
    background: "#ffffff",
  },
  // Compact template (ATS-optimized)
  compact: {
    primary: "#1e293b",
    accent: "#3b82f6",
    text: "#334155",
    muted: "#64748b",
    background: "#ffffff",
  },
  // Structured template (ATS-optimized)
  structured: {
    primary: "#111827",
    accent: "#2563eb",
    text: "#374151",
    muted: "#6b7280",
    background: "#ffffff",
  },
  // Iconic template
  iconic: {
    primary: "#4338ca",
    accent: "#7c3aed",
    text: "#1f2937",
    muted: "#6b7280",
    background: "#ffffff",
    sidebar: "#4338ca",
  },
  // Functional template
  functional: {
    primary: "#1e3a5f",
    accent: "#3b82f6",
    text: "#334155",
    muted: "#64748b",
    background: "#ffffff",
  },
  // Simple template
  simple: {
    primary: "#111827",
    accent: "#374151",
    text: "#1f2937",
    muted: "#6b7280",
    background: "#ffffff",
    border: "#d1d5db",
  },
  // Diamond template
  diamond: {
    primary: "#0369a1",
    accent: "#0ea5e9",
    text: "#1f2937",
    muted: "#6b7280",
    background: "#ffffff",
  },
  // Student template
  student: {
    primary: "#166534",
    accent: "#22c55e",
    text: "#1f2937",
    muted: "#6b7280",
    background: "#ffffff",
  },
} as const;

/**
 * PDF customization interface
 */
export interface PDFCustomization {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: "sans" | "serif" | "mono" | string;
  fontSize?: number;
  lineSpacing?: number;
  sectionSpacing?: number;
  /** IDE theme ID for Technical template */
  ideThemeId?: string;
}

/**
 * Get customized colors for a template
 * Returns template defaults merged with any custom overrides
 */
export function getCustomizedColors(
  templateColors: (typeof PDF_COLORS)[keyof typeof PDF_COLORS],
  customization?: PDFCustomization
) {
  if (!customization) return templateColors;

  return {
    ...templateColors,
    primary: customization.primaryColor || templateColors.primary,
    accent: customization.accentColor || customization.secondaryColor || (templateColors as { accent?: string }).accent || templateColors.primary,
    sidebar: customization.primaryColor || (templateColors as { sidebar?: string }).sidebar || templateColors.primary,
  };
}

/**
 * Get customized font for a template
 * Returns the appropriate font family based on customization
 */
export function getCustomizedFont(customization?: PDFCustomization): string {
  if (!customization?.fontFamily) return PDF_FONTS.sans;
  return getPDFFont(customization.fontFamily);
}

/**
 * Typography presets for consistent styling
 */
export const PDF_TYPOGRAPHY = {
  // Name/header sizes
  name: { size: 24, weight: 700 },
  nameSubtitle: { size: 14, weight: 500 },

  // Section headings
  sectionTitle: { size: 12, weight: 600, letterSpacing: 1 },

  // Content
  body: { size: 10, weight: 400 },
  bodySmall: { size: 9, weight: 400 },

  // Labels and metadata
  label: { size: 8, weight: 500 },
  meta: { size: 8, weight: 400 },

  // Highlights
  highlight: { size: 10, weight: 600 },
} as const;
