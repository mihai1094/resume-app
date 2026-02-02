# Review Follow-Up Fix Plan

This plan addresses the new review findings: inconsistent API error schema, outdated sync docs, lint issue, and `crypto.randomUUID` fallback.

---

## 1) Standardize API Error Schema (Highest Priority)

1. Choose the canonical error schema:
   - Option A: use `code` everywhere (preferred if adopting `handleApiError`).
   - Option B: use `type` everywhere (backward compatibility).
2. Update `lib/api/error-handler.ts` to emit the chosen field:
   - If choosing `code`, ensure callers read `code`.
   - If choosing `type`, map `getErrorCode()` to `type`.
3. Update legacy helpers to match the schema:
   - `lib/api/rate-limit.ts` response payload.
   - `lib/api/timeout.ts` response payload.
4. Update client consumers:
   - `app/dashboard/hooks/use-optimize-flow.ts` to read the canonical field.
   - `app/dashboard/components/optimize-dialog/optimize-form.tsx` if it uses the old field.
5. Add/adjust a test to assert consistent error shape across:
   - One `handleApiError` route (e.g., `analyze-ats`).
   - One rate-limit response.
   - One timeout response.

---

## 2) Fix Outdated Data Sync Documentation

1. Update conflict-resolution sections in `docs/architecture/data-sync-contract.md`:
   - Remove references to localStorage drafts and storage events.
   - Replace with sessionStorage behavior (per-tab only, no cross-tab event).
2. Adjust example code to match real flows:
   - Draft recovery should reference `useSessionDraft`.
   - Cloud conflict examples should reference Firestore current vs saved.
3. Re-read the full doc to ensure terminology is consistent:
   - "current resume" vs "saved resume".
   - "auto-save" vs "explicit save".

---

## 3) Remove Lint Offender

1. Delete the unused `isAppError` import from `lib/api/error-handler.ts`.
2. Run lint to verify no new warnings (optional).

---

## 4) Add `crypto.randomUUID` Fallback

1. Add a safe ID utility:
   - `lib/utils/id.ts` with `createId()` that uses `crypto.randomUUID()` when available,
     otherwise falls back to `generateId()` or a timestamp+random string.
2. Replace direct `crypto.randomUUID()` usage:
   - `hooks/use-saved-resumes.ts`.
3. Add a small unit test for the new ID helper (optional but recommended).

---

## Validation Checklist

- [ ] API errors use a single schema (`code` or `type`) across routes and helpers.
- [ ] Optimize flow shows correct toast messages for validation/rate-limit/timeout.
- [ ] Sync doc no longer mentions localStorage or cross-tab storage events.
- [ ] Lint passes without unused import errors.
- [ ] Resume IDs generated reliably across environments.
