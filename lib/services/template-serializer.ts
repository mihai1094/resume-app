import { createElement } from "react";
import { ResumeData, CURRENT_RESUME_SCHEMA_VERSION } from "@/lib/types/resume";
import { TemplateId } from "@/lib/constants/templates";
import { TemplateCustomization } from "@/components/resume/template-customizer";
import { DEFAULT_TEMPLATE_CUSTOMIZATION } from "@/lib/constants/defaults";
import { prepareResumeDataForTemplateDisplay } from "@/lib/resume/skills-display";
import { CoverLetterData, CoverLetterTemplateId } from "@/lib/types/cover-letter";
import * as path from "path";
import * as fs from "fs";

// ── Resume template imports ───────────────────────────────────────

async function getResumeTemplateComponent(
  templateId: TemplateId
): Promise<React.ComponentType<{ data: ResumeData; customization?: TemplateCustomization }>> {
  const templates: Record<string, () => Promise<{ default: React.ComponentType<any> }>> = {
    modern: () => import("@/components/resume/templates/modern-template").then(m => ({ default: m.ModernTemplate })),
    classic: () => import("@/components/resume/templates/classic-template").then(m => ({ default: m.ClassicTemplate })),
    executive: () => import("@/components/resume/templates/executive-template").then(m => ({ default: m.ExecutiveTemplate })),
    minimalist: () => import("@/components/resume/templates/minimalist-template").then(m => ({ default: m.MinimalistTemplate })),
    creative: () => import("@/components/resume/templates/creative-template").then(m => ({ default: m.CreativeTemplate })),
    technical: () => import("@/components/resume/templates/technical-template").then(m => ({ default: m.TechnicalTemplate })),
    timeline: () => import("@/components/resume/templates/timeline-template").then(m => ({ default: m.TimelineTemplate })),
    ivy: () => import("@/components/resume/templates/ivy-template").then(m => ({ default: m.IvyTemplate })),
    "ats-clarity": () => import("@/components/resume/templates/ats-clarity-template").then(m => ({ default: m.ATSClarityTemplate })),
    "ats-structured": () => import("@/components/resume/templates/ats-structured-template").then(m => ({ default: m.ATSStructuredTemplate })),
    "ats-compact": () => import("@/components/resume/templates/ats-compact-template").then(m => ({ default: m.ATSCompactTemplate })),
    dublin: () => import("@/components/resume/templates/dublin-template").then(m => ({ default: m.DublinTemplate })),
    infographic: () => import("@/components/resume/templates/infographic-template").then(m => ({ default: m.InfographicTemplate })),
    cubic: () => import("@/components/resume/templates/cubic-template").then(m => ({ default: m.CubicTemplate })),
    bold: () => import("@/components/resume/templates/bold-template").then(m => ({ default: m.BoldTemplate })),
    simple: () => import("@/components/resume/templates/simple-template").then(m => ({ default: m.SimpleTemplate })),
    iconic: () => import("@/components/resume/templates/iconic-template").then(m => ({ default: m.IconicTemplate })),
    student: () => import("@/components/resume/templates/student-template").then(m => ({ default: m.StudentTemplate })),
    functional: () => import("@/components/resume/templates/functional-template").then(m => ({ default: m.FunctionalTemplate })),
    notion: () => import("@/components/resume/templates/notion-template").then(m => ({ default: m.NotionTemplate })),
    nordic: () => import("@/components/resume/templates/nordic-template").then(m => ({ default: m.NordicTemplate })),
    horizon: () => import("@/components/resume/templates/horizon-template").then(m => ({ default: m.HorizonTemplate })),
    sydney: () => import("@/components/resume/templates/sydney-template").then(m => ({ default: m.SydneyTemplate })),
  };

  const loader = templates[templateId] || templates.modern;
  const mod = await loader();
  return mod.default;
}

// ── Cover letter template imports ─────────────────────────────────

async function getCoverLetterTemplateComponent(
  templateId: CoverLetterTemplateId
): Promise<React.ComponentType<{ data: CoverLetterData }>> {
  switch (templateId) {
    case "classic":
    case "executive": {
      const mod = await import("@/components/cover-letter/templates/classic-cover-letter");
      return mod.ClassicCoverLetter;
    }
    case "modern":
    case "minimalist":
    default: {
      const mod = await import("@/components/cover-letter/templates/modern-cover-letter");
      return mod.ModernCoverLetter;
    }
  }
}

// ── Data normalization ────────────────────────────────────────────

function normalizeResumeData(data: ResumeData, templateId: TemplateId): ResumeData {
  const emptyArray: never[] = [];
  const normalized: ResumeData = {
    schemaVersion: data.schemaVersion ?? CURRENT_RESUME_SCHEMA_VERSION,
    personalInfo: {
      firstName: data.personalInfo?.firstName || "",
      lastName: data.personalInfo?.lastName || "",
      email: data.personalInfo?.email || "",
      phone: data.personalInfo?.phone || "",
      location: data.personalInfo?.location || "",
      website: data.personalInfo?.website || "",
      linkedin: data.personalInfo?.linkedin || "",
      github: data.personalInfo?.github || "",
      summary: data.personalInfo?.summary || "",
    },
    workExperience: data.workExperience || emptyArray,
    education: data.education || emptyArray,
    skills: data.skills || emptyArray,
    projects: data.projects || emptyArray,
    languages: data.languages || emptyArray,
    certifications: data.certifications || emptyArray,
    courses: data.courses || emptyArray,
    hobbies: data.hobbies || emptyArray,
    extraCurricular: data.extraCurricular || emptyArray,
    customSections: data.customSections || emptyArray,
  };
  return prepareResumeDataForTemplateDisplay(normalized, templateId);
}

// ── Shared HTML scaffolding ───────────────────────────────────────

const FONT_CSS_VARIABLES = `
  :root {
    --font-inter: 'Inter', sans-serif;
    --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
    --font-dm-sans: 'DM Sans', sans-serif;
    --font-source-serif: 'Source Serif 4', serif;
    --font-source-serif-4: 'Source Serif 4', serif;
    --font-cormorant: 'Cormorant Garamond', serif;
    --font-cormorant-garamond: 'Cormorant Garamond', serif;
    --font-jetbrains-mono: 'JetBrains Mono', monospace;
    --font-jetbrains-mono-raw: 'JetBrains Mono', monospace;
    --font-playfair: 'Playfair Display', serif;
    --font-eb-garamond-raw: 'EB Garamond', serif;
    --font-eb-garamond: 'EB Garamond', Georgia, 'Times New Roman', serif;
    --font-lato-raw: 'Lato', sans-serif;
    --font-lato: 'Lato', 'Helvetica Neue', Arial, sans-serif;
    --font-merriweather-raw: 'Merriweather', serif;
    --font-montserrat-raw: 'Montserrat', sans-serif;
    --font-roboto-raw: 'Roboto', sans-serif;
    --font-open-sans-raw: 'Open Sans', sans-serif;
    --font-poppins-raw: 'Poppins', sans-serif;
    --font-raleway-raw: 'Raleway', sans-serif;
    --font-nunito-sans-raw: 'Nunito Sans', sans-serif;
    --font-libre-baskerville-raw: 'Libre Baskerville', serif;
  }
`;

// Rewrite url("../media/x.woff2") and url(/_next/static/media/x.woff2)
// to inline data URIs so Chromium needs zero network calls for fonts.
function inlineWoff2Urls(css: string): string {
  const isDev = process.env.NODE_ENV !== "production";
  const base = path.join(process.cwd(), ".next");
  const mediaDir = isDev
    ? path.join(base, "dev", "static", "media")
    : path.join(base, "static", "media");

  return css.replace(
    /url\(["']?(?:\.\.\/media\/|\/(?:_next\/)?static\/media\/)([^)"'\s]+\.woff2)["']?\)/g,
    (_match, filename: string) => {
      try {
        const b64 = fs.readFileSync(path.join(mediaDir, filename)).toString("base64");
        return `url(data:font/woff2;base64,${b64})`;
      } catch {
        return _match;
      }
    }
  );
}

let pdfCssCache: string | null = null;

async function getPdfCss(): Promise<string> {
  if (pdfCssCache !== null) return pdfCssCache;

  const base = path.join(process.cwd(), ".next");
  const isDev = process.env.NODE_ENV !== "production";

  const candidates = isDev
    ? [
        path.join(base, "dev", "static", "chunks"),
        path.join(base, "static", "chunks"),
        path.join(base, "static", "css"),
      ]
    : [
        path.join(base, "static", "chunks"),
        path.join(base, "static", "css"),
        path.join(base, "dev", "static", "chunks"),
      ];

  let raw = "";
  for (const cssDir of candidates) {
    try {
      const files = fs.readdirSync(cssDir).filter((f: string) => f.endsWith(".css"));
      if (files.length === 0) continue;
      for (const file of files) {
        raw += fs.readFileSync(path.join(cssDir, file), "utf8") + "\n";
      }
      if (raw.length > 0) break;
    } catch {
      // directory doesn't exist, try next
    }
  }

  pdfCssCache = raw ? inlineWoff2Urls(raw) : "";
  return pdfCssCache;
}

function buildHtmlDocument(bodyHtml: string, pdfCss: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=210mm, initial-scale=1.0">
  <style>
    ${FONT_CSS_VARIABLES}
    ${pdfCss}

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 210mm;
      background: white;
    }

    .resume-template-scale {
      font-size: calc(1em * var(--resume-text-scale, 1));
    }

    @page { size: A4; margin: 8mm 0; }

    /* Remove fixed 297mm min-height used for preview sizing.
       In PDF, page size comes from @page, not from element min-height.
       Sidebars stretch via flexbox (align-items: stretch is default). */
    .resume-template-scale * {
      min-height: auto !important;
    }
    .resume-template-scale > div {
      padding-bottom: 0 !important;
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

// ── Render helper (dynamic import to avoid Next.js static analysis) ──

async function renderElementToString(element: React.ReactElement): Promise<string> {
  // Dynamic import avoids Next.js webpack error about react-dom/server
  // in files that might be traced from client bundles
  const { renderToString } = await import("react-dom/server");
  return renderToString(element);
}

// ── Public API ────────────────────────────────────────────────────

/**
 * Serialize a resume template to a self-contained HTML document
 * that Chromium can render to PDF.
 */
export async function serializeTemplate(
  data: ResumeData,
  templateId: TemplateId,
  customization?: TemplateCustomization
): Promise<string> {
  const TemplateComponent = await getResumeTemplateComponent(templateId);
  const safeData = normalizeResumeData(data, templateId);

  const baseline = DEFAULT_TEMPLATE_CUSTOMIZATION.fontSize;
  const configuredFontSize = customization?.fontSize ?? baseline;
  const normalizedScale = Number((configuredFontSize / baseline).toFixed(4));

  const templateHtml = await renderElementToString(
    createElement(
      "div",
      {
        className: "resume-template-scale",
        style: { "--resume-text-scale": normalizedScale } as React.CSSProperties,
      },
      createElement(TemplateComponent, { data: safeData, customization })
    )
  );

  const pdfCss = await getPdfCss();
  return buildHtmlDocument(templateHtml, pdfCss);
}

/**
 * Serialize a cover letter template to a self-contained HTML document
 * that Chromium can render to PDF.
 */
export async function serializeCoverLetterTemplate(
  data: CoverLetterData,
  templateId: CoverLetterTemplateId = "modern"
): Promise<string> {
  const TemplateComponent = await getCoverLetterTemplateComponent(templateId);

  const templateHtml = await renderElementToString(
    createElement(TemplateComponent, { data })
  );

  const pdfCss = await getPdfCss();
  return buildHtmlDocument(templateHtml, pdfCss);
}
