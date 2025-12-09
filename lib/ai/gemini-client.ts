/**
 * Gemini AI Client
 * Centralized configuration for Google's Generative AI
 */

import {
  GoogleGenerativeAI,
  SafetySetting,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// Lazy initialization to avoid throwing at import time
let genAI: GoogleGenerativeAI | null = null;

/**
 * Get or initialize the Gemini AI client
 * Uses lazy initialization pattern to defer API key validation until runtime
 */
function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GOOGLE_AI_API_KEY is not set. Please add it to your .env.local file."
      );
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

// Model configurations
export const MODELS = {
  // Fast and cheap - use for most operations (RECOMMENDED)
  FLASH: "gemini-2.5-flash",
  // Latest stable flash
  FLASH_LATEST: "gemini-flash-latest",
  // More capable - use for complex tasks (if needed)
  PRO: "gemini-pro-latest",
  // Lighter model for simple tasks
  FLASH_LITE: "gemini-2.5-flash-lite",
} as const;

// Default generation config
export const DEFAULT_CONFIG = {
  temperature: 0.7, // Balance between creativity and consistency
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
};

/**
 * Get a Gemini model instance
 * @param model - Model name from MODELS constant
 * @returns Configured model instance
 */
export function getModel(model: keyof typeof MODELS = "FLASH") {
  return getGenAI().getGenerativeModel({
    model: MODELS[model],
    generationConfig: DEFAULT_CONFIG,
  });
}

/**
 * Safety settings to prevent harmful content
 */
export const SAFETY_SETTINGS: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];
