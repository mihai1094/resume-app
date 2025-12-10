/**
 * Default values and constants used throughout the application
 */

// Breakpoints (matching Tailwind CSS defaults)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// Template customization defaults
export const DEFAULT_TEMPLATE_CUSTOMIZATION: TemplateCustomizationDefaults = {
  primaryColor: "#0ea5e9",
  secondaryColor: "#0f172a",
  accentColor: "#0ea5e9",
  fontFamily: "sans",
  fontSize: 14,
  lineSpacing: 1.5,
  sectionSpacing: 16,
};

export interface TemplateCustomizationDefaults {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  lineSpacing: number;
  sectionSpacing: number;
}

// Timing constants (in milliseconds)
export const TIMING = {
  debounceDelay: 500,
  autoSaveDelay: 500,
  resizeDebounce: 100,
} as const;

// Section IDs (consolidated from 11 to 8 sections)
export const SECTION_IDS = [
  "personal",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications", // Now includes courses
  "languages",
  "additional", // Combines extra-curricular, hobbies, and custom sections
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

// Legacy section IDs kept for backward compatibility with saved data
export const LEGACY_SECTION_IDS = ["courses", "hobbies", "extra", "custom"] as const;
export type LegacySectionId = (typeof LEGACY_SECTION_IDS)[number];

// Section tiers for visibility logic
export type SectionTier = "essential" | "recommended" | "optional";

export const SECTION_TIERS: Record<SectionId, SectionTier> = {
  personal: "essential",
  experience: "essential",
  education: "essential",
  skills: "essential",
  projects: "recommended",
  certifications: "recommended",
  languages: "optional",
  additional: "optional",
};

/**
 * Type guard to check if a string is a valid SectionId
 */
export function isValidSectionId(value: string): value is SectionId {
  return SECTION_IDS.includes(value as SectionId);
}

/**
 * Type guard to check if a string is a legacy section ID
 */
export function isLegacySectionId(value: string): value is LegacySectionId {
  return LEGACY_SECTION_IDS.includes(value as LegacySectionId);
}
