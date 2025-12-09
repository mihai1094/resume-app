# AI UX Implementation Plan

Pragmatic task list to make AI cohesive, contextual, and trustworthy across the resume builder.

## Status

- [x] Phase 1: Foundations (shared UX + plumbing)
- [x] Phase 2: Section-level AI affordances
- [x] Phase 3: Cover letter flow
- [x] Phase 4: Editor-level/global assists
- [x] Phase 5: Error, privacy, and trust
- [x] Phase 6: Mobile adaptations

## Phase 1: Foundations (shared UX + plumbing) ✅

- Implemented shared primitives:
  - `AiAction` unified affordance (status badge + contract tooltip).
  - `AiPreviewSheet` for staged preview/diff + apply/undo actions.
  - `useAiAction` hook (run → stage → apply/undo + toast + telemetry hooks).
  - `useAiPreferences` (tone/length persisted via localStorage).
  - `AiActionContract` helper + `summarizeContract`.
  - `trackAiEvent` lightweight telemetry shim (console fallback).
- Stage-and-apply model ready: preview sheet supports Apply/Undo, contract display, tone/length selectors.
- Next: adopt these primitives across sections and existing dialogs.

## Phase 2: Section-level AI affordances ✅

- Work Experience: per-bullet `AiAction` for Improve/Quantify, staged via `AiPreviewSheet` + `useAiAction` with apply/undo and contract tooltip.
- Summary/Objective: summary generation staged with `AiAction` + `AiPreviewSheet`, using persisted tone/length preferences and apply/undo.
- Skills: AI suggestions via `AiAction` + preview sheet; add-all with undo; job title context used.
- (Next) Education/Dates: add normalization helper + AI phrasing (pending).
- (Next) Projects/Other: reuse `AiAction` for copy refinement (pending).

## Phase 3: Cover letter flow ✅

- Dialog refactored to guided flow (Context → Outline → Generate & Review) with staging via `AiAction` + `AiPreviewSheet` + `useAiAction`.
- Uses tone/length preferences from `useAiPreferences`; contract tooltip for transparency.
- “Use last JD” quick-fill from localStorage; outline summary shown before generation.
- Applied output keeps copy-all preview; apply/undo handled via shared hook.

## Phase 4: Editor-level/global assists ✅

- Editor header: add single “AI Assist” menu with top-level actions (draft summary, improve selected section, generate cover letter).
- Sidebar context: show AI hints only when the section has enough data; otherwise suggest what’s needed to improve quality.

## Phase 5: Error, privacy, and trust ✅

- Clear states: idle/thinking/ready/applied; surface “what I’ll do” + ETA when thinking.
- Error copy with recovery: “Add job title or 2 bullets and retry”.
- Privacy note near AI controls: what data is used; opt-out toggle if external API is used.
- Rate-limit feedback: visible timer/state instead of silent failures.

## Phase 6: Mobile adaptations ✅

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
