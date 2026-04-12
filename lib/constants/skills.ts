import { Skill } from "@/lib/types/resume";

export const SKILL_CATEGORIES = [
  "Technical Skills",
  "Programming Languages",
  "Frameworks & Libraries",
  "Tools & Technologies",
  "Databases",
  "Cloud & DevOps",
  "Design",
  "Soft Skills",
  "Management",
  "Languages",
  "Other",
];

export const SKILL_LEVELS: Array<{
  value: Skill["level"];
  label: string;
}> = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

