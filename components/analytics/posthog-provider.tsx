"use client";

import { useEffect, useRef, useState } from "react";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  isConsentGranted,
  readStoredConsent,
} from "@/lib/privacy/consent";

let initialized = false;

/**
 * Initialize PostHog exactly once, client-side only, and only after the user
 * has granted analytics consent via the CookieConsentBanner.
 *
 * Emits core product events (signup, template pick, editor open, export, etc.)
 * via `import posthog from "posthog-js"; posthog.capture(...)` from any client
 * component. If consent is not granted, `posthog.capture` calls are no-ops
 * because the client never loads the SDK.
 */
export function PostHogProvider() {
  const [enabled, setEnabled] = useState(false);
  // Store the lazily-loaded posthog instance so we can call opt_in/opt_out later
  const posthogRef = useRef<typeof import("posthog-js")["default"] | null>(null);

  useEffect(() => {
    const updateConsent = () => {
      setEnabled(isConsentGranted(readStoredConsent(), "analytics"));
    };

    updateConsent();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, updateConsent);
    window.addEventListener("storage", updateConsent);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, updateConsent);
      window.removeEventListener("storage", updateConsent);
    };
  }, []);

  useEffect(() => {
    if (!enabled || initialized) return;

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host =
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

    if (!key) return;

    // Dynamically import posthog-js — keeps it out of the initial bundle
    import("posthog-js").then(({ default: posthog }) => {
      posthogRef.current = posthog;
      posthog.init(key, {
        api_host: host,
        capture_pageview: true,
        capture_pageleave: true,
        person_profiles: "identified_only",
        autocapture: false,
        disable_session_recording: true,
        persistence: "localStorage+cookie",
        loaded: () => {
          initialized = true;
        },
      });
    });
  }, [enabled]);

  // Opt-out if consent is revoked mid-session
  useEffect(() => {
    if (!initialized || !posthogRef.current) return;
    if (enabled) {
      posthogRef.current.opt_in_capturing();
    } else {
      posthogRef.current.opt_out_capturing();
    }
  }, [enabled]);

  return null;
}
