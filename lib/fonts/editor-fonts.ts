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
  EB_Garamond,
  JetBrains_Mono,
  Lato,
  Libre_Baskerville,
  Merriweather,
  Montserrat,
  Nunito_Sans,
  Open_Sans,
  Playfair_Display,
  Poppins,
  Raleway,
  Roboto,
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

export const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-lato-raw",
});

export const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-eb-garamond-raw",
});

export const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-merriweather-raw",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat-raw",
});

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-roboto-raw",
});

export const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans-raw",
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins-raw",
});

export const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-raleway-raw",
});

export const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito-sans-raw",
});

export const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-libre-baskerville-raw",
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
    lato.variable,
    ebGaramond.variable,
    merriweather.variable,
    montserrat.variable,
    roboto.variable,
    openSans.variable,
    poppins.variable,
    raleway.variable,
    nunitoSans.variable,
    libreBaskerville.variable,
  ].join(" ");
}
