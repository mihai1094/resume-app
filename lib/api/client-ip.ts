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

  // On Vercel, x-vercel-forwarded-for is always set by the infrastructure and
  // cannot be spoofed by clients.  If we reach here on Vercel it means the
  // request bypassed the edge (e.g. a health-check from the same region) —
  // don't fall back to client-controllable headers in that case.
  if (process.env.VERCEL !== "1") {
    for (const header of FALLBACK_IP_HEADERS) {
      const candidate = normalizeCandidate(headers.get(header));
      if (candidate) {
        return candidate;
      }
    }
  }

  return "unknown";
}
