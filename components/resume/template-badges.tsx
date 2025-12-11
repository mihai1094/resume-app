"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ATSCompatibility,
  CustomizationSupport,
  getATSBadgeInfo,
  getCustomizationInfo,
  TemplateFeatures,
} from "@/lib/constants/templates";
import { CheckCircle2, AlertCircle, Palette, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ATSBadgeProps {
  compatibility: ATSCompatibility;
  showTooltip?: boolean;
  size?: "sm" | "default";
}

export function ATSBadge({
  compatibility,
  showTooltip = true,
  size = "default",
}: ATSBadgeProps) {
  const info = getATSBadgeInfo(compatibility);

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border-0",
        info.bgColor,
        info.color,
        size === "sm" && "text-[10px] px-1.5 py-0"
      )}
    >
      {compatibility === "excellent" || compatibility === "good" ? (
        <CheckCircle2
          className={cn("mr-1", size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3")}
        />
      ) : (
        <AlertCircle
          className={cn("mr-1", size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3")}
        />
      )}
      {info.label}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" sideOffset={8} className="max-w-xs z-[100]">
          <p className="text-sm">{info.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface CustomizationBadgeProps {
  support: CustomizationSupport;
  showTooltip?: boolean;
  size?: "sm" | "default";
}

export function CustomizationBadge({
  support,
  showTooltip = true,
  size = "default",
}: CustomizationBadgeProps) {
  const info = getCustomizationInfo(support);

  const getStyles = () => {
    switch (support) {
      case "full":
        return "bg-violet-100 text-violet-700";
      case "partial":
        return "bg-sky-100 text-sky-700";
      case "preview-only":
        return "bg-slate-100 text-slate-600";
      case "none":
        return "bg-gray-100 text-gray-500";
    }
  };

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border-0",
        getStyles(),
        size === "sm" && "text-[10px] px-1.5 py-0"
      )}
    >
      <Palette
        className={cn("mr-1", size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3")}
      />
      {info.label}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">{info.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface TemplateFeatureBadgesProps {
  features: TemplateFeatures;
  showCustomization?: boolean;
  size?: "sm" | "default";
  className?: string;
}

export function TemplateFeatureBadges({
  features,
  showCustomization = false,
  size = "default",
  className,
}: TemplateFeatureBadgesProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <ATSBadge compatibility={features.atsCompatibility} size={size} />
      {showCustomization && (
        <CustomizationBadge
          support={features.customizationSupport}
          size={size}
        />
      )}
      {!features.hasPDFTemplate && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={cn(
                  "font-medium border-0 bg-orange-100 text-orange-700",
                  size === "sm" && "text-[10px] px-1.5 py-0"
                )}
              >
                <Info
                  className={cn(
                    "mr-1",
                    size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"
                  )}
                />
                Preview Only
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">
                This template is available for preview. PDF export uses a
                similar layout.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
