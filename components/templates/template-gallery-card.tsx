"use client";

import { useRef, useEffect, useState } from "react";
import {
  Template,
  getATSBadgeInfo,
  hasTemplatePhotoSupport,
} from "@/lib/constants/templates";
import { ColorPalette, getTemplateColorOptions } from "@/lib/constants/color-palettes";
import { TemplateGalleryPreview } from "./template-gallery-preview";
import { ColorSwatchSelector } from "./color-swatch-selector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Star, Camera, CameraOff } from "lucide-react";

interface TemplateGalleryCardProps {
  template: Template;
  selectedColor: ColorPalette;
  onColorChange: (color: ColorPalette) => void;
  onSelect: () => void;
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
  isPopular = false,
  isRecommended = false,
  className,
}: TemplateGalleryCardProps) {
  const atsBadge = getATSBadgeInfo(template.features.atsCompatibility);
  const showPopularBadge = isPopular || template.popularity >= 90;
  const templateSupportsPhoto = hasTemplatePhotoSupport(template);

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
        "hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className
      )}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Badges - top right corner */}
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
      <div className="aspect-[8.5/11] w-full bg-muted p-3 relative">
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
          {/* Template Name & Description */}
          <div>
            <h3 className="font-semibold text-foreground text-base tracking-tight">
              {template.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {template.description}
            </p>
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
        </div>
      </div>
    </div>
  );
}
