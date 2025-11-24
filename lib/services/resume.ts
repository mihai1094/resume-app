import { ResumeData, WorkExperience, Education, Skill, Language, Course, Hobby, ExtraCurricular } from "@/lib/types/resume";
import { generateId, validateResumeData } from "@/lib/utils";

/**
 * Resume Service
 * Contains business logic for resume data manipulation
 */
class ResumeService {
  /**
   * Create initial empty resume data
   */
  createEmpty(): ResumeData {
    return {
      personalInfo: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        location: "",
        website: "",
        linkedin: "",
        github: "",
        summary: "",
      },
      workExperience: [],
      education: [],
      skills: [],
      projects: [],
      languages: [],
      certifications: [],
      courses: [],
      hobbies: [],
      extraCurricular: [],
      customSections: [],
    };
  }

  /**
   * Validate resume data
   */
  validate(data: ResumeData): { valid: boolean; errors: string[] } {
    return validateResumeData(data);
  }

  /**
   * Create a new work experience entry
   */
  createWorkExperience(): WorkExperience {
    return {
      id: generateId(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: [""],
    };
  }

  /**
   * Create a new education entry
   */
  createEducation(): Education {
    return {
      id: generateId(),
      institution: "",
      degree: "",
      field: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      gpa: "",
      description: [],
    };
  }

  /**
   * Create a new skill entry
   */
  createSkill(): Skill {
    return {
      id: generateId(),
      name: "",
      category: "Other",
      level: "intermediate",
    };
  }

  /**
   * Create a new language entry
   */
  createLanguage(): Language {
    return {
      id: generateId(),
      name: "",
      level: "basic",
    };
  }

  /**
   * Create a new course entry
   */
  createCourse(): Course {
    return {
      id: generateId(),
      name: "",
      institution: "",
      date: "",
      credentialId: "",
      url: "",
    };
  }

  /**
   * Create a new hobby entry
   */
  createHobby(): Hobby {
    return {
      id: generateId(),
      name: "",
      description: "",
    };
  }

  /**
   * Create a new extra-curricular entry
   */
  createExtraCurricular(): ExtraCurricular {
    return {
      id: generateId(),
      title: "",
      organization: "",
      role: "",
      startDate: "",
      endDate: "",
      current: false,
      description: [],
    };
  }

  /**
   * Calculate completion percentage
   */
  getCompletionPercentage(data: ResumeData): number {
    const sections = [
      data.personalInfo.firstName,
      data.personalInfo.lastName,
      data.personalInfo.email,
      data.personalInfo.phone,
      data.personalInfo.location,
      data.workExperience.length > 0,
      data.education.length > 0,
      data.skills.length > 0,
    ];

    const completed = sections.filter(Boolean).length;
    return Math.round((completed / sections.length) * 100);
  }

  /**
   * Check if resume has minimum required data
   */
  hasMinimumData(data: ResumeData): boolean {
    return !!(
      data.personalInfo.firstName &&
      data.personalInfo.lastName &&
      data.personalInfo.email &&
      (data.workExperience.length > 0 || data.education.length > 0)
    );
  }

  /**
   * Export resume data as JSON string
   */
  exportToJSON(data: ResumeData, pretty: boolean = true): string {
    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  }

  /**
   * Import resume data from JSON string
   */
  importFromJSON(json: string): { success: boolean; data?: ResumeData; error?: string } {
    try {
      const parsed = JSON.parse(json);
      const validation = this.validate(parsed);

      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(", ")}`,
        };
      }

      return {
        success: true,
        data: parsed as ResumeData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Invalid JSON",
      };
    }
  }

  /**
   * Reset resume to empty state
   */
  reset(): ResumeData {
    return this.createEmpty();
  }

  /**
   * Clone resume data (deep copy)
   * Uses structuredClone for better performance and proper handling
   */
  clone(data: ResumeData): ResumeData {
    return structuredClone(data);
  }
}

// Export singleton instance
export const resumeService = new ResumeService();

