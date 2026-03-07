export const COOKIE_CONSENT_COOKIE_NAME = "rf_cookie_consent";
export const COOKIE_CONSENT_STORAGE_KEY = "rf_cookie_consent";
export const COOKIE_CONSENT_CHANGED_EVENT = "rf-cookie-consent-changed";
export const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

// Bump this when Privacy Policy or Cookie Policy changes materially.
export const CURRENT_POLICY_VERSION = "2026-03";

export type CookieConsentValue = "accepted" | "rejected";

export type ConsentCategories = {
  analytics: boolean;
  resumeAnalytics: boolean;
};

export type StoredConsent = {
  version: string;
  categories: ConsentCategories;
};

export function parseStoredConsent(
  raw: string | null | undefined
): StoredConsent | null {
  if (!raw) return null;

  if (raw === "accepted") {
    return {
      version: "legacy",
      categories: { analytics: true, resumeAnalytics: true },
    };
  }

  if (raw === "rejected") {
    return {
      version: "legacy",
      categories: { analytics: false, resumeAnalytics: false },
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredConsent> | null;
    if (
      parsed &&
      typeof parsed.version === "string" &&
      parsed.categories &&
      typeof parsed.categories.analytics === "boolean" &&
      typeof parsed.categories.resumeAnalytics === "boolean"
    ) {
      return {
        version: parsed.version,
        categories: {
          analytics: parsed.categories.analytics,
          resumeAnalytics: parsed.categories.resumeAnalytics,
        },
      };
    }
  } catch {
    // Ignore malformed consent payloads.
  }

  return null;
}

export function parseCookieConsent(
  value: string | null | undefined
): CookieConsentValue | null {
  if (value === "accepted" || value === "rejected") {
    return value;
  }
  return null;
}

export function isConsentGranted(
  consent: StoredConsent | null,
  category: keyof ConsentCategories
): boolean {
  return consent?.categories[category] === true;
}

export function isGrantedCookieConsent(
  value: string | null | undefined
): boolean {
  return parseCookieConsent(value) === "accepted";
}

export function isConsentCurrent(stored: StoredConsent | null): boolean {
  if (!stored) return false;
  if (stored.version === "legacy") return false;
  return stored.version === CURRENT_POLICY_VERSION;
}

function readCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${escapedName}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function readStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = parseStoredConsent(
      window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    );
    if (stored) return stored;
  } catch {
    // Ignore storage failures.
  }

  return parseStoredConsent(readCookieValue(COOKIE_CONSENT_COOKIE_NAME));
}

export function readCookieConsentClient(): CookieConsentValue | null {
  const stored = readStoredConsent();
  if (!stored) return null;

  const allAccepted = Object.values(stored.categories).every(Boolean);
  const allRejected = Object.values(stored.categories).every((value) => !value);

  if (allAccepted) return "accepted";
  if (allRejected) return "rejected";
  return "accepted";
}

export function persistConsent(consent: StoredConsent): void {
  if (typeof window === "undefined") return;

  const raw = JSON.stringify(consent);

  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, raw);
  } catch {
    // Ignore storage failures and still set cookie.
  }

  const secureSuffix = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${COOKIE_CONSENT_COOKIE_NAME}=${encodeURIComponent(raw)}; ` +
    `Max-Age=${COOKIE_CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secureSuffix}`;

  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGED_EVENT));
}

export function persistCookieConsent(value: CookieConsentValue): void {
  const accepted = value === "accepted";

  persistConsent({
    version: CURRENT_POLICY_VERSION,
    categories: {
      analytics: accepted,
      resumeAnalytics: accepted,
    },
  });
}
