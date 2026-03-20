export interface SectionGuidance {
  sectionId: string;
  tips: string[];
  aiActionLabel?: string;
}

export const SECTION_GUIDANCE: Record<string, SectionGuidance> = {
  experience: {
    sectionId: "experience",
    tips: [
      "Start each bullet with a strong action verb",
      "Quantify results: revenue, percentages, team sizes",
      "Focus on impact, not just responsibilities",
    ],
    aiActionLabel: "Generate bullet points with AI",
  },
  education: {
    sectionId: "education",
    tips: [
      "Include relevant coursework and academic achievements",
      "Add GPA if 3.5+ or honors/distinctions",
      "Mention relevant projects or thesis work",
    ],
  },
  skills: {
    sectionId: "skills",
    tips: [
      "List skills relevant to your target role first",
      "Include both technical and soft skills",
      "Group skills by category for better readability",
    ],
    aiActionLabel: "Suggest skills with AI",
  },
  projects: {
    sectionId: "projects",
    tips: [
      "Highlight the problem you solved and your approach",
      "Include technologies used and link to live demos",
      "Quantify the project's impact or user reach",
    ],
  },
  certifications: {
    sectionId: "certifications",
    tips: [
      "List most relevant certifications first",
      "Include the issuing organization and date",
      "Add certification IDs if applicable",
    ],
  },
  languages: {
    sectionId: "languages",
    tips: [
      "Use standard proficiency levels (Native, Fluent, Conversational, Basic)",
      "List languages relevant to the target job market",
      "Include any language certifications (TOEFL, DELF, etc.)",
    ],
  },
  hobbies: {
    sectionId: "hobbies",
    tips: [
      "Choose hobbies that showcase relevant soft skills",
      "Avoid generic interests — be specific",
      "Leadership roles in activities are worth mentioning",
    ],
  },
  extra: {
    sectionId: "extra",
    tips: [
      "Include volunteer work, community involvement, or leadership",
      "Highlight activities that demonstrate transferable skills",
      "Add dates and roles for each activity",
    ],
  },
};