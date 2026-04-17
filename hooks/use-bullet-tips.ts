import { useMemo } from "react";
import { ACTION_VERBS, CLICHES } from "@/lib/ats/dictionaries";

export type TipType = "success" | "warning" | "info";

export interface Tip {
    id: string;
    type: TipType;
    message: string;
    suggestions?: string[];
    suggestionStyle?: "insert" | "example"; // "insert" = clickable to append, "example" = visual hint only
    priority: number;
}

// Tech/engineering-specific strong verbs not in the generic ATS list
const EXTRA_TECH_VERBS = [
    "architected", "shipped", "profiled", "refactored", "migrated",
    "instrumented", "containerized", "scaffolded", "benchmarked",
];

// Hedging phrases that diminish ownership
const HEDGING_PATTERNS = [
    /\bhelped (to|with)\b/i,
    /\bassisted (in|with)\b/i,
    /\bworked (on|with)\b/i,
    /\bwas involved in\b/i,
    /\bwas part of\b/i,
    /\bwas responsible for\b/i,
    /\bcontributed to\b/i,
    /\bsupported the\b/i,
    /\bparticipated in\b/i,
];

// Vague words that should be replaced with numbers
const VAGUE_WORDS = [
    "significant", "significantly", "various", "numerous", "greatly",
    "highly", "substantially", "considerably", "dramatically",
    "large-scale", "large scale", "many different", "multiple different",
];

interface BulletAnalysis {
    hasActionVerb: boolean;
    hasMetric: boolean;
    hasCliche: boolean;
    hasHedging: boolean;
    hasVagueWord: boolean;
    hasPassiveVoice: boolean;
    isCategoryHeader: boolean;
    length: number;
    wordCount: number;
}

function analyzeBullet(text: string): BulletAnalysis {
    const trimmed = text.trim();
    const words = trimmed.split(/\s+/).filter(Boolean);
    const firstWord = words[0]?.toLowerCase().replace(/[^a-z]/g, "") || "";
    const lowerText = trimmed.toLowerCase();

    // Lines like "Performance & Caching:" or "CI/CD & Delivery:" are headers, not bullets
    const isCategoryHeader = trimmed.endsWith(":") && words.length <= 7;

    const allVerbs = new Set([...ACTION_VERBS, ...EXTRA_TECH_VERBS]);
    const hasActionVerb = allVerbs.has(firstWord);

    // Recognise common dev metrics: %, $, K/M suffixes, ×, user counts, time units
    const metricRegex =
        /\d+%|\$\d+|\d+[km]\b|\d+\+|\d+x\b|by \d+|over \d+|\d+ (users|teams|services|ms|seconds|hours|days|components|requests|deploys|tests|endpoints)/i;
    const hasMetric = metricRegex.test(trimmed);

    const hasCliche = CLICHES.some((c) => lowerText.includes(c.toLowerCase()));

    // Match "was/were/been + past participle" — true passive, not just the word "was"
    const hasPassiveVoice = /\b(was|were|been)\s+\w+ed\b/i.test(trimmed);

    const hasHedging = HEDGING_PATTERNS.some((p) => p.test(trimmed));

    const hasVagueWord = VAGUE_WORDS.some((w) => lowerText.includes(w));

    return {
        hasActionVerb,
        hasMetric,
        hasCliche,
        hasHedging,
        hasVagueWord,
        hasPassiveVoice,
        isCategoryHeader,
        length: trimmed.length,
        wordCount: words.length,
    };
}

function generateTips(analysis: BulletAnalysis, text: string): Tip[] {
    const tips: Tip[] = [];

    if (text.trim().length === 0) {
        tips.push({
            id: "empty",
            type: "info",
            message: "Start typing to get live writing feedback",
            priority: 5,
        });
        return tips;
    }

    if (analysis.isCategoryHeader) {
        return tips; // No tips for bold section headers
    }

    // 1. Hedging language — highest priority, kills credibility
    if (analysis.hasHedging) {
        tips.push({
            id: "hedging",
            type: "warning",
            message: "Own your work — cut hedging phrases",
            suggestions: [
                "Helped with → Built",
                "Was responsible for → Led",
                "Worked on → Developed",
                "Contributed to → Drove",
            ],
            suggestionStyle: "example",
            priority: 1,
        });
    }

    // 2. Action verb
    if (!analysis.hasActionVerb) {
        tips.push({
            id: "action-verb",
            type: "warning",
            message: "Start with a strong action verb",
            suggestions: ["Architected", "Engineered", "Optimized", "Shipped", "Automated", "Refactored", "Migrated", "Profiled"],
            suggestionStyle: "insert",
            priority: 1,
        });
    } else {
        tips.push({
            id: "action-verb",
            type: "success",
            message: "Starts with a strong action verb",
            priority: 5,
        });
    }

    // 3. Missing metrics
    if (!analysis.hasMetric && analysis.length > 20) {
        tips.push({
            id: "metric",
            type: "warning",
            message: "Quantify impact — numbers stand out",
            suggestions: [
                "reduced bundle size by 35%",
                "cut load time: 4s to 1.2s",
                "serving 50k+ users",
                "increased test coverage to 90%",
            ],
            suggestionStyle: "example",
            priority: 1,
        });
    } else if (analysis.hasMetric) {
        tips.push({
            id: "metric",
            type: "success",
            message: "Includes measurable results",
            priority: 5,
        });
    }

    // 4. Vague adjectives — replace with real numbers
    if (analysis.hasVagueWord) {
        tips.push({
            id: "vague",
            type: "warning",
            message: "Replace vague words with specifics",
            suggestions: [
                "significantly faster → 3× faster",
                "various clients → 12 enterprise clients",
                "highly performant → <100ms p99",
                "numerous issues → 47 bugs",
            ],
            suggestionStyle: "example",
            priority: 2,
        });
    }

    // 5. Length
    if (analysis.length < 30) {
        tips.push({
            id: "length",
            type: "info",
            message: "Add context: what was the problem, and what was the result?",
            priority: 3,
        });
    } else if (analysis.length > 200) {
        tips.push({
            id: "length",
            type: "warning",
            message: "Too long — aim for 1–2 tight lines",
            priority: 3,
        });
    } else {
        tips.push({
            id: "length",
            type: "success",
            message: "Good length",
            priority: 5,
        });
    }

    // 6. Passive voice
    if (analysis.hasPassiveVoice) {
        tips.push({
            id: "passive",
            type: "info",
            message: "Active voice reads stronger",
            suggestions: ["was built → built", "were improved → improved"],
            suggestionStyle: "example",
            priority: 4,
        });
    }

    // 7. Clichés
    if (analysis.hasCliche) {
        tips.push({
            id: "cliche",
            type: "warning",
            message: "Clichés weaken your bullet — be specific instead",
            priority: 4,
        });
    }

    return tips.sort((a, b) => a.priority - b.priority);
}

export function useBulletTips(text: string): Tip[] {
    return useMemo(() => {
        const analysis = analyzeBullet(text);
        return generateTips(analysis, text);
    }, [text]);
}
