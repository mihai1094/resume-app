# Launch Readiness Plan

## Status Snapshot — 2026-04-12

- P0/P1/P2/P3/P4/P5 launch items din planul de mai jos sunt în mare parte implementate în repo.
- `live ATS scoring`, homepage ATS wedge, OG/SEO additions, launch test coverage, pre-commit, UX fixes și free-plan correctness sunt deja livrate.
- Un MVP pentru `8.2` template primitives, `8.5` testimonial collection system și `8.9` admin dashboard există acum în cod.
- Principalul item rămas nerezolvat înainte de post-payment work este rularea completă a happy-path E2E într-un mediu cu credentials/test data valide.

Consolidated action plan from the 7-role audit (CEO, Fullstack, QA, Design, UX, Marketing, SEO). Ordered by priority bands, not time estimates. Each phase is broadly sequential but tasks within a phase can run in parallel across roles.

## Goals

1. Ship a credible, secure V1 without fake claims or dead CTAs.
2. Establish the "live ATS scoring" wedge as the product's reason to exist.
3. Instrument the funnel so post-launch iteration is data-driven.
4. Stub all monetization integration points so any payment provider can drop in later.
5. Pay down the highest-risk tech debt (security, a11y, test gaps).

## Explicitly out of scope (deferred until payment system lands)

- Checkout / payment provider integration
- Subscription webhook handling and plan state machine
- End-to-end upgrade flow (user clicks "Upgrade" → pays → `plan='premium'`)
- Prorated plan changes, invoices, receipts

**What we CAN do today that unblocks the future payment work:**

- Collect the waitlist (Firestore `waitlist/{id}`) so there's a list to email when checkout lands
- Instrument `upgrade_click` events so the conversion funnel is ready to measure immediately
- Build the real free/premium differentiation on `/pricing` so the value story exists
- Keep `aiCreditsUsed` / `plan` / `subscription` fields server-only (already the case via `firestore.rules:61,66`) — a new provider just writes to these via Admin SDK

---

## Phase 0 — Stop the bleeding

Small, urgent, unblocks everything else.

### 0.1 Commit or shelve the WIP branch
- `git status` shows ~286 modified files on `preview` with net -15k lines — unreviewable
- Review, split into coherent commits, or move aside to `wip/*` branches
- Nothing else should merge on top of this

### 0.2 Delete stale worktree
- `rm -rf .claude/worktrees/silly-dirac`
- Stops polluting greps with ghost `@react-pdf/renderer` code and duplicated template files
- Ensures `.claude/worktrees/` is in `.gitignore`

### 0.3 Remove fake testimonials (credibility + legal)
- `components/home/social-proof.tsx` — currently contains fabricated Google/Amazon/Meta quotes ("8 out of 10 callbacks at Google"). Delete the file OR strip to empty shell behind a `TESTIMONIALS.length > 0` guard
- `app/register/page.tsx:213` — "Join thousands of job seekers who landed their dream roles" → replace with "Start free. Export PDFs. Keep your data private."
- Never reintroduce the fakes, even temporarily

### 0.4 Update `CLAUDE.md` PDF section
- Claims `@react-pdf/renderer` + `templates/pdf/`; reality is puppeteer + `@sparticuz/chromium-min` rendering HTML templates via `lib/services/pdf-renderer.ts` + `lib/services/template-serializer.ts`
- Fix both the "Tech Stack" bullet and the "PDF Export" note
- Also drop "base color: slate" — actual palette is warm cream + coral + golden amber per `app/globals.css:18-84`

---

## Phase 1 — Security & correctness

Real bugs with real user/security impact. No user-facing feature work in this phase.

### 1.1 Harden `/api/user/export-pdf`
- File: `app/api/user/export-pdf/route.ts:45-50`
- Current state: `data: any`, no Zod, no size cap, `allowJavaScript: true` in headless Chromium
- Add Zod schema mirroring `ResumeData` (import from `lib/types/resume.ts`)
- Reject body > 1MB (return 413)
- Set `allowJavaScript: false` in the puppeteer page config in `lib/services/pdf-renderer.ts:199-207` (templates are SSR'd React output — don't need JS)
- Sanitize string fields during serialization (use `isomorphic-dompurify` or equivalent)
- Acceptance: malicious `<script>` payload in `personalInfo.summary` is stripped; 50MB payload returns 413; legitimate export unchanged

### 1.2 Transaction-wrap plan-limit checks
- File: `lib/services/firestore.ts:628-664` (`saveResume`)
- File: `lib/services/firestore.ts:905-916` (`saveCoverLetter`)
- Current: `getSavedResumeCount` then `setDoc` — two concurrent saves at count=2 can both pass
- Wrap count-then-write in `runTransaction`; count inside the transaction

### 1.3 Cap undo history
- File: `hooks/use-resume.ts:142-147`
- Cap `state.past` to 50 entries (FIFO eviction)
- Prevents memory bloat from deep-cloning the entire resume on every edit over long sessions

### 1.4 Fix `isResumeEmpty` false-negative
- File: `lib/services/export.ts:200-214`
- Currently only checks `workExperience`, `education`, `skills`, `languages`, `courses`
- Include: `projects`, `certifications`, `hobbies`, `extraCurricular`
- A resume with only projects currently fails to export with a misleading "empty" error

### 1.5 Verify credit idempotency TTL policy
- File: `lib/services/credit-service-server.ts:348-350`
- Comment says "TTL via Firestore TTL policy" but no TTL field is written
- Confirm the Firestore TTL policy is configured on `users/{uid}/credit_idempotency` subcollection
- If not: add a `ttl: Timestamp` field (e.g. `now + 24h`) and configure the policy in Firebase console
- Otherwise the collection grows unbounded forever

### 1.6 Rate-limit KV assertion
- File: `lib/api/rate-limit.ts:72`
- Current: in-memory `Map` fallback when KV unavailable — useless across serverless instances
- Add a startup check that throws if `KV_URL` (or equivalent) is missing in `NODE_ENV=production`
- File: `lib/config/runtime-env.ts` is the right place to assert

### 1.7 Fix `firestore.indexes.json` typo
- File: `firestore.indexes.json:19-25`
- Defines an index on `users.userId` which is meaningless (`userId` IS the doc id)
- Remove or replace with the intended field

---

## Phase 2 — The wedge: live ATS scoring

Our moat is sitting in the repo disabled. Turn it on and make it the hero.

### 2.1 Enable ATS feature flags
- File: `config/launch.ts:19-41`
- Set `aiScoreResume: true`, `aiAnalyzeAts: true`
- Leave interview prep / job tracker / analytics disabled — those are not the wedge

### 2.2 Live ATS score panel in editor
- New component: `components/resume/ats-score-panel.tsx`
- Displays: overall score (0-100), 3-5 subscore breakdown (formatting, keywords, content, length), top 3 actionable fixes
- Heuristic score recomputes client-side on debounced edit (no credit cost) — build lightweight scoring in `lib/ai/resume-scoring.ts` if the existing one is server-only
- "Deep AI analysis" button triggers the 2-credit `aiAnalyzeAts` path for semantic feedback
- Reuse `hooks/use-cached-resume-score.ts`
- Placement: right side of editor on desktop (replaces or augments existing preview toggle), bottom sheet on mobile
- Update `components/resume/resume-editor.tsx` layout accordingly

### 2.3 Rewrite homepage around the wedge
- File: `app/home-content.tsx`
- New H1 (pick one): "See your ATS score before the recruiter does" / "The only resume builder that scores you live" / "Write bullets. Watch your ATS score climb."
- Hero secondary: free PDF export + 30 AI credits on signup
- Above-the-fold: live ATS score demo widget (interactive if feasible, animated GIF if not)
- Feature sections: reorder so ATS scoring leads, templates second, AI bullets third

### 2.4 Pricing headline
- File: `app/pricing/page.tsx`
- Frame Free vs Premium around ATS analysis depth: "Free: heuristic ATS score / Premium: unlimited AI-powered analysis + keyword gap detection"

---

## Phase 3 — Launch credibility

Without this, we launch blind and lose every interested lead.

### 3.1 Product analytics (PostHog)
- Add `posthog-js` + `posthog-node`
- Env: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- GDPR gate: only init after cookie consent from existing `components/privacy/` flow
- Core funnel events (name them now so we don't rename later):
  - `landing_view`, `cta_click`
  - `signup_start`, `signup_complete`
  - `onboarding_step` (step: 1|2|3)
  - `template_select` (templateId)
  - `editor_opened`, `editor_first_edit`
  - `section_complete` (section: personal|experience|...)
  - `ats_score_computed` (score, subscores)
  - `ai_action_start`, `ai_action_complete`, `ai_action_failed` (action, creditsUsed)
  - `credits_low` (remaining: 5), `credits_exhausted`
  - `save_success`, `save_failed`
  - `export_pdf_start`, `export_pdf_success`
  - `pricing_view`, `upgrade_click` (source: editor|pricing|limit_dialog|credit_exhausted)
  - `plan_limit_hit` (resource: resumes|cover_letters|credits)
  - `waitlist_join`
- Server-side: instrument AI routes in `lib/api/ai-route-wrapper.ts` to fire `ai_action_complete`

### 3.2 Waitlist capture (replaces "Coming Soon")
- File: `app/pricing/page.tsx:175-186`
- Replace disabled button with form: email + optional role dropdown
- New route: `app/api/waitlist/route.ts` — unauthenticated but rate-limited via existing `abuse-guard`
- Firestore: `waitlist/{autoId}` with `{ email, role, createdAt, source }`
- Admin rule: server-only write (extend `firestore.rules`)
- Confirmation: simple toast; wire real email if transactional email exists, else defer
- Fire `waitlist_join` PostHog event

### 3.3 Real free/premium differentiation
- File: `app/pricing/page.tsx:36-44`
- Current: nearly identical columns
- Rewrite `features[]` so rows genuinely diverge. Suggested matrix:

| Feature | Free | Premium |
|---|---|---|
| Resumes | 3 | Unlimited |
| Cover letters | 3 | Unlimited |
| AI credits | 30 (one-time) | Unlimited |
| ATS heuristic score | ✓ | ✓ |
| AI-powered ATS analysis | — | ✓ |
| AI bullet improvement | ✓ (counts credits) | ✓ (no limits) |
| Cover letter AI generation | ✓ (counts credits) | ✓ (no limits) |
| Job description tailoring | — | ✓ |
| Keyword gap detection | — | ✓ |
| PDF export | ✓ | ✓ |
| All templates | ✓ | ✓ |
| Priority support | — | ✓ |
| Early access to new features | — | ✓ |

- Feature rows can reference features currently flagged OFF in `config/launch.ts` — they become the upgrade story without needing to ship immediately

### 3.4 Homepage social proof strategy
- Option A (recommended): ship WITHOUT social proof block until real quotes exist. The hero + ATS demo + trust pills are enough
- Option B: build a real collection system now (see Phase 8.5)
- **Do NOT** reimport `components/home/social-proof.tsx` until its content is real

### 3.5 Register page copy alignment
- File: `app/register/page.tsx:202-204`
- Current H1 "Land your dream job faster" — generic and inconsistent with homepage voice
- Align with chosen wedge: "See your ATS score. Land more interviews." or similar

---

## Phase 4 — UX critical fixes

Drop-off and rage-quit risks called out by the UX audit.

### 4.1 Collapse signup → first resume into one funnel
- File: `app/register/page.tsx:72-81`
- Change post-register redirect: `router.push('/onboarding')` (not `/templates`) UNLESS there's a prior `auth_redirect` to a specific editor URL
- File: `app/onboarding/onboarding-content.tsx`
- Pre-fill `jobTitle` step from empty (new user has nothing yet)
- Template step: curate 3 templates per role chip instead of showing all 22
- Post-onboarding redirect: `/editor/new?template=...&startSection=experience` — land on Experience (not Personal), since name/email are already filled from registration
- File: `components/resume/resume-editor.tsx` — accept `startSection` query param and pre-fill `PersonalInfo` from `user.displayName` + `user.email` on first mount if empty

### 4.2 Drag-and-drop keyboard accessibility
- File: `components/ui/sortable-list.tsx:99-114`
- Current: `DragHandle` uses only `onPointerDown`, no keyboard affordance
- Add Move up / Move down icon buttons with `aria-label`, visible on `:focus-visible` or always on mobile
- Reuse existing reorder actions from `hooks/use-resume.ts`
- Acceptance: keyboard-only user can reorder work experience, education, skills, projects

### 4.3 Fix Enter-to-advance footgun
- File: `hooks/use-keyboard-shortcuts.ts:120-133`
- File: `app/onboarding/onboarding-content.tsx:167-177`
- Add target check: ignore Enter when `event.target` is `HTMLInputElement`, `HTMLTextAreaElement`, `[contenteditable="true"]`, or `HTMLButtonElement`
- Prevents: pressing Enter on a role chip advancing two steps at once, pressing Enter on mobile "Go" button force-advancing sections

### 4.4 Wire `PlanLimitDialog` into editor save path
- File: `components/resume/resume-editor.tsx:787-790`
- Current: free-tier save failure shows a dead-end toast
- Replace with existing `PlanLimitDialog` (already wired in `dashboard-content.tsx`, `home-content.tsx`)
- Dialog must offer: "Join premium waitlist" (from Phase 3.2) + "Delete an existing resume" link → dashboard

### 4.5 Expand `hasUnsavedContent` heuristic
- File: `components/resume/resume-editor.tsx:284-287`
- Currently checks only `firstName`, `workExperience`, `education` presence
- Include: `skills.length > 0`, `projects.length > 0`, `certifications.length > 0`, `personalInfo.email`, `personalInfo.summary?.length > 0`
- Prevents silent data loss on accidental back navigation

### 4.6 Cover letter prefills from latest resume
- File: `components/cover-letter/cover-letter-editor.tsx:126`
- When `?id=` absent (creating new): load most recent saved resume via `useSavedResumes(user?.id)` and call `syncFromPersonalInfo` on mount
- When `?id=` present (editing existing): preserve stored personal info
- Users stop re-typing name/email/phone

### 4.7 `AiAction` disabled a11y
- File: `components/ai/ai-action.tsx:103-115`
- Current: `<span role="button">` on disabled state — screen readers announce as a normal button
- Fix: render as `<button disabled aria-disabled="true">` or add `aria-disabled="true"` to the span with `aria-describedby` pointing at the reason ("Out of credits")

### 4.8 Password strength screen-reader support
- File: `app/register/page.tsx:355-406`
- Link the strength indicator to the password input via `aria-describedby`
- Add `aria-live="polite"` to the strength label so changes are announced
- Group requirement list under `role="list"` with proper semantics

### 4.9 Respect `prefers-reduced-motion`
- File: `components/resume/resume-editor.tsx:563-607` (`celebrateSectionComplete`)
- Wrap in `window.matchMedia('(prefers-reduced-motion: reduce)').matches` check
- Also audit framer-motion usage in auth pages — add `MotionConfig reducedMotion="user"` at root if not already

### 4.10 Block silent section-change scroll jumps
- File: `components/resume/resume-editor.tsx:634-653`
- Currently forces `scroll-behavior: auto` scroll-jump on section change
- Disorients screen-magnifier + reduced-motion users
- Either use smooth scroll respecting reduced-motion preference, or rely on focus-based scroll (focus the first field of the new section and let the browser handle it)

### 4.11 `TemplateCustomizer` focus trap
- File: `components/resume/resume-editor.tsx`
- When customizer panel is open, trap focus within it, close on Escape, return focus on close
- Or convert to a proper `Dialog`/`Sheet` primitive which handles this automatically

---

## Phase 5 — SEO fixes

Ordered by traffic-impact.

### 5.1 Convert `app/home-content.tsx` to RSC with client islands
- Biggest single CWV win available
- Static sections (hero text, how-it-works, FAQ, templates preview) → server components
- Extract ONLY interactive pieces into small client islands: `StickyMobileCTA`, `PlanLimitDialog`, the new ATS score demo widget
- Same pattern for `app/templates/page.tsx`, marketing pages (`/about`, `/vs/*`, `/blog`), legal pages
- Target: reduce `"use client"` count from 164/210 to ~80/210

### 5.2 Product/Offer JSON-LD on pricing
- File: `app/pricing/page.tsx`
- Add `application/ld+json` with `Product` + two `Offer` nodes (Free €0, Premium €12/mo)
- Required for commercial-intent rich results
- Add FAQ schema — the page already has comparison content, structure it as 6-8 pricing FAQs ("Is it really free?", "What happens when my 30 credits run out?", "Will you charge my card?")

### 5.3 `/templates` content + schema
- File: `app/templates/page.tsx`
- Currently thin shell (`<h1>Choose Your Template</h1>` + grid)
- Add intro paragraph (~150 words): "Free ATS-friendly resume templates..."
- Add `ItemList` schema listing all 22 templates with `url`, `name`, `image`
- Add `FAQPage` schema for template-selection questions
- Add H2 section headers by category: ATS-Optimized / Modern / Creative / Professional / Student

### 5.4 Blog index schema + breadcrumbs
- File: `app/blog/page.tsx`
- Add `Blog` + `ItemList` of `BlogPosting` stubs
- Add `BreadcrumbList` (missing)
- Same `BreadcrumbList` addition to `/pricing` and `/templates` root

### 5.5 Deduplicate `SoftwareApplication` schema
- File: `app/layout.tsx:106-138` vs `app/free-resume-builder/page.tsx:87`
- Keep ONE global node; remove per-page duplicates
- File: `lib/seo/structured-data-advanced.ts` — audit `getArticleSchema` to include `publisher.logo.width`/`height` (currently missing, Google Rich Results flags)

### 5.6 Per-page OG images
- Everything currently falls back to `${baseUrl}/og-image.png` per `lib/seo/metadata.ts:86`
- Use `next/og` to generate dynamic OG images for: blog posts (title + author), templates (template preview), `/vs/*` (vs comparison image)
- File new route: `app/api/og/[...slug]/route.tsx`

### 5.7 Title length fix
- File: `lib/seo/metadata.ts:124`
- Current `absolute` title is 66 chars (over the 65-char SERP safe limit)
- New: "Free AI Resume Builder with PDF Export | ResumeZeus" (52 chars)

### 5.8 Five more `/vs/*` competitor pages
- File: `lib/data/comparison-pages.ts`
- Add: `enhancv`, `rezi`, `kickresume`, `teal`, `resume-io`
- Cheap to produce given the existing template; high commercial intent

### 5.9 Public resume schema + per-resume indexability
- File: `app/u/[username]/[slug]/page.tsx:22-77`
- Add `ProfilePage` or `Person` JSON-LD
- Add per-resume `allowIndexing` flag to public resume doc; default `false`, user opt-in via share settings
- Respect flag in `metadata.robots` and in `app/sitemap.ts` filter

### 5.10 Remove duplicate marketing pages
- `/ai-resume-builder` vs `/free-resume-builder` currently near-duplicates — either differentiate (one targets "free", one targets "AI") with distinct content and non-overlapping keywords, or consolidate and redirect one to the other

---

## Phase 6 — Design system cleanup

Systemic issues that block brand consistency and cost perceived quality.

### 6.1 Font stack diet
- File: `app/layout.tsx:32-87`
- Currently 9 font families load globally on every route
- Keep global: Inter (UI), Playfair Display (marketing display)
- Move to editor-only dynamic load: Libre Baskerville, Source Serif 4, Cormorant Garamond, EB Garamond, Lato, DM Sans
- JetBrains Mono: load only on routes that use it
- Target: 2 fonts on marketing + auth routes, 3-4 on editor

### 6.2 Tokenize the orange accent
- Add `--accent-display: 25 95% 53%` to `app/globals.css`
- Add Tailwind utility `.text-accent-display`, `.bg-accent-display` via `@layer components`
- Search/replace 154 literal `text-orange-*` / `bg-orange-*` hits across 30 files
- The italic-orange accent IS the brand signature — it must be tokenized or theming is impossible

### 6.3 Button radius scale
- File: `components/ui/button.tsx:23-28`
- Current: `default: rounded-xl`, `sm: rounded-lg`, `lg: rounded-full`, `icon: rounded-full` — mixing sizes in one row looks broken
- New: `default: rounded-lg`, `sm: rounded-md`, `lg: rounded-lg`, `icon: rounded-lg`
- Reserve `rounded-full` for pills/chips/avatars only

### 6.4 Resume templates honor brand primary
- File: `components/resume/templates/modern-template.tsx:56-57` — currently `#0d9488` teal
- File: `components/resume/templates/classic-template.tsx:47-48` — currently `#8b2942` burgundy
- File: `app/dashboard/dashboard-content.tsx:23-30` — `DEFAULT_CUSTOMIZATION` hardcodes teal
- Change defaults to read from `hsl(var(--primary))` OR introduce a `brandDefault: true` flag that resolves at render time
- User-level customization still works; DEFAULT matches the app chrome
- Result: first screenshot a user takes of their resume shows "ResumeZeus coral," not teal

### 6.5 Hero H1 responsive scale
- File: `app/home-content.tsx:95`
- Current: `text-6xl sm:text-5xl md:text-7xl lg:text-8xl` (shrinks 640-767px — unintentional)
- New: `text-5xl sm:text-6xl md:text-7xl lg:text-8xl`

### 6.6 Template badges from manifest
- File: `app/dashboard/components/resume-card.tsx:154-172`
- Replace 9-entry hardcoded color map with derivation from `template.styleCategory` (`ats` / `creative` / `professional` / `modern` / `student`)
- Scales to 22 templates and future ones

### 6.7 Empty state restraint
- File: `components/ui/empty-state.tsx:30-94`
- Remove animated gradient mesh + radial grid mask + blurred icon halo + `group-hover:animate-pulse`
- Keep: icon + title + description + CTA
- Save the dramatic treatment for `/not-found.tsx`

### 6.8 Editor toolbar rhythm
- File: `components/resume/editor-header.tsx:177,238,259,326`
- Currently mixes `h-9 rounded-xl`, `h-7 rounded-full`, `h-7 rounded-xl` in one row with three different gap sizes
- Standardize: `h-9`, `rounded-lg`, `gap-2` for all toolbar buttons
- Saving indicator: use `hsl(var(--warning))` token (already defined), not `bg-amber-500`

### 6.9 Typographic scale utilities
- Add to `app/globals.css @layer components`: `.h-display`, `.h-1`, `.h-2`, `.h-3` with responsive scales
- Eliminates every page re-inventing its H1 curve

---

## Phase 7 — Test coverage

### 7.1 PDF export route tests
- New: `app/api/user/export-pdf/__tests__/route.test.ts`
- Cover: auth required, Zod validation (valid/invalid shapes), body size cap (413), malicious `<script>` payload stripped, empty-resume guard, puppeteer mocked, content-type + disposition headers
- This is THE money path and has zero tests today

### 7.2 `use-saved-resumes` hook tests
- New: `hooks/__tests__/use-saved-resumes.test.ts`
- Cover: CRUD operations, pagination cursor logic, `mergeUniqueResumes` dedup on pagination, `PlanLimitError` propagation, `timestampToISO` with all 5 shapes it handles
- 447 lines of critical code with zero tests today

### 7.3 Cover letter hook tests
- New: `hooks/__tests__/use-cover-letter.test.ts`
- New: `hooks/__tests__/use-saved-cover-letters.test.ts`
- Cover: edit-by-`?id=` loads existing, save-with-`?id=` updates in place, save-without-`?id=` creates new, autosave persists to localStorage, localStorage restore on reload
- The "edit vs create" branch is specifically called out as risky in `CLAUDE.md`

### 7.4 Firestore service CRUD tests
- New: `lib/services/__tests__/firestore.test.ts`
- Cover: `savedResumes` subcollection — set, update, delete, list with pagination
- Transaction correctness on plan-limit path (Phase 1.2 test partner)

### 7.5 Schema migration matrix
- New: `lib/types/__tests__/migrations.test.ts`
- Round-trip legacy resume shapes through `loadResume`:
  - No `schemaVersion` (v0)
  - Old `courses[]` shape pre-certifications consolidation
  - Future v2 placeholders
- Assert no data loss, no silent field drops

### 7.6 Reorder edge cases
- Extend: `hooks/__tests__/use-resume.test.ts`
- 5-item work experience list: first→last, last→first, middle→middle, same-index no-op
- Same suite for education, skills, projects, certifications
- Catches index-math bugs common in drag-and-drop

### 7.7 Playwright a11y integration
- Add `@axe-core/playwright` to devDeps
- Inject into `e2e/template-editor.spec.ts` + `e2e/auth.spec.ts`
- Fail on `serious` / `critical` rules
- Enforces the `docs/ux/a11y-guardrails.md` promises

### 7.8 E2E happy-path test
- New: `e2e/editor-happy-path.spec.ts`
- Flow: signup → onboarding → template select → fill name + 1 work experience → save → export PDF → return to dashboard → card appears
- The single most important end-to-end path has no coverage today

### 7.9 Coverage thresholds
- File: `vitest.config.ts`
- Add `coverage.thresholds`: `statements: 60, functions: 60, branches: 50, lines: 60` (start lenient, ratchet up)
- Fails CI if coverage drops

### 7.10 Pre-commit hook
- Add `husky` + `lint-staged`
- Run `eslint --fix` + `tsc --noEmit` on staged files
- First line of defense; currently only CI catches issues

### 7.11 Wire full test suite into CI
- File: `.github/workflows/ci.yml`
- Run the full Playwright suite (not just `test:e2e:smoke`)
- Run `test:rules` (firestore rules — currently excluded via `--exclude`)
- Run `e2e/visual-auth.spec.ts` (currently sits in the repo unused)

### 7.12 Manual regression checklist (not tests, but required)
Before launch, manually verify:
- PDF export on templates with photo (`diamond`, `iconic`, `cubic`, others in `PHOTO_SUPPORTED_TEMPLATE_IDS`)
- Hitting free 3-resume limit (should show `PlanLimitDialog`, not dead toast)
- Cover letter edit-in-place (load via `?id=`, modify, save, verify no duplicate doc)
- Skills reorder with 12+ items across categories
- Mobile Safari PDF download
- Save a resume with ONLY projects filled (Phase 1.4 regression)
- Rapid concurrent saves from two browser tabs at plan limit (Phase 1.2 regression)

---

## Phase 8 — Strategic debt (post-launch)

Not blockers; plan-of-record for after V1 ships.

### 8.1 Move PDF rendering off `@sparticuz/chromium-min` tarball
- Current: `lib/services/pdf-renderer.ts:33` fetches Chrome tarball from a third-party GitHub URL on cold start (3-8s + supply chain risk)
- Options: Vercel Browser Rendering, Browserless.io, dedicated Cloud Run worker with a stable Chrome
- Decision criteria: cold-start time, cost per PDF, operational complexity

### 8.2 Extract template primitives
- 25 templates, 400-728 lines each, heavy copy-paste
- Extract: `useGroupedSkills(skills)` hook, `<TemplateSection title={...}>` primitive, `formatDate`/`sortWorkExperienceByDate` moved to `components/resume/templates/shared/`
- Target: -1500 lines of duplication

### 8.3 Reduce `"use client"` footprint
- Target: 78% → ~30%
- Marketing, blog, about, privacy, cookies, terms, `/vs/*` all become RSCs
- Biggest CWV improvement after Phase 5.1

### 8.4 Lead magnet infrastructure
- Gated PDF downloads: "47-point ATS Checklist", "Top 100 Resume Action Verbs", "Resume Templates by Industry"
- Email capture → nurture sequence (requires transactional email, e.g. Resend or Loops)
- Inline blog CTAs pointing at lead magnets

### 8.5 Testimonial collection system
- Post-export modal: "How was this?" → 5-star → quote → opt-in to publish
- Firestore `testimonials/{id}` with moderation state
- Render on homepage, pricing, `/vs/*` where non-empty
- Unblocks Phase 3.4 Option B for real social proof

### 8.6 Role/industry landing pages
- `/resume-templates/software-engineer`, `/resume-templates/nurse`, `/resume-templates/student`, etc.
- Reuses existing templates but with role-specific copy and targeted keywords
- High-volume long-tail SEO

### 8.7 Refactor `hooks/use-resume.ts`
- 1,120 lines with every mutation through a single reducer
- Split by concern (personal / experience / education / skills / meta) or evaluate Zustand
- Prerequisite for real-time collaboration if ever added

### 8.8 Payment integration (blocked)
- Pick provider (Paddle, Lemon Squeezy, Polar, or Stripe — decided separately)
- Wire Checkout
- Webhook → `users/{uid}.subscription`
- `plan='premium'` upgrade side effects: unlimited credits, unlock premium features via `launchFlags` overrides
- Email waitlist members when live

### 8.9 Admin dashboard
- Currently `/app/api/admin/*` exists but no UI
- Waitlist viewer, user search, plan override, credit grant, abuse guard overrides
- Internal-only, gated by `lib/config/admin.ts`

---

## Launch checklist (the "can we ship?" gate)

Tick all of these before flipping DNS / announcing:

- [ ] Phase 0 complete (WIP committed, fakes removed, CLAUDE.md current)
- [ ] Phase 1 complete (PDF secure, transactions atomic, undo capped)
- [ ] Phase 2 complete (ATS wedge live, homepage rewritten)
- [ ] Phase 3 complete (analytics firing, waitlist collecting, pricing differentiated)
- [ ] Phase 4.1–4.5 complete (critical UX fixes)
- [ ] Phase 5.1, 5.2, 5.7 complete (RSC home, pricing schema, title fix)
- [ ] Phase 6.1, 6.2, 6.4 complete (font diet, tokens, templates match brand)
- [ ] Phase 7.1, 7.8, 7.12 complete (PDF route tests, E2E happy path, manual regression)
- [ ] `NODE_ENV=production` build succeeds (`npm run build`)
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` clean
- [ ] Lighthouse ≥ 90 Performance / 100 Accessibility on `/`, `/pricing`, `/login`
- [ ] `robots.txt` and sitemap verified live; Google Search Console verified
- [ ] Error boundary tested (force a crash, verify user sees helpful message + Sentry captures)
- [ ] Cold-start PDF export tested on Vercel preview (not just local)
- [ ] All env vars set in Vercel: `GOOGLE_AI_API_KEY`, `KV_URL`, `NEXT_PUBLIC_POSTHOG_KEY`, Firebase config

---

## Work assignment suggestion

| Role | Primary phases |
|---|---|
| Lead / Fullstack | 0, 1, 2.1–2.2, 3.1–3.2, 7.10–7.11, 8.1 |
| Frontend | 2.2–2.4, 3.2–3.4, 4, 5.1, 5.6, 6 |
| Design | 6 (paired with Frontend) |
| UX | 4 (paired with Frontend), 7.12 manual regression |
| QA | 7 |
| Marketing | 2.3, 3.3–3.5, 5.8, 5.10, 8.4, 8.5, 8.6 |
| SEO | 5 |
| CEO / Product | scope gate, feature-flag decisions, launch go/no-go |
