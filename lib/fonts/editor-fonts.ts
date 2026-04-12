/**
 * Template-specific Google Fonts
 *
 * These fonts are only needed when rendering resume templates (editor, public view,
 * template gallery). They are NOT loaded on the homepage or marketing pages.
 *
 * Each font must be instantiated at module level — next/font requirement.
 */

import {
  Cormorant_Garamond,
  DM_Sans,
  JetBrains_Mono,
  Playfair_Display,
  Source_Serif_4,
} from "next/font/google";

export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif-4",
});

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-cormorant-garamond",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono-raw",
});

/**
 * Combined className string for all template fonts.
 * Apply this to any element that wraps resume template rendering.
 */
export function getTemplateFontClassNames(): string {
  return [
    playfairDisplay.variable,
    dmSans.variable,
    sourceSerif4.variable,
    cormorantGaramond.variable,
    jetbrainsMono.variable,
  ].join(" ");
}
