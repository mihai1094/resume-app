import { ResumeData } from "@/lib/types/resume";
import {
  CoverLetterData,
  CoverLetterTemplateId,
} from "@/lib/types/cover-letter";
import { appConfig } from "@/config/app";
import { pdf, DocumentProps } from "@react-pdf/renderer";
import React from "react";
import { registerPDFFonts } from "@/lib/pdf/fonts";

/**
 * Recursively sanitize data for PDF rendering.
 * Replaces undefined with empty strings/arrays to prevent rendering issues.
 */
function sanitizeForPDF<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return "" as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForPDF) as T;
  }

  if (typeof obj === "object" && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) {
        // Convert undefined to appropriate empty value
        result[key] = "";
      } else {
        result[key] = sanitizeForPDF(value);
      }
    }
    return result as T;
  }

  return obj;
}

/**
 * Export Service
 * Handles exporting resume and cover letter data to various formats (PDF, DOCX, etc.)
 *
 * JSON exports follow the JSON Resume schema (https://jsonresume.org/schema)
 * with extensions for additional data types supported by ResumeForge.
 */

// Current schema version for ResumeForge exports
const EXPORT_SCHEMA_VERSION = "1.0.0";
const JSON_RESUME_SCHEMA =
  "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json";
const DOCX_ENABLED = appConfig.features?.docxExport ?? false;

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
 * PDF customization options
 */
export interface PDFCustomization {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: "sans" | "serif" | "mono" | string;
  fontSize?: number;
  lineSpacing?: number;
  sectionSpacing?: number;
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
  options?: { fileName?: string; customization?: PDFCustomization }
): Promise<{ success: boolean; blob?: Blob; error?: string }> {
  const ensureTemplateId = (id?: string) => {
    const valid = new Set([
      "ats-clarity",
      "ats-structured",
      "ats-compact",
      "timeline",
      "classic",
      "executive",
      "minimalist",
      "creative",
      "technical",
      "adaptive",
      "ivy",
      "modern",
      "cascade",
      "dublin",
      "infographic",
      "cubic",
      "bold",
    ]);
    return id && valid.has(id) ? id : "modern";
  };

  const safeTemplateId = ensureTemplateId(templateId);

  const isResumeEmpty = (resume: ResumeData) => {
    const hasPersonal =
      resume.personalInfo?.firstName?.trim() ||
      resume.personalInfo?.lastName?.trim() ||
      resume.personalInfo?.email?.trim() ||
      resume.personalInfo?.phone?.trim();
    const hasSections =
      (resume.workExperience && resume.workExperience.length > 0) ||
      (resume.education && resume.education.length > 0) ||
      (resume.skills && resume.skills.length > 0) ||
      (resume.languages && resume.languages?.length > 0) ||
      (resume.courses && resume.courses?.length > 0) ||
      (resume.extraCurricular && resume.extraCurricular?.length > 0);
    return !hasPersonal && !hasSections;
  };

  if (isResumeEmpty(data)) {
    return {
      success: false,
      error: "Your resume is empty. Add some content before exporting.",
    };
  }

  try {
    // Register fonts before PDF generation
    registerPDFFonts();

    // Dynamically import the PDF template component based on templateId
    let PDFTemplate;
    try {
      switch (safeTemplateId) {
        case "ats-clarity":
          PDFTemplate = (
            await import(
              "@/components/resume/templates/pdf/clarity-pdf-template"
            )
          ).ClarityPDFTemplate;
          break;
        case "ats-structured":
          PDFTemplate = (
            await import(
              "@/components/resume/templates/pdf/structured-pdf-template"
            )
          ).StructuredPDFTemplate;
          break;
        case "ats-compact":
          PDFTemplate = (
            await import(
              "@/components/resume/templates/pdf/compact-pdf-template"
            )
          ).CompactPDFTemplate;
          break;
        case "timeline":
          PDFTemplate = (
            await import(
              "@/components/resume/templates/pdf/timeline-pdf-template"
            )
          ).TimelinePDFTemplate;
          break;
        case "classic":
          PDFTemplate = (
            await import(
              "@/components/resume/templates/pdf/classic-pdf-template"
            )
          ).ClassicPDFTemplate;
          break;
        case "executive":
          PDFTemplate = (
            await import(
              "@/components/resume/templates/pdf/executive-pdf-template"
            )
          ).ExecutivePDFTemplate;
          break;
        case "minimalist":
          PDFTemplate = (
            await import(
              "@/components/resume/templates/pdf/minimalist-pdf-template"
            )
          ).MinimalistPDFTemplate;
          break;
        case "creative":
          PDFTemplate = (
            await import(
              "@/components/resume/templates/pdf/creative-pdf-template"
            )
          ).CreativePDFTemplate;
          break;
        case "technical":
          PDFTemplate = (
            await import(
              "@/components/resume/templates/pdf/technical-pdf-template"
            )
          ).TechnicalPDFTemplate;
          break;
        case "adaptive":
          PDFTemplate = (
            await import(
              "@/components/resume/templates/pdf/adaptive-pdf-template"
            )
          ).AdaptivePDFTemplate;
          break;
        case "ivy":
          PDFTemplate = (
            await import("@/components/resume/templates/pdf/ivy-pdf-template")
          ).IvyPDFTemplate;
          break;
        case "cascade":
          PDFTemplate = (
            await import(
              "@/components/resume/templates/pdf/cascade-pdf-template"
            )
          ).CascadePDFTemplate;
          break;
        case "dublin":
          PDFTemplate = (
            await import(
              "@/components/resume/templates/pdf/dublin-pdf-template"
            )
          ).DublinPDFTemplate;
          break;
        case "infographic":
          PDFTemplate = (
            await import(
              "@/components/resume/templates/pdf/infographic-pdf-template"
            )
          ).InfographicPDFTemplate;
          break;
        case "cubic":
          PDFTemplate = (
            await import(
              "@/components/resume/templates/pdf/cubic-pdf-template"
            )
          ).CubicPDFTemplate;
          break;
        case "bold":
          PDFTemplate = (
            await import(
              "@/components/resume/templates/pdf/bold-pdf-template"
            )
          ).BoldPDFTemplate;
          break;
        case "modern":
        default:
          PDFTemplate = (
            await import(
              "@/components/resume/templates/pdf/modern-pdf-template"
            )
          ).ModernPDFTemplate;
          break;
      }
    } catch (err) {
      return {
        success: false,
        error:
          "We couldn't load that template. Try again or pick a different template.",
      };
    }

    // Sanitize data to prevent undefined values causing rendering issues
    const sanitizedData = sanitizeForPDF(data);

    // Create PDF document using React.createElement (since this is a .ts file)
    // PDFTemplate already returns a Document component, so we can use it directly
    const doc = React.createElement(PDFTemplate, {
      data: sanitizedData,
      customization: options?.customization,
    }) as React.ReactElement<DocumentProps>;

    // Generate PDF blob
    const blob = await pdf(doc).toBlob();

    return {
      success: true,
      blob,
    };
  } catch (error) {
    console.error("PDF export error:", error);

    // Provide user-friendly error messages
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
      return {
        success: false,
        error: "Unable to load fonts for PDF generation. Please check your internet connection and try again. If the problem persists, try disabling any ad blockers.",
      };
    }

    return {
      success: false,
      error: errorMessage || "Failed to export PDF. Please try again.",
    };
  }
}

/**
 * Export resume to DOCX using the docx library
 * Creates a professional Word document with proper formatting
 */
export async function exportToDOCX(
  data: ResumeData,
  _templateId: string = "modern",
  _options?: { fileName?: string }
): Promise<{ success: boolean; blob?: Blob; error?: string }> {
  try {
    // Dynamically import docx to avoid bundling issues
    const {
      Document,
      Packer,
      Paragraph,
      TextRun,
      HeadingLevel,
      AlignmentType,
      BorderStyle,
      convertInchesToTwip,
    } = await import("docx");

    const { personalInfo, workExperience, education, skills, languages, projects, certifications } = data;

    // Helper to create section heading
    const createSectionHeading = (text: string) =>
      new Paragraph({
        text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
        border: {
          bottom: {
            color: "000000",
            space: 1,
            size: 6,
            style: BorderStyle.SINGLE,
          },
        },
      });

    // Build sections - use generic array type since Paragraph is a class
    const sections: InstanceType<typeof Paragraph>[] = [];

    // Header - Name
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${personalInfo.firstName} ${personalInfo.lastName}`,
            bold: true,
            size: 32, // 16pt
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );

    // Contact info line
    const contactParts: string[] = [];
    if (personalInfo.email) contactParts.push(personalInfo.email);
    if (personalInfo.phone) contactParts.push(personalInfo.phone);
    if (personalInfo.location) contactParts.push(personalInfo.location);

    if (contactParts.length > 0) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactParts.join(" | "),
              size: 20, // 10pt
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        })
      );
    }

    // Links line
    const linkParts: string[] = [];
    if (personalInfo.linkedin) linkParts.push(`LinkedIn: ${personalInfo.linkedin}`);
    if (personalInfo.github) linkParts.push(`GitHub: ${personalInfo.github}`);
    if (personalInfo.website) linkParts.push(`Website: ${personalInfo.website}`);

    if (linkParts.length > 0) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: linkParts.join(" | "),
              size: 18, // 9pt
              color: "666666",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    // Summary
    if (personalInfo.summary) {
      sections.push(createSectionHeading("Professional Summary"));
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: personalInfo.summary,
              size: 22, // 11pt
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }

    // Work Experience
    if (workExperience && workExperience.length > 0) {
      sections.push(createSectionHeading("Work Experience"));

      workExperience.forEach((exp) => {
        // Job title and company
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.position,
                bold: true,
                size: 24, // 12pt
              }),
              new TextRun({
                text: ` at ${exp.company}`,
                size: 24,
              }),
            ],
            spacing: { before: 150 },
          })
        );

        // Date and location
        const dateLine = `${exp.startDate} - ${exp.current ? "Present" : exp.endDate}`;
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: dateLine + (exp.location ? ` | ${exp.location}` : ""),
                size: 20,
                italics: true,
                color: "666666",
              }),
            ],
            spacing: { after: 50 },
          })
        );

        // Description bullets
        if (exp.description && exp.description.length > 0) {
          exp.description.forEach((desc) => {
            if (desc.trim()) {
              sections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${desc}`,
                      size: 22,
                    }),
                  ],
                  indent: { left: convertInchesToTwip(0.25) },
                })
              );
            }
          });
        }

        // Achievements
        if (exp.achievements && exp.achievements.length > 0) {
          exp.achievements.forEach((achievement) => {
            if (achievement.trim()) {
              sections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${achievement}`,
                      size: 22,
                    }),
                  ],
                  indent: { left: convertInchesToTwip(0.25) },
                })
              );
            }
          });
        }
      });
    }

    // Education
    if (education && education.length > 0) {
      sections.push(createSectionHeading("Education"));

      education.forEach((edu) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${edu.degree} in ${edu.field}`,
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 150 },
          })
        );

        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: edu.institution,
                size: 22,
              }),
              new TextRun({
                text: ` | ${edu.startDate} - ${edu.current ? "Present" : edu.endDate}`,
                size: 20,
                italics: true,
                color: "666666",
              }),
            ],
          })
        );

        if (edu.gpa) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `GPA: ${edu.gpa}`,
                  size: 20,
                }),
              ],
            })
          );
        }
      });
    }

    // Skills
    if (skills && skills.length > 0) {
      sections.push(createSectionHeading("Skills"));

      // Group skills by category
      const skillsByCategory = skills.reduce((acc, skill) => {
        const cat = skill.category || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill.name);
        return acc;
      }, {} as Record<string, string[]>);

      Object.entries(skillsByCategory).forEach(([category, skillNames]) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${category}: `,
                bold: true,
                size: 22,
              }),
              new TextRun({
                text: skillNames.join(", "),
                size: 22,
              }),
            ],
            spacing: { after: 50 },
          })
        );
      });
    }

    // Languages
    if (languages && languages.length > 0) {
      sections.push(createSectionHeading("Languages"));
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: languages.map((l) => `${l.name} (${l.level})`).join(", "),
              size: 22,
            }),
          ],
        })
      );
    }

    // Projects
    if (projects && projects.length > 0) {
      sections.push(createSectionHeading("Projects"));

      projects.forEach((proj) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: proj.name,
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 150 },
          })
        );

        if (proj.description) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: proj.description,
                  size: 22,
                }),
              ],
            })
          );
        }

        if (proj.technologies && proj.technologies.length > 0) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "Technologies: ",
                  bold: true,
                  size: 20,
                }),
                new TextRun({
                  text: proj.technologies.join(", "),
                  size: 20,
                }),
              ],
            })
          );
        }
      });
    }

    // Certifications
    if (certifications && certifications.length > 0) {
      sections.push(createSectionHeading("Certifications"));

      certifications.forEach((cert) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cert.name,
                bold: true,
                size: 22,
              }),
              cert.issuer
                ? new TextRun({
                    text: ` - ${cert.issuer}`,
                    size: 22,
                  })
                : new TextRun({ text: "" }),
              cert.date
                ? new TextRun({
                    text: ` (${cert.date})`,
                    size: 20,
                    italics: true,
                    color: "666666",
                  })
                : new TextRun({ text: "" }),
            ],
          })
        );
      });
    }

    // Create the document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(0.75),
                right: convertInchesToTwip(0.75),
                bottom: convertInchesToTwip(0.75),
                left: convertInchesToTwip(0.75),
              },
            },
          },
          children: sections,
        },
      ],
    });

    // Generate the blob
    const blob = await Packer.toBlob(doc);

    return {
      success: true,
      blob,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export DOCX",
    };
  }
}

/**
 * Convert ResumeForge data to JSON Resume compatible format
 * This enables interoperability with other resume tools and services
 */
export function convertToJSONResume(data: ResumeData): JSONResumeFormat {
  const {
    personalInfo,
    workExperience,
    education,
    skills,
    languages,
    projects,
    certifications,
    courses,
    hobbies,
    extraCurricular,
    customSections,
  } = data;

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
      location: personalInfo.location
        ? {
            city: personalInfo.location,
          }
        : undefined,
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
    jsonResume.skills = Object.entries(skillsByCategory).map(
      ([category, keywords]) => ({
        name: category,
        keywords,
      })
    );
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
    extraCurricular:
      extraCurricular && extraCurricular.length > 0
        ? extraCurricular
        : undefined,
    customSections:
      customSections && customSections.length > 0 ? customSections : undefined,
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
  const {
    pretty = true,
    includeOriginal = true,
    format = "jsonresume",
  } = options;

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
        data: exportToJSON(data, { pretty: true }),
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
    // Register fonts before PDF generation
    registerPDFFonts();

    // Dynamically import the PDF template component based on templateId
    let PDFTemplate;
    switch (templateId) {
      case "classic":
      case "executive":
        PDFTemplate = (
          await import(
            "@/components/cover-letter/templates/pdf/classic-cover-letter-pdf"
          )
        ).ClassicCoverLetterPDF;
        break;
      case "modern":
      case "minimalist":
      default:
        PDFTemplate = (
          await import(
            "@/components/cover-letter/templates/pdf/modern-cover-letter-pdf"
          )
        ).ModernCoverLetterPDF;
        break;
    }

    // Sanitize data to prevent undefined values causing rendering issues
    const sanitizedData = sanitizeForPDF(data);

    // Create PDF document using React.createElement
    const doc = React.createElement(PDFTemplate, {
      data: sanitizedData,
    }) as React.ReactElement<DocumentProps>;

    // Generate PDF blob
    const blob = await pdf(doc).toBlob();

    return {
      success: true,
      blob,
    };
  } catch (error) {
    console.error("Cover letter PDF export error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
      return {
        success: false,
        error: "Unable to load fonts for PDF generation. Please check your internet connection and try again.",
      };
    }

    return {
      success: false,
      error: errorMessage || "Failed to export cover letter PDF",
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
export function exportCoverLetterToJSON(
  data: CoverLetterData,
  pretty: boolean = true
): string {
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
    lines.push(
      `Re: ${data.jobTitle}${
        data.jobReference ? ` (Ref: ${data.jobReference})` : ""
      }`
    );
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
