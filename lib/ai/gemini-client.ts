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
  maxOutputTokens: 4096, // Increased for longer responses like ATS analysis
};

// JSON-specific config for structured outputs
export const JSON_CONFIG = {
  temperature: 0.3, // Lower temperature for more consistent JSON
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 4096,
  responseMimeType: "application/json", // Request JSON response format
};

function isTransientError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message;
  return (
    msg.includes("503") ||
    msg.includes("Service Unavailable") ||
    msg.includes("high demand") ||
    msg.includes("overloaded") ||
    msg.includes("502") ||
    msg.includes("529")
  );
}

type GenerativeModel = ReturnType<InstanceType<typeof GoogleGenerativeAI>["getGenerativeModel"]>;

function withRetry(model: GenerativeModel, maxRetries = 2): GenerativeModel {
  const originalGenerate = model.generateContent.bind(model);
  model.generateContent = async (...args) => {
    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await originalGenerate(...args);
      } catch (err) {
        lastError = err;
        if (!isTransientError(err) || attempt === maxRetries) throw err;
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
    throw lastError;
  };
  return model;
}

/**
 * Get a Gemini model instance with automatic retry on transient errors.
 * @param model - Model name from MODELS constant
 * @param useJsonConfig - Whether to use JSON-optimized config
 * @returns Configured model instance (generateContent retries up to 2× on 503/502)
 */
export function getModel(model: keyof typeof MODELS = "FLASH", useJsonConfig: boolean = false) {
  const instance = getGenAI().getGenerativeModel({
    model: MODELS[model],
    generationConfig: useJsonConfig ? JSON_CONFIG : DEFAULT_CONFIG,
  });
  return withRetry(instance);
}

/** @deprecated Use getModel() — retry is now built in */
export async function generateWithRetry(
  model: GenerativeModel,
  request: Parameters<GenerativeModel["generateContent"]>[0]
): ReturnType<GenerativeModel["generateContent"]> {
  return model.generateContent(request);
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
