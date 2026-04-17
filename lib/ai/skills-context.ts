/**
 * Skills-suggestion context extractor.
 *
 * Transforms ResumeData into a compact, privacy-aware input for the AI
 * skill suggester. Heuristics:
 *
 * - Last 3 work experiences or last 5 years (whichever is fewer).
 * - Top 5 bullets per role, truncated at ~180 chars on sentence boundary.
 * - All projects (cap 10), descriptions truncated to 120 chars.
 * - Summary truncated to 400 chars.
 * - Optional company anonymization based on `industry`.
 * - Existing skills returned as dedupe source.
 */

import { Industry } from "@/lib/ai/content-types";
import type {
  ExistingSkillRef,
  ProjectSignal,
  SuggestSkillsInput,
  WorkHistorySignal,
} from "@/lib/ai/content-types";
import type { ResumeData } from "@/lib/types/resume";

const MAX_WORK_ENTRIES = 3;
const MAX_WORK_LOOKBACK_YEARS = 5;
const MAX_BULLETS_PER_ROLE = 5;
const MAX_BULLET_CHARS = 180;
const MAX_PROJECTS = 10;
const MAX_PROJECT_DESC_CHARS = 120;
const MAX_SUMMARY_CHARS = 400;
const MAX_CERTS = 10;

/** Maps Industry to a friendly anonymized company label. */
const INDUSTRY_LABEL: Record<Industry, string> = {
  technology: "a technology company",
  finance: "a financial services company",
  healthcare: "a healthcare company",
  marketing: "a marketing agency",
  sales: "a sales organization",
  engineering: "an engineering firm",
  education: "an education institution",
  legal: "a law firm",
  consulting: "a consulting firm",
  manufacturing: "a manufacturing company",
  retail: "a retail company",
  hospitality: "a hospitality company",
  nonprofit: "a nonprofit organization",
  government: "a government agency",
  other: "a company",
};

/** Options controlling context extraction. */
export interface BuildSkillsContextOptions {
  /** If true, real company names are replaced with industry-based labels. */
  anonymizeCompanies?: boolean;
  /** Override the "now" date — useful for tests. Defaults to current date. */
  now?: Date;
}

/**
 * Extracts the resume-derived fields of SuggestSkillsInput.
 * Caller adds `jobTitle` and (optionally) `jobDescription` on top.
 */
export function buildSkillsContext(
  resume: ResumeData,
  opts: BuildSkillsContextOptions = {}
): Omit<SuggestSkillsInput, "jobTitle" | "jobDescription"> {
  const now = opts.now ?? new Date();
  const anonymize = opts.anonymizeCompanies ?? false;
  const industry = resume.personalInfo.industry;

  return {
    summary: truncate(resume.personalInfo.summary, MAX_SUMMARY_CHARS),
    workHistory: extractWorkHistory(resume, now, anonymize, industry),
    projects: extractProjects(resume),
    certifications: extractCertifications(resume),
    educationField: resume.education?.[0]?.field?.trim() || undefined,
    languages: resume.languages?.map((l) => l.name).filter(Boolean),
    existingSkills: extractExistingSkills(resume),
    industry,
    seniorityLevel: resume.personalInfo.seniorityLevel,
  };
}

function extractWorkHistory(
  resume: ResumeData,
  now: Date,
  anonymize: boolean,
  industry: Industry | undefined
): WorkHistorySignal[] | undefined {
  const items = resume.workExperience ?? [];
  if (items.length === 0) return undefined;

  // Order by recency (current first, then by endDate desc).
  const ordered = [...items].sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    const aEnd = parseYearMonth(a.endDate) ?? parseYearMonth(a.startDate);
    const bEnd = parseYearMonth(b.endDate) ?? parseYearMonth(b.startDate);
    if (!aEnd || !bEnd) return 0;
    return bEnd.getTime() - aEnd.getTime();
  });

  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - MAX_WORK_LOOKBACK_YEARS);

  const filtered = ordered.filter((w) => {
    if (w.current) return true;
    const end = parseYearMonth(w.endDate);
    return end ? end.getTime() >= cutoff.getTime() : true;
  });

  const signals = filtered.slice(0, MAX_WORK_ENTRIES).map((w): WorkHistorySignal => {
    const start = parseYearMonth(w.startDate);
    const end = w.current ? now : parseYearMonth(w.endDate) ?? now;
    const yearsAgo = w.current ? 0 : Math.max(0, yearsBetween(end, now));
    const durationMonths = start ? Math.max(0, monthsBetween(start, end)) : 0;

    const bullets = [...(w.description ?? []), ...(w.achievements ?? [])]
      .map((b) => b?.trim())
      .filter((b): b is string => Boolean(b))
      .slice(0, MAX_BULLETS_PER_ROLE)
      .map((b) => truncateAtSentence(b, MAX_BULLET_CHARS));

    return {
      position: w.position?.trim() || "Unknown position",
      companyLabel: anonymize
        ? INDUSTRY_LABEL[industry ?? "other"]
        : w.company?.trim() || undefined,
      yearsAgo,
      durationMonths,
      isCurrent: Boolean(w.current),
      bullets,
    };
  });

  return signals.length > 0 ? signals : undefined;
}

function extractProjects(resume: ResumeData): ProjectSignal[] | undefined {
  const items = (resume.projects ?? [])
    .filter((p) => p.name?.trim())
    .slice(0, MAX_PROJECTS)
    .map((p): ProjectSignal => ({
      name: p.name.trim(),
      description: truncate(p.description, MAX_PROJECT_DESC_CHARS) ?? "",
      technologies: (p.technologies ?? [])
        .map((t) => t?.trim())
        .filter((t): t is string => Boolean(t)),
    }));
  return items.length > 0 ? items : undefined;
}

function extractCertifications(resume: ResumeData): string[] | undefined {
  const names = (resume.certifications ?? [])
    .map((c) => c.name?.trim())
    .filter((n): n is string => Boolean(n))
    .slice(0, MAX_CERTS);
  return names.length > 0 ? names : undefined;
}

function extractExistingSkills(resume: ResumeData): ExistingSkillRef[] | undefined {
  const refs = (resume.skills ?? [])
    .map((s) => ({
      name: s.name?.trim() ?? "",
      category: s.category?.trim() ?? "Other",
    }))
    .filter((s) => s.name.length > 0);
  return refs.length > 0 ? refs : undefined;
}

// ── String & date helpers ──────────────────────────────────────────

function truncate(s: string | undefined, max: number): string | undefined {
  if (!s) return undefined;
  const trimmed = s.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max).trimEnd() + "…";
}

/**
 * Truncates at a sentence boundary (., !, ?) before `max`, falling back to
 * a word boundary, then hard cut. Keeps meaning intact better than raw slice.
 */
export function truncateAtSentence(s: string, max: number): string {
  const trimmed = s.trim();
  if (trimmed.length <= max) return trimmed;
  const slice = trimmed.slice(0, max);
  const sentenceEnd = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("? ")
  );
  if (sentenceEnd > max * 0.5) return slice.slice(0, sentenceEnd + 1);
  const wordEnd = slice.lastIndexOf(" ");
  if (wordEnd > max * 0.7) return slice.slice(0, wordEnd).trimEnd() + "…";
  return slice.trimEnd() + "…";
}

/**
 * Parses a "YYYY-MM" string into a Date at day 1. Returns undefined on failure.
 */
export function parseYearMonth(s: string | undefined): Date | undefined {
  if (!s) return undefined;
  const match = /^(\d{4})-(\d{1,2})/.exec(s.trim());
  if (!match) return undefined;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return undefined;
  if (month < 1 || month > 12) return undefined;
  return new Date(year, month - 1, 1);
}

function yearsBetween(a: Date, b: Date): number {
  const diffMs = b.getTime() - a.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
}

function monthsBetween(start: Date, end: Date): number {
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  );
}
