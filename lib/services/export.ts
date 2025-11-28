import { ResumeData } from "@/lib/types/resume";
import { CoverLetterData, CoverLetterTemplateId } from "@/lib/types/cover-letter";
import { pdf, DocumentProps } from "@react-pdf/renderer";
import React from "react";

/**
 * Export Service
 * Handles exporting resume and cover letter data to various formats (PDF, DOCX, etc.)
 *
 * JSON exports follow the JSON Resume schema (https://jsonresume.org/schema)
 * with extensions for additional data types supported by ResumeForge.
 */

// Current schema version for ResumeForge exports
const EXPORT_SCHEMA_VERSION = "1.0.0";
const JSON_RESUME_SCHEMA = "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json";

export type ExportFormat = "pdf" | "docx" | "json" | "txt";

export interface ExportOptions {
  format: ExportFormat;
  templateId?: string;
  fileName?: string;
  includeMetadata?: boolean;
}

/**
 * Metadata wrapper for JSON exports
 * Provides versioning, timestamps, and compatibility information
 */
export interface ResumeExportMetadata {
  $schema: string;
  meta: {
    version: string;
    exportedAt: string;
    generator: string;
    generatorVersion: string;
    canonical?: string;
  };
}

/**
 * JSON Resume compatible format
 * Based on https://jsonresume.org/schema with ResumeForge extensions
 */
export interface JSONResumeFormat {
  $schema: string;
  meta: ResumeExportMetadata["meta"];
  basics: {
    name: string;
    label?: string;
    image?: string;
    email: string;
    phone: string;
    url?: string;
    summary?: string;
    location?: {
      address?: string;
      postalCode?: string;
      city?: string;
      countryCode?: string;
      region?: string;
    };
    profiles?: Array<{
      network: string;
      username?: string;
      url: string;
    }>;
  };
  work?: Array<{
    name: string;
    position: string;
    url?: string;
    startDate: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
    location?: string;
  }>;
  education?: Array<{
    institution: string;
    url?: string;
    area: string;
    studyType: string;
    startDate: string;
    endDate?: string;
    score?: string;
    courses?: string[];
  }>;
  skills?: Array<{
    name: string;
    level?: string;
    keywords?: string[];
  }>;
  languages?: Array<{
    language: string;
    fluency: string;
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    highlights?: string[];
    keywords?: string[];
    startDate?: string;
    endDate?: string;
    url?: string;
    roles?: string[];
    entity?: string;
    type?: string;
  }>;
  certificates?: Array<{
    name: string;
    date?: string;
    issuer?: string;
    url?: string;
  }>;
  volunteer?: Array<{
    organization: string;
    position: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
  }>;
  interests?: Array<{
    name: string;
    keywords?: string[];
  }>;
  // ResumeForge extensions (prefixed with x-)
  "x-resumeforge"?: {
    courses?: Array<{
      id: string;
      name: string;
      institution?: string;
      date?: string;
      credentialId?: string;
      url?: string;
    }>;
    extraCurricular?: Array<{
      id: string;
      title: string;
      organization?: string;
      role?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
      description?: string[];
    }>;
    customSections?: Array<{
      id: string;
      title: string;
      items: Array<{
        id: string;
        title: string;
        description?: string;
        date?: string;
        location?: string;
      }>;
    }>;
    // Original format for lossless round-trip
    originalData?: ResumeData;
  };
}

/**
 * Export resume to PDF using @react-pdf/renderer
 *
 * Uses professional A4 format (210mm × 297mm) which is the international standard
 * for resumes/CVs. Margins are set to 0.5-1 inch for optimal readability.
 *
 * @param data - Resume data to export
 * @param templateId - Template ID to use
 * @param options - Optional configuration for PDF export
 */
export async function exportToPDF(
  data: ResumeData,
  templateId: string = "modern",
  options?: { fileName?: string }
): Promise<{ success: boolean; blob?: Blob; error?: string }> {
  try {
    // Dynamically import the PDF template component based on templateId
    let PDFTemplate;
    switch (templateId) {
      case "timeline":
        PDFTemplate = (
          await import("@/components/resume/templates/pdf/timeline-pdf-template")
        ).TimelinePDFTemplate;
        break;
      case "classic":
        PDFTemplate = (
          await import("@/components/resume/templates/pdf/classic-pdf-template")
        ).ClassicPDFTemplate;
        break;
      case "executive":
        PDFTemplate = (
          await import("@/components/resume/templates/pdf/executive-pdf-template")
        ).ExecutivePDFTemplate;
        break;
      case "minimalist":
        PDFTemplate = (
          await import("@/components/resume/templates/pdf/minimalist-pdf-template")
        ).MinimalistPDFTemplate;
        break;
      case "creative":
        PDFTemplate = (
          await import("@/components/resume/templates/pdf/creative-pdf-template")
        ).CreativePDFTemplate;
        break;
      case "technical":
        PDFTemplate = (
          await import("@/components/resume/templates/pdf/technical-pdf-template")
        ).TechnicalPDFTemplate;
        break;
      case "adaptive":
        PDFTemplate = (
          await import("@/components/resume/templates/pdf/adaptive-pdf-template")
        ).AdaptivePDFTemplate;
        break;
      case "ivy":
        PDFTemplate = (
          await import("@/components/resume/templates/pdf/ivy-pdf-template")
        ).IvyPDFTemplate;
        break;
      case "modern":
      default:
        PDFTemplate = (
          await import("@/components/resume/templates/pdf/modern-pdf-template")
        ).ModernPDFTemplate;
        break;
    }

    // Create PDF document using React.createElement (since this is a .ts file)
    // PDFTemplate already returns a Document component, so we can use it directly
    const doc = React.createElement(PDFTemplate, {
      data,
    }) as React.ReactElement<DocumentProps>;

    // Generate PDF blob
    const blob = await pdf(doc).toBlob();

    return {
      success: true,
      blob,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export PDF",
    };
  }
}

/**
 * Export resume to DOCX
 * TODO: Implement using docx library
 */
export async function exportToDOCX(
  _data: ResumeData,
  _templateId: string = "modern",
  _options?: { fileName?: string }
): Promise<{ success: boolean; blob?: Blob; error?: string }> {
  return {
    success: false,
    error: "DOCX export is not yet implemented.",
  };
}

/**
 * Convert ResumeForge data to JSON Resume compatible format
 * This enables interoperability with other resume tools and services
 */
export function convertToJSONResume(data: ResumeData): JSONResumeFormat {
  const { personalInfo, workExperience, education, skills, languages, projects, certifications, courses, hobbies, extraCurricular, customSections } = data;

  // Build profiles array from social links
  const profiles: JSONResumeFormat["basics"]["profiles"] = [];
  if (personalInfo.linkedin) {
    profiles.push({
      network: "LinkedIn",
      url: personalInfo.linkedin.startsWith("http")
        ? personalInfo.linkedin
        : `https://linkedin.com/in/${personalInfo.linkedin}`,
    });
  }
  if (personalInfo.github) {
    profiles.push({
      network: "GitHub",
      url: personalInfo.github.startsWith("http")
        ? personalInfo.github
        : `https://github.com/${personalInfo.github}`,
    });
  }

  // Group skills by category for JSON Resume format
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill.name);
    return acc;
  }, {} as Record<string, string[]>);

  const jsonResume: JSONResumeFormat = {
    $schema: JSON_RESUME_SCHEMA,
    meta: {
      version: EXPORT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      generator: "ResumeForge",
      generatorVersion: "1.0.0",
    },
    basics: {
      name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
      email: personalInfo.email,
      phone: personalInfo.phone,
      url: personalInfo.website || undefined,
      summary: personalInfo.summary || undefined,
      location: personalInfo.location ? {
        city: personalInfo.location,
      } : undefined,
      profiles: profiles.length > 0 ? profiles : undefined,
    },
  };

  // Work experience
  if (workExperience && workExperience.length > 0) {
    jsonResume.work = workExperience.map((exp) => ({
      name: exp.company,
      position: exp.position,
      startDate: exp.startDate,
      endDate: exp.current ? undefined : exp.endDate,
      summary: exp.description?.join(" ") || undefined,
      highlights: exp.achievements || exp.description || undefined,
      location: exp.location || undefined,
    }));
  }

  // Education
  if (education && education.length > 0) {
    jsonResume.education = education.map((edu) => ({
      institution: edu.institution,
      area: edu.field,
      studyType: edu.degree,
      startDate: edu.startDate,
      endDate: edu.current ? undefined : edu.endDate,
      score: edu.gpa || undefined,
      courses: edu.description || undefined,
    }));
  }

  // Skills (grouped by category)
  if (Object.keys(skillsByCategory).length > 0) {
    jsonResume.skills = Object.entries(skillsByCategory).map(([category, keywords]) => ({
      name: category,
      keywords,
    }));
  }

  // Languages
  if (languages && languages.length > 0) {
    jsonResume.languages = languages.map((lang) => ({
      language: lang.name,
      fluency: lang.level,
    }));
  }

  // Projects
  if (projects && projects.length > 0) {
    jsonResume.projects = projects.map((proj) => ({
      name: proj.name,
      description: proj.description || undefined,
      keywords: proj.technologies || undefined,
      url: proj.url || proj.github || undefined,
      startDate: proj.startDate || undefined,
      endDate: proj.endDate || undefined,
    }));
  }

  // Certifications
  if (certifications && certifications.length > 0) {
    jsonResume.certificates = certifications.map((cert) => ({
      name: cert.name,
      date: cert.date || undefined,
      issuer: cert.issuer || undefined,
      url: cert.url || undefined,
    }));
  }

  // Hobbies/Interests
  if (hobbies && hobbies.length > 0) {
    jsonResume.interests = hobbies.map((hobby) => ({
      name: hobby.name,
      keywords: hobby.description ? [hobby.description] : undefined,
    }));
  }

  // Extra-curricular as volunteer work
  if (extraCurricular && extraCurricular.length > 0) {
    jsonResume.volunteer = extraCurricular.map((activity) => ({
      organization: activity.organization || activity.title,
      position: activity.role || activity.title,
      startDate: activity.startDate || undefined,
      endDate: activity.current ? undefined : activity.endDate,
      highlights: activity.description || undefined,
    }));
  }

  // ResumeForge extensions for lossless round-trip
  jsonResume["x-resumeforge"] = {
    courses: courses && courses.length > 0 ? courses : undefined,
    extraCurricular: extraCurricular && extraCurricular.length > 0 ? extraCurricular : undefined,
    customSections: customSections && customSections.length > 0 ? customSections : undefined,
    originalData: data, // Preserve original for perfect import
  };

  return jsonResume;
}

/**
 * Export resume to JSON
 *
 * Production-ready implementation with:
 * - JSON Resume schema compatibility (https://jsonresume.org)
 * - Versioning and metadata for tracking
 * - ResumeForge extensions for lossless round-trip import
 * - Clean, readable output format
 *
 * @param data - Resume data to export
 * @param options - Export options
 * @returns JSON string
 */
export function exportToJSON(
  data: ResumeData,
  options: {
    pretty?: boolean;
    includeOriginal?: boolean;
    format?: "jsonresume" | "native";
  } = {}
): string {
  const { pretty = true, includeOriginal = true, format = "jsonresume" } = options;

  if (format === "native") {
    // Native format: just the raw data with metadata wrapper
    const nativeExport = {
      $schema: "https://resumeforge.app/schema/resume/v1",
      meta: {
        version: EXPORT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        generator: "ResumeForge",
        generatorVersion: "1.0.0",
      },
      data,
    };
    return JSON.stringify(nativeExport, null, pretty ? 2 : 0);
  }

  // JSON Resume compatible format (default)
  const jsonResume = convertToJSONResume(data);

  // Optionally remove original data to reduce file size
  if (!includeOriginal && jsonResume["x-resumeforge"]) {
    delete jsonResume["x-resumeforge"].originalData;
  }

  return JSON.stringify(jsonResume, null, pretty ? 2 : 0);
}

/**
 * Export resume to plain text
 */
export function exportToTXT(data: ResumeData): string {
  const lines: string[] = [];

  // Personal Info
  const { personalInfo } = data;
  lines.push(`${personalInfo.firstName} ${personalInfo.lastName}`);
  if (personalInfo.email) lines.push(`Email: ${personalInfo.email}`);
  if (personalInfo.phone) lines.push(`Phone: ${personalInfo.phone}`);
  if (personalInfo.location) lines.push(`Location: ${personalInfo.location}`);
  lines.push("");

  // Summary
  if (personalInfo.summary) {
    lines.push("SUMMARY");
    lines.push(personalInfo.summary);
    lines.push("");
  }

  // Work Experience
  if (data.workExperience.length > 0) {
    lines.push("WORK EXPERIENCE");
    data.workExperience.forEach((exp) => {
      lines.push(`${exp.position} at ${exp.company}`);
      if (exp.location) lines.push(`Location: ${exp.location}`);
      lines.push("");
    });
  }

  // Education
  if (data.education.length > 0) {
    lines.push("EDUCATION");
    data.education.forEach((edu) => {
      lines.push(`${edu.degree} in ${edu.field}`);
      lines.push(`${edu.institution}`);
      lines.push("");
    });
  }

  // Skills
  if (data.skills.length > 0) {
    lines.push("SKILLS");
    lines.push(data.skills.map((s) => s.name).join(", "));
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Main export function for resumes
 */
export async function exportResume(
  data: ResumeData,
  options: ExportOptions
): Promise<{ success: boolean; blob?: Blob; data?: string; error?: string }> {
  const { format, fileName, templateId } = options;

  switch (format) {
    case "pdf":
      return exportToPDF(data, templateId, { fileName });

    case "docx":
      return exportToDOCX(data, templateId, { fileName });

    case "json":
      return {
        success: true,
        data: exportToJSON(data, true),
      };

    case "txt":
      return {
        success: true,
        data: exportToTXT(data),
      };

    default:
      return {
        success: false,
        error: `Unsupported export format: ${format}`,
      };
  }
}

/**
 * Export cover letter to PDF using @react-pdf/renderer
 *
 * @param data - Cover letter data to export
 * @param templateId - Template ID to use
 * @param options - Optional configuration for PDF export
 */
export async function exportCoverLetterToPDF(
  data: CoverLetterData,
  templateId: CoverLetterTemplateId = "modern",
  options?: { fileName?: string }
): Promise<{ success: boolean; blob?: Blob; error?: string }> {
  try {
    // Dynamically import the PDF template component based on templateId
    let PDFTemplate;
    switch (templateId) {
      case "classic":
      case "executive":
        PDFTemplate = (
          await import("@/components/cover-letter/templates/pdf/classic-cover-letter-pdf")
        ).ClassicCoverLetterPDF;
        break;
      case "modern":
      case "minimalist":
      default:
        PDFTemplate = (
          await import("@/components/cover-letter/templates/pdf/modern-cover-letter-pdf")
        ).ModernCoverLetterPDF;
        break;
    }

    // Create PDF document using React.createElement
    const doc = React.createElement(PDFTemplate, {
      data,
    }) as React.ReactElement<DocumentProps>;

    // Generate PDF blob
    const blob = await pdf(doc).toBlob();

    return {
      success: true,
      blob,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export cover letter PDF",
    };
  }
}

/**
 * Cover letter export metadata
 */
export interface CoverLetterExportFormat {
  $schema: string;
  meta: {
    version: string;
    exportedAt: string;
    generator: string;
    generatorVersion: string;
    documentType: "cover-letter";
  };
  data: CoverLetterData;
}

/**
 * Export cover letter to JSON
 *
 * Production-ready implementation with:
 * - Schema reference for validation
 * - Versioning and metadata
 * - Clean, readable output format
 *
 * @param data - Cover letter data to export
 * @param pretty - Whether to format with indentation
 * @returns JSON string
 */
export function exportCoverLetterToJSON(data: CoverLetterData, pretty: boolean = true): string {
  const exportData: CoverLetterExportFormat = {
    $schema: "https://resumeforge.app/schema/cover-letter/v1",
    meta: {
      version: EXPORT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      generator: "ResumeForge",
      generatorVersion: "1.0.0",
      documentType: "cover-letter",
    },
    data,
  };

  return JSON.stringify(exportData, null, pretty ? 2 : 0);
}

/**
 * Export cover letter to plain text
 */
export function exportCoverLetterToTXT(data: CoverLetterData): string {
  const lines: string[] = [];

  // Sender Info
  lines.push(data.senderName);
  if (data.senderLocation) lines.push(data.senderLocation);
  if (data.senderPhone) lines.push(data.senderPhone);
  if (data.senderEmail) lines.push(data.senderEmail);
  lines.push("");

  // Date
  lines.push(data.date || new Date().toLocaleDateString());
  lines.push("");

  // Recipient
  if (data.recipient.name) lines.push(data.recipient.name);
  if (data.recipient.title) lines.push(data.recipient.title);
  if (data.recipient.company) lines.push(data.recipient.company);
  if (data.recipient.department) lines.push(data.recipient.department);
  if (data.recipient.address) lines.push(data.recipient.address);
  lines.push("");

  // Subject
  if (data.jobTitle) {
    lines.push(`Re: ${data.jobTitle}${data.jobReference ? ` (Ref: ${data.jobReference})` : ""}`);
    lines.push("");
  }

  // Body
  lines.push(data.salutation);
  lines.push("");

  if (data.openingParagraph) {
    lines.push(data.openingParagraph);
    lines.push("");
  }

  data.bodyParagraphs.forEach((paragraph) => {
    if (paragraph.trim()) {
      lines.push(paragraph);
      lines.push("");
    }
  });

  if (data.closingParagraph) {
    lines.push(data.closingParagraph);
    lines.push("");
  }

  // Sign off
  lines.push(data.signOff);
  lines.push("");
  lines.push(data.senderName);

  return lines.join("\n");
}
