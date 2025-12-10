import {
  ResumeData,
  WorkExperience,
  Education,
  Skill,
  Language,
  Project,
  Certification,
  Hobby,
  ExtraCurricular,
} from "@/lib/types/resume";
import { resumeService } from "./resume";
import { generateId } from "@/lib/utils";
/**
 * Import Service
 * Handles importing resume data from various sources (LinkedIn, JSON, etc.)
 *
 * Supports multiple JSON formats:
 * - ResumeForge native format (with x-resumeforge extension)
 * - JSON Resume standard format (https://jsonresume.org)
 * - Legacy ResumeForge format (raw ResumeData)
 */

// Minimal JSONResumeFormat type to avoid importing export.ts with canvas deps
interface JSONResumeFormat {
  $schema?: string;
  meta?: Record<string, unknown>;
  basics?: {
    name?: string;
    email?: string;
    phone?: string;
    url?: string;
    summary?: string;
    location?: Record<string, unknown>;
    profiles?: Array<{ network?: string; username?: string; url?: string }>;
  };
  work?: Array<{
    name?: string;
    position?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
    location?: string;
  }>;
  education?: Array<{
    institution?: string;
    url?: string;
    area?: string;
    studyType?: string;
    startDate?: string;
    endDate?: string;
    score?: string;
    courses?: string[];
  }>;
  skills?: Array<{ name?: string; level?: string; keywords?: string[] }>;
  languages?: Array<{ language?: string; fluency?: string }>;
  projects?: Array<{
    name?: string;
    description?: string;
    highlights?: string[];
    keywords?: string[];
    startDate?: string;
    endDate?: string;
    url?: string;
  }>;
  certificates?: Array<{ name?: string; date?: string; issuer?: string; url?: string }>;
  volunteer?: Array<{
    organization?: string;
    position?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
  }>;
  interests?: Array<{ name?: string; keywords?: string[] }>;
  "x-resumeforge"?: {
    originalData?: ResumeData;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export type ImportSource = "json" | "linkedin" | "file";
export type DetectedFormat =
  | "resumeforge"
  | "jsonresume"
  | "legacy"
  | "unknown";

export interface ImportOptions {
  source: ImportSource;
  data?: string | File;
}

export interface ImportResult {
  success: boolean;
  data?: ResumeData;
  error?: string;
  format?: DetectedFormat;
  warnings?: string[];
}

/**
 * Detect the format of a JSON resume
 */
function detectFormat(parsed: unknown): DetectedFormat {
  if (!parsed || typeof parsed !== "object") {
    return "unknown";
  }

  const obj = parsed as Record<string, unknown>;

  // ResumeForge format with x-resumeforge extension
  if (obj["x-resumeforge"] && obj.basics) {
    return "resumeforge";
  }

  // ResumeForge native format
  if (
    obj.$schema &&
    typeof obj.$schema === "string" &&
    obj.$schema.includes("resumeforge")
  ) {
    return "resumeforge";
  }

  // JSON Resume format
  if (obj.basics && (obj.work || obj.education || obj.skills)) {
    return "jsonresume";
  }

  // Legacy ResumeForge format (raw ResumeData)
  if (obj.personalInfo && (obj.workExperience || obj.education)) {
    return "legacy";
  }

  return "unknown";
}

/**
 * Convert JSON Resume format to ResumeForge format
 */
function convertFromJSONResume(jsonResume: JSONResumeFormat): ResumeData {
  // If we have the original data, use it for lossless import
  if (jsonResume["x-resumeforge"]?.originalData) {
    return jsonResume["x-resumeforge"].originalData;
  }

  const {
    basics = {},
    work,
    education,
    skills,
    languages,
    projects,
    certificates,
    volunteer,
    interests,
  } = jsonResume;

  // Parse name into first/last
  const nameParts = (basics.name || "").trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Extract social profiles
  let linkedin = "";
  let github = "";
  basics.profiles?.forEach((profile) => {
    if (profile.network?.toLowerCase() === "linkedin") {
      linkedin = profile.url || "";
    } else if (profile.network?.toLowerCase() === "github") {
      github = profile.url || "";
    }
  });

  // Convert work experience
  const workExperience: WorkExperience[] = (work || []).map((job) => ({
    id: generateId(),
    company: job.name || "Unknown Company",
    position: job.position || "Unknown Position",
    location: job.location || "",
    startDate: job.startDate || "",
    endDate: job.endDate || "",
    current: !job.endDate,
    description: job.highlights || (job.summary ? [job.summary] : []),
    achievements: job.highlights || [],
  }));

  // Convert education
  const educationData: Education[] = (education || []).map((edu) => ({
    id: generateId(),
    institution: edu.institution || "Unknown Institution",
    degree: edu.studyType || "",
    field: edu.area || "",
    location: "",
    startDate: edu.startDate || "",
    endDate: edu.endDate || "",
    current: !edu.endDate,
    gpa: edu.score || "",
    description: edu.courses || [],
  }));

  // Convert skills (flatten from categories)
  const skillsData: Skill[] = (skills || []).flatMap((skillGroup) =>
    (skillGroup.keywords || []).map((keyword) => ({
      id: generateId(),
      name: keyword,
      category: skillGroup.name || "General",
      level: (skillGroup.level as Skill["level"]) || "intermediate",
    }))
  );

  // Convert languages
  const languagesData: Language[] = (languages || []).map((lang) => ({
    id: generateId(),
    name: lang.language || "Unknown Language",
    level: (lang.fluency?.toLowerCase() || "basic") as Language["level"],
  }));

  // Convert projects
  const projectsData: Project[] = (projects || []).map((proj) => ({
    id: generateId(),
    name: proj.name || "Unknown Project",
    description: proj.description || "",
    technologies: proj.keywords || [],
    url: proj.url || "",
    startDate: proj.startDate || "",
    endDate: proj.endDate || "",
  }));

  // Convert certifications
  const certificationsData: Certification[] = (certificates || []).map(
    (cert) => ({
      id: generateId(),
      name: cert.name || "Unknown Certification",
      issuer: cert.issuer || "",
      date: cert.date || "",
      url: cert.url || "",
    })
  );

  // Convert interests to hobbies
  const hobbiesData: Hobby[] = (interests || []).map((interest) => ({
    id: generateId(),
    name: interest.name || "Unknown Interest",
    description: interest.keywords?.join(", ") || "",
  }));

  // Convert volunteer to extra-curricular
  const extraCurricularData: ExtraCurricular[] = (volunteer || []).map(
    (vol) => ({
      id: generateId(),
      title: vol.position || "Unknown Role",
      organization: vol.organization || "Unknown Organization",
      role: vol.position || "Volunteer",
      startDate: vol.startDate || "",
      endDate: vol.endDate || "",
      current: !vol.endDate,
      description: vol.highlights || (vol.summary ? [vol.summary] : []),
    })
  );

  return {
    personalInfo: {
      firstName,
      lastName,
      email: basics.email || "",
      phone: basics.phone || "",
      location: (basics.location as Record<string, unknown>)?.city as string || "",
      website: basics.url || "",
      linkedin,
      github,
      summary: basics.summary || "",
    },
    workExperience,
    education: educationData,
    skills: skillsData,
    languages: languagesData,
    projects: projectsData,
    certifications: certificationsData,
    hobbies: hobbiesData,
    extraCurricular: extraCurricularData,
    courses: (jsonResume["x-resumeforge"]?.courses as ResumeData["courses"]) || [],
    customSections: (jsonResume["x-resumeforge"]?.customSections as ResumeData["customSections"]) || [],
  };
}

/**
 * Import from JSON string
 * Supports multiple formats: ResumeForge, JSON Resume, and legacy
 */
export function importFromJSON(json: string): ImportResult {
  try {
    const parsed = JSON.parse(json);
    const format = detectFormat(parsed);
    const warnings: string[] = [];

    let data: ResumeData;

    switch (format) {
      case "resumeforge":
        // ResumeForge format - extract from wrapper or x-resumeforge
        if (parsed.data) {
          data = parsed.data;
        } else if (parsed["x-resumeforge"]?.originalData) {
          data = parsed["x-resumeforge"].originalData;
        } else {
          data = convertFromJSONResume(parsed as JSONResumeFormat);
          warnings.push("Converted from JSON Resume format");
        }
        break;

      case "jsonresume":
        // Standard JSON Resume format - convert to ResumeForge format
        data = convertFromJSONResume(parsed as JSONResumeFormat);
        warnings.push("Imported from JSON Resume format");
        break;

      case "legacy":
        // Legacy ResumeForge format (raw ResumeData)
        data = parsed as ResumeData;
        break;

      default:
        return {
          success: false,
          error:
            "Unrecognized resume format. Please use a ResumeForge or JSON Resume compatible file.",
          format,
        };
    }

    // Validate the imported data
    const validation = resumeService.validate(data);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(", ")}`,
        format,
        warnings,
      };
    }

    return {
      success: true,
      data,
      format,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}

/**
 * Import from JSON file
 * Supports .json files in ResumeForge or JSON Resume format
 */
export async function importFromFile(file: File): Promise<ImportResult> {
  // Validate file type
  if (!file.name.endsWith(".json")) {
    return {
      success: false,
      error: "Please select a JSON file (.json)",
    };
  }

  // Check file size (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      success: false,
      error: "File is too large. Maximum size is 5MB.",
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const result = importFromJSON(json);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : "Failed to read file",
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: "Failed to read file",
      });
    };

    reader.readAsText(file);
  });
}



/**
 * Import from LinkedIn PDF
 */
export async function importFromLinkedIn(file?: File): Promise<ImportResult> {
  if (!file) {
    return {
      success: false,
      error: "No file provided for LinkedIn import",
    };
  }

  try {
    // Call server API endpoint to handle PDF parsing
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/parse-linkedin-pdf", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to parse PDF");
    }

    const { data: partialData } = await response.json();

    // Merge with default empty resume to ensure type safety
    const defaultResume = resumeService.createEmpty();

    const mergedData: ResumeData = {
      ...defaultResume,
      personalInfo: {
        ...defaultResume.personalInfo,
        ...partialData.personalInfo,
      },
      // Safely merge arrays with proper typing
      workExperience: (partialData.workExperience || []).map((w: Partial<WorkExperience>) => ({
        ...w,
        id: w.id || generateId(),
        company: w.company || "",
        position: w.position || "",
        location: w.location || "",
        startDate: w.startDate || "",
        endDate: w.endDate || "",
        current: w.current || false,
        description: w.description || [],
        achievements: w.achievements || [],
      })) as WorkExperience[],
      education: (partialData.education || []).map((e: Partial<Education>) => ({
        ...e,
        id: e.id || generateId(),
        institution: e.institution || "",
        degree: e.degree || "",
        field: e.field || "",
        location: e.location || "",
        startDate: e.startDate || "",
        endDate: e.endDate || "",
        current: e.current || false,
        gpa: e.gpa || "",
        description: e.description || [],
      })) as Education[],
      skills: (partialData.skills || []).map((s: Partial<Skill>) => ({
        ...s,
        id: s.id || generateId(),
        name: s.name || "",
        category: s.category || "",
        level: s.level || "intermediate",
      })) as Skill[],
    };

    return {
      success: true,
      data: mergedData,
      format: "resumeforge", // mapped internally
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse LinkedIn PDF",
    };
  }
}

/**
 * Main import function
 * Unified entry point for all import sources
 */
export async function importResume(
  options: ImportOptions
): Promise<ImportResult> {
  const { source, data } = options;

  switch (source) {
    case "json":
      if (typeof data === "string") {
        return importFromJSON(data);
      }
      return {
        success: false,
        error: "JSON data must be a string",
      };

    case "file":
      if (data instanceof File) {
        return importFromFile(data);
      }
      return {
        success: false,
        error: "File data must be a File object",
      };

    case "linkedin":
      if (data instanceof File) {
        return importFromLinkedIn(data);
      }
      return {
        success: false,
        error: "LinkedIn import requires a PDF file",
      };

    default:
      return {
        success: false,
        error: `Unsupported import source: ${source}`,
      };
  }
}

/**
 * Validate if a string is valid JSON that can be imported
 */
export function canImport(json: string): {
  valid: boolean;
  format?: DetectedFormat;
  error?: string;
} {
  try {
    const parsed = JSON.parse(json);
    const format = detectFormat(parsed);

    if (format === "unknown") {
      return { valid: false, error: "Unrecognized resume format" };
    }

    return { valid: true, format };
  } catch {
    return { valid: false, error: "Invalid JSON" };
  }
}
