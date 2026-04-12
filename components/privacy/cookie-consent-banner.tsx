"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ConsentCategories,
  CURRENT_POLICY_VERSION,
  isConsentCurrent,
  persistConsent,
  readStoredConsent,
} from "@/lib/privacy/consent";

export function CookieConsentBanner() {
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [categories, setCategories] = useState<ConsentCategories>({
    analytics: false,
    resumeAnalytics: false,
  });

  useEffect(() => {
    const stored = readStoredConsent();
    if (!stored || !isConsentCurrent(stored)) {
      setVisible(true);
    }
    if (stored) {
      setCategories(stored.categories);
    }
    setLoaded(true);
  }, []);

  const accept = (nextCategories: ConsentCategories) => {
    persistConsent({
      version: CURRENT_POLICY_VERSION,
      categories: nextCategories,
    });
    setVisible(false);
  };

  if (!loaded || !visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:py-4">
        <p className="text-xs sm:text-sm text-muted-foreground">
          <span className="sm:hidden">Cookies? </span>
          <span className="hidden sm:inline">We use an essential consent cookie and optional web analytics. </span>
          <Link href="/cookies" className="text-primary hover:underline">
            Cookie Policy
          </Link>
          .
        </p>

        {showPrefs && (
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="consent-analytics">Vercel Analytics</Label>
                <p className="text-xs text-muted-foreground">
                  Page views and navigation behaviour
                </p>
              </div>
              <Switch
                id="consent-analytics"
                checked={categories.analytics}
                onCheckedChange={(value) =>
                  setCategories((current) => ({
                    ...current,
                    analytics: value,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="consent-resume-analytics">
                  Resume Analytics
                </Label>
                <p className="text-xs text-muted-foreground">
                  Views and downloads of your public resume links
                </p>
              </div>
              <Switch
                id="consent-resume-analytics"
                checked={categories.resumeAnalytics}
                onCheckedChange={(value) =>
                  setCategories((current) => ({
                    ...current,
                    resumeAnalytics: value,
                  }))
                }
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPrefs((current) => !current)}
            className="hidden sm:inline-flex"
          >
            {showPrefs ? "Hide preferences" : "Manage preferences"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              accept({ analytics: false, resumeAnalytics: false })
            }
          >
            Reject
          </Button>
          {showPrefs && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => accept(categories)}
            >
              Save preferences
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() =>
              accept({ analytics: true, resumeAnalytics: true })
            }
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
