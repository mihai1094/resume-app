# AI Features Quick Reference

Quick reference for all AI-powered features in the resume builder.

## Available AI Features

### 1. Bullet Point Generation
**File:** `lib/ai/bullets.ts`  
**API:** `/api/ai/generate-bullets`  
**Credits:** 2

Generates 4 professional bullet points for work experience.

```typescript
const bullets = await generateBulletPoints({
  position: 'Senior Software Engineer',
  company: 'Tech Corp',
  industry: 'technology',
  seniorityLevel: 'senior',
  customPrompt: 'Focus on cloud architecture'
});
```

### 2. Bullet Point Improvement
**File:** `lib/ai/bullets.ts`  
**API:** `/api/ai/improve-bullet`  
**Credits:** 1

Improves existing bullet point with suggestions.

```typescript
const result = await improveBulletPoint(
  "Worked on improving website performance",
  { industry: 'technology', seniorityLevel: 'mid' }
);
```

### 3. Professional Summary
**File:** `lib/ai/summary.ts`  
**API:** `/api/ai/generate-summary`  
**Credits:** 2

Generates 2-3 sentence professional summary.

```typescript
const summary = await generateSummary({
  firstName: 'Jane',
  lastName: 'Doe',
  jobTitle: 'Product Manager',
  yearsOfExperience: 8,
  keySkills: ['Product Strategy', 'Agile', 'Data Analysis'],
  tone: 'professional',
  industry: 'technology',
  seniorityLevel: 'senior'
});
```

### 4. Skill Suggestions
**File:** `lib/ai/skills.ts`  
**API:** `/api/ai/suggest-skills`  
**Credits:** 1

Suggests 8-10 relevant skills for a job.

```typescript
const skills = await suggestSkills({
  jobTitle: 'Full Stack Developer',
  jobDescription: '...',
  industry: 'technology',
  seniorityLevel: 'mid'
});
```

### 5. ATS Analysis
**File:** `lib/ai/ats.ts`  
**API:** `/api/ai/analyze-ats`  
**Credits:** 3

Analyzes resume for ATS compatibility.

```typescript
const analysis = await analyzeATSCompatibility({
  resumeData,
  jobDescription,
  industry: 'technology',
  seniorityLevel: 'senior'
});
// Returns: score, strengths, missingKeywords, suggestions
```

### 6. Cover Letter Generation
**File:** `lib/ai/cover-letter.ts`  
**API:** `/api/ai/generate-cover-letter`  
**Credits:** 3

Generates personalized cover letter.

### 7. Interview Preparation
**File:** `lib/ai/interview-prep.ts`  
**API:** `/api/ai/generate-interview-prep`  
**Credits:** 2

Generates interview questions and talking points.

```typescript
const prep = await generateInterviewPrep({
  resumeData,
  jobDescription,
  industry: 'finance',
  seniorityLevel: 'mid'
});
```

### 8. LinkedIn Optimization
**File:** `lib/ai/linkedin.ts`  
**API:** `/api/ai/optimize-linkedin`  
**Credits:** 3

Optimizes LinkedIn profile content.

```typescript
const profile = await optimizeLinkedInProfile({
  resumeData,
  industry: 'technology',
  seniorityLevel: 'senior',
  targetRole: 'CTO'
});
```

### 9. Resume Tailoring
**File:** `lib/ai/tailor.ts`  
**API:** `/api/ai/tailor-resume`  
**Credits:** 5

Tailors resume to specific job description.

```typescript
const result = await tailorResume(resumeData, jobDescription, {
  industry: 'healthcare',
  seniorityLevel: 'mid'
});
```

### 10. Resume Scoring
**File:** `lib/ai/score.ts`  
**API:** `/api/ai/score-resume`  
**Credits:** 2

Scores resume quality with detailed feedback.

```typescript
const score = await scoreResume(resumeData, {
  industry: 'engineering',
  seniorityLevel: 'senior'
});
```

## Credit System

### Free Tier
- 50 AI credits per month
- Resets on 1st of each month
- Max 5 resumes, 3 cover letters

### Premium Tier
- 500 AI credits per month
- Unlimited resumes and cover letters
- Priority support

## Caching

AI responses are cached using LRU cache to reduce costs:
- **Bullet points**: Cached by position + company + industry
- **Skills**: Cached by job title + industry
- **ATS analysis**: Not cached (unique per resume)

Cache stats available in response metadata:
```typescript
{
  bulletPoints: [...],
  meta: {
    fromCache: true,
    responseTime: 45,
    cacheStats: {
      hitRate: "75.5%",
      totalHits: 234,
      estimatedSavings: "$12.45"
    }
  }
}
```

## Error Handling

All AI features handle common errors:
- **Quota exceeded** (429): "AI service quota exceeded"
- **Timeout** (504): "Request timed out"
- **Invalid input** (400): Specific validation error
- **Insufficient credits** (402): Credit error with balance

## Testing AI Features

Mock AI responses in tests:
```typescript
import { vi } from 'vitest';

vi.mock('@/lib/ai/bullets', () => ({
  generateBulletPoints: vi.fn().mockResolvedValue([
    'Bullet 1',
    'Bullet 2',
    'Bullet 3',
    'Bullet 4'
  ])
}));
```

## Monitoring

AI usage is tracked in Firestore:
- Credits used per user
- Monthly reset dates
- Feature usage statistics

Check logs for AI performance:
```typescript
aiLogger.info('Generated content', {
  action: 'generate-bullets',
  fromCache: true,
  responseTime: 1234
});
```
