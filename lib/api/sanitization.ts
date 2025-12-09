/**
 * Input Sanitization Utilities
 * Strip HTML/scripts and validate inputs with Zod
 */

import { z } from "zod";

/**
 * Strip HTML tags and potentially dangerous characters
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<[^>]+>/g, "") // Remove all HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .trim();
}

/**
 * Sanitize and validate text input
 */
export function sanitizeText(input: string, maxLength: number = 10000): string {
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }

  const sanitized = stripHtml(input);

  if (sanitized.length > maxLength) {
    throw new Error(`Input too long. Maximum ${maxLength} characters allowed.`);
  }

  return sanitized;
}

/**
 * Zod schemas for API validation
 */

// Resume data validation
export const resumeDataSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().max(100),
    lastName: z.string().max(100),
    email: z.string().email().max(255).optional().or(z.literal("")),
    phone: z.string().max(50).optional().or(z.literal("")),
    location: z.string().max(200).optional().or(z.literal("")),
    website: z.string().max(500).optional().or(z.literal("")),
    linkedin: z.string().max(500).optional().or(z.literal("")),
    github: z.string().max(500).optional().or(z.literal("")),
    summary: z.string().max(2000).optional().or(z.literal("")),
    jobTitle: z.string().max(200).optional().or(z.literal("")),
  }),
  workExperience: z.array(z.any()).max(20), // Allow up to 20 work experiences
  education: z.array(z.any()).max(10), // Allow up to 10 education entries
  skills: z.array(z.any()).max(100), // Allow up to 100 skills
  projects: z.array(z.any()).max(20).optional(),
  certifications: z.array(z.any()).max(30).optional(),
  languages: z.array(z.any()).max(20).optional(),
});

// Job description validation
export const jobDescriptionSchema = z.string()
  .min(50, "Job description must be at least 50 characters")
  .max(20000, "Job description too long. Maximum 20,000 characters.");

// Text input validation (for AI prompts)
export const textInputSchema = z.string()
  .min(1, "Input cannot be empty")
  .max(5000, "Input too long. Maximum 5,000 characters.");

// Bullet point validation
export const bulletInputSchema = z.string()
  .min(10, "Bullet point must be at least 10 characters")
  .max(500, "Bullet point too long. Maximum 500 characters.");

/**
 * Validate and sanitize job description
 */
export function validateJobDescription(input: unknown): string {
  const parsed = jobDescriptionSchema.parse(input);
  return sanitizeText(parsed, 20000);
}

/**
 * Validate and sanitize text input
 */
export function validateTextInput(input: unknown, maxLength: number = 5000): string {
  const schema = z.string().min(1).max(maxLength);
  const parsed = schema.parse(input);
  return sanitizeText(parsed, maxLength);
}

/**
 * Validate resume data structure
 */
export function validateResumeData(data: unknown) {
  return resumeDataSchema.parse(data);
}

/**
 * Validate bullet point input
 */
export function validateBulletInput(input: unknown): string {
  const parsed = bulletInputSchema.parse(input);
  return sanitizeText(parsed, 500);
}

/**
 * Safe JSON parse with validation
 */
export function safeJsonParse<T>(
  input: string,
  schema: z.ZodSchema<T>
): T {
  try {
    const parsed = JSON.parse(input);
    return schema.parse(parsed);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Invalid JSON: ${error.message}`
        : "Invalid JSON format"
    );
  }
}
