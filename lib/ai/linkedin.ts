import { ResumeData } from "@/lib/types/resume";
import { LinkedInProfile } from "./content-types";
import { flashModel, safety, serializeResume } from "./shared";

export async function optimizeLinkedInProfile(
  resumeData: ResumeData
): Promise<LinkedInProfile> {
  const model = flashModel();
  const resumeText = serializeResume(resumeData);

  const prompt = `You are an expert LinkedIn profile optimizer specializing in converting resume content into engaging, LinkedIn-optimized profiles that attract recruiters and build professional networks.

TASK: Convert this resume into LinkedIn-optimized content with appropriate tone and formatting for the platform.

RESUME CONTENT:
${resumeText}

LINKEDIN OPTIMIZATION GUIDELINES:

1. HEADLINE (Maximum 120 characters):
   - Compelling, keyword-rich professional headline
   - Include current role/title and key value proposition
   - Use industry-relevant keywords for discoverability
   - Make it engaging and professional
   - Format: "Role Title | Key Expertise | Value Proposition" or similar

2. ABOUT SECTION (2-3 paragraphs):
   - First person, conversational but professional tone
   - First paragraph: Current role, expertise, and what you do
   - Second paragraph: Key achievements, experience, and value you bring
   - Optional third paragraph: Career goals, interests, or call-to-action
   - Include relevant keywords naturally
   - More personal and engaging than resume summary
   - Show personality while maintaining professionalism
   - Total length: 200-300 words ideal

3. EXPERIENCE BULLETS (More conversational than resume):
   - Convert resume bullets to LinkedIn-style descriptions
   - Slightly more conversational tone
   - Can include more context and storytelling
   - Still highlight achievements and impact
   - Use first person when appropriate
   - Maintain professional standards
   - Include quantifiable results

4. TOP SKILLS (5-10 skills):
   - Most relevant and in-demand skills for the role/industry
   - Mix of technical and soft skills (if applicable)
   - Skills that recruiters commonly search for
   - Industry-standard terminology

REQUIRED OUTPUT FORMAT:
HEADLINE:
[Compelling headline, max 120 characters, keyword-rich]

ABOUT:
[First paragraph: Current role, expertise, what you do - engaging and personal]
[Second paragraph: Key achievements, experience, value proposition]
[Optional third paragraph: Goals, interests, or call-to-action]

EXPERIENCE BULLETS:
Experience 1:
- [LinkedIn-optimized bullet point 1 - more conversational]
- [LinkedIn-optimized bullet point 2]
- [Continue for all relevant experiences...]

Experience 2:
- [LinkedIn-optimized bullets for second experience...]

[Continue for all work experiences...]

TOP SKILLS:
[Skill 1], [Skill 2], [Skill 3], [Skill 4], [Skill 5], [Skill 6], [Skill 7], [Skill 8], [Skill 9], [Skill 10]

IMPORTANT:
- LinkedIn tone is more conversational and personal than resume
- Still maintain professionalism
- Include keywords for discoverability
- Make it engaging and authentic
- Focus on achievements and impact

Generate the LinkedIn-optimized content now:`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = result.response.text();
  console.log(
    "[AI] optimizeLinkedInProfile raw response:",
    text.substring(0, 800)
  );

  const headlineMatch = text.match(/HEADLINE:\s*([^\n]+)/i);
  const aboutMatch = text.match(
    /ABOUT:([\s\S]*?)(?:EXPERIENCE BULLETS:|TOP SKILLS:|$)/i
  );
  const bulletsSection = text.match(
    /EXPERIENCE BULLETS:([\s\S]*?)(?:TOP SKILLS:|$)/i
  );
  const skillsMatch = text.match(/TOP SKILLS:\s*([^\n]+)/i);

  const experienceBullets: Record<string, string[]> = {};
  if (bulletsSection) {
    bulletsSection[1]
      .split(/Experience \d+:/i)
      .filter((b) => b.trim())
      .forEach((block, idx) => {
        const bullets = block
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.startsWith("-"))
          .map((l) => l.replace(/^-\s*/, "").trim())
          .filter((l) => l.length > 0);
        if (bullets.length) experienceBullets[`exp-${idx + 1}`] = bullets;
      });
  }

  const topSkills =
    skillsMatch?.[1]
      ?.split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 10) || [];

  return {
    headline: headlineMatch?.[1]?.trim() || "",
    about: aboutMatch?.[1]?.trim() || "",
    experienceBullets,
    topSkills,
  };
}
