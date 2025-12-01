"use client";

import { PersonalInfoForm } from "./forms/personal-info-form";
import { WorkExperienceForm } from "./forms/work-experience-form";
import { EducationForm } from "./forms/education-form";
import { SkillsForm } from "./forms/skills-form";
import { LanguagesForm } from "./forms/languages-form";
import { CoursesForm } from "./forms/courses-form";
import { HobbiesForm } from "./forms/hobbies-form";
import { ExtraCurricularForm } from "./forms/extra-curricular-form";
import { ResumeData } from "@/lib/types/resume";
import { type SectionId } from "@/lib/constants/defaults";

interface SectionFormsProps {
    activeSection: SectionId;
    resumeData: ResumeData;
    updatePersonalInfo: (data: Partial<ResumeData["personalInfo"]>) => void;
    addWorkExperience: () => void;
    updateWorkExperience: (id: string, data: Partial<ResumeData["workExperience"][0]>) => void;
    removeWorkExperience: (id: string) => void;
    setWorkExperience: (experiences: ResumeData["workExperience"]) => void;
    addEducation: () => void;
    updateEducation: (id: string, data: Partial<ResumeData["education"][0]>) => void;
    removeEducation: (id: string) => void;
    setEducation: (education: ResumeData["education"]) => void;
    addSkill: () => void;
    removeSkill: (id: string) => void;
    addLanguage: () => void;
    updateLanguage: (id: string, data: any) => void;
    removeLanguage: (id: string) => void;
    addCourse: () => void;
    updateCourse: (id: string, data: any) => void;
    removeCourse: (id: string) => void;
    addHobby: () => void;
    updateHobby: (id: string, data: any) => void;
    removeHobby: (id: string) => void;
    addExtraCurricular: () => void;
    updateExtraCurricular: (id: string, data: any) => void;
    removeExtraCurricular: (id: string) => void;
    setExtraCurricular: (activities: any[]) => void;
    validationErrors: Array<{ field: string; message: string }>;
}

export function SectionForms({
    activeSection,
    resumeData,
    updatePersonalInfo,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
    setWorkExperience,
    addEducation,
    updateEducation,
    removeEducation,
    setEducation,
    addSkill,
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
    setExtraCurricular,
    validationErrors,
}: SectionFormsProps) {
    return (
        <div className="space-y-6">
            {activeSection === "personal" && (
                <PersonalInfoForm
                    data={resumeData.personalInfo}
                    onChange={updatePersonalInfo}
                />
            )}

            {activeSection === "experience" && (
                <WorkExperienceForm
                    experiences={resumeData.workExperience}
                    onAdd={addWorkExperience}
                    onUpdate={updateWorkExperience}
                    onRemove={removeWorkExperience}
                    onReorder={setWorkExperience}
                    validationErrors={validationErrors}
                />
            )}

            {activeSection === "education" && (
                <EducationForm
                    education={resumeData.education}
                    onAdd={addEducation}
                    onUpdate={updateEducation}
                    onRemove={removeEducation}
                    onReorder={setEducation}
                    validationErrors={validationErrors}
                />
            )}

            {activeSection === "skills" && (
                <SkillsForm
                    skills={resumeData.skills}
                    onAdd={addSkill}
                    onRemove={removeSkill}
                    onUpdate={() => { }}
                />
            )}

            {activeSection === "languages" && (
                <LanguagesForm
                    languages={resumeData.languages || []}
                    onAdd={addLanguage}
                    onUpdate={updateLanguage}
                    onRemove={removeLanguage}
                />
            )}

            {activeSection === "courses" && (
                <CoursesForm
                    courses={resumeData.courses || []}
                    onAdd={addCourse}
                    onUpdate={updateCourse}
                    onRemove={removeCourse}
                />
            )}

            {activeSection === "hobbies" && (
                <HobbiesForm
                    hobbies={resumeData.hobbies || []}
                    onAdd={addHobby}
                    onUpdate={updateHobby}
                    onRemove={removeHobby}
                />
            )}

            {activeSection === "extra" && (
                <ExtraCurricularForm
                    activities={resumeData.extraCurricular || []}
                    onAdd={addExtraCurricular}
                    onUpdate={updateExtraCurricular}
                    onRemove={removeExtraCurricular}
                    onReorder={setExtraCurricular}
                />
            )}
        </div>
    );
}
