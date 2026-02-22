import type { ResumeData, Skill } from "@/lib/types/resume";
import type { TemplateId } from "@/lib/constants/templates";

const FLAT_SKILL_TEMPLATES = new Set<TemplateId>([
  "ats-clarity",
  "ats-structured",
  "ats-compact",
  "bold",
  "student",
  "ivy",
]);

const SKILL_LEVEL_LABELS: Record<NonNullable<Skill["level"]>, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

function formatSkillLabel(
  skill: Skill,
  opts: { includeCategory: boolean; includeLevel: boolean }
): string {
  const baseName = (skill.name || "").trim();
  if (!baseName) return skill.name;

  const meta: string[] = [];

  if (opts.includeCategory && skill.category?.trim()) {
    meta.push(skill.category.trim());
  }

  if (opts.includeLevel && skill.level) {
    meta.push(SKILL_LEVEL_LABELS[skill.level] ?? skill.level);
  }

  if (meta.length === 0) return baseName;
  return `${baseName} (${meta.join(" • ")})`;
}

export function prepareResumeDataForTemplateDisplay(
  data: ResumeData,
  templateId: TemplateId
): ResumeData {
  const skills = data.skills || [];
  if (skills.length === 0) return data;

  const includeCategoryInLabel = FLAT_SKILL_TEMPLATES.has(templateId);

  return {
    ...data,
    skills: skills.map((skill) => ({
      ...skill,
      name: formatSkillLabel(skill, {
        includeCategory: includeCategoryInLabel,
        includeLevel: true,
      }),
    })),
  };
}
