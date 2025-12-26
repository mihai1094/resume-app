/**
 * Image utility functions for profile photo handling
 */

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_DIMENSION = 400; // Max width/height for stored image
const JPEG_QUALITY = 0.85;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate image file type and size
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Please upload a JPG, PNG, or WebP image",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "Image must be smaller than 2MB",
    };
  }

  return { valid: true };
}

/**
 * Load image from file and return as HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress and resize image to square, returning base64 data URL
 */
export async function compressImage(file: File): Promise<string> {
  const img = await loadImage(file);

  // Calculate crop dimensions for center square
  const size = Math.min(img.width, img.height);
  const offsetX = (img.width - size) / 2;
  const offsetY = (img.height - size) / 2;

  // Calculate output size (cap at MAX_DIMENSION)
  const outputSize = Math.min(size, MAX_DIMENSION);

  // Create canvas and draw cropped/resized image
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Draw center-cropped, resized image
  ctx.drawImage(
    img,
    offsetX,
    offsetY,
    size,
    size,
    0,
    0,
    outputSize,
    outputSize
  );

  // Convert to JPEG data URL
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

/**
 * Get image dimensions from base64 data URL
 */
export function getImageDimensions(
  dataUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

/**
 * Check if a string is a valid base64 image data URL
 */
export function isValidDataUrl(str: string): boolean {
  return str.startsWith("data:image/") && str.includes("base64,");
}
