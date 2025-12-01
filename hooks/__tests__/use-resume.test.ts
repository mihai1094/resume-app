import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useResume } from "../use-resume";
import { ResumeData } from "@/lib/types/resume";

const sampleResume = (): ResumeData => ({
  personalInfo: {
    firstName: "Alex",
    lastName: "Taylor",
    email: "alex@example.com",
    phone: "555-555-5555",
    location: "Denver, CO",
    website: "",
    linkedin: "",
    github: "",
    summary: "",
  },
  workExperience: [
    {
      id: "exp-1",
      company: "Acme",
      position: "Engineer",
      location: "Remote",
      startDate: "2020-01",
      endDate: "2022-01",
      current: false,
      description: ["Did things"],
      achievements: [],
    },
  ],
  education: [],
  skills: [],
  languages: [],
  courses: [],
  hobbies: [],
  extraCurricular: [],
});

describe("useResume", () => {
  it("initializes with an empty resume", () => {
    const { result } = renderHook(() => useResume());
    expect(result.current.resumeData.personalInfo.firstName).toBe("");
    expect(result.current.resumeData.workExperience).toHaveLength(0);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("updates personal info and marks the resume dirty", () => {
    const { result } = renderHook(() => useResume());

    act(() => {
      result.current.updatePersonalInfo({ firstName: "Jordan" });
    });

    expect(result.current.resumeData.personalInfo.firstName).toBe("Jordan");
    expect(result.current.isDirty).toBe(true);
  });

  it("adds and reorders work experience entries", () => {
    const { result } = renderHook(() => useResume());

    act(() => {
      result.current.addWorkExperience();
      result.current.addWorkExperience();
    });

    expect(result.current.resumeData.workExperience).toHaveLength(2);
    const firstId = result.current.resumeData.workExperience[0].id;
    const secondId = result.current.resumeData.workExperience[1].id;

    act(() => {
      result.current.reorderWorkExperience(0, 1);
    });

    expect(result.current.resumeData.workExperience[0].id).toBe(secondId);
    expect(result.current.resumeData.workExperience[1].id).toBe(firstId);
  });

  it("supports undo and redo operations", () => {
    const { result } = renderHook(() => useResume());

    act(() => {
      result.current.updatePersonalInfo({ firstName: "Jordan" });
    });

    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.undo();
    });

    expect(result.current.resumeData.personalInfo.firstName).toBe("");
    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.redo();
    });

    expect(result.current.resumeData.personalInfo.firstName).toBe("Jordan");
  });

  it("loads external data and resets history", () => {
    const external = sampleResume();
    const { result } = renderHook(() => useResume());

    act(() => {
      result.current.loadResume(external);
    });

    expect(result.current.resumeData.personalInfo.firstName).toBe("Alex");
    expect(result.current.isDirty).toBe(false);
    expect(result.current.canUndo).toBe(false);

    act(() => {
      result.current.updatePersonalInfo({ lastName: "Stone" });
    });

    expect(result.current.isDirty).toBe(true);
  });

  it("resets to an empty resume", () => {
    const { result } = renderHook(() => useResume());

    act(() => {
      result.current.updatePersonalInfo({ firstName: "Jordan" });
      result.current.resetResume();
    });

    expect(result.current.resumeData.personalInfo.firstName).toBe("");
    expect(result.current.resumeData.workExperience).toHaveLength(0);
    expect(result.current.isDirty).toBe(false);
  });
});

