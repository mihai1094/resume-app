/**
 * Color manipulation utilities for template customization
 */

/**
 * Convert hex color to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Lighten or darken a hex color by a percentage
 * @param hex - Hex color string (e.g., "#0ea5e9")
 * @param percent - Positive to lighten, negative to darken (-100 to 100)
 */
export function adjustColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = percent / 100;

  if (factor > 0) {
    // Lighten: move toward white
    return rgbToHex(
      rgb.r + (255 - rgb.r) * factor,
      rgb.g + (255 - rgb.g) * factor,
      rgb.b + (255 - rgb.b) * factor
    );
  } else {
    // Darken: move toward black
    const absFactor = Math.abs(factor);
    return rgbToHex(
      rgb.r * (1 - absFactor),
      rgb.g * (1 - absFactor),
      rgb.b * (1 - absFactor)
    );
  }
}

/**
 * Create a color with opacity
 */
export function withOpacity(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Generate a gradient string from primary to secondary color
 */
export function createGradient(
  primary: string,
  secondary: string,
  direction: "to-b" | "to-r" | "to-br" = "to-b"
): string {
  const directionMap = {
    "to-b": "to bottom",
    "to-r": "to right",
    "to-br": "to bottom right",
  };
  return `linear-gradient(${directionMap[direction]}, ${primary}, ${secondary})`;
}

/**
 * Get contrasting text color (black or white) for a background
 */
export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#ffffff";

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}
