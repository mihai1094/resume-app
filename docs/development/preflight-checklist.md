# Editor Preflight Checklist (CI-friendly)

Use this before releases and wire into CI as a smoke step.

## Commands
- `npm run lint` (TS + eslint)
- `npm run test -- --runInBand --watch=false` (if tests exist)

## UX/A11y Smoke (manual or Playwright)
- Verify skip links on home and editor land main content.
- Keyboard-only pass: navigate sections, open/close preview overlay, export menu.
- Modals/overlays: Escape closes, focus returns to trigger, no focus traps.
- Touch targets: mobile nav arrows and floating buttons ≥44px.
- Save/export feedback: status text updates and is screen-reader friendly.

## Export/Template
- Export PDF and JSON succeed; empty resume shows helpful error.
- Template change works on desktop + mobile overlay without crashing.

## Data & autosave
- Logged-in: Firestore autosave updates save status; offline/local still persists.
- Reload with saved resume loads latest (local vs cloud) without error toast.






