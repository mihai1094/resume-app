"use client";

import { ResumeData } from "@/lib/types/resume";
import { ValidationError } from "@/lib/validation/resume-validation";
import { PersonalInfoForm } from "./forms/personal-info-form";
import { WorkExperienceForm } from "./forms/work-experience-form";
import { EducationForm } from "./forms/education-form";
import { SkillsForm } from "./forms/skills-form";
import { LanguagesForm } from "./forms/languages-form";
import { ProjectsForm } from "./forms/projects-form";
import { CertificationsForm } from "./forms/certifications-form";
import { AdditionalSectionsForm } from "./forms/additional-sections-form";
import { SectionId } from "@/lib/constants/defaults";
import {
  WorkExperience,
  Education,
  Skill,
  Project,
  Certification,
  Language,
  ExtraCurricular,
  Hobby,
  CustomSection,
  CustomSectionItem,
  PersonalInfo,
} from "@/lib/types/resume";

export interface SectionFormRendererProps {
  activeSection: SectionId;
  resumeData: ResumeData;
  validationErrors: ValidationError[];
  showErrors: boolean;
  templateSupportsPhoto: boolean;

  // Personal Info handlers
  updatePersonalInfo: (updates: Partial<PersonalInfo>) => void;

  // Work Experience handlers
  addWorkExperience: () => void;
  updateWorkExperience: (id: string, updates: Partial<WorkExperience>) => void;
  removeWorkExperience: (id: string) => void;
  setWorkExperience: (items: WorkExperience[]) => void;

  // Education handlers
  addEducation: () => void;
  updateEducation: (id: string, updates: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  setEducation: (items: Education[]) => void;

  // Skills handlers
  addSkill: (skill: Omit<Skill, "id">) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  removeSkill: (id: string) => void;

  // Projects handlers
  addProject: () => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  reorderProjects: (startIndex: number, endIndex: number) => void;

  // Certifications handlers
  addCertification: () => void;
  addCourseAsCertification: () => void;
  updateCertification: (id: string, updates: Partial<Certification>) => void;
  removeCertification: (id: string) => void;

  // Languages handlers
  addLanguage: () => void;
  updateLanguage: (id: string, updates: Partial<Language>) => void;
  removeLanguage: (id: string) => void;

  // Additional sections handlers
  addExtraCurricular: () => void;
  updateExtraCurricular: (
    id: string,
    updates: Partial<ExtraCurricular>
  ) => void;
  removeExtraCurricular: (id: string) => void;
  setExtraCurricular: (items: ExtraCurricular[]) => void;
  addHobby: () => void;
  updateHobby: (id: string, updates: Partial<Hobby>) => void;
  removeHobby: (id: string) => void;
  addCustomSection: () => void;
  updateCustomSection: (id: string, updates: Partial<CustomSection>) => void;
  removeCustomSection: (id: string) => void;
  addCustomSectionItem: (sectionId: string) => void;
  updateCustomSectionItem: (
    sectionId: string,
    itemId: string,
    updates: Partial<CustomSectionItem>
  ) => void;
  removeCustomSectionItem: (sectionId: string, itemId: string) => void;
}

/**
 * Renders the appropriate form component based on the active section.
 * This component extracts the form rendering logic from the main ResumeEditor
 * to improve maintainability and reduce the editor's complexity.
 */
export function SectionFormRenderer({
  activeSection,
  resumeData,
  validationErrors,
  showErrors,
  templateSupportsPhoto,
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
  updateSkill,
  removeSkill,
  addProject,
  updateProject,
  removeProject,
  reorderProjects,
  addCertification,
  addCourseAsCertification,
  updateCertification,
  removeCertification,
  addLanguage,
  updateLanguage,
  removeLanguage,
  addExtraCurricular,
  updateExtraCurricular,
  removeExtraCurricular,
  setExtraCurricular,
  addHobby,
  updateHobby,
  removeHobby,
  addCustomSection,
  updateCustomSection,
  removeCustomSection,
  addCustomSectionItem,
  updateCustomSectionItem,
  removeCustomSectionItem,
}: SectionFormRendererProps) {
  return (
    <div className="space-y-6">
      {activeSection === "personal" && (
        <PersonalInfoForm
          data={resumeData.personalInfo}
          onChange={updatePersonalInfo}
          validationErrors={validationErrors}
          showErrors={showErrors}
          showPhotoUpload={templateSupportsPhoto}
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
          showErrors={showErrors}
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
          showErrors={showErrors}
        />
      )}

      {activeSection === "skills" && (
        <SkillsForm
          skills={resumeData.skills}
          onAdd={addSkill}
          onRemove={removeSkill}
          onUpdate={updateSkill}
          jobTitle={resumeData.personalInfo.jobTitle}
        />
      )}

      {activeSection === "projects" && (
        <ProjectsForm
          projects={resumeData.projects || []}
          onAdd={addProject}
          onUpdate={updateProject}
          onRemove={removeProject}
          onReorder={reorderProjects}
        />
      )}

      {activeSection === "certifications" && (
        <CertificationsForm
          certifications={resumeData.certifications || []}
          onAddCertification={addCertification}
          onAddCourse={addCourseAsCertification}
          onUpdate={updateCertification}
          onRemove={removeCertification}
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

      {activeSection === "additional" && (
        <AdditionalSectionsForm
          extraCurricular={resumeData.extraCurricular || []}
          hobbies={resumeData.hobbies || []}
          customSections={resumeData.customSections || []}
          onAddExtra={addExtraCurricular}
          onUpdateExtra={updateExtraCurricular}
          onRemoveExtra={removeExtraCurricular}
          onReorderExtra={setExtraCurricular}
          onAddHobby={addHobby}
          onUpdateHobby={updateHobby}
          onRemoveHobby={removeHobby}
          onAddCustomSection={addCustomSection}
          onUpdateCustomSection={updateCustomSection}
          onRemoveCustomSection={removeCustomSection}
          onAddCustomItem={addCustomSectionItem}
          onUpdateCustomItem={updateCustomSectionItem}
          onRemoveCustomItem={removeCustomSectionItem}
          validationErrors={validationErrors}
          showErrors={showErrors}
        />
      )}
    </div>
  );
}
