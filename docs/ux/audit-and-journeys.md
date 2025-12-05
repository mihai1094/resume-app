# UX/A11y Audit & Journey Map (snapshot)

## Journeys mapped
- Create new resume (home/onboarding → editor → export).
- Edit existing resume (dashboard → editor).
- Mobile preview toggle (form ↔ preview overlay).
- Export flow (JSON/PDF) with template changes.
- Autosave/load (localStorage vs Firestore) on reload.

## Findings (to watch)
- Ensure save status is always visible/readable (aria-live added).
- Template changes on mobile should not trap focus; overlay needs Escape-close (added).
- Validation should not block optional sections; surface errors inline + summary.
- Touch targets on mobile nav/preview buttons need ≥44px (adjusted).
- Empty resume export should provide clear error (guard added).

## Follow-ups
- Keep CI preflight aligned with `docs/development/preflight-checklist.md`.
- Re-run a11y smoke after template or form changes.



