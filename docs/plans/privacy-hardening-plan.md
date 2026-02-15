# Privacy Hardening Plan (2026-02-14)

## Goal
Keep user-identifying resume data private by default across AI features, logs, analytics, sharing, and legal copy.

## Status (2026-02-14)
- Implemented: AI payload sanitizer + strict/standard privacy mode header, AI route integration, logging and Sentry redaction, sharing privacy persistence, analytics owner-only access path, policy copy updates.
- Implemented: analytics telemetry minimization (store referrer domain only; stop persisting user-agent; hash in-memory dedupe keys).
- Implemented: free-text AI route redaction for accidental email/phone/url leakage (`analyze-text`, `improve-bullet`, `quantify-achievement`, `ghost-suggest`).
- Implemented: privacy regression tests for sanitizer and text redaction.
- In progress: full manual verification run across all AI surfaces.

## Confirmed Risks

### Critical
- Full `resumeData` is accepted and hashed in multiple AI routes, even when prompts only need a subset.
  - `app/api/ai/tailor-resume/route.ts:14`
  - `app/api/ai/tailor-resume/route.ts:34`
  - `app/api/ai/score-resume/route.ts:14`
  - `app/api/ai/score-resume/route.ts:32`
  - `app/api/ai/optimize-linkedin/route.ts:14`
  - `app/api/ai/optimize-linkedin/route.ts:33`
  - `app/api/ai/interview-prep/route.ts:14`
  - `app/api/ai/interview-prep/route.ts:38`
  - `app/api/ai/generate-cover-letter/route.ts:14`
  - `app/api/ai/generate-cover-letter/route.ts:44`
  - `app/api/ai/generate-improvement/route.ts:18`
  - `app/api/ai/batch-enhance/route.ts:11`
- One client flow still posts raw resume directly to ATS endpoint.
  - `components/ai/job-matcher.tsx:62`

### High
- Raw AI output previews are logged (can include resume content and sensitive details).
  - `lib/ai/interview-prep.ts:429`
  - `lib/ai/linkedin.ts:285`
  - `lib/ai/ats.ts:212`
  - `lib/ai/ats.ts:252`
  - `lib/ai/shared.ts:234`
- Firestore analytics reads are open to any authenticated user, not strictly owner-bound.
  - `firestore.rules:175`
- Public resume update path can bypass privacy filtering after initial publish.
  - `lib/services/sharing-service.ts:354`

### Medium
- Privacy/legal copy says data is local-only and never shared, which conflicts with server AI/API processing.
  - `app/privacy/page.tsx:122`
  - `app/privacy/page.tsx:127`
  - `app/privacy/page.tsx:187`
  - `app/home-content.tsx:481`
  - `app/register/page.tsx:389`
  - `lib/seo/structured-data.ts:197`
- Public resume reads are fully open (public-by-design) and scrapeable at collection level.
  - `firestore.rules:134`

## Remediation Plan

## Phase 0 (24-48h): Containment
- Create shared sanitizer utility for AI payloads (`lib/ai/privacy.ts`):
  - strip direct identifiers by default (`firstName`, `lastName`, `email`, `phone`, `website`, `linkedin`, `github`);
  - keep only job-relevant fields unless endpoint explicitly needs identity (example: cover letter signature).
- Apply sanitizer server-side in all AI routes before:
  - calling generators;
  - building cache payload hash.
- Update `components/ai/job-matcher.tsx` to send minimized ATS payload (same behavior as `use-optimize-flow`).
- Remove raw AI-response logging; log only metadata (`length`, `status`, `requestId` if available).
- Add temporary feature flag `AI_ALLOW_PII=false` default in production.

Exit criteria:
- No AI route sends direct contact info by default.
- No logs contain raw model output snippets.

## Phase 1 (2-4 days): Access Control and Data Path Hardening
- Firestore rules:
  - replace broad analytics rule with owner-only read for `analytics/{resumeId}/events/{eventId}`;
  - validate ownership via linked resume ownership/public-resume owner mapping.
- Migrate analytics writes in API routes to Admin SDK (rules currently deny writes).
  - `lib/services/analytics-service.ts` server version should use `lib/firebase/admin.ts`.
- Enforce privacy settings on every public resume update:
  - persist privacy settings with public doc;
  - re-apply privacy filter inside `updatePublicResumeData`.
- Expand share privacy model to include optional hiding of:
  - `linkedin`, `github`, `website` (and optionally full name).

Exit criteria:
- Users cannot read other users' analytics data.
- Published privacy settings are preserved after edits.

## Phase 2 (3-5 days): Policy and Transparency Fixes
- Update all public privacy statements to match real behavior:
  - local storage + cloud storage;
  - AI provider processing;
  - analytics and error monitoring.
- Add "AI data usage" disclosure near every AI action:
  - what fields are sent;
  - whether direct identifiers are excluded.
- Add user-facing privacy mode:
  - `Strict` (no identifiers ever sent to AI);
  - `Standard` (only role-relevant data).

Exit criteria:
- Product copy matches actual implementation.
- Users can choose strict privacy behavior explicitly.

## Phase 3 (1 week): Observability and Regression Prevention
- Add logger redaction utility (centralized):
  - email/phone/url/token patterns removed before output.
- Add Sentry scrubbing hooks (`beforeSend`) server and edge:
  - drop/clean request bodies and user-entered text fields.
- Add CI privacy tests:
  - AI route contract tests asserting no direct PII leaves sanitizer in strict mode;
  - snapshot tests for sanitized payload shape;
  - grep-based guard to fail if `preview: text.substring` returns to codebase.
- Add privacy review checklist for new AI endpoints.

Exit criteria:
- PII redaction enforced centrally.
- CI blocks regressions automatically.

## Suggested PR Breakdown
- PR1: Shared AI sanitizer + route integration + ATS caller fix.
- PR2: Logging/Sentry redaction.
- PR3: Firestore rules + analytics Admin SDK migration.
- PR4: Sharing privacy persistence + extra hide options.
- PR5: Privacy policy/legal/product copy updates.
- PR6: Test suite + CI guardrails.

## Validation Checklist
- Run integration tests for all AI endpoints with seeded resume containing test PII.
- Confirm outgoing AI payloads do not include email/phone/url/name in strict mode.
- Confirm logs/Sentry events do not include raw resume text.
- Verify analytics page still works for owner and fails for non-owner.
- Verify public resume update keeps hidden fields hidden.
