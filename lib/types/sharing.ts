/**
 * Public Resume Sharing Types
 *
 * Types for public resume URLs, sharing settings, and analytics.
 */

import { Timestamp } from "firebase/firestore";
import { ResumeData } from "./resume";
import { TemplateCustomization } from "@/components/resume/template-customizer";

/**
 * Public resume document stored in Firestore
 * Collection: publicResumes/{resumeId}
 */
export interface PublicResume {
  /** Original resume ID */
  resumeId: string;
  /** Owner's user ID */
  userId: string;
  /** Owner's username (denormalized for queries) */
  username: string;
  /** URL-safe slug derived from job title or name */
  slug: string;
  /** Whether the resume is currently public */
  isPublic: boolean;
  /** When first published */
  publishedAt: Timestamp;
  /** Last time the public version was updated */
  lastUpdated: Timestamp;
  /** View count */
  viewCount: number;
  /** Download count */
  downloadCount: number;
  /** Snapshot of resume data at time of publish */
  data: ResumeData;
  /** Privacy options used for the public snapshot */
  privacy?: ShareSettings["privacy"];
  /** Template customization settings */
  customization: TemplateCustomization;
  /** Template ID */
  templateId: string;
}

/**
 * Sharing settings for a resume (stored on the resume document)
 */
export interface ShareSettings {
  /** Whether sharing is enabled */
  isPublic: boolean;
  /** URL slug */
  slug?: string;
  /** When first published */
  publishedAt?: string;
  /** Privacy options */
  privacy: {
    /** Hide first/last name from public view */
    hideFullName: boolean;
    /** Hide email from public view */
    hideEmail: boolean;
    /** Hide phone from public view */
    hidePhone: boolean;
    /** Hide location from public view */
    hideLocation: boolean;
    /** Hide website from public view */
    hideWebsite: boolean;
    /** Hide LinkedIn URL from public view */
    hideLinkedin: boolean;
    /** Hide GitHub URL from public view */
    hideGithub: boolean;
  };
}

/**
 * Default privacy settings
 */
export const DEFAULT_PRIVACY_SETTINGS: ShareSettings["privacy"] = {
  hideFullName: false,
  hideEmail: true,
  hidePhone: true,
  hideLocation: true,
  hideWebsite: true,
  hideLinkedin: true,
  hideGithub: true,
};

/**
 * Username validation result
 */
export interface UsernameValidation {
  isValid: boolean;
  isAvailable: boolean;
  error?: string;
  suggestion?: string;
}

/**
 * Username requirements
 */
export const USERNAME_REQUIREMENTS = {
  minLength: 3,
  maxLength: 30,
  pattern: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
  reservedNames: [
    "admin",
    "api",
    "app",
    "dashboard",
    "editor",
    "help",
    "login",
    "logout",
    "pricing",
    "preview",
    "settings",
    "signup",
    "support",
    "templates",
    "u",
    "user",
    "www",
  ],
} as const;

/**
 * Shareable link data
 */
export interface ShareableLink {
  url: string;
  username: string;
  slug: string;
  qrCodeData?: string;
}

/**
 * Social share platforms
 */
export type SharePlatform = "twitter" | "linkedin" | "facebook" | "email" | "copy";

/**
 * Generate share URL for a platform
 */
export function getShareUrl(
  platform: SharePlatform,
  resumeUrl: string,
  title: string
): string {
  const encodedUrl = encodeURIComponent(resumeUrl);
  const encodedTitle = encodeURIComponent(title);

  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "email":
      return `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
    case "copy":
    default:
      return resumeUrl;
  }
}

/**
 * Generate slug from text (job title, name, etc.)
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special chars except hyphens
    .replace(/[\s_]+/g, "-") // Replace spaces/underscores with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .slice(0, 50); // Max 50 chars
}

/**
 * Validate username format
 */
export function validateUsername(username: string): UsernameValidation {
  const { minLength, maxLength, pattern, reservedNames } = USERNAME_REQUIREMENTS;

  if (!username) {
    return { isValid: false, isAvailable: false, error: "Username is required" };
  }

  if (username.length < minLength) {
    return {
      isValid: false,
      isAvailable: false,
      error: `Username must be at least ${minLength} characters`,
    };
  }

  if (username.length > maxLength) {
    return {
      isValid: false,
      isAvailable: false,
      error: `Username must be at most ${maxLength} characters`,
    };
  }

  if (!pattern.test(username)) {
    return {
      isValid: false,
      isAvailable: false,
      error: "Username can only contain lowercase letters, numbers, and hyphens",
    };
  }

  if ((reservedNames as readonly string[]).includes(username)) {
    return {
      isValid: false,
      isAvailable: false,
      error: "This username is reserved",
      suggestion: `${username}-resume`,
    };
  }

  // Format is valid, availability must be checked separately
  return { isValid: true, isAvailable: true };
}
