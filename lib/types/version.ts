import { Timestamp } from "firebase/firestore";
import { ResumeData } from "./resume";

/**
 * Type of version save
 */
export type VersionChangeType = "auto" | "manual" | "restore";

/**
 * Represents a point-in-time version of a resume
 */
export interface ResumeVersion {
  id: string;
  resumeId: string;
  createdAt: Timestamp;
  data: ResumeData;
  changeType: VersionChangeType;
  label?: string; // User-provided label for manual saves
  changedSections?: string[]; // Which sections changed from previous version
}

/**
 * Version metadata (without full data) for listing
 */
export interface ResumeVersionMeta {
  id: string;
  resumeId: string;
  createdAt: Timestamp;
  changeType: VersionChangeType;
  label?: string;
  changedSections?: string[];
}

/**
 * Sections that can be tracked for changes
 */
export const TRACKED_SECTIONS = [
  "personalInfo",
  "workExperience",
  "education",
  "skills",
  "projects",
  "languages",
  "certifications",
  "hobbies",
  "extraCurricular",
  "customSections",
] as const;

export type TrackedSection = (typeof TRACKED_SECTIONS)[number];

/**
 * Human-readable labels for sections
 */
export const SECTION_LABELS: Record<TrackedSection, string> = {
  personalInfo: "Personal Info",
  workExperience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  languages: "Languages",
  certifications: "Certifications",
  hobbies: "Hobbies",
  extraCurricular: "Activities",
  customSections: "Custom Sections",
};
