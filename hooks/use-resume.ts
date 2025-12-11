"use client";

import { useReducer, useMemo, useCallback } from "react";
import { ResumeData } from "@/lib/types/resume";
import { generateId } from "@/lib/utils";
import { validateResume } from "@/lib/validation/resume-validation";
import { migrateResumeData } from "@/lib/utils/resume-migration";

type PersonalInfo = ResumeData["personalInfo"];
type WorkExperience = ResumeData["workExperience"][0];
type Education = ResumeData["education"][0];
type Skill = ResumeData["skills"][0];
type Language = NonNullable<ResumeData["languages"]>[0];
type Course = NonNullable<ResumeData["courses"]>[0];
type Hobby = NonNullable<ResumeData["hobbies"]>[0];
type ExtraCurricular = NonNullable<ResumeData["extraCurricular"]>[0];
type Project = NonNullable<ResumeData["projects"]>[0];
type Certification = NonNullable<ResumeData["certifications"]>[0];
type CustomSection = NonNullable<ResumeData["customSections"]>[0];
type CustomSectionItem = CustomSection["items"][0];

const createEmptyResume = (): ResumeData => ({
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
  languages: [],
  courses: [],
  hobbies: [],
  extraCurricular: [],
  projects: [],
  certifications: [],
  customSections: [],
});

interface ResumeHistoryState {
  past: ResumeData[];
  present: ResumeData;
  future: ResumeData[];
  isDirty: boolean;
}

type ResumeAction =
  | { type: "UPDATE_PERSONAL_INFO"; payload: Partial<PersonalInfo> }
  | { type: "ADD_WORK_EXPERIENCE" }
  | { type: "UPDATE_WORK_EXPERIENCE"; payload: { id: string; updates: Partial<WorkExperience> } }
  | { type: "REMOVE_WORK_EXPERIENCE"; payload: { id: string } }
  | { type: "REORDER_WORK_EXPERIENCE"; payload: { startIndex: number; endIndex: number } }
  | { type: "SET_WORK_EXPERIENCE"; payload: WorkExperience[] }
  | { type: "ADD_EDUCATION" }
  | { type: "UPDATE_EDUCATION"; payload: { id: string; updates: Partial<Education> } }
  | { type: "REMOVE_EDUCATION"; payload: { id: string } }
  | { type: "REORDER_EDUCATION"; payload: { startIndex: number; endIndex: number } }
  | { type: "SET_EDUCATION"; payload: Education[] }
  | { type: "ADD_SKILL"; payload: Omit<Skill, "id"> }
  | { type: "UPDATE_SKILL"; payload: { id: string; updates: Partial<Skill> } }
  | { type: "REMOVE_SKILL"; payload: { id: string } }
  | { type: "ADD_LANGUAGE" }
  | { type: "UPDATE_LANGUAGE"; payload: { id: string; updates: Partial<Language> } }
  | { type: "REMOVE_LANGUAGE"; payload: { id: string } }
  | { type: "ADD_COURSE" }
  | { type: "UPDATE_COURSE"; payload: { id: string; updates: Partial<Course> } }
  | { type: "REMOVE_COURSE"; payload: { id: string } }
  | { type: "ADD_HOBBY" }
  | { type: "UPDATE_HOBBY"; payload: { id: string; updates: Partial<Hobby> } }
  | { type: "REMOVE_HOBBY"; payload: { id: string } }
  | { type: "ADD_EXTRA" }
  | {
      type: "UPDATE_EXTRA";
      payload: { id: string; updates: Partial<ExtraCurricular> };
    }
  | { type: "REMOVE_EXTRA"; payload: { id: string } }
  | { type: "REORDER_EXTRA"; payload: { startIndex: number; endIndex: number } }
  | { type: "SET_EXTRA"; payload: ExtraCurricular[] }
  | { type: "ADD_PROJECT" }
  | { type: "UPDATE_PROJECT"; payload: { id: string; updates: Partial<Project> } }
  | { type: "REMOVE_PROJECT"; payload: { id: string } }
  | { type: "REORDER_PROJECTS"; payload: { startIndex: number; endIndex: number } }
  | { type: "ADD_CERTIFICATION" }
  | { type: "ADD_COURSE_AS_CERTIFICATION" } // Adds a course to certifications with type='course'
  | {
      type: "UPDATE_CERTIFICATION";
      payload: { id: string; updates: Partial<Certification> };
    }
  | { type: "REMOVE_CERTIFICATION"; payload: { id: string } }
  | { type: "ADD_CUSTOM_SECTION" }
  | {
      type: "UPDATE_CUSTOM_SECTION";
      payload: { id: string; updates: Partial<CustomSection> };
    }
  | { type: "REMOVE_CUSTOM_SECTION"; payload: { id: string } }
  | { type: "ADD_CUSTOM_ITEM"; payload: { sectionId: string } }
  | {
      type: "UPDATE_CUSTOM_ITEM";
      payload: {
        sectionId: string;
        itemId: string;
        updates: Partial<CustomSectionItem>;
      };
    }
  | { type: "REMOVE_CUSTOM_ITEM"; payload: { sectionId: string; itemId: string } }
  | { type: "RESET_RESUME" }
  | { type: "LOAD_RESUME"; payload: ResumeData }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "BATCH_UPDATE"; payload: BatchUpdatePayload };

/**
 * Payload for batch updating multiple parts of the resume at once.
 * Used by "Enhance All" feature to apply AI improvements in one action.
 */
export interface BatchUpdatePayload {
  /** Updated summary text */
  summary?: string;
  /** Updated work experience bullets, keyed by experience ID */
  bullets?: Record<string, string[]>;
}

function applyUpdate(
  state: ResumeHistoryState,
  updater: (data: ResumeData) => ResumeData
): ResumeHistoryState {
  const next = updater(state.present);
  if (next === state.present) {
    return state;
  }

  return {
    past: [...state.past, state.present],
    present: next,
    future: [],
    isDirty: true,
  };
}

function updateCollectionItem<T extends { id: string }>(
  items: T[],
  id: string,
  updates: Partial<T>
): { next: T[]; changed: boolean } {
  let changed = false;
  const next = items.map((item) => {
    if (item.id !== id) {
      return item;
    }
    changed = true;
    return { ...item, ...updates };
  });

  return { next, changed };
}

function resumeReducer(state: ResumeHistoryState, action: ResumeAction): ResumeHistoryState {
  switch (action.type) {
    case "UPDATE_PERSONAL_INFO":
      return applyUpdate(state, (current) => ({
        ...current,
        personalInfo: { ...current.personalInfo, ...action.payload },
      }));

    case "ADD_WORK_EXPERIENCE":
      return applyUpdate(state, (current) => ({
        ...current,
        workExperience: [
          ...current.workExperience,
          {
            id: generateId(),
            company: "",
            position: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            description: [""],
            achievements: [],
          },
        ],
      }));

    case "UPDATE_WORK_EXPERIENCE":
      return applyUpdate(state, (current) => {
        const { next, changed } = updateCollectionItem(
          current.workExperience,
          action.payload.id,
          action.payload.updates
        );
        if (!changed) {
          return current;
        }
        return { ...current, workExperience: next };
      });

    case "REMOVE_WORK_EXPERIENCE":
      return applyUpdate(state, (current) => {
        const next = current.workExperience.filter((exp) => exp.id !== action.payload.id);
        if (next.length === current.workExperience.length) {
          return current;
        }
        return { ...current, workExperience: next };
      });

    case "REORDER_WORK_EXPERIENCE":
      return applyUpdate(state, (current) => {
        const { startIndex, endIndex } = action.payload;
        if (
          startIndex === endIndex ||
          startIndex < 0 ||
          endIndex < 0 ||
          startIndex >= current.workExperience.length ||
          endIndex >= current.workExperience.length
        ) {
          return current;
        }
        const next = [...current.workExperience];
        const [removed] = next.splice(startIndex, 1);
        next.splice(endIndex, 0, removed);
        return { ...current, workExperience: next };
      });

    case "SET_WORK_EXPERIENCE":
      return applyUpdate(state, (current) => ({
        ...current,
        workExperience: action.payload,
      }));

    case "ADD_EDUCATION":
      return applyUpdate(state, (current) => ({
        ...current,
        education: [
          ...current.education,
          {
            id: generateId(),
            institution: "",
            degree: "",
            field: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            description: [],
          },
        ],
      }));

    case "UPDATE_EDUCATION":
      return applyUpdate(state, (current) => {
        const { next, changed } = updateCollectionItem(
          current.education,
          action.payload.id,
          action.payload.updates
        );
        if (!changed) {
          return current;
        }
        return { ...current, education: next };
      });

    case "REMOVE_EDUCATION":
      return applyUpdate(state, (current) => {
        const next = current.education.filter((edu) => edu.id !== action.payload.id);
        if (next.length === current.education.length) {
          return current;
        }
        return { ...current, education: next };
      });

    case "REORDER_EDUCATION":
      return applyUpdate(state, (current) => {
        const { startIndex, endIndex } = action.payload;
        if (
          startIndex === endIndex ||
          startIndex < 0 ||
          endIndex < 0 ||
          startIndex >= current.education.length ||
          endIndex >= current.education.length
        ) {
          return current;
        }
        const next = [...current.education];
        const [removed] = next.splice(startIndex, 1);
        next.splice(endIndex, 0, removed);
        return { ...current, education: next };
      });

    case "SET_EDUCATION":
      return applyUpdate(state, (current) => ({
        ...current,
        education: action.payload,
      }));

    case "ADD_SKILL":
      return applyUpdate(state, (current) => ({
        ...current,
        skills: [...current.skills, { id: generateId(), ...action.payload }],
      }));

    case "UPDATE_SKILL":
      return applyUpdate(state, (current) => {
        const { next, changed } = updateCollectionItem(
          current.skills,
          action.payload.id,
          action.payload.updates
        );
        if (!changed) {
          return current;
        }
        return { ...current, skills: next };
      });

    case "REMOVE_SKILL":
      return applyUpdate(state, (current) => {
        const next = current.skills.filter((skill) => skill.id !== action.payload.id);
        if (next.length === current.skills.length) {
          return current;
        }
        return { ...current, skills: next };
      });

    case "ADD_LANGUAGE":
      return applyUpdate(state, (current) => {
        const languages = current.languages ?? [];
        return {
          ...current,
          languages: [
            ...languages,
            { id: generateId(), name: "", level: "conversational" },
          ],
        };
      });

    case "UPDATE_LANGUAGE":
      return applyUpdate(state, (current) => {
        const languages = current.languages ?? [];
        const { next, changed } = updateCollectionItem(
          languages,
          action.payload.id,
          action.payload.updates
        );
        if (!changed) {
          return current;
        }
        return { ...current, languages: next };
      });

    case "REMOVE_LANGUAGE":
      return applyUpdate(state, (current) => {
        const languages = current.languages ?? [];
        const next = languages.filter((lang) => lang.id !== action.payload.id);
        if (next.length === languages.length) {
          return current;
        }
        return { ...current, languages: next };
      });

    case "ADD_COURSE":
      return applyUpdate(state, (current) => {
        const courses = current.courses ?? [];
        return {
          ...current,
          courses: [
            ...courses,
            {
              id: generateId(),
              name: "",
              institution: "",
              date: "",
              credentialId: "",
              url: "",
            },
          ],
        };
      });

    case "UPDATE_COURSE":
      return applyUpdate(state, (current) => {
        const courses = current.courses ?? [];
        const { next, changed } = updateCollectionItem(
          courses,
          action.payload.id,
          action.payload.updates
        );
        if (!changed) {
          return current;
        }
        return { ...current, courses: next };
      });

    case "REMOVE_COURSE":
      return applyUpdate(state, (current) => {
        const courses = current.courses ?? [];
        const next = courses.filter((course) => course.id !== action.payload.id);
        if (next.length === courses.length) {
          return current;
        }
        return { ...current, courses: next };
      });

    case "ADD_HOBBY":
      return applyUpdate(state, (current) => {
        const hobbies = current.hobbies ?? [];
        return {
          ...current,
          hobbies: [
            ...hobbies,
            { id: generateId(), name: "", description: "" },
          ],
        };
      });

    case "UPDATE_HOBBY":
      return applyUpdate(state, (current) => {
        const hobbies = current.hobbies ?? [];
        const { next, changed } = updateCollectionItem(
          hobbies,
          action.payload.id,
          action.payload.updates
        );
        if (!changed) {
          return current;
        }
        return { ...current, hobbies: next };
      });

    case "REMOVE_HOBBY":
      return applyUpdate(state, (current) => {
        const hobbies = current.hobbies ?? [];
        const next = hobbies.filter((hobby) => hobby.id !== action.payload.id);
        if (next.length === hobbies.length) {
          return current;
        }
        return { ...current, hobbies: next };
      });

    case "ADD_EXTRA":
      return applyUpdate(state, (current) => {
        const extra = current.extraCurricular ?? [];
        return {
          ...current,
          extraCurricular: [
            ...extra,
            {
              id: generateId(),
              title: "",
              organization: "",
              role: "",
              startDate: "",
              endDate: "",
              current: false,
              description: [],
            },
          ],
        };
      });

    case "UPDATE_EXTRA":
      return applyUpdate(state, (current) => {
        const extra = current.extraCurricular ?? [];
        const { next, changed } = updateCollectionItem(
          extra,
          action.payload.id,
          action.payload.updates
        );
        if (!changed) {
          return current;
        }
        return { ...current, extraCurricular: next };
      });

    case "REMOVE_EXTRA":
      return applyUpdate(state, (current) => {
        const extra = current.extraCurricular ?? [];
        const next = extra.filter((item) => item.id !== action.payload.id);
        if (next.length === extra.length) {
          return current;
        }
        return { ...current, extraCurricular: next };
      });

    case "REORDER_EXTRA":
      return applyUpdate(state, (current) => {
        const extra = current.extraCurricular ?? [];
        const { startIndex, endIndex } = action.payload;
        if (
          startIndex === endIndex ||
          startIndex < 0 ||
          endIndex < 0 ||
          startIndex >= extra.length ||
          endIndex >= extra.length
        ) {
          return current;
        }
        const next = [...extra];
        const [removed] = next.splice(startIndex, 1);
        next.splice(endIndex, 0, removed);
        return { ...current, extraCurricular: next };
      });

    case "SET_EXTRA":
      return applyUpdate(state, (current) => ({
        ...current,
        extraCurricular: action.payload,
      }));

    case "RESET_RESUME":
      return {
        past: [],
        present: createEmptyResume(),
        future: [],
        isDirty: false,
      };

    case "LOAD_RESUME": {
      // Apply migrations to handle legacy data (e.g., migrate courses to certifications)
      const migratedData = migrateResumeData(action.payload);
      const wasMigrated = migratedData !== action.payload;
      return {
        past: [],
        present: migratedData,
        future: [],
        isDirty: wasMigrated, // Mark dirty if migration was applied so it gets saved
      };
    }

    case "ADD_PROJECT":
      return applyUpdate(state, (current) => ({
        ...current,
        projects: [
          ...(current.projects ?? []),
          {
            id: generateId(),
            name: "",
            description: "",
            technologies: [],
            url: "",
            github: "",
            startDate: "",
            endDate: "",
          },
        ],
      }));

    case "UPDATE_PROJECT":
      return applyUpdate(state, (current) => {
        const projects = current.projects ?? [];
        const { next, changed } = updateCollectionItem(
          projects,
          action.payload.id,
          action.payload.updates
        );
        if (!changed) {
          return current;
        }
        return { ...current, projects: next };
      });

    case "REMOVE_PROJECT":
      return applyUpdate(state, (current) => {
        const projects = current.projects ?? [];
        const next = projects.filter((project) => project.id !== action.payload.id);
        if (next.length === projects.length) {
          return current;
        }
        return { ...current, projects: next };
      });

    case "REORDER_PROJECTS":
      return applyUpdate(state, (current) => {
        const projects = current.projects ?? [];
        const { startIndex, endIndex } = action.payload;
        if (
          startIndex === endIndex ||
          startIndex < 0 ||
          endIndex < 0 ||
          startIndex >= projects.length ||
          endIndex >= projects.length
        ) {
          return current;
        }
        const next = [...projects];
        const [removed] = next.splice(startIndex, 1);
        next.splice(endIndex, 0, removed);
        return { ...current, projects: next };
      });

    case "ADD_CERTIFICATION":
      return applyUpdate(state, (current) => ({
        ...current,
        certifications: [
          ...(current.certifications ?? []),
          {
            id: generateId(),
            name: "",
            issuer: "",
            date: "",
            expiryDate: "",
            credentialId: "",
            url: "",
            type: "certification",
          },
        ],
      }));

    case "ADD_COURSE_AS_CERTIFICATION":
      return applyUpdate(state, (current) => ({
        ...current,
        certifications: [
          ...(current.certifications ?? []),
          {
            id: generateId(),
            name: "",
            issuer: "",
            date: "",
            credentialId: "",
            url: "",
            type: "course",
          },
        ],
      }));

    case "UPDATE_CERTIFICATION":
      return applyUpdate(state, (current) => {
        const certifications = current.certifications ?? [];
        const { next, changed } = updateCollectionItem(
          certifications,
          action.payload.id,
          action.payload.updates
        );
        if (!changed) {
          return current;
        }
        return { ...current, certifications: next };
      });

    case "REMOVE_CERTIFICATION":
      return applyUpdate(state, (current) => {
        const certifications = current.certifications ?? [];
        const next = certifications.filter(
          (cert) => cert.id !== action.payload.id
        );
        if (next.length === certifications.length) {
          return current;
        }
        return { ...current, certifications: next };
      });

    case "ADD_CUSTOM_SECTION":
      return applyUpdate(state, (current) => ({
        ...current,
        customSections: [
          ...(current.customSections ?? []),
          {
            id: generateId(),
            title: "",
            items: [],
          },
        ],
      }));

    case "UPDATE_CUSTOM_SECTION":
      return applyUpdate(state, (current) => {
        const sections = current.customSections ?? [];
        const { next, changed } = updateCollectionItem(
          sections,
          action.payload.id,
          action.payload.updates
        );
        if (!changed) return current;
        return { ...current, customSections: next };
      });

    case "REMOVE_CUSTOM_SECTION":
      return applyUpdate(state, (current) => {
        const sections = current.customSections ?? [];
        const next = sections.filter((section) => section.id !== action.payload.id);
        if (next.length === sections.length) return current;
        return { ...current, customSections: next };
      });

    case "ADD_CUSTOM_ITEM":
      return applyUpdate(state, (current) => {
        const sections = current.customSections ?? [];
        const next = sections.map((section) => {
          if (section.id !== action.payload.sectionId) return section;
          return {
            ...section,
            items: [
              ...(section.items || []),
              {
                id: generateId(),
                title: "",
                description: "",
                date: "",
                location: "",
              },
            ],
          };
        });
        return { ...current, customSections: next };
      });

    case "UPDATE_CUSTOM_ITEM":
      return applyUpdate(state, (current) => {
        const sections = current.customSections ?? [];
        const next = sections.map((section) => {
          if (section.id !== action.payload.sectionId) return section;
          const { next: items, changed } = updateCollectionItem(
            section.items || [],
            action.payload.itemId,
            action.payload.updates
          );
          if (!changed) return section;
          return { ...section, items };
        });
        return { ...current, customSections: next };
      });

    case "REMOVE_CUSTOM_ITEM":
      return applyUpdate(state, (current) => {
        const sections = current.customSections ?? [];
        const next = sections.map((section) => {
          if (section.id !== action.payload.sectionId) return section;
          const filtered = (section.items || []).filter(
            (item) => item.id !== action.payload.itemId
          );
          if (filtered.length === (section.items || []).length) return section;
          return { ...section, items: filtered };
        });
        return { ...current, customSections: next };
      });

    case "UNDO":
      if (state.past.length === 0) {
        return state;
      }
      return {
        past: state.past.slice(0, -1),
        present: state.past[state.past.length - 1],
        future: [state.present, ...state.future],
        isDirty: true,
      };

    case "REDO":
      if (state.future.length === 0) {
        return state;
      }
      return {
        past: [...state.past, state.present],
        present: state.future[0],
        future: state.future.slice(1),
        isDirty: true,
      };

    case "BATCH_UPDATE":
      return applyUpdate(state, (current) => {
        let next = current;
        const { summary, bullets } = action.payload;

        // Update summary if provided
        if (summary !== undefined) {
          next = {
            ...next,
            personalInfo: { ...next.personalInfo, summary },
          };
        }

        // Update work experience bullets if provided
        if (bullets && Object.keys(bullets).length > 0) {
          next = {
            ...next,
            workExperience: next.workExperience.map((exp) => {
              const newBullets = bullets[exp.id];
              if (!newBullets) return exp;
              return { ...exp, description: newBullets };
            }),
          };
        }

        return next;
      });

    default:
      return state;
  }
}

export function useResume() {
  const [state, dispatch] = useReducer(resumeReducer, undefined, () => ({
    past: [],
    present: createEmptyResume(),
    future: [],
    isDirty: false,
  }));

  const resumeData = state.present;
  const validation = useMemo(() => validateResume(resumeData), [resumeData]);
  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const updatePersonalInfo = useCallback(
    (info: Partial<PersonalInfo>) =>
      dispatch({ type: "UPDATE_PERSONAL_INFO", payload: info }),
    []
  );

  const addWorkExperience = useCallback(
    () => dispatch({ type: "ADD_WORK_EXPERIENCE" }),
    []
  );

  const updateWorkExperience = useCallback(
    (id: string, updates: Partial<WorkExperience>) =>
      dispatch({ type: "UPDATE_WORK_EXPERIENCE", payload: { id, updates } }),
    []
  );

  const removeWorkExperience = useCallback(
    (id: string) => dispatch({ type: "REMOVE_WORK_EXPERIENCE", payload: { id } }),
    []
  );

  const reorderWorkExperience = useCallback(
    (startIndex: number, endIndex: number) =>
      dispatch({ type: "REORDER_WORK_EXPERIENCE", payload: { startIndex, endIndex } }),
    []
  );

  const setWorkExperience = useCallback(
    (items: WorkExperience[]) =>
      dispatch({ type: "SET_WORK_EXPERIENCE", payload: items }),
    []
  );

  const addEducation = useCallback(
    () => dispatch({ type: "ADD_EDUCATION" }),
    []
  );

  const updateEducation = useCallback(
    (id: string, updates: Partial<Education>) =>
      dispatch({ type: "UPDATE_EDUCATION", payload: { id, updates } }),
    []
  );

  const removeEducation = useCallback(
    (id: string) => dispatch({ type: "REMOVE_EDUCATION", payload: { id } }),
    []
  );

  const reorderEducation = useCallback(
    (startIndex: number, endIndex: number) =>
      dispatch({ type: "REORDER_EDUCATION", payload: { startIndex, endIndex } }),
    []
  );

  const setEducation = useCallback(
    (items: Education[]) => dispatch({ type: "SET_EDUCATION", payload: items }),
    []
  );

  const addSkill = useCallback(
    (skill: Omit<Skill, "id">) => dispatch({ type: "ADD_SKILL", payload: skill }),
    []
  );

  const updateSkill = useCallback(
    (id: string, updates: Partial<Skill>) =>
      dispatch({ type: "UPDATE_SKILL", payload: { id, updates } }),
    []
  );

  const removeSkill = useCallback(
    (id: string) => dispatch({ type: "REMOVE_SKILL", payload: { id } }),
    []
  );

  const addLanguage = useCallback(
    () => dispatch({ type: "ADD_LANGUAGE" }),
    []
  );

  const updateLanguage = useCallback(
    (id: string, updates: Partial<Language>) =>
      dispatch({ type: "UPDATE_LANGUAGE", payload: { id, updates } }),
    []
  );

  const removeLanguage = useCallback(
    (id: string) => dispatch({ type: "REMOVE_LANGUAGE", payload: { id } }),
    []
  );

  const addCourse = useCallback(
    () => dispatch({ type: "ADD_COURSE" }),
    []
  );

  const updateCourse = useCallback(
    (id: string, updates: Partial<Course>) =>
      dispatch({ type: "UPDATE_COURSE", payload: { id, updates } }),
    []
  );

  const removeCourse = useCallback(
    (id: string) => dispatch({ type: "REMOVE_COURSE", payload: { id } }),
    []
  );

  const addHobby = useCallback(
    () => dispatch({ type: "ADD_HOBBY" }),
    []
  );

  const updateHobby = useCallback(
    (id: string, updates: Partial<Hobby>) =>
      dispatch({ type: "UPDATE_HOBBY", payload: { id, updates } }),
    []
  );

  const removeHobby = useCallback(
    (id: string) => dispatch({ type: "REMOVE_HOBBY", payload: { id } }),
    []
  );

  const addExtraCurricular = useCallback(
    () => dispatch({ type: "ADD_EXTRA" }),
    []
  );

  const updateExtraCurricular = useCallback(
    (id: string, updates: Partial<ExtraCurricular>) =>
      dispatch({ type: "UPDATE_EXTRA", payload: { id, updates } }),
    []
  );

  const removeExtraCurricular = useCallback(
    (id: string) => dispatch({ type: "REMOVE_EXTRA", payload: { id } }),
    []
  );

  const reorderExtraCurricular = useCallback(
    (startIndex: number, endIndex: number) =>
      dispatch({ type: "REORDER_EXTRA", payload: { startIndex, endIndex } }),
    []
  );

  const setExtraCurricular = useCallback(
    (items: ExtraCurricular[]) =>
      dispatch({ type: "SET_EXTRA", payload: items }),
    []
  );

  const addProject = useCallback(() => dispatch({ type: "ADD_PROJECT" }), []);

  const updateProject = useCallback(
    (id: string, updates: Partial<Project>) =>
      dispatch({ type: "UPDATE_PROJECT", payload: { id, updates } }),
    []
  );

  const removeProject = useCallback(
    (id: string) => dispatch({ type: "REMOVE_PROJECT", payload: { id } }),
    []
  );

  const reorderProjects = useCallback(
    (startIndex: number, endIndex: number) =>
      dispatch({ type: "REORDER_PROJECTS", payload: { startIndex, endIndex } }),
    []
  );

  const addCertification = useCallback(
    () => dispatch({ type: "ADD_CERTIFICATION" }),
    []
  );

  // Add a course to the certifications array with type='course'
  const addCourseAsCertification = useCallback(
    () => dispatch({ type: "ADD_COURSE_AS_CERTIFICATION" }),
    []
  );

  const updateCertification = useCallback(
    (id: string, updates: Partial<Certification>) =>
      dispatch({ type: "UPDATE_CERTIFICATION", payload: { id, updates } }),
    []
  );

  const removeCertification = useCallback(
    (id: string) =>
      dispatch({ type: "REMOVE_CERTIFICATION", payload: { id } }),
    []
  );

  const addCustomSection = useCallback(
    () => dispatch({ type: "ADD_CUSTOM_SECTION" }),
    []
  );

  const updateCustomSection = useCallback(
    (id: string, updates: Partial<CustomSection>) =>
      dispatch({ type: "UPDATE_CUSTOM_SECTION", payload: { id, updates } }),
    []
  );

  const removeCustomSection = useCallback(
    (id: string) =>
      dispatch({ type: "REMOVE_CUSTOM_SECTION", payload: { id } }),
    []
  );

  const addCustomSectionItem = useCallback(
    (sectionId: string) =>
      dispatch({ type: "ADD_CUSTOM_ITEM", payload: { sectionId } }),
    []
  );

  const updateCustomSectionItem = useCallback(
    (sectionId: string, itemId: string, updates: Partial<CustomSectionItem>) =>
      dispatch({
        type: "UPDATE_CUSTOM_ITEM",
        payload: { sectionId, itemId, updates },
      }),
    []
  );

  const removeCustomSectionItem = useCallback(
    (sectionId: string, itemId: string) =>
      dispatch({
        type: "REMOVE_CUSTOM_ITEM",
        payload: { sectionId, itemId },
      }),
    []
  );

  const resetResume = useCallback(
    () => dispatch({ type: "RESET_RESUME" }),
    []
  );

  const loadResume = useCallback(
    (data: ResumeData) => dispatch({ type: "LOAD_RESUME", payload: data }),
    []
  );

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  const batchUpdate = useCallback(
    (payload: BatchUpdatePayload) =>
      dispatch({ type: "BATCH_UPDATE", payload }),
    []
  );

  return {
    resumeData,
    isDirty: state.isDirty,
    validation,
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
    addProject,
    updateProject,
    removeProject,
    reorderProjects,
    addCertification,
    addCourseAsCertification,
    updateCertification,
    removeCertification,
    addCustomSection,
    updateCustomSection,
    removeCustomSection,
    addCustomSectionItem,
    updateCustomSectionItem,
    removeCustomSectionItem,
    resetResume,
    loadResume,
    setWorkExperience,
    setEducation,
    setExtraCurricular,
    undo,
    redo,
    canUndo,
    canRedo,
    batchUpdate,
  };
}
