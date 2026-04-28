// @vitest-environment node

import * as fs from "fs";
import * as path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearPdfFontCssCache,
  getCoverLetterPdfFontCss,
  getPdfFontVariableCss,
  getResumePdfFontCss,
} from "../pdf-fonts";

describe("PDF font CSS", () => {
  beforeEach(() => {
    clearPdfFontCssCache();
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    clearPdfFontCssCache();
  });

  it("injects only the body and display fonts required by a customized template", () => {
    const css = getResumePdfFontCss("classic", {
      fontFamily: "classic-serif",
    });

    expect(css).toContain('font-family:"EB Garamond"');
    expect(css).toContain('font-family:"Playfair Display"');
    expect(css).not.toContain('font-family:"Inter"');
    expect(css).not.toContain("_next");
    expect(css).not.toContain(".next");
  });

  it("keeps modern sans exports scoped to Inter", () => {
    const css = getResumePdfFontCss("modern", {
      fontFamily: "sans",
    });

    expect(css).toContain('font-family:"Inter"');
    expect(css).not.toContain('font-family:"Roboto"');
    expect(css).not.toContain('font-family:"EB Garamond"');
  });

  it("does not inject fallback web fonts from a font stack", () => {
    const css = getResumePdfFontCss("creative", {
      fontFamily: "geometric",
    });

    expect(css).toContain('font-family:"DM Sans"');
    expect(css).toContain('font-family:"Playfair Display"');
    expect(css).not.toContain('font-family:"Inter"');
  });

  it("uses data URLs in production and file URLs outside production", () => {
    const devCss = getResumePdfFontCss("modern", { fontFamily: "sans" });
    expect(devCss).toContain("file://");

    vi.stubEnv("NODE_ENV", "production");
    clearPdfFontCssCache();

    const prodCss = getResumePdfFontCss("modern", { fontFamily: "sans" });
    expect(prodCss).toContain("data:font/woff2;base64");
    expect(prodCss).not.toContain("file://");
  });

  it("keeps a heavy production serif font payload below the internal HTML budget", () => {
    vi.stubEnv("NODE_ENV", "production");
    clearPdfFontCssCache();

    const fontCss = getResumePdfFontCss("classic", {
      fontFamily: "classic-serif",
    });
    const pdfCss = fs.readFileSync(
      path.join(process.cwd(), "public", "pdf-styles.css"),
      "utf8"
    );

    expect(Buffer.byteLength(`${fontCss}\n${pdfCss}`, "utf8")).toBeLessThan(
      900 * 1024
    );
  });

  it("does not inject web fonts for classic cover letters", () => {
    expect(getCoverLetterPdfFontCss("classic")).toBe("");
    expect(getCoverLetterPdfFontCss("modern")).toContain('font-family:"Inter"');
  });

  it("defines the PDF-only font variable aliases used by templates and Tailwind", () => {
    const css = getPdfFontVariableCss();

    expect(css).toContain("--font-display");
    expect(css).toContain("--font-serif");
    expect(css).toContain("--font-ui-alt");
    expect(css).toContain("--font-sans");
  });
});

describe("generated PDF Tailwind CSS", () => {
  it("is deterministic utility CSS with no font-face or Next build refs", () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), "public", "pdf-styles.css"),
      "utf8"
    );

    expect(Buffer.byteLength(css, "utf8")).toBeLessThan(100 * 1024);
    expect(css).not.toContain("@font-face");
    expect(css).not.toContain("_next");
    expect(css).not.toContain(".next");
  });
});
