/**
 * Job Match Service
 *
 * Analyzes how well a resume matches a specific job description by:
 * - Extracting keywords from the job description
 * - Finding matching keywords in the resume
 * - Identifying missing keywords with suggestions
 *
 * This is the ONLY place where we show a percentage match,
 * and it's honest about what it measures (keyword overlap).
 */

import { ResumeData } from "@/lib/types/resume";
import { STOP_WORDS, SKILL_CLUSTERS, SYNONYMS } from "@/lib/ats/dictionaries";

export interface KeywordMatch {
  keyword: string;
  foundIn: ('skills' | 'experience' | 'summary' | 'education')[];
  importance: 'high' | 'medium';
}

export interface MissingKeyword {
  keyword: string;
  importance: 'high' | 'medium';
  suggestedSection: string;
  tip: string;
}

export interface JobMatchResult {
  matchPercentage: number;
  keywordsFound: KeywordMatch[];
  keywordsMissing: MissingKeyword[];
  totalKeywords: number;
  summary: string;
}

/**
 * Extract meaningful keywords from job description text
 */
function extractKeywords(jobDescription: string): { keyword: string; importance: 'high' | 'medium' }[] {
  const text = jobDescription.toLowerCase();
  const words = text
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.includes(w));

  // Count word frequency
  const wordCounts = new Map<string, number>();
  words.forEach(word => {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  });

  // Extract multi-word phrases (2-3 words)
  const phrases = new Map<string, number>();
  const wordArray = text.split(/\s+/);
  for (let i = 0; i < wordArray.length - 1; i++) {
    // 2-word phrases
    const phrase2 = wordArray.slice(i, i + 2).join(' ').replace(/[^\w\s-]/g, '').trim();
    if (phrase2.length > 5 && !phrase2.split(' ').every(w => STOP_WORDS.includes(w))) {
      phrases.set(phrase2, (phrases.get(phrase2) || 0) + 1);
    }
    // 3-word phrases
    if (i < wordArray.length - 2) {
      const phrase3 = wordArray.slice(i, i + 3).join(' ').replace(/[^\w\s-]/g, '').trim();
      if (phrase3.length > 8 && !phrase3.split(' ').every(w => STOP_WORDS.includes(w))) {
        phrases.set(phrase3, (phrases.get(phrase3) || 0) + 1);
      }
    }
  }

  // Detect "required" and "preferred" sections for importance
  const requiredSection = text.match(/required[\s\S]*?(?:preferred|nice to have|$)/i)?.[0] || '';
  const preferredSection = text.match(/preferred[\s\S]*?(?:required|$)/i)?.[0] || '';

  // Identify high-importance keywords (appear in required section or mentioned 2+ times)
  const keywords: { keyword: string; importance: 'high' | 'medium' }[] = [];
  const seen = new Set<string>();

  // Add phrases first (they're more specific)
  phrases.forEach((count, phrase) => {
    if (count >= 1 && !seen.has(phrase)) {
      const importance = requiredSection.includes(phrase) || count >= 2 ? 'high' : 'medium';
      keywords.push({ keyword: phrase, importance });
      seen.add(phrase);
      // Also mark individual words as seen to avoid duplication
      phrase.split(' ').forEach(w => seen.add(w));
    }
  });

  // Add single words
  wordCounts.forEach((count, word) => {
    if (!seen.has(word) && count >= 1) {
      const importance = requiredSection.includes(word) || count >= 3 ? 'high' : 'medium';
      keywords.push({ keyword: word, importance });
      seen.add(word);
    }
  });

  // Sort by importance and frequency, limit to top 30
  return keywords
    .sort((a, b) => {
      if (a.importance !== b.importance) return a.importance === 'high' ? -1 : 1;
      return (wordCounts.get(b.keyword) || 0) - (wordCounts.get(a.keyword) || 0);
    })
    .slice(0, 30);
}

/**
 * Get all text content from resume for searching
 */
function getResumeText(data: ResumeData): {
  skills: string;
  experience: string;
  summary: string;
  education: string;
  full: string;
} {
  const skills = data.skills.map(s => s.name.toLowerCase()).join(' ');

  const experience = data.workExperience
    .flatMap(exp => [
      exp.position || '',
      exp.company || '',
      ...exp.description
    ])
    .join(' ')
    .toLowerCase();

  const summary = (data.personalInfo.summary || '').toLowerCase();

  const education = data.education
    .flatMap(edu => [
      edu.degree || '',
      edu.field || '',
      edu.institution || '',
      ...(edu.description || [])
    ])
    .join(' ')
    .toLowerCase();

  return {
    skills,
    experience,
    summary,
    education,
    full: `${skills} ${experience} ${summary} ${education}`
  };
}

/**
 * Check if a keyword (or its synonyms) exists in text
 */
function findKeywordInText(keyword: string, text: string): boolean {
  const lowerKeyword = keyword.toLowerCase();

  // Direct match
  if (text.includes(lowerKeyword)) return true;

  // Check synonyms
  const synonymGroups = Object.entries(SYNONYMS);
  for (const [key, synonyms] of synonymGroups) {
    if (key === lowerKeyword || synonyms.includes(lowerKeyword)) {
      // Check if any synonym is in text
      if (text.includes(key)) return true;
      if (synonyms.some(syn => text.includes(syn))) return true;
    }
  }

  // Check skill clusters
  const clusters = Object.entries(SKILL_CLUSTERS);
  for (const [key, relatedSkills] of clusters) {
    if (key === lowerKeyword || relatedSkills.includes(lowerKeyword)) {
      if (text.includes(key)) return true;
    }
  }

  return false;
}

/**
 * Suggest where to add a missing keyword
 */
function suggestSection(keyword: string): { section: string; tip: string } {
  const lowerKeyword = keyword.toLowerCase();

  // Technical skills -> Skills section
  const technicalIndicators = ['javascript', 'python', 'react', 'aws', 'sql', 'node', 'docker',
    'kubernetes', 'typescript', 'java', 'css', 'html', 'git', 'api', 'cloud', 'data',
    'machine learning', 'ai', 'agile', 'scrum'];
  if (technicalIndicators.some(t => lowerKeyword.includes(t))) {
    return {
      section: 'Skills',
      tip: `Add "${keyword}" to your skills section`
    };
  }

  // Soft skills -> Summary or Experience
  const softSkillIndicators = ['leadership', 'communication', 'team', 'management', 'collaboration',
    'problem solving', 'analytical'];
  if (softSkillIndicators.some(s => lowerKeyword.includes(s))) {
    return {
      section: 'Summary or Experience',
      tip: `Demonstrate "${keyword}" through examples in your experience bullets`
    };
  }

  // Certifications
  if (lowerKeyword.includes('certified') || lowerKeyword.includes('certification')) {
    return {
      section: 'Certifications',
      tip: `Add "${keyword}" to your certifications section`
    };
  }

  // Default to experience
  return {
    section: 'Experience',
    tip: `Mention "${keyword}" in your experience descriptions`
  };
}

/**
 * Analyze job match between resume and job description
 */
export function analyzeJobMatch(
  resumeData: ResumeData,
  jobDescription: string
): JobMatchResult {
  if (!jobDescription.trim()) {
    return {
      matchPercentage: 0,
      keywordsFound: [],
      keywordsMissing: [],
      totalKeywords: 0,
      summary: 'Enter a job description to analyze'
    };
  }

  const keywords = extractKeywords(jobDescription);
  const resumeText = getResumeText(resumeData);

  const keywordsFound: KeywordMatch[] = [];
  const keywordsMissing: MissingKeyword[] = [];

  keywords.forEach(({ keyword, importance }) => {
    const foundIn: ('skills' | 'experience' | 'summary' | 'education')[] = [];

    if (findKeywordInText(keyword, resumeText.skills)) foundIn.push('skills');
    if (findKeywordInText(keyword, resumeText.experience)) foundIn.push('experience');
    if (findKeywordInText(keyword, resumeText.summary)) foundIn.push('summary');
    if (findKeywordInText(keyword, resumeText.education)) foundIn.push('education');

    if (foundIn.length > 0) {
      keywordsFound.push({ keyword, foundIn, importance });
    } else {
      const suggestion = suggestSection(keyword);
      keywordsMissing.push({
        keyword,
        importance,
        suggestedSection: suggestion.section,
        tip: suggestion.tip
      });
    }
  });

  const totalKeywords = keywords.length;
  const matchPercentage = totalKeywords > 0
    ? Math.round((keywordsFound.length / totalKeywords) * 100)
    : 0;

  // Generate summary
  let summary: string;
  if (matchPercentage >= 75) {
    summary = 'Strong match! Your resume aligns well with this job.';
  } else if (matchPercentage >= 50) {
    summary = 'Good match. Consider adding the missing keywords to strengthen your application.';
  } else if (matchPercentage >= 25) {
    summary = 'Moderate match. Review the missing keywords to better tailor your resume.';
  } else {
    summary = 'Weak match. This job may require skills not highlighted in your resume.';
  }

  return {
    matchPercentage,
    keywordsFound,
    keywordsMissing,
    totalKeywords,
    summary
  };
}

/**
 * Get color class for match percentage
 */
export function getMatchColor(percentage: number): string {
  if (percentage >= 75) return 'text-green-600 dark:text-green-400';
  if (percentage >= 50) return 'text-blue-600 dark:text-blue-400';
  if (percentage >= 25) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * Get background color class for match percentage
 */
export function getMatchBgColor(percentage: number): string {
  if (percentage >= 75) return 'bg-green-500';
  if (percentage >= 50) return 'bg-blue-500';
  if (percentage >= 25) return 'bg-orange-500';
  return 'bg-red-500';
}
