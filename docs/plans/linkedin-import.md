"# LinkedIn Importer Implementation Plan

This document outlines the steps required to add a production-ready “Import from LinkedIn” flow that auto-fills ResumeForge resumes with profile data.

> **Superseded (Feb 2026):** The app no longer offers Import from LinkedIn via PDF upload. This plan described a future OAuth-based importer; the PDF-based LinkedIn import was removed per `docs/plans/REMOVE_LINKEDIN_UPLOAD.md`. LinkedIn profile URL field, Share to LinkedIn, and LinkedIn Optimization AI remain.

## 1. Product Requirements

- Allow authenticated users to pull their LinkedIn profile and pre-fill personal info, work experience, education, skills, and languages.
- Provide a review screen so users can accept/reject imported sections before applying them to the current resume.
- Store nothing long-term without consent; importing should be on-demand.
- Support error handling for missing scopes, expired tokens, or throttling.

## 2. High-Level Architecture

1. **Front-end trigger (dashboard/resume editor)**  
   - Add “Import from LinkedIn” CTA near existing import actions (e.g., `components/shared/user-menu.tsx` or dashboard quick actions).  
   - Clicking launches the OAuth handshake flow.

2. **Auth/OAuth layer**  
   - Use LinkedIn OAuth 2.0 (Authorization Code Flow).  
   - Server-side redirect endpoint exchanges code for access token; store short-lived token in session (never persisting in DB).  
   - Required scopes:  
     - `r_liteprofile` (first/last name, profile photo)  
     - `r_emailaddress` (primary email)  
     - `r_basicprofile` is deprecated; for experience/education use `r_member_social` + [Share on LinkedIn API replacement], or LinkedIn “Profile API” (requires LinkedIn Partner Program).  
   - Because full profile API access requires partnership, plan fallback strategy (manual HTML upload, resume PDF parsing, or user-provided JSON from LinkedIn export) if partnership is not feasible initially.

3. **Backend service (`lib/services/import.ts`)**  
   - Extend `importFromLinkedIn` to accept an access token (and optionally refresh token metadata).  
   - Call LinkedIn REST endpoints (or ingestion pipeline) to pull:  
     - `GET https://api.linkedin.com/v2/me` for names/headline.  
     - `GET https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))` for email.  
     - `GET https://api.linkedin.com/v2/positions` / `educations` / `skills` (if approved).  
   - Map responses to `ResumeData` using existing helpers (generate IDs, convert dates, trim fields).  
   - Return `warnings` array for fields LinkedIn doesn’t expose (e.g., achievements missing metrics).

4. **Review & merge UI**  
   - After successful import, show modal/screen summarizing fetched data vs. existing resume.  
   - Provide per-section toggles (“Replace personal info”, “Append experience”).  
   - Reuse existing hooks (`useResume`, `setWorkExperience`, etc.) to merge data.  
   - Log telemetry for acceptance to inform future UX tweaks.

5. **Security & privacy**  
   - Store tokens server-side only for the lifetime of the import request (in encrypted session/cookie).  
   - Never cache LinkedIn API responses after the user dismisses the modal.  
   - Display disclosure text citing LinkedIn’s platform terms.

## 3. Implementation Tasks

1. **Backend groundwork**  
   - [ ] Create API routes:  
     - `/api/auth/linkedin/start` → redirect to LinkedIn auth.  
     - `/api/auth/linkedin/callback` → exchange code for token, stash in httpOnly cookie, redirect back to UI.  
     - `/api/import/linkedin` → read token from session, call `importFromLinkedIn`, return mapped `ResumeData`.  
   - [ ] Update `importFromLinkedIn(accessToken)` to fetch + map data (handle pagination, rate limits).  
   - [ ] Add configuration (`LINKEDIN_CLIENT_ID/SECRET`, redirect URIs) to `.env`.

2. **Front-end flow**  
   - [ ] Add “Import from LinkedIn” button (dashboard + header).  
   - [ ] Implement `useLinkedInImport` hook to manage:  
     - Opening `/api/auth/linkedin/start`.  
     - Polling for import completion or using callback query param to trigger `/api/import/linkedin`.  
     - Tracking loading/error states.  
   - [ ] Build review modal component showing imported sections with checkboxes.

3. **Data merging**  
   - [ ] Add helper to diff imported data vs. current `resumeData` (highlight changes).  
   - [ ] Provide merge strategies: replace, append, or skip per section.  
   - [ ] Ensure `useResume` exposes actions for batch updates (e.g., `replacePersonalInfo`, `replaceWorkExperience`).

4. **Fallback / interim solution**  
   - If Partner API approval is delayed, implement “Upload LinkedIn JSON export” as a temporary importer:  
     - Users can download their data from LinkedIn (Settings → Get a copy of your data).  
     - Parse zipped JSON and map same as API pipeline.

5. **QA & Compliance**  
   - [ ] Add unit tests for `importFromLinkedIn` mapping functions.  
   - [ ] Manual test plan covering successful import, revoked tokens, scope denial, and repeated imports.  
   - [ ] Update privacy policy + onboarding copy.

## 4. Timeline (Rough)

| Phase | Duration | Notes |
| --- | --- | --- |
| Discovery & LinkedIn compliance | 1-2 weeks | Includes applying for Partner API access if needed |
| Backend OAuth & importer service | 1 week | Can parallelize API route + mapping |
| Front-end flow & review UI | 1 week | Hook, modal, merging UX |
| Testing, docs, compliance updates | 1 week | QA + policy review |

Total: ~4-5 weeks depending on LinkedIn approval process. If we implement the “upload JSON export” fallback first, we can ship a lighter MVP in ~2 weeks while pursuing full API access."
