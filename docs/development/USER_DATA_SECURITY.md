# User data security

This document summarizes how user data is protected in the application. It is based on a codebase review (auth, Firestore, API routes, and secrets).

---

## Summary: **Yes, user data is secured in line with current design**

- **Authentication** is handled by Firebase Auth (ID tokens, server-verified).
- **Authorization** is enforced by Firestore rules (per-user data) and API routes (verifyAuth + server-side use of `auth.user.uid` only).
- **Secrets** (e.g. Gemini API key, Firebase service account) stay server-side; the client only gets public Firebase config and the user’s own ID token.
- **Inputs** are validated and sanitized on sensitive API routes; file uploads are constrained (type, size, magic bytes).

Below is a concise breakdown and a short checklist of optional improvements.

---

## 1. Authentication

- **Firebase Auth** is used for sign-in (email/password, Google). Passwords are never stored in your app; Firebase handles hashing and verification.
- **ID tokens** are obtained via `user.getIdToken()` and sent as `Authorization: Bearer <token>` to your API routes.
- **Server-side verification** (`lib/firebase/admin.ts`, `lib/api/auth-middleware.ts`):
  - API routes use `verifyAuth(request)` which verifies the Bearer token with Firebase Admin `verifyIdToken()`.
  - Only the **decoded token’s `uid` (and email, emailVerified)** are trusted; the server never trusts a client-supplied `userId` for access control.

So: **only authenticated, server-verified users** are accepted by protected APIs.

---

## 2. Authorization and data access

### Firestore (client SDK)

- All Firestore access from the app uses the **client SDK** with the **current user’s ID** from Firebase Auth (e.g. from `useUser()`). Paths follow `users/{userId}/...`.
- **Security rules** (`firestore.rules`) enforce:
  - **Ownership**: `request.auth.uid == userId` for `users/{userId}`, and for subcollections (e.g. `savedResumes`, `savedCoverLetters`, `resumes/current`).
  - **Validation**: Required fields, string lengths, plan values, and that `userId` in the document matches the path. Immutable fields like `createdAt` and `userId` cannot be changed on update.
- **Default deny**: Any path not explicitly allowed is denied (`match /{document=**} { allow read, write: if false; }`).

So: **users can only read/write their own data** in Firestore, and only in the shape allowed by the rules.

### API routes

- Protected routes call `verifyAuth(request)` and then use **only `auth.user.uid`** for:
  - Credits (e.g. `checkCreditsForOperation(auth.user.uid, ...)`).
  - Caching / telemetry (e.g. cache keys derived from `auth.user.uid`).
  - Any future server-side reads/writes keyed by user.
- There is no pattern of trusting `userId` (or similar) from the request body or query for authorization; the only trusted identity is the verified token.

So: **API access is scoped to the authenticated user** and cannot be used to act as another user.

### Public resume sharing

- Public resume download (`/api/public/[username]/[slug]/download`) does **not** use the user’s auth token for the resume itself. It uses **username + slug** and the sharing service, which only returns data for resumes that have been explicitly made public. Access is by design “anyone with the link,” not per-user private data.

So: **private data stays behind auth and Firestore rules**; only intentionally shared content is available without auth.

---

## 3. Secrets and configuration

- **Server-only secrets** (never exposed to the client):
  - `GOOGLE_AI_API_KEY` (or `GEMINI_API_KEY` if used) – used only in server code (e.g. `lib/ai/gemini-client.ts`).
  - `FIREBASE_SERVICE_ACCOUNT_KEY` – used only by Firebase Admin (e.g. `lib/firebase/admin.ts`).
- **Client-safe config**: Only `NEXT_PUBLIC_*` Firebase config (e.g. `NEXT_PUBLIC_FIREBASE_API_KEY`, project ID, etc.) is used in the browser. In Firebase, security is enforced by Auth and Firestore rules, not by hiding the client API key.

So: **sensitive keys stay on the server**; the client only gets public config and the user’s own token.

---

## 4. Input validation and sanitization

- **Auth** is required and tokens are verified before handling sensitive operations.
- **Sanitization** (`lib/api/sanitization.ts`): e.g. `stripHtml`, `sanitizeText`, length limits; used on AI-related and other inputs where applicable.
- **Validation**: Zod schemas and helpers (e.g. `validateJobDescription`, `validateResumeData`, `validateTextInput`) are used on several API routes to validate and bound inputs.
- No server-side file upload; PDF download is rate-limited and has a timeout.

So: **inputs are validated and sanitized** on the server to reduce injection and abuse.

---

## 5. Data in Firestore

- **Firestore** stores user metadata, resumes, cover letters, and usage/plan data under `users/{userId}/...`. Data is protected by the rules above.
- **Server-side Firestore** (Admin SDK) is used only for operations that require it (e.g. credits), and only with the **verified `uid`** from `verifyAuth`, not from client input.
- **Sanitization**: A `sanitizeForFirestore` helper is used before writes to keep stored data in a safe shape.

So: **stored data is scoped to the user and written in a controlled way**.

---

## 6. Optional improvements (hardening)

These are not required for “is user data secure?” to be true, but they can improve security and operability:

1. **HTTPS only**  
   Ensure production is always served over HTTPS (and that redirects from HTTP are in place). Typically enforced by the host (e.g. Vercel).

2. **Security headers**  
   Consider adding headers such as:
   - `Strict-Transport-Security` (HSTS)
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options` or CSP if you want to restrict framing/scripts

3. **Rate limiting**  
   Add rate limiting on auth and/or AI endpoints to reduce abuse and credential stuffing. (No rate limiting was found in the reviewed code.)

4. **Email verification**  
   Email verification on signup is already implemented; you can optionally restrict sensitive actions until `emailVerified` is true (e.g. using the existing `emailVerified` in the token).

5. **Audit and logging**  
   For sensitive actions (e.g. delete account, export data), consider structured logging (without logging PII in plain text) for audit and support.

6. **Firestore rules**  
   Rules already restrict `plan` and critical fields; you can periodically re-review them when adding new collections or fields.

---

## 7. PDF download (flood / DoS protection)

To protect against abuse and server flooding:

- **Public CV download** (`POST /api/public/[username]/[slug]/download`):
  - **Rate limiting** – `DOWNLOAD` preset: 10/min and 30/hour per IP (no auth on this route).
  - **Timeout** – PDF generation aborted after 60s to avoid long-running requests.

Rate limits are defined in `lib/api/rate-limit.ts` (`RATE_LIMITS.DOWNLOAD`). In serverless environments the in-memory limiter is per instance; for strict cross-instance limits you can add Redis (e.g. Upstash) later.

---

## 8. Quick checklist

| Area              | Status |
|-------------------|--------|
| Auth required on APIs | ✅ `verifyAuth()` on protected routes |
| Token verification    | ✅ Firebase Admin `verifyIdToken()` |
| Firestore by user     | ✅ Rules enforce `request.auth.uid == userId` |
| No client userId trust| ✅ APIs use only `auth.user.uid` |
| Secrets server-only  | ✅ No server secrets in client bundle |
| Input validation     | ✅ Sanitization + Zod where needed |
| File upload checks   | N/A (no file upload)        |
| Default deny         | ✅ Firestore catch-all deny |
| Download rate limit  | ✅ Per IP (public route)    |
| Export timeout       | ✅ 60s for PDF generation   |

**Conclusion:** User data is secured through authentication, server-side token verification, Firestore rules, and API design that uses only the verified user ID. PDF download is protected by rate limits and a timeout to reduce flood and DoS risk.
