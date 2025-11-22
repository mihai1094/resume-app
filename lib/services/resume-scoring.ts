import { ResumeData } from "@/lib/types/resume";
import { ACTION_VERBS, WEAK_VERBS, CLICHES } from "@/lib/ats/dictionaries";

export type ScoreStatus = 'excellent' | 'good' | 'fair' | 'poor';

export interface MetricScore {
    score: number;
    maxScore: number;
    status: ScoreStatus;
    feedback: string;
    actionableItems?: ActionableItem[];
}

export interface ActionableItem {
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    sectionId?: string; // ID of section to jump to
}

export interface Recommendation {
    id: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    sectionId?: string;
}

export interface ResumeScore {
    overall: number;
    breakdown: {
        atsCompatibility: MetricScore;
        contentQuality: MetricScore;
        formatting: MetricScore;
        lengthOptimization: MetricScore;
        keywords: MetricScore;
        impactMetrics: MetricScore;
    };
    recommendations: Recommendation[];
}

function getStatus(score: number): ScoreStatus {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
}

// 1. ATS Compatibility (0-100)
function calculateATSCompatibility(data: ResumeData): MetricScore {
    let score = 0;
    const actionableItems: ActionableItem[] = [];

    // Keyword matching (40 points)
    const hasKeywords = data.skills.length >= 5;
    if (hasKeywords) {
        score += 40;
    } else {
        actionableItems.push({
            id: 'ats-keywords',
            title: 'Add more skills',
            description: `Add ${5 - data.skills.length} more skills to improve ATS matching`,
            priority: 'high',
            sectionId: 'skills',
        });
    }

    // Contact info completeness (30 points)
    const contactComplete = !!(
        data.personalInfo.firstName &&
        data.personalInfo.lastName &&
        data.personalInfo.email &&
        data.personalInfo.phone
    );
    if (contactComplete) {
        score += 30;
    } else {
        actionableItems.push({
            id: 'ats-contact',
            title: 'Complete contact information',
            description: 'Add missing contact details (name, email, phone)',
            priority: 'high',
            sectionId: 'personal-info',
        });
    }

    // Section headers (20 points)
    const hasExperience = data.workExperience.length > 0;
    const hasEducation = data.education.length > 0;
    if (hasExperience && hasEducation) {
        score += 20;
    }

    // Formatting simplicity (10 points)
    score += 10; // Assume our templates are ATS-friendly

    const status = getStatus(score);
    const feedback =
        status === 'excellent' ? 'Excellent! Your resume is highly ATS-compatible' :
            status === 'good' ? 'Good ATS compatibility with room for improvement' :
                status === 'fair' ? 'Fair - add more keywords and complete contact info' :
                    'Needs work - missing critical ATS elements';

    return { score, maxScore: 100, status, feedback, actionableItems };
}

// 2. Content Quality (0-100)
function calculateContentQuality(data: ResumeData): MetricScore {
    let score = 0;
    const actionableItems: ActionableItem[] = [];

    // Action verb usage (30 points)
    let totalBullets = 0;
    let bulletsWithActionVerbs = 0;

    data.workExperience.forEach((exp) => {
        exp.description.forEach((bullet) => {
            if (bullet.trim()) {
                totalBullets++;
                const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
                if (ACTION_VERBS.includes(firstWord)) {
                    bulletsWithActionVerbs++;
                }
            }
        });
    });

    const actionVerbPercentage = totalBullets > 0 ? (bulletsWithActionVerbs / totalBullets) * 100 : 0;
    score += Math.round((actionVerbPercentage / 100) * 30);

    if (actionVerbPercentage < 70) {
        actionableItems.push({
            id: 'content-action-verbs',
            title: 'Add more action verbs',
            description: `${Math.round(totalBullets - bulletsWithActionVerbs)} bullets need action verbs`,
            priority: 'high',
            sectionId: 'experience',
        });
    }

    // Quantifiable results (30 points)
    let bulletsWithMetrics = 0;
    const metricRegex = /\d+%|\$\d+|\d+k|\d+\+|\d+x|by \d+|over \d+|under \d+/i;

    data.workExperience.forEach((exp) => {
        exp.description.forEach((bullet) => {
            if (metricRegex.test(bullet)) {
                bulletsWithMetrics++;
            }
        });
    });

    const metricsPercentage = totalBullets > 0 ? (bulletsWithMetrics / totalBullets) * 100 : 0;
    score += Math.round((metricsPercentage / 100) * 30);

    if (metricsPercentage < 50) {
        actionableItems.push({
            id: 'content-metrics',
            title: 'Add quantifiable results',
            description: `Add metrics to ${Math.round(totalBullets - bulletsWithMetrics)} more bullets`,
            priority: 'high',
            sectionId: 'experience',
        });
    }

    // Clarity and conciseness (20 points)
    let tooLongBullets = 0;
    data.workExperience.forEach((exp) => {
        exp.description.forEach((bullet) => {
            if (bullet.length > 150) tooLongBullets++;
        });
    });

    const clarityScore = totalBullets > 0 ? ((totalBullets - tooLongBullets) / totalBullets) * 20 : 20;
    score += Math.round(clarityScore);

    // Grammar (20 points) - simplified check
    score += 20; // Assume good grammar for now

    const status = getStatus(score);
    const feedback =
        status === 'excellent' ? 'Excellent content quality!' :
            status === 'good' ? 'Good content with minor improvements needed' :
                status === 'fair' ? 'Add more action verbs and metrics' :
                    'Content needs significant improvement';

    return { score, maxScore: 100, status, feedback, actionableItems };
}

// 3. Formatting (0-100)
function calculateFormatting(data: ResumeData): MetricScore {
    let score = 90; // Start high, assume our templates are well-formatted
    const actionableItems: ActionableItem[] = [];

    // Check for consistent bullet formatting
    const allBullets = data.workExperience.flatMap(exp => exp.description);
    const emptyBullets = allBullets.filter(b => !b.trim()).length;

    if (emptyBullets > 0) {
        score -= 10;
        actionableItems.push({
            id: 'formatting-empty',
            title: 'Remove empty bullet points',
            description: `${emptyBullets} empty bullets detected`,
            priority: 'medium',
            sectionId: 'experience',
        });
    }

    const status = getStatus(score);
    const feedback =
        status === 'excellent' ? 'Perfect formatting consistency!' :
            status === 'good' ? 'Good formatting with minor issues' :
                'Formatting needs improvement';

    return { score, maxScore: 100, status, feedback, actionableItems };
}

// 4. Length Optimization (0-100)
function calculateLengthOptimization(data: ResumeData): MetricScore {
    const actionableItems: ActionableItem[] = [];

    // Estimate page count based on content
    const experienceCount = data.workExperience.length;
    const educationCount = data.education.length;
    const skillsCount = data.skills.length;
    const totalBullets = data.workExperience.reduce((sum, exp) => sum + exp.description.filter(b => b.trim()).length, 0);

    // Rough estimate: 1 page = ~5 experience entries or ~15 bullets
    const estimatedPages = Math.max(
        1,
        Math.ceil((experienceCount * 3 + educationCount * 2 + skillsCount * 0.5 + totalBullets * 0.3) / 15)
    );

    let score = 100;
    let feedback = 'Perfect length for your experience level';

    if (estimatedPages > 2) {
        score = Math.max(40, 100 - (estimatedPages - 2) * 20);
        feedback = `Too long (~${estimatedPages} pages) - aim for 1-2 pages`;
        actionableItems.push({
            id: 'length-reduce',
            title: 'Reduce resume length',
            description: `Trim content to reach 1-2 pages (currently ~${estimatedPages} pages)`,
            priority: 'high',
        });
    } else if (estimatedPages < 1 && experienceCount > 0) {
        score = 80;
        feedback = 'Could add more detail to reach 1 full page';
    }

    const status = getStatus(score);
    return { score, maxScore: 100, status, feedback, actionableItems };
}

// 5. Keywords (0-100)
function calculateKeywords(data: ResumeData): MetricScore {
    const actionableItems: ActionableItem[] = [];

    // Count unique skills/keywords
    const keywordCount = data.skills.length;
    const targetKeywords = 15;

    const score = Math.min(100, Math.round((keywordCount / targetKeywords) * 100));

    if (keywordCount < targetKeywords) {
        actionableItems.push({
            id: 'keywords-add',
            title: 'Add more skills/keywords',
            description: `Add ${targetKeywords - keywordCount} more relevant skills`,
            priority: 'medium',
            sectionId: 'skills',
        });
    }

    const status = getStatus(score);
    const feedback =
        status === 'excellent' ? `Excellent! ${keywordCount}/${targetKeywords} keywords` :
            status === 'good' ? `Good keyword coverage (${keywordCount}/${targetKeywords})` :
                `Add ${targetKeywords - keywordCount} more keywords`;

    return { score, maxScore: 100, status, feedback, actionableItems };
}

// 6. Impact & Metrics (0-100)
function calculateImpactMetrics(data: ResumeData): MetricScore {
    const actionableItems: ActionableItem[] = [];

    let totalBullets = 0;
    let bulletsWithMetrics = 0;
    const metricRegex = /\d+%|\$\d+|\d+k|\d+\+|\d+x|by \d+|over \d+|under \d+/i;

    data.workExperience.forEach((exp) => {
        exp.description.forEach((bullet) => {
            if (bullet.trim()) {
                totalBullets++;
                if (metricRegex.test(bullet)) {
                    bulletsWithMetrics++;
                }
            }
        });
    });

    const percentage = totalBullets > 0 ? (bulletsWithMetrics / totalBullets) * 100 : 0;
    const score = Math.round(percentage);

    if (percentage < 60) {
        actionableItems.push({
            id: 'impact-metrics',
            title: 'Add more quantifiable results',
            description: `Add numbers/metrics to ${totalBullets - bulletsWithMetrics} more bullets`,
            priority: 'high',
            sectionId: 'experience',
        });
    }

    const status = getStatus(score);
    const feedback =
        status === 'excellent' ? `Excellent! ${Math.round(percentage)}% of bullets have metrics` :
            status === 'good' ? `Good - ${Math.round(percentage)}% of bullets quantified` :
                `Only ${Math.round(percentage)}% of bullets have metrics`;

    return { score, maxScore: 100, status, feedback, actionableItems };
}

// Main scoring function
export function calculateResumeScore(data: ResumeData): ResumeScore {
    const breakdown = {
        atsCompatibility: calculateATSCompatibility(data),
        contentQuality: calculateContentQuality(data),
        formatting: calculateFormatting(data),
        lengthOptimization: calculateLengthOptimization(data),
        keywords: calculateKeywords(data),
        impactMetrics: calculateImpactMetrics(data),
    };

    // Calculate overall score (weighted average)
    const overall = Math.round(
        (breakdown.atsCompatibility.score * 0.25 +
            breakdown.contentQuality.score * 0.25 +
            breakdown.formatting.score * 0.15 +
            breakdown.lengthOptimization.score * 0.10 +
            breakdown.keywords.score * 0.15 +
            breakdown.impactMetrics.score * 0.10)
    );

    // Collect top recommendations
    const allActionableItems: ActionableItem[] = [
        ...(breakdown.atsCompatibility.actionableItems || []),
        ...(breakdown.contentQuality.actionableItems || []),
        ...(breakdown.formatting.actionableItems || []),
        ...(breakdown.lengthOptimization.actionableItems || []),
        ...(breakdown.keywords.actionableItems || []),
        ...(breakdown.impactMetrics.actionableItems || []),
    ];

    // Sort by priority and take top 5
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    const recommendations: Recommendation[] = allActionableItems
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
        .slice(0, 5)
        .map(item => ({
            id: item.id,
            priority: item.priority,
            title: item.title,
            description: item.description,
            sectionId: item.sectionId,
        }));

    return {
        overall,
        breakdown,
        recommendations,
    };
}
