# Architecture Review Follow-Up Plan

This plan covers the findings from the recent architecture review and breaks them into actionable, step-by-step work items.

## Scope

- Template selection is not persisted on save.
- PDF export template mapping is incomplete.
- Data sync documentation is out of date.
- Firestore schema naming is inconsistent.
- Centralized API error handling is inconsistently applied.
- Resume IDs are time-based and collision-prone.

---

## 1) Persist Selected Template on Save

1. Audit current save flow in `components/resume/resume-editor.tsx` and `hooks/use-resume-editor-container.ts`.
2. Decide on a single save path (either adopt `hooks/use-resume-save.ts` or extend container hook to accept `selectedTemplateId`).
3. Pass `selectedTemplateId` through the chosen save flow and remove any hard-coded template IDs.
4. Ensure Firestore updates include `templateId` for both create and update paths.
5. Verify load flow uses the stored `templateId` (`useResumeDataLoader` and editor state).
6. Add tests for "save preserves selected template" and "load restores template".
7. Update any UI/UX messaging if template persistence behavior changes.

---

## 2) Complete PDF Export Template Mapping

1. Compare `lib/constants/templates.ts` against `lib/services/export.ts` template whitelist/switch.
2. Add missing template IDs (e.g., `simple`, `diamond`, `iconic`, `student`, `functional`) to `ensureTemplateId` and the import switch.
3. Confirm every template with `hasPDFTemplate: true` has a corresponding PDF template file.
4. Add a regression test that asserts export uses the requested template ID (or fails explicitly if missing).
5. Update any template registry docs to clarify PDF support constraints.

---

## 3) Update Data Sync Documentation

1. Confirm the intended storage strategy (sessionStorage draft vs localStorage draft; Firestore draft vs saved resume).
2. Update `docs/architecture/data-sync-contract.md` to reflect:
   - sessionStorage draft usage (`useSessionDraft`)
   - Firestore paths (`users/{userId}/resumes/current` and `users/{userId}/savedResumes/{id}`)
   - removal or deprecation of localStorage if no longer used
3. Refresh the diagram and flow steps to match the current editor behavior.
4. Add a short "source of truth" section describing which data wins on conflicts.

---

## 4) Normalize Firestore Schema Naming

1. Decide on canonical collection names for drafts vs saved documents.
2. Replace hard-coded `"savedResumes"` with constants in `lib/services/firestore.ts`.
3. Update any related Firestore rules/indexes if the schema changes.
4. Add a migration plan (or compatibility layer) for existing users.
5. Update docs to match the finalized schema.

---

## 5) Standardize API Error Handling

1. Inventory API routes and identify which do not use `handleApiError`.
2. Update routes to return the centralized error format and remove ad-hoc responses.
3. Ensure client code expects the unified error shape.
4. Add tests for consistent error response payloads (status + body).
5. Document the standard error format in `docs/` (or update an existing API guide).

---

## 6) Improve Resume ID Generation

1. Decide on a collision-safe ID scheme (e.g., `crypto.randomUUID()` or `generateId()`).
2. Update `hooks/use-saved-resumes.ts` to use the new ID generator.
3. Ensure ID generation is compatible with any backend expectations.
4. Add a test to assert ID uniqueness across rapid saves.
5. Confirm existing saved resumes remain readable (no migration required).

---

## Validation & Testing Checklist

- [ ] `npm run lint`
- [ ] `npm test`
- [ ] Template selection saved and reloaded correctly
- [ ] PDF export uses the chosen template ID
- [ ] API errors return the unified shape
- [ ] Docs accurately reflect current storage flows
