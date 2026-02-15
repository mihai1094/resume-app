import { describe, it, expect } from "vitest";
import { importResume, importFromJSON, canImport } from "../import";
import { ResumeData } from "@/lib/types/resume";

const sampleResumeData: ResumeData = {
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "555-0000",
    location: "New York, NY",
    website: "https://johndoe.com",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
    summary: "Software engineer with 5+ years experience",
  },
  workExperience: [
    {
      id: "exp-1",
      company: "Tech Corp",
      position: "Senior Engineer",
      location: "New York, NY",
      startDate: "2020-01",
      endDate: "2023-12",
      current: false,
      description: ["Led team of 5 engineers", "Implemented microservices"],
      achievements: ["Reduced load time by 40%", "Mentored 2 junior developers"],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "MIT",
      degree: "BS",
      field: "Computer Science",
      location: "Cambridge, MA",
      startDate: "2015-09",
      endDate: "2019-05",
      current: false,
      gpa: "3.8",
      description: ["Computer Science Club", "Hackathon Winner"],
    },
  ],
  skills: [
    { id: "skill-1", name: "JavaScript", category: "Languages", level: "expert" },
    { id: "skill-2", name: "TypeScript", category: "Languages", level: "advanced" },
    { id: "skill-3", name: "React", category: "Frameworks", level: "advanced" },
  ],
  languages: [
    { id: "lang-1", name: "English", level: "native" },
    { id: "lang-2", name: "Spanish", level: "conversational" },
  ],
  courses: [
    {
      id: "course-1",
      name: "Advanced React",
      institution: "Udacity",
      date: "2022-06",
      url: "https://udacity.com",
    },
  ],
  hobbies: [
    { id: "hobby-1", name: "Open source contribution" },
    { id: "hobby-2", name: "Technical blogging" },
  ],
  extraCurricular: [
    {
      id: "extra-1",
      title: "Volunteer Coding Instructor",
      organization: "Code2040",
      startDate: "2021-01",
      description: ["Taught Python to high school students"],
    },
  ],
};

describe("Import Service", () => {
  describe("importResume function", () => {
    it("should import ResumeForge native format", async () => {
      const jsonStr = JSON.stringify({
        data: sampleResumeData,
        "$schema": "https://resumeforge.app/schema/resume/v1",
        meta: {
          version: "1.0.0",
          exportedAt: new Date().toISOString(),
          generator: "ResumeForge",
          generatorVersion: "1.0.0",
        },
      });

      const result = await importResume({ source: "json", data: jsonStr });

      expect(result.success).toBe(true);
      expect(result.format).toBe("resumeforge");
      expect(result.data?.personalInfo.firstName).toBe("John");
      expect(result.data?.workExperience).toHaveLength(1);
      expect(result.data?.education).toHaveLength(1);
      expect(result.data?.skills).toHaveLength(3);
    });

    it("should import legacy ResumeForge format", async () => {
      const jsonStr = JSON.stringify(sampleResumeData);
      const result = await importResume({ source: "json", data: jsonStr });

      expect(result.success).toBe(true);
      expect(result.format).toBe("legacy");
      expect(result.data?.personalInfo.firstName).toBe("John");
      expect(result.data?.workExperience).toHaveLength(1);
    });

    it("should handle invalid JSON gracefully", async () => {
      const invalidJson = "{ invalid json }";
      const result = await importResume({ source: "json", data: invalidJson });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle empty data", async () => {
      const result = await importResume({ source: "json", data: "" });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should preserve all data fields during import", async () => {
      const jsonStr = JSON.stringify(sampleResumeData);
      const result = await importResume({ source: "json", data: jsonStr });

      expect(result.success).toBe(true);
      expect(result.data?.languages).toHaveLength(2);
      expect(result.data?.courses).toHaveLength(1);
      expect(result.data?.hobbies).toHaveLength(2);
      expect(result.data?.extraCurricular).toHaveLength(1);
    });

    it("should handle JSON Resume format imports", async () => {
      // JSON Resume format with all required fields for validation
      const jsonResumeData = {
        basics: {
          name: "Jane Engineer",
          email: "jane@example.com",
          phone: "555-1111",
        },
        work: [
          {
            name: "Tech Corp",
            position: "Senior Engineer",
            startDate: "2020-01",
            endDate: "2023-12",
          },
        ],
        education: [
          {
            institution: "University",
            studyType: "BS",
            area: "Computer Science",
            startDate: "2016-09",
            endDate: "2020-05",
          },
        ],
        skills: [
          {
            name: "Languages",
            keywords: ["JavaScript", "TypeScript"],
          },
        ],
      };

      const jsonStr = JSON.stringify(jsonResumeData);
      const result = await importResume({ source: "json", data: jsonStr });

      expect(result.success).toBe(true);
      expect(result.format).toBe("jsonresume");
      expect(result.data?.personalInfo.firstName).toBe("Jane");
      // Converted data will have generated IDs
      if (result.data?.workExperience.length) {
        expect(result.data.workExperience[0].id).toBeDefined();
        expect(typeof result.data.workExperience[0].id).toBe("string");
      }
    });
  });

  describe("Format Detection", () => {
    it("should detect JSON Resume standard format with canImport", () => {
      const data = {
        basics: {
          name: "John Doe",
          email: "john@example.com",
        },
        work: [],
        education: [],
      };
      const result = canImport(JSON.stringify(data));
      expect(result.valid).toBe(true);
      expect(result.format).toBe("jsonresume");
    });

    it("should detect legacy ResumeForge format with canImport", () => {
      const result = canImport(JSON.stringify(sampleResumeData));
      expect(result.valid).toBe(true);
      expect(result.format).toBe("legacy");
    });

    it("should return unknown for unrecognized formats", () => {
      const data = { unknownField: "value" };
      const result = canImport(JSON.stringify(data));
      expect(result.valid).toBe(false);
    });

    it("should handle invalid JSON gracefully", () => {
      const result = canImport("{ invalid json }");
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should detect resumeforge format with x-resumeforge extension", () => {
      const data = {
        basics: { name: "Test User" },
        "x-resumeforge": { originalData: sampleResumeData },
      };
      const result = canImport(JSON.stringify(data));
      expect(result.valid).toBe(true);
      expect(result.format).toBe("resumeforge");
    });

    it("should detect resumeforge format with schema URL", () => {
      const data = {
        $schema: "https://resumeforge.app/schema/resume/v1",
        data: sampleResumeData,
      };
      const result = canImport(JSON.stringify(data));
      expect(result.valid).toBe(true);
      expect(result.format).toBe("resumeforge");
    });
  });

  describe("JSON Resume Conversion", () => {
    it("should convert name into firstName and lastName", async () => {
      const jsonResume = {
        basics: {
          name: "Jane Marie Smith",
          email: "jane@example.com",
        },
        work: [],
        education: [],
      };

      const result = await importResume({ source: "json", data: JSON.stringify(jsonResume) });

      expect(result.success).toBe(true);
      expect(result.data?.personalInfo.firstName).toBe("Jane");
      expect(result.data?.personalInfo.lastName).toBe("Marie Smith");
    });

    it("should handle single-word names by failing validation (lastName required)", async () => {
      const jsonResume = {
        basics: {
          name: "Madonna",
          email: "madonna@example.com",
        },
        work: [],
        education: [],
      };

      const result = await importResume({ source: "json", data: JSON.stringify(jsonResume) });

      // Single-word names fail validation because lastName is required
      expect(result.success).toBe(false);
      expect(result.error).toContain("Last name");
    });

    it("should extract LinkedIn and GitHub from profiles", async () => {
      const jsonResume = {
        basics: {
          name: "John Doe",
          email: "john@example.com",
          profiles: [
            { network: "LinkedIn", url: "https://linkedin.com/in/johndoe" },
            { network: "GitHub", url: "https://github.com/johndoe" },
            { network: "Twitter", url: "https://twitter.com/johndoe" },
          ],
        },
        work: [],
        education: [],
      };

      const result = await importResume({ source: "json", data: JSON.stringify(jsonResume) });

      expect(result.success).toBe(true);
      expect(result.data?.personalInfo.linkedin).toBe("https://linkedin.com/in/johndoe");
      expect(result.data?.personalInfo.github).toBe("https://github.com/johndoe");
    });

    it("should convert work experience with highlights to description", async () => {
      const jsonResume = {
        basics: { name: "John Doe", email: "john@example.com" },
        work: [
          {
            name: "Acme Corp",
            position: "Engineer",
            startDate: "2020-01",
            highlights: ["Built microservices", "Led team of 5"],
          },
        ],
        education: [],
      };

      const result = await importResume({ source: "json", data: JSON.stringify(jsonResume) });

      expect(result.success).toBe(true);
      expect(result.data?.workExperience[0].description).toContain("Built microservices");
      expect(result.data?.workExperience[0].description).toContain("Led team of 5");
    });

    it("should set current=true when work endDate is missing", async () => {
      const jsonResume = {
        basics: { name: "John Doe", email: "john@example.com" },
        work: [
          {
            name: "Current Job",
            position: "Engineer",
            startDate: "2022-01",
            // No endDate
          },
        ],
        education: [],
      };

      const result = await importResume({ source: "json", data: JSON.stringify(jsonResume) });

      expect(result.success).toBe(true);
      expect(result.data?.workExperience[0].current).toBe(true);
    });

    it("should flatten skills from skill groups with keywords", async () => {
      const jsonResume = {
        basics: { name: "John Doe", email: "john@example.com" },
        work: [],
        education: [],
        skills: [
          {
            name: "Programming",
            level: "expert",
            keywords: ["JavaScript", "TypeScript", "Python"],
          },
          {
            name: "Frameworks",
            keywords: ["React", "Next.js"],
          },
        ],
      };

      const result = await importResume({ source: "json", data: JSON.stringify(jsonResume) });

      expect(result.success).toBe(true);
      expect(result.data?.skills).toHaveLength(5);
      expect(result.data?.skills.find(s => s.name === "JavaScript")?.category).toBe("Programming");
      expect(result.data?.skills.find(s => s.name === "React")?.category).toBe("Frameworks");
    });

    it("should convert volunteer to extraCurricular", async () => {
      const jsonResume = {
        basics: { name: "John Doe", email: "john@example.com" },
        work: [],
        education: [],
        volunteer: [
          {
            organization: "Code.org",
            position: "Volunteer Instructor",
            startDate: "2021-01",
            summary: "Taught programming basics",
            highlights: ["Mentored 20 students"],
          },
        ],
      };

      const result = await importResume({ source: "json", data: JSON.stringify(jsonResume) });

      expect(result.success).toBe(true);
      expect(result.data?.extraCurricular).toHaveLength(1);
      expect(result.data?.extraCurricular?.[0].organization).toBe("Code.org");
      expect(result.data?.extraCurricular?.[0].title).toBe("Volunteer Instructor");
    });

    it("should convert interests to hobbies", async () => {
      const jsonResume = {
        basics: { name: "John Doe", email: "john@example.com" },
        work: [],
        education: [],
        interests: [
          { name: "Photography", keywords: ["landscape", "portraits"] },
          { name: "Gaming" },
        ],
      };

      const result = await importResume({ source: "json", data: JSON.stringify(jsonResume) });

      expect(result.success).toBe(true);
      expect(result.data?.hobbies).toHaveLength(2);
      expect(result.data?.hobbies?.[0].name).toBe("Photography");
      expect(result.data?.hobbies?.[0].description).toBe("landscape, portraits");
    });

    it("should convert certificates to certifications", async () => {
      const jsonResume = {
        basics: { name: "John Doe", email: "john@example.com" },
        work: [],
        education: [],
        certificates: [
          {
            name: "AWS Certified",
            issuer: "Amazon",
            date: "2023-06",
            url: "https://aws.amazon.com/cert/123",
          },
        ],
      };

      const result = await importResume({ source: "json", data: JSON.stringify(jsonResume) });

      expect(result.success).toBe(true);
      expect(result.data?.certifications).toHaveLength(1);
      expect(result.data?.certifications?.[0].name).toBe("AWS Certified");
      expect(result.data?.certifications?.[0].issuer).toBe("Amazon");
    });

    it("should use originalData from x-resumeforge for lossless import", async () => {
      const jsonResume = {
        basics: { name: "Different Name", email: "different@example.com" },
        "x-resumeforge": {
          originalData: sampleResumeData,
        },
      };

      const result = await importResume({ source: "json", data: JSON.stringify(jsonResume) });

      expect(result.success).toBe(true);
      // Should use originalData, not the converted basics
      expect(result.data?.personalInfo.firstName).toBe("John");
      expect(result.data?.personalInfo.lastName).toBe("Doe");
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing optional fields gracefully", async () => {
      const minimalResume: ResumeData = {
        personalInfo: {
          firstName: "Test",
          lastName: "User",
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
        // Optional fields intentionally undefined
      };

      const result = await importResume({ source: "json", data: JSON.stringify(minimalResume) });

      expect(result.success).toBe(true);
      // Legacy format preserves undefined for optional arrays (they're not auto-filled)
      expect(result.data?.languages).toBeUndefined();
      expect(result.data?.projects).toBeUndefined();
    });

    it("should reject data missing required firstName", async () => {
      const invalidData = {
        personalInfo: {
          firstName: "",
          lastName: "User",
        },
        workExperience: [],
        education: [],
      };

      const result = await importResume({ source: "json", data: JSON.stringify(invalidData) });

      expect(result.success).toBe(false);
      expect(result.error).toContain("First name");
    });

    it("should handle null values in parsed data", async () => {
      const dataWithNulls = {
        basics: {
          name: "John Doe",
          email: "john@example.com",
          phone: null,
          url: null,
        },
        work: [],
        education: [],
      };

      const result = await importResume({ source: "json", data: JSON.stringify(dataWithNulls) });

      expect(result.success).toBe(true);
      expect(result.data?.personalInfo.phone).toBe("");
    });

    it("should handle empty arrays in JSON Resume format", async () => {
      const emptyArrays = {
        basics: { name: "John Doe", email: "john@example.com" },
        work: [],
        education: [],
        skills: [],
        languages: [],
        projects: [],
        certificates: [],
        volunteer: [],
        interests: [],
      };

      const result = await importResume({ source: "json", data: JSON.stringify(emptyArrays) });

      expect(result.success).toBe(true);
      expect(result.data?.workExperience).toHaveLength(0);
      expect(result.data?.skills).toHaveLength(0);
    });

    it("should generate unique IDs for imported items", async () => {
      const jsonResume = {
        basics: { name: "John Doe", email: "john@example.com" },
        work: [
          { name: "Company A", position: "Engineer" },
          { name: "Company B", position: "Manager" },
        ],
        education: [],
      };

      const result = await importResume({ source: "json", data: JSON.stringify(jsonResume) });

      expect(result.success).toBe(true);
      const id1 = result.data?.workExperience[0].id;
      const id2 = result.data?.workExperience[1].id;
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });
  });

  describe("importResume source validation", () => {
    it("should reject json source with non-string data", async () => {
      const result = await importResume({ source: "json", data: new File([""], "test.json") });
      expect(result.success).toBe(false);
      expect(result.error).toBe("JSON data must be a string");
    });

    it("should reject file source with non-File data", async () => {
      const result = await importResume({ source: "file", data: "string data" });
      expect(result.success).toBe(false);
      expect(result.error).toBe("File data must be a File object");
    });

    it("should reject unsupported import source", async () => {
      // @ts-expect-error Testing invalid source
      const result = await importResume({ source: "invalid", data: "" });
      expect(result.success).toBe(false);
      expect(result.error).toContain("Unsupported import source");
    });
  });
});
