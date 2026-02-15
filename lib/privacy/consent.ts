export const COOKIE_CONSENT_COOKIE_NAME = "rf_cookie_consent";
export const COOKIE_CONSENT_STORAGE_KEY = "rf_cookie_consent";
export const COOKIE_CONSENT_CHANGED_EVENT = "rf-cookie-consent-changed";
export const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

export type CookieConsentValue = "accepted" | "rejected";

export function parseCookieConsent(
  value: string | null | undefined
): CookieConsentValue | null {
  if (value === "accepted" || value === "rejected") {
    return value;
  }
  return null;
}

export function isGrantedCookieConsent(
  value: string | null | undefined
): boolean {
  return parseCookieConsent(value) === "accepted";
}

function readCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escapedName = name.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${escapedName}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function readCookieConsentClient(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = parseCookieConsent(
      window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    );
    if (stored) return stored;
  } catch {
    // Ignore storage failures and fall back to cookie check.
  }

  return parseCookieConsent(readCookieValue(COOKIE_CONSENT_COOKIE_NAME));
}

export function persistCookieConsent(value: CookieConsentValue): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
  } catch {
    // Ignore storage failures and still set cookie.
  }

  const secureSuffix = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${value}; Max-Age=${COOKIE_CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secureSuffix}`;
  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGED_EVENT));
}
