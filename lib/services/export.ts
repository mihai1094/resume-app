import { ResumeData } from "@/lib/types/resume";
import { pdf, DocumentProps } from "@react-pdf/renderer";
import React from "react";

/**
 * Export Service
 * Handles exporting resume data to various formats (PDF, DOCX, etc.)
 */

export type ExportFormat = "pdf" | "docx" | "json" | "txt";

export interface ExportOptions {
  format: ExportFormat;
  templateId?: string;
  fileName?: string;
  includeMetadata?: boolean;
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
 * Export resume to JSON
 * Already implemented via resumeService.exportToJSON()
 */
export function exportToJSON(data: ResumeData, pretty: boolean = true): string {
  return JSON.stringify(data, null, pretty ? 2 : 0);
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
 * Main export function
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
