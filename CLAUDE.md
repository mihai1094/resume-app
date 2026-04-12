# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A modern Next.js resume builder application with AI-powered features, Firebase backend, and professional PDF export. Users can create, customize, and optimize resumes with cover letters, interview prep, job tracking, and public sharing.

**Tech Stack:**
- **Next.js 16** with App Router
- **React 19** with TypeScript (strict mode)
- **Firebase** (Authentication + Firestore)
- **AI Integration** - Google Gemini 2.5 Flash for content generation
- **Styling** - Tailwind CSS + shadcn/ui components
- **PDF Export** - puppeteer-core + @sparticuz/chromium-min (headless Chrome, server-side)
- **Testing** - Vitest + React Testing Library

## Development Commands

```bash
npm run dev              # Development server
npm run build            # Production build
npm start                # Start production server
npm run lint             # Linting
npm test                 # Run tests
npx tsc --noEmit         # Type check
npm run seed:test         # Create test account + seed data
npm run seed:cleanup      # Remove test account
npx shadcn@latest add [component]  # Add shadcn/ui component
```

## Architecture

### Pages & Routes (`app/`)

**Core:**
- `/` (home), `/editor/new`, `/editor/[id]`, `/preview`, `/dashboard`
- `/cover-letter`, `/edit-cover-letter` — cover letter editor
- `/settings`, `/onboarding`

**Features (some gated via `config/launch.ts`):**
- `/dashboard/interview-prep/[sessionId]` — interview practice
- `/dashboard/analytics/[id]` — resume analytics
- `/applications` — job application tracker (Kanban)
- `/u/[username]/[slug]` — public resume sharing
- `/templates`, `/templates/[id]` — template gallery

**Marketing & Legal:**
- `/about`, `/pricing`, `/blog`, `/blog/[slug]`
- `/ai-resume-builder`, `/free-resume-builder`, `/vs/[competitor]`
- `/login`, `/register`, `/forgot-password`
- `/privacy`, `/terms`, `/cookies`
- `/coming-soon`, `/maintenance`, `/offline`

### API Routes (`app/api/`)

| Group | Purpose |
|-------|---------|
| `/api/ai/*` | AI features (15+ endpoints: bullets, summary, ATS, cover letter, interview prep, etc.) |
| `/api/auth/*` | Authentication (register, etc.) |
| `/api/account/*` | Account management (deletion) |
| `/api/test/*` | QA testing (seed, reset, toggle-plan, status, reset-credits, clear-resume, seed-cover-letter) |
| `/api/analytics/*` | Resume view/download tracking |
| `/api/feedback/*` | User feedback |
| `/api/rewards/*` | Gamification (claim-resume-completion) |
| `/api/admin/*` | Admin operations |
| `/api/cron/*` | Scheduled jobs (prune-data) |
| `/api/user/*` | User operations (export) |
| `/api/security/*` | Security (signup-check) |
| `/api/places/*` | Google Places autocomplete |
| `/api/public/*` | Public resume access/download |
| `/api/parse-linkedin-pdf` | LinkedIn PDF parsing |

All AI routes follow: auth → credit check → input validation → cache check → AI generation → error handling (see `lib/api/ai-route-wrapper.ts`).

### State Management

Custom hooks-based (no external state library). Key hooks:

**Core:**
- `useResume()` — resume data CRUD
- `useUser()` — Firebase auth + user metadata
- `useSavedResumes()` — multiple saved resumes
- `useCoverLetter()` — cover letter state
- `useSavedCoverLetters()` — saved cover letters CRUD

**AI:**
- `useAiAction()` — generic AI action runner
- `useAiCredits()` — credit balance + usage
- `useAiPreferences()` — AI privacy/preference settings

**UI/UX:**
- `useKeyboardShortcuts()`, `useCommandPalette()`, `useNavigationGuard()`
- `useDragAndDrop()`, `useHistory()`, `useConfirmationDialog()`
- `useLocalStorage()`, `useSectionNavigation()`

**Features:**
- `useInterviewPrepSession()`, `useInterviewPrepHistory()`, `useQuestionTimer()`
- `useApplications()`, `useJobDescriptionContext()`
- `useAnalytics()`, `useVersionHistory()`

### Core Directories

**`lib/`** — Business logic
- `lib/types/` — TypeScript interfaces: `resume.ts`, `cover-letter.ts`, `interview-prep.ts`, `application.ts`, `analytics.ts`, `sharing.ts`, `version.ts`, `errors.ts`, `job-context.ts`
- `lib/services/` — `firestore.ts`, `logger.ts`, `export.ts`, `auth.ts`, `credit-service-server.ts`, `sharing-service-server.ts`, `resume-scoring.ts`, `resume-readiness.ts`, `version-service.ts`
- `lib/api/` — `error-handler.ts`, `auth-fetch.ts`, `auth-middleware.ts`, `credit-middleware.ts`, `ai-route-wrapper.ts`
- `lib/ai/` — AI services (bullets, summary, skills, cover-letter, interview-prep, linkedin, tailor, score, ats, writing, quantifier, cache, telemetry)
- `lib/config/` — `credits.ts` (AI costs/tier limits), `admin.ts`, `site-url.ts`, `runtime-env.ts`
- `lib/utils/` — Utility functions including `cn()` for className merging
- `lib/constants/` — Skills, languages, templates configuration

**`config/`** — Feature flags
- `launch.ts` — V1 launch controls (enabled/disabled features)

**`hooks/`** — 50+ custom React hooks (see State Management above)

**`components/`** — React components
- `ui/` — shadcn/ui base components
- `resume/` — Resume editor, forms, templates, PDF templates
- `cover-letter/` — Cover letter editor, forms, templates
- `ai/` — AI action buttons, batch enhance, ghost suggestions
- `premium/` — Credit checks, upgrade prompts
- `dashboard/` — Dashboard layout, stats
- `analytics/` — Resume analytics dashboard
- `applications/` — Job application Kanban
- `sharing/` — Public resume sharing
- `version/` — Version history
- `auth/` — Auth guard, login/register forms
- `home/` — Homepage sections
- `blog/` — Blog components
- `command-palette/` — Command palette (Cmd+K)
- `privacy/` — Cookie consent, privacy controls
- `test/` — QA test toolbar
- `wizard/` — Onboarding wizard

### Firestore Schema

```
users/{uid}
  ├── plan, email, displayName, subscription, usage (credits)
  ├── savedResumes/{resumeId}    — saved resume documents
  ├── savedCoverLetters/{id}     — saved cover letters
  ├── resumes/current            — autosave target
  └── versions/{versionId}       — version history

publicResumes/{id}               — publicly shared resumes
jobApplications/{id}             — job application tracking
interviewSessions/{id}           — interview prep sessions
```

### Template System

22 resume templates with a single implementation:
- **HTML templates** for live preview AND PDF export (React components in `components/resume/templates/`)
- PDF export serializes these HTML templates via `lib/services/template-serializer.ts` and renders them with headless Chrome (`lib/services/pdf-renderer.ts`)
- There is NO separate `templates/pdf/` directory — one template codebase serves both purposes

Templates: modern, classic, executive, creative, cascade, cubic, adaptive, timeline, ivy-league, minimalist, bold, technical, infographic, functional, student, iconic, diamond, dublin, simple, ats-clarity, ats-compact, ats-structured

Cover letter templates: modern, classic, minimalist, executive

### Feature Flags (`config/launch.ts`)

**Enabled (V1):** resumeEditor, saveSync, aiBasic, exportPdf, exportJson, coverLetter, allTemplates, aiGenerateBullets, aiGenerateSummary, aiImproveBullet, aiGenerateCoverLetter, aiAnalyzeAts, aiScoreResume, jdContext, tailorResume, publicSharing

**Disabled (deferred):** exportDocx, resumeOptimize, interviewPrep, batchEnhance, analytics, linkedinTools, jobTracker, aiAnalyzeText, aiGenerateImprovement, aiGhostSuggest, aiQuantifyAchievement, aiSuggestSkills

### AI Credits (`lib/config/credits.ts`)

| Cost | Operations |
|------|-----------|
| 1 cr | improve-bullet, suggest-skills, analyze-text, ghost-suggest, quantify-achievement |
| 2 cr | generate-bullets, generate-summary, score-resume |
| 3 cr | analyze-ats, generate-improvement |
| 5 cr | generate-cover-letter, tailor-resume, interview-prep, batch-enhance, optimize-linkedin |

**Free:** 30 one-time signup credits (no monthly reset), 3 resumes, 3 cover letters. **Premium:** unlimited.
Premium-only: batch-enhance, optimize-linkedin, interview-prep-full.
Dev bypass: `SKIP_CREDITS=true` or `DEMO_MODE=true` (blocked in production).

## Test Account

A dedicated test account for QA testing, with a floating toolbar (bottom-right amber button) for seeding/resetting data.

- **Email:** `test@resumebuilder.dev`
- **Password:** `TestUser123!`
- **Setup:** `npm run seed:test` (creates Firebase Auth user + seeds Firestore)
- **Cleanup:** `npm run seed:cleanup`
- **Toolbar:** Enabled via `NEXT_PUBLIC_ENABLE_TEST_TOOLBAR=true` + `ENABLE_TEST_TOOLBAR=true` (local + Vercel preview only, never production)
- **Toolbar actions:** Seed data, Reset all, Toggle plan, Reset credits, Seed cover letter, Clear specific resume

### Test Infrastructure

- Config: `vitest.config.ts` (jsdom environment, globals enabled)
- Setup: `tests/setup.ts`
- Fixtures: `tests/fixtures/resume-data.ts` — builders for complete/minimal/empty/weak resumes
- Mocks: `tests/mocks/firebase.ts`, `tests/mocks/logger.ts`, `tests/mocks/next.ts`
- Test files: `__tests__/` directories throughout the codebase

## Best Practices

### Error Handling
- Use centralized error types from `lib/types/errors.ts` (`AppError`, `ApiError`, `AuthError`, `ValidationError`, `DatabaseError`, `AIServiceError`, `RateLimitError`, `CreditError`)
- Use `handleApiError()` in API routes (`lib/api/error-handler.ts`)
- Use logger service instead of `console.log` (`lib/services/logger.ts`)
- Pre-configured loggers: `aiLogger`, `authLogger`, `storageLogger`, `firestoreLogger`

### Adding New Resume Sections

1. Add type definition to `lib/types/resume.ts`
2. Add field to `ResumeData` interface
3. Update `useResume()` hook with add/update/remove operations
4. Create form component in `components/resume/forms/`
5. Add section to `sections` array in `resume-editor.tsx`
6. Update all template components to render the new section
7. Update validation in `lib/utils/resume.ts`

### Form Component Pattern

```tsx
interface FormProps {
  data: EntityType[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<EntityType>) => void;
  onRemove: (id: string) => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
}
```

## Path Aliases

TypeScript path alias `@/*` maps to project root:
```typescript
import { ResumeData } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
```

## Styling Guidelines

- **Tailwind CSS** for all styling (utility-first)
- **CSS variables** for theming (defined in `app/globals.css`)
- **shadcn/ui** components with a custom warm palette: cream background (`--background: 35 30% 98%`), coral primary (`--primary: 15 85% 52%`), golden amber accent — see `app/globals.css`
- **Responsive design**: Mobile-first with lg (1024px) breakpoint for desktop
- **Mobile UX**: Toggle between form and preview; desktop shows side-by-side

## Important Notes

### Git & Code Commits
**IMPORTANT**: Do NOT push code to the repository unless explicitly told to do so. Only commit and push when you receive an explicit instruction like "push this to GitHub" or "commit your changes". Always ask for permission before pushing.

### Resume Editor Behavior
- Desktop (>=1024px): Shows form + preview side-by-side
- Mobile (<1024px): Toggle between form and preview
- Collapsible sidebar navigation on desktop
- Progress tracking shows completion per section

### Cover Letter Editor
- Loads saved cover letters by `?id=` URL param (direct Firestore fetch)
- When editing existing: updates document in place (not create new)
- Route shell shows loading state while auth resolves (no guest page flash)
- Auto-saves to localStorage; persists to Firestore on explicit save

### PDF Export
- Uses headless Chrome via `puppeteer-core` + `@sparticuz/chromium-min` (NOT @react-pdf/renderer)
- Server-side only — runs in `app/api/user/export-pdf/route.ts` and `app/api/internal/render-pdf/`
- Pipeline: resume data → `lib/services/template-serializer.ts` (renders HTML template to string) → `lib/services/pdf-renderer.ts` (Chromium prints to PDF)
- Uses the same HTML template components as the live preview — no separate PDF templates

### Date Handling
- Uses `date-fns` library for date operations
- Custom `MonthPicker` component for month/year selection
- "Current" checkbox for ongoing work/education

## UX/A11y Guardrails
- Keep skip links on pages; modals/overlays trap focus, close on Escape, and return focus.
- Icon-only/toggle controls need `aria-label` and `aria-pressed`; touch targets >=44px on mobile.
- Validation: inline errors near fields plus `aria-live` summary; optional sections shouldn't block progression.
- Save/export status must be screen-reader friendly; block empty resume export and handle missing templates gracefully.
- See `docs/ux/a11y-guardrails.md` and `docs/development/preflight-checklist.md` for patterns and release checks.

## Troubleshooting

**Build Errors:** `rm -rf .next && npm run build`
**Type Errors:** `npx tsc --noEmit`
**Lint Errors:** `npm run lint -- --fix`
**Test Failures:** `npm test` or `npm test -- path/to/test.ts`
**Firebase:** Check `.env.local` config, verify project settings, check Firestore security rules
**AI Features:** Verify `GOOGLE_AI_API_KEY` in `.env.local`, check credit balance, review rate limiting, check AI service logs

## Code Review Checklist

- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Linting passes (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] No `console.log` statements (use logger)
- [ ] Error handling uses centralized utilities
- [ ] New features have tests
- [ ] API routes have proper auth and validation
- [ ] Types are properly defined

## Context7 MCP

Always use Context7 when generating code, setup/configuration steps, or looking up library/API documentation. Automatically use the Context7 MCP tools to resolve library IDs and fetch current documentation without requiring explicit requests.

## Custom Slash Commands

In `.claude/commands/`:
- `/build` — Run production build and report errors
- `/lint` — Run linting and fix issues
- `/test-component <name>` — Test a specific component
- `/add-section <name>` — Guide for adding a new resume section
- `/review-pr <number>` — Review a pull request
- `/preflight` — Run preflight checks before PR/deploy
- `/debug <issue>` — Help debug an issue

## Quick Reference

### Key Files
- `components/resume/resume-editor.tsx` — Main resume editor
- `components/cover-letter/cover-letter-editor.tsx` — Cover letter editor
- `hooks/use-resume.ts` — Resume state management
- `hooks/use-cover-letter.ts` — Cover letter state
- `lib/types/resume.ts` — Resume TypeScript interfaces
- `lib/types/cover-letter.ts` — Cover letter types
- `lib/types/errors.ts` — Error type definitions
- `lib/api/error-handler.ts` — API error handling
- `lib/services/firestore.ts` — Database operations
- `lib/services/logger.ts` — Logging service
- `config/launch.ts` — Feature flags
- `lib/config/credits.ts` — AI credit costs and tier limits
- `components/resume/templates/` — Preview templates
- `lib/services/pdf-renderer.ts` — Headless Chrome PDF rendering
- `lib/services/template-serializer.ts` — Serializes HTML templates for PDF
- `app/api/test/` — Test seed/reset routes
- `components/test/test-toolbar.tsx` — QA test toolbar

### Additional Resources
- **AI Features Guide**: [`.claude/AI_FEATURES.md`](./.claude/AI_FEATURES.md)
- **Claude Config**: [`.claude/README.md`](./.claude/README.md)
- **Documentation**: [`docs/`](./docs/)
