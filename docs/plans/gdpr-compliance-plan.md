# GDPR Compliance Plan

**Target:** Full compliance with Regulation (EU) 2016/679
**Current state:** ~75% compliant
**Created:** 2026-03-07

---

## Gap Summary

| # | Gap | Severity | Type |
|---|-----|----------|------|
| 1 | No DPA with Google (Gemini AI) | Critical | Legal |
| 2 | No DPA with Firebase / Google | Critical | Legal |
| 3 | No DPA with Vercel | High | Legal |
| 4 | No DPA with Upstash (KV — stores IP addresses) | High | Legal |
| 5 | IP addresses stored in Upstash KV not disclosed in Privacy Policy | High | Policy + Code |
| 6 | `trackAiEvent` fires without checking cookie consent | High | Code |
| 7 | Binary cookie consent (no granular per-purpose control) | Medium | UX + Policy |
| 8 | No consent re-prompt when Privacy Policy changes materially | Medium | Code + Process |
| 9 | Privacy Policy lacks explicit legal basis per processing activity | Medium | Policy |
| 10 | No dedicated DPO / privacy contact | Low–Medium | Process |
| 11 | `newAccountsByIp` deletion relies on collectionGroup query — coverage not verified | Low | Code |
| 12 | No Record of Processing Activities (RoPA) document | Medium | Legal |

---

## Phase 1 — Legal / Contractual (no code needed)

### 1.1 Sign Data Processing Agreements

GDPR Art. 28 requires a DPA with every processor that handles personal data on your behalf.

**Action:** Sign (or accept) the DPA for each vendor:

| Vendor | What they process | DPA location |
|--------|------------------|--------------|
| Google (Gemini API) | Resume content sent to AI | [Google Cloud DPA](https://cloud.google.com/terms/data-processing-addendum) — accept in Google Cloud console under your project |
| Google (Firebase) | Auth tokens, Firestore data | Covered by Google Cloud DPA above (Firebase is a GCP product) |
| Vercel | All HTTP traffic, server logs, Vercel Analytics data | [Vercel DPA](https://vercel.com/legal/dpa) — available under Vercel account settings (Pro/Enterprise plan required for formal DPA) |
| Upstash | IP-keyed rate-limit counters | [Upstash DPA](https://upstash.com/trust/dpa.pdf) — request via Upstash dashboard or email |

**Note on Gemini specifically:** Even with PII stripped by `sanitizeResumeForAI()`, resume content (job titles, companies, descriptions) is personal data. The DPA must be in place regardless of sanitization.

### 1.2 Create a Record of Processing Activities (RoPA)

GDPR Art. 30 requires an internal register. Create `docs/legal/ropa.md` with at minimum:

- Name and contact of controller
- Purpose of each processing activity
- Categories of data subjects and personal data
- Recipients / processors (the vendor list above)
- Transfers to third countries (Google/Vercel = US → covered by EU–US Data Privacy Framework if Google/Vercel are certified)
- Retention periods
- Security measures

### 1.3 Verify Third-Country Transfer Mechanisms

Google and Vercel are US-based. Confirm they rely on the EU–US Data Privacy Framework (DPF) or Standard Contractual Clauses (SCCs) for EU data transfers. Both currently use SCCs + DPF. Document this in the RoPA.

---

## Phase 2 — Privacy Policy Updates

File: `app/privacy/page.tsx`

### 2.1 Add Explicit Legal Basis per Processing Activity

Add a table or section mapping each activity to its GDPR legal basis (Art. 6):

| Processing activity | Legal basis |
|--------------------|-------------|
| Account creation and authentication | Contract (Art. 6(1)(b)) |
| Resume storage and sync | Contract (Art. 6(1)(b)) |
| AI content generation | Contract (Art. 6(1)(b)) |
| Vercel Analytics | Consent (Art. 6(1)(a)) |
| Public resume view/download analytics | Consent (Art. 6(1)(a)) |
| Anti-abuse rate limiting (IP hashing) | Legitimate interest (Art. 6(1)(f)) |
| Error monitoring (Sentry) | Legitimate interest (Art. 6(1)(f)) |

### 2.2 Disclose IP Address Processing for Rate Limiting

The Upstash KV store receives hashed IP addresses for rate limiting. This is personal data and must be disclosed:

- Add to "Automatically Collected Information": hashed IP addresses used for abuse prevention (retained up to 24 hours in rate-limit store)
- Add Upstash to "Third-Party Services" section
- Explain the legitimate interest basis (abuse prevention)

### 2.3 Add Policy Version / Changelog

Add a visible policy version number and a brief changelog so users can see what changed between versions. This supports the consent re-prompt mechanism (Phase 3.3).

### 2.4 Clarify AI Data Handling

Strengthen the AI section:
- State explicitly that PII (name, email, phone) is stripped before sending content to Gemini by default
- State that resume content (experience, skills) is sent to Google's Gemini API, processed under Google's DPA, and not retained by Google for training (confirm with Google's terms)
- Link to Google's data processing terms

---

## Phase 3 — Code Changes

### 3.1 Fix `trackAiEvent` — Gate Behind Consent (High priority)

**File:** `lib/ai/telemetry.ts`

Currently `trackAiEvent` fires unconditionally via `window.analytics` or `window.plausible`. If either of those is a third-party analytics tool loaded without consent, this violates GDPR.

**Fix:** Check consent before firing:

```typescript
import { isGrantedCookieConsent, readCookieConsentClient } from "@/lib/privacy/consent";

export function trackAiEvent(event: AiEventName, payload: AiTelemetryPayload) {
  // Only fire analytics if user has consented
  if (!isGrantedCookieConsent(readCookieConsentClient())) return;
  // ... existing logic
}
```

### 3.2 Granular Cookie Consent (Medium priority)

**Files:** `lib/privacy/consent.ts`, `components/privacy/cookie-consent-banner.tsx`

Current consent is binary (all or nothing). GDPR requires granular consent per purpose when multiple non-essential categories exist.

Current non-essential categories:
- Vercel Analytics (page views, user behaviour)
- Public resume analytics (view/download tracking)
- AI telemetry events (if fired to third-party analytics)

**Fix:** Extend `CookieConsentValue` to support per-category consent:

```typescript
export type CookieConsentCategories = {
  analytics: boolean;      // Vercel Analytics
  resumeAnalytics: boolean; // public resume view tracking
};

export type CookieConsentValue =
  | "rejected"
  | "accepted"             // legacy: all accepted
  | CookieConsentCategories; // granular
```

Update the banner to show "Manage Preferences" expanding to per-category toggles, with "Accept All" and "Reject All" as shortcuts.

Update `ConsentedVercelAnalytics` and `analyticsServiceServer` to read per-category consent.

### 3.3 Consent Re-prompt on Policy Changes (Medium priority)

**Files:** `lib/privacy/consent.ts`, `components/privacy/cookie-consent-banner.tsx`

When the Privacy Policy or cookie policy changes materially, existing consent is invalidated.

**Fix:** Store a `consentVersion` alongside the consent value. Define the current policy version as a constant. On page load, if `consentVersion !== CURRENT_POLICY_VERSION`, reset consent to `null` so the banner re-appears.

```typescript
export const CURRENT_POLICY_VERSION = "2026-03"; // update on material changes

export function isConsentCurrent(stored: StoredConsent | null): boolean {
  return stored?.version === CURRENT_POLICY_VERSION;
}
```

### 3.4 Verify `newAccountsByIp` / `newAccountsByDevice` Deletion (Low priority)

**File:** `lib/services/account-deletion-service.ts`

The current deletion uses `collectionGroup("users").where(FieldPath.documentId(), "==", userId)` to find abuse signals. Verify this actually matches the Firestore path structure used when writing these documents. If the path is `newAccountsByIp/{ip}/users/{userId}`, the collectionGroup query should work — but add an integration test or manual verification.

**Action:** Write a test or log the path structure to confirm deletion covers all documents.

### 3.5 Data Export — Verify AI Usage Inclusion

**File:** `components/settings/components/data-export.tsx` (or equivalent)

The JSON export must include all personal data held. Currently it likely exports resume data. Check whether `ai-usage` collection data (credit usage per user) is exported. If not, add it.

---

## Phase 4 — Operational / Process

### 4.1 Designate a Privacy Contact

Add a dedicated privacy email (e.g., `privacy@resumezeus.app`) distinct from general support. Update the Privacy Policy contact section and add it to the site footer. A formal DPO appointment is only mandatory if processing is large-scale or involves special categories of data — for a small SaaS it's optional but recommended.

### 4.2 Data Subject Request (DSR) Process

Define an internal SOP for handling:
- **Access requests** — respond within 30 days, provide data export
- **Erasure requests** — use `accountDeletionService.deleteAccount()`, respond within 30 days
- **Rectification requests** — user can do this self-service in the app
- **Portability requests** — provide JSON export
- **Objection requests** — e.g., objecting to legitimate-interest processing

Document the process in `docs/legal/dsr-process.md`.

### 4.3 Breach Notification Plan

GDPR requires notifying the supervisory authority (ANSPDCP) within 72 hours of discovering a breach. Document:
- Who is responsible for declaring a breach
- How to assess severity
- ANSPDCP notification form/contact
- When to notify affected users (if high risk to individuals)

Store in `docs/legal/breach-notification-plan.md`.

### 4.4 Annual Review

Schedule an annual GDPR review to:
- Re-verify vendor DPAs are still in place
- Update RoPA for any new processing activities
- Check for changes in applicable law
- Bump `CURRENT_POLICY_VERSION` if policy changes

---

## Implementation Order

```
Week 1 (Legal — no code):
  ✅ Accept Google Cloud DPA (covers Gemini + Firebase)
  ✅ Accept/request Vercel DPA
  ✅ Request Upstash DPA
  ✅ Draft RoPA (docs/legal/ropa.md)

Week 2 (Policy updates):
  ✅ Add legal basis table to Privacy Policy
  ✅ Disclose IP/Upstash rate limiting
  ✅ Strengthen AI data handling section
  ✅ Add policy version + changelog
  ✅ Add privacy contact email

Week 3 (Code — high priority):
  ✅ Gate trackAiEvent behind consent check (3.1)
  ✅ Verify newAccountsByIp deletion coverage (3.4)
  ✅ Verify data export completeness (3.5)

Week 4 (Code — medium priority):
  ✅ Granular cookie consent (3.2)
  ✅ Consent re-prompt on version change (3.3)

Ongoing:
  ✅ DSR process documentation
  ✅ Breach notification plan
  ✅ Annual review scheduled
```

---

## What You're Already Doing Right

- Cookie consent banner blocks analytics until accepted ✅
- `ConsentedVercelAnalytics` gated correctly ✅
- Analytics track API checks consent server-side ✅
- PII stripped before AI requests by default ✅
- Full account deletion service (Firestore + Firebase Auth) ✅
- Data retention periods documented and enforced ✅
- GDPR rights listed in Privacy Policy with supervisory authority ✅
- Data controller identity disclosed ✅
- HTTPS enforced ✅
- Firestore security rules enforce user-level access ✅
