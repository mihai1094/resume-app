/**
 * Resume Readiness Service
 *
 * A checklist-based approach to resume evaluation that provides:
 * - Binary pass/fail criteria for required checks
 * - Actionable recommendations for improvements
 * - Honest, specific feedback without misleading scores
 *
 * This replaces the arbitrary weighted scoring system with
 * clear, verifiable criteria that users can act on.
 */

import { ResumeData } from "@/lib/types/resume";
import { ACTION_VERBS, WEAK_VERBS } from "@/lib/ats/dictionaries";

export type CheckStatus = 'pass' | 'fail' | 'warning';
export type CheckPriority = 'required' | 'recommended';
export type CheckCategory = 'contact' | 'experience' | 'education' | 'skills' | 'content' | 'formatting';

export interface ReadinessCheck {
  id: string;
  category: CheckCategory;
  label: string;
  status: CheckStatus;
  priority: CheckPriority;
  message: string;
  detail?: string;
  fixAction?: {
    sectionId: string;
    label: string;
  };
}

export interface ReadinessSummary {
  required: { passed: number; total: number };
  recommended: { passed: number; total: number };
}

export interface ReadinessResult {
  checks: ReadinessCheck[];
  summary: ReadinessSummary;
  isReady: boolean;
}

/**
 * Analyze resume and return checklist-based readiness result
 */
export function analyzeResumeReadiness(data: ResumeData): ReadinessResult {
  const checks: ReadinessCheck[] = [];

  // === REQUIRED CHECKS ===

  // 1. Contact Information Complete
  const hasEmail = Boolean(data.personalInfo.email?.trim());
  const hasPhone = Boolean(data.personalInfo.phone?.trim());
  const hasLocation = Boolean(data.personalInfo.location?.trim());
  const hasName = Boolean(data.personalInfo.firstName?.trim() && data.personalInfo.lastName?.trim());
  const contactComplete = hasEmail && hasPhone && hasName;

  const missingContact: string[] = [];
  if (!hasName) missingContact.push('name');
  if (!hasEmail) missingContact.push('email');
  if (!hasPhone) missingContact.push('phone');
  if (!hasLocation) missingContact.push('location');

  checks.push({
    id: 'contact-complete',
    category: 'contact',
    label: 'Contact information complete',
    status: contactComplete ? 'pass' : 'fail',
    priority: 'required',
    message: contactComplete
      ? 'Email, phone, and name are present'
      : `Missing: ${missingContact.join(', ')}`,
    fixAction: !contactComplete ? {
      sectionId: 'personal',
      label: 'Add contact info'
    } : undefined
  });

  // 2. Work Experience Present
  const hasWorkExperience = data.workExperience.length > 0;
  const experiencesWithBullets = data.workExperience.filter(
    exp => exp.description.some(d => d.trim().length > 0)
  ).length;

  checks.push({
    id: 'has-experience',
    category: 'experience',
    label: 'Work experience added',
    status: hasWorkExperience && experiencesWithBullets > 0 ? 'pass' : 'fail',
    priority: 'required',
    message: hasWorkExperience
      ? `${data.workExperience.length} position(s) with ${experiencesWithBullets} having descriptions`
      : 'No work experience entries',
    detail: hasWorkExperience && experiencesWithBullets === 0
      ? 'Add bullet points describing your responsibilities and achievements'
      : undefined,
    fixAction: !hasWorkExperience ? {
      sectionId: 'experience',
      label: 'Add experience'
    } : undefined
  });

  // 3. Education Present
  const hasEducation = data.education.length > 0;

  checks.push({
    id: 'has-education',
    category: 'education',
    label: 'Education section present',
    status: hasEducation ? 'pass' : 'fail',
    priority: 'required',
    message: hasEducation
      ? `${data.education.length} education entry/entries`
      : 'No education entries',
    fixAction: !hasEducation ? {
      sectionId: 'education',
      label: 'Add education'
    } : undefined
  });

  // 4. Skills Listed
  const skillCount = data.skills.length;
  const hasMinSkills = skillCount >= 5;

  checks.push({
    id: 'has-skills',
    category: 'skills',
    label: 'Skills listed (5+ required)',
    status: hasMinSkills ? 'pass' : 'fail',
    priority: 'required',
    message: hasMinSkills
      ? `${skillCount} skills listed`
      : `Only ${skillCount} skill(s) - add ${5 - skillCount} more`,
    fixAction: !hasMinSkills ? {
      sectionId: 'skills',
      label: 'Add skills'
    } : undefined
  });

  // 5. No Red Flags (basic formatting check)
  const allBullets = data.workExperience.flatMap(exp => exp.description);
  const emptyBullets = allBullets.filter(b => !b.trim()).length;
  const hasEmptyBullets = emptyBullets > 0;

  // Check for consistent date formatting
  const experienceWithDates = data.workExperience.filter(exp => exp.startDate).length;
  const hasConsistentDates = experienceWithDates === data.workExperience.length || experienceWithDates === 0;

  const noRedFlags = !hasEmptyBullets && hasConsistentDates;

  checks.push({
    id: 'no-red-flags',
    category: 'formatting',
    label: 'No formatting issues',
    status: noRedFlags ? 'pass' : 'fail',
    priority: 'required',
    message: noRedFlags
      ? 'No obvious formatting problems detected'
      : hasEmptyBullets
        ? `${emptyBullets} empty bullet point(s) found`
        : 'Inconsistent date formatting',
    fixAction: !noRedFlags ? {
      sectionId: 'experience',
      label: 'Fix issues'
    } : undefined
  });

  // === RECOMMENDED CHECKS ===

  // 6. Professional Summary
  const summaryLength = (data.personalInfo.summary || '').trim().length;
  const summaryWordCount = (data.personalInfo.summary || '').trim().split(/\s+/).filter(Boolean).length;
  const hasSummary = summaryWordCount >= 15 && summaryWordCount <= 100;

  checks.push({
    id: 'has-summary',
    category: 'content',
    label: 'Professional summary added',
    status: hasSummary ? 'pass' : summaryWordCount > 0 ? 'warning' : 'fail',
    priority: 'recommended',
    message: hasSummary
      ? `${summaryWordCount} words - good length`
      : summaryWordCount === 0
        ? 'No summary - add 2-4 sentences about your background'
        : summaryWordCount < 15
          ? `Only ${summaryWordCount} words - expand to 15-100 words`
          : `${summaryWordCount} words - consider trimming to under 100`,
    fixAction: !hasSummary ? {
      sectionId: 'personal',
      label: 'Edit summary'
    } : undefined
  });

  // 7. Quantified Achievements (metrics in bullets)
  const nonEmptyBullets = allBullets.filter(b => b.trim().length > 0);
  const metricsRegex = /\d+%|\$[\d,]+|\d+k\+?|\d+\+|#\d+|\d+ (percent|million|billion|thousand)/i;
  const bulletsWithMetrics = nonEmptyBullets.filter(b => metricsRegex.test(b)).length;
  const metricsPercentage = nonEmptyBullets.length > 0
    ? Math.round((bulletsWithMetrics / nonEmptyBullets.length) * 100)
    : 0;
  const hasEnoughMetrics = metricsPercentage >= 30;

  checks.push({
    id: 'has-metrics',
    category: 'content',
    label: 'Quantified achievements (30%+ bullets)',
    status: hasEnoughMetrics ? 'pass' : metricsPercentage > 0 ? 'warning' : 'fail',
    priority: 'recommended',
    message: hasEnoughMetrics
      ? `${metricsPercentage}% of bullets include numbers`
      : nonEmptyBullets.length === 0
        ? 'Add bullet points first'
        : `Only ${metricsPercentage}% have metrics - add numbers like "increased by 25%"`,
    detail: !hasEnoughMetrics && bulletsWithMetrics > 0
      ? `${bulletsWithMetrics} of ${nonEmptyBullets.length} bullets have metrics`
      : undefined,
    fixAction: !hasEnoughMetrics && nonEmptyBullets.length > 0 ? {
      sectionId: 'experience',
      label: 'Add metrics'
    } : undefined
  });

  // 8. Action Verbs Usage
  const bulletsStartingWithActionVerb = nonEmptyBullets.filter(bullet => {
    const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    return ACTION_VERBS.includes(firstWord);
  }).length;
  const actionVerbPercentage = nonEmptyBullets.length > 0
    ? Math.round((bulletsStartingWithActionVerb / nonEmptyBullets.length) * 100)
    : 0;
  const hasEnoughActionVerbs = actionVerbPercentage >= 50;

  // Check for weak verbs
  const bulletsWithWeakVerbs = nonEmptyBullets.filter(bullet => {
    const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    return WEAK_VERBS.includes(firstWord);
  }).length;

  checks.push({
    id: 'uses-action-verbs',
    category: 'content',
    label: 'Strong action verbs (50%+ bullets)',
    status: hasEnoughActionVerbs ? 'pass' : actionVerbPercentage > 0 ? 'warning' : 'fail',
    priority: 'recommended',
    message: hasEnoughActionVerbs
      ? `${actionVerbPercentage}% of bullets start with action verbs`
      : nonEmptyBullets.length === 0
        ? 'Add bullet points first'
        : `${actionVerbPercentage}% use action verbs - start with "Led", "Developed", "Increased"`,
    detail: bulletsWithWeakVerbs > 0
      ? `${bulletsWithWeakVerbs} bullet(s) use weak verbs like "helped" or "worked on"`
      : undefined,
    fixAction: !hasEnoughActionVerbs && nonEmptyBullets.length > 0 ? {
      sectionId: 'experience',
      label: 'Improve verbs'
    } : undefined
  });

  // 9. Vocabulary Variety
  const startWords = nonEmptyBullets.map(b =>
    b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '')
  ).filter(Boolean);

  const wordCounts = new Map<string, number>();
  startWords.forEach(w => wordCounts.set(w, (wordCounts.get(w) || 0) + 1));
  const repeatedWords = Array.from(wordCounts.entries())
    .filter(([_, count]) => count > 2)
    .map(([word, count]) => ({ word, count }));

  const hasGoodVariety = repeatedWords.length === 0;

  checks.push({
    id: 'vocabulary-variety',
    category: 'content',
    label: 'Varied vocabulary',
    status: hasGoodVariety ? 'pass' : 'warning',
    priority: 'recommended',
    message: hasGoodVariety
      ? 'Good variety in bullet openings'
      : `"${repeatedWords[0]?.word}" used ${repeatedWords[0]?.count} times - use synonyms`,
    detail: repeatedWords.length > 1
      ? `${repeatedWords.length} words are repeated more than twice`
      : undefined,
    fixAction: !hasGoodVariety ? {
      sectionId: 'experience',
      label: 'Vary vocabulary'
    } : undefined
  });

  // 10. Adequate Bullet Points per Role
  const rolesWithFewBullets = data.workExperience.filter(exp => {
    const bulletCount = exp.description.filter(d => d.trim().length > 0).length;
    return bulletCount < 3 && bulletCount > 0;
  });
  const rolesWithNoBullets = data.workExperience.filter(exp =>
    exp.description.every(d => !d.trim())
  );
  const hasAdequateBullets = rolesWithFewBullets.length === 0 && rolesWithNoBullets.length === 0;

  if (data.workExperience.length > 0) {
    checks.push({
      id: 'adequate-bullets',
      category: 'content',
      label: 'Adequate detail per role (3+ bullets)',
      status: hasAdequateBullets ? 'pass' : 'warning',
      priority: 'recommended',
      message: hasAdequateBullets
        ? 'All roles have sufficient bullet points'
        : rolesWithNoBullets.length > 0
          ? `${rolesWithNoBullets.length} role(s) have no bullet points`
          : `${rolesWithFewBullets.length} role(s) have fewer than 3 bullets`,
      fixAction: !hasAdequateBullets ? {
        sectionId: 'experience',
        label: 'Add bullets'
      } : undefined
    });
  }

  // Calculate summary
  const requiredChecks = checks.filter(c => c.priority === 'required');
  const recommendedChecks = checks.filter(c => c.priority === 'recommended');

  const summary: ReadinessSummary = {
    required: {
      passed: requiredChecks.filter(c => c.status === 'pass').length,
      total: requiredChecks.length
    },
    recommended: {
      passed: recommendedChecks.filter(c => c.status === 'pass').length,
      total: recommendedChecks.length
    }
  };

  // Resume is "ready" when all required checks pass
  const isReady = summary.required.passed === summary.required.total;

  return { checks, summary, isReady };
}

/**
 * Get a simple status label for the header button
 */
export function getReadinessStatus(result: ReadinessResult): {
  label: string;
  variant: 'ready' | 'issues' | 'incomplete';
  issueCount: number;
} {
  if (result.isReady) {
    const recommendedIssues = result.summary.recommended.total - result.summary.recommended.passed;
    if (recommendedIssues === 0) {
      return { label: 'Ready', variant: 'ready', issueCount: 0 };
    }
    return {
      label: `${recommendedIssues} tip${recommendedIssues > 1 ? 's' : ''}`,
      variant: 'ready',
      issueCount: recommendedIssues
    };
  }

  const requiredIssues = result.summary.required.total - result.summary.required.passed;
  return {
    label: `${requiredIssues} issue${requiredIssues > 1 ? 's' : ''}`,
    variant: 'issues',
    issueCount: requiredIssues
  };
}
