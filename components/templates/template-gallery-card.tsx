"use client";

import { useRef, useEffect, useState } from "react";
import { Template, getATSBadgeInfo } from "@/lib/constants/templates";
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
      className={cn(
        "group relative rounded-xl border border-border bg-card overflow-hidden transition-all duration-200",
        "hover:border-border hover:shadow-lg",
        className
      )}
    >
      {/* Badges - top right corner */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5 items-end">
        {isRecommended && (
          <Badge className="bg-violet-500 hover:bg-violet-500 text-white text-[10px] px-1.5 py-0.5">
            Recommended
          </Badge>
        )}
        {showPopularBadge && !isRecommended && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
            <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />
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
      <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-4">
        <div className="space-y-3">
          {/* Template Name & Description */}
          <div>
            <h3 className="font-semibold text-foreground text-base">
              {template.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {template.description}
            </p>
          </div>

          {/* Color/Theme Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
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
          <div className="flex flex-wrap gap-1.5">
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
            {template.features.supportsPhoto ? (
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
            onClick={onSelect}
            className="w-full"
            size="sm"
          >
            Use Template
          </Button>
        </div>
      </div>
    </div>
  );
}
