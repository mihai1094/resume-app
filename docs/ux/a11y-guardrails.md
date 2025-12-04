## UX & A11y Guardrails

Purpose: keep resume editor and preview accessible, predictable, and consistent across new work.

### Core patterns
- Skip links: provide `href` to main content for all top-level pages (home, editor).
- Focus management: trap focus in modals/overlays; return focus to the trigger on close; support Escape to dismiss.
- Keyboard: every interactive element must be reachable; add `aria-label` when icon-only; use `aria-pressed` for toggles.
- Touch targets: minimum 44x44px for mobile navigation (tabs, floating buttons).
- Validation: inline, near the field; avoid blocking optional sections; show section-level summaries only when blocking progression.
- Status text: save/export status must be readable by screen readers (no color-only signals).
- Empty/error states: actionable copy plus a primary button to continue or retry.
- Form standards: label every input, pair errors with fields, use `aria-live` for error summaries, and keep helper text concise (what to enter, not why it failed).

### Export & template UX
- Guard against empty resumes before exporting; surface clear, user-friendly errors.
- Validate template IDs and handle missing templates gracefully (fallback or error).
- Show export progress state and disable duplicate clicks while exporting.

### Preflight checklist (CI-friendly)
- `npm run lint` (includes TypeScript and eslint rules).
- Lightweight a11y smoke: assert no obvious focus traps and that skip links exist on home/editor.
- Manual spot-check (per release): keyboard-only pass through editor (navigate sections, open/close preview overlay, run export).
- See `docs/development/preflight-checklist.md` for the exact steps to wire into CI or manual release checks.

### Implementation notes
- Memoize heavy preview/template renders to keep interactions snappy on mobile.
- Keep localStorage as offline fallback; prefer Firestore autosave for authenticated users with clear status text.


