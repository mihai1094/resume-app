# Developer Tasks — Launch Readiness

Ticket-style breakdown of `launch-readiness.md`. Each task is self-contained and pickup-ready.

**Priority legend**
- **P0** — Ship-blocker. Cannot launch V1 without this.
- **P1** — Pre-launch. Should land before announcement.
- **P2** — Post-launch. Plan of record, not a blocker.

**Role legend:** BE = Backend · FE = Frontend · FS = Fullstack · QA · DSN = Design · UX · SEO · MKT = Marketing · OPS

---

## Phase 0 — Stop the bleeding

### OPS-01 — Review and commit/shelve WIP branch
**Priority:** P0 · **Owner:** FS lead · **Blocks:** everything

`git status` shows ~286 modified files on `preview` with net -15k lines. Unreviewable.

**Task**
1. Audit `git diff HEAD` and group changes into coherent logical commits.
2. Commit clean chunks, move uncertain/experimental work to `wip/<topic>` branches.
3. Leave `preview` in a reviewable state.

**Acceptance**
- [ ] `git status` shows a clean working tree OR a small, reviewable diff
- [ ] Any experimental WIP is on a named branch, not on `preview`

---

### OPS-02 — Delete stale worktree and gitignore
**Priority:** P0 · **Owner:** FS lead

**Files:** `.gitignore`, `.claude/worktrees/silly-dirac/`

**Task**
1. `rm -rf .claude/worktrees/silly-dirac` (or move elsewhere).
2. Add `.claude/worktrees/` to `.gitignore`.

**Acceptance**
- [ ] `grep -r "@react-pdf/renderer" .` in main tree returns zero results
- [ ] `.claude/worktrees/` ignored in future

---

### CONTENT-01 — Remove fake testimonials
**Priority:** P0 · **Owner:** FE + MKT · **Legal/credibility risk**

**Files**
- `components/home/social-proof.tsx`
- `app/register/page.tsx:213`

**Task**
1. Delete the fabricated Google/Amazon/Meta testimonials in `social-proof.tsx` OR replace with an empty-state component gated on `TESTIMONIALS.length > 0`.
2. Replace register page line 213 `"Join thousands of job seekers who landed their dream roles"` with `"Start free. Export PDFs. Keep your data private."`

**Acceptance**
- [ ] No references to "Google", "Amazon", "Meta", or fabricated stats in `components/home/`
- [ ] Register page copy does not make unsubstantiated volume claims
- [ ] `grep -r "thousands of job seekers" .` returns zero

---

### DOC-01 — Fix CLAUDE.md PDF stack claims
**Priority:** P0 · **Owner:** FS lead

**Files:** `CLAUDE.md`

**Task**
Three inaccurate sections to fix:
1. "Tech Stack" bullet — drop `@react-pdf/renderer` claim. Real stack: `puppeteer-core` + `@sparticuz/chromium-min` serializing HTML templates via `lib/services/pdf-renderer.ts` + `lib/services/template-serializer.ts`.
2. "PDF Export" section under "Important Notes" — remove "PDF templates are separate React components in `templates/pdf/`". That directory doesn't exist in main tree. There's ONE set of templates in `components/resume/templates/` rendered to PDF via headless Chrome.
3. "shadcn/ui base color: slate" — actual palette is warm cream (`--background: 35 30% 98%`) + coral primary (`--primary: 15 85% 52%`) + golden amber accent, per `app/globals.css:18-84`.

**Acceptance**
- [ ] CLAUDE.md matches the actual stack a new contributor would observe

---

## Phase 1 — Security & correctness

### SEC-01 — Harden `/api/user/export-pdf`
**Priority:** P0 · **Owner:** BE · **Security**

**Files**
- `app/api/user/export-pdf/route.ts:45-50`
- `lib/services/pdf-renderer.ts:199-207`

**Task**
Current handler accepts `data: any`, no validation, no size cap, `allowJavaScript: true` in Chromium.

1. Import `ResumeData` schema from `lib/types/resume.ts`. Create a Zod schema mirror (or derive via `zod-to-ts` equivalent). Validate `body.data` before touching the renderer.
2. Reject requests where `JSON.stringify(body).length > 1_000_000` → return 413.
3. Sanitize all user-supplied string fields with `isomorphic-dompurify` (install if needed) before passing to the React template render. Target fields: `personalInfo.summary`, all bullet points, all descriptions.
4. In `pdf-renderer.ts:199-207`, change `allowJavaScript: true` → `false`. Template output is SSR'd React HTML; doesn't need runtime JS.
5. Add test coverage — see TEST-01.

**Acceptance**
- [ ] `POST /api/user/export-pdf` with `data: { personalInfo: { summary: "<script>alert(1)</script>" } }` produces a PDF with the script tag stripped, not executed
- [ ] `POST` with a 50MB body returns `413`
- [ ] `POST` with missing required fields returns `400` with Zod error
- [ ] Legitimate resume exports unchanged (visual regression with existing templates)

---

### BUG-01 — Transaction-wrap plan-limit checks
**Priority:** P0 · **Owner:** BE · **Data integrity**

**Files**
- `lib/services/firestore.ts:628-664` (`saveResume`)
- `lib/services/firestore.ts:905-916` (`saveCoverLetter`)

**Task**
Current pattern reads count then writes outside a transaction — two concurrent saves at count=2 (free limit 3) both pass the check.

1. Wrap the count-then-write in `runTransaction`.
2. Count inside the transaction via a `limit(limit + 1)` query or a counter doc.
3. On limit violation, throw `PlanLimitError` with the same code the UI already handles.

**Acceptance**
- [ ] Test (manual or integration): two concurrent saves from the same user at count=2 on free tier → one succeeds, one returns `PLAN_LIMIT`
- [ ] Existing single-save path unchanged
- [ ] Same fix applied to cover letters

---

### PERF-01 — Cap undo history to 50 entries
**Priority:** P1 · **Owner:** FE

**Files:** `hooks/use-resume.ts:142-147`

**Task**
Every edit deep-clones the entire `ResumeData` into `state.past`. No eviction. Over long sessions (especially with a photo data URL in `personalInfo.photo`), memory grows unbounded.

Cap `past.length` at 50 with FIFO eviction:
```ts
const MAX_HISTORY = 50;
const newPast = [...state.past, state.present].slice(-MAX_HISTORY);
```

**Acceptance**
- [ ] After 200 edits, `state.past.length === 50`
- [ ] Undo/redo still work correctly within the cap
- [ ] Existing history tests pass

---

### BUG-02 — Fix `isResumeEmpty` false negative
**Priority:** P1 · **Owner:** BE

**Files:** `lib/services/export.ts:200-214`

**Task**
Current check only considers `workExperience`, `education`, `skills`, `languages`, `courses`. A resume with only `projects` (valid! happens for students and junior devs) incorrectly returns `true` and blocks PDF export with "empty resume" error.

Add to the empty check: `projects`, `certifications`, `hobbies`, `extraCurricular`.

**Acceptance**
- [ ] `isResumeEmpty(createCompleteResume())` → `false`
- [ ] `isResumeEmpty({ projects: [{ ... }] })` → `false`
- [ ] `isResumeEmpty(createEmptyResume())` → `true`
- [ ] Add test in `lib/services/__tests__/export.test.ts`

---

### SEC-02 — Verify credit idempotency TTL policy
**Priority:** P1 · **Owner:** BE

**Files:** `lib/services/credit-service-server.ts:348-350`

**Task**
Comment says "TTL via Firestore TTL policy" but no `ttl` field is written. Subcollection `users/{uid}/credit_idempotency/{key}` grows unbounded.

1. Inspect Firebase console → Firestore → TTL policies. If no policy exists for this subcollection, create one on a field called `expiresAt`.
2. Update `credit-service-server.ts:348-350` to write `expiresAt: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000)`.
3. Document the TTL in a code comment.

**Acceptance**
- [ ] New idempotency docs have an `expiresAt` field 24h in the future
- [ ] Firebase TTL policy active on `users/{uid}/credit_idempotency` keyed on `expiresAt`
- [ ] After 24+ hours, old docs are auto-deleted by Firestore

---

### SEC-03 — Rate-limit KV startup assertion
**Priority:** P1 · **Owner:** BE

**Files**
- `lib/api/rate-limit.ts:72`
- `lib/config/runtime-env.ts`

**Task**
Current fallback to in-memory `Map` silently disables cross-instance hourly rate limits if `KV_URL` is missing. A production misconfiguration could go unnoticed.

1. In `runtime-env.ts`, add an assertion: when `NODE_ENV === 'production'`, require `KV_URL` (or the equivalent Vercel KV env var) — throw at module load if missing.
2. Log a clear warning in dev if missing, but don't throw.

**Acceptance**
- [ ] `NODE_ENV=production npm run build` with `KV_URL` unset fails loudly
- [ ] Dev mode without `KV_URL` logs a warning once and continues

---

### BUG-03 — Remove meaningless Firestore index
**Priority:** P2 · **Owner:** BE

**Files:** `firestore.indexes.json:19-25`

**Task**
Defines an index on `users` keyed by `userId` — but `userId` IS the doc ID. Dead config. Either remove it or replace with the intended field.

**Acceptance**
- [ ] Index removed or corrected
- [ ] `firebase deploy --only firestore:indexes` succeeds

---

## Phase 2 — The wedge: live ATS scoring

### FEAT-01 — Enable ATS feature flags
**Priority:** P0 · **Owner:** FS lead · **Unlocks:** FEAT-02, FEAT-03, CONTENT-02

**Files:** `config/launch.ts:19-41`

**Task**
Set `aiScoreResume: true` and `aiAnalyzeAts: true`. Leave other disabled flags alone — they are not the V1 wedge.

**Acceptance**
- [ ] `isLaunchFeatureEnabled("aiScoreResume")` returns `true`
- [ ] `isLaunchFeatureEnabled("aiAnalyzeAts")` returns `true`
- [ ] AI routes for these actions pass the feature-flag gate in `lib/api/ai-route-wrapper.ts:188-198`

---

### FEAT-02 — Live ATS score panel component
**Priority:** P0 · **Owner:** FE + BE · **Depends on:** FEAT-01

**Files (new)**
- `components/resume/ats-score-panel.tsx`
- Possibly `lib/ai/resume-scoring-client.ts` for client-side heuristic

**Reuse**
- `lib/ai/ats.ts`, `lib/ai/score.ts`, `lib/services/resume-scoring.ts`, `lib/services/resume-readiness.ts`
- `hooks/use-cached-resume-score.ts`

**Task**
1. Design a panel showing: overall score (0-100), 4 subscores (Formatting / Keywords / Content / Length), top 3 actionable fixes.
2. Client-side heuristic scoring recomputes on debounced resume change (no credit cost). If the existing scoring logic is server-only, port the heuristic parts to a client-safe module.
3. "Deep AI analysis" button triggers the 2-credit `aiAnalyzeAts` path for semantic feedback, renders richer suggestions.
4. Handle empty-resume state gracefully (score = 0, CTA = "Add work experience to start scoring").

**Acceptance**
- [ ] Score updates within 500ms of a typed change
- [ ] Zero credits consumed for heuristic updates
- [ ] "Deep analysis" consumes 2 credits and shows AI-generated suggestions
- [ ] Reduced-motion preference respected on any score-change animations

---

### FEAT-03 — Wire ATS panel into resume editor layout
**Priority:** P0 · **Owner:** FE · **Depends on:** FEAT-02

**Files**
- `components/resume/resume-editor.tsx`
- `components/resume/editor-header.tsx` (if header integration needed)

**Task**
1. Desktop: ATS score panel lives in the right rail alongside/replacing the preview toggle, or in a new tab next to "Preview".
2. Mobile: bottom-sheet trigger from the mobile action bar.
3. Score should be visible from every section, not just Personal.

**Acceptance**
- [ ] Panel accessible from all 8 editor sections on desktop and mobile
- [ ] Layout doesn't regress existing editor flows
- [ ] Keyboard-accessible (tab order, focus visible, Escape closes mobile sheet)

---

### CONTENT-02 — Rewrite homepage around ATS wedge
**Priority:** P0 · **Owner:** FE + MKT · **Depends on:** FEAT-02

**Files:** `app/home-content.tsx`

**Task**
1. New H1 (pick one with CEO): `See your ATS score before the recruiter does` / `The only resume builder that scores you live` / `Write bullets. Watch your ATS score climb.`
2. Subhead emphasizes: live ATS score + free PDF + 30 AI credits on signup.
3. Above the fold: interactive ATS score demo widget (animated if interactive isn't feasible for V1).
4. Reorder feature sections: ATS scoring first, AI bullets second, templates third.
5. Fix orphan section comments (`// 3.` and `// 6.` missing, `Trust Signals section removed — redundant`) — they signal unfinished work.

**Acceptance**
- [ ] Homepage H1 mentions ATS scoring
- [ ] Above-the-fold shows a concrete ATS score visual (not just text)
- [ ] Feature section order: ATS → AI → Templates
- [ ] No orphan comments in the file

---

### CONTENT-03 — Pricing page ATS headline
**Priority:** P1 · **Owner:** FE + MKT · **Depends on:** FEAT-01

**Files:** `app/pricing/page.tsx`

**Task**
Frame Free vs Premium around ATS analysis depth. Example: "Free: heuristic ATS score on every save. Premium: AI-powered keyword gap detection and unlimited analysis."

**Acceptance**
- [ ] Pricing hero copy mentions ATS scoring as the differentiator
- [ ] Language consistent with homepage wedge

---

## Phase 3 — Launch credibility

### INFRA-01 — Add PostHog analytics
**Priority:** P0 · **Owner:** FE + BE · **Blocks:** INFRA-02

**Files (new)**
- `lib/analytics/posthog-client.ts`
- `lib/analytics/posthog-server.ts`
- `components/privacy/analytics-gate.tsx` (or equivalent)

**Env:** `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`

**Task**
1. Install `posthog-js` + `posthog-node`.
2. Initialize client-side ONLY after consent from existing `components/privacy/` cookie flow. Do not fire events before consent.
3. Server-side client for API routes; identify by `userId` where authenticated.
4. Add a `track(event, props)` helper with a typed event name enum.

**Acceptance**
- [ ] PostHog loads only after user accepts analytics cookies
- [ ] `track()` helper typed with a central `AnalyticsEvent` enum
- [ ] No events fire in E2E tests (disabled via env)

---

### INFRA-02 — Instrument core funnel events
**Priority:** P0 · **Owner:** FE + BE · **Depends on:** INFRA-01

**Files:** throughout — wire at event sources, use the `track()` helper

**Event list** (name now, don't rename later):
- `landing_view`, `cta_click` (source)
- `signup_start`, `signup_complete`
- `onboarding_step` (step)
- `template_select` (templateId)
- `editor_opened`, `editor_first_edit`, `section_complete` (section)
- `ats_score_computed` (score, subscores)
- `ai_action_start`, `ai_action_complete`, `ai_action_failed` (action, creditsUsed)
- `credits_low` (remaining), `credits_exhausted`
- `save_success`, `save_failed`
- `export_pdf_start`, `export_pdf_success`, `export_pdf_failed`
- `pricing_view`, `upgrade_click` (source: editor | pricing | limit_dialog | credits_exhausted)
- `plan_limit_hit` (resource: resumes | cover_letters | credits)
- `waitlist_join`

**Task**
1. Wire client events in pages and key components.
2. Wire server events in `lib/api/ai-route-wrapper.ts` for the AI action lifecycle.
3. Document each event in a `docs/analytics/events.md` file with schema.

**Acceptance**
- [ ] All events fire in manual QA walk-through
- [ ] `docs/analytics/events.md` exists and lists every event with its props
- [ ] `upgrade_click` fires even though checkout doesn't exist yet

---

### FEAT-04 — Waitlist form on pricing page
**Priority:** P0 · **Owner:** FE · **Depends on:** FEAT-05

**Files**
- `app/pricing/page.tsx:175-186` (replace "Coming Soon" disabled button)

**Task**
1. Replace the disabled button with a small form: email input + optional role dropdown + submit button.
2. On submit, POST to `/api/waitlist` (FEAT-05).
3. Success: show inline confirmation ("You're on the list. We'll email you when Premium launches.").
4. Fire `waitlist_join` PostHog event.
5. Error handling: show inline error, do not wipe the form.

**Acceptance**
- [ ] Happy path shows confirmation inline without a route change
- [ ] Email validation inline
- [ ] Duplicate submissions idempotent (server returns 200)

---

### FEAT-05 — Waitlist API route and Firestore rules
**Priority:** P0 · **Owner:** BE

**Files (new)**
- `app/api/waitlist/route.ts`
- Firestore rules update in `firestore.rules`

**Task**
1. Create unauthenticated POST route — rate-limited via existing `abuse-guard` (5 submissions per IP per hour).
2. Input validation (Zod): `{ email: string().email(), role?: string().max(80) }`.
3. Write to Firestore `waitlist/{autoId}` via Admin SDK: `{ email, role, source: "pricing_page", createdAt: serverTimestamp(), userAgent }`.
4. Dedupe by email — if exists, return 200 idempotently (don't leak existence).
5. Firestore rules: `waitlist` collection client-write denied, server-only.

**Acceptance**
- [ ] `curl -X POST /api/waitlist -d '{"email":"a@b.com"}'` → 200
- [ ] Same email twice → still 200, still one doc
- [ ] 6th submission from same IP in an hour → 429
- [ ] Firestore rules test verifies client cannot read or write `waitlist/*`

---

### CONTENT-04 — Rewrite pricing features matrix
**Priority:** P0 · **Owner:** FE + MKT

**Files:** `app/pricing/page.tsx:36-44`

**Task**
Currently Free/Premium columns are nearly identical. Rewrite so rows genuinely diverge. Use this matrix:

| Feature | Free | Premium |
|---|---|---|
| Resumes | 3 | Unlimited |
| Cover letters | 3 | Unlimited |
| AI credits | 30 one-time | Unlimited |
| Heuristic ATS score | ✓ | ✓ |
| AI-powered ATS analysis | — | ✓ |
| AI bullet improvement | ✓ (credits) | ✓ (no limits) |
| Cover letter AI | ✓ (credits) | ✓ (no limits) |
| Job description tailoring | — | ✓ |
| Keyword gap detection | — | ✓ |
| All templates | ✓ | ✓ |
| PDF export | ✓ | ✓ |
| Priority support | — | ✓ |
| Early access | — | ✓ |

Some of these Premium-only rows reference features currently flagged OFF in `config/launch.ts` — that's the upgrade story. Don't enable them yet.

**Acceptance**
- [ ] Free and Premium columns differ on ≥ 7 rows
- [ ] Visual hierarchy emphasizes Premium-only capabilities

---

### CONTENT-05 — Remove or gate social proof block
**Priority:** P0 · **Owner:** FE · **Related:** CONTENT-01

**Files:** `components/home/social-proof.tsx`, `app/home-content.tsx`

**Task**
Ensure the social proof component is NOT imported on the homepage until real quotes exist. If the component is kept (for future TESTIMONIALS collection — see Phase 8.5), gate it behind `TESTIMONIALS.length > 0`. Otherwise delete it.

**Acceptance**
- [ ] Homepage renders zero fabricated testimonials
- [ ] No dead import of `SocialProof` in `home-content.tsx`

---

### CONTENT-06 — Align register page H1 with homepage voice
**Priority:** P1 · **Owner:** MKT + FE

**Files:** `app/register/page.tsx:202-204`

**Task**
Current: "Land your dream job faster" — generic, tonally inconsistent with homepage.
Rewrite to echo the chosen wedge headline. Example: "See your ATS score. Land more interviews."

**Acceptance**
- [ ] Register H1 mentions the wedge (ATS scoring or whatever is chosen in CONTENT-02)

---

## Phase 4 — UX critical fixes

### UX-01 — Collapse signup → first resume into one funnel
**Priority:** P0 · **Owner:** FE + UX · **Related:** UX-02

**Files**
- `app/register/page.tsx:72-81`
- `app/onboarding/onboarding-content.tsx`

**Task**
1. Change post-register redirect: `router.push("/onboarding")` by default (not `/templates`). Preserve the `auth_redirect` override for deep links to `/editor/*`.
2. Onboarding Step 2 (template picker): show 3 curated templates based on the role chosen in Step 1, with "Browse all 22" link. Don't dump 22 tiles on a new user.
3. After onboarding → `/editor/new?template=...&startSection=experience`.

**Acceptance**
- [ ] Registered user lands on `/onboarding`, not `/templates`
- [ ] Onboarding template step shows curated 3 + "Browse all"
- [ ] Editor opens on the Experience section, not Personal
- [ ] `/onboarding` and the old `/templates`-as-funnel path do not both run

---

### UX-02 — Pre-fill PersonalInfo from registration
**Priority:** P0 · **Owner:** FE · **Depends on:** UX-01

**Files**
- `components/resume/resume-editor.tsx`
- `hooks/use-resume.ts`

**Task**
On first editor mount for a new user, if `personalInfo.firstName` is empty, pre-fill from `user.displayName` (split on space) and `personalInfo.email` from `user.email`. Do not overwrite existing data.

**Acceptance**
- [ ] New user's editor loads with first name, last name, email already filled
- [ ] Returning user's existing data is never overwritten
- [ ] Test added in `hooks/__tests__/use-resume.test.ts`

---

### A11Y-01 — Keyboard-accessible drag-and-drop
**Priority:** P0 · **Owner:** FE + UX · **Guardrail violation**

**Files**
- `components/ui/sortable-list.tsx:99-114` (`DragHandle`)
- Consumers in `components/resume/forms/*`

**Task**
`DragHandle` currently uses only `onPointerDown`. No `role`, no `aria-label`, no tabIndex, no keyboard fallback. Violates `docs/ux/a11y-guardrails.md`.

1. Add "Move up" and "Move down" icon buttons beside each sortable item, always visible or visible on `:focus-visible`.
2. `aria-label="Move [item name] up"` / `down`.
3. Wire to existing reorder actions (`reorderWorkExperience`, etc.).
4. Ensure focus follows the moved item.

**Acceptance**
- [ ] Keyboard-only user can reorder work experience, education, skills, projects
- [ ] Move buttons have descriptive `aria-label`
- [ ] Focus remains on the moved item after reorder
- [ ] Screen reader announces the new position (use `aria-live="polite"`)

---

### BUG-04 — Fix Enter-to-advance footgun
**Priority:** P0 · **Owner:** FE

**Files**
- `hooks/use-keyboard-shortcuts.ts:120-133`
- `app/onboarding/onboarding-content.tsx:167-177`

**Task**
Global Enter listener advances sections/steps even when focus is on a button or chip. Pressing Enter on a "Popular roles" chip currently fires both the chip click AND `handleNext` — two steps at once.

Add target check before handling Enter:
```ts
const target = e.target as HTMLElement;
if (
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLButtonElement ||
  target.isContentEditable
) return;
```

Apply same fix to Backspace-to-previous in onboarding.

**Acceptance**
- [ ] Pressing Enter on a button in onboarding does NOT advance the step
- [ ] Typing Enter in an input field still submits the form
- [ ] Keyboard navigation works as expected in the editor

---

### UX-03 — Wire `PlanLimitDialog` into editor save path
**Priority:** P1 · **Owner:** FE

**Files:** `components/resume/resume-editor.tsx:787-790`

**Task**
Current: free-tier save failure shows a dead-end toast. `PlanLimitDialog` exists and is already wired in `dashboard-content.tsx` and `home-content.tsx`.

1. Replace the `PLAN_LIMIT` toast path with `PlanLimitDialog` open.
2. Dialog CTAs: "Join Premium waitlist" (opens FEAT-04 form in a modal or routes to `/pricing#waitlist`) + "Manage resumes" (routes to `/dashboard`).

**Acceptance**
- [ ] Save on free tier at 3 resumes shows `PlanLimitDialog`, not a toast
- [ ] Both CTAs work and fire appropriate analytics events

---

### BUG-05 — Expand `hasUnsavedContent` heuristic
**Priority:** P1 · **Owner:** FE

**Files:** `components/resume/resume-editor.tsx:284-287`

**Task**
Current heuristic only flags `firstName`, `workExperience`, `education` as meaningful. A user who filled only skills + projects gets NO unsaved-changes warning on back navigation.

Include: `skills.length > 0`, `projects.length > 0`, `certifications.length > 0`, `personalInfo.email`, `personalInfo.summary?.length > 0`.

**Acceptance**
- [ ] Filling only the Skills section and navigating away triggers the confirmation dialog

---

### UX-04 — Cover letter prefills from latest resume
**Priority:** P1 · **Owner:** FE

**Files:** `components/cover-letter/cover-letter-editor.tsx:126`

**Task**
Currently creates a fresh `useResume()` on mount, so cover letter creation starts with empty personal info. User re-types name, email, phone.

1. On mount, if `?id=` is absent (creating new), load the most recent saved resume via `useSavedResumes(user?.id).getLatestResume()`.
2. Call `syncFromPersonalInfo` with the loaded resume's `personalInfo`.
3. If `?id=` is present (editing existing), preserve stored personal info.

**Acceptance**
- [ ] Creating a new cover letter pre-fills name/email/phone from latest resume
- [ ] Editing an existing cover letter does NOT overwrite its stored data

---

### A11Y-02 — `AiAction` disabled state
**Priority:** P1 · **Owner:** FE

**Files:** `components/ai/ai-action.tsx:103-115`

**Task**
Currently renders `<span role="button">` on disabled state without `aria-disabled`. Screen readers announce as a normal interactive button.

Either:
- Convert to `<button disabled aria-disabled="true">`, OR
- Keep the span but add `aria-disabled="true"` + `tabIndex={-1}` and ensure Enter/Space don't trigger the action.

Add `aria-describedby` pointing at the reason ("Out of credits" / "Premium only").

**Acceptance**
- [ ] Screen reader announces "disabled, out of credits" or equivalent on disabled buttons
- [ ] Keyboard activation is blocked when disabled

---

### A11Y-03 — Password strength screen-reader support
**Priority:** P1 · **Owner:** FE

**Files:** `app/register/page.tsx:355-406`

**Task**
1. Link the strength indicator to the password input via `aria-describedby`.
2. Add `aria-live="polite"` to the strength label so changes are announced.
3. Wrap requirement list in `role="list"` with each requirement as `<li>`.
4. Each requirement should convey pass/fail via text (not color alone).

**Acceptance**
- [ ] Screen reader announces strength changes as user types
- [ ] Requirements list readable without relying on red/green color

---

### A11Y-04 — Respect `prefers-reduced-motion`
**Priority:** P1 · **Owner:** FE

**Files**
- `components/resume/resume-editor.tsx:563-607` (`celebrateSectionComplete`)
- Root `app/layout.tsx` or a MotionConfig wrapper

**Task**
1. Wrap `celebrateSectionComplete` body in a reduced-motion check:
```ts
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion) return;
```
2. Add `<MotionConfig reducedMotion="user">` at the framer-motion root so all motion components respect the user preference.

**Acceptance**
- [ ] System with reduced-motion on does not play celebration animations
- [ ] Framer-motion entrances respect the setting

---

### A11Y-05 — Remove disorienting scroll jumps
**Priority:** P1 · **Owner:** FE + UX

**Files:** `components/resume/resume-editor.tsx:634-653`

**Task**
Current: forces `scroll-behavior: auto` page-level scroll-jump on section change. Disorients screen-magnifier and reduced-motion users.

Replace with focus-based navigation:
1. On section change, focus the first form control in the new section.
2. Let the browser handle scroll-into-view based on focus.
3. Remove the manual `window.scrollTo` call.

**Acceptance**
- [ ] Section change no longer triggers a scroll-jump animation
- [ ] The first field of the new section receives focus
- [ ] Reduced-motion users do not see animated scroll

---

### A11Y-06 — `TemplateCustomizer` focus trap
**Priority:** P1 · **Owner:** FE

**Files:** `components/resume/resume-editor.tsx` (customizer panel toggle)

**Task**
Currently the customizer toggles `showCustomizer` in a Card with no focus trap, no Escape handler, no focus return. Keyboard users can Tab out into sections they can't switch to.

Convert to a proper `Dialog` / `Sheet` primitive from shadcn, which handles focus trap, Escape, and focus return automatically.

**Acceptance**
- [ ] Tab cycles within the customizer when open
- [ ] Escape closes the customizer
- [ ] Focus returns to the trigger button on close

---

## Phase 5 — SEO fixes

### SEO-01 — Convert `home-content.tsx` to RSC with client islands
**Priority:** P1 · **Owner:** FE + SEO · **Biggest CWV win**

**Files:** `app/home-content.tsx` + possibly new small island components

**Task**
1. Remove `"use client"` from `home-content.tsx`.
2. Identify truly interactive bits: `StickyMobileCTA`, `PlanLimitDialog`, the ATS score demo widget (if interactive), role-conditional CTA logic.
3. Extract each into its own small client component (`<StickyMobileCTAIsland>`, etc.) and import them.
4. Leave hero text, how-it-works steps, FAQ, templates preview as server-rendered JSX.
5. Apply the same pattern to `/templates`, `/about`, `/vs/[competitor]`, `/blog`, legal pages if time permits.

**Acceptance**
- [ ] `app/home-content.tsx` has no `"use client"` directive
- [ ] Lighthouse Performance score on `/` improves measurably
- [ ] Visual regression unchanged

---

### SEO-02 — Product/Offer JSON-LD + FAQ on pricing
**Priority:** P1 · **Owner:** SEO + FE

**Files:** `app/pricing/page.tsx`

**Task**
1. Add `application/ld+json` with a `Product` node containing two `Offer` children (Free €0, Premium €12/mo per current copy).
2. Add a visible FAQ accordion (6-8 Q&A pairs) + `FAQPage` schema. Example Qs: "Is it really free?", "What happens when my 30 credits run out?", "Will you charge my card?", "Can I upgrade later?", "Is my data private?".

**Acceptance**
- [ ] Google Rich Results test validates Product schema
- [ ] FAQPage schema validates
- [ ] FAQ visible and functional

---

### SEO-03 — `/templates` content and schema
**Priority:** P1 · **Owner:** SEO + FE + MKT

**Files:** `app/templates/page.tsx`

**Task**
1. Add ~150 word intro paragraph targeting "free ATS-friendly resume templates".
2. Add H2 category headers: "ATS-Optimized", "Modern", "Creative", "Professional", "Student".
3. Add `ItemList` JSON-LD listing all 22 templates with `url`, `name`, `image` fields.
4. Add `FAQPage` schema for template-selection FAQs.

**Acceptance**
- [ ] Page has ≥ 300 words of crawlable content
- [ ] ItemList schema validates in Rich Results test
- [ ] Templates still visible in grid

---

### SEO-04 — Blog index schema + breadcrumbs
**Priority:** P2 · **Owner:** SEO

**Files**
- `app/blog/page.tsx`
- `app/pricing/page.tsx`
- `app/templates/page.tsx`

**Task**
1. Blog index: add `Blog` + `ItemList` of `BlogPosting` stubs.
2. Add `BreadcrumbList` schema to `/blog`, `/pricing`, `/templates` root pages (children already have it).

**Acceptance**
- [ ] All three pages validate in Rich Results test with the new schema

---

### SEO-05 — Deduplicate `SoftwareApplication` schema
**Priority:** P2 · **Owner:** SEO

**Files**
- `app/layout.tsx:106-138`
- `app/free-resume-builder/page.tsx:87`
- `lib/seo/structured-data-advanced.ts:122-127`

**Task**
1. Keep ONE global `SoftwareApplication` node in `app/layout.tsx`.
2. Remove page-level duplicate from `free-resume-builder`.
3. In `getArticleSchema`, add `publisher.logo.width` and `publisher.logo.height` — currently missing, flagged in Rich Results test.

**Acceptance**
- [ ] Each page has exactly one `SoftwareApplication` schema node
- [ ] Article schema on blog posts includes logo dimensions

---

### SEO-06 — Per-page OG images
**Priority:** P2 · **Owner:** FE + SEO

**Files (new)**
- `app/api/og/[...slug]/route.tsx` (using `next/og`)

**Task**
1. Build a dynamic OG image generator using `ImageResponse` from `next/og`.
2. Generate per-page images for: blog posts (title + author), templates (template name + preview), `/vs/[competitor]` (vs comparison).
3. Override `openGraph.images` in each page's `metadata` export.

**Acceptance**
- [ ] `/api/og/blog/some-slug` returns a valid PNG
- [ ] Blog post meta references the dynamic OG URL
- [ ] Facebook sharing debugger shows the per-page image

---

### SEO-07 — Fix homepage title length
**Priority:** P2 · **Owner:** SEO

**Files:** `lib/seo/metadata.ts:124`

**Task**
Current title is 66 chars, over the 65-char SERP safe limit.
New: `Free AI Resume Builder with PDF Export | ResumeZeus` (52 chars).

**Acceptance**
- [ ] Title ≤ 65 chars
- [ ] Mentions "Free", "AI", "Resume Builder", "ResumeZeus"

---

### CONTENT-07 — Add 5 more `/vs/*` competitor pages
**Priority:** P2 · **Owner:** MKT + SEO

**Files:** `lib/data/comparison-pages.ts`

**Task**
Add competitor entries for: `enhancv`, `rezi`, `kickresume`, `teal`, `resume-io`. Use the existing data structure and template. Include `sourceUrls` and `lastVerified` dates.

**Acceptance**
- [ ] 5 new pages live at `/vs/enhancv`, `/vs/rezi`, etc.
- [ ] Each page has substantive content, not copy-paste
- [ ] Sitemap auto-includes them via `app/sitemap.ts`

---

### SEO-08 — Public resume schema and indexability flag
**Priority:** P2 · **Owner:** BE + FE + SEO

**Files**
- `app/u/[username]/[slug]/page.tsx:22-77`
- `lib/types/sharing.ts` (add `allowIndexing: boolean`)
- `components/sharing/*` (share settings UI)
- `app/sitemap.ts`

**Task**
1. Add `ProfilePage` or `Person` JSON-LD to public resume pages.
2. Add `allowIndexing: boolean` to the public resume data shape; default `false`.
3. Expose an opt-in toggle in share settings.
4. In `metadata` export, set `robots: { index: publicResume.allowIndexing !== false ? "index, follow" : "noindex" }`.
5. Filter sitemap to include only `allowIndexing: true` resumes.

**Acceptance**
- [ ] New public resumes default to noindex
- [ ] User can opt in via share settings
- [ ] Sitemap respects the flag

---

### SEO-09 — Differentiate or consolidate `/ai-resume-builder` vs `/free-resume-builder`
**Priority:** P2 · **Owner:** MKT + SEO

**Files**
- `app/ai-resume-builder/page.tsx`
- `app/free-resume-builder/page.tsx`

**Task**
Two options:
- **A:** Make content non-overlapping. `/ai-resume-builder` targets "AI resume builder" keyword family, leads with AI features. `/free-resume-builder` targets "free resume builder", leads with free tier value. Different H1, different H2s, different FAQ.
- **B:** Consolidate into one page, redirect the other (permanent 301).

Decision needed from MKT/SEO.

**Acceptance**
- [ ] Two distinct pages with non-overlapping H1/content OR one page with a 301

---

## Phase 6 — Design system cleanup

### DSN-01 — Font stack diet
**Priority:** P1 · **Owner:** FE + DSN

**Files:** `app/layout.tsx:32-87`

**Task**
Currently loads 9 font families globally. Keep only what every route needs.
- **Keep global:** Inter (UI), Playfair Display (marketing display)
- **Editor-only dynamic load:** Libre Baskerville, Source Serif 4, Cormorant Garamond, EB Garamond, Lato, DM Sans
- **Route-scoped:** JetBrains Mono (wherever used)

Use `next/font` dynamic imports or route-group layouts to scope fonts.

**Acceptance**
- [ ] `/login`, `/`, `/pricing` load ≤ 3 font families
- [ ] Editor routes load additional fonts as needed
- [ ] Lighthouse shows CLS improvement on marketing pages

---

### DSN-02 — Tokenize the orange accent
**Priority:** P1 · **Owner:** FE + DSN

**Files**
- `app/globals.css`
- 30 component files with `text-orange-*` / `bg-orange-*` literals (grep shows 154 hits)
- `tailwind.config.ts` if extending colors

**Task**
1. Add `--accent-display: 25 95% 53%` to `globals.css`.
2. Create Tailwind utilities `.text-accent-display`, `.bg-accent-display` in `@layer components` (or extend `tailwind.config.ts` colors).
3. Global search/replace: `text-orange-500` → `text-accent-display`, `bg-orange-500` → `bg-accent-display`, etc.
4. Verify dark mode and theme switching still works.

**Acceptance**
- [ ] Zero `text-orange-*` / `bg-orange-*` literals outside `globals.css`
- [ ] Swapping `--accent-display` in globals.css recolors the whole site

---

### DSN-03 — Button radius scale consistency
**Priority:** P1 · **Owner:** DSN

**Files:** `components/ui/button.tsx:23-28`

**Task**
Current: `default: rounded-xl`, `sm: rounded-lg`, `lg: rounded-full`, `icon: rounded-full`.
New: `default: rounded-lg`, `sm: rounded-md`, `lg: rounded-lg`, `icon: rounded-lg`.
Reserve `rounded-full` for pills/chips/avatars only.

**Acceptance**
- [ ] Mixing button sizes in one row looks coherent
- [ ] No visual regression on existing button usage (spot-check key pages)

---

### DSN-04 — Templates default to brand primary
**Priority:** P1 · **Owner:** DSN + FE

**Files**
- `components/resume/templates/modern-template.tsx:56-57`
- `components/resume/templates/classic-template.tsx:47-48`
- `app/dashboard/dashboard-content.tsx:23-30` (`DEFAULT_CUSTOMIZATION`)

**Task**
Change template default accents to read from `hsl(var(--primary))` OR introduce a `brandDefault: true` flag the template resolves at render time. User customization still works; the default matches the app chrome.

**Acceptance**
- [ ] New resume in Modern template renders with coral accents, not teal
- [ ] User-customized colors still render as set
- [ ] Screenshot of editor preview shows brand coral

---

### DSN-05 — Hero H1 responsive scale
**Priority:** P2 · **Owner:** DSN

**Files:** `app/home-content.tsx:95`

**Task**
Current: `text-6xl sm:text-5xl md:text-7xl lg:text-8xl` — shrinks going from mobile to sm.
New: `text-5xl sm:text-6xl md:text-7xl lg:text-8xl`.

**Acceptance**
- [ ] H1 size is monotonically non-decreasing across breakpoints

---

### DSN-06 — Template badges from manifest
**Priority:** P2 · **Owner:** FE + DSN

**Files:** `app/dashboard/components/resume-card.tsx:154-172`

**Task**
Replace the hardcoded 9-template color map with derivation from `template.styleCategory` (`ats` / `creative` / `professional` / `modern` / `student`).

**Acceptance**
- [ ] All 22 templates show a category-appropriate badge color
- [ ] Adding a new template requires no changes to `resume-card.tsx`

---

### DSN-07 — Empty state simplification
**Priority:** P2 · **Owner:** DSN

**Files:** `components/ui/empty-state.tsx:30-94`

**Task**
Remove animated gradient mesh, radial grid mask, blurred icon halo, `group-hover:animate-pulse`. Keep icon + title + description + CTA.

**Acceptance**
- [ ] Empty state is calm and inviting, not more decorated than real content
- [ ] Icon, title, description, CTA all present

---

### DSN-08 — Editor toolbar rhythm
**Priority:** P2 · **Owner:** DSN + FE

**Files:** `components/resume/editor-header.tsx:177,238,259,326`

**Task**
Standardize all toolbar buttons to `h-9`, `rounded-lg`, `gap-2`. Replace `bg-amber-500` saving indicator with `hsl(var(--warning))` token.

**Acceptance**
- [ ] All editor toolbar buttons share one height, radius, and gap
- [ ] Saving indicator uses the warning token

---

### DSN-09 — Typographic scale utilities
**Priority:** P2 · **Owner:** DSN

**Files:** `app/globals.css`

**Task**
Add `@layer components` utilities: `.h-display`, `.h-1`, `.h-2`, `.h-3`, `.body-lg`, `.body-sm` with responsive scales.
Refactor at least the homepage, pricing, and login H1s to use these utilities.

**Acceptance**
- [ ] New utilities defined in `globals.css`
- [ ] At least 3 pages use the utilities instead of ad-hoc classes

---

## Phase 7 — Test coverage and quality infra

### TEST-01 — PDF export route tests
**Priority:** P0 · **Owner:** QA + BE · **Related:** SEC-01

**Files (new):** `app/api/user/export-pdf/__tests__/route.test.ts`

**Task**
Mock puppeteer. Cover:
- Auth required (401 without token)
- Zod validation (400 on invalid shape)
- Body size cap (413 on > 1MB)
- Malicious `<script>` in `personalInfo.summary` stripped from output
- Empty resume guard (matches Phase 1.4 fix)
- Content-type + disposition headers on success
- Returns a blob on happy path

**Acceptance**
- [ ] All above cases covered
- [ ] Runs in < 3s
- [ ] Part of CI run

---

### TEST-02 — `use-saved-resumes` hook tests
**Priority:** P1 · **Owner:** QA

**Files (new):** `hooks/__tests__/use-saved-resumes.test.ts`

**Task**
Cover:
- Add/update/delete flow
- `mergeUniqueResumes` dedup on pagination
- `PlanLimitError` propagation from Firestore service
- `timestampToISO` with all 5 shapes it handles
- Pagination cursor logic (next page, end-of-list)

**Acceptance**
- [ ] All public methods of the hook exercised
- [ ] ≥ 80% line coverage on the file

---

### TEST-03 — `use-cover-letter` hook tests
**Priority:** P1 · **Owner:** QA

**Files (new):** `hooks/__tests__/use-cover-letter.test.ts`

**Task**
Cover:
- `?id=` loads existing
- Save with `?id=` updates in place (no duplicate Firestore doc)
- Save without `?id=` creates new
- Autosave persists to localStorage
- localStorage restore on reload

**Acceptance**
- [ ] Edit-vs-create branch fully exercised
- [ ] No-duplicate-doc assertion present

---

### TEST-04 — `use-saved-cover-letters` hook tests
**Priority:** P1 · **Owner:** QA

**Files (new):** `hooks/__tests__/use-saved-cover-letters.test.ts`

**Task**
Same template as TEST-02 applied to cover letters. Include plan-limit (free tier 3 cover letters).

**Acceptance**
- [ ] CRUD + pagination + plan limit covered

---

### TEST-05 — `firestore.ts` CRUD tests
**Priority:** P1 · **Owner:** QA + BE · **Related:** BUG-01

**Files (new):** `lib/services/__tests__/firestore.test.ts`

**Task**
Cover `savedResumes` subcollection CRUD against the admin-DB mock in `tests/mocks/firebase.ts`. Critical: the transaction-wrapped `saveResume` from BUG-01 must have a concurrent-write test.

**Acceptance**
- [ ] Concurrent save test demonstrates PlanLimitError on the 4th save
- [ ] All CRUD operations covered

---

### TEST-06 — Schema migration matrix
**Priority:** P1 · **Owner:** QA

**Files (new):** `lib/types/__tests__/migrations.test.ts`

**Task**
Round-trip legacy resume shapes through `loadResume`:
- No `schemaVersion` (v0)
- Old `courses[]` shape pre-certifications consolidation
- Future v2 placeholder

Assert no data loss, no silent field drops.

**Acceptance**
- [ ] Three+ legacy shapes tested
- [ ] Adding a new schema version prompts adding a new test row

---

### TEST-07 — Reorder edge cases
**Priority:** P1 · **Owner:** QA

**Files:** `hooks/__tests__/use-resume.test.ts` (extend)

**Task**
Add cases for 5-item work experience list:
- First → last
- Last → first
- Middle → middle
- Same-index no-op

Repeat for education, skills, projects, certifications.

**Acceptance**
- [ ] 20+ new test cases covering reorder edge conditions

---

### TEST-08 — Playwright a11y integration
**Priority:** P1 · **Owner:** QA · **Enforces:** A11Y guardrails

**Files**
- `package.json` (devDeps)
- `e2e/template-editor.spec.ts`
- `e2e/auth.spec.ts`

**Task**
1. `npm i -D @axe-core/playwright`
2. Inject axe after page load in key specs.
3. Fail on `serious` and `critical` violations.

**Acceptance**
- [ ] Running Playwright specs reports axe violations
- [ ] CI job fails when a new page introduces a critical a11y issue

---

### TEST-09 — E2E happy-path test
**Priority:** P1 · **Owner:** QA

**Files (new):** `e2e/editor-happy-path.spec.ts`

**Task**
Full flow (against test account + reset):
1. Signup (or login to test account after reset)
2. Onboarding: choose role, choose template
3. Editor: fill first name, add one work experience with bullet
4. Save
5. Export PDF
6. Return to dashboard
7. Assert resume card appears

**Acceptance**
- [ ] Runs green in CI
- [ ] Fails loudly if any step breaks

---

### TEST-10 — Coverage thresholds
**Priority:** P2 · **Owner:** QA

**Files:** `vitest.config.ts`

**Task**
Add `coverage.thresholds`:
```
statements: 60, functions: 60, branches: 50, lines: 60
```
Start lenient, ratchet up over time.

**Acceptance**
- [ ] `npm run test:coverage` fails if coverage drops below thresholds
- [ ] Current codebase passes the initial thresholds

---

### TEST-11 — husky + lint-staged pre-commit
**Priority:** P2 · **Owner:** FS lead

**Files**
- `package.json`
- `.husky/pre-commit` (new)
- `.lintstagedrc` or `package.json` config

**Task**
1. `npm i -D husky lint-staged`
2. `npx husky init`
3. `.husky/pre-commit` runs `npx lint-staged`
4. Configure `lint-staged` to run `eslint --fix` on `*.{ts,tsx}` and `tsc --noEmit` project-wide (or targeted).

**Acceptance**
- [ ] `git commit` with a lint error is blocked locally
- [ ] Hook can be bypassed with `--no-verify` only when explicitly needed

---

### TEST-12 — Wire full test suite into CI
**Priority:** P2 · **Owner:** FS lead

**Files:** `.github/workflows/ci.yml`, `.github/workflows/smoke-tests.yml`

**Task**
1. Run the full Playwright suite (currently only `test:e2e:smoke`).
2. Run `test:rules` (Firestore rules tests — currently excluded).
3. Run `e2e/visual-auth.spec.ts` (exists but unwired).

**Acceptance**
- [ ] CI runs full Playwright + rules tests + visual regression on PRs
- [ ] Caching used to keep CI time reasonable

---

## Phase 8 — Post-launch (plan of record)

These are NOT launch blockers. Tracked for visibility.

### DEBT-01 — Move PDF rendering off `@sparticuz/chromium-min` tarball
**Priority:** P2 · **Owner:** BE

Current supply chain risk: `lib/services/pdf-renderer.ts:33` fetches Chrome from a third-party GitHub URL. Options: Vercel Browser Rendering, Browserless.io, dedicated Cloud Run worker.

---

### DEBT-02 — Extract template primitives
**Priority:** P2 · **Owner:** FE

25 templates with 400-728 lines each, 1500+ lines of copy-paste. Extract `useGroupedSkills`, `<TemplateSection>`, shared date-sort helpers to `components/resume/templates/shared/`.

---

### DEBT-03 — Reduce `"use client"` footprint
**Priority:** P2 · **Owner:** FE

Target: 78% → ~30%. Marketing, blog, about, privacy, cookies, terms, `/vs/*` all become RSCs.

---

### FEAT-06 — Lead magnet infrastructure
**Priority:** P2 · **Owner:** BE + MKT

Gated PDFs: "47-point ATS Checklist", "Top 100 Resume Action Verbs". Email capture → nurture sequence (requires transactional email provider).

---

### FEAT-07 — Testimonial collection system
**Priority:** P2 · **Owner:** FS + MKT

Post-export modal → 5-star → quote → opt-in publish. Firestore `testimonials/{id}` with moderation. Renders on homepage/pricing/`/vs/*` where non-empty.

---

### FEAT-08 — Role/industry landing pages
**Priority:** P2 · **Owner:** MKT + FE

`/resume-templates/software-engineer`, `/resume-templates/nurse`, `/resume-templates/student`. Reuse existing templates with role-specific copy.

---

### DEBT-04 — Refactor `hooks/use-resume.ts`
**Priority:** P2 · **Owner:** FE

1,120 lines through a single reducer. Split by concern or evaluate Zustand.

---

### FEAT-09 — Payment integration (BLOCKED until provider chosen)
**Priority:** P2 · **Owner:** BE · **Blocked on:** payment provider decision

1. Pick provider (Paddle / Lemon Squeezy / Polar / Stripe)
2. Wire Checkout
3. Webhook → `users/{uid}.subscription`
4. `plan='premium'` side effects: unlimited credits, unlock premium features via `launchFlags` overrides
5. Email waitlist members when live

---

### FEAT-10 — Admin dashboard
**Priority:** P2 · **Owner:** FS

`/app/api/admin/*` exists but no UI. Build: waitlist viewer, user search, plan override, credit grant, abuse-guard overrides. Gated by `lib/config/admin.ts`.

---

## Dependency graph (at a glance)

```
OPS-01 → everything
OPS-02 → DOC-01 (clarifies PDF stack)
SEC-01 → TEST-01
BUG-01 → TEST-05
FEAT-01 → FEAT-02 → FEAT-03 → CONTENT-02
INFRA-01 → INFRA-02 → (all event tracking)
FEAT-05 → FEAT-04
UX-01 → UX-02
CONTENT-01 → CONTENT-05 → CONTENT-06
```

## Effort buckets (rough sizing)

- **XS** (< 1 hour): OPS-02, DOC-01, BUG-03, SEC-03, PERF-01, BUG-02, BUG-04, BUG-05, CONTENT-06, SEO-07, DSN-03, DSN-05, DSN-07, DSN-08, FEAT-01
- **S** (half day): SEC-02, CONTENT-01, CONTENT-03, CONTENT-04, CONTENT-05, UX-02, UX-03, UX-04, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06, SEO-02, SEO-05, SEO-07, SEO-08, SEO-09, DSN-06, DSN-09, TEST-06, TEST-07, TEST-10, TEST-11
- **M** (1-2 days): SEC-01, BUG-01, FEAT-04, FEAT-05, UX-01, A11Y-01, SEO-03, SEO-04, SEO-06, DSN-01, DSN-02, DSN-04, TEST-01, TEST-02, TEST-03, TEST-04, TEST-05, TEST-08, TEST-09, TEST-12, INFRA-01, INFRA-02
- **L** (multi-day): FEAT-02, FEAT-03, CONTENT-02, CONTENT-07, SEO-01, OPS-01 (depends on WIP complexity)

## P0 launch-blocker checklist

All of these must be DONE to flip DNS:

- [ ] OPS-01 WIP committed/shelved
- [ ] OPS-02 Stale worktree deleted
- [ ] CONTENT-01 Fake testimonials removed
- [ ] DOC-01 CLAUDE.md accurate
- [ ] SEC-01 PDF export hardened
- [ ] BUG-01 Plan-limit transactions
- [ ] FEAT-01 ATS flags enabled
- [ ] FEAT-02 ATS panel built
- [ ] FEAT-03 ATS panel wired
- [ ] CONTENT-02 Homepage rewritten
- [ ] INFRA-01 PostHog installed
- [ ] INFRA-02 Core events instrumented
- [ ] FEAT-04 Waitlist form
- [ ] FEAT-05 Waitlist API
- [ ] CONTENT-04 Pricing differentiated
- [ ] CONTENT-05 Social proof gated/removed
- [ ] UX-01 Funnel collapsed
- [ ] UX-02 PersonalInfo prefill
- [ ] A11Y-01 Keyboard DnD
- [ ] BUG-04 Enter footgun
- [ ] TEST-01 PDF route tested
- [ ] Build + lint + typecheck green
- [ ] Lighthouse ≥ 90 perf / 100 a11y on /, /pricing, /login
- [ ] Manual regression checklist from launch-readiness.md Phase 7.12 passed
