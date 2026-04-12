import { isIP } from "node:net";

const TRUSTED_SINGLE_IP_HEADERS = [
  "x-vercel-forwarded-for",
  "cf-connecting-ip",
  "true-client-ip",
  "fly-client-ip",
  "fastly-client-ip",
] as const;

const FALLBACK_IP_HEADERS = [
  "x-real-ip",
  "x-forwarded-for",
] as const;

function normalizeCandidate(value: string | null): string | null {
  if (!value) return null;

  const first = value
    .split(",")
    .map((part) => part.trim())
    .find(Boolean);

  if (!first) return null;

  return isIP(first) ? first : null;
}

export function extractClientIp(
  headersLike: Headers | { headers: Headers }
): string {
  const headers =
    headersLike instanceof Headers ? headersLike : headersLike.headers;

  for (const header of TRUSTED_SINGLE_IP_HEADERS) {
    const candidate = normalizeCandidate(headers.get(header));
    if (candidate) {
      return candidate;
    }
  }

  for (const header of FALLBACK_IP_HEADERS) {
    const candidate = normalizeCandidate(headers.get(header));
    if (candidate) {
      return candidate;
    }
  }

  return "unknown";
}
