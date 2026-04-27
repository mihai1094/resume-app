import type { Browser } from "puppeteer-core";

const A4 = { width: 794, height: 1123 }; // 210mm × 297mm at 96 DPI
const RENDER_TIMEOUT_MS = 15_000;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

export interface PdfRenderOptions {
  allowJavaScript?: boolean;
}

let browserInstance: Browser | null = null;

/**
 * Resolve the Chromium executable path.
 *
 * - **Production (Vercel):** uses @sparticuz/chromium-min with a bundled tarball
 *   hosted on the official Chromium-for-serverless CDN.
 * - **Development (macOS):** uses the local Google Chrome installation.
 */
async function getExecutablePath(): Promise<string> {
  if (IS_PRODUCTION) {
    const chromium = await import("@sparticuz/chromium-min");
    return chromium.default.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar"
    );
  }

  // Development: prefer CHROMIUM_PATH env var, then common macOS paths
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;

  const fs = await import("fs");
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  throw new Error(
    "No Chromium/Chrome found. Install Chrome or set CHROMIUM_PATH."
  );
}

/**
 * Get Chrome launch arguments.
 * Production uses @sparticuz/chromium-min's optimized args for serverless.
 * Development uses a minimal set.
 */
async function getLaunchArgs(): Promise<string[]> {
  if (IS_PRODUCTION) {
    const chromium = await import("@sparticuz/chromium-min");
    return chromium.default.args;
  }
  return [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
  ];
}

/**
 * Get or launch a headless Chromium browser.
 * Reuses the same instance across warm invocations in serverless.
 */
async function getBrowser(): Promise<Browser> {
  if (browserInstance?.connected) return browserInstance;

  const puppeteer = await import("puppeteer-core");
  const [executablePath, args] = await Promise.all([
    getExecutablePath(),
    getLaunchArgs(),
  ]);

  browserInstance = await puppeteer.default.launch({
    args,
    defaultViewport: { width: A4.width, height: A4.height },
    executablePath,
    headless: true,
    protocolTimeout: 60_000,
  });

  return browserInstance;
}


/**
 * Render a self-contained HTML string to a PDF buffer (A4 format).
 */
export async function renderHtmlToPdf(
  html: string,
  options: PdfRenderOptions = {}
): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setJavaScriptEnabled(options.allowJavaScript ?? false);

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: RENDER_TIMEOUT_MS,
    });

    // Fonts are inlined as data: URIs — document.fonts.ready resolves almost
    // immediately. The 1 s cap is a last-resort safety net only.
    await Promise.race([
      page.evaluate(() => document.fonts.ready),
      new Promise<void>((r) => setTimeout(r, 1_000)),
    ]);

    const pdfBuffer = await page.pdf({
      preferCSSPageSize: true,
      printBackground: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}
