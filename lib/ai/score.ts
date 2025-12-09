import { ResumeData } from "@/lib/types/resume";
import { ResumeScore } from "./content-types";
import { flashModel, safety, serializeResume } from "./shared";

export async function scoreResume(
  resumeData: ResumeData
): Promise<ResumeScore> {
  const model = flashModel();
  const resumeText = serializeResume(resumeData);

  const prompt = `You are an expert resume evaluator specializing in comprehensive resume analysis and scoring based on industry best practices, ATS optimization standards, and recruiter preferences. Your evaluation helps candidates create resumes that pass both automated screening and human review.

TASK: Perform a comprehensive evaluation of this resume across multiple dimensions using industry-standard criteria and provide detailed scoring with actionable, specific feedback.

RESUME TO EVALUATE:
${resumeText}

EVALUATION CRITERIA (Detailed Rubrics):

1. KEYWORDS (0-100):
   Evaluate keyword optimization and relevance:
   - Industry-relevant keywords: Appropriate terminology for the candidate's field/role
   - Skill keywords: Technical and soft skills appropriate for target role level
   - Job title keywords: Relevant job titles and role descriptors present
   - Certification/qualification keywords: Professional credentials and qualifications
   - Keyword density: Optimal frequency (2-3 mentions per important keyword in context)
   - Natural integration: Keywords flow naturally, not stuffed or forced
   - Acronym coverage: Both acronyms and full terms included where relevant
   - Contextual placement: Keywords appear in relevant sections (experience, skills, summary)

   Scoring:
   - 90-100: Exceptional keyword optimization, industry-appropriate terms, natural integration
   - 80-89: Strong keyword presence, good integration, minor gaps
   - 70-79: Adequate keywords, some missing industry terms, acceptable integration
   - 60-69: Basic keywords present, missing important terms, integration needs work
   - 50-59: Limited keywords, significant gaps, poor integration
   - 0-49: Minimal keywords, major gaps, keyword stuffing or unnatural usage

2. METRICS (0-100):
   Evaluate quantification and measurable achievements:
   - Quantifiable achievements: Specific numbers, percentages, dollar amounts
   - Percentage increases/decreases: Growth metrics, efficiency improvements
   - Financial impact: Revenue, cost savings, budget management, ROI
   - Timeframes: Project durations, deadlines met, time-to-market improvements
   - Team/project scope: Team sizes managed, project scales, organizational impact
   - Volume metrics: Users served, transactions processed, data handled
   - Scale indicators: Geographic reach, market size, customer base
   - Quality metrics: Error reduction, accuracy improvements, satisfaction scores

   Scoring:
   - 90-100: Extensive quantification, diverse metrics, clear impact demonstrated
   - 80-89: Strong metrics throughout, good variety, clear impact
   - 70-79: Adequate metrics, some achievements quantified, impact visible
   - 60-69: Limited metrics, few quantified achievements, impact unclear
   - 50-59: Minimal metrics, mostly qualitative descriptions
   - 0-49: No or very few metrics, entirely qualitative, no measurable impact

3. FORMATTING (0-100):
   Evaluate structure, readability, and professional presentation:
   - Clear section structure: Logical organization, easy navigation
   - Consistent formatting: Uniform styling, spacing, font usage
   - Professional appearance: Clean, polished, appropriate for industry
   - Easy to scan: Quick readability, clear visual hierarchy
   - Appropriate length: 1-2 pages for most roles, appropriate for experience level
   - Contact information clarity: Complete, accessible, properly formatted
   - Visual balance: Appropriate white space, not cluttered
   - Section completeness: All standard sections present and complete

   Scoring:
   - 90-100: Exceptional formatting, professional, highly readable, optimal length
   - 80-89: Strong formatting, professional appearance, good readability
   - 70-79: Adequate formatting, mostly consistent, readable
   - 60-69: Basic formatting, some inconsistencies, readability issues
   - 50-59: Poor formatting, inconsistent, difficult to read
   - 0-49: Very poor formatting, unprofessional, hard to parse

4. ATS COMPATIBILITY (0-100):
   Evaluate ATS-friendly structure and optimization:
   - Standard section headers: Conventional titles ("Work Experience", "Education", "Skills")
   - Keyword optimization: Strategic keyword placement for ATS parsing
   - Clean structure: Simple layout, no complex formatting that confuses parsers
   - Parseable content: Information easily extractable by ATS systems
   - Contact information placement: In main body, not headers/footers
   - Date formatting: Consistent, parseable date formats
   - File format considerations: Structure suggests ATS-compatible format (noted in text)
   - No parsing blockers: Avoids elements that typically confuse ATS (tables, images, complex layouts)

   Scoring:
   - 90-100: Excellent ATS compatibility, optimal structure, all best practices followed
   - 80-89: Strong ATS compatibility, minor optimization opportunities
   - 70-79: Good ATS compatibility, some areas for improvement
   - 60-69: Adequate ATS compatibility, notable optimization needed
   - 50-59: Poor ATS compatibility, significant issues
   - 0-49: Very poor ATS compatibility, major parsing problems likely

5. IMPACT (0-100):
   Evaluate results orientation and value demonstration:
   - Results-oriented language: Focus on achievements and outcomes, not just duties
   - Achievement focus: Accomplishments highlighted over responsibilities
   - Strong action verbs: Powerful, specific verbs (Led, Developed, Implemented, etc.)
   - Value demonstration: Clear contribution and impact shown
   - Progression and growth: Career advancement and skill development evident
   - Compelling professional summary: Engaging, value-focused opening
   - Problem-solving evidence: Challenges addressed and solved
   - Leadership indicators: Management, influence, and initiative shown

   Scoring:
   - 90-100: Exceptional impact focus, compelling achievements, strong value proposition
   - 80-89: Strong impact focus, good achievements, clear value
   - 70-79: Adequate impact focus, some achievements, value somewhat clear
   - 60-69: Limited impact focus, mostly responsibilities, value unclear
   - 50-59: Poor impact focus, primarily duties listed, minimal value shown
   - 0-49: Very poor impact focus, entirely responsibility-based, no value demonstrated

OVERALL SCORING METHODOLOGY:
- Calculate weighted average: Keywords (25%), Metrics (25%), Formatting (15%), ATS Compatibility (20%), Impact (15%)
- Consider industry benchmarks for similar roles and experience levels
- Factor in completeness: Missing critical sections reduce overall score
- Apply severity weighting: Critical issues (missing contact info, no experience) have greater impact

SCORING SCALE (Overall and Categories):
- 90-100: Exceptional (Top 10% of resumes) - Standout quality, exceeds standards
- 80-89: Excellent (Top 20%) - Strong quality, meets high standards
- 70-79: Good (Top 30%) - Solid quality, meets most standards
- 60-69: Average (Top 50%) - Acceptable quality, meets basic standards
- 50-59: Below Average (Bottom 50%) - Needs improvement, below standards
- 0-49: Needs Significant Improvement - Major gaps, well below standards

BENCHMARK COMPARISON:
Compare against typical resumes for similar roles, experience levels, and industries. Consider:
- Industry standards and expectations
- Role level appropriateness (entry/mid/senior)
- Geographic market norms
- Current hiring market conditions

REQUIRED OUTPUT FORMAT:
OVERALL SCORE: [0-100 integer - weighted average of all categories]

CATEGORY SCORES:
Keywords: [0-100]
Metrics: [0-100]
Formatting: [0-100]
ATS Compatibility: [0-100]
Impact: [0-100]

STRENGTHS:
- [Specific strength 1: Concrete example with brief explanation of why it's effective]
- [Specific strength 2: Another concrete example with context]
- [Continue listing 3-5 key strengths with specific examples...]

IMPROVEMENTS:
- [Priority improvement 1: Specific, actionable recommendation with example of how to implement]
- [Priority improvement 2: Another specific, actionable recommendation]
- [Continue listing 3-5 key improvements ordered by impact...]

BENCHMARK: [Above average (Top X%) | Average (Top X%) | Below average (Bottom X%) - include specific percentile if possible]

Provide comprehensive evaluation now:`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: safety,
  });

  const text = result.response.text();
  console.log("[AI] scoreResume raw response:", text.substring(0, 800));

  const overallMatch = text.match(/OVERALL SCORE:\s*(\d+)/i);
  const keywordsMatch = text.match(/Keywords:\s*(\d+)/i);
  const metricsMatch = text.match(/Metrics:\s*(\d+)/i);
  const formattingMatch = text.match(/Formatting:\s*(\d+)/i);
  const atsMatch = text.match(/ATS Compatibility:\s*(\d+)/i);
  const impactMatch = text.match(/Impact:\s*(\d+)/i);

  const strengthsSection = text.match(
    /STRENGTHS:([\s\S]*?)(?:IMPROVEMENTS:|$)/i
  );
  const improvementsSection = text.match(
    /IMPROVEMENTS:([\s\S]*?)(?:BENCHMARK:|$)/i
  );
  const benchmarkMatch = text.match(/BENCHMARK:\s*([^\n]+)/i);

  const strengths =
    strengthsSection?.[1]
      ?.split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("-"))
      .map((l) => l.replace(/^-\s*/, "").trim())
      .filter((l) => l.length > 0) || [];

  const improvements =
    improvementsSection?.[1]
      ?.split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("-"))
      .map((l) => l.replace(/^-\s*/, "").trim())
      .filter((l) => l.length > 0) || [];

  return {
    overallScore: overallMatch ? parseInt(overallMatch[1], 10) : 50,
    categoryScores: {
      keywords: keywordsMatch ? parseInt(keywordsMatch[1], 10) : 50,
      metrics: metricsMatch ? parseInt(metricsMatch[1], 10) : 50,
      formatting: formattingMatch ? parseInt(formattingMatch[1], 10) : 50,
      atsCompatibility: atsMatch ? parseInt(atsMatch[1], 10) : 50,
      impact: impactMatch ? parseInt(impactMatch[1], 10) : 50,
    },
    strengths,
    improvements,
    industryBenchmark: benchmarkMatch?.[1]?.trim() || "Average",
  };
}
