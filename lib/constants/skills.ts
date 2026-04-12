import { Skill } from "@/lib/types/resume";

export const SKILL_CATEGORIES = [
  "Technical Skills",
  "Tools & Technologies",
  "Design & Creative",
  "Research & Analysis",
  "Healthcare & Science",
  "Education & Training",
  "Legal & Compliance",
  "Finance & Accounting",
  "Communication & Media",
  "Management & Leadership",
  "Soft Skills",
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
