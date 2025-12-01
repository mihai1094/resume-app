# Code Quality Refactor Plan

This plan enumerates the concrete engineering work required to raise the overall code quality, maintainability, and reliability of the ResumeForge codebase. Tasks below are grouped by track so they can be turned into tickets with clear owners.

## Guiding Goals

- Untangle the resume editor so state, persistence, and UI responsibilities are isolated and testable.
- Harden the data layer (Firestore + local storage) so offline/online states and destructive operations behave predictably.
- Clean up the dashboard and AI-assist flows to remove duplication and fix current type/runtime issues.
- Improve platform foundations (auth, Firebase wiring, routing) so server/client boundaries are respected.
- Restore automated coverage to match the current feature set instead of historic defaults.

## Snapshot of Current Pain Points

- `components/resume/resume-editor.tsx:1-720` owns fetching, auto-save, validation, layout, modals, and sharing logic, making it nearly impossible to reason about or reuse.
- The new hooks (`hooks/use-resume-data-loader.ts:14-116` and `hooks/use-resume-editor-state.ts:7-49`) are never consumed, so duplication and bugs persist.
- Deprecated storage utilities are still powering autosave (`hooks/use-local-storage.ts:17-90` + `lib/services/storage.ts:1-153`) which conflicts with our Firestore migration narrative.
- `lib/firebase/config.ts:14-26` only initializes Firebase on the client, but we import `firestoreService` across shared code, so SSR and route handlers fail silently.
- Dashboard optimize flow defines incompatible `ResumeItem` types (`app/dashboard/hooks/use-optimize-flow.ts:9-20` vs `app/dashboard/components/optimize-dialog/optimize-form.tsx:26-40`) and relies on timeouts without cleanup, causing TypeScript errors (TS2719) and memory leaks.
- Critical tests such as `hooks/__tests__/use-resume.test.ts:9-17` assert default data that no longer exists, so regressions slip through unnoticed.

## Track A – Resume Editor Architecture

- [ ] **Adopt a centralized resume state store.** Move the CRUD logic from `hooks/use-resume.ts:29-310` into a reducer/store (or Zustand) that exposes typed actions, supports undo/redo, and is consumed both by the editor and auxiliary hooks. Retire the unused `hooks/use-resume-with-history.ts:11-95` shim once undo/redo is first-class.
- [ ] **Bring `useResumeDataLoader` and `useResumeEditorState` into the editor.** Replace the bespoke initialization effects in `components/resume/resume-editor.tsx:139-360` with the dedicated hooks so Firestore vs localStorage conflict resolution happens in a single place and can be tested.
- [ ] **Split `ResumeEditor` into container + presentation.** Extract persistence + routing concerns, section navigation, and template customization into dedicated components/hooks so the top-level file drops below ~200 lines. Ensure Section components only receive the data they need instead of the entire editor state.
- [ ] **Fix section error routing.** `mapFieldToSection` inside `components/resume/resume-editor.tsx:420-460` currently routes every unknown field back to “personal,” so validation errors in languages/courses/hobbies are surfaced in the wrong section. Expand the mapping (and unit-test it) for all sections, including any upcoming custom sections.
- [ ] **Replace `window.confirm` in `hooks/use-form-array.ts:86-123`.** Use an accessible confirmation pattern (shared dialog) so array deletions don’t block rendering or violate UX rules.
- [ ] **Reuse import/export helpers.** Both `components/resume/editor-header.tsx:201-245` and `app/dashboard/hooks/use-resume-actions.ts:33-96` hand-roll file dialogs and blob downloads. Move this logic into `lib/utils/download.ts` and consume it from both surfaces to reduce divergence.

## Track B – Data & Persistence Layer

- [ ] **Make Firebase services SSR-safe.** Update `lib/firebase/config.ts:14-26` to initialize on both server/client (using Lazy `globalThis` guards) or provide explicit client wrappers, and have `lib/services/firestore.ts:40-205` throw typed errors instead of swallowing them with `console.error`.
- [ ] **Stop using deprecated storage service.** Replace `hooks/use-local-storage.ts:17-90`’s dependency on `lib/services/storage.ts:1-153` with a lightweight wrapper (or browser `Storage` API) and document the relationship between offline drafts and Firestore to avoid conflicting narratives.
- [ ] **Unify saved resume/cover letter types.** `hooks/use-saved-cover-letters.ts:5-13` redefines `SavedCoverLetter` even though `lib/types/cover-letter.ts:1-64` exports the same type. Deduplicate to prevent drift in downstream consumers (`app/dashboard/components/cover-letter-card.tsx:10-44`).
- [ ] **Add real-time subscriptions for saved documents.** `hooks/use-saved-resumes.ts:20-125` and `hooks/use-saved-cover-letters.ts:19-180` perform one-time loads. Switch them to Firestore listeners (with cleanup) so dashboard counts stay in sync and offline drafts can merge cleanly.
- [ ] **Harden destructive operations.** `hooks/use-user.ts:150-184` deletes all Firestore data before we know whether Firebase Auth will allow account deletion (reauth may be required). Reorder the steps so we only purge data after credentials are revalidated, and surface errors to the UI.

## Track C – Dashboard & AI Workflows

- [ ] **Resolve optimize dialog type + lifecycle bugs.** Consolidate the `ResumeItem` type used in `app/dashboard/hooks/use-optimize-flow.ts:9-20` and `app/dashboard/components/optimize-dialog/optimize-form.tsx:26-40`, add cleanup for the analysis timeout (`useEffect` with `clearTimeout`), and surface analysis errors to the dialog footer.
- [ ] **Cache expensive scoring.** `app/dashboard/components/resume-card.tsx:76-180` recomputes `calculateResumeScore` for every card render. Memoize or precompute the score when resumes are loaded to avoid bogging down the dashboard, and reuse the cached score inside `EditorHeader` (`components/resume/editor-header.tsx:139-210`).
- [ ] **Share initials/identity helpers.** `components/shared/user-menu.tsx:24-52` and `app/dashboard/hooks/use-resume-utils.ts:5-24` maintain two different implementations for user initials. Move this helper (and any future avatar logic) into a single utility.
- [ ] **Fix `PreviewDialog` scaling + data fidelity.** Instead of relying on `style={{ zoom: 0.6 }}` (`app/dashboard/components/preview-dialog.tsx:38-69`), wrap the preview in a CSS transform so it renders consistently across browsers, and feed the dialog the active template customization so the preview matches what users see in the editor.
- [ ] **Remove unused assets/imports.** `app/dashboard/components/quick-actions.tsx:4-32` imports `Sparkles` but never uses it, and several dashboard helpers still rely on inline `router.push` when we already receive callbacks. Clean these up while touching the files to reduce lint noise.

## Track D – Routing, Auth & Platform Hygiene

- [ ] **Fix Next.js `searchParams` typing.** `app/editor/new/page.tsx:8-32` and `app/edit/page.tsx:9-24` treat `searchParams` as a promise, forcing an unnecessary `await` and marking the route as dynamic. Update the signatures to use `ReadonlyURLSearchParams` so these pages remain static when possible.
- [ ] **Refactor AuthGuard/AppHeader composition.** `components/shared/app-header.tsx:15-52` invokes `useUser` even though its parents already fetched the user (e.g., `app/dashboard/components/my-resumes-header.tsx:1-40`). Accept a `user` prop so we don’t subscribe to auth twice and avoid flashing loaders.
- [ ] **Provide shared download/import helpers.** The editor header currently spins up `<input type="file">` manually (`components/resume/editor-header.tsx:201-245`). Introduce a small hook/service that encapsulates file input lifecycles so multiple surfaces (dashboard + editor) can reuse it without duplicating DOM manipulation code.
- [ ] **Eliminate inline `window.confirm` usages.** Besides the form array hook, there are other scattered `confirm` calls (e.g., bulk delete). Track them down and route through standardized dialogs for accessibility and testing.

## Track E – Testing, Tooling & Documentation

- [ ] **Realign unit tests with current defaults.** Update `hooks/__tests__/use-resume.test.ts:9-70` (and related fixtures) so they no longer expect hard-coded “Jordan” sample data that the hook no longer supplies. Extend coverage to the new reducer/store once Track A lands.
- [ ] **Add regression tests for import/export + optimize flows.** Create Vitest suites that cover `lib/services/import.ts:1-200`, `lib/services/export.ts:1-210`, and the mock AI analyzer (`lib/ai/mock-analyzer.ts:1-200`) so future API integrations have a safety net.
- [ ] **Document the data-sync contract.** Add a section to `docs/plans/stability-readiness.md` (or a new README) explaining how local drafts, Firestore drafts, and saved resumes interact so feature developers share the same mental model.

## Suggested Sequencing

1. Track A + Track B (state management + data hygiene) unblock most of the other work. Tackle them first in parallel squads.
2. Track C improvements can follow once the data layer is stable, since they depend on reliable resume lists and scoring.
3. Track D and Track E can run alongside Track C, but ensure routing/auth fixes happen before we attempt SSR/API integrations.

Each checkbox above should become a ticket with acceptance criteria (tests, docs updated, lint clean) before marking complete.
