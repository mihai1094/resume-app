"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  isGrantedCookieConsent,
  readCookieConsentClient,
} from "@/lib/privacy/consent";

export function ConsentedVercelAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const updateConsent = () => {
      setEnabled(isGrantedCookieConsent(readCookieConsentClient()));
    };

    updateConsent();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, updateConsent);
    window.addEventListener("storage", updateConsent);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, updateConsent);
      window.removeEventListener("storage", updateConsent);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Analytics />;
}
