# V1 Core Scope Freeze Plan

Date: 2026-02-14
Owner: Product + Engineering
Status: Draft (ready to execute)

## Goal

Ship a stable V1 with a narrow and clear user path, while keeping non-core code in the repository behind feature flags so it can be re-enabled in V2/V3 without reimplementation.

## V1 Core (Visible and Supported)

### 1) Resume editor
- Create/edit resume
- Core sections: Personal Info, Work Experience, Education, Skills
- Keep all existing templates visible for now

### 2) Save and sync
- Authentication (email/password)
- Save/sync resumes to Firestore
- Auto-save and reopen existing resumes

### 3) Basic AI (value demo)
- Generate bullets
- Generate summary
- Improve bullet

### 4) Export
- PDF export (required)
- JSON backup export (optional but allowed for V1)

### 5) One clear user path
- Create resume -> Fill content -> Use AI help -> Export PDF

### 6) Keep for this launch iteration
- Cover letter flows remain available
- All resume templates remain available

## Out of V1 Scope (Hidden, Not Deleted)

Keep code and tests. Hide from navigation, dashboards, onboarding, and feature entry points.

- Interview prep
- Job tracker
- Public sharing and analytics dashboards
- LinkedIn optimizer/import flows
- Advanced AI flows (tailor, batch enhance, ghost suggest, ATS deep analysis, etc.)
- Extra resume sections not needed for V1-first experience (can remain in data model)
- DOCX export

## Release Strategy: "Hide by Flag, Not by Deletion"

Use a centralized launch config and environment overrides. Do not remove routes/components.

### Flag categories

1. Product areas
- `launch.editor`
- `launch.saveSync`
- `launch.exportPdf`
- `launch.exportJson`
- `launch.ai.basic`

2. Optional/hidden areas
- `launch.coverLetter`
- `launch.interviewPrep`
- `launch.jobTracker`
- `launch.publicSharing`
- `launch.analytics`
- `launch.linkedin`
- `launch.exportDocx`

3. AI operation-level flags
- `launch.ai.generateBullets`
- `launch.ai.generateSummary`
- `launch.ai.improveBullet`
- `launch.ai.tailorResume`
- `launch.ai.batchEnhance`
- `launch.ai.atsAnalysis`
- `launch.ai.ghostSuggest`
- `launch.ai.optimizeLinkedin`

4. Template and section visibility
- `launch.templates.enabled = ["modern", "classic", "executive"]` (example)
- `launch.sections.coreOnly = true`

## Gating Rules

Apply gating at all 3 layers to avoid accidental exposure:

1) UI layer
- Hide menu entries, dashboard cards, buttons, tabs, and onboarding steps when a feature is disabled.

2) Route/page layer
- For disabled pages, redirect to dashboard/editor with a short "coming soon" message.

3) API layer
- Return a structured `403/404 feature-disabled` response for disabled feature routes.
- Keep auth and rate-limit checks in place even for disabled routes.

## Phased Execution Plan

## Phase 0 - Scope lock (0.5 day)
- Freeze V1 feature list from this document.
- Write "V1 only" acceptance criteria for product, QA, and release checklist.

## Phase 1 - Flag foundation (1 day)
- Add centralized launch flag module (single source of truth).
- Add env-backed overrides in `.env.example` and runtime config.
- Add helper utilities: `isFeatureEnabled("...")`, `isAiOperationEnabled("...")`.

## Phase 2 - Hide non-core UI (1-2 days)
- Header/navigation cleanup to show only V1 journey.
- Dashboard cleanup: show "Create/Edit/Export" core cards only.
- Onboarding cleanup: direct users to editor flow.

## Phase 3 - Protect routes and APIs (1 day)
- Gate non-core pages.
- Gate non-core API endpoints.
- Ensure disabled endpoints return consistent error shape.

## Phase 4 - Reduce test surface for launch (1 day)
- Define a V1 smoke test suite focused on:
  - Signup/login
  - Create/edit/save
  - Basic AI (3 operations)
  - PDF export
- Keep full regression suite in repo but make V1 smoke suite required for deploy.

## Phase 5 - Release verification (0.5-1 day)
- Manual sanity pass on production build.
- Confirm no disabled feature entry points are reachable from normal UI.
- Confirm existing deep links are gracefully handled.

## V1 Acceptance Criteria

- User can complete: Create -> Fill -> AI assist -> Export PDF without dead ends.
- All existing templates are visible and selectable.
- Only 3 basic AI operations are visible and callable.
- Disabled features are not visible in primary navigation.
- Disabled feature URLs/APIs are safely blocked and logged.
- No code deletion for deferred features.

## Suggested Flag Defaults for V1

- Enabled:
  - editor, saveSync, exportPdf, exportJson, ai.basic
  - coverLetter, allTemplates
  - ai.generateBullets, ai.generateSummary, ai.improveBullet
- Disabled:
  - interviewPrep, jobTracker, publicSharing, analytics, linkedin, exportDocx
  - ai.tailorResume, ai.batchEnhance, ai.atsAnalysis, ai.ghostSuggest, ai.optimizeLinkedin
- Sections:
  - Core-first only in UI (data model remains intact)

## Reactivation Path (V2/V3)

For each deferred feature:

1. Enable flag in staging only.
2. Run feature-specific test checklist.
3. Expose entry point in UI.
4. Monitor errors/usage for 3-7 days.
5. Roll out to production by toggling flag only.

This gives incremental releases without risky merges or large rebases.

## Risks and Mitigations

- Risk: Feature is hidden in UI but still callable via API.
  - Mitigation: Mandatory API-level gating.

- Risk: Old links/bookmarks break.
  - Mitigation: Redirect + "coming soon" fallback.

- Risk: Flag sprawl or inconsistent usage.
  - Mitigation: Single config source + typed helper accessors.

- Risk: V1 still feels too broad.
  - Mitigation: Enforce V1 smoke suite and block deploy on failures.

## Immediate Next Task List

1. Implement central launch flags and environment defaults.
2. Apply UI gating to navigation, dashboard, onboarding, editor actions.
3. Apply API gating for all non-core AI and non-core modules.
4. Keep template picker unchanged (all templates enabled).
5. Create a `V1 smoke` test command and make it deployment-required.
