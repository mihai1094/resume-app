import { ResumeData } from "@/lib/types/resume";
import { ATSAnalysisResult } from "./content-types";
import { AIError, extractJson, flashModel, parseAIJsonResponse, safety, serializeResume, validateAIResponse } from "./shared";

/**
 * Simplified fallback prompt for when the main analysis fails
 */
function getSimplifiedPrompt(resumeText: string, jobDescription: string): string {
  // Extract key requirements from job description for focused analysis
  const jobSnippet = jobDescription.substring(0, 1500);
  const resumeSnippet = resumeText.substring(0, 2000);

  return `Compare resume to job. Return JSON only.

JOB REQUIREMENTS:
${jobSnippet}

RESUME:
${resumeSnippet}

Respond with this JSON (replace placeholders with real analysis):
{
  "score": 65,
  "missingKeywords": ["Docker", "Playwright", "distributed systems"],
  "suggestions": [
    {"id": "1", "type": "skill", "severity": "critical", "title": "Add Docker experience", "description": "Job requires Docker familiarity", "action": "Add Docker to skills if you have experience", "estimatedImpact": 10},
    {"id": "2", "type": "keyword", "severity": "high", "title": "Mention browser automation", "description": "Job focuses on Playwright/Puppeteer", "action": "Highlight any browser automation experience", "estimatedImpact": 8}
  ],
  "strengths": ["Strong TypeScript experience", "Remote work experience"],
  "improvements": ["Add more backend/infrastructure keywords", "Mention API development experience"]
}

Important: Fill in REAL values based on the actual job and resume above. Do not return empty arrays.`;
}

export async function analyzeATSCompatibility(
  resumeData: ResumeData,
  jobDescription: string
): Promise<ATSAnalysisResult> {
  const model = flashModel();
  const resumeText = serializeResume(resumeData);

  console.log('[ATS] Starting analysis, resume length:', resumeText.length, 'job desc length:', jobDescription.length);

  const prompt = `You are an ATS (Applicant Tracking System) analyzer. Compare this resume to the job description and provide a compatibility analysis.

=== JOB DESCRIPTION ===
${jobDescription}

=== RESUME ===
${resumeText}

=== INSTRUCTIONS ===
Analyze the resume against the job requirements and respond with ONLY a JSON object (no markdown, no explanation).

The JSON must have this exact structure:
{
  "score": <number 0-100 based on match quality>,
  "missingKeywords": ["<required skill/keyword not in resume>", ...],
  "suggestions": [
    {
      "id": "1",
      "type": "<keyword|skill|experience|achievement>",
      "severity": "<critical|high|medium|low>",
      "title": "<short title>",
      "description": "<what's missing or weak>",
      "action": "<how to fix it>",
      "estimatedImpact": <1-15>
    }
  ],
  "strengths": ["<what matches well>", ...],
  "improvements": ["<priority improvement>", ...]
}

Scoring guide:
- 80-100: Excellent match, most requirements met
- 60-79: Good match, some gaps
- 40-59: Partial match, significant gaps
- 0-39: Poor match, missing key requirements

Provide 3-5 actionable suggestions. Be specific about what's missing from the job requirements.`;

  // Try main analysis
  try {
    console.log('[ATS] Calling Gemini API...');
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings: safety,
    });

    const rawText = result.response.text();
    console.log('[ATS] Raw response length:', rawText?.length || 0);
    console.log('[ATS] Raw response preview:', rawText?.substring(0, 200));

    const text = validateAIResponse(rawText, "analyzeATSCompatibility");
    const parsed = parseAIJsonResponse<ATSAnalysisResult>(text, "analyzeATSCompatibility");

    console.log('[ATS] Parsed result:', JSON.stringify(parsed, null, 2).substring(0, 500));

    // Validate that we got meaningful results
    const atsResult = {
      score: parsed.score || 0,
      missingKeywords: parsed.missingKeywords || [],
      suggestions: parsed.suggestions || [],
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
    };

    // Validate we got meaningful results (score alone isn't enough)
    const hasContent = atsResult.suggestions.length > 0 || atsResult.missingKeywords.length > 0 || atsResult.strengths.length > 0;
    if (!hasContent) {
      console.warn('[ATS] AI returned score but no content, retrying. Raw:', rawText?.substring(0, 1000));
      throw new AIError("invalid_format", "analyzeATSCompatibility", "AI returned empty arrays");
    }

    console.log('[ATS] Analysis complete, score:', atsResult.score);
    return atsResult;
  } catch (error) {
    const errorDetails = error instanceof AIError
      ? { type: error.type, message: error.message, rawPreview: error.rawResponse?.substring(0, 500) }
      : error instanceof Error
        ? { message: error.message }
        : { error: String(error) };

    console.warn('[ATS] Main analysis failed:', JSON.stringify(errorDetails, null, 2));

    // Retry with simplified prompt
    try {
      console.log('[ATS] Trying simplified prompt...');
      const simplifiedPrompt = getSimplifiedPrompt(resumeText, jobDescription);
      const retryResult = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: simplifiedPrompt }] }],
        safetySettings: safety,
      });

      const retryText = retryResult.response.text();
      console.log('[ATS] Retry response length:', retryText?.length || 0);
      console.log('[ATS] Retry response preview:', retryText?.substring(0, 200));

      if (!retryText) {
        throw new AIError("empty_response", "analyzeATSCompatibility", "Retry returned empty response");
      }

      const parsed = extractJson<ATSAnalysisResult>(retryText);
      if (!parsed) {
        console.error('[ATS] Retry parse failed. Full response:', retryText);
        throw new AIError("parse_error", "analyzeATSCompatibility", "Retry also failed to parse JSON", {
          rawResponse: retryText,
        });
      }

      console.log('[ATS] Simplified analysis succeeded, score:', parsed.score);
      return {
        score: parsed.score || 50,
        missingKeywords: parsed.missingKeywords || [],
        suggestions: parsed.suggestions || [],
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
      };
    } catch (retryError) {
      const retryDetails = retryError instanceof AIError
        ? { type: retryError.type, message: retryError.message }
        : retryError instanceof Error
          ? { message: retryError.message }
          : { error: String(retryError) };

      console.error('[ATS] Both main and simplified analysis failed. Retry error:', JSON.stringify(retryDetails, null, 2));
      throw error;
    }
  }
}
