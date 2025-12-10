import { ResumeData } from "@/lib/types/resume";
import { CoverLetterOutput } from "./content-types";
import { getModel, SAFETY_SETTINGS } from "./gemini-client";

export const flashModel = () => getModel("FLASH");
export const safety = SAFETY_SETTINGS;

/**
 * Standardized AI error types for consistent error handling
 */
export type AIErrorType =
  | "parse_error" // Failed to parse AI response
  | "empty_response" // AI returned empty or null response
  | "invalid_format" // Response doesn't match expected format
  | "api_error" // API call failed
  | "rate_limit" // Rate limited by API
  | "content_filtered" // Content was filtered by safety settings
  | "unknown"; // Unclassified error

/**
 * Custom error class for AI-related errors with structured information
 */
export class AIError extends Error {
  type: AIErrorType;
  functionName: string;
  rawResponse?: string;
  originalError?: Error;

  constructor(
    type: AIErrorType,
    functionName: string,
    message: string,
    options?: { rawResponse?: string; originalError?: Error }
  ) {
    super(`[AI:${functionName}] ${message}`);
    this.name = "AIError";
    this.type = type;
    this.functionName = functionName;
    this.rawResponse = options?.rawResponse;
    this.originalError = options?.originalError;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      functionName: this.functionName,
      message: this.message,
      rawResponse: this.rawResponse?.substring(0, 500),
    };
  }
}

/**
 * Wrap AI function execution with standardized error handling
 */
export async function withAIErrorHandling<T>(
  functionName: string,
  fn: () => Promise<T>,
  options?: {
    fallback?: T;
    onError?: (error: AIError) => void;
  }
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    let aiError: AIError;

    if (error instanceof AIError) {
      aiError = error;
    } else if (error instanceof Error) {
      // Classify common API errors
      const message = error.message.toLowerCase();
      let errorType: AIErrorType = "unknown";

      if (message.includes("rate") || message.includes("quota")) {
        errorType = "rate_limit";
      } else if (message.includes("parse") || message.includes("json")) {
        errorType = "parse_error";
      } else if (message.includes("filter") || message.includes("safety")) {
        errorType = "content_filtered";
      } else if (
        message.includes("api") ||
        message.includes("network") ||
        message.includes("fetch")
      ) {
        errorType = "api_error";
      }

      aiError = new AIError(errorType, functionName, error.message, {
        originalError: error,
      });
    } else {
      aiError = new AIError(
        "unknown",
        functionName,
        String(error)
      );
    }

    // Log the error for debugging
    console.error(`[AI Error] ${aiError.functionName}:`, {
      type: aiError.type,
      message: aiError.message,
    });

    // Call optional error handler
    options?.onError?.(aiError);

    // Return fallback if provided, otherwise throw
    if (options?.fallback !== undefined) {
      return options.fallback;
    }

    throw aiError;
  }
}

/**
 * Validate and parse JSON response with helpful error messages
 */
export function parseAIJsonResponse<T>(
  text: string,
  functionName: string,
  validator?: (data: unknown) => data is T
): T {
  const parsed = extractJson<T>(text);

  if (parsed === null) {
    throw new AIError("parse_error", functionName, "Failed to parse JSON from AI response", {
      rawResponse: text,
    });
  }

  if (validator && !validator(parsed)) {
    throw new AIError("invalid_format", functionName, "AI response does not match expected format", {
      rawResponse: text,
    });
  }

  return parsed;
}

/**
 * Check if AI response is empty or meaningless
 */
export function validateAIResponse(
  text: string | null | undefined,
  functionName: string
): string {
  if (!text || text.trim().length === 0) {
    throw new AIError("empty_response", functionName, "AI returned empty response");
  }

  // Check for common error indicators in response
  const lowerText = text.toLowerCase();
  if (
    lowerText.includes("i cannot") ||
    lowerText.includes("i'm unable") ||
    lowerText.includes("i am unable")
  ) {
    throw new AIError("content_filtered", functionName, "AI declined to generate content", {
      rawResponse: text,
    });
  }

  return text;
}

/**
 * Utility: safe JSON extraction from LLM responses (handles code fences / loose JSON).
 */
export function extractJson<T>(text: string): T | null {
  const candidates =
    text.match(/```json\s*([\s\S]*?)```/) ||
    text.match(/```\s*([\s\S]*?)```/) ||
    text.match(/\{[\s\S]*\}/) ||
    text.match(/\[[\s\S]*\]/);

  if (!candidates) return null;
  const jsonText = candidates[1] || candidates[0];

  const tryParse = (payload: string) => {
    try {
      return JSON.parse(payload) as T;
    } catch {
      return null;
    }
  };

  const direct = tryParse(jsonText);
  if (direct) return direct;

  const first = jsonText.indexOf("{");
  const last = jsonText.lastIndexOf("}");
  if (first !== -1 && last > first) {
    return tryParse(jsonText.slice(first, last + 1));
  }

  const arrFirst = jsonText.indexOf("[");
  const arrLast = jsonText.lastIndexOf("]");
  if (arrFirst !== -1 && arrLast > arrFirst) {
    return tryParse(jsonText.slice(arrFirst, arrLast + 1));
  }

  return null;
}

/**
 * Serialize resume data into a prompt-friendly string.
 */
export function serializeResume(resumeData: ResumeData): string {
  if (!resumeData) return "";

  const parts: string[] = [];
  const pi = resumeData.personalInfo;

  if (pi) {
    parts.push(`Name: ${pi.firstName} ${pi.lastName}`);
    if (pi.jobTitle) parts.push(`Title: ${pi.jobTitle}`);
    if (pi.summary) parts.push(`Summary: ${pi.summary}`);
    if (pi.location) parts.push(`Location: ${pi.location}`);
  }

  if (resumeData.workExperience?.length) {
    parts.push("\nWORK EXPERIENCE:");
    resumeData.workExperience.forEach((exp) => {
      parts.push(`\n${exp.position} at ${exp.company}`);
      if (exp.location) parts.push(`Location: ${exp.location}`);
      const start = exp.startDate ? exp.startDate : "N/A";
      const end = exp.current ? "Present" : exp.endDate || "Present";
      parts.push(`Dates: ${start} - ${end}`);
      exp.description?.forEach((line) => {
        if (line?.trim()) parts.push(`- ${line.trim()}`);
      });
      exp.achievements?.forEach((line) => {
        if (line?.trim()) parts.push(`- ${line.trim()}`);
      });
    });
  }

  if (resumeData.projects?.length) {
    parts.push("\nPROJECTS:");
    resumeData.projects.forEach((project) => {
      parts.push(
        `${project.name}${
          project.description ? `: ${project.description}` : ""
        }`
      );
      if (project.technologies?.length) {
        parts.push(`Technologies: ${project.technologies.join(", ")}`);
      }
    });
  }

  if (resumeData.education?.length) {
    parts.push("\nEDUCATION:");
    resumeData.education.forEach((edu) => {
      parts.push(`${edu.degree} in ${edu.field} at ${edu.institution}`);
      const end = edu.current ? "Present" : edu.endDate || "Present";
      parts.push(`Dates: ${edu.startDate} - ${end}`);
    });
  }

  if (resumeData.skills?.length) {
    parts.push("\nSKILLS:");
    parts.push(resumeData.skills.map((s) => s.name).join(", "));
  }

  if (resumeData.languages?.length) {
    parts.push("\nLANGUAGES:");
    resumeData.languages.forEach((lang) => {
      parts.push(`${lang.name}${lang.level ? ` (${lang.level})` : ""}`);
    });
  }

  if (resumeData.certifications?.length) {
    parts.push("\nCERTIFICATIONS:");
    resumeData.certifications.forEach((cert) => {
      parts.push(`${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ""}`);
    });
  }

  return parts.join("\n");
}

/**
 * Heuristic metric extraction from a text snippet.
 */
export function extractMetrics(text: string): string {
  const matches =
    text.match(
      /\b\d+(?:\.\d+)?\s*(?:%|percent|pts|ms|s|sec|seconds|hrs?|hours?|days?|weeks?|x|k|m|b)?\b/gi
    ) || [];
  const unique = Array.from(
    new Set(
      matches.map((m) =>
        m
          .replace(/\s+/g, " ")
          .replace(/percent/i, "%")
          .trim()
      )
    )
  );
  return unique.slice(0, 3).join(", ");
}

/**
 * Fallback parser for cover letter text responses when JSON is not returned.
 */
export function fallbackCoverLetterFromText(
  text: string,
  resumeData: ResumeData
): CoverLetterOutput {
  const cleaned = text.replace(/```[\s\S]*?```/g, "").trim();
  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const defaultSignature = `Sincerely,\n${
    resumeData.personalInfo?.firstName || ""
  } ${resumeData.personalInfo?.lastName || ""}`.trim();

  const salutation =
    paragraphs.find((p) => /^dear/i.test(p)) || "Dear Hiring Manager,";
  const salutationIndex = paragraphs.findIndex((p) => p === salutation);

  const closingIndex = paragraphs.findIndex((p) =>
    /^(sincerely|best regards|thank you)/i.test(p)
  );

  const closing =
    closingIndex !== -1
      ? paragraphs[closingIndex]
      : "Thank you for your consideration.";
  const signature =
    closingIndex !== -1 && paragraphs[closingIndex + 1]
      ? paragraphs[closingIndex + 1]
      : defaultSignature;

  const bodyStart = salutationIndex >= 0 ? salutationIndex + 1 : 0;
  const bodyEnd = closingIndex > bodyStart ? closingIndex : paragraphs.length;
  const body = paragraphs.slice(bodyStart, bodyEnd);

  return {
    salutation,
    introduction: body[0] || "",
    bodyParagraphs: body.slice(1),
    closing,
    signature,
  };
}
