"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateGalleryPreview } from "./template-gallery-preview";
import { useLastUsedTemplate } from "@/hooks/use-last-used-template";
import { TemplateId } from "@/lib/constants/templates";
import { capture } from "@/lib/analytics/events";

/**
 * Personalized shortcut shown at the top of the template gallery when the
 * user has a previously selected template + color in localStorage. Lets them
 * one-click back into the editor with the same template they chose last time.
 *
 * Renders nothing when there is no stored preference or during SSR/first paint.
 */
export function QuickStartBanner() {
  const router = useRouter();
  const { lastUsed, clear, hasLoaded } = useLastUsedTemplate();

  // Scale the mini preview to its container width (A4 width = 794px at 96 DPI)
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.15);

  useEffect(() => {
    const updateScale = () => {
      if (previewRef.current) {
        setPreviewScale(previewRef.current.offsetWidth / 794);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [lastUsed]);

  if (!hasLoaded || !lastUsed) return null;

  const { template, color } = lastUsed;

  const handleQuickStart = () => {
    capture("template_picked", {
      templateId: template.id,
      colorId: color.id,
      source: "quick_start",
    });
    const params = new URLSearchParams({
      template: template.id,
      color: color.id,
    });
    router.push(`/editor/new?${params.toString()}`);
  };

  return (
    <div className="mb-6 relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent rounded-2xl -z-10 blur-xl opacity-60" />
      <div className="bg-card/80 backdrop-blur-md rounded-2xl border border-primary/20 p-4 sm:p-5 flex items-center gap-4 sm:gap-5 shadow-sm">
        {/* Mini preview thumbnail */}
        <div
          ref={previewRef}
          className="hidden sm:block shrink-0 w-24 aspect-[8.5/11] rounded-md overflow-hidden shadow-sm border border-border bg-white"
          style={{ "--preview-scale": previewScale } as React.CSSProperties}
          aria-hidden="true"
        >
          <TemplateGalleryPreview
            templateId={template.id as TemplateId}
            primaryColor={color.primary}
            secondaryColor={color.secondary}
            ideThemeId={color.ideTheme?.id}
          />
        </div>

        {/* Copy */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wider">
            <Clock className="w-3 h-3" />
            Pick up where you left off
          </div>
          <h3 className="mt-1 text-base sm:text-lg font-semibold text-foreground tracking-tight truncate">
            {template.name}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            Start with {template.name} in {color.name}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Button
            onClick={handleQuickStart}
            size="sm"
            className="rounded-full shadow-sm font-medium"
          >
            <span className="hidden sm:inline">Quick start</span>
            <span className="sm:hidden">Start</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
          <Button
            onClick={clear}
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss quick start"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
