import { SuggestedSkill } from "./content-types";
import { extractJson, flashModel, safety } from "./shared";

export async function suggestSkills(
  jobTitle: string,
  jobDescription?: string
): Promise<SuggestedSkill[]> {
  const model = flashModel();
  const prompt = `You are an expert career advisor specializing in identifying relevant skills for specific job roles based on industry standards and job requirements.

TASK: Suggest 8-10 highly relevant skills for the job title, prioritizing skills that are most important for success in this role.

JOB TITLE:
"${jobTitle}"
${jobDescription ? `\n\nJOB DESCRIPTION:\n${jobDescription}` : ""}

SKILL SUGGESTION GUIDELINES:
1. Prioritize skills mentioned in the job description (if provided)
2. Include industry-standard skills for this role
3. Mix of technical/hard skills and soft skills (if appropriate for role)
4. Consider both required and nice-to-have skills
5. Include current, in-demand skills for this field
6. Categorize appropriately (Technical, Soft Skills, Tools, Methodologies, etc.)

RELEVANCE LEVELS:
- "high": Critical/must-have skills for this role
- "medium": Important but not essential skills

CATEGORIES (examples):
- Technical Skills, Programming Languages, Frameworks, Tools, Software
- Soft Skills, Leadership, Communication, Project Management
- Methodologies, Certifications, Industry Knowledge
- Domain-Specific, Specialized Knowledge

REQUIRED JSON OUTPUT FORMAT:
[
  {
    "name": "[Skill name]",
    "category": "[Appropriate category]",
    "relevance": "high|medium",
    "reason": "[1-2 sentence explanation of why this skill is relevant for this job title]"
  }
]

IMPORTANT:
- Return exactly 8-10 skills
- Prioritize "high" relevance skills
- Provide clear, specific reasons for each skill
- Use appropriate categories
- Return ONLY valid JSON array, no markdown, no explanations outside JSON

Generate the skill suggestions now:`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = result.response.text();
  const parsed = extractJson<SuggestedSkill[]>(text);

  if (!parsed || !Array.isArray(parsed)) {
    throw new Error("Failed to parse AI response");
  }

  return parsed
    .filter(
      (skill) =>
        Boolean(skill.name) &&
        Boolean(skill.category) &&
        (skill.relevance === "high" || skill.relevance === "medium") &&
        Boolean(skill.reason)
    )
    .slice(0, 10);
}
