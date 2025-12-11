import {
  Sparkles,
  Gauge,
  FileText,
  Target,
  ListChecks,
  Zap,
  Lightbulb,
  PenLine,
  BadgeCheck,
  BookOpen,
  TrendingUp,
  Wand2,
  type LucideIcon,
} from "lucide-react";

/**
 * Context types for filtering commands based on current field/section
 */
export type CommandContext =
  | "bullet"
  | "summary"
  | "personal"
  | "skills"
  | "education"
  | "experience"
  | "global";

/**
 * AI Command definition
 */
export interface AICommand {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Contexts where this command is available. Empty = available everywhere */
  contexts: CommandContext[];
  /** Keyboard shortcut hint (display only) */
  shortcut?: string;
  /** Action type for routing */
  action:
    | "improve-bullet"
    | "quantify"
    | "generate-bullets"
    | "generate-summary"
    | "ats-analysis"
    | "tailor-resume"
    | "interview-prep"
    | "cover-letter"
    | "suggest-skills"
    | "add-missing-keywords"
    | "optimize-linkedin"
    | "enhance-all";
  /** Whether this command requires a job description to be set */
  requiresJD?: boolean;
}

/**
 * Registry of all available AI commands
 */
export const AI_COMMANDS: AICommand[] = [
  // Bullet-specific commands
  {
    id: "improve-bullet",
    label: "Improve bullet",
    description: "Enhance this bullet point with stronger action verbs and impact",
    icon: Sparkles,
    contexts: ["bullet", "experience"],
    action: "improve-bullet",
  },
  {
    id: "quantify",
    label: "Quantify achievement",
    description: "Add metrics and measurable outcomes to this bullet",
    icon: Gauge,
    contexts: ["bullet", "experience"],
    action: "quantify",
  },
  {
    id: "generate-bullets",
    label: "Generate bullets",
    description: "Generate new bullet points based on your role",
    icon: PenLine,
    contexts: ["experience"],
    action: "generate-bullets",
  },

  // Summary commands
  {
    id: "generate-summary",
    label: "Generate summary",
    description: "Create a professional summary from your experience",
    icon: FileText,
    contexts: ["summary", "personal"],
    action: "generate-summary",
  },

  // Skills commands
  {
    id: "suggest-skills",
    label: "Suggest skills",
    description: "Get AI-suggested skills based on your experience",
    icon: Zap,
    contexts: ["skills"],
    action: "suggest-skills",
  },
  {
    id: "add-missing-keywords",
    label: "Add missing keywords",
    description: "Add skills from job description that are missing",
    icon: BadgeCheck,
    contexts: ["skills"],
    action: "add-missing-keywords",
    requiresJD: true,
  },

  // Global commands (available everywhere)
  {
    id: "ats-analysis",
    label: "ATS analysis",
    description: "Check how well your resume passes ATS screening",
    icon: Target,
    contexts: ["global"],
    shortcut: "⌘A",
    action: "ats-analysis",
  },
  {
    id: "tailor-resume",
    label: "Tailor resume",
    description: "Optimize your resume for a specific job description",
    icon: TrendingUp,
    contexts: ["global"],
    action: "tailor-resume",
    requiresJD: true,
  },
  {
    id: "interview-prep",
    label: "Interview prep",
    description: "Generate interview questions based on job and resume",
    icon: ListChecks,
    contexts: ["global"],
    action: "interview-prep",
    requiresJD: true,
  },
  {
    id: "cover-letter",
    label: "Generate cover letter",
    description: "Create a tailored cover letter for your application",
    icon: BookOpen,
    contexts: ["global"],
    action: "cover-letter",
    requiresJD: true,
  },
  {
    id: "optimize-linkedin",
    label: "Optimize for LinkedIn",
    description: "Get suggestions for LinkedIn profile optimization",
    icon: Lightbulb,
    contexts: ["global"],
    action: "optimize-linkedin",
  },
  {
    id: "enhance-all",
    label: "Enhance all content",
    description: "AI-improve your summary and all bullet points at once",
    icon: Wand2,
    contexts: ["global"],
    shortcut: "⌘E",
    action: "enhance-all",
  },
];

/**
 * Filter commands by context
 */
export function getCommandsForContext(
  context: CommandContext | null,
  hasJD: boolean = false
): AICommand[] {
  return AI_COMMANDS.filter((cmd) => {
    // Filter by JD requirement
    if (cmd.requiresJD && !hasJD) return false;

    // If no context specified, show all global commands
    if (!context) {
      return cmd.contexts.includes("global");
    }

    // Show commands that match the context or are global
    return cmd.contexts.includes(context) || cmd.contexts.includes("global");
  });
}

/**
 * Get a command by ID
 */
export function getCommandById(id: string): AICommand | undefined {
  return AI_COMMANDS.find((cmd) => cmd.id === id);
}
