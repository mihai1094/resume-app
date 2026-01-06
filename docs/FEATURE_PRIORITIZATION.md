# Feature Prioritization Analysis

**Date:** January 2026
**Context:** Solo developer, new app launch
**Status:** AGREED

---

## Final Decision

### KEEP for Launch
- Resume Builder (core)
- Cover Letter Builder (natural companion)
- All 17 templates (curate display order)
- Core AI features

### HIDE for Launch (code stays, UI hidden)
- Interview Prep
- Job Application Tracker
- Public Resume Sharing
- Resume Analytics
- Version History UI (keep auto-save)

---

## Current Feature Inventory

### Core Product

| Feature | Complexity | Status |
|---------|------------|--------|
| Resume Editor | High | Built |
| 17 HTML Templates | High | Built |
| 17 PDF Templates | High | Built |
| PDF Export | Medium | Built |
| DOCX Export | Medium | Built |
| JSON Import/Export | Low | Built |
| Auto-save | Low | Built |
| Multiple Resumes (3 free) | Medium | Built |

### Resume Sections (12 total)

| Section | Essential? |
|---------|-----------|
| Personal Info | Yes |
| Work Experience | Yes |
| Education | Yes |
| Skills | Yes |
| Projects | Maybe |
| Languages | Maybe |
| Certifications | Maybe |
| Courses | No |
| Hobbies | No |
| Extra-curricular | No |
| Custom Sections | No |
| Photo Upload | Maybe |

### AI Features (17 endpoints!)

| Feature | Credits | Essential? |
|---------|---------|-----------|
| Improve Bullet | 1 | Yes - core value |
| Suggest Skills | 1 | Nice to have |
| Analyze Text | 1 | No |
| Ghost Suggest | 1 | Nice to have |
| Quantify Achievement | 1 | Nice to have |
| Generate Bullets | 2 | Yes - core value |
| Generate Summary | 2 | Yes - core value |
| Score Resume | 2 | Nice to have |
| Analyze ATS | 3 | Nice to have |
| Generate Improvement | 3 | No - overlaps with others |
| Generate Cover Letter | 5 | Separate product |
| Tailor Resume | 5 | Nice to have |
| Interview Prep | 5 | Separate product |
| Batch Enhance | 5 | No - complex |
| Optimize LinkedIn | 5 | No - different use case |

### Premium Features (just built)

| Feature | Complexity | Essential for Launch? |
|---------|------------|----------------------|
| Public Resume Sharing | Medium | No |
| QR Codes | Low | No |
| Resume Analytics | Medium | No |
| Version History | Medium | Nice to have |
| Job Application Tracker | High | No - separate product |

### Other Features

| Feature | Essential? |
|---------|-----------|
| Cover Letter Builder | Separate product |
| Interview Prep | Separate product |
| Onboarding Wizard | Nice to have |
| Blog (11 posts) | Good for SEO |
| Template Gallery | Yes |
| Pricing Page | Yes |
| User Accounts | Yes |
| Settings Page | Yes |

---

## Honest Assessment

### You're Building 4+ Products

1. **Resume Builder** (core)
2. **Cover Letter Builder** (separate use case)
3. **Interview Prep Tool** (separate use case)
4. **Job Application Tracker** (separate product entirely)

### Template Overload

- **17 templates** is excessive for launch
- Users suffer from choice paralysis
- Each template = 2 files to maintain (HTML + PDF)
- Bug in one template = test all 17

### AI Feature Sprawl

- 17 AI endpoints is too many
- Many overlap in functionality
- Each one needs: prompt engineering, testing, error handling, rate limiting
- API costs add up

---

## Recommended MVP Scope

### MUST HAVE (Launch with these)

**Core Resume Builder:**
- Resume Editor with auto-save
- 4-5 templates max (Modern, Classic, ATS-Optimized x2, Creative)
- PDF Export (primary)
- Essential sections only: Personal, Work, Education, Skills

**Essential AI (3-4 features):**
- Improve Bullet (quick wins)
- Generate Bullets (from job title)
- Generate Summary
- ATS Score (differentiator)

**Business Essentials:**
- User accounts (email/password)
- Free tier (3 resumes, 30 AI credits)
- Pricing page
- Landing page

### NICE TO HAVE (Add in v1.1)

- DOCX export
- More sections (Projects, Certifications, Languages)
- 2-3 more templates
- LinkedIn PDF import
- Version history (auto-save only)
- Onboarding wizard

### DEFER (v2.0 or never)

| Feature | Reason |
|---------|--------|
| Cover Letter Builder | Separate product - launch separately |
| Interview Prep | Separate product - different user journey |
| Job Application Tracker | Separate product - Notion/spreadsheet exists |
| Public Resume Sharing | Low demand - people use PDF links |
| Resume Analytics | Vanity metrics - not core value |
| QR Codes | Gimmick |
| 12+ extra templates | Maintenance burden |
| Ghost suggestions | Complex, marginal value |
| Batch enhance | Complex, edge case |
| LinkedIn optimizer | Different product |
| Hobbies/Courses/Extra-curricular sections | Rarely used |
| Custom sections | Power user feature |

---

## Action Plan

### Phase 1: Trim for Launch (1-2 weeks)

1. **Hide (don't delete) non-essential features:**
   - Cover letter (keep code, remove from nav)
   - Interview prep (keep code, remove from nav)
   - Job tracker (keep code, remove from nav)
   - Public sharing (keep code, remove from UI)
   - Analytics (keep code, remove from UI)

2. **Reduce visible templates to 5:**
   - Modern (popular, two-column)
   - Classic (traditional)
   - ATS Clarity (ATS-optimized)
   - ATS Compact (ATS-optimized, dense)
   - Creative (for designers)

3. **Simplify AI to 4 features:**
   - Improve bullet
   - Generate bullets
   - Generate summary
   - ATS analysis

4. **Hide optional sections by default:**
   - Show: Personal, Work, Education, Skills
   - Expandable: Projects, Certifications, Languages
   - Hidden: Courses, Hobbies, Extra-curricular, Custom

### Phase 2: Validate (2-4 weeks post-launch)

- Track which templates are used
- Track which AI features are used
- Track which sections are filled
- Get user feedback

### Phase 3: Expand Based on Data

- Only add features users actually request
- Only add templates that fill gaps
- Consider Cover Letter as separate launch

---

## The Hard Truth

**You have ~6 months of work in this codebase, but you need ~2 weeks of features for launch.**

Every extra feature:
- Increases bug surface area
- Dilutes your value proposition
- Confuses new users
- Costs you maintenance time
- Delays your launch

**Ship the resume builder. Just the resume builder.**

The best resume builders (Resume.io, Novoresume) started simple. They added features after validating demand.

---

## Metrics That Matter

**Track these post-launch:**

1. Resumes created (not accounts)
2. PDFs downloaded (not previews)
3. Which AI features used
4. Which templates chosen
5. Completion rate (% who finish a resume)
6. Conversion to premium

**Don't track:**
- Public link views (vanity)
- Version restores (edge case)
- Job applications tracked (separate product)

---

## Summary Table

| Category | Current | MVP | Savings |
|----------|---------|-----|---------|
| Templates | 17 | 5 | 12 less to maintain |
| AI Features | 17 | 4 | 13 less to maintain |
| Resume Sections | 12 | 6 | Simpler forms |
| Products | 4 | 1 | Clear focus |
| Pages | 30+ | ~15 | Less surface area |

---

## Final Recommendation

**Launch with brutal simplicity. Add complexity only when users demand it.**

Your competitive advantage isn't feature count. It's:
1. Clean, modern UI
2. Fast, reliable PDF export
3. Actually helpful AI suggestions
4. Frictionless experience

None of those require 17 templates or 17 AI endpoints.
