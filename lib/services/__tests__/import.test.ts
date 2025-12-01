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
      school: "MIT",
      degree: "BS",
      field: "Computer Science",
      startDate: "2015-09",
      endDate: "2019-05",
      current: false,
      grade: "3.8",
      activities: ["Computer Science Club", "Hackathon Winner"],
    },
  ],
  skills: [
    { id: "skill-1", name: "JavaScript", level: "expert" },
    { id: "skill-2", name: "TypeScript", level: "advanced" },
    { id: "skill-3", name: "React", level: "advanced" },
  ],
  languages: [
    { id: "lang-1", language: "English", proficiency: "native" },
    { id: "lang-2", language: "Spanish", proficiency: "intermediate" },
  ],
  courses: [
    {
      id: "course-1",
      name: "Advanced React",
      issuer: "Udacity",
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
      activity: "Volunteer Coding Instructor",
      organization: "Code2040",
      date: "2021-01",
      description: "Taught Python to high school students",
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
  });
});
