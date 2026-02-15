"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  persistCookieConsent,
  readCookieConsentClient,
} from "@/lib/privacy/consent";

export function CookieConsentBanner() {
  const [loaded, setLoaded] = useState(false);
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);

  useEffect(() => {
    setConsent(readCookieConsentClient());
    setLoaded(true);
  }, []);

  const isVisible = useMemo(() => loaded && consent === null, [loaded, consent]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          We use an essential consent cookie and optional web analytics.
          You can read details in the{" "}
          <Link href="/cookies" className="text-primary hover:underline">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              persistCookieConsent("rejected");
              setConsent("rejected");
            }}
          >
            Reject
          </Button>
          <Button
            type="button"
            onClick={() => {
              persistCookieConsent("accepted");
              setConsent("accepted");
            }}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
