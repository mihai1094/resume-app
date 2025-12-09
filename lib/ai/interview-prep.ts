import { ResumeData } from "@/lib/types/resume";
import { InterviewQuestion } from "./content-types";
import { flashModel, safety, serializeResume } from "./shared";

export async function generateInterviewPrep(
  resumeData: ResumeData,
  jobDescription: string
): Promise<InterviewQuestion[]> {
  const model = flashModel();
  const resumeText = serializeResume(resumeData);

  const prompt = `You are an expert interview coach specializing in preparing candidates for job interviews by creating realistic, role-specific questions and comprehensive answers.

TASK: Generate 8-10 diverse interview questions with detailed answers based on the candidate's resume and the specific job description.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S RESUME:
${resumeText}

QUESTION DISTRIBUTION:
- 3-4 Behavioral questions (STAR method: Situation, Task, Action, Result)
- 2-3 Technical questions (role-specific skills, tools, methodologies)
- 2-3 Situational questions (hypothetical scenarios relevant to the role)
- 1-2 Questions about motivation/fit (why this role, why this company)

QUESTION GUIDELINES:
1. Behavioral Questions:
   - Focus on past experiences from the resume
   - Use STAR method structure in answers
   - Examples: "Tell me about a time when...", "Describe a situation where..."

2. Technical Questions:
   - Based on skills/technologies mentioned in JD and resume
   - Test practical knowledge and experience
   - Include both conceptual and applied questions

3. Situational Questions:
   - Hypothetical scenarios relevant to the role
   - Test problem-solving and decision-making
   - Examples: "How would you handle...", "What would you do if..."

ANSWER GUIDELINES:
- Use specific examples from the resume when possible
- Incorporate quantifiable achievements
- Show problem-solving and impact
- Demonstrate alignment with job requirements
- Be concise but comprehensive (2-3 minutes speaking time)
- Use STAR method for behavioral questions

REQUIRED OUTPUT FORMAT:
QUESTION 1:
TYPE: behavioral|technical|situational
Q: [The interview question]
ANSWER: [Comprehensive answer using STAR method for behavioral, detailed explanation for technical/situational. Reference specific resume experiences when applicable.]
KEY POINTS: [Key point 1], [Key point 2], [Key point 3]
FOLLOW-UPS: [Follow-up question 1] | [Follow-up question 2]

[Repeat for all 8-10 questions]

IMPORTANT:
- Questions should be realistic and commonly asked for this role
- Answers must be based on actual resume content
- Include a mix of difficulty levels
- Ensure questions are relevant to the specific job description
- Make answers actionable and specific

Generate the interview questions and answers now:`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = result.response.text();
  console.log(
    "[AI] generateInterviewPrep raw response:",
    text.substring(0, 800)
  );

  const questions: InterviewQuestion[] = [];
  const blocks = text.split(/QUESTION \d+:/i).filter((q) => q.trim());

  blocks.slice(0, 10).forEach((block, idx) => {
    const typeMatch = block.match(
      /TYPE:\s*(behavioral|technical|situational)/i
    );
    const questionMatch = block.match(/Q:\s*([^\n]+)/i);
    const answerMatch = block.match(
      /ANSWER:\s*([^\n]+(?:\n(?!KEY POINTS:)[^\n]+)*)/i
    );
    const keyPointsMatch = block.match(/KEY POINTS:\s*([^\n]+)/i);
    const followUpsMatch = block.match(/FOLLOW-UPS:\s*([^\n]+)/i);

    if (typeMatch && questionMatch && answerMatch) {
      const keyPoints = keyPointsMatch
        ? keyPointsMatch[1]
            .split(/[,|]/)
            .map((p) => p.trim())
            .filter((p) => p.length > 0)
        : [];
      const followUps = followUpsMatch
        ? followUpsMatch[1]
            .split("|")
            .map((f) => f.trim())
            .filter((f) => f.length > 0)
        : [];

      questions.push({
        id: String(idx + 1),
        type: typeMatch[1].toLowerCase() as InterviewQuestion["type"],
        question: questionMatch[1].trim(),
        sampleAnswer: answerMatch[1].trim(),
        keyPoints,
        followUps,
      });
    }
  });

  return questions;
}
