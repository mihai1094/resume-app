# Plan: Remove LinkedIn PDF Upload Feature

This document is a **research-backed removal plan** for the “Upload from LinkedIn” (LinkedIn PDF import) feature. It does **not** remove the LinkedIn URL field on resumes, “Share to LinkedIn,” or the “LinkedIn Optimization” AI feature—only the flow that lets users upload a LinkedIn PDF to pre-fill their resume.

---

## 1. Scope: What Is Being Removed

| Item | Remove? | Notes |
|------|--------|--------|
| **LinkedIn PDF upload in onboarding** | ✅ Yes | “Import from LinkedIn” card, file input, “Upload LinkedIn PDF” |
| **API route** `POST /api/parse-linkedin-pdf` | ✅ Yes | Entire route |
| **Parser** `lib/parsers/linkedin-pdf-parser.ts` | ✅ Yes | Entire file |
| **Import service** `importFromLinkedIn()` + `"linkedin"` branch in `importResume()` | ✅ Yes | From `lib/services/import.ts` |
| **ImportSummaryDialog** (onboarding) | ✅ Yes | Only used after LinkedIn PDF import |
| **Onboarding state** for import (parsedData, handleFileUpload, handleConfirmImport) | ✅ Yes | Only used for LinkedIn import |
| **Editor** `import=true` and `isImporting` | ✅ Optional | Can simplify: remove param and prop if only used for LinkedIn import |
| **Rate limit preset** `UPLOAD` | ✅ Optional | Only used by parse-linkedin-pdf; remove or keep for future uploads |
| **Config** `linkedInImport` | ✅ Yes | Remove flag from `config/app.ts` |
| **LinkedIn URL field** (personal info, templates, PDFs) | ❌ No | Keep |
| **Share to LinkedIn** (share dialog) | ❌ No | Keep |
| **LinkedIn Optimization** AI (`lib/ai/linkedin.ts`, `/api/ai/optimize-linkedin`) | ❌ No | Keep |

---

## 2. File-Level Checklist

### 2.1 Delete Entirely

| File | Reason |
|------|--------|
| `app/api/parse-linkedin-pdf/route.ts` | API only used for LinkedIn PDF parse |
| `lib/parsers/linkedin-pdf-parser.ts` | Parser only used by that API |
| `app/onboarding/components/import-summary-dialog.tsx` | Only shown after LinkedIn PDF import |

### 2.2 Modify (Remove LinkedIn Upload Only)

| File | Changes |
|------|--------|
| **`app/onboarding/onboarding-content.tsx`** | Remove: `importFromLinkedIn` import; `parsedData` state; `isImporting` state; `handleFileUpload`; `handleConfirmImport`; the whole “Import from LinkedIn” card (file input + “Upload LinkedIn PDF”); `<ImportSummaryDialog>` and its usage. Update step 1 copy: e.g. “Enter your target role to get started” (no “Import your LinkedIn profile…”). Optionally keep a single “Start from scratch” path with job title only. |
| **`lib/services/import.ts`** | Remove: `importFromLinkedIn()`; in `importResume()`, remove the `case "linkedin":` branch. Optionally remove `"linkedin"` from `ImportSource` type. |
| **`lib/services/index.ts`** | Remove export of `importFromLinkedIn` (if present). |
| **`lib/api/rate-limit.ts`** | Optional: remove `UPLOAD` from `RATE_LIMITS` (only consumer was parse-linkedin-pdf). If you plan other file uploads, keep it. |
| **`config/app.ts`** | Remove `linkedInImport` from `features` (or leave and set to false with comment “removed”). |

### 2.3 Editor / New Page (Optional Cleanup)

| File | Changes |
|------|--------|
| **`app/editor/new/page.tsx`** | Stop reading `import` search param and passing `isImporting={importParam}`. |
| **`app/editor/editor-page-client.tsx`** | Remove `isImporting` prop and pass-through. |
| **`components/resume/resume-editor.tsx`** | Remove `isImporting` prop and pass-through. |
| **`hooks/use-resume-editor-container.ts`** | Remove `isImporting` from props and any logic that depended on it (e.g. loading from sessionStorage `importedResumeData` if that exists elsewhere). |

Note: Current codebase sets `sessionStorage.setItem("importedResumeData", ...)` in onboarding and redirects to `/editor/new?import=true`. No reader for `importedResumeData` was found in the editor; if you discover one later, remove that path as well when removing the LinkedIn upload flow.

### 2.4 Documentation & Tests

| File | Changes |
|------|--------|
| **`docs/development/USER_DATA_SECURITY.md`** | Remove or shorten the “LinkedIn PDF upload” bullet and the “Malicious-upload hardening” subsection that refers only to parse-linkedin-pdf. |
| **`docs/USER_FLOW.md`** | Remove “Option A: Import from LinkedIn” and the “Upload LinkedIn PDF” steps. |
| **`docs/architecture/data-sync-contract.md`** | Remove or adjust the “Import flow stores to sessionStorage: importedResumeData” example if it only applies to LinkedIn import. |
| **`tests/TEST_PLAN.md`** | Remove or mark skipped: ONB-001–ONB-006 (LinkedIn import in onboarding), IMPT-001 (Upload LinkedIn PDF). Leave tests that refer to “LinkedIn” as the URL field or share/AI features. |
| **`tests/MANUAL_TEST.md`** | Remove “3b. LinkedIn Import” and “Prep: Have a LinkedIn PDF export ready…”. |
| **`lib/services/__tests__/import.test.ts`** | Remove the test “should reject linkedin source with non-File data” and any test that calls `importResume({ source: "linkedin", ... })`. |
| **`lib/seo/structured-data.ts`** | If there is an FAQ “Can I import my resume from LinkedIn?”, reword to state that manual entry or JSON import is available (no LinkedIn PDF), or remove the question. |
| **`app/dashboard/components/onboarding-checklist.tsx`** | Update copy that says “Use our AI builder or import from LinkedIn” to e.g. “Use our AI builder or start from scratch.” |
| **`docs/plans/linkedin-import.md`** | Optional: delete (it described a future OAuth-based import) or add a short note at the top: “Superseded: LinkedIn PDF upload removed; see REMOVE_LINKEDIN_UPLOAD.md.” |

---

## 3. Dependency Check

- **unpdf**: Only used by `lib/parsers/linkedin-pdf-parser.ts`. After removing the parser, you can remove the `unpdf` dependency from `package.json` if no other code uses it.
- **ImportSource**: If only `"json"` and `"file"` remain, update the type and any switch/if branches that handle sources.

---

## 4. Suggested Order of Execution

1. **Onboarding UI** – Remove the LinkedIn import card, dialog, and related state/handlers so users no longer see the option.
2. **Import service** – Remove `importFromLinkedIn` and the `"linkedin"` branch from `importResume()`; remove export from `lib/services/index.ts`.
3. **API + parser** – Delete `app/api/parse-linkedin-pdf/route.ts` and `lib/parsers/linkedin-pdf-parser.ts`.
4. **Optional** – Remove `UPLOAD` rate limit preset; remove `isImporting` and `import=true` from editor flow; remove `linkedInImport` from config.
5. **Tests** – Update or remove LinkedIn-import tests; run full test suite.
6. **Docs** – Update USER_DATA_SECURITY, USER_FLOW, TEST_PLAN, MANUAL_TEST, onboarding checklist, structured-data FAQ, and data-sync-contract as above.
7. **Cleanup** – Remove `unpdf` from package.json if unused; delete or note `docs/plans/linkedin-import.md`.

---

## 5. Out of Scope (Do Not Remove)

- **LinkedIn URL** in `personalInfo` (forms, templates, PDFs, validation).
- **Share to LinkedIn** in share dialog.
- **LinkedIn Optimization** AI feature (`lib/ai/linkedin.ts`, `/api/ai/optimize-linkedin`, cache, tests in `lib/ai/__tests__/ai-features.test.ts`).
- **JSON / file import** in `lib/services/import.ts` (e.g. `importFromJSON`, `importFromFile`, `importResume` with `source: "json"` or `"file"`).

---

## 6. Summary

| Category | Count |
|----------|--------|
| Files to delete | 3 (route, parser, import-summary-dialog) |
| Files to edit (core) | 5 (onboarding-content, import, index, rate-limit, config) |
| Files to edit (optional) | 4 (editor new, editor-page-client, resume-editor, use-resume-editor-container) |
| Docs/tests to update | 8+ (security, user flow, test plan, manual test, checklist, SEO, data-sync, import tests) |

This plan removes all LinkedIn PDF upload functionality while keeping the LinkedIn profile URL, sharing, and AI optimization features intact.
