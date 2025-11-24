"use client";

import { useState, useCallback } from "react";
import { ResumeData } from "@/lib/types/resume";
import { generateId } from "@/lib/utils";
import { validateResume } from "@/lib/validation/resume-validation";

const initialResumeData: ResumeData = {
  personalInfo: {
    firstName: "Jordan",
    lastName: "Parker",
    email: "jordan.parker@example.com",
    phone: "+1 (555) 123-4567",
    location: "Bucharest, Romania",
    website: "https://jordan.codes",
    linkedin: "linkedin.com/in/jordanparker",
    github: "github.com/jordan-parker",
    summary:
      "Product-focused senior software engineer with 8+ years of experience crafting performant web applications and leading cross-functional teams.",
  },
  workExperience: [
    {
      id: generateId(),
      company: "NovaTech Solutions",
      position: "Senior Frontend Engineer",
      location: "Remote",
      startDate: "2021-04",
      endDate: "",
      current: true,
      description: [
        "Led development of a component library used across 5 product teams, reducing UI bugs by 35%.",
        "Partnered with design and product to deliver a new analytics suite that increased retention by 12%.",
      ],
      achievements: ["Employee of the Quarter (Q3 2023)"],
    },
    {
      id: generateId(),
      company: "Acme Fintech",
      position: "Full Stack Engineer",
      location: "Berlin, Germany",
      startDate: "2018-01",
      endDate: "2021-03",
      current: false,
      description: [
        "Implemented real-time payments dashboard using Next.js and WebSockets.",
        "Improved CI/CD pipeline, decreasing deployment time from 15 minutes to 5 minutes.",
      ],
      achievements: [],
    },
  ],
  education: [
    {
      id: generateId(),
      institution: "University of Technology",
      degree: "Bachelor of Science",
      field: "Computer Science",
      location: "Cluj-Napoca, Romania",
      startDate: "2012-09",
      endDate: "2016-06",
      current: false,
      description: ["Graduated with honors, captain of the programming team."],
    },
  ],
  skills: [
    {
      id: generateId(),
      name: "TypeScript",
      category: "Languages",
      level: "expert",
    },
    {
      id: generateId(),
      name: "React / Next.js",
      category: "Frameworks",
      level: "expert",
    },
    {
      id: generateId(),
      name: "Node.js",
      category: "Backend",
      level: "advanced",
    },
  ],
  projects: [
    {
      id: generateId(),
      name: "Resume Builder Pro",
      description:
        "End-to-end resume builder with live preview, PDF export, and template customization.",
      technologies: ["Next.js", "Tailwind CSS", "TypeScript"],
      url: "https://resume.example.com",
      github: "https://github.com/jordan-parker/resume-builder",
      startDate: "2023-02",
      endDate: "2023-06",
    },
  ],
  languages: [
    {
      id: generateId(),
      name: "English",
      level: "native",
    },
    {
      id: generateId(),
      name: "Spanish",
      level: "fluent",
    },
  ],
  certifications: [
    {
      id: generateId(),
      name: "AWS Certified Developer – Associate",
      issuer: "Amazon Web Services",
      date: "2022-10",
      credentialId: "ABC-1234",
      url: "https://aws.amazon.com",
    },
  ],
  courses: [
    {
      id: generateId(),
      name: "Advanced React Patterns",
      institution: "Frontend Masters",
      date: "2021-08",
      credentialId: "FRONTEND-9876",
      url: "https://frontendmasters.com",
    },
  ],
  hobbies: [
    {
      id: generateId(),
      name: "Photography",
      description: "Street and travel photography showcased on local exhibits.",
    },
  ],
  extraCurricular: [
    {
      id: generateId(),
      title: "Tech Meetup Organizer",
      organization: "JS Bucharest",
      role: "Co-organizer",
      startDate: "2020-05",
      endDate: "",
      current: true,
      description: [
        "Plan monthly agenda and invite speakers focused on front-end topics.",
        "Coordinate sponsors and logistics for 120+ regular attendees.",
      ],
    },
  ],
  customSections: [
    {
      id: generateId(),
      title: "Volunteer Work",
      items: [
        {
          id: generateId(),
          title: "Code Mentor",
          description: "Mentored early-career developers bi-weekly via ADPList.",
          date: "2021-Present",
          location: "Remote",
        },
      ],
    },
  ],
};

export function useResume() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [isDirty, setIsDirty] = useState(false);

  const updatePersonalInfo = useCallback(
    (info: Partial<ResumeData["personalInfo"]>) => {
      setResumeData((prev) => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, ...info },
      }));
      setIsDirty(true);
    },
    []
  );

  const addWorkExperience = useCallback(() => {
    const newExperience = {
      id: generateId(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: [""],
      achievements: [],
    };
    setResumeData((prev) => ({
      ...prev,
      workExperience: [...prev.workExperience, newExperience],
    }));
    setIsDirty(true);
  }, []);

  const updateWorkExperience = useCallback(
    (id: string, updates: Partial<ResumeData["workExperience"][0]>) => {
      setResumeData((prev) => ({
        ...prev,
        workExperience: prev.workExperience.map((exp) =>
          exp.id === id ? { ...exp, ...updates } : exp
        ),
      }));
      setIsDirty(true);
    },
    []
  );

  const removeWorkExperience = useCallback((id: string) => {
    setResumeData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((exp) => exp.id !== id),
    }));
    setIsDirty(true);
  }, []);

  const reorderWorkExperience = useCallback(
    (startIndex: number, endIndex: number) => {
      setResumeData((prev) => {
        const newWorkExperience = [...prev.workExperience];
        const [removed] = newWorkExperience.splice(startIndex, 1);
        newWorkExperience.splice(endIndex, 0, removed);
        return {
          ...prev,
          workExperience: newWorkExperience,
        };
      });
      setIsDirty(true);
    },
    []
  );

  const setWorkExperience = useCallback((items: ResumeData["workExperience"]) => {
    setResumeData((prev) => ({
      ...prev,
      workExperience: items,
    }));
    setIsDirty(true);
  }, []);

  const addEducation = useCallback(() => {
    const newEducation = {
      id: generateId(),
      institution: "",
      degree: "",
      field: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: [],
    };
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEducation],
    }));
    setIsDirty(true);
  }, []);

  const updateEducation = useCallback(
    (id: string, updates: Partial<ResumeData["education"][0]>) => {
      setResumeData((prev) => ({
        ...prev,
        education: prev.education.map((edu) =>
          edu.id === id ? { ...edu, ...updates } : edu
        ),
      }));
      setIsDirty(true);
    },
    []
  );

  const removeEducation = useCallback((id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
    setIsDirty(true);
  }, []);

  const reorderEducation = useCallback(
    (startIndex: number, endIndex: number) => {
      setResumeData((prev) => {
        const newEducation = [...prev.education];
        const [removed] = newEducation.splice(startIndex, 1);
        newEducation.splice(endIndex, 0, removed);
        return {
          ...prev,
          education: newEducation,
        };
      });
      setIsDirty(true);
    },
    []
  );

  const setEducation = useCallback((items: ResumeData["education"]) => {
    setResumeData((prev) => ({
      ...prev,
      education: items,
    }));
    setIsDirty(true);
  }, []);

  const addSkill = useCallback((skill: Omit<ResumeData["skills"][0], "id">) => {
    const newSkill = {
      id: generateId(),
      ...skill,
    };
    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
    setIsDirty(true);
  }, []);

  const updateSkill = useCallback(
    (id: string, updates: Partial<ResumeData["skills"][0]>) => {
      setResumeData((prev) => ({
        ...prev,
        skills: prev.skills.map((skill) =>
          skill.id === id ? { ...skill, ...updates } : skill
        ),
      }));
      setIsDirty(true);
    },
    []
  );

  const removeSkill = useCallback((id: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== id),
    }));
    setIsDirty(true);
  }, []);

  // Languages
  const addLanguage = useCallback(() => {
    const newLanguage = {
      id: generateId(),
      name: "",
      level: "conversational" as const,
    };
    setResumeData((prev) => ({
      ...prev,
      languages: [...(prev.languages || []), newLanguage],
    }));
    setIsDirty(true);
  }, []);

  const updateLanguage = useCallback(
    (id: string, updates: Partial<NonNullable<ResumeData["languages"]>[0]>) => {
      setResumeData((prev) => ({
        ...prev,
        languages: (prev.languages || []).map((lang) =>
          lang.id === id ? { ...lang, ...updates } : lang
        ),
      }));
      setIsDirty(true);
    },
    []
  );

  const removeLanguage = useCallback((id: string) => {
    setResumeData((prev) => ({
      ...prev,
      languages: (prev.languages || []).filter((lang) => lang.id !== id),
    }));
    setIsDirty(true);
  }, []);

  // Courses
  const addCourse = useCallback(() => {
    const newCourse = {
      id: generateId(),
      name: "",
      institution: "",
      date: "",
      credentialId: "",
      url: "",
    };
    setResumeData((prev) => ({
      ...prev,
      courses: [...(prev.courses || []), newCourse],
    }));
    setIsDirty(true);
  }, []);

  const updateCourse = useCallback(
    (id: string, updates: Partial<NonNullable<ResumeData["courses"]>[0]>) => {
      setResumeData((prev) => ({
        ...prev,
        courses: (prev.courses || []).map((course) =>
          course.id === id ? { ...course, ...updates } : course
        ),
      }));
      setIsDirty(true);
    },
    []
  );

  const removeCourse = useCallback((id: string) => {
    setResumeData((prev) => ({
      ...prev,
      courses: (prev.courses || []).filter((course) => course.id !== id),
    }));
    setIsDirty(true);
  }, []);

  // Hobbies
  const addHobby = useCallback(() => {
    const newHobby = {
      id: generateId(),
      name: "",
      description: "",
    };
    setResumeData((prev) => ({
      ...prev,
      hobbies: [...(prev.hobbies || []), newHobby],
    }));
    setIsDirty(true);
  }, []);

  const updateHobby = useCallback(
    (id: string, updates: Partial<NonNullable<ResumeData["hobbies"]>[0]>) => {
      setResumeData((prev) => ({
        ...prev,
        hobbies: (prev.hobbies || []).map((hobby) =>
          hobby.id === id ? { ...hobby, ...updates } : hobby
        ),
      }));
      setIsDirty(true);
    },
    []
  );

  const removeHobby = useCallback((id: string) => {
    setResumeData((prev) => ({
      ...prev,
      hobbies: (prev.hobbies || []).filter((hobby) => hobby.id !== id),
    }));
    setIsDirty(true);
  }, []);

  // Extra-Curricular
  const addExtraCurricular = useCallback(() => {
    const newExtra = {
      id: generateId(),
      title: "",
      organization: "",
      role: "",
      startDate: "",
      endDate: "",
      current: false,
      description: [],
    };
    setResumeData((prev) => ({
      ...prev,
      extraCurricular: [...(prev.extraCurricular || []), newExtra],
    }));
    setIsDirty(true);
  }, []);

  const updateExtraCurricular = useCallback(
    (
      id: string,
      updates: Partial<NonNullable<ResumeData["extraCurricular"]>[0]>
    ) => {
      setResumeData((prev) => ({
        ...prev,
        extraCurricular: (prev.extraCurricular || []).map((extra) =>
          extra.id === id ? { ...extra, ...updates } : extra
        ),
      }));
      setIsDirty(true);
    },
    []
  );

  const removeExtraCurricular = useCallback((id: string) => {
    setResumeData((prev) => ({
      ...prev,
      extraCurricular: (prev.extraCurricular || []).filter(
        (extra) => extra.id !== id
      ),
    }));
    setIsDirty(true);
  }, []);

  const reorderExtraCurricular = useCallback(
    (startIndex: number, endIndex: number) => {
      setResumeData((prev) => {
        const newExtraCurricular = [...(prev.extraCurricular || [])];
        const [removed] = newExtraCurricular.splice(startIndex, 1);
        newExtraCurricular.splice(endIndex, 0, removed);
        return {
          ...prev,
          extraCurricular: newExtraCurricular,
        };
      });
      setIsDirty(true);
    },
    []
  );

  const setExtraCurricular = useCallback(
    (items: ResumeData["extraCurricular"]) => {
      setResumeData((prev) => ({
        ...prev,
        extraCurricular: items,
      }));
      setIsDirty(true);
    },
    []
  );

  const resetResume = useCallback(() => {
    setResumeData(initialResumeData);
    setIsDirty(false);
  }, []);

  const loadResume = useCallback((data: ResumeData) => {
    setResumeData(data);
    setIsDirty(false);
  }, []);

  const validation = validateResume(resumeData);

  return {
    resumeData,
    isDirty,
    updatePersonalInfo,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
    reorderWorkExperience,
    addEducation,
    updateEducation,
    removeEducation,
    reorderEducation,
    addSkill,
    updateSkill,
    removeSkill,
    addLanguage,
    updateLanguage,
    removeLanguage,
    addCourse,
    updateCourse,
    removeCourse,
    addHobby,
    updateHobby,
    removeHobby,
    addExtraCurricular,
    updateExtraCurricular,
    removeExtraCurricular,
    reorderExtraCurricular,
    resetResume,
    loadResume,
    validation,
    setWorkExperience,
    setEducation,
    setExtraCurricular,
  };
}
