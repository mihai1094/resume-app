import { GenerateSummaryInput, Tone } from "./content-types";
import { flashModel, safety } from "./shared";

export async function generateSummary(
  input: GenerateSummaryInput
): Promise<string> {
  const model = flashModel();
  const toneInstructions: Record<Tone, string> = {
    professional: "formal, polished, achievement-oriented",
    creative: "engaging, memorable, dynamic",
    technical: "precise, expertise-focused, technical",
  };

  const {
    firstName,
    lastName,
    jobTitle,
    yearsOfExperience,
    keySkills,
    recentPosition,
    recentCompany,
    tone = "professional",
  } = input;

  const prompt = `You are an expert resume writer specializing in crafting compelling professional summaries that capture attention and pass ATS systems.

TASK: Write a ${toneInstructions[tone]} professional summary for a resume.

CANDIDATE PROFILE:
- Name: ${firstName} ${lastName}
- Job Title: ${jobTitle || "Professional"}
${yearsOfExperience ? `- Years of Experience: ${yearsOfExperience} years` : ""}
- Key Skills: ${keySkills.slice(0, 5).join(", ")}
${
  recentPosition
    ? `- Recent Position: ${recentPosition}${
        recentCompany ? ` at ${recentCompany}` : ""
      }`
    : ""
}

CRITICAL REQUIREMENTS:
1. Length: Exactly 2-3 sentences (40-60 words total)
2. First sentence: Lead with years of experience and core expertise
3. Second sentence: Highlight key achievements or unique value proposition
4. Optional third sentence: Mention specific skills or career focus
5. Tone: ${
    tone === "technical"
      ? "Precise, expertise-focused, emphasize technical domains and certifications"
      : tone === "creative"
      ? "Engaging, memorable, dynamic, showcase creativity and innovation"
      : "Formal, polished, achievement-oriented, professional and confident"
  }
6. Use active voice throughout
7. Naturally incorporate 2-3 key skills from the list above
8. Focus on impact and results, not just experience
9. Avoid generic phrases like "team player" or "hard worker"
10. Make it specific to this candidate's background

TONE-SPECIFIC GUIDELINES:
${
  tone === "technical"
    ? "- Emphasize technical expertise, certifications, and specialized domains\n- Use industry-specific terminology appropriately\n- Highlight technical achievements and problem-solving capabilities"
    : tone === "creative"
    ? "- Make it memorable and engaging\n- Show personality while maintaining professionalism\n- Highlight creative achievements and innovative thinking"
    : "- Maintain formal, polished language\n- Emphasize leadership, achievements, and career progression\n- Use professional terminology"
}

OUTPUT FORMAT:
Return ONLY the summary text, no labels, no explanations, just the 2-3 sentence summary.

Generate the professional summary now:`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  return result.response.text().trim();
}
