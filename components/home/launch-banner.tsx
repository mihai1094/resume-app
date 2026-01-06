"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "launch-banner-dismissed";

interface LaunchBannerProps {
  onGetStarted: () => void;
}

export function LaunchBanner({ onGetStarted }: LaunchBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to avoid flash
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsDismissed(false);
      // Small delay for smooth entrance
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
      localStorage.setItem(STORAGE_KEY, "true");
    }, 300);
  };

  if (isDismissed) return null;

  return (
    <div
      className={cn(
        "w-full transition-all duration-300 overflow-hidden",
        isVisible ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <div className="bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center justify-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
              <span className="font-medium">
                Launch Special: All AI features free for a limited time
              </span>
              <Button
                size="sm"
                variant="secondary"
                className="hidden sm:inline-flex h-7 text-xs font-semibold gap-1 ml-2"
                onClick={onGetStarted}
              >
                Get Started
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/10 rounded transition-colors shrink-0"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
