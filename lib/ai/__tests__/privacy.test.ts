import { afterEach, describe, expect, it, vi } from "vitest";
import { sanitizeResumeForAI, sanitizeTextForAI } from "@/lib/ai/privacy";
import type { ResumeData } from "@/lib/types/resume";

const sampleResume: ResumeData = {
  personalInfo: {
    firstName: "Catalin",
    lastName: "Mihai",
    email: "catalin@example.com",
    phone: "+40 760 111 222",
    location: "Bucharest",
    website: "https://example.com",
    linkedin: "https://linkedin.com/in/catalin",
    github: "https://github.com/catalin",
    summary: "Senior frontend engineer.",
    jobTitle: "Senior Frontend Engineer",
    photo: "data:image/png;base64,abc",
  },
  workExperience: [
    {
      id: "exp-1",
      company: "Acme",
      position: "Engineer",
      location: "Bucharest",
      startDate: "2022-01",
      endDate: "2024-01",
      current: false,
      description: ["Built internal platform"],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "UPB",
      degree: "BSc",
      field: "Engineering",
      location: "Bucharest",
      startDate: "2017-01",
      endDate: "2020-01",
      current: false,
      description: ["Applied Informatics"],
    },
  ],
  skills: [{ id: "s1", name: "Next.js", category: "Programming Languages" }],
  projects: [
    {
      id: "p1",
      name: "Project",
      description: "Desc",
      technologies: ["TypeScript"],
      url: "https://private-project.example.com",
      github: "https://github.com/private",
    },
  ],
  certifications: [
    {
      id: "c1",
      name: "Cert",
      issuer: "Issuer",
      date: "2024-01",
      url: "https://cert.example.com",
    },
  ],
  courses: [
    {
      id: "co1",
      name: "Course",
      url: "https://course.example.com",
    },
  ],
  hobbies: [{ id: "h1", name: "MMA" }],
  extraCurricular: [{ id: "e1", title: "Volunteering", description: [] }],
  languages: [{ id: "l1", name: "Spanish", level: "fluent" }],
};

describe("AI privacy sanitization", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("strips direct identifiers in strict mode by default", () => {
    const result = sanitizeResumeForAI(sampleResume, { mode: "strict" });

    expect(result.personalInfo.firstName).toBe("");
    expect(result.personalInfo.lastName).toBe("");
    expect(result.personalInfo.email).toBe("");
    expect(result.personalInfo.phone).toBe("");
    expect(result.personalInfo.website).toBe("");
    expect(result.personalInfo.linkedin).toBe("");
    expect(result.personalInfo.github).toBe("");
    expect(result.personalInfo.location).toBe("Bucharest");
    expect(result.projects?.[0].url).toBe("");
    expect(result.projects?.[0].github).toBe("");
    expect(result.certifications?.[0].url).toBe("");
    expect(result.courses?.[0].url).toBe("");
  });

  it("keeps identifiers only when explicitly allowed in standard mode", () => {
    vi.stubEnv("AI_ALLOW_PII", "true");
    const result = sanitizeResumeForAI(sampleResume, { mode: "standard" });

    expect(result.personalInfo.firstName).toBe("Catalin");
    expect(result.personalInfo.lastName).toBe("Mihai");
    expect(result.personalInfo.email).toBe("catalin@example.com");
    expect(result.personalInfo.phone).toContain("760");
  });

  it("drops nonessential sections in ATS profile mode", () => {
    const result = sanitizeResumeForAI(sampleResume, {
      mode: "strict",
      profile: "ats",
    });

    expect(result.languages).toEqual([]);
    expect(result.hobbies).toEqual([]);
    expect(result.courses).toEqual([]);
    expect(result.extraCurricular).toEqual([]);
  });

  it("redacts email, phone and urls from free-text prompts", () => {
    const safe = sanitizeTextForAI(
      "Email me at me@example.com, call +1 415 555 0123, profile https://x.com/me",
      { maxLength: 300 }
    );

    expect(safe).not.toContain("me@example.com");
    expect(safe).not.toContain("415");
    expect(safe).not.toContain("https://x.com/me");
    expect(safe).toContain("[REDACTED_EMAIL]");
    expect(safe).toContain("[REDACTED_PHONE]");
    expect(safe).toContain("[REDACTED_URL]");
  });
});
