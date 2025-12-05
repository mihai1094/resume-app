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

// Section IDs
export const SECTION_IDS = [
  "personal",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "courses",
  "hobbies",
  "extra",
  "custom",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/**
 * Type guard to check if a string is a valid SectionId
 */
export function isValidSectionId(value: string): value is SectionId {
  return SECTION_IDS.includes(value as SectionId);
}
