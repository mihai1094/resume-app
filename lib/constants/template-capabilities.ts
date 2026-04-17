/**
 * Template capability flags.
 *
 * Each capability answers: "does this template support X?" so the editor UI can
 * enable/disable controls without each template having to publish a schema.
 */

/**
 * Templates that support rendering the Skills section above Experience.
 *
 * Scope: conservative whitelist of single-column templates where reordering
 * is visually coherent. Two-column/sidebar templates place skills in a
 * dedicated column (reordering is meaningless) and bespoke graphic templates
 * (Infographic, Creative, etc.) have fixed compositions.
 *
 * NOTE: Functional is intentionally excluded — it already ships skills-first
 * as its identity. Point users there as the "switch template" recommendation
 * when their current template is not in this list.
 */
export const TEMPLATES_SUPPORTING_SKILLS_AT_TOP: ReadonlySet<string> = new Set([
  "simple",
  "classic",
  "ivy",
  "ats-clarity",
  "ats-compact",
  "ats-structured",
  "ats-pure",
  "bold",
  "executive",
  "student",
  "notion",
  "sydney",
]);

/**
 * Templates that naturally render skills-first without needing a toggle.
 * Used for the "browse skills-first templates" link target.
 */
export const NATIVELY_SKILLS_FIRST_TEMPLATES: ReadonlySet<string> = new Set([
  "functional",
]);

export function supportsSkillsAtTop(templateId: string | undefined): boolean {
  if (!templateId) return false;
  return TEMPLATES_SUPPORTING_SKILLS_AT_TOP.has(templateId);
}

/**
 * Returns true if the template is either capability-whitelisted OR naturally
 * skills-first. Used to filter the template gallery when the user clicks
 * "Browse skills-first templates".
 */
export function isSkillsFirstCompatible(templateId: string): boolean {
  return (
    TEMPLATES_SUPPORTING_SKILLS_AT_TOP.has(templateId) ||
    NATIVELY_SKILLS_FIRST_TEMPLATES.has(templateId)
  );
}
