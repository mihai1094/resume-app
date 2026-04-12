"use client";

import { useRef, useEffect, useState } from "react";
import {
  Template,
  getATSBadgeInfo,
  hasTemplatePhotoSupport,
} from "@/lib/constants/templates";
import {
  ColorPalette,
  getTemplateColorOptions,
  getTemplateDefaultColor,
} from "@/lib/constants/color-palettes";
import { TemplateGalleryPreview } from "./template-gallery-preview";
import { ColorSwatchSelector } from "./color-swatch-selector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Star, Camera, CameraOff } from "lucide-react";
import Link from "next/link";

interface TemplateGalleryCardProps {
  template: Template;
  selectedColor: ColorPalette;
  onColorChange: (color: ColorPalette) => void;
  onSelect: () => void;
  onPreview?: () => void;
  index?: number;
  isPopular?: boolean;
  isRecommended?: boolean;
  className?: string;
}

/**
 * Template card for the gallery page
 * Shows template preview, color selector, badges, and selection button
 */
export function TemplateGalleryCard({
  template,
  selectedColor,
  onColorChange,
  onSelect,
  onPreview,
  index = 0,
  isPopular = false,
  isRecommended = false,
  className,
}: TemplateGalleryCardProps) {
  const atsBadge = getATSBadgeInfo(template.features.atsCompatibility);
  const showPopularBadge = isPopular || template.popularity >= 90;
  const templateSupportsPhoto = hasTemplatePhotoSupport(template);
  const identityColor = getTemplateDefaultColor(template.id).primary;

  // Calculate scale for preview
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.25);

  useEffect(() => {
    const updateScale = () => {
      if (previewRef.current) {
        const containerWidth = previewRef.current.offsetWidth;
        // A4 width at 96 DPI is 794px
        const scale = containerWidth / 794;
        setPreviewScale(scale);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Select ${template.name} template`}
      className={cn(
        "group relative rounded-2xl border border-border/80 bg-card overflow-hidden transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-primary/20 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className
      )}
      onClick={(e) => {
        // Don't fire onSelect if the click came from an interactive child
        // (Learn more link, Use Template button, color swatch radio, etc.).
        // The stopPropagation inside each of those sometimes loses a race
        // during Next.js client-side navigation + hydration.
        if ((e.target as HTMLElement).closest('a, button, [role="radio"]')) {
          return;
        }
        onSelect();
      }}
      onKeyDown={(e) => {
        if (
          (e.key === "Enter" || e.key === " ") &&
          e.target === e.currentTarget
        ) {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Identity accent bar — uses the template's default palette primary */}
      <div
        className="h-[3px] w-full"
        style={{ backgroundColor: identityColor }}
        aria-hidden="true"
      />

      {/* Badges - top right corner */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">
        {isRecommended && (
          <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0 text-[10px] px-2.5 py-0.5 shadow-lg shadow-violet-500/20">
            Recommended
          </Badge>
        )}
        {showPopularBadge && !isRecommended && (
          <Badge variant="secondary" className="text-[10px] px-2.5 py-0.5 shadow-sm bg-background/80 backdrop-blur-md border border-border/50 text-foreground">
            <Star className="w-3 h-3 mr-1.5 fill-yellow-500 text-yellow-500" />
            Popular
          </Badge>
        )}
      </div>

      {/* Template Preview - Full card */}
      <div className={cn(
        "aspect-[8.5/11] w-full p-3 relative",
        "bg-gradient-to-r from-orange-50/40 to-muted dark:from-orange-950/20 dark:to-muted",
        index % 2 !== 0 && "max-sm:bg-sky-100/70 max-sm:dark:bg-sky-950/40",
      )}>
        <div
          ref={previewRef}
          className="w-full h-full rounded-md overflow-hidden shadow-sm border border-border bg-white"
          style={{ "--preview-scale": previewScale } as React.CSSProperties}
        >
          <TemplateGalleryPreview
            templateId={template.id}
            primaryColor={selectedColor.primary}
            secondaryColor={selectedColor.secondary}
            ideThemeId={selectedColor.ideTheme?.id}
          />
        </div>
      </div>

      {/* Hover Overlay Content - Bottom only */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/85 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 border-t border-border/40 translate-y-2 group-hover:translate-y-0">
        <div className="space-y-4">
          {/* Template Name */}
          <div>
            <h3 className="font-semibold text-foreground text-base tracking-tight">
              {template.name}
            </h3>
          </div>

          {/* Color/Theme Selector — stop propagation so color change doesn't trigger card select */}
          <div className="space-y-2 pb-1" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {template.id === "technical" ? "Theme" : "Color"}
              </span>
              <span className="text-xs text-muted-foreground">{selectedColor.name}</span>
            </div>
            <ColorSwatchSelector
              palettes={getTemplateColorOptions(template.id)}
              selected={selectedColor}
              onChange={onColorChange}
              size="sm"
            />
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0 font-normal",
                atsBadge.bgColor,
                atsBadge.color,
                "border-transparent"
              )}
            >
              {atsBadge.label}
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground bg-muted border-transparent"
            >
              {template.columns === 1 ? "1 Column" : "2 Columns"}
            </Badge>
            {templateSupportsPhoto ? (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground bg-muted border-transparent"
              >
                <Camera className="w-2.5 h-2.5 mr-0.5" />
                Photo
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground/60 bg-muted border-transparent"
              >
                <CameraOff className="w-2.5 h-2.5 mr-0.5" />
                No Photo
              </Badge>
            )}
          </div>

          {/* Select Button */}
          <Button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="w-full rounded-full font-medium shadow-sm transition-transform active:scale-95"
            size="sm"
          >
            Use Template
          </Button>
          {/* Secondary actions — full preview (lightbox) + learn more (detail page) */}
          <div className="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
            <span className="truncate text-[10px] font-normal opacity-70">{template.description}</span>
            <div className="flex items-center gap-3 shrink-0">
              {onPreview && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onPreview(); }}
                    className="hover:text-foreground transition-colors"
                  >
                    Full preview
                  </button>
                  <span aria-hidden="true" className="text-muted-foreground/40">·</span>
                </>
              )}
              <Link
                href={`/templates/${template.id}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-foreground transition-colors"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
