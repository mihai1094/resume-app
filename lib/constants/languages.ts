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

