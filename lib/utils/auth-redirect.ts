const INTERNAL_REDIRECT_ORIGIN = "https://resumezeus.app";

export function sanitizeAuthRedirectPath(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || /[\r\n]/.test(trimmed)) {
    return null;
  }

  try {
    const parsed = new URL(trimmed, INTERNAL_REDIRECT_ORIGIN);
    if (parsed.origin !== INTERNAL_REDIRECT_ORIGIN) {
      return null;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}
