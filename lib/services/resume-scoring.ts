import { ResumeData } from "@/lib/types/resume";
import { ACTION_VERBS, WEAK_VERBS, CLICHES, SOFT_SKILLS } from "@/lib/ats/dictionaries";

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
        skillsKeywords: MetricScore;
        impactAchievements: MetricScore;
        structureFormatting: MetricScore;
    };
    recommendations: Recommendation[];
}

// Experience level detection based on work history
function detectExperienceLevel(data: ResumeData): 'entry' | 'mid' | 'senior' {
    const totalYears = data.workExperience.reduce((years, exp) => {
        // Rough estimation: each role averages 2 years if no dates
        return years + 2;
    }, 0);

    if (totalYears >= 10 || data.workExperience.length >= 5) return 'senior';
    if (totalYears >= 3 || data.workExperience.length >= 2) return 'mid';
    return 'entry';
}

function getStatus(score: number): ScoreStatus {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
}

// 1. ATS Compatibility (0-100) - Weight: 30%
// Based on 2025 industry standards for ATS parsing and compatibility
function calculateATSCompatibility(data: ResumeData): MetricScore {
    let score = 0;
    const actionableItems: ActionableItem[] = [];

    // Contact info completeness (25 points) - Critical for ATS
    let contactScore = 0;
    if (data.personalInfo.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personalInfo.email)) {
        contactScore += 10;
    } else {
        actionableItems.push({
            id: 'ats-email',
            title: 'Add valid email address',
            description: 'Email is critical for ATS systems to contact you',
            priority: 'high',
            sectionId: 'personal-info',
        });
    }

    if (data.personalInfo.phone && data.personalInfo.phone.length >= 10) {
        contactScore += 8;
    } else {
        actionableItems.push({
            id: 'ats-phone',
            title: 'Add valid phone number',
            description: 'Phone number should be at least 10 digits',
            priority: 'high',
            sectionId: 'personal-info',
        });
    }

    if (data.personalInfo.firstName && data.personalInfo.lastName) {
        contactScore += 5;
    }

    if (data.personalInfo.location) {
        contactScore += 2;
    }
    score += contactScore;

    // Standard section presence (20 points)
    let sectionScore = 0;
    const hasExperience = data.workExperience.length > 0;
    const hasEducation = data.education.length > 0;
    const hasSkills = data.skills.length > 0;

    if (hasExperience) {
        sectionScore += 8;
    } else {
        actionableItems.push({
            id: 'ats-experience',
            title: 'Add work experience',
            description: 'Work experience is required by most ATS systems',
            priority: 'high',
            sectionId: 'experience',
        });
    }

    if (hasEducation) {
        sectionScore += 6;
    } else {
        actionableItems.push({
            id: 'ats-education',
            title: 'Add education',
            description: 'Education section helps ATS categorize your qualifications',
            priority: 'medium',
            sectionId: 'education',
        });
    }

    if (hasSkills) {
        sectionScore += 6;
    } else {
        actionableItems.push({
            id: 'ats-skills',
            title: 'Add skills section',
            description: 'Skills are the primary keyword matching mechanism for ATS',
            priority: 'high',
            sectionId: 'skills',
        });
    }
    score += sectionScore;

    // Keyword density (30 points) - Target: 10-15 relevant keywords
    const keywordCount = data.skills.length;
    const targetMin = 10;
    const targetMax = 15;

    let keywordScore = 0;
    if (keywordCount >= targetMax) {
        keywordScore = 30;
    } else if (keywordCount >= targetMin) {
        keywordScore = 20 + ((keywordCount - targetMin) / (targetMax - targetMin)) * 10;
    } else if (keywordCount >= 5) {
        keywordScore = 10 + ((keywordCount - 5) / (targetMin - 5)) * 10;
    } else {
        keywordScore = (keywordCount / 5) * 10;
        actionableItems.push({
            id: 'ats-keywords-critical',
            title: 'Add more skills/keywords',
            description: `Add ${targetMin - keywordCount} more relevant skills (target: ${targetMin}-${targetMax})`,
            priority: 'high',
            sectionId: 'skills',
        });
    }

    if (keywordCount < targetMin && keywordCount >= 5) {
        actionableItems.push({
            id: 'ats-keywords',
            title: 'Increase keyword coverage',
            description: `Add ${targetMin - keywordCount} more skills to reach optimal range (${targetMin}-${targetMax})`,
            priority: 'medium',
            sectionId: 'skills',
        });
    }
    score += Math.round(keywordScore);

    // Parsing safety (15 points) - Check for common ATS parsing issues
    let parseScore = 15;
    const resumeString = JSON.stringify(data);

    // Check for special characters that break parsers
    const hasSpecialChars = /[\u2022\u2023\u25E6\u2043\u2219]/.test(resumeString);
    if (hasSpecialChars) {
        parseScore -= 5;
        actionableItems.push({
            id: 'ats-special-chars',
            title: 'Remove special characters',
            description: 'Non-standard bullet points or symbols can break ATS parsing',
            priority: 'medium',
        });
    }

    // Check for excessive spacing (table-like formatting)
    if (/\s{4,}/.test(resumeString)) {
        parseScore -= 5;
        actionableItems.push({
            id: 'ats-spacing',
            title: 'Fix spacing issues',
            description: 'Large gaps detected - avoid using multiple spaces to align text',
            priority: 'low',
        });
    }
    score += parseScore;

    // Summary section bonus (10 points)
    if (data.personalInfo.summary && data.personalInfo.summary.length >= 100) {
        score += 10;
    } else if (data.personalInfo.summary && data.personalInfo.summary.length >= 50) {
        score += 5;
        actionableItems.push({
            id: 'ats-summary',
            title: 'Expand professional summary',
            description: 'Add more detail to your summary (target: 100-150 characters)',
            priority: 'low',
            sectionId: 'personal-info',
        });
    } else {
        actionableItems.push({
            id: 'ats-summary-missing',
            title: 'Add professional summary',
            description: 'A keyword-rich summary boosts ATS matching by up to 70%',
            priority: 'medium',
            sectionId: 'personal-info',
        });
    }

    const status = getStatus(score);
    const feedback =
        status === 'excellent' ? 'Excellent ATS compatibility! Your resume will pass most ATS filters' :
            status === 'good' ? 'Good ATS compatibility - minor improvements will boost your score' :
                status === 'fair' ? 'Fair ATS compatibility - add more keywords and complete all sections' :
                    'Poor ATS compatibility - critical elements missing';

    return { score, maxScore: 100, status, feedback, actionableItems };
}

// 2. Content Quality (0-100) - Weight: 25%
// Based on industry benchmarks: 70%+ action verbs, 60%+ metrics, 1-2 line bullets
function calculateContentQuality(data: ResumeData): MetricScore {
    let score = 0;
    const actionableItems: ActionableItem[] = [];

    // Collect all bullets
    let totalBullets = 0;
    let bulletsWithActionVerbs = 0;
    let bulletsWithWeakVerbs = 0;
    let tooLongBullets = 0;
    let tooShortBullets = 0;

    data.workExperience.forEach((exp) => {
        exp.description.forEach((bullet) => {
            const trimmed = bullet.trim();
            if (!trimmed) return;

            totalBullets++;
            const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');

            // Check action verbs
            if (ACTION_VERBS.includes(firstWord)) {
                bulletsWithActionVerbs++;
            } else if (WEAK_VERBS.includes(firstWord)) {
                bulletsWithWeakVerbs++;
            }

            // Check bullet length (1-2 lines = ~80-150 characters)
            if (trimmed.length > 150) tooLongBullets++;
            if (trimmed.length < 40 && trimmed.length > 0) tooShortBullets++;
        });
    });

    if (totalBullets === 0) {
        return {
            score: 0,
            maxScore: 100,
            status: 'poor',
            feedback: 'No bullet points found - add work experience descriptions',
            actionableItems: [{
                id: 'content-empty',
                title: 'Add bullet points',
                description: 'Describe your achievements and responsibilities',
                priority: 'high',
                sectionId: 'experience',
            }],
        };
    }

    // Action verb usage (35 points) - Target: 70%+ per industry standard
    const actionVerbPercentage = (bulletsWithActionVerbs / totalBullets) * 100;
    let actionVerbScore = 0;

    if (actionVerbPercentage >= 70) {
        actionVerbScore = 35;
    } else if (actionVerbPercentage >= 50) {
        actionVerbScore = 25;
        actionableItems.push({
            id: 'content-action-verbs-improve',
            title: 'Increase action verb usage',
            description: `${Math.round(actionVerbPercentage)}% of bullets use action verbs. Target: 70%+`,
            priority: 'medium',
            sectionId: 'experience',
        });
    } else {
        actionVerbScore = Math.round((actionVerbPercentage / 70) * 35);
        actionableItems.push({
            id: 'content-action-verbs',
            title: 'Start bullets with strong action verbs',
            description: `Only ${Math.round(actionVerbPercentage)}% use action verbs. Use words like "Led", "Developed", "Increased"`,
            priority: 'high',
            sectionId: 'experience',
        });
    }

    if (bulletsWithWeakVerbs > 0) {
        actionableItems.push({
            id: 'content-weak-verbs',
            title: 'Replace weak verbs',
            description: `${bulletsWithWeakVerbs} bullets use weak verbs like "helped" or "worked on"`,
            priority: 'medium',
            sectionId: 'experience',
        });
    }
    score += actionVerbScore;

    // Bullet length optimization (25 points) - Target: 80-150 characters
    const wellFormedBullets = totalBullets - tooLongBullets - tooShortBullets;
    const lengthPercentage = (wellFormedBullets / totalBullets) * 100;
    const lengthScore = Math.round((lengthPercentage / 100) * 25);

    if (tooLongBullets > 0) {
        actionableItems.push({
            id: 'content-long-bullets',
            title: 'Shorten bullet points',
            description: `${tooLongBullets} bullets are too long (>150 chars). Keep bullets to 1-2 lines`,
            priority: 'medium',
            sectionId: 'experience',
        });
    }

    if (tooShortBullets > 0) {
        actionableItems.push({
            id: 'content-short-bullets',
            title: 'Add more detail to bullets',
            description: `${tooShortBullets} bullets are too brief. Add context and impact`,
            priority: 'low',
            sectionId: 'experience',
        });
    }
    score += lengthScore;

    // Cliché detection (20 points)
    let clicheScore = 20;
    const fullText = data.workExperience
        .flatMap(exp => exp.description)
        .join(' ')
        .toLowerCase();

    const foundCliches: string[] = [];
    CLICHES.forEach(cliche => {
        if (fullText.includes(cliche.toLowerCase())) {
            foundCliches.push(cliche);
        }
    });

    if (foundCliches.length > 0) {
        clicheScore = Math.max(0, 20 - (foundCliches.length * 5));
        actionableItems.push({
            id: 'content-cliches',
            title: 'Remove clichés and buzzwords',
            description: `Avoid phrases like "${foundCliches.slice(0, 3).join('", "')}". Be specific instead`,
            priority: 'medium',
            sectionId: 'experience',
        });
    }
    score += clicheScore;

    // Repetition check (20 points)
    const startWords = data.workExperience
        .flatMap(exp => exp.description)
        .filter(b => b.trim())
        .map(b => b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, ''));

    const wordCounts = new Map<string, number>();
    startWords.forEach(w => wordCounts.set(w, (wordCounts.get(w) || 0) + 1));
    const repeatedWords = Array.from(wordCounts.entries()).filter(([_, count]) => count > 2);

    let repetitionScore = 20;
    if (repeatedWords.length > 0) {
        repetitionScore = Math.max(10, 20 - (repeatedWords.length * 3));
        actionableItems.push({
            id: 'content-repetition',
            title: 'Vary your vocabulary',
            description: `You start ${repeatedWords.length} bullets with the same words. Use synonyms`,
            priority: 'low',
            sectionId: 'experience',
        });
    }
    score += repetitionScore;

    const status = getStatus(score);
    const feedback =
        status === 'excellent' ? 'Outstanding content quality! Strong, varied, and impactful writing' :
            status === 'good' ? 'Good content quality - minor improvements will make it excellent' :
                status === 'fair' ? 'Fair content - focus on action verbs and removing clichés' :
                    'Content needs work - start bullets with strong action verbs';

    return { score, maxScore: 100, status, feedback, actionableItems };
}

// 3. Skills & Keywords (0-100) - Weight: 20%
// Based on skills-first hiring trend and ATS keyword matching
function calculateSkillsKeywords(data: ResumeData): MetricScore {
    let score = 0;
    const actionableItems: ActionableItem[] = [];

    const skills = data.skills;
    const totalSkills = skills.length;

    if (totalSkills === 0) {
        return {
            score: 0,
            maxScore: 100,
            status: 'poor',
            feedback: 'No skills listed - this is critical for ATS matching',
            actionableItems: [{
                id: 'skills-none',
                title: 'Add skills section',
                description: 'Add at least 10-15 relevant hard skills',
                priority: 'high',
                sectionId: 'skills',
            }],
        };
    }

    // Hard skills count (50 points) - Target: 10-15 minimum
    const targetMin = 10;
    const targetOptimal = 15;

    let hardSkillCount = 0;
    let softSkillCount = 0;

    skills.forEach(skill => {
        if (SOFT_SKILLS.includes(skill.name.toLowerCase())) {
            softSkillCount++;
        } else {
            hardSkillCount++;
        }
    });

    let hardSkillScore = 0;
    if (hardSkillCount >= targetOptimal) {
        hardSkillScore = 50;
    } else if (hardSkillCount >= targetMin) {
        hardSkillScore = 35 + ((hardSkillCount - targetMin) / (targetOptimal - targetMin)) * 15;
    } else if (hardSkillCount >= 5) {
        hardSkillScore = 20 + ((hardSkillCount - 5) / (targetMin - 5)) * 15;
    } else {
        hardSkillScore = (hardSkillCount / 5) * 20;
        actionableItems.push({
            id: 'skills-critical',
            title: 'Add more hard skills',
            description: `Only ${hardSkillCount} hard skills listed. Add ${targetMin - hardSkillCount} more technical/job-specific skills`,
            priority: 'high',
            sectionId: 'skills',
        });
    }

    if (hardSkillCount < targetMin && hardSkillCount >= 5) {
        actionableItems.push({
            id: 'skills-low',
            title: 'Increase hard skills',
            description: `Add ${targetMin - hardSkillCount} more hard skills to reach optimal range (${targetMin}-${targetOptimal})`,
            priority: 'medium',
            sectionId: 'skills',
        });
    }
    score += Math.round(hardSkillScore);

    // Soft vs hard skill ratio (30 points) - Max 30% soft skills
    const softSkillRatio = totalSkills > 0 ? (softSkillCount / totalSkills) : 0;
    let balanceScore = 0;

    if (softSkillRatio <= 0.3) {
        balanceScore = 30;
    } else if (softSkillRatio <= 0.5) {
        balanceScore = 15;
        actionableItems.push({
            id: 'skills-soft-high',
            title: 'Too many soft skills',
            description: `${Math.round(softSkillRatio * 100)}% are soft skills. Focus on hard/technical skills instead`,
            priority: 'medium',
            sectionId: 'skills',
        });
    } else {
        balanceScore = 5;
        actionableItems.push({
            id: 'skills-soft-critical',
            title: 'Replace soft skills with hard skills',
            description: 'Soft skills like "teamwork" should be demonstrated in bullets, not listed',
            priority: 'high',
            sectionId: 'skills',
        });
    }
    score += balanceScore;

    // Skill diversity (20 points) - Check for duplicates and variety
    const uniqueSkills = new Set(skills.map(s => s.name.toLowerCase()));
    let diversityScore = 20;

    if (uniqueSkills.size < skills.length) {
        diversityScore = 10;
        actionableItems.push({
            id: 'skills-duplicates',
            title: 'Remove duplicate skills',
            description: `${skills.length - uniqueSkills.size} duplicate skill(s) found`,
            priority: 'low',
            sectionId: 'skills',
        });
    }

    score += diversityScore;

    const status = getStatus(score);
    const feedback =
        status === 'excellent' ? `Excellent skill profile! ${hardSkillCount} hard skills with good balance` :
            status === 'good' ? `Good skills section - ${hardSkillCount} hard skills listed` :
                status === 'fair' ? `Fair - add more hard skills (currently ${hardSkillCount})` :
                    `Weak skills section - add ${targetMin - hardSkillCount} more hard skills`;

    return { score, maxScore: 100, status, feedback, actionableItems };
}

// 4. Impact & Achievements (0-100) - Weight: 15%
// Based on 60%+ metrics benchmark and result-oriented language
function calculateImpactAchievements(data: ResumeData): MetricScore {
    let score = 0;
    const actionableItems: ActionableItem[] = [];

    let totalBullets = 0;
    let bulletsWithMetrics = 0;
    let bulletsWithStrongMetrics = 0;

    // Enhanced metric regex - captures more types of quantifiable data
    const basicMetricRegex = /\d+%|\$[\d,]+|\d+k\+?|\d+\+|by \d+|over \d+|under \d+/i;
    const strongMetricRegex = /(\d+%|increased by \d+|decreased by \d+|saved \$|generated \$|reduced .* by \d+|improved .* by \d+)/i;

    data.workExperience.forEach((exp) => {
        exp.description.forEach((bullet) => {
            const trimmed = bullet.trim();
            if (!trimmed) return;

            totalBullets++;

            if (basicMetricRegex.test(trimmed)) {
                bulletsWithMetrics++;

                if (strongMetricRegex.test(trimmed)) {
                    bulletsWithStrongMetrics++;
                }
            }
        });
    });

    if (totalBullets === 0) {
        return {
            score: 0,
            maxScore: 100,
            status: 'poor',
            feedback: 'No work experience bullets to evaluate',
            actionableItems: [{
                id: 'impact-no-bullets',
                title: 'Add work experience descriptions',
                description: 'Describe your achievements with quantifiable results',
                priority: 'high',
                sectionId: 'experience',
            }],
        };
    }

    // Metrics usage (70 points) - Target: 60%+ per industry standard
    const metricsPercentage = (bulletsWithMetrics / totalBullets) * 100;
    let metricsScore = 0;

    if (metricsPercentage >= 60) {
        metricsScore = 70;
    } else if (metricsPercentage >= 40) {
        metricsScore = 50;
        actionableItems.push({
            id: 'impact-metrics-improve',
            title: 'Add more quantifiable results',
            description: `${Math.round(metricsPercentage)}% of bullets have metrics. Target: 60%+`,
            priority: 'medium',
            sectionId: 'experience',
        });
    } else if (metricsPercentage > 0) {
        metricsScore = Math.round((metricsPercentage / 60) * 70);
        actionableItems.push({
            id: 'impact-metrics-low',
            title: 'Add metrics to more bullets',
            description: `Only ${Math.round(metricsPercentage)}% have numbers. Add %, $, or counts to ${totalBullets - bulletsWithMetrics} more bullets`,
            priority: 'high',
            sectionId: 'experience',
        });
    } else {
        actionableItems.push({
            id: 'impact-metrics-none',
            title: 'Add quantifiable metrics',
            description: 'No metrics found. Use numbers to show impact (e.g., "Increased sales by 25%")',
            priority: 'high',
            sectionId: 'experience',
        });
    }
    score += metricsScore;

    // Strong metrics bonus (20 points) - Reward impact-focused language
    const strongMetricsPercentage = (bulletsWithStrongMetrics / totalBullets) * 100;
    const strongMetricsScore = Math.round((strongMetricsPercentage / 60) * 20);
    score += strongMetricsScore;

    // Career progression (10 points) - Check for growth indicators
    let progressionScore = 0;
    const hasMultipleRoles = data.workExperience.length >= 2;

    if (hasMultipleRoles) {
        progressionScore = 10;
    } else if (data.workExperience.length === 1) {
        progressionScore = 5;
    }
    score += progressionScore;

    const status = getStatus(score);
    const feedback =
        status === 'excellent' ? `Excellent! ${Math.round(metricsPercentage)}% of bullets show quantifiable impact` :
            status === 'good' ? `Good impact demonstration - ${Math.round(metricsPercentage)}% of bullets have metrics` :
                status === 'fair' ? `Fair - only ${Math.round(metricsPercentage)}% of bullets are quantified` :
                    `Weak impact - add numbers and metrics to show results`;

    return { score, maxScore: 100, status, feedback, actionableItems };
}

// 5. Structure & Formatting (0-100) - Weight: 10%
// Combines length optimization and bullet count optimization per experience level
function calculateStructureFormatting(data: ResumeData): MetricScore {
    let score = 0;
    const actionableItems: ActionableItem[] = [];

    const experienceLevel = detectExperienceLevel(data);

    // Bullet count per job optimization (50 points)
    // Entry: 3-5, Mid: 5-7, Senior: 7-10
    const bulletTargets = {
        entry: { min: 3, max: 5 },
        mid: { min: 5, max: 7 },
        senior: { min: 7, max: 10 },
    };

    const target = bulletTargets[experienceLevel];
    let bulletOptimizationScore = 0;
    let jobsNeedingAdjustment = 0;

    data.workExperience.forEach((exp, index) => {
        const bulletCount = exp.description.filter(b => b.trim()).length;

        if (bulletCount >= target.min && bulletCount <= target.max) {
            bulletOptimizationScore += (50 / Math.max(data.workExperience.length, 1));
        } else if (bulletCount < target.min) {
            jobsNeedingAdjustment++;
        } else if (bulletCount > target.max) {
            jobsNeedingAdjustment++;
        }
    });

    if (jobsNeedingAdjustment > 0) {
        const isRecent = true; // Assume first jobs are most recent
        actionableItems.push({
            id: 'structure-bullets',
            title: `Optimize bullet count for ${experienceLevel}-level`,
            description: `Target ${target.min}-${target.max} bullets per job (${jobsNeedingAdjustment} job(s) need adjustment)`,
            priority: 'medium',
            sectionId: 'experience',
        });
    }
    score += Math.round(bulletOptimizationScore);

    // Resume length optimization (30 points)
    const experienceCount = data.workExperience.length;
    const educationCount = data.education.length;
    const totalBullets = data.workExperience.reduce((sum, exp) =>
        sum + exp.description.filter(b => b.trim()).length, 0
    );

    // Rough page estimate
    const estimatedPages = Math.max(1,
        Math.ceil((experienceCount * 2 + educationCount * 1.5 + totalBullets * 0.25) / 12)
    );

    let lengthScore = 30;
    const targetPages = experienceLevel === 'senior' ? 2 : experienceLevel === 'mid' ? 2 : 1;

    if (estimatedPages > targetPages + 1) {
        lengthScore = 10;
        actionableItems.push({
            id: 'structure-length-long',
            title: 'Resume is too long',
            description: `Estimated ~${estimatedPages} pages. Target: ${targetPages} page(s) for ${experienceLevel}-level`,
            priority: 'high',
        });
    } else if (estimatedPages > targetPages) {
        lengthScore = 20;
        actionableItems.push({
            id: 'structure-length-slightly-long',
            title: 'Reduce resume length slightly',
            description: `Target ${targetPages} page(s), currently ~${estimatedPages}`,
            priority: 'medium',
        });
    } else if (estimatedPages < 1 && experienceCount > 0) {
        lengthScore = 20;
        actionableItems.push({
            id: 'structure-length-short',
            title: 'Add more detail',
            description: 'Resume seems sparse - add more bullet points to describe achievements',
            priority: 'low',
            sectionId: 'experience',
        });
    }
    score += lengthScore;

    // Formatting consistency (20 points)
    let formattingScore = 20;
    const allBullets = data.workExperience.flatMap(exp => exp.description);
    const emptyBullets = allBullets.filter(b => !b.trim()).length;

    if (emptyBullets > 0) {
        formattingScore = 10;
        actionableItems.push({
            id: 'structure-empty-bullets',
            title: 'Remove empty bullet points',
            description: `${emptyBullets} empty bullet(s) detected`,
            priority: 'medium',
            sectionId: 'experience',
        });
    }
    score += formattingScore;

    const status = getStatus(score);
    const feedback =
        status === 'excellent' ? `Perfect structure for ${experienceLevel}-level resume!` :
            status === 'good' ? `Good structure - minor formatting improvements needed` :
                status === 'fair' ? `Fair structure - adjust bullet count and length` :
                    `Poor structure - optimize bullet count and resume length`;

    return { score, maxScore: 100, status, feedback, actionableItems };
}

// Main scoring function with 2025 industry-standard weights
export function calculateResumeScore(data: ResumeData): ResumeScore {
    const breakdown = {
        atsCompatibility: calculateATSCompatibility(data),          // 30%
        contentQuality: calculateContentQuality(data),              // 25%
        skillsKeywords: calculateSkillsKeywords(data),              // 20%
        impactAchievements: calculateImpactAchievements(data),      // 15%
        structureFormatting: calculateStructureFormatting(data),    // 10%
    };

    // Calculate overall score with weighted average based on 2025 industry standards
    // ATS Compatibility: 30% - Most critical for initial screening
    // Content Quality: 25% - Second priority for human review
    // Skills & Keywords: 20% - Skills-first hiring trend
    // Impact & Achievements: 15% - Demonstrating value
    // Structure & Formatting: 10% - Foundation elements
    const overall = Math.round(
        (breakdown.atsCompatibility.score * 0.30) +
        (breakdown.contentQuality.score * 0.25) +
        (breakdown.skillsKeywords.score * 0.20) +
        (breakdown.impactAchievements.score * 0.15) +
        (breakdown.structureFormatting.score * 0.10)
    );

    // Collect all actionable items from each category
    const allActionableItems: ActionableItem[] = [
        ...(breakdown.atsCompatibility.actionableItems || []),
        ...(breakdown.contentQuality.actionableItems || []),
        ...(breakdown.skillsKeywords.actionableItems || []),
        ...(breakdown.impactAchievements.actionableItems || []),
        ...(breakdown.structureFormatting.actionableItems || []),
    ];

    // Sort by priority (high > medium > low) and take top 5 recommendations
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
