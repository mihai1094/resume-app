# AI UX Implementation Plan

Pragmatic task list to make AI cohesive, contextual, and trustworthy across the resume builder.

## Phase 1: Foundations (shared UX + plumbing)
- Unify AI affordance style: single `AiAction` component using shadcn Button/DropdownMenu/Sheet patterns; consistent icon/label/placement per section.
- Centralize AI state: shared hook (loading/error/history/apply/undo) consumed by all AI entry points; includes toast + inline status.
- Stage-and-apply model: preview/diff view with actions `Apply`, `Replace`, `Insert at cursor`, `Undo`. Persist per-section history.
- Input/output contract: small helper to declare what data is sent (current section vs full resume + job description) and expose to UI.
- Tone/length presets: shared controls persisted in localStorage/session.
- Instrumentation: event tracking for trigger, success/fail, apply rate, undo; capture surface name (section, action).

## Phase 2: Section-level AI affordances
- Work Experience: inline “Improve bullet” chip per bullet row; menu options (tighten, quantify, STAR). Uses current role/title + bullet.
- Summary/Objective: actions “Draft summary from resume” and “Shorten”; uses full resume context + tone.
- Skills: “Cluster skills” and “Suggest 5 relevant skills” based on role/title; apply via diff.
- Education/Dates: suggest standard phrasing + normalized dates; highlight AI-suggested text until accepted.
- Projects/Other sections (if present): reuse `AiAction` with minimal config for copy refinement.

## Phase 3: Cover letter flow
- Convert cover-letter dialog to 4-step wizard: (1) ingest resume + job description, (2) outline preview, (3) generate with tone/length, (4) apply/undo.
- Add ETA + retry guidance; keep all AI output staged before apply.
- Provide “Use last job description” quick-fill.

## Phase 4: Editor-level/global assists
- Editor header: add single “AI Assist” menu with top-level actions (draft summary, improve selected section, generate cover letter).
- Sidebar context: show AI hints only when the section has enough data; otherwise suggest what’s needed to improve quality.

## Phase 5: Error, privacy, and trust
- Clear states: idle/thinking/ready/applied; surface “what I’ll do” + ETA when thinking.
- Error copy with recovery: “Add job title or 2 bullets and retry”.
- Privacy note near AI controls: what data is used; opt-out toggle if external API is used.
- Rate-limit feedback: visible timer/state instead of silent failures.

## Phase 6: Mobile adaptations
- Move AI actions into toolbar/overflow per section; no floating FAB over inputs.
- Use bottom sheet for previews/diffs; large tap targets for Apply/Undo.

## Engineering tasks (by area)
- Components: build `AiAction` + `AiPreviewSheet` + `AiDiff` components; wire to shadcn primitives.
- Hooks: new `useAiAction` (state, invoke, history, apply/undo), small helper for action metadata (inputs used, tone/length presets).
- Forms: add AI entry points to work experience bullets, summary, skills, education; keep placement consistent (top-right of card or inline chip).
- Cover letter: refactor dialog to wizard; add outline step; persist last JD; reuse diff/apply pattern.
- Editor header: add global AI menu; hook to current section selection; reuse `AiAction`.
- Telemetry: add event emitter; log trigger/success/fail/apply/undo with surface/action names.
- Copy/UX: add helper text for transparency + error strings; ensure consistent verbs (“Improve”, “Shorten”, “Add impact”).
- QA checklist: SSR safety for any window access; undo works per section; rate-limit visible; mobile sheet layout tested.

## Definition of done
- One consistent AI affordance per section card + in editor header.
- All AI outputs staged with diff/preview before apply; undo works.
- Tone/length presets persisted and reused across actions.
- Errors + rate limits communicated; privacy note present.
- Mobile flow uses sheets/toolbar; no overlapping FABs.
- Telemetry shows which AI actions are used/applied.

