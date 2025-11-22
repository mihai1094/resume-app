import { ResumeData } from "@/lib/types/resume";

export type LayoutMode = "sparse" | "balanced" | "dense";

export interface LayoutConfig {
    mode: LayoutMode;
    margins: string;
    fontSize: string;
    lineHeight: string;
    columnGap: string;
    sidebarWidth: string;
}

export const LAYOUTS: Record<LayoutMode, LayoutConfig> = {
    sparse: {
        mode: "sparse",
        margins: "p-12", // 3rem
        fontSize: "text-base", // 16px
        lineHeight: "leading-loose", // 2
        columnGap: "gap-12",
        sidebarWidth: "col-span-12", // Single column effectively (or very wide sidebar)
    },
    balanced: {
        mode: "balanced",
        margins: "p-8", // 2rem
        fontSize: "text-sm", // 14px
        lineHeight: "leading-normal", // 1.5
        columnGap: "gap-8",
        sidebarWidth: "col-span-4",
    },
    dense: {
        mode: "dense",
        margins: "p-6", // 1.5rem
        fontSize: "text-xs", // 12px
        lineHeight: "leading-tight", // 1.25
        columnGap: "gap-6",
        sidebarWidth: "col-span-3",
    },
};

export function useSmartLayout(data: ResumeData): LayoutConfig {
    const densityScore = calculateDensityScore(data);

    if (densityScore < 400) return LAYOUTS.sparse;
    if (densityScore > 800) return LAYOUTS.dense;
    return LAYOUTS.balanced;
}

function calculateDensityScore(data: ResumeData): number {
    let score = 0;

    // 1. Word Count (Summary)
    if (data.personalInfo.summary) {
        score += countWords(data.personalInfo.summary);
    }

    // 2. Experience (Words + Entries)
    data.workExperience.forEach((exp) => {
        score += 50; // Base score per entry
        exp.description.forEach((bullet) => {
            score += countWords(bullet);
        });
    });

    // 3. Education
    data.education.forEach((edu) => {
        score += 30; // Base score per entry
        if (edu.description) {
            edu.description.forEach((bullet) => {
                score += countWords(bullet);
            });
        }
    });

    // 4. Skills
    score += data.skills.length * 5;

    // 5. Projects
    if (data.projects) {
        data.projects.forEach((proj) => {
            score += 40;
            score += countWords(proj.description);
        });
    }

    return score;
}

function countWords(str: string): number {
    return str.trim().split(/\s+/).length;
}
