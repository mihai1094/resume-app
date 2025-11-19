"use client";

import { useState, useCallback } from "react";
import { ResumeData } from "@/lib/types/resume";
import { generateId, validateResumeData } from "@/lib/utils";

const initialResumeData: ResumeData = {
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

  const resetResume = useCallback(() => {
    setResumeData(initialResumeData);
    setIsDirty(false);
  }, []);

  const loadResume = useCallback((data: ResumeData) => {
    setResumeData(data);
    setIsDirty(false);
  }, []);

  const validation = validateResumeData(resumeData);

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
    resetResume,
    loadResume,
    validation,
  };
}
