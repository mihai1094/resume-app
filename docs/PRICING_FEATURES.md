# ResumeForge - Premium vs Free Features

> Last updated: December 2024

---

## Quick Overview

| | Free Plan | Premium Plan |
|---|:---:|:---:|
| **Price** | €0/month | €12/month |
| **Resumes** | 3 | Unlimited |
| **Cover Letters** | 3 | Unlimited |
| **AI Credits** | 30/month | Unlimited |
| **Templates** | All 17 | All 17 |
| **PDF/DOCX Export** | ✓ | ✓ |

---

## Plan Comparison

### Storage Limits

| Feature | Free | Premium |
|---------|:----:|:-------:|
| Resume storage | 3 max | Unlimited |
| Cover letter storage | 3 max | Unlimited |
| Template access | All templates | All templates |

### AI Credits System

Free users get **30 credits per month** that reset on the 1st of each month.

#### Credit Costs by Operation

| Operation | Credits | Description |
|-----------|:-------:|-------------|
| **Quick (1 credit)** |||
| Improve bullet point | 1 | Enhance a single bullet |
| Suggest skills | 1 | Get skill recommendations |
| Analyze text | 1 | Quick text analysis |
| Ghost suggest | 1 | Inline suggestions |
| Quantify achievement | 1 | Add metrics to bullets |
| **Medium (2 credits)** |||
| Generate bullets | 2 | Create new bullet points |
| Generate summary | 2 | Write professional summary |
| Score resume | 2 | Get resume score |
| **Heavy (3 credits)** |||
| ATS analysis | 3 | Full ATS compatibility check |
| Generate improvement | 3 | Get improvement suggestions |
| **Intensive (5 credits)** |||
| Generate cover letter | 5 | Create full cover letter |
| Tailor resume | 5 | Adapt resume to job |
| Interview prep | 5 | Generate interview questions |
| Batch enhance | 5 | Enhance entire resume |
| LinkedIn optimization | 5 | Optimize LinkedIn profile |

---

## Premium-Only Features

These features are **blocked** for free users regardless of credits:

### 1. Batch Resume Enhancement
- **What it does**: Enhances all resume content (summary + all work experience bullets) in one click
- **Credit cost**: 5 credits
- **Location**: AI menu → "Enhance All"

### 2. LinkedIn Profile Optimization
- **What it does**: Optimizes LinkedIn headline, summary, and experience for better visibility
- **Credit cost**: 5 credits
- **Location**: AI menu → "Optimize LinkedIn"

### 3. Full Interview Prep
- **What it does**: Generates 15-20 comprehensive interview questions
- **Free users get**: Only 5 basic questions
- **Premium users get**: Full 15-20 question set with detailed prep

---

## Free Features (Available to All)

### Resume Building
- ✓ All 17 resume templates
  - Modern, Classic, Executive, Minimalist
  - Creative, Technical, Adaptive, Timeline
  - Ivy, ATS-Clarity, ATS-Structured, ATS-Compact
  - Cascade, Dublin, Infographic, Cubic, Bold
- ✓ Full template customization (colors, fonts, spacing)
- ✓ Real-time preview
- ✓ PDF export (professional quality)
- ✓ DOCX export
- ✓ JSON import/export
- ✓ Drag-and-drop reordering
- ✓ Profile photo support (where template supports it)

### Cover Letters
- ✓ 4 cover letter templates
- ✓ AI-assisted generation (uses credits)
- ✓ PDF export

### AI Features (with credits)
- ✓ Bullet point improvement
- ✓ Professional summary generation
- ✓ Skill suggestions
- ✓ ATS score analysis
- ✓ Resume tailoring to job descriptions
- ✓ Basic interview prep (5 questions)

### Other Features
- ✓ Dashboard with all resumes/letters
- ✓ Auto-save
- ✓ Session recovery
- ✓ Mobile-responsive editor
- ✓ Keyboard shortcuts
- ✓ Command palette (Cmd+K)

---

## What Happens When Limits Are Reached

### Out of Credits (Free Users)
- AI buttons show lock icon
- Tooltip shows "Insufficient credits"
- Upgrade modal appears with options:
  - Wait for monthly reset (1st of month)
  - Upgrade to Premium

### Storage Limit Reached (Free Users)
- Cannot create new resume/cover letter
- Modal: "You can keep up to 3 resumes on the free plan"
- Options:
  - Delete existing resume
  - Upgrade to Premium

---

## Implementation Status

### ✅ Fully Implemented
- Credit system and tracking
- Credit deduction per operation
- Premium feature gating
- Storage limits enforcement
- Upgrade modals and prompts
- Admin dev tools for testing
- Pricing page UI

### ⏳ Coming Soon
- Stripe payment integration
- Real subscription checkout
- Payment confirmation
- Subscription management portal

> **Note**: Premium upgrades currently show "Coming Soon" - the infrastructure is ready but payment processing is not yet live.

---

## Potential Gaps / Uncovered Areas

After deep analysis, here are features that could be considered for premium:

### Currently Free (Could Be Premium)
| Feature | Current Status | Consideration |
|---------|---------------|---------------|
| Template access | All free | Could limit to 5-6 for free |
| DOCX export | Free | Could be premium-only |
| Multiple color palettes | All free | Could limit free to 3 colors |
| Interview prep sessions | Saved forever | Could limit history for free |

### Not Currently Monetized
| Feature | Description |
|---------|-------------|
| Template customization | All styling options are free |
| Resume versioning | No version history exists yet |
| Resume sharing | No public link feature yet |
| Analytics | No resume view/download tracking |
| Collaboration | No team features |

### Missing Premium Features (Industry Standard)
| Feature | Common in Competitors |
|---------|----------------------|
| Resume website | Public portfolio page |
| QR code | Resume link QR code |
| Applicant tracking | Track job applications |
| Cover letter matching | Match letter to resume style |
| AI job matching | Suggest jobs based on resume |

---

## Key Files Reference

| Purpose | File Path |
|---------|-----------|
| Credit configuration | `lib/config/credits.ts` |
| Plan limits | `lib/config/credits.ts` |
| Credit service | `lib/services/credit-service.ts` |
| API middleware | `lib/api/credit-middleware.ts` |
| User hook | `hooks/use-user.ts` |
| Credits hook | `hooks/use-ai-credits.ts` |
| Premium components | `components/premium/` |
| Pricing page | `app/pricing/page.tsx` |
| Admin tools | `components/settings/dev-plan-toggle.tsx` |
| Plan limit dialog | `components/shared/plan-limit-dialog.tsx` |

---

## Admin Testing

Admins can test premium features via Settings:
- Toggle between Free/Premium plans
- Reset credits to 0
- View current credit usage

Admin emails: `catalin.ionescu1094@gmail.com`

---

## Summary

**Free tier is generous** with:
- All templates
- All export formats
- 30 AI credits/month
- 3 resumes + 3 cover letters

**Premium adds**:
- Unlimited storage
- Unlimited AI credits
- 3 exclusive features (batch enhance, LinkedIn optimization, full interview prep)

**Revenue opportunity**: Consider gating more features (templates, DOCX, customization) to increase premium conversion.
