import { describe, it, expect, beforeEach } from "vitest";
import {
  exportToJSON,
  exportToTXT,
  convertToJSONResume,
  exportCoverLetterToJSON,
  exportCoverLetterToTXT,
  exportToDOCX,
  type JSONResumeFormat,
  type CoverLetterExportFormat,
} from "../export";
import { ResumeData } from "@/lib/types/resume";
import { CoverLetterData } from "@/lib/types/cover-letter";

const sampleResumeData: ResumeData = {
  personalInfo: {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    phone: "555-1234",
    location: "San Francisco, CA",
    website: "https://janesmith.com",
    linkedin: "linkedin.com/in/janesmith",
    github: "github.com/janesmith",
    summary: "Full-stack engineer with 7+ years experience",
  },
  workExperience: [
    {
      id: "work-1",
      company: "Tech Startup",
      position: "Lead Engineer",
      location: "San Francisco, CA",
      startDate: "2021-03",
      endDate: "2023-12",
      current: false,
      description: ["Led team of 8 engineers", "Improved API performance by 40%"],
      achievements: ["Shipped 15+ features", "Mentored 3 junior developers"],
    },
    {
      id: "work-2",
      company: "Big Corp",
      position: "Senior Developer",
      location: "Remote",
      startDate: "2018-06",
      endDate: "2021-02",
      current: false,
      description: ["Built microservices architecture", "Managed database migrations"],
      achievements: ["Reduced load time by 50%"],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Stanford University",
      degree: "BS",
      field: "Computer Science",
      location: "Palo Alto, CA",
      startDate: "2014-09",
      endDate: "2018-05",
      current: false,
      gpa: "3.9",
      description: ["ACM President", "Dean's List"],
    },
  ],
  skills: [
    { id: "skill-1", name: "TypeScript", level: "expert", category: "Languages" },
    { id: "skill-2", name: "React", level: "expert", category: "Frontend" },
    { id: "skill-3", name: "Node.js", level: "advanced", category: "Backend" },
    { id: "skill-4", name: "AWS", level: "advanced", category: "Cloud" },
    { id: "skill-5", name: "PostgreSQL", level: "advanced", category: "Databases" },
  ],
  languages: [
    { id: "lang-1", name: "English", level: "native" },
    { id: "lang-2", name: "Spanish", level: "conversational" },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Open Source Dashboard",
      description: "Real-time analytics dashboard",
      technologies: ["React", "D3.js", "GraphQL"],
      url: "https://github.com/janesmith/dashboard",
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Solutions Architect",
      issuer: "Amazon",
      date: "2021-06",
      credentialId: "CERT-12345",
      url: "https://aws.amazon.com",
    },
  ],
  courses: [
    {
      id: "course-1",
      name: "Advanced React Patterns",
      institution: "Frontend Masters",
      date: "2022-03",
      url: "https://frontendmasters.com",
    },
  ],
  hobbies: [
    { id: "hobby-1", name: "Open source contribution" },
    { id: "hobby-2", name: "Tech blogging" },
  ],
  extraCurricular: [
    {
      id: "extra-1",
      title: "Tech Mentor",
      organization: "Code2040",
      role: "Mentor",
      startDate: "2021-01",
      current: true,
      description: ["Mentored 10+ junior engineers in full-stack development"],
    },
  ],
};

const sampleCoverLetterData: CoverLetterData = {
  id: "cover-letter-1",
  senderName: "Jane Smith",
  senderEmail: "jane@example.com",
  senderPhone: "555-1234",
  senderLocation: "San Francisco, CA",
  date: "2024-01-15",
  recipient: {
    name: "Hiring Manager",
    title: "Engineering Manager",
    company: "Acme Corp",
    department: "Engineering",
    address: "123 Tech Street, San Francisco, CA 94105",
  },
  jobTitle: "Senior Software Engineer",
  jobReference: "JOB123",
  salutation: "Dear Hiring Manager,",
  openingParagraph: "I am excited to apply for the Senior Software Engineer position at Acme Corp.",
  bodyParagraphs: [
    "With 7+ years of full-stack development experience...",
    "I have successfully led multiple technical initiatives...",
  ],
  closingParagraph: "Thank you for considering my application.",
  signOff: "Sincerely,",
  templateId: "modern",
  createdAt: "2024-01-15T00:00:00.000Z",
  updatedAt: "2024-01-15T00:00:00.000Z",
};

describe("Export Service", () => {
  describe("exportToJSON - Resume", () => {
    it("should export resume to JSON Resume format by default", () => {
      const result = exportToJSON(sampleResumeData, { format: "jsonresume" });
      const parsed = JSON.parse(result) as JSONResumeFormat;

      expect(parsed.$schema).toBe("https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json");
      expect(parsed.meta.version).toBe("1.0.0");
      expect(parsed.meta.generator).toBe("ResumeForge");
      expect(parsed.basics.name).toBe("Jane Smith");
      expect(parsed.basics.email).toBe("jane@example.com");
      expect(parsed.basics.phone).toBe("555-1234");
    });

    it("should preserve all work experience in JSON Resume format", () => {
      const result = exportToJSON(sampleResumeData, { format: "jsonresume" });
      const parsed = JSON.parse(result) as JSONResumeFormat;

      expect(parsed.work).toHaveLength(2);
      expect(parsed.work?.[0].name).toBe("Tech Startup");
      expect(parsed.work?.[0].position).toBe("Lead Engineer");
      expect(parsed.work?.[1].name).toBe("Big Corp");
    });

    it("should preserve all education in JSON Resume format", () => {
      const result = exportToJSON(sampleResumeData, { format: "jsonresume" });
      const parsed = JSON.parse(result) as JSONResumeFormat;

      expect(parsed.education).toHaveLength(1);
      if (parsed.education && parsed.education.length > 0) {
        expect(parsed.education[0].institution).toBe("Stanford University");
        expect(parsed.education[0].area).toBe("Computer Science");
        expect(parsed.education[0].studyType).toBe("BS");
      }
    });

    it("should group skills by category in JSON Resume format", () => {
      const result = exportToJSON(sampleResumeData, { format: "jsonresume" });
      const parsed = JSON.parse(result) as JSONResumeFormat;

      expect(parsed.skills).toBeDefined();
      expect(parsed.skills?.length).toBeGreaterThan(0);
      const languagesCategory = parsed.skills?.find(s => s.name === "Languages");
      expect(languagesCategory?.keywords).toContain("TypeScript");
    });

    it("should normalize social profiles with full URLs", () => {
      const result = exportToJSON(sampleResumeData, { format: "jsonresume" });
      const parsed = JSON.parse(result) as JSONResumeFormat;

      const linkedinProfile = parsed.basics.profiles?.find(p => p.network === "LinkedIn");
      expect(linkedinProfile?.url).toContain("linkedin.com");

      const githubProfile = parsed.basics.profiles?.find(p => p.network === "GitHub");
      expect(githubProfile?.url).toContain("github.com");
    });

    it("should include ResumeForge extensions with original data", () => {
      const result = exportToJSON(sampleResumeData, {
        format: "jsonresume",
        includeOriginal: true
      });
      const parsed = JSON.parse(result) as JSONResumeFormat;

      expect(parsed["x-resumeforge"]).toBeDefined();
      expect(parsed["x-resumeforge"]?.originalData).toBeDefined();
      expect(parsed["x-resumeforge"]?.originalData?.personalInfo.firstName).toBe("Jane");
    });

    it("should exclude original data when includeOriginal is false", () => {
      const result = exportToJSON(sampleResumeData, {
        format: "jsonresume",
        includeOriginal: false
      });
      const parsed = JSON.parse(result) as JSONResumeFormat;

      expect(parsed["x-resumeforge"]?.originalData).toBeUndefined();
    });

    it("should export to native format with metadata wrapper", () => {
      const result = exportToJSON(sampleResumeData, { format: "native" });
      const parsed = JSON.parse(result);

      expect(parsed.$schema).toBe("https://resumeforge.app/schema/resume/v1");
      expect(parsed.meta.version).toBe("1.0.0");
      expect(parsed.data).toBeDefined();
      expect(parsed.data.personalInfo.firstName).toBe("Jane");
    });

    it("should format JSON with pretty printing by default", () => {
      const result = exportToJSON(sampleResumeData, { pretty: true });
      expect(result).toContain("\n");
      expect(result).toContain("  ");
    });

    it("should minify JSON when pretty is false", () => {
      const result = exportToJSON(sampleResumeData, { pretty: false });
      expect(result).not.toMatch(/\n\s+/);
    });

    it("should handle missing optional fields gracefully", () => {
      const minimalResume: ResumeData = {
        personalInfo: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "555-0000",
          location: "New York, NY",
        },
        workExperience: [],
        education: [],
        skills: [],
        languages: [],
      };

      const result = exportToJSON(minimalResume, { format: "jsonresume" });
      const parsed = JSON.parse(result) as JSONResumeFormat;

      expect(parsed.basics.name).toBe("John Doe");
      expect(parsed.work).toBeUndefined();
      expect(parsed.skills).toBeUndefined();
    });
  });

  describe("exportToTXT - Resume", () => {
    it("should export resume to plain text format", () => {
      const result = exportToTXT(sampleResumeData);

      expect(result).toContain("Jane Smith");
      expect(result).toContain("jane@example.com");
      expect(result).toContain("555-1234");
      expect(result).toContain("San Francisco, CA");
    });

    it("should include work experience section", () => {
      const result = exportToTXT(sampleResumeData);

      expect(result).toContain("WORK EXPERIENCE");
      expect(result).toContain("Lead Engineer");
      expect(result).toContain("Tech Startup");
    });

    it("should include education section", () => {
      const result = exportToTXT(sampleResumeData);

      expect(result).toContain("EDUCATION");
      expect(result).toContain("Computer Science");
      expect(result).toContain("Stanford University");
    });

    it("should include skills section", () => {
      const result = exportToTXT(sampleResumeData);

      expect(result).toContain("SKILLS");
      expect(result).toContain("TypeScript");
      expect(result).toContain("React");
    });

    it("should include summary when present", () => {
      const result = exportToTXT(sampleResumeData);

      expect(result).toContain("SUMMARY");
      expect(result).toContain("Full-stack engineer");
    });

    it("should handle missing optional fields", () => {
      const minimalResume: ResumeData = {
        personalInfo: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "555-0000",
          location: "New York, NY",
        },
        workExperience: [],
        education: [],
        skills: [],
        languages: [],
      };

      const result = exportToTXT(minimalResume);

      expect(result).toContain("John Doe");
      expect(result).toContain("john@example.com");
      expect(result).not.toContain("WORK EXPERIENCE");
      expect(result).not.toContain("EDUCATION");
    });
  });

  describe("convertToJSONResume", () => {
    it("should convert all sections to JSON Resume format", () => {
      const result = convertToJSONResume(sampleResumeData);

      expect(result.basics).toBeDefined();
      expect(result.work).toBeDefined();
      expect(result.education).toBeDefined();
      expect(result.skills).toBeDefined();
      expect(result.languages).toBeDefined();
    });

    it("should map current employment correctly", () => {
      const dataWithCurrent: ResumeData = {
        ...sampleResumeData,
        workExperience: [
          {
            ...sampleResumeData.workExperience[0],
            current: true,
            endDate: "",
          },
        ],
      };

      const result = convertToJSONResume(dataWithCurrent);

      expect(result.work?.[0].endDate).toBeUndefined();
    });

    it("should map current education correctly", () => {
      const dataWithCurrent: ResumeData = {
        ...sampleResumeData,
        education: [
          {
            ...sampleResumeData.education[0],
            current: true,
            endDate: "",
          },
        ],
      };

      const result = convertToJSONResume(dataWithCurrent);

      expect(result.education?.[0].endDate).toBeUndefined();
    });

    it("should include projects in JSON Resume format", () => {
      const result = convertToJSONResume(sampleResumeData);

      expect(result.projects).toHaveLength(1);
      expect(result.projects?.[0].name).toBe("Open Source Dashboard");
      expect(result.projects?.[0].keywords).toContain("React");
    });

    it("should include certifications as certificates", () => {
      const result = convertToJSONResume(sampleResumeData);

      expect(result.certificates).toHaveLength(1);
      expect(result.certificates?.[0].name).toBe("AWS Solutions Architect");
      expect(result.certificates?.[0].issuer).toBe("Amazon");
    });

    it("should include hobbies as interests", () => {
      const result = convertToJSONResume(sampleResumeData);

      expect(result.interests).toHaveLength(2);
      expect(result.interests?.[0].name).toBe("Open source contribution");
    });

    it("should include extra-curricular as volunteer work", () => {
      const result = convertToJSONResume(sampleResumeData);

      expect(result.volunteer).toHaveLength(1);
      expect(result.volunteer?.[0].organization).toBe("Code2040");
    });

    it("should preserve original data in ResumeForge extensions", () => {
      const result = convertToJSONResume(sampleResumeData);

      expect(result["x-resumeforge"]?.originalData).toBeDefined();
      expect(result["x-resumeforge"]?.originalData?.personalInfo.firstName).toBe("Jane");
    });
  });

  describe("exportCoverLetterToJSON", () => {
    it("should export cover letter to JSON format", () => {
      const result = exportCoverLetterToJSON(sampleCoverLetterData);
      const parsed = JSON.parse(result) as CoverLetterExportFormat;

      expect(parsed.$schema).toBe("https://resumeforge.app/schema/cover-letter/v1");
      expect(parsed.meta.documentType).toBe("cover-letter");
      expect(parsed.meta.version).toBe("1.0.0");
      expect(parsed.meta.generator).toBe("ResumeForge");
    });

    it("should preserve all cover letter data fields", () => {
      const result = exportCoverLetterToJSON(sampleCoverLetterData);
      const parsed = JSON.parse(result) as CoverLetterExportFormat;

      expect(parsed.data.senderName).toBe("Jane Smith");
      expect(parsed.data.senderEmail).toBe("jane@example.com");
      expect(parsed.data.jobTitle).toBe("Senior Software Engineer");
      expect(parsed.data.recipient.name).toBe("Hiring Manager");
      expect(parsed.data.recipient.company).toBe("Acme Corp");
    });

    it("should include all body paragraphs", () => {
      const result = exportCoverLetterToJSON(sampleCoverLetterData);
      const parsed = JSON.parse(result) as CoverLetterExportFormat;

      expect(parsed.data.bodyParagraphs).toHaveLength(2);
      expect(parsed.data.bodyParagraphs[0]).toContain("7+ years");
    });

    it("should format JSON with pretty printing by default", () => {
      const result = exportCoverLetterToJSON(sampleCoverLetterData, true);
      expect(result).toContain("\n");
      expect(result).toContain("  ");
    });

    it("should minify JSON when pretty is false", () => {
      const result = exportCoverLetterToJSON(sampleCoverLetterData, false);
      expect(result).not.toMatch(/\n\s+/);
    });
  });

  describe("exportCoverLetterToTXT", () => {
    it("should export cover letter to plain text format", () => {
      const result = exportCoverLetterToTXT(sampleCoverLetterData);

      expect(result).toContain("Jane Smith");
      expect(result).toContain("jane@example.com");
      expect(result).toContain("555-1234");
      expect(result).toContain("San Francisco, CA");
    });

    it("should include sender information", () => {
      const result = exportCoverLetterToTXT(sampleCoverLetterData);

      expect(result).toContain("Jane Smith");
      expect(result).toContain("jane@example.com");
      expect(result).toContain("555-1234");
    });

    it("should include recipient information", () => {
      const result = exportCoverLetterToTXT(sampleCoverLetterData);

      expect(result).toContain("Hiring Manager");
      expect(result).toContain("Engineering Manager");
      expect(result).toContain("Acme Corp");
    });

    it("should include date", () => {
      const result = exportCoverLetterToTXT(sampleCoverLetterData);

      expect(result).toContain("2024-01-15");
    });

    it("should include job title and reference", () => {
      const result = exportCoverLetterToTXT(sampleCoverLetterData);

      expect(result).toContain("Senior Software Engineer");
      expect(result).toContain("JOB123");
    });

    it("should include all body sections", () => {
      const result = exportCoverLetterToTXT(sampleCoverLetterData);

      expect(result).toContain("Dear Hiring Manager,");
      expect(result).toContain("I am excited to apply");
      expect(result).toContain("Thank you for considering");
      expect(result).toContain("Sincerely,");
    });

    it("should include all body paragraphs", () => {
      const result = exportCoverLetterToTXT(sampleCoverLetterData);

      expect(result).toContain("7+ years");
      expect(result).toContain("technical initiatives");
    });

    it("should handle missing optional fields", () => {
      const minimalLetter: CoverLetterData = {
        id: "cover-letter-2",
        senderName: "John Doe",
        senderEmail: "john@example.com",
        senderPhone: "",
        senderLocation: "",
        date: new Date().toLocaleDateString(),
        recipient: {
          name: "Hiring Manager",
          company: "Company Inc",
        },
        jobTitle: "Developer",
        jobReference: "",
        salutation: "Dear Hiring Manager,",
        openingParagraph: "I am interested in this position.",
        bodyParagraphs: [],
        closingParagraph: "",
        signOff: "Sincerely,",
        templateId: "modern",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = exportCoverLetterToTXT(minimalLetter);

      expect(result).toContain("John Doe");
      expect(result).toContain("Dear Hiring Manager,");
      expect(result).not.toContain("Ref:");
    });
  });

  describe("Data preservation and round-trip fidelity", () => {
    it("should preserve all resume data in JSON Resume format with extensions", () => {
      const json = exportToJSON(sampleResumeData, {
        format: "jsonresume",
        includeOriginal: true,
      });
      const parsed = JSON.parse(json) as JSONResumeFormat;

      const original = parsed["x-resumeforge"]?.originalData;
      expect(original?.personalInfo.firstName).toBe("Jane");
      expect(original?.workExperience).toHaveLength(2);
      expect(original?.education).toHaveLength(1);
      expect(original?.skills).toHaveLength(5);
    });

    it("should create valid JSON Resume output", () => {
      const result = convertToJSONResume(sampleResumeData);

      // JSON Resume schema requires certain fields
      expect(result.$schema).toBeDefined();
      expect(result.meta).toBeDefined();
      expect(result.basics).toBeDefined();
      expect(result.basics.name).toBeDefined();
      expect(result.basics.email).toBeDefined();
      expect(result.basics.phone).toBeDefined();
    });

    it("should handle all optional sections gracefully", () => {
      const dataWithAllSections: ResumeData = {
        ...sampleResumeData,
        projects: sampleResumeData.projects,
        certifications: sampleResumeData.certifications,
        courses: sampleResumeData.courses,
        hobbies: sampleResumeData.hobbies,
        extraCurricular: sampleResumeData.extraCurricular,
      };

      const result = convertToJSONResume(dataWithAllSections);

      expect(result.projects).toBeDefined();
      expect(result.certificates).toBeDefined();
      expect(result.interests).toBeDefined();
      expect(result.volunteer).toBeDefined();
    });
  });

  describe("Error handling and edge cases", () => {
    it("should handle empty resume gracefully", () => {
      const emptyResume: ResumeData = {
        personalInfo: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "555-0000",
          location: "New York, NY",
        },
        workExperience: [],
        education: [],
        skills: [],
        languages: [],
      };

      const jsonResult = exportToJSON(emptyResume);
      expect(() => JSON.parse(jsonResult)).not.toThrow();

      const txtResult = exportToTXT(emptyResume);
      expect(txtResult).toContain("John Doe");
    });

    it("should handle special characters in text", () => {
      const dataWithSpecialChars: ResumeData = {
        ...sampleResumeData,
        personalInfo: {
          ...sampleResumeData.personalInfo,
          summary: 'Specialized in "modern" & <recent> tech with 50% efficiency gains',
        },
      };

      const jsonResult = exportToJSON(dataWithSpecialChars);
      const parsed = JSON.parse(jsonResult);
      expect(parsed).toBeDefined();

      const txtResult = exportToTXT(dataWithSpecialChars);
      expect(txtResult).toContain("50%");
    });

    it("should handle very long text fields", () => {
      const longDescription = "A".repeat(10000);
      const dataWithLongText: ResumeData = {
        ...sampleResumeData,
        personalInfo: {
          ...sampleResumeData.personalInfo,
          summary: longDescription,
        },
      };

      const jsonResult = exportToJSON(dataWithLongText);
      const parsed = JSON.parse(jsonResult);
      expect(parsed.meta.version).toBe("1.0.0");

      const txtResult = exportToTXT(dataWithLongText);
      expect(txtResult.length).toBeGreaterThan(10000);
    });

    it("should include metadata with ISO timestamp", () => {
      const result = exportToJSON(sampleResumeData);
      const parsed = JSON.parse(result) as JSONResumeFormat;

      expect(parsed.meta.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(new Date(parsed.meta.exportedAt).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("exports DOCX successfully", async () => {
      const result = await exportToDOCX(sampleResumeData);
      expect(result.success).toBe(true);
      expect(result.blob).toBeDefined();
    });
  });
});
