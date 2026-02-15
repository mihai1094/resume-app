# Production Remediation Plan

Date: February 5, 2026
Project: ResumeForge

## Objective

Close all production-readiness gaps found in the review, with priority on security, billing integrity, and abuse resistance, then restore CI quality gates.

## Scope

This plan covers:

- Security and authorization gaps
- AI API charging and abuse controls
- Public endpoint hardening
- Firestore rules and data-model alignment
- Lint/test/build reliability
- Documentation and operational readiness

## Priority Matrix

P0:

- Prevent self-upgrade to premium through client-writable plan fields
- Prevent charging credits before request validation
- Ensure public expensive endpoints are abuse-protected

P1:

- Unify AI route protections (rate limit, timeout, validation, error model)
- Align Firestore rules with collections in use (`publicResumes`, `analytics`, `usernames`)
- Make lint/test part of reliable release criteria

P2:

- Strengthen CSP and header policy
- Clean docs/version drift and release runbook

## Phase 1: Security and Billing Integrity (P0)

### 1.1 Lock down plan mutation in Firestore rules

Current risk:

- Rules allow user-managed `plan` values including legacy premium aliases (`ai`, `pro`) while server maps those to premium.

Files:

- `firestore.rules`
- `lib/services/credit-service-server.ts`

Actions:

- Restrict `plan` writes in client Firestore rules so clients cannot elevate themselves.
- Remove acceptance of legacy premium aliases in client-write paths.
- Keep backward compatibility migration server-side only.
- Add emulator tests for:
  - user cannot set `plan` to premium/ai/pro directly
  - user cannot modify `subscription` fields directly

Acceptance criteria:

- Authenticated users can update profile fields but cannot modify billing/plan state through client SDK.
- Emulator tests prove denial on plan/subscription tampering.

### 1.2 Move dev/admin plan-switch controls to server-only APIs

Current risk:

- Client hook can call plan/credit mutation directly via Firestore service functions.

Files:

- `hooks/use-ai-credits.ts`
- `lib/services/credit-service.ts`
- `lib/services/firestore.ts`
- `lib/config/admin.ts`

Actions:

- Create admin-only route handlers for:
  - reset credits
  - switch plan
- Verify admin identity on server from Firebase token and approved admin email list.
- Remove direct client writes for these operations.

Acceptance criteria:

- Dev/admin tools still work for approved admins.
- Non-admin users cannot invoke plan/credit admin actions.

### 1.3 Charge credits only after request validation

Current risk:

- AI routes deduct credits before validating request body.

Files (representative):

- `app/api/ai/generate-bullets/route.ts`
- `app/api/ai/generate-cover-letter/route.ts`
- `app/api/ai/score-resume/route.ts`
- all `app/api/ai/*/route.ts`

Actions:

- Reorder route flow:
  - auth
  - parse and validate input
  - rate limit
  - credit check/deduct
  - execute AI call
- Standardize this order across all AI routes.
- Add regression tests ensuring invalid payloads do not consume credits.

Acceptance criteria:

- Validation failures return 4xx and do not increment credit usage.

## Phase 2: AI API Hardening and Consistency (P1)

### 2.1 Standardize AI route wrapper adoption

Current risk:

- Most routes do not use shared wrapper protections.

Files:

- `lib/api/ai-route-wrapper.ts`
- `app/api/ai/*/route.ts`

Actions:

- Make wrapper usage mandatory for all AI endpoints.
- Extend wrapper to support:
  - pluggable schema validation
  - route-specific timeout
  - optional per-route credit operation key
- Remove duplicated per-route auth/error plumbing.

Acceptance criteria:

- 100% AI routes use shared wrapper.
- Every AI route has explicit timeout and validation schema.

### 2.2 Replace in-memory rate limiting for production

Current risk:

- Current limiter state is per-instance memory and not durable/distributed.

Files:

- `lib/api/rate-limit.ts`

Actions:

- Switch to a distributed store (Redis/Upstash/managed equivalent).
- Keep per-user and per-IP quotas with consistent retry headers.
- Add observability metrics for blocked requests.

Acceptance criteria:

- Limits hold across multiple instances and cold starts.

## Phase 3: Public Endpoint Abuse Resistance (P0/P1)

### 3.1 Protect public PDF download route

Current risk:

- Expensive PDF generation is open and unthrottled.

Files:

- `app/api/public/[username]/[slug]/download/route.ts`

Actions:

- Add IP and token bucket throttling.
- Add short-term cache for generated PDF payloads by `resumeId + template + customization hash`.
- Add abuse logging and alert thresholds.

Acceptance criteria:

- Burst abuse gets 429.
- Repeated identical downloads avoid repeated expensive generation.

### 3.2 Harden analytics ingestion

Current risk:

- Public analytics endpoint can be spammed.

Files:

- `app/api/analytics/track/route.ts`
- `lib/services/analytics-service.ts`

Actions:

- Add rate limiting and basic bot filtering.
- Validate `resumeId` format and existence before tracking.
- Add optional dedupe window to reduce event flood impact.

Acceptance criteria:

- Event spam materially reduced; analytics reflect realistic traffic.

## Phase 4: Firestore Rules and Collection Alignment (P1)

Current risk:

- App uses collections not covered by current rules (`publicResumes`, `analytics`, `usernames`).

Files:

- `firestore.rules`
- `lib/services/sharing-service.ts`
- `lib/services/analytics-service.ts`
- `lib/services/username-service.ts`
- `app/u/[username]/[slug]/page.tsx`

Actions:

- Decide data-access model:
  - model A: keep client SDK access and define strict rules for all collections
  - model B: move sensitive/public write operations to server APIs using admin SDK
- Implement chosen model consistently.
- Add rules tests for all sharing and analytics paths.

Acceptance criteria:

- Deployed rules explicitly support the features used in app.
- No production feature depends on undeclared rule behavior.

## Phase 5: CI and Release Quality Gates (P1)

### 5.1 Fix lint scope and repository hygiene

Current issue:

- Generated artifacts in git are triggering lint failures.

Files:

- `.gitignore`
- `eslint.config.mjs`
- tracked artifacts under `playwright-report/` and `test-results/`

Actions:

- Stop tracking generated report artifacts.
- Ignore `playwright-report/**`, `test-results/**`, and similar build artifacts.
- Keep lint target focused on source directories.

Acceptance criteria:

- `pnpm lint` runs against source only and is green.

### 5.2 Restore test reliability

Current issue:

- Large failing test set across validation and UI flows.

Files (key clusters):

- `lib/validation/__tests__/resume-validation.test.ts`
- `components/resume/__tests__/resume-editor.test.tsx`
- `app/onboarding/components/__tests__/job-title-step.test.tsx`
- `components/resume/forms/__tests__/work-experience-form.test.tsx`

Actions:

- Triage failures by category:
  - expected behavior changed, tests outdated
  - real regressions in forms/validation/accessibility wiring
- Fix code or tests with explicit changelog entries.
- Enforce PR gates:
  - build pass
  - lint pass
  - unit test pass

Acceptance criteria:

- `pnpm build`, `pnpm lint`, and `pnpm vitest run` are all green in CI.

## Phase 6: Header and CSP Hardening (P2)

Current issue:

- Production CSP still allows `'unsafe-inline'` scripts.

Files:

- `next.config.js`
- `proxy.ts`

Actions:

- Implement nonce- or hash-based CSP for scripts.
- Remove redundant/legacy headers where appropriate and keep one clear header policy path.
- Add CSP report-only stage before enforcement if needed.

Acceptance criteria:

- No `'unsafe-inline'` in production CSP for scripts.
- App remains functional with hardened policy.

## Phase 7: Documentation and Ops (P2)

Files:

- `README.md`
- `DEPLOYMENT.md`
- `docs/development/preflight-checklist.md`

Actions:

- Update stack versions and runtime assumptions.
- Add release checklist with hard gates and rollback steps.
- Document incident response for AI quota/rate-limit spikes.

Acceptance criteria:

- Docs match actual framework/tooling versions and release process.

## Suggested Execution Order

Week 1:

- Phase 1
- Phase 3.1
- Phase 4 decision and implementation start

Week 2:

- Phase 2
- Phase 3.2
- Phase 5

Week 3:

- Phase 6
- Phase 7
- Final hardening regression and launch sign-off

## Release Gate Checklist

- Firestore rules deployed and emulator-tested
- No client path can self-upgrade plan
- AI credits deducted only after valid input
- AI/public endpoints consistently rate-limited
- Lint green
- Tests green
- Build green
- Security headers and CSP validated in production

## Ownership Suggestion

- Security and rules: Backend engineer
- AI route standardization: Backend engineer
- Public route hardening: Backend engineer
- Test and lint restoration: Full-stack engineer
- CSP and deployment policy: Platform engineer
- Documentation and runbook: Tech lead
