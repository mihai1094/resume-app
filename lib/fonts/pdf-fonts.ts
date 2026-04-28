import * as fs from "fs";
import * as path from "path";
import { pathToFileURL } from "url";
import type { TemplateCustomization } from "@/components/resume/template-customizer";
import { TEMPLATES, type TemplateId } from "@/lib/constants/templates";
import type { CoverLetterTemplateId } from "@/lib/types/cover-letter";
import {
  CATEGORY_FONTS,
  FONT_STACKS,
  type TemplateCategory,
} from "@/lib/fonts/template-fonts";

type PdfFontFamily =
  | "Inter"
  | "DM Sans"
  | "Source Serif 4"
  | "Cormorant Garamond"
  | "JetBrains Mono"
  | "Lato"
  | "EB Garamond"
  | "Merriweather"
  | "Montserrat"
  | "Roboto"
  | "Open Sans"
  | "Poppins"
  | "Raleway"
  | "Nunito Sans"
  | "Libre Baskerville"
  | "Playfair Display";

const TEMPLATE_CATEGORY_BY_ID = Object.fromEntries(
  TEMPLATES.map((template) => [template.id, template.category])
) as Record<TemplateId, TemplateCategory>;

const FONT_MARKERS: Array<[string, PdfFontFamily]> = [
  ["--font-inter", "Inter"],
  ["--font-sans", "Inter"],
  ["Inter", "Inter"],
  ["--font-dm-sans", "DM Sans"],
  ["--font-ui-alt", "DM Sans"],
  ["DM Sans", "DM Sans"],
  ["--font-source-serif-4", "Source Serif 4"],
  ["--font-source-serif", "Source Serif 4"],
  ["Source Serif 4", "Source Serif 4"],
  ["--font-cormorant-garamond", "Cormorant Garamond"],
  ["--font-cormorant", "Cormorant Garamond"],
  ["Cormorant Garamond", "Cormorant Garamond"],
  ["--font-jetbrains-mono-raw", "JetBrains Mono"],
  ["--font-jetbrains-mono", "JetBrains Mono"],
  ["JetBrains Mono", "JetBrains Mono"],
  ["--font-lato-raw", "Lato"],
  ["Lato", "Lato"],
  ["--font-eb-garamond-raw", "EB Garamond"],
  ["--font-eb-garamond", "EB Garamond"],
  ["EB Garamond", "EB Garamond"],
  ["--font-merriweather-raw", "Merriweather"],
  ["Merriweather", "Merriweather"],
  ["--font-montserrat-raw", "Montserrat"],
  ["Montserrat", "Montserrat"],
  ["--font-roboto-raw", "Roboto"],
  ["Roboto", "Roboto"],
  ["--font-open-sans-raw", "Open Sans"],
  ["Open Sans", "Open Sans"],
  ["--font-poppins-raw", "Poppins"],
  ["Poppins", "Poppins"],
  ["--font-raleway-raw", "Raleway"],
  ["Raleway", "Raleway"],
  ["--font-nunito-sans-raw", "Nunito Sans"],
  ["Nunito Sans", "Nunito Sans"],
  ["--font-libre-baskerville-raw", "Libre Baskerville"],
  ["Libre Baskerville", "Libre Baskerville"],
  ["--font-playfair", "Playfair Display"],
  ["--font-display", "Playfair Display"],
  ["--font-serif", "Playfair Display"],
  ["Playfair Display", "Playfair Display"],
];

const TEMPLATE_EXTRA_FONT_STACKS: Partial<Record<TemplateId, string[]>> = {
  classic: ["var(--font-display), Georgia, serif"],
  creative: [
    "var(--font-display), Georgia, serif",
    "var(--font-ui-alt), sans-serif",
  ],
  executive: ["var(--font-display), Georgia, serif"],
  nordic: ["var(--font-display), Georgia, serif"],
};

const COVER_LETTER_FONT_STACKS: Partial<Record<CoverLetterTemplateId, string[]>> = {
  modern: ["var(--font-sans), system-ui, sans-serif"],
  minimalist: ["var(--font-sans), system-ui, sans-serif"],
};

const PDF_FONT_FACE_FILE = path.join(
  process.cwd(),
  "public",
  "fonts",
  "pdf",
  "font-faces.css"
);
const PDF_FONT_DIR = path.dirname(PDF_FONT_FACE_FILE);

let fontFaceBlocksCache: Array<{ family: PdfFontFamily; css: string }> | null = null;
const formattedFontCssCache = new Map<string, string>();

export function clearPdfFontCssCache() {
  fontFaceBlocksCache = null;
  formattedFontCssCache.clear();
}

export function getPdfFontVariableCss(): string {
  return `
    :root {
      --font-inter: 'Inter', ui-sans-serif, system-ui, sans-serif;
      --font-sans: var(--font-inter), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      --font-dm-sans: 'DM Sans', sans-serif;
      --font-ui-alt: var(--font-dm-sans), var(--font-sans);
      --font-source-serif: var(--font-source-serif-4), Georgia, serif;
      --font-source-serif-4: 'Source Serif 4', Georgia, 'Times New Roman', serif;
      --font-cormorant: var(--font-cormorant-garamond), Georgia, serif;
      --font-cormorant-garamond: 'Cormorant Garamond', Georgia, serif;
      --font-jetbrains-mono: var(--font-jetbrains-mono-raw), 'Courier New', monospace;
      --font-jetbrains-mono-raw: 'JetBrains Mono', 'Courier New', monospace;
      --font-playfair: 'Playfair Display', Georgia, serif;
      --font-display: var(--font-playfair), Georgia, serif;
      --font-serif: var(--font-playfair), ui-serif, Georgia, serif;
      --font-eb-garamond-raw: 'EB Garamond', Georgia, 'Times New Roman', serif;
      --font-eb-garamond: var(--font-eb-garamond-raw), Georgia, 'Times New Roman', serif;
      --font-lato-raw: 'Lato', 'Helvetica Neue', Arial, sans-serif;
      --font-lato: var(--font-lato-raw), 'Helvetica Neue', Arial, sans-serif;
      --font-merriweather-raw: 'Merriweather', Georgia, 'Times New Roman', serif;
      --font-merriweather: var(--font-merriweather-raw), Georgia, 'Times New Roman', serif;
      --font-montserrat-raw: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;
      --font-montserrat: var(--font-montserrat-raw), 'Helvetica Neue', Arial, sans-serif;
      --font-roboto-raw: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      --font-roboto: var(--font-roboto-raw), 'Helvetica Neue', Arial, sans-serif;
      --font-open-sans-raw: 'Open Sans', 'Helvetica Neue', Arial, sans-serif;
      --font-open-sans: var(--font-open-sans-raw), 'Helvetica Neue', Arial, sans-serif;
      --font-poppins-raw: 'Poppins', 'Helvetica Neue', Arial, sans-serif;
      --font-poppins: var(--font-poppins-raw), 'Helvetica Neue', Arial, sans-serif;
      --font-raleway-raw: 'Raleway', 'Helvetica Neue', Arial, sans-serif;
      --font-raleway: var(--font-raleway-raw), 'Helvetica Neue', Arial, sans-serif;
      --font-nunito-sans-raw: 'Nunito Sans', 'Helvetica Neue', Arial, sans-serif;
      --font-nunito-sans: var(--font-nunito-sans-raw), 'Helvetica Neue', Arial, sans-serif;
      --font-libre-baskerville-raw: 'Libre Baskerville', Georgia, 'Times New Roman', serif;
      --font-libre-baskerville: var(--font-libre-baskerville-raw), Georgia, 'Times New Roman', serif;
    }
  `;
}

export function getResumePdfFontCss(
  templateId: TemplateId,
  customization?: Pick<TemplateCustomization, "fontFamily">
): string {
  const families = new Set<PdfFontFamily>();
  const category = TEMPLATE_CATEGORY_BY_ID[templateId] ?? "professional";
  const fontStack = getCustomizationFontStack(customization, category);

  addFamiliesFromFontStack(fontStack, families);

  for (const stack of TEMPLATE_EXTRA_FONT_STACKS[templateId] ?? []) {
    addFamiliesFromFontStack(stack, families);
  }

  return getPdfFontCssForFamilies(families);
}

export function getCoverLetterPdfFontCss(
  templateId: CoverLetterTemplateId
): string {
  const families = new Set<PdfFontFamily>();

  for (const stack of COVER_LETTER_FONT_STACKS[templateId] ?? []) {
    addFamiliesFromFontStack(stack, families);
  }

  return getPdfFontCssForFamilies(families);
}

export function getPdfFontCssForFamilies(
  families: Iterable<PdfFontFamily>
): string {
  const selected = [...new Set(families)].sort();
  if (selected.length === 0) return "";

  const cacheKey = `${process.env.NODE_ENV === "production" ? "data" : "file"}:${selected.join("|")}`;
  const cached = formattedFontCssCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const selectedSet = new Set(selected);
  const css = getFontFaceBlocks()
    .filter((block) => selectedSet.has(block.family))
    .map((block) => rewriteFontFaceSource(block.css))
    .join("\n");

  formattedFontCssCache.set(cacheKey, css);
  return css;
}

function getCustomizationFontStack(
  customization: Pick<TemplateCustomization, "fontFamily"> | undefined,
  category: TemplateCategory
): string {
  const value = customization?.fontFamily;

  if (!value) {
    return CATEGORY_FONTS[category].body;
  }

  return FONT_STACKS[value] ?? value;
}

function addFamiliesFromFontStack(
  fontStack: string,
  families: Set<PdfFontFamily>
) {
  let firstMatch: { index: number; family: PdfFontFamily } | null = null;

  for (const [marker, family] of FONT_MARKERS) {
    const index = fontStack.indexOf(marker);
    if (index === -1) continue;

    if (firstMatch === null || index < firstMatch.index) {
      firstMatch = { index, family };
    }
  }

  if (firstMatch !== null) {
    families.add(firstMatch.family);
  }
}

function getFontFaceBlocks(): Array<{ family: PdfFontFamily; css: string }> {
  if (fontFaceBlocksCache !== null) return fontFaceBlocksCache;

  const css = fs.readFileSync(PDF_FONT_FACE_FILE, "utf8");
  fontFaceBlocksCache = [...css.matchAll(/@font-face\{[^}]*\}/g)]
    .map((match) => {
      const familyMatch = match[0].match(/font-family:"([^"]+)"/);
      if (!familyMatch) return null;
      return {
        family: familyMatch[1] as PdfFontFamily,
        css: match[0],
      };
    })
    .filter((block): block is { family: PdfFontFamily; css: string } => block !== null);

  return fontFaceBlocksCache;
}

function rewriteFontFaceSource(fontFaceCss: string): string {
  return fontFaceCss.replace(
    /url\(["']?([^)"']+)["']?\)/,
    (_match, sourceUrl: string) => {
      const filename = path.basename(sourceUrl);
      const fontPath = path.join(PDF_FONT_DIR, filename);

      if (process.env.NODE_ENV === "production") {
        const b64 = fs.readFileSync(fontPath).toString("base64");
        return `url("data:font/woff2;base64,${b64}")`;
      }

      return `url("${pathToFileURL(fontPath).href}")`;
    }
  );
}
