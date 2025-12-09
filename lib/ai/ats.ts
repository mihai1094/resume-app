import { ResumeData } from "@/lib/types/resume";
import { ATSAnalysisResult } from "./content-types";
import { extractJson, flashModel, safety, serializeResume } from "./shared";

export async function analyzeATSCompatibility(
  resumeData: ResumeData,
  jobDescription: string
): Promise<ATSAnalysisResult> {
  const model = flashModel();
  const resumeText = serializeResume(resumeData);

  const prompt = `You are an expert ATS (Applicant Tracking System) analyst with deep knowledge of how modern ATS systems parse, score, and rank resumes. Your analysis helps candidates optimize their resumes to pass automated screening and reach human recruiters.

TASK: Perform a comprehensive ATS compatibility analysis comparing the resume against the job description using industry-standard evaluation criteria.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S RESUME:
${resumeText}

ANALYSIS CRITERIA (Weighted Importance):

1. KEYWORD MATCHING (40-50% weight):
   - Exact keyword matches: Identify precise terms from JD present/missing in resume
   - Semantic matches: Recognize synonyms and related terms (e.g., "managed" ↔ "led" ↔ "supervised")
   - Keyword density: Optimal frequency is 2-3 mentions per keyword in relevant contexts (flag keyword stuffing)
   - Contextual relevance: Keywords must appear in appropriate context, not just listed
   - Job title alignment: Match between resume titles and target role
   - Acronym coverage: Both acronyms and full terms present (e.g., "SEO" and "Search Engine Optimization")

2. SKILL ALIGNMENT (15-20% weight):
   - Hard skills match: Technical abilities, tools, software from JD
   - Soft skills presence: Interpersonal abilities mentioned in JD
   - Skills section optimization: Dedicated section with relevant keywords
   - Certification alignment: Required certifications present/absent
   - Skill depth: Basic vs. advanced proficiency indicators

3. EXPERIENCE RELEVANCE (20-25% weight):
   - Years of experience: Match against JD requirements
   - Job title relevance: Previous roles align with target position
   - Industry alignment: Experience in same or related industry
   - Seniority level: Appropriate level for role (entry/mid/senior)
   - Recency weighting: Recent experience (last 5 years) weighted more heavily
   - Career progression: Shows growth and advancement

4. ACHIEVEMENT QUANTIFICATION (10-15% weight):
   - Metrics presence: Percentages, dollar amounts, timeframes, volumes
   - Results-oriented language: Achievements vs. responsibilities
   - Impact demonstration: Clear value and contribution shown
   - Quantification quality: Specific, measurable, relevant metrics

5. FORMAT COMPATIBILITY (5-10% weight):
   - Standard section headers: "Work Experience", "Education", "Skills" (not creative alternatives)
   - Structure clarity: Easy for ATS to parse and extract information
   - Contact information placement: In main body, not headers/footers
   - Date formatting: Consistent, parseable date formats
   - Note: Since formatting is not visible in text, focus on structural issues that would affect parsing

6. INDUSTRY TERMINOLOGY (5% weight):
   - Appropriate use of industry-specific terms
   - Professional language and terminology
   - Avoids jargon unless industry-appropriate

SCORING GUIDELINES (0-100):
- 90-100: Excellent match - Strong keyword alignment (80%+ match), comprehensive skills, meets/exceeds experience requirements, well-quantified achievements
- 75-89: Good match - Most keywords present (60-79% match), minor gaps in skills or experience, some quantification present
- 60-74: Moderate match - Some important keywords missing (40-59% match), notable skill gaps, may miss experience threshold
- 40-59: Weak match - Significant keyword gaps (20-39% match), missing critical skills or experience requirements
- 0-39: Poor match - Major misalignment (<20% keyword match), missing must-have requirements, significant qualification gaps

REQUIRED OUTPUT FORMAT (JSON):
{
  "score": [0-100 integer based on weighted analysis of all criteria above],
  "missingKeywords": [
    "[Exact critical keyword from JD that's missing - prioritize must-have requirements]",
    "[Another missing keyword - include both exact terms and important synonyms]"
  ],
  "suggestions": [
    {
      "id": "1",
      "type": "keyword|skill|experience|achievement|format|terminology",
      "severity": "critical|high|medium|low",
      "title": "[Brief, actionable title of the issue]",
      "description": "[Detailed explanation of what's missing or needs improvement, with specific examples from JD]",
      "action": "[Specific, actionable recommendation with example of how to implement]",
      "estimatedImpact": [1-15 integer representing ATS score points this fix could add]
    }
  ],
  "strengths": [
    "[Specific strength with context - what the resume does well for ATS compatibility]",
    "[Another concrete strength]"
  ],
  "improvements": [
    "[Priority improvement recommendation - most impactful change first]",
    "[Another improvement ordered by impact]"
  ]
}

ANALYSIS INSTRUCTIONS:
1. Extract ALL critical keywords from job description:
   - Must-have requirements (skills, technologies, certifications, qualifications)
   - Preferred qualifications
   - Industry-specific terms
   - Job title variations

2. Evaluate keyword presence:
   - Count exact matches
   - Identify semantic matches (synonyms, related terms)
   - Check keyword density (optimal: 2-3 mentions per important keyword)
   - Flag keyword stuffing (excessive repetition without context)

3. Assess skill alignment:
   - Compare required vs. listed skills
   - Check for both hard and soft skills
   - Verify certifications match requirements
   - Evaluate skill depth indicators

4. Analyze experience relevance:
   - Calculate years of experience match
   - Assess job title alignment
   - Check industry relevance
   - Weight recent experience more heavily (last 5 years)

5. Review achievement quantification:
   - Count metrics and quantifiable results
   - Assess results-oriented language usage
   - Evaluate impact demonstration quality

6. Prioritize suggestions:
   - Critical: Must-have requirements missing
   - High: Important preferred qualifications missing
   - Medium: Nice-to-have improvements
   - Low: Minor optimizations

7. Provide actionable recommendations:
   - Specific examples from job description
   - Concrete ways to incorporate missing elements
   - Estimated impact on ATS score

8. Highlight strengths to maintain:
   - What's working well
   - Elements that should be preserved

Return ONLY valid JSON, no markdown, no explanations.`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = result.response.text();
  const parsed = extractJson<ATSAnalysisResult>(text);
  if (!parsed) throw new Error("Failed to parse AI response");

  return {
    score: parsed.score || 0,
    missingKeywords: parsed.missingKeywords || [],
    suggestions: parsed.suggestions || [],
    strengths: parsed.strengths || [],
    improvements: parsed.improvements || [],
  };
}
