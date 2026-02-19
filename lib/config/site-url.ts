const DEFAULT_SITE_URL = "https://resumeforge.app";

const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Normalizes URL-like env values and strips accidental escaped/newline characters.
 * Returns undefined when the input is missing or invalid.
 */
export function sanitizeUrlEnvValue(raw: string | undefined): string | undefined {
  if (!raw) return undefined;

  const normalized = raw
    .replace(/\\[rn]/g, "")
    .replace(/[\r\n]/g, "")
    .trim();

  if (!normalized || /\s/.test(normalized)) {
    return undefined;
  }

  try {
    const parsed = new URL(normalized);
    if (!HTTP_PROTOCOLS.has(parsed.protocol)) {
      return undefined;
    }

    return normalized.replace(/\/+$/, "") || normalized;
  } catch {
    return undefined;
  }
}

export function getSiteUrl(): string {
  return sanitizeUrlEnvValue(process.env.NEXT_PUBLIC_BASE_URL) || DEFAULT_SITE_URL;
}

export function getAppUrl(): string {
  return sanitizeUrlEnvValue(process.env.NEXT_PUBLIC_APP_URL) || getSiteUrl();
}

export function toAbsoluteUrl(path: string, baseUrl: string = getSiteUrl()): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
