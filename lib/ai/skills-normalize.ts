/**
 * Skill-name normalization and dedupe utilities.
 *
 * Humans write the same skill many ways ("React" / "React.js" / "reactjs" /
 * "RN"). We need a canonical form so we can reliably compare user-entered
 * skills against AI-suggested ones. Two layers:
 *
 *   1. Prompt tells the AI to dedupe with alias awareness (best-effort).
 *   2. `filterDuplicates` runs after the AI response as a guaranteed safety net.
 *
 * Keep the alias list small and focused on the ~50 most common collisions;
 * over-aggressive aliasing will collapse legitimately distinct skills.
 */

/**
 * Maps canonical normalized forms to a single shared key.
 * Keys and values MUST already be normalized (lowercase, punctuation-stripped).
 */
export const SKILL_ALIASES: Readonly<Record<string, string>> = {
  // Languages
  js: "javascript",
  javascript: "javascript",
  ecmascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  py: "python",
  python: "python",
  golang: "go",
  go: "go",
  "c++": "cplusplus",
  cplusplus: "cplusplus",
  cpp: "cplusplus",
  "c#": "csharp",
  csharp: "csharp",
  ".net": "dotnet",
  dotnet: "dotnet",
  objectivec: "objectivec",
  "objective-c": "objectivec",

  // Frameworks & libs
  reactjs: "react",
  react: "react",
  "react.js": "react",
  rn: "reactnative",
  reactnative: "reactnative",
  "react-native": "reactnative",
  nodejs: "nodejs",
  node: "nodejs",
  "node.js": "nodejs",
  nextjs: "nextjs",
  next: "nextjs",
  "next.js": "nextjs",
  vuejs: "vuejs",
  vue: "vuejs",
  "vue.js": "vuejs",
  angularjs: "angular",
  angular: "angular",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",

  // Cloud & infra
  aws: "amazonwebservices",
  amazonwebservices: "amazonwebservices",
  gcp: "googlecloud",
  googlecloud: "googlecloud",
  googlecloudplatform: "googlecloud",
  azure: "microsoftazure",
  microsoftazure: "microsoftazure",
  k8s: "kubernetes",
  kubernetes: "kubernetes",
  tf: "terraform",
  terraform: "terraform",

  // Data / AI
  ml: "machinelearning",
  machinelearning: "machinelearning",
  ai: "artificialintelligence",
  artificialintelligence: "artificialintelligence",
  nlp: "naturallanguageprocessing",
  naturallanguageprocessing: "naturallanguageprocessing",
  dl: "deeplearning",
  deeplearning: "deeplearning",
  genai: "generativeai",
  generativeai: "generativeai",

  // Process / methodology
  cicd: "continuousintegration",
  "ci/cd": "continuousintegration",
  continuousintegration: "continuousintegration",
  continuousintegrationcontinuousdeployment: "continuousintegration",
  tdd: "testdrivendevelopment",
  testdrivendevelopment: "testdrivendevelopment",
  bdd: "behaviordrivendevelopment",
  behaviordrivendevelopment: "behaviordrivendevelopment",

  // Databases
  postgres: "postgresql",
  postgresql: "postgresql",
  mongo: "mongodb",
  mongodb: "mongodb",

  // Design
  ux: "userexperience",
  userexperience: "userexperience",
  ui: "userinterface",
  userinterface: "userinterface",
  uxui: "userexperience",
};

/**
 * Canonicalizes a skill name to a stable string for equality comparison.
 * Lowercases, strips spacing/punctuation, and applies alias mapping.
 *
 * Exceptions: keeps `+`, `#`, `.` long enough to match C++, C#, .NET variants
 * via the alias map before stripping.
 */
export function normalizeSkillName(raw: string): string {
  if (!raw) return "";
  const lower = raw.toLowerCase().trim();

  // Try alias lookup with light normalization first (preserves + # .).
  const light = lower.replace(/\s+/g, "").replace(/[-_]/g, "");
  if (SKILL_ALIASES[light]) return SKILL_ALIASES[light];

  // Fall back to aggressive strip: remove ALL non-alphanumerics.
  const stripped = lower.replace(/[^a-z0-9]/g, "");
  return SKILL_ALIASES[stripped] ?? stripped;
}

/** True if two skill names refer to the same underlying skill. */
export function areSkillsEquivalent(a: string, b: string): boolean {
  const na = normalizeSkillName(a);
  const nb = normalizeSkillName(b);
  return na.length > 0 && na === nb;
}

/**
 * Filters out suggestions whose names match any existing skill (by canonical
 * form). Pure function — does not mutate inputs.
 */
export function filterDuplicates<T extends { name: string }>(
  suggestions: readonly T[],
  existing: readonly { name: string }[]
): T[] {
  if (existing.length === 0) return [...suggestions];
  const existingSet = new Set(
    existing.map((s) => normalizeSkillName(s.name)).filter((s) => s.length > 0)
  );
  return suggestions.filter((s) => {
    const key = normalizeSkillName(s.name);
    if (!key) return false;
    return !existingSet.has(key);
  });
}

/**
 * Dedupes a list of suggestions against itself (first occurrence wins).
 * Protects against the AI returning the same skill twice under different names.
 */
export function dedupeSuggestions<T extends { name: string }>(
  suggestions: readonly T[]
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const s of suggestions) {
    const key = normalizeSkillName(s.name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(s);
  }
  return result;
}
