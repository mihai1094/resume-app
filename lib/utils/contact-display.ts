/**
 * Contact display helpers
 *
 * Normalize and shorten user-provided contact values (emails, LinkedIn,
 * GitHub, websites) so they fit cleanly inside resume templates without
 * overflowing narrow sidebars or header rows.
 *
 * All functions are pure and safe for empty / malformed input.
 */

const DEFAULT_MAX_LENGTH = 32;

/**
 * Ensures a URL has a protocol prefix so it's a valid href.
 * "linkedin.com/in/foo" → "https://linkedin.com/in/foo"
 * "https://example.com" → "https://example.com"
 */
export const normalizeUrl = (url: string | undefined | null): string => {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

/**
 * Strips protocol (http/https) and optional `www.` prefix.
 */
const stripProtocol = (url: string): string =>
  url.trim().replace(/^https?:\/\/(www\.)?/i, "");

/**
 * Removes a trailing slash, if present.
 */
const stripTrailingSlash = (value: string): string =>
  value.endsWith("/") ? value.slice(0, -1) : value;

/**
 * Truncate a string in the middle, keeping both ends visible.
 *
 * "verylongusername@verylongdomain.com" → "verylongus…domain.com"
 *
 * If the value already fits, it's returned unchanged. Uses a single-char
 * ellipsis ("…") so it remains one glyph on print / PDF.
 */
export const truncateMiddle = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  if (maxLength <= 1) return "…";

  const keep = maxLength - 1; // reserve 1 for the ellipsis
  const head = Math.ceil(keep / 2);
  const tail = Math.floor(keep / 2);
  return `${text.slice(0, head)}…${text.slice(text.length - tail)}`;
};

/**
 * Truncate a string at the end with an ellipsis.
 */
export const truncateEnd = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  if (maxLength <= 1) return "…";
  return `${text.slice(0, maxLength - 1)}…`;
};

/**
 * Format a LinkedIn URL for display.
 * Shows a clean, short label: "/in/username" for personal profiles,
 * "/company/name" for company pages.
 * The full URL is preserved in the href — the display text should be compact.
 *
 * Examples:
 *   "https://www.linkedin.com/in/jordan-parker"       → "/in/jordan-parker"
 *   "linkedin.com/in/jordan-parker-asdasdasdasdasd"   → "/in/jordan-parker-asdas…" (if maxLength=28)
 *   "jordanparker"                                     → "jordanparker"
 */
export const formatLinkedinDisplay = (
  url: string | undefined | null,
  maxLength: number = DEFAULT_MAX_LENGTH,
): string => {
  if (!url) return "";
  const cleaned = stripTrailingSlash(stripProtocol(url));

  // Show "/in/username" — compact, recognisable, saves space
  const match = cleaned.match(/linkedin\.com\/(in|pub|company)\/([^/?#]+)/i);
  if (match) {
    const display = `/${match[1]}/${match[2]}`;
    return truncateEnd(display, maxLength);
  }

  // Otherwise just return the cleaned URL, truncated if needed
  return truncateEnd(cleaned, maxLength);
};

/**
 * Format a GitHub URL for display.
 * Shows a compact label: just the path after github.com.
 *
 * Examples:
 *   "https://github.com/jordan-parker"                → "jordan-parker"
 *   "https://github.com/jordan-parker/my-repo"        → "jordan-parker/my-repo"
 *   "jordan-parker"                                    → "jordan-parker"
 */
export const formatGithubDisplay = (
  url: string | undefined | null,
  maxLength: number = DEFAULT_MAX_LENGTH,
): string => {
  if (!url) return "";
  const cleaned = stripTrailingSlash(stripProtocol(url));

  const match = cleaned.match(/github\.com\/(.+)/i);
  if (match) {
    return truncateEnd(match[1], maxLength);
  }

  return truncateEnd(cleaned, maxLength);
};

/**
 * Format a generic website URL for display.
 * Shows the domain (+ path if short enough).
 *
 * Examples:
 *   "https://www.example.com/"              → "example.com"
 *   "https://example.com/portfolio/projects" → "example.com/portfolio/projects" (or truncated)
 */
export const formatWebsiteDisplay = (
  url: string | undefined | null,
  maxLength: number = DEFAULT_MAX_LENGTH,
): string => {
  if (!url) return "";
  const cleaned = stripTrailingSlash(stripProtocol(url));
  return truncateEnd(cleaned, maxLength);
};

/**
 * Format an email for display. Long emails are truncated in the middle so
 * the domain remains visible (user can still recognize it).
 */
export const formatEmailDisplay = (
  email: string | undefined | null,
  maxLength: number = DEFAULT_MAX_LENGTH,
): string => {
  if (!email) return "";
  return truncateMiddle(email.trim(), maxLength);
};
