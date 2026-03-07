import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResumeData } from "@/lib/types/resume";
import { ensureMinimumLuminance } from "@/lib/utils/color";

const renderedMarkup: string[] = vi.hoisted(() => []);
const mockToBlob = vi.hoisted(() =>
  vi.fn(async () => new Blob(["pdf"], { type: "application/pdf" }))
);
const mockPdf = vi.hoisted(() =>
  vi.fn((doc: React.ReactElement) => {
    renderedMarkup.length = 0;
    renderedMarkup.push(renderToStaticMarkup(doc));
    return { toBlob: mockToBlob };
  })
);

vi.mock("@react-pdf/renderer", async () => {
  const React = await import("react");

  const createPrimitive = (tag: string) => {
    const Primitive = ({ children, ...props }: Record<string, unknown>) =>
      React.createElement(tag, props, children as React.ReactNode);
    Primitive.displayName = `Mock${tag[0].toUpperCase()}${tag.slice(1)}`;
    return Primitive;
  };

  return {
    pdf: mockPdf,
    Document: createPrimitive("document"),
    Page: createPrimitive("page"),
    Text: createPrimitive("span"),
    View: createPrimitive("div"),
    Image: createPrimitive("img"),
    Link: createPrimitive("a"),
    StyleSheet: {
      create: <T,>(styles: T) => styles,
    },
    Font: {
      register: vi.fn(),
      registerHyphenationCallback: vi.fn(),
    },
  };
});

import { exportToPDF } from "../export";

const sampleResumeData: ResumeData = {
  personalInfo: {
    firstName: "Costica",
    lastName: "Miol",
    email: "costica@example.com",
    phone: "555-123-9876",
    location: "Iasi, Romania",
    linkedin: "linkedin.com/in/costicamiol",
    github: "github.com/costicamiol",
    website: "https://costicamiol.dev",
    summary:
      "Seasoned Software Analyst adept at leading complex analysis and strategic initiatives.",
  },
  workExperience: [
    {
      id: "exp-1",
      company: "MollozIT",
      position: "Junior Technical Analyst",
      location: "Iasi",
      startDate: "2024-01",
      endDate: "2026-04",
      current: false,
      description: [
        "Translate business requirements into clear technical requirements.",
        "Coordinate QA plans across clients and internal teams.",
      ],
      achievements: ["Reduced defects by 18% across two release cycles."],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Politehnica din Torino",
      degree: "Computer Science",
      field: "Computer Science",
      location: "Torino",
      startDate: "2022-10",
      endDate: "2026-01",
      current: false,
      gpa: "9",
      description: [],
    },
  ],
  skills: [
    { id: "skill-1", name: "TypeScript", level: "expert", category: "Languages" },
    { id: "skill-2", name: "React", level: "advanced", category: "Frontend" },
    { id: "skill-3", name: "Playwright", level: "advanced", category: "QA" },
  ],
  languages: [{ id: "lang-1", name: "Romanian", level: "native" }],
  projects: [
    {
      id: "project-1",
      name: "Quality Analytics",
      description: "Internal dashboard for release-readiness reporting.",
      technologies: ["Next.js", "TypeScript", "PostgreSQL"],
      github: "https://github.com/costicamiol/quality-analytics",
    },
  ],
  certifications: [],
  courses: [],
  hobbies: [],
  extraCurricular: [],
  customSections: [],
};

describe("exportToPDF - technical template", () => {
  beforeEach(() => {
    mockPdf.mockClear();
    mockToBlob.mockClear();
    renderedMarkup.length = 0;
  });

  it("exports the technical template as a PDF blob", async () => {
    const result = await exportToPDF(sampleResumeData, "technical", {
      customization: {
        primaryColor: "#0ea5e9",
        secondaryColor: "#0f172a",
        accentColor: "#111827",
      },
    });

    expect(result.success).toBe(true);
    expect(result.blob).toBeInstanceOf(Blob);
    expect(result.blob?.type).toBe("application/pdf");
    expect(mockPdf).toHaveBeenCalledTimes(1);
    expect(mockToBlob).toHaveBeenCalledTimes(1);
  });

  it("keeps technical template accents readable in the rendered PDF markup", async () => {
    const darkSecondary = "#0f172a";
    const expectedReadableKeyword = ensureMinimumLuminance(darkSecondary, 0.4);

    const result = await exportToPDF(sampleResumeData, "technical", {
      customization: {
        secondaryColor: darkSecondary,
      },
    });

    expect(result.success).toBe(true);
    expect(renderedMarkup[0]).toContain(expectedReadableKeyword);
    expect(renderedMarkup[0]).not.toContain(`color:${darkSecondary}`);
  });

  it("exports long technical resumes without failing", async () => {
    const longResume: ResumeData = {
      ...sampleResumeData,
      workExperience: [
        {
          ...sampleResumeData.workExperience[0],
          description: Array.from({ length: 14 }, (_, index) =>
            `Bullet ${index + 1}: Coordinated multi-team quality workflows, authored plans, and tracked release readiness across a complex delivery program with long descriptive content.`
          ),
          achievements: Array.from({ length: 6 }, (_, index) =>
            `Achievement ${index + 1}: Improved process visibility and reduced ambiguity for cross-functional stakeholders.`
          ),
        },
        ...Array.from({ length: 2 }, (_, index) => ({
          id: `exp-extra-${index}`,
          company: `Company ${index + 2}`,
          position: `Senior Analyst ${index + 2}`,
          location: "Remote",
          startDate: "2021-01",
          endDate: "2023-12",
          current: false,
          description: Array.from({ length: 8 }, (_, bulletIndex) =>
            `Extra role ${index + 2}, bullet ${bulletIndex + 1}: Delivered reporting, automation, and planning support for engineering programs.`
          ),
          achievements: [],
        })),
      ],
      projects: Array.from({ length: 5 }, (_, index) => ({
        id: `project-${index + 2}`,
        name: `Project ${index + 2}`,
        description:
          "A substantial internal project description intended to create enough content to stress pagination behavior during PDF export.",
        technologies: ["React", "Node.js", "Playwright", "SQL"],
        github: `https://github.com/costicamiol/project-${index + 2}`,
      })),
    };

    const result = await exportToPDF(longResume, "technical");

    expect(result.success).toBe(true);
    expect(result.blob?.size).toBeGreaterThan(0);
    expect(mockPdf).toHaveBeenCalledTimes(1);
  });
});
