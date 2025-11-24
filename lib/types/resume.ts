// Resume data types

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string[];
  achievements?: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  description?: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  startDate?: string;
  endDate?: string;
}

export interface Language {
  id: string;
  name: string;
  level: "basic" | "conversational" | "fluent" | "native";
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects?: Project[];
  languages?: Language[];
  certifications?: Certification[];
  courses?: Course[];
  hobbies?: Hobby[];
  extraCurricular?: ExtraCurricular[];
  customSections?: CustomSection[];
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface CustomSectionItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  location?: string;
}

export interface Course {
  id: string;
  name: string;
  institution?: string;
  date?: string;
  credentialId?: string;
  url?: string;
}

export interface Hobby {
  id: string;
  name: string;
  description?: string;
}

export interface ExtraCurricular {
  id: string;
  title: string;
  organization?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string[];
}

export type TemplateId =
  | "modern"
  | "classic"
  | "minimalist"
  | "executive"
  | "creative"
  | "technical"
  | "adaptive"
  | "timeline"
  | "ivy";

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  preview: string;
  category: "professional" | "creative" | "technical" | "executive";
}

