// HTML-template profile photo.
// PDF templates use @react-pdf/renderer and need their own implementation — do NOT reuse this there.

import { CSSProperties } from "react";
import Image from "next/image";
import { PhotoShape } from "@/lib/constants/templates";
import { getProfilePhotoImageProps } from "@/lib/utils/image";
import { cn } from "@/lib/utils";

interface ProfilePhotoProps {
  photo?: string;
  firstName?: string;
  lastName?: string;
  /** Pixel size — drives Next/Image width/height and the default className sizing */
  size: number;
  /** Visual shape — drives className default (circular → rounded-full, rounded → rounded-lg, square → rounded-none) */
  shape: PhotoShape;
  /** Inline style for borders/accents (template passes primaryColor-based borders) */
  style?: CSSProperties;
  /** Additional classes concatenated after the shape default (shadows, rings, flex helpers, radius overrides) */
  className?: string;
  /** Render an initials monogram when photo is absent. Default: false (render null). */
  showFallback?: boolean;
  /** Monogram background color (solid fill). Defaults to currentColor so templates can drive it via parent color. */
  fallbackBg?: string;
  /** Monogram foreground color. Defaults to white. */
  fallbackFg?: string;
}

const SHAPE_CLASS: Record<PhotoShape, string> = {
  circular: "rounded-full",
  rounded: "rounded-lg",
  square: "rounded-none",
};

/**
 * Unified photo slot used by all HTML templates that support profile photos.
 * - Renders a <next/Image> when `photo` is set, with alt-text safe for empty names.
 * - When `photo` is absent and `showFallback` is true, renders a same-sized monogram.
 * - When `photo` is absent and `showFallback` is false (default), renders null so
 *   the template's header can reflow naturally (matches legacy behavior for most templates).
 */
export function ProfilePhoto({
  photo,
  firstName,
  lastName,
  size,
  shape,
  style,
  className,
  showFallback = false,
  fallbackBg,
  fallbackFg = "white",
}: ProfilePhotoProps) {
  const altName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  const alt = altName || "Profile photo";
  const shapeClass = SHAPE_CLASS[shape];

  if (photo) {
    return (
      <Image
        src={photo}
        alt={alt}
        width={size}
        height={size}
        data-testid="profile-photo"
        data-shape={shape}
        className={cn("object-cover", shapeClass, className)}
        style={{ width: size, height: size, ...style }}
        {...getProfilePhotoImageProps(photo, `${size}px`)}
      />
    );
  }

  if (!showFallback) return null;

  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "CV";

  return (
    <div
      data-testid="profile-photo"
      data-shape={shape}
      className={cn(
        "flex items-center justify-center font-bold flex-shrink-0",
        shapeClass,
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        backgroundColor: fallbackBg ?? "currentColor",
        color: fallbackFg,
        ...style,
      }}
      aria-label={alt}
    >
      {initials}
    </div>
  );
}
