# Error Taxonomy

This document inventories the known API/UI failure points across the ResumeForge app and classifies their severity. Use it to prioritize error-handling improvements (EH tasks).

## Severity Legend

- **Blocking** – user cannot proceed or data may be lost without immediate remediation.
- **Recoverable** – operation can be retried or skipped without data loss.
- **Minor** – cosmetic or non-critical issue; does not block core workflows.

## EH-1a · Resume Editor Failure Points

| Failure | Trigger / Path | Severity | Current UX | Notes |
| --- | --- | --- | --- | --- |
| Autosave write failure | Firestore/localStorage write rejected | Blocking | Silent console error; status text stays “Saving…” | Needs retry helper + toast |
| Load resume (existing) fails | `/editor/:id` fetch error | Blocking | Loading screen hangs or generic error | Should show inline error + retry |
| Resume delete failure | Dashboard delete action rejects | Recoverable | `alert("Failed to delete resume")` | Replace with toast + inline alert |
| PDF export failure | `exportToPDF` throws | Blocking | Notification toast `toast.error` but no retry path | Need export tracker + retry |
| JSON export failure | `downloadJSON` fails (quota/block) | Recoverable | Minimal error logging | Provide user feedback |
| Reset resume confirmation | `confirm` prompt | Recoverable | Browser confirm dialog | Replace with modal, catch errors |
| Template preview load failure | Template assets timeout | Minor | Empty preview pane | Add retry button |
| Optimize action from editor fails | Trigger optimize dialog from resume | Recoverable | Toast error only | Inline messaging needed |

## EH-1b · Cover Letter, Optimize Flow, Imports

| Failure | Trigger / Path | Severity | Current UX | Notes |
| --- | --- | --- | --- | --- |
| Autosave failure | LocalStorage write fails | Recoverable | Hidden; only console | Need banner + retry |
| Save to saved cover letters fails | `saveCoverLetter` rejects | Blocking | Toast error, no inline guidance | Offer retry |
| Export PDF failure | `exportCoverLetterToPDF` throws | Blocking | Toast error only | Should tie into export tracker |
| Delete cover letter failure | Dashboard action | Recoverable | `alert("Failed")` | Replace with toast |
| Optimize dialog submission fails | `handleOptimize` rejects | Blocking for feature | Toast error but retains stale loading state | Add inline error + form reset |
| Optimize analysis timeout | Long API call | Blocking | No timeout messaging | Need abort controller + guidance |
| JSON import parse error | Invalid JSON resume | Recoverable | Text error message, no UX context | Show inline instructions |
| File read error | FileReader failure | Recoverable | Console error only | Provide toast/modal |
| Future LinkedIn import OAuth fail | Authorization denied/expired | Blocking | Not implemented | Design fallback/resume option |

## 3. Dashboard

| Failure | Trigger / Path | Severity | Current UX | Notes |
| --- | --- | --- | --- | --- |
| Fetch saved resumes/letters fails | `useSavedResumes/useSavedCoverLetters` error | Blocking | Loading spinner persists; no messaging | Need empty state with retry |
| Optimize dialog analysis fails | `handleOptimize` rejects | Recoverable | Toast error but dialog stays | Provide inline error, allow retry |
| Preview dialog load fails | `setPreviewResumeId` but resume missing | Minor | Blank preview | Add fallback |

## 4. Imports & Exports

| Failure | Trigger / Path | Severity | Current UX | Notes |
| --- | --- | --- | --- | --- |
| JSON import parse error | Invalid file | Recoverable | Error message returned but no UI guidance | Provide inline instructions |
| File read error | FileReader failure | Recoverable | Alert in console | Need user-facing message |
| LinkedIn import (future) | OAuth/token issues | Blocking | Not implemented yet | Plan for fallback/resume |

## 5. Optimize (AI) Flow

| Failure | Trigger / Path | Severity | Current UX | Notes |
| --- | --- | --- | --- | --- |
| Job description missing | User opens dialog without eligible resumes | Recoverable | Button disabled | OK |
| AI analysis API failure | `handleOptimize` rejects | Blocking for feature | Toast error only | Provide inline error + spinner stop |
| Analysis timeout | Long-running request | Blocking | No timeout handling | Add abort + friendly message |

## 6. Auth & Settings

| Failure | Trigger / Path | Severity | Current UX | Notes |
| --- | --- | --- | --- | --- |
| Logout failure | Auth service rejects | Recoverable | Silent | Add toast |
| Data export (settings) fails | JSON export error | Blocking | Toast error | Provide retry, status |
| Account deletion failure | Firestore cleanup error | Blocking | Toast error | Provide fallback instructions |

## EH-1c · Severity Summary & UX Gaps

- **Blocking issues (10)**: Resume autosave/load/export, cover-letter save/export, optimize API errors, dashboard data fetches, settings exports/delete, LinkedIn import. Current UX ranges from silent failures to simple toasts without recovery.
- **Recoverable issues (9)**: Delete actions, JSON exports/imports, offline autosave, optimize retries, preview loads. Most still rely on `alert` or console output.
- **Minor issues (2+)**: Template preview gaps, missing fallback screens.

**Key gaps**
- Lack of inline recovery guidance or retry CTAs for blocking errors.
- `alert/confirm` usage on delete/reset flows leads to inconsistent UX.
- Autosave/export processes do not expose retry state or offline mode indicators.
- Import/export failures don’t provide actionable steps (e.g., format expectations, try-again button).

Use this summary to prioritize EH-2 through EH-5, targeting blocking items first.

## Next Steps

1. Map each failure to remediation tasks (EH-2..EH-5) and create tickets.
2. Instrument critical paths with logging/analytics to quantify frequency.
3. Revisit taxonomy quarterly or before GA launches.
