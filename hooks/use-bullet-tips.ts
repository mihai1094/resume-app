import { useMemo } from "react";
import { ACTION_VERBS, WEAK_VERBS, CLICHES } from "@/lib/ats/dictionaries";

export type TipType = "success" | "warning" | "info";

export interface Tip {
    id: string;
    type: TipType;
    message: string;
    suggestions?: string[];
    priority: number; // 1 = highest, 5 = lowest
}

interface BulletAnalysis {
    hasActionVerb: boolean;
    hasMetric: boolean;
    hasCliche: boolean;
    length: number;
    wordCount: number;
    hasPassiveVoice: boolean;
}

function analyzeBullet(text: string): BulletAnalysis {
    const trimmed = text.trim();
    const words = trimmed.split(/\s+/).filter(Boolean);
    const firstWord = words[0]?.toLowerCase().replace(/[^a-z]/g, "") || "";

    // Check for action verb
    const hasActionVerb = ACTION_VERBS.includes(firstWord);

    // Check for metrics (numbers, percentages, currency)
    const metricRegex = /\d+%|\$\d+|\d+k|\d+\+|\d+x|by \d+|over \d+|under \d+/i;
    const hasMetric = metricRegex.test(trimmed);

    // Check for clichés
    const lowerText = trimmed.toLowerCase();
    const hasCliche = CLICHES.some((cliche) =>
        lowerText.includes(cliche.toLowerCase())
    );

    // Check for passive voice
    const passiveIndicators = ["was", "were", "been", "being"];
    const hasPassiveVoice = passiveIndicators.some((indicator) =>
        lowerText.includes(` ${indicator} `)
    );

    return {
        hasActionVerb,
        hasMetric,
        hasCliche,
        length: trimmed.length,
        wordCount: words.length,
        hasPassiveVoice,
    };
}

function generateTips(analysis: BulletAnalysis, text: string): Tip[] {
    const tips: Tip[] = [];

    // Empty state
    if (text.trim().length === 0) {
        tips.push({
            id: "empty",
            type: "info",
            message: "Start typing to get writing tips",
            priority: 5,
        });
        return tips;
    }

    // 1. Action Verb Check (Priority: 1)
    if (!analysis.hasActionVerb && analysis.wordCount > 0) {
        tips.push({
            id: "action-verb",
            type: "warning",
            message: "Start with a strong action verb",
            suggestions: ["Led", "Managed", "Built", "Developed", "Increased", "Reduced", "Improved", "Launched"],
            priority: 1,
        });
    } else if (analysis.hasActionVerb) {
        tips.push({
            id: "action-verb",
            type: "success",
            message: "Great! Starts with an action verb",
            priority: 5,
        });
    }

    // 2. Metric Check (Priority: 1)
    if (!analysis.hasMetric && analysis.length > 20) {
        tips.push({
            id: "metric",
            type: "warning",
            message: "Add a metric to show impact",
            suggestions: ["by 20%", "for 500+ users", "$1M in revenue", "50% faster"],
            priority: 1,
        });
    } else if (analysis.hasMetric) {
        tips.push({
            id: "metric",
            type: "success",
            message: "Excellent! Includes quantifiable results",
            priority: 5,
        });
    }

    // 3. Length Check (Priority: 2)
    if (analysis.length < 30 && analysis.length > 0) {
        tips.push({
            id: "length",
            type: "info",
            message: "Add more detail about your impact",
            priority: 2,
        });
    } else if (analysis.length > 150) {
        tips.push({
            id: "length",
            type: "warning",
            message: "Keep it concise - aim for 1-2 lines",
            priority: 2,
        });
    } else if (analysis.length >= 30 && analysis.length <= 150) {
        tips.push({
            id: "length",
            type: "success",
            message: "Perfect length!",
            priority: 5,
        });
    }

    // 4. Cliché Detection (Priority: 3)
    if (analysis.hasCliche) {
        tips.push({
            id: "cliche",
            type: "warning",
            message: "Avoid clichés - be specific instead",
            priority: 3,
        });
    }

    // 5. Passive Voice (Priority: 4)
    if (analysis.hasPassiveVoice) {
        tips.push({
            id: "passive",
            type: "info",
            message: "Use active voice for stronger impact",
            suggestions: ["Was responsible for → Led", "Were involved in → Contributed to"],
            priority: 4,
        });
    }

    // Sort by priority (lower number = higher priority)
    return tips.sort((a, b) => a.priority - b.priority);
}

export function useBulletTips(text: string): Tip[] {
    return useMemo(() => {
        const analysis = analyzeBullet(text);
        return generateTips(analysis, text);
    }, [text]);
}
