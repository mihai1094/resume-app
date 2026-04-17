import type { ResumeData, Skill } from "@/lib/types/resume";
import type { TemplateId } from "@/lib/constants/templates";

const SKILL_LEVEL_LABELS: Record<NonNullable<Skill["level"]>, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

/**
 * Decorates a skill name with its level in parentheses (e.g. "Python (Expert)").
 * Level is hidden by default — the user must explicitly opt in via
 * `skill.showLevel` to have it appear on the rendered resume.
 * Category is intentionally not injected here — every template now either
 * groups skills by `skill.category` itself ("Category: skill1, skill2, …")
 * or deliberately omits categories for visual reasons.
 */
function formatSkillLabel(skill: Skill): string {
  const baseName = (skill.name || "").trim();
  if (!baseName) return skill.name;

  if (skill.level && skill.showLevel) {
    const levelLabel = SKILL_LEVEL_LABELS[skill.level] ?? skill.level;
    return `${baseName} (${levelLabel})`;
  }

  return baseName;
}

export function prepareResumeDataForTemplateDisplay(
  data: ResumeData,
  _templateId: TemplateId
): ResumeData {
  const skills = data.skills || [];

  return {
    ...data,
    skills: skills.map((skill) => ({
      ...skill,
      name: formatSkillLabel(skill),
    })),
  };
}
