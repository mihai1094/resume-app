import { ResumeData, WorkExperience, Education, Skill, Language, Project, Certification, Hobby, ExtraCurricular } from "@/lib/types/resume";
import { resumeService } from "./resume";
import { generateId } from "@/lib/utils";
import { JSONResumeFormat } from "./export";

/**
 * Import Service
 * Handles importing resume data from various sources (LinkedIn, JSON, etc.)
 * 
 * Supports multiple JSON formats:
 * - ResumeForge native format (with x-resumeforge extension)
 * - JSON Resume standard format (https://jsonresume.org)
 * - Legacy ResumeForge format (raw ResumeData)
 */

export type ImportSource = "json" | "linkedin" | "file";
export type DetectedFormat = "resumeforge" | "jsonresume" | "legacy" | "unknown";

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
  if (obj.$schema && typeof obj.$schema === "string" && obj.$schema.includes("resumeforge")) {
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
  
  const { basics, work, education, skills, languages, projects, certificates, volunteer, interests } = jsonResume;
  
  // Parse name into first/last
  const nameParts = (basics.name || "").trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  
  // Extract social profiles
  let linkedin = "";
  let github = "";
  basics.profiles?.forEach((profile) => {
    if (profile.network.toLowerCase() === "linkedin") {
      linkedin = profile.url;
    } else if (profile.network.toLowerCase() === "github") {
      github = profile.url;
    }
  });
  
  // Convert work experience
  const workExperience: WorkExperience[] = (work || []).map((job) => ({
    id: generateId(),
    company: job.name,
    position: job.position,
    location: job.location || "",
    startDate: job.startDate || "",
    endDate: job.endDate || "",
    current: !job.endDate,
    description: job.highlights || (job.summary ? [job.summary] : []),
    achievements: job.highlights,
  }));
  
  // Convert education
  const educationData: Education[] = (education || []).map((edu) => ({
    id: generateId(),
    institution: edu.institution,
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
      category: skillGroup.name,
      level: skillGroup.level as Skill["level"] || "intermediate",
    }))
  );
  
  // Convert languages
  const languagesData: Language[] = (languages || []).map((lang) => ({
    id: generateId(),
    name: lang.language,
    level: (lang.fluency?.toLowerCase() || "basic") as Language["level"],
  }));
  
  // Convert projects
  const projectsData: Project[] = (projects || []).map((proj) => ({
    id: generateId(),
    name: proj.name,
    description: proj.description || "",
    technologies: proj.keywords || [],
    url: proj.url || "",
    startDate: proj.startDate || "",
    endDate: proj.endDate || "",
  }));
  
  // Convert certifications
  const certificationsData: Certification[] = (certificates || []).map((cert) => ({
    id: generateId(),
    name: cert.name,
    issuer: cert.issuer || "",
    date: cert.date || "",
    url: cert.url || "",
  }));
  
  // Convert interests to hobbies
  const hobbiesData: Hobby[] = (interests || []).map((interest) => ({
    id: generateId(),
    name: interest.name,
    description: interest.keywords?.join(", ") || "",
  }));
  
  // Convert volunteer to extra-curricular
  const extraCurricularData: ExtraCurricular[] = (volunteer || []).map((vol) => ({
    id: generateId(),
    title: vol.position,
    organization: vol.organization,
    role: vol.position,
    startDate: vol.startDate || "",
    endDate: vol.endDate || "",
    current: !vol.endDate,
    description: vol.highlights || (vol.summary ? [vol.summary] : []),
  }));
  
  return {
    personalInfo: {
      firstName,
      lastName,
      email: basics.email || "",
      phone: basics.phone || "",
      location: basics.location?.city || "",
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
    courses: jsonResume["x-resumeforge"]?.courses || [],
    customSections: jsonResume["x-resumeforge"]?.customSections || [],
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
          error: "Unrecognized resume format. Please use a ResumeForge or JSON Resume compatible file.",
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
 * Import from LinkedIn
 * TODO: Implement LinkedIn API integration
 * V2 feature
 */
export async function importFromLinkedIn(
  _accessToken?: string
): Promise<{
  success: boolean;
  data?: ResumeData;
  error?: string;
}> {
  return {
    success: false,
    error: "LinkedIn import is not yet implemented.",
  };
}

/**
 * Main import function
 * Unified entry point for all import sources
 */
export async function importResume(options: ImportOptions): Promise<ImportResult> {
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
      return importFromLinkedIn();

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
export function canImport(json: string): { valid: boolean; format?: DetectedFormat; error?: string } {
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

