// Achievement system types

export type AchievementId =
  | "first_resume"
  | "first_export"
  | "five_exports"
  | "ten_exports"
  | "ai_master"
  | "section_speedrun"
  | "complete_resume"
  | "cover_letter_pro"
  | "template_explorer"
  | "detail_oriented"
  | "early_bird"
  | "night_owl";

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string; // emoji
  category: "milestone" | "productivity" | "quality" | "exploration";
  points: number;
  unlockedAt?: string; // ISO date string
  progress?: {
    current: number;
    target: number;
  };
}

export interface AchievementState {
  achievements: Record<AchievementId, Achievement>;
  totalPoints: number;
  level: number;
  lastUnlocked?: AchievementId;
}

export const ACHIEVEMENTS: Record<AchievementId, Omit<Achievement, "unlockedAt" | "progress">> = {
  first_resume: {
    id: "first_resume",
    title: "Resume Started",
    description: "Created your first resume draft",
    icon: "🎯",
    category: "milestone",
    points: 10,
  },
  first_export: {
    id: "first_export",
    title: "Application Ready",
    description: "Exported your first resume PDF",
    icon: "📄",
    category: "milestone",
    points: 15,
  },
  five_exports: {
    id: "five_exports",
    title: "Application Momentum",
    description: "Exported 5 tailored resumes",
    icon: "🎯",
    category: "milestone",
    points: 25,
  },
  ten_exports: {
    id: "ten_exports",
    title: "Interview Pipeline",
    description: "Exported 10 tailored resumes",
    icon: "🏆",
    category: "milestone",
    points: 50,
  },
  ai_master: {
    id: "ai_master",
    title: "AI Co-Pilot",
    description: "Used AI features 10 times to improve content",
    icon: "🤖",
    category: "productivity",
    points: 30,
  },
  section_speedrun: {
    id: "section_speedrun",
    title: "Focused Editor",
    description: "Completed a section with high efficiency",
    icon: "⚡",
    category: "productivity",
    points: 20,
  },
  complete_resume: {
    id: "complete_resume",
    title: "Submission Ready",
    description: "Reached 100% completion on a resume",
    icon: "✨",
    category: "quality",
    points: 40,
  },
  cover_letter_pro: {
    id: "cover_letter_pro",
    title: "Cover Letter Ready",
    description: "Created your first tailored cover letter",
    icon: "✍️",
    category: "milestone",
    points: 20,
  },
  template_explorer: {
    id: "template_explorer",
    title: "Template Strategist",
    description: "Explored multiple templates to match your role",
    icon: "🎨",
    category: "exploration",
    points: 15,
  },
  detail_oriented: {
    id: "detail_oriented",
    title: "Impact Writer",
    description: "Added 5+ achievement bullets to one role",
    icon: "🔍",
    category: "quality",
    points: 15,
  },
  early_bird: {
    id: "early_bird",
    title: "Resume Refiner",
    description: "Revisited your resume to improve clarity",
    icon: "🌅",
    category: "exploration",
    points: 10,
  },
  night_owl: {
    id: "night_owl",
    title: "Final Polish",
    description: "Did a final quality pass before applying",
    icon: "🦉",
    category: "exploration",
    points: 10,
  },
};

// Level thresholds
export const LEVEL_THRESHOLDS = [0, 25, 60, 100, 150, 220, 300];

export function calculateLevel(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getNextLevelThreshold(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  }
  return LEVEL_THRESHOLDS[currentLevel];
}
