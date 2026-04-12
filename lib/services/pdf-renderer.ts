import { isIP } from "node:net";
import type { Browser } from "puppeteer-core";

const A4 = { width: 794, height: 1123 }; // 210mm × 297mm at 96 DPI
const RENDER_TIMEOUT_MS = 15_000;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const PDF_SAFE_PROTOCOLS = new Set(["about:", "data:", "blob:"]);

export const TRUSTED_PDF_ASSET_HOSTS = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "cdn.tailwindcss.com",
] as const;

export interface PdfRenderOptions {
  allowedHosts?: readonly string[];
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
      "https://github.com/nichochar/chromium-min-js/raw/refs/heads/main/chromium-v143.0.1-pack.tar"
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
  });

  return browserInstance;
}

function isIpv4Private(address: string): boolean {
  const octets = address.split(".").map((segment) => Number(segment));
  if (octets.length !== 4 || octets.some((octet) => Number.isNaN(octet))) {
    return false;
  }

  const [first, second] = octets;
  return (
    first === 10 ||
    first === 127 ||
    first === 0 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isIpv6Private(address: string): boolean {
  const normalized = address.toLowerCase();
  return (
    normalized === "::1" ||
    normalized.startsWith("fe80:") ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd")
  );
}

function isPrivateAddress(hostname: string): boolean {
  const ipVersion = isIP(hostname);
  if (ipVersion === 4) {
    return isIpv4Private(hostname);
  }

  if (ipVersion === 6) {
    return isIpv6Private(hostname);
  }

  const normalized = hostname.toLowerCase();
  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local")
  );
}

function isAllowedHost(
  hostname: string,
  allowedHosts: ReadonlySet<string>
): boolean {
  const normalized = hostname.toLowerCase();
  return Array.from(allowedHosts).some(
    (allowedHost) =>
      normalized === allowedHost || normalized.endsWith(`.${allowedHost}`)
  );
}

export function isPdfRenderRequestAllowed(
  resourceUrl: string,
  allowedHosts: readonly string[] = []
): boolean {
  let parsed: URL;
  try {
    parsed = new URL(resourceUrl);
  } catch {
    return false;
  }

  if (PDF_SAFE_PROTOCOLS.has(parsed.protocol)) {
    return true;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }

  const normalizedHost = parsed.hostname.toLowerCase();
  if (isPrivateAddress(normalizedHost)) {
    return false;
  }

  const allowedHostSet = new Set(allowedHosts.map((host) => host.toLowerCase()));
  if (allowedHostSet.size === 0) {
    return false;
  }

  return isAllowedHost(normalizedHost, allowedHostSet);
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
  const allowedHosts = options.allowedHosts ?? [];

  try {
    await page.setJavaScriptEnabled(options.allowJavaScript ?? false);
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (isPdfRenderRequestAllowed(request.url(), allowedHosts)) {
        void request.continue();
        return;
      }

      void request.abort();
    });

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: RENDER_TIMEOUT_MS,
    });

    // Wait for fonts to load before generating PDF
    await page.evaluate(() =>
      document.fonts.ready.then(() => new Promise((r) => setTimeout(r, 100)))
    );

    const pdfBuffer = await page.pdf({
      preferCSSPageSize: true,
      printBackground: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}
