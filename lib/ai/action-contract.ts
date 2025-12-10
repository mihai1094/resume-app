export type AiDataScope =
  | "resume"
  | "jobDescription"
  | "section"
  | "userPreferences"
  | "clipboard"
  | "custom";

export type AiActionContract = {
  inputs: AiDataScope[];
  output: string;
  description?: string;
  notes?: string[];
};

const SCOPE_LABELS: Record<AiDataScope, string> = {
  resume: "Current resume data",
  jobDescription: "Job description",
  section: "This section only",
  userPreferences: "AI tone & length preferences",
  clipboard: "Clipboard text",
  custom: "Custom context",
};

export function summarizeContract(contract?: AiActionContract): string {
  if (!contract) return "Uses current context to generate a suggestion.";

  const inputs =
    contract.inputs.length > 0
      ? contract.inputs.map((input) => SCOPE_LABELS[input] || input).join(", ")
      : "current context";

  return `Uses: ${inputs}. Outputs: ${contract.output}.`;
}


