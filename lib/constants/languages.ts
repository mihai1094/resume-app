import { Language } from "@/lib/types/resume";

export const LANGUAGE_LEVELS: Array<{
  value: Language["level"];
  label: string;
}> = [
  { value: "basic", label: "Basic" },
  { value: "conversational", label: "Conversational" },
  { value: "fluent", label: "Fluent" },
  { value: "native", label: "Native" },
];

export const COMMON_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Dutch",
  "Romanian",
  "Russian",
  "Ukrainian",
  "Polish",
  "Turkish",
  "Arabic",
  "Hebrew",
  "Hindi",
  "Urdu",
  "Bengali",
  "Punjabi",
  "Mandarin Chinese",
  "Cantonese",
  "Japanese",
  "Korean",
  "Vietnamese",
  "Thai",
  "Indonesian",
] as const;

