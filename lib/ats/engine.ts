import { ResumeData } from "@/lib/types/resume";
import { ACTION_VERBS, WEAK_VERBS, SOFT_SKILLS, STOP_WORDS, CLICHES, SKILL_CLUSTERS, SYNONYMS } from "./dictionaries";

export interface Issue {
    id: string;
    type: 'critical' | 'warning' | 'success';
    message: string;
    suggestion?: string;
}

export interface CategoryResult {
    score: number;
    maxScore: number;
    issues: Issue[];
}

export interface KeywordDensity {
    keyword: string;
    count: number;
    density: number; // percentage
    status: 'low' | 'optimal' | 'high';
}

export interface ATSResult {
    totalScore: number;
    breakdown: {
        contact: CategoryResult;
        structure: CategoryResult;
        content: CategoryResult;
        skills: CategoryResult;
        jobMatch?: CategoryResult;
        parsingSafety: CategoryResult;
    };
    issues: Issue[];
    keywordDensity?: KeywordDensity[];
}

export class ATSAnalyzer {
    private data: ResumeData;
    private jobDescription?: string;

    constructor(data: ResumeData, jobDescription?: string) {
        this.data = data;
        this.jobDescription = jobDescription;
    }

    public analyze(): ATSResult {
        const contact = this.analyzeContact();
        const structure = this.analyzeStructure();
        const content = this.analyzeContent();
        const skills = this.analyzeSkills();
        const parsingSafety = this.analyzeParsingSafety();

        let jobMatch: CategoryResult | undefined;
        let keywordDensity: KeywordDensity[] | undefined;

        if (this.jobDescription) {
            jobMatch = this.analyzeJobMatch();
            keywordDensity = this.analyzeKeywordDensity();
        }

        const totalScore = this.calculateTotalScore(contact, structure, content, skills, parsingSafety, jobMatch);
        const issues = [
            ...contact.issues,
            ...structure.issues,
            ...content.issues,
            ...skills.issues,
            ...parsingSafety.issues,
            ...(jobMatch?.issues || [])
        ];

        return {
            totalScore,
            breakdown: {
                contact,
                structure,
                content,
                skills,
                jobMatch,
                parsingSafety
            },
            issues,
            keywordDensity
        };
    }

    private calculateTotalScore(
        contact: CategoryResult,
        structure: CategoryResult,
        content: CategoryResult,
        skills: CategoryResult,
        parsingSafety: CategoryResult,
        jobMatch?: CategoryResult
    ): number {
        let total = 0;

        if (jobMatch) {
            // Weighted scoring with JD:
            // Contact: 5%, Structure: 10%, Content: 25%, Skills: 20%, Parsing: 10%, Job Match: 30%
            total += (contact.score / contact.maxScore) * 5;
            total += (structure.score / structure.maxScore) * 10;
            total += (content.score / content.maxScore) * 25;
            total += (skills.score / skills.maxScore) * 20;
            total += (parsingSafety.score / parsingSafety.maxScore) * 10;
            total += (jobMatch.score / jobMatch.maxScore) * 30;
        } else {
            // Standard scoring:
            // Contact: 15%, Structure: 15%, Content: 35%, Skills: 25%, Parsing: 10%
            total += (contact.score / contact.maxScore) * 15;
            total += (structure.score / structure.maxScore) * 15;
            total += (content.score / content.maxScore) * 35;
            total += (skills.score / skills.maxScore) * 25;
            total += (parsingSafety.score / parsingSafety.maxScore) * 10;
        }

        return Math.round(total);
    }

    private analyzeKeywordDensity(): KeywordDensity[] {
        if (!this.jobDescription) return [];

        const jdKeywords = this.extractKeywords(this.jobDescription);
        const resumeText = JSON.stringify(this.data).toLowerCase();
        const totalWords = resumeText.split(/\s+/).length;

        // Get top 5 keywords from JD
        const topKeywords = Array.from(jdKeywords.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);

        return topKeywords.map(keyword => {
            // Count occurrences in resume (simple regex)
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            const count = (resumeText.match(regex) || []).length;
            const density = (count / totalWords) * 100;

            let status: 'low' | 'optimal' | 'high' = 'optimal';
            if (density < 1) status = 'low';
            if (density > 4) status = 'high';

            return { keyword, count, density, status };
        });
    }

    private analyzeParsingSafety(): CategoryResult {
        let score = 0;
        const maxScore = 20;
        const issues: Issue[] = [];

        // 1. Check for special characters that break parsers
        const unsafeChars = /[^a-zA-Z0-9\s.,@\-()\/&]/;
        const resumeString = JSON.stringify(this.data);

        // We allow some standard punctuation, but check for weird unicode
        // This is a simplified check. 
        // A better check is looking for specific "bad" characters often pasted from Word
        const badChars = /[\u2022\u2023\u25E6\u2043\u2219]/; // Non-standard bullets

        if (badChars.test(resumeString)) {
            issues.push({
                id: 'parse-chars',
                type: 'warning',
                message: 'Non-standard characters detected.',
                suggestion: 'Avoid using fancy bullet points or symbols. Use standard "-" or "*".'
            });
        } else {
            score += 10;
            issues.push({ id: 'parse-chars-ok', type: 'success', message: 'Text is parser-friendly.' });
        }

        // 2. Check Date Formats
        // Ideally "MM/YYYY" or "Month Year"
        // We check if dates in experience look standard
        let hasBadDates = false;
        this.data.workExperience.forEach(exp => {
            if (exp.startDate && !/^\d{4}(-\d{2})?$|^[A-Za-z]+ \d{4}$/.test(exp.startDate)) {
                // Very loose check, just looking for obvious non-dates if they typed free text
                // Actually, the form enforces some format, but let's assume free text input possibility
            }
        });

        // 3. Check for "Table-like" spacing
        // Users often use multiple spaces to align text, which breaks parsing
        if (/\s{4,}/.test(resumeString)) {
            issues.push({
                id: 'parse-spacing',
                type: 'warning',
                message: 'Large gaps detected.',
                suggestion: 'Avoid using multiple spaces or tabs to align text. It breaks ATS parsing.'
            });
        } else {
            score += 10;
        }

        return { score, maxScore, issues };
    }

    private analyzeJobMatch(): CategoryResult {
        let score = 0;
        const maxScore = 100;
        const issues: Issue[] = [];

        if (!this.jobDescription) return { score: 0, maxScore, issues: [] };

        // Extract keywords from JD
        const jdWords = this.extractKeywords(this.jobDescription);
        const resumeText = JSON.stringify(this.data).toLowerCase();

        // Find missing keywords
        const missingKeywords: string[] = [];
        let matchCount = 0;

        // Get top 20 most frequent keywords from JD
        const topKeywords = Array.from(jdWords.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([word]) => word);

        topKeywords.forEach(keyword => {
            if (resumeText.includes(keyword)) {
                matchCount++;
            } else {
                missingKeywords.push(keyword);
            }
        });

        const matchRatio = matchCount / topKeywords.length;
        score = Math.round(matchRatio * 100);

        if (score >= 80) {
            issues.push({ id: 'jd-match-great', type: 'success', message: 'Excellent match with Job Description!' });
        } else if (score >= 50) {
            issues.push({
                id: 'jd-match-ok',
                type: 'warning',
                message: 'Moderate match with Job Description.',
                suggestion: `Consider adding these keywords: ${missingKeywords.slice(0, 5).join(', ')}`
            });
        } else {
            issues.push({
                id: 'jd-match-poor',
                type: 'critical',
                message: 'Low match with Job Description.',
                suggestion: `Missing critical keywords: ${missingKeywords.slice(0, 5).join(', ')}`
            });
        }

        return { score, maxScore, issues };
    }

    private extractKeywords(text: string): Map<string, number> {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2 && !STOP_WORDS.includes(w));

        const frequency = new Map<string, number>();
        words.forEach(w => {
            frequency.set(w, (frequency.get(w) || 0) + 1);
        });

        return frequency;
    }

    private analyzeContact(): CategoryResult {
        let score = 0;
        const maxScore = 20;
        const issues: Issue[] = [];
        const { personalInfo } = this.data;

        // Email (Critical) - 8 pts
        if (personalInfo.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
            score += 8;
            issues.push({ id: 'c-email-ok', type: 'success', message: 'Valid email address found.' });
        } else {
            issues.push({
                id: 'c-email-missing',
                type: 'critical',
                message: 'Missing or invalid email address.',
                suggestion: 'Add a professional email address (e.g., gmail.com).'
            });
        }

        // Phone (Critical) - 6 pts
        if (personalInfo.phone && personalInfo.phone.length >= 10) {
            score += 6;
            issues.push({ id: 'c-phone-ok', type: 'success', message: 'Valid phone number found.' });
        } else {
            issues.push({
                id: 'c-phone-missing',
                type: 'critical',
                message: 'Missing or invalid phone number.',
                suggestion: 'Add a phone number with at least 10 digits.'
            });
        }

        // Location (Important) - 4 pts
        if (personalInfo.location) {
            score += 4;
            issues.push({ id: 'c-loc-ok', type: 'success', message: 'Location found.' });
        } else {
            issues.push({
                id: 'c-loc-missing',
                type: 'warning',
                message: 'Location is missing.',
                suggestion: 'Add your City and State/Country (e.g., New York, NY).'
            });
        }

        // LinkedIn (Bonus) - 2 pts
        if (personalInfo.linkedin) {
            score += 2;
            issues.push({ id: 'c-linkedin-ok', type: 'success', message: 'LinkedIn profile linked.' });
        } else {
            issues.push({
                id: 'c-linkedin-missing',
                type: 'warning',
                message: 'LinkedIn profile not found.',
                suggestion: 'Adding a LinkedIn URL can increase credibility.'
            });
        }

        return { score, maxScore, issues };
    }

    private analyzeStructure(): CategoryResult {
        let score = 0;
        const maxScore = 20;
        const issues: Issue[] = [];

        // Sections Presence
        const hasExperience = this.data.workExperience.length > 0;
        const hasEducation = this.data.education.length > 0;
        const hasSkills = this.data.skills.length > 0;

        if (hasExperience) score += 8;
        else issues.push({ id: 's-exp-missing', type: 'critical', message: 'Missing Work Experience section.' });

        if (hasEducation) score += 6;
        else issues.push({ id: 's-edu-missing', type: 'warning', message: 'Missing Education section.' });

        if (hasSkills) score += 6;
        else issues.push({ id: 's-skills-missing', type: 'warning', message: 'Missing Skills section.' });

        if (hasExperience && hasEducation && hasSkills) {
            issues.push({ id: 's-ok', type: 'success', message: 'All key sections present.' });
        }

        return { score, maxScore, issues };
    }

    private analyzeContent(): CategoryResult {
        let score = 0;
        const maxScore = 40;
        const issues: Issue[] = [];

        const bullets: string[] = [];
        this.data.workExperience.forEach((role) => {
            if (role.description && Array.isArray(role.description)) {
                bullets.push(...role.description);
            }
        });

        if (bullets.length === 0) {
            issues.push({ id: 'cnt-empty', type: 'critical', message: 'No bullet points found in experience.' });
            return { score: 0, maxScore, issues };
        }

        // Action Verbs (15 pts)
        let actionVerbCount = 0;
        const startWords: string[] = [];

        bullets.forEach((bullet: string) => {
            const firstWord = bullet.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
            startWords.push(firstWord);
            if (ACTION_VERBS.includes(firstWord)) {
                actionVerbCount++;
            }
        });

        const actionVerbRatio = actionVerbCount / bullets.length;
        if (actionVerbRatio >= 0.7) {
            score += 15;
            issues.push({ id: 'cnt-verbs-great', type: 'success', message: 'Great use of action verbs!' });
        } else if (actionVerbRatio >= 0.4) {
            score += 8;
            issues.push({
                id: 'cnt-verbs-ok',
                type: 'warning',
                message: 'Could use more action verbs.',
                suggestion: `Only ${Math.round(actionVerbRatio * 100)}% of bullets start with action verbs. Aim for 70%+.`
            });
        } else {
            issues.push({
                id: 'cnt-verbs-bad',
                type: 'critical',
                message: 'Weak bullet points.',
                suggestion: 'Start sentences with strong verbs like "Led", "Developed", "Created".'
            });
        }

        // Metrics / Numbers (15 pts)
        let metricCount = 0;
        const metricRegex = /\d+%|\$\d+|\d+k|\d+\+|\d+x/i;
        bullets.forEach((bullet: string) => {
            if (metricRegex.test(bullet)) {
                metricCount++;
            }
        });

        const metricRatio = metricCount / bullets.length;
        if (metricRatio >= 0.3) { // 1 in 3 bullets has a metric
            score += 15;
            issues.push({ id: 'cnt-metrics-great', type: 'success', message: 'Good use of quantifiable results.' });
        } else if (metricCount > 0) {
            score += 8;
            issues.push({
                id: 'cnt-metrics-ok',
                type: 'warning',
                message: 'Add more metrics.',
                suggestion: 'Try to quantify your achievements (e.g., "Increased sales by 20%").'
            });
        } else {
            issues.push({
                id: 'cnt-metrics-bad',
                type: 'critical',
                message: 'No metrics found.',
                suggestion: 'ATS systems love numbers. Add percentages, dollar amounts, or counts.'
            });
        }

        // Advanced Content Analysis (10 pts)
        // 1. Repetition Check
        const wordCounts = new Map<string, number>();
        startWords.forEach(w => wordCounts.set(w, (wordCounts.get(w) || 0) + 1));
        const repeatedWords = Array.from(wordCounts.entries()).filter(([_, count]) => count > 2);

        if (repeatedWords.length > 0) {
            issues.push({
                id: 'cnt-repetition',
                type: 'warning',
                message: 'Repetitive sentence starters.',
                suggestion: `You start multiple bullets with: "${repeatedWords.map(w => w[0]).join(', ')}". Try varying your vocabulary.`
            });
        } else {
            score += 5;
        }

        // 2. Cliché Check
        let clicheCount = 0;
        const foundCliches: string[] = [];
        const fullText = bullets.join(' ').toLowerCase();

        CLICHES.forEach(cliche => {
            if (fullText.includes(cliche)) {
                clicheCount++;
                foundCliches.push(cliche);
            }
        });

        if (clicheCount > 0) {
            issues.push({
                id: 'cnt-cliche',
                type: 'warning',
                message: 'Avoid using clichés.',
                suggestion: `Found: "${foundCliches.slice(0, 3).join(', ')}". Be specific instead.`
            });
        } else {
            score += 5;
        }

        return { score, maxScore, issues };
    }

    private analyzeSkills(): CategoryResult {
        let score = 0;
        const maxScore = 20;
        const issues: Issue[] = [];
        const skills = this.data.skills;

        if (skills.length === 0) {
            return { score: 0, maxScore, issues };
        }

        // Check for Soft Skills overuse
        let softSkillCount = 0;
        skills.forEach((skill) => {
            if (SOFT_SKILLS.includes(skill.name.toLowerCase())) {
                softSkillCount++;
            }
        });

        const softSkillRatio = softSkillCount / skills.length;

        if (softSkillRatio > 0.4) {
            score += 10; // Penalize slightly
            issues.push({
                id: 'skl-soft-high',
                type: 'warning',
                message: 'Too many soft skills.',
                suggestion: 'Focus on hard/technical skills. Soft skills are better demonstrated in bullet points.'
            });
        } else {
            score += 20;
            issues.push({ id: 'skl-ok', type: 'success', message: 'Good balance of hard skills.' });
        }

        // Check for repetition
        const uniqueSkills = new Set(skills.map((s) => s.name.toLowerCase()));
        if (uniqueSkills.size < skills.length) {
            issues.push({
                id: 'skl-dup',
                type: 'warning',
                message: 'Duplicate skills detected.',
                suggestion: 'Remove duplicate skill entries.'
            });
        }

        // Semantic Analysis (Skill Clusters)
        const resumeSkillNames = new Set(skills.map(s => s.name.toLowerCase()));
        let semanticBonus = 0;

        Object.entries(SKILL_CLUSTERS).forEach(([trigger, related]) => {
            if (resumeSkillNames.has(trigger)) {
                // User has the trigger skill (e.g., React)
                // Check how many related skills they have
                const missingRelated = related.filter(r => !resumeSkillNames.has(r));

                if (missingRelated.length > 0 && missingRelated.length < related.length) {
                    // They have some but not all. Suggest the missing ones.
                    // We only suggest if they have at least one related skill missing, 
                    // but we don't want to spam.
                    // Let's only suggest if they are missing > 50% of the cluster? 
                    // Or just suggest the top 3 missing.

                    // Only add issue if we haven't added too many semantic issues
                    if (issues.filter(i => i.id.startsWith('sem-')).length < 2) {
                        issues.push({
                            id: `sem-${trigger}`,
                            type: 'warning',
                            message: `Enhance your ${trigger} profile.`,
                            suggestion: `Consider adding related skills: ${missingRelated.slice(0, 3).join(', ')}.`
                        });
                    }
                } else if (missingRelated.length === 0) {
                    semanticBonus += 5; // Bonus for complete cluster
                }
            }
        });

        // Cap score at maxScore
        score = Math.min(score + semanticBonus, maxScore);

        return { score, maxScore, issues };
    }
}
