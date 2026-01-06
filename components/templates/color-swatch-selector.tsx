"use client";

import { cn } from "@/lib/utils";
import { ColorPalette } from "@/lib/constants/color-palettes";
import { Check } from "lucide-react";

interface ColorSwatchSelectorProps {
  palettes: ColorPalette[];
  selected: ColorPalette;
  onChange: (palette: ColorPalette) => void;
  size?: "sm" | "md";
  className?: string;
}

/**
 * A row of color swatches for selecting a color palette
 * Used in the template gallery cards for instant color preview
 */
export function ColorSwatchSelector({
  palettes,
  selected,
  onChange,
  size = "sm",
  className,
}: ColorSwatchSelectorProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
  };

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role="radiogroup"
      aria-label="Color palette selection"
    >
      {palettes.map((palette) => {
        const isSelected = palette.id === selected.id;
        return (
          <button
            key={palette.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={palette.name}
            onClick={() => onChange(palette)}
            className={cn(
              "rounded-full transition-all duration-150 flex items-center justify-center",
              sizeClasses[size],
              isSelected
                ? "ring-2 ring-offset-1 ring-gray-400 scale-110"
                : "hover:scale-110"
            )}
            style={{ backgroundColor: palette.primary }}
          >
            {isSelected && (
              <Check
                className={cn(
                  "text-white drop-shadow-sm",
                  size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"
                )}
                strokeWidth={3}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
