# Production Hardening Plan

> Comprehensive step-by-step guide based on a full codebase audit (Feb 2026).
> Organized by priority. Each task includes rationale, affected files, and acceptance criteria.

---

## Phase 1: CI/CD Pipeline (P0 - Do First)

The project has no automated quality gates. Tests, linting, and type-checking exist locally but nothing enforces them on push or PR.

### 1.1 Create GitHub Actions CI Workflow

**Why:** Broken builds and regressions can reach `main` undetected. Every other improvement is undermined without this.

**Steps:**

1. Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: npx tsc --noEmit

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test -- --run --reporter=verbose

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
    env:
      # Stub env vars so build doesn't fail on missing Firebase config
      NEXT_PUBLIC_FIREBASE_API_KEY: stub
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: stub
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: stub
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: stub
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: stub
      NEXT_PUBLIC_FIREBASE_APP_ID: stub
```

2. Add branch protection rules on `main`:
   - Require all CI checks to pass before merge
   - Require at least 1 approval on PRs

3. Add a `typecheck` script to `package.json`:
```json
"typecheck": "tsc --noEmit"
```

**Acceptance criteria:**
- [ ] PRs cannot merge without passing lint, typecheck, test, and build
- [ ] `main` branch is protected

---

## Phase 2: Critical Test Coverage (P1)

Tests exist for UI components and exports, but the backend/service layer (auth, credits, Firestore, API routes) has zero automated coverage. These are the most critical paths for a production app.

### 2.1 Create Test Fixtures & Factories

**Why:** Tests currently define mock data inline and inconsistently. Centralized factories reduce duplication and make tests easier to write.

**Files to create:**
- `tests/fixtures/user.ts`
- `tests/fixtures/resume.ts`
- `tests/fixtures/cover-letter.ts`
- `tests/fixtures/index.ts` (barrel export)

**Steps:**

1. Create `tests/fixtures/user.ts`:
```typescript
import type { User } from '@/lib/types/user';

export const createMockUser = (overrides?: Partial<User>): User => ({
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  plan: 'free',
  createdAt: new Date('2025-01-01'),
  ...overrides,
});
```

2. Create `tests/fixtures/resume.ts`:
```typescript
import type { ResumeData } from '@/lib/types/resume';
import { generateId } from '@/lib/utils/id';

export const createMockResume = (overrides?: Partial<ResumeData>): ResumeData => ({
  id: generateId(),
  personalInfo: { firstName: 'John', lastName: 'Doe', email: 'john@example.com', /* ... */ },
  workExperience: [],
  education: [],
  skills: [],
  // ... default empty sections
  ...overrides,
});
```

3. Create similar factory for cover letters.

4. Re-export everything from `tests/fixtures/index.ts`.

**Acceptance criteria:**
- [ ] All new tests use factories instead of inline mock data
- [ ] Factories cover User, ResumeData, CoverLetter types

---

### 2.2 Test Error Handler (`lib/api/error-handler.ts`)

**Why:** Every API route depends on this. A bug here means all error responses break.

**File to create:** `lib/api/__tests__/error-handler.test.ts`

**Test cases:**
1. `handleApiError` returns correct status for each error type:
   - `ValidationError` -> 400
   - `AuthError` -> 401
   - `CreditError` -> 402
   - `RateLimitError` -> 429
   - `AIServiceError` -> 503
   - Unknown error -> 500
2. Response body includes `error`, `code`, `details` fields
3. Stack traces included only in development (`NODE_ENV=development`)
4. `validationError()` helper returns 400 with field details
5. Logging called with correct level (error for 500, warn for 400)

**Acceptance criteria:**
- [ ] 10+ test cases covering all error types
- [ ] Edge cases: null error, string error, Error with no message

---

### 2.3 Test Auth Middleware (`lib/api/auth-middleware.ts`)

**Why:** Guards every authenticated API route. If this breaks, the entire API is open.

**File to create:** `lib/api/__tests__/auth-middleware.test.ts`

**Test cases:**
1. Missing `Authorization` header -> 401
2. Malformed token (not `Bearer xxx`) -> 401
3. Invalid Firebase token -> 401
4. Valid token -> returns `{ success: true, user: { uid, email } }`
5. Expired token -> 401
6. Optional auth mode: missing token returns `null` user (no error)

**Mocking:** Mock `firebase-admin/auth` `verifyIdToken` function.

**Acceptance criteria:**
- [ ] 6+ test cases
- [ ] Firebase Admin SDK properly mocked (no real network calls)

---

### 2.4 Test Credit Middleware (`lib/api/credit-middleware.ts`)

**Why:** Controls billing logic. A bug means users get free AI usage or get wrongly blocked.

**File to create:** `lib/api/__tests__/credit-middleware.test.ts`

**Test cases:**
1. User with sufficient credits -> success, credits deducted
2. User with 0 credits -> 402 Payment Required
3. User with fewer credits than cost -> 402
4. Premium user with unlimited plan -> always succeeds
5. Credit cost correctly applied per operation type
6. Firestore update called with correct new balance

**Acceptance criteria:**
- [ ] 6+ test cases
- [ ] Firestore mocked for credit reads/writes

---

### 2.5 Test Firestore Service (`lib/services/firestore.ts`)

**Why:** 500+ lines, zero tests. Every data operation flows through this service.

**File to create:** `lib/services/__tests__/firestore.test.ts`

**Test cases (grouped):**

**Resume operations:**
1. `saveResume` - saves data with correct structure
2. `loadResume` - returns resume data
3. `loadResume` - returns null for non-existent resume
4. `deleteResume` - removes document
5. `listResumes` - returns array of user's resumes
6. Plan limit enforcement: free user with 3 resumes -> error on 4th

**User operations:**
7. `createUserProfile` - creates with correct fields
8. `getUserProfile` - returns profile
9. `updateUserProfile` - partial update works
10. `deleteUserData` - removes all user documents

**Data sanitization:**
11. Undefined values stripped before Firestore write
12. Nested objects sanitized recursively

**Mocking:** Mock Firestore SDK (`getDoc`, `setDoc`, `updateDoc`, `deleteDoc`, `collection`, `query`).

**Acceptance criteria:**
- [ ] 12+ test cases covering CRUD + edge cases
- [ ] No real Firestore calls (fully mocked)

---

### 2.6 Test API Routes (Top 5 Most Critical)

**Why:** 0/19 API routes have tests. Start with the most-used endpoints.

**Files to create:**
- `app/api/ai/generate-bullets/__tests__/route.test.ts`
- `app/api/ai/analyze-ats/__tests__/route.test.ts`
- `app/api/ai/generate-summary/__tests__/route.test.ts`
- `app/api/ai/suggest-skills/__tests__/route.test.ts`
- `app/api/ai/tailor-resume/__tests__/route.test.ts`

**Test pattern for each route:**
1. Unauthenticated request -> 401
2. Missing required fields -> 400 with field errors
3. Input too short / invalid -> 400 with validation message
4. Insufficient credits -> 402
5. Successful request -> 200 with expected response shape
6. AI service timeout -> 503
7. Cache hit returns cached result (no AI call)

**Mocking:** Mock `verifyAuth`, `checkCreditsForOperation`, and the AI generation function.

**Acceptance criteria:**
- [ ] 7+ test cases per route (35+ total)
- [ ] Auth, credit, validation, success, and error paths all covered

---

## Phase 3: Architecture Improvements (P1-P2)

### 3.1 Extract Editor State into Custom Hook

**Why:** `resume-editor.tsx` is 936 lines with 60+ state variables. It's the hardest file to modify and the most prone to regressions.

**Files to modify:**
- Create: `hooks/use-resume-editor-state.ts`
- Modify: `components/resume/resume-editor.tsx`

**Steps:**

1. Create `hooks/use-resume-editor-state.ts` that extracts:
   - All `useState` calls (current section, dialogs, export state, etc.)
   - All `useCallback` handlers (section navigation, save, export, etc.)
   - Validation logic (`useMemo` for validation computation)
   - Keyboard shortcut setup
   - Auto-save logic

2. The hook should return a structured object:
```typescript
interface ResumeEditorState {
  // Section navigation
  currentSection: number;
  setCurrentSection: (index: number) => void;
  goToNextSection: () => void;
  goToPreviousSection: () => void;

  // Save state
  isSaving: boolean;
  lastSaved: Date | null;
  save: () => Promise<void>;

  // Export
  isExporting: boolean;
  exportPDF: () => Promise<void>;
  exportDOCX: () => Promise<void>;

  // Dialogs
  dialogs: DialogState;
  openDialog: (name: string) => void;
  closeDialog: (name: string) => void;

  // Validation
  validationErrors: ValidationErrors;
  showErrors: boolean;
}
```

3. Refactor `resume-editor.tsx` to consume the hook. Target: under 400 lines.

4. Write tests for the extracted hook in `hooks/__tests__/use-resume-editor-state.test.ts`.

**Acceptance criteria:**
- [ ] `resume-editor.tsx` reduced to <450 lines
- [ ] No behavior changes (all existing editor tests still pass)
- [ ] New hook has 10+ test cases

---

### 3.2 Add Route-Level Loading States

**Why:** No `loading.tsx` files exist. Users see blank screens during route transitions.

**Files to create:**
- `app/editor/loading.tsx`
- `app/dashboard/loading.tsx`
- `app/cover-letter/loading.tsx`
- `app/settings/loading.tsx`
- `app/templates/loading.tsx`

**Steps:**

1. For each route, create a `loading.tsx` that renders an appropriate skeleton:

```typescript
// app/editor/loading.tsx
import { ResumeEditorSkeleton } from "@/components/loading-skeleton";

export default function EditorLoading() {
  return <ResumeEditorSkeleton />;
}
```

2. For `dashboard/loading.tsx`, create a grid of card skeletons.
3. For `settings/loading.tsx`, create a form skeleton.
4. For `templates/loading.tsx`, create a grid of template card skeletons.

**Acceptance criteria:**
- [ ] Every protected route has a `loading.tsx`
- [ ] Skeletons match the layout of the actual page
- [ ] No blank flashes during navigation

---

### 3.3 Fix Logging Inconsistencies

**Why:** `console.error` used in 4 locations despite project-wide logger service and ESLint rule banning `console.log`.

**Files to modify:**
- `lib/api/auth-middleware.ts` (line ~98)
- `lib/api/credit-middleware.ts` (line ~127)
- `lib/services/export.ts` (lines ~467, ~1279)

**Steps:**

1. In `auth-middleware.ts`, replace:
```typescript
// Before
console.error("Auth verification error:", error);
// After
authLogger.error("Auth verification error", error);
```

2. In `credit-middleware.ts`, replace:
```typescript
// Before
console.error("[Credits] Error checking credits:", error);
// After
storageLogger.error("Error checking credits", error);
```

3. In `export.ts`, replace both `console.error` calls with the appropriate logger (create an `exportLogger` if needed).

4. Run `grep -r "console\." --include="*.ts" --include="*.tsx" lib/ hooks/ components/ app/` to find any remaining violations.

**Acceptance criteria:**
- [ ] Zero `console.log`/`console.error` in `lib/`, `hooks/`, `components/`, `app/`
- [ ] All logging uses structured logger service
- [ ] ESLint passes with no suppressions

---

### 3.4 Batch Firestore Deletes

**Why:** `deleteUserData` in `firestore.ts` uses a loop with individual deletes. This is an N+1 pattern — slow and expensive.

**File to modify:** `lib/services/firestore.ts`

**Steps:**

1. Find the `deleteUserData` method (around line 801-831).

2. Replace the loop-based deletion with Firestore batch writes:
```typescript
async deleteUserData(userId: string): Promise<void> {
  const batch = writeBatch(db);

  // Query all user's resumes
  const resumesSnap = await getDocs(
    query(collection(db, COLLECTIONS.SAVED_RESUMES), where('userId', '==', userId))
  );
  resumesSnap.forEach(doc => batch.delete(doc.ref));

  // Query all user's cover letters
  const lettersSnap = await getDocs(
    query(collection(db, COLLECTIONS.COVER_LETTERS), where('userId', '==', userId))
  );
  lettersSnap.forEach(doc => batch.delete(doc.ref));

  // Delete user document
  batch.delete(doc(db, COLLECTIONS.USERS, userId));

  await batch.commit();
}
```

3. Note: Firestore batches have a 500-operation limit. If a user could have more than ~498 documents, chunk into multiple batches.

**Acceptance criteria:**
- [ ] `deleteUserData` uses batch writes
- [ ] Test added for batch delete (mock Firestore `writeBatch`)

---

## Phase 4: Template System (P2)

### 4.1 Create Shared Template Utilities

**Why:** 22 templates exist in both HTML and PDF versions (44 files). Common rendering logic (contact info, date formatting, section headers) is duplicated.

**File to create:** `lib/templates/shared.ts`

**Steps:**

1. Audit common patterns across 3-4 templates. Look for:
   - Contact info rendering (email, phone, location, LinkedIn)
   - Date range formatting ("Jan 2024 - Present")
   - Section visibility checks (hide empty sections)
   - Skill grouping by category
   - Bullet point text sanitization

2. Create pure utility functions (no JSX — these are data transformers):
```typescript
// lib/templates/shared.ts

export function formatDateRange(
  startDate: string | undefined,
  endDate: string | undefined,
  isCurrent: boolean
): string { /* ... */ }

export function getVisibleSections(data: ResumeData): SectionKey[] { /* ... */ }

export function groupSkillsByCategory(skills: Skill[]): Record<string, Skill[]> { /* ... */ }

export function formatContactLine(personalInfo: PersonalInfo): string[] { /* ... */ }

export function sanitizeForPdf(text: string | undefined): string { /* ... */ }
```

3. Refactor 2-3 templates (start with `modern` HTML + PDF) to use these utilities.

4. Write tests for all shared utilities.

5. Gradually migrate remaining templates.

**Acceptance criteria:**
- [ ] Shared utilities have 100% test coverage
- [ ] At least 3 template pairs (HTML + PDF) refactored to use shared utils
- [ ] No visual regressions (compare PDF output before/after)

---

### 4.2 Extract Shared BulletItem Component

**Why:** The `BulletItem` component is defined inline inside `work-experience-form.tsx` and the same pattern is duplicated in education and project forms.

**Files to modify:**
- Create: `components/resume/forms/shared/bullet-item.tsx`
- Modify: `components/resume/forms/work-experience-form.tsx`
- Modify: `components/resume/forms/education-form.tsx`
- Modify: `components/resume/forms/projects-form.tsx`

**Steps:**

1. Extract `BulletItem` from `work-experience-form.tsx` into a shared component:
```typescript
// components/resume/forms/shared/bullet-item.tsx
interface BulletItemProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  onImprove?: () => void;
  onQuantify?: () => void;
  isImproving?: boolean;
  placeholder?: string;
}
```

2. Replace inline BulletItem usage in all 3 form components.

3. Move AI bullet improvement logic into a shared hook if not already extracted.

**Acceptance criteria:**
- [ ] Single `BulletItem` component used by all forms
- [ ] Existing tests still pass
- [ ] New component has its own test file

---

## Phase 5: Performance & SSR (P3)

### 5.1 Convert Static Pages to Server Components

**Why:** 186 `"use client"` directives. Pages like home, pricing, and templates could be Server Components with static generation for better TTFB and smaller client bundles.

**Files to evaluate:**
- `app/page.tsx` (home)
- `app/templates/page.tsx`
- `app/pricing/page.tsx`

**Steps:**

1. For each page, check if it uses client-only APIs (hooks, event handlers, browser APIs).

2. If the page is mostly static content with interactive islands:
   - Keep the page as a Server Component
   - Extract interactive parts into separate `"use client"` components
   - Import client components into the server page

3. Example for home page:
```typescript
// app/page.tsx (Server Component - no "use client")
import { HeroSection } from "@/components/landing/hero-section"; // client
import { StatsSection } from "@/components/landing/stats-section"; // can be server
import { FAQSection } from "@/components/landing/faq-section"; // client (accordion)

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection /> {/* Static - render on server */}
      <FAQSection />
    </>
  );
}
```

4. Measure bundle size before/after using `next build --analyze` (add `@next/bundle-analyzer` as dev dep).

**Acceptance criteria:**
- [ ] Home, pricing, and templates pages are Server Components
- [ ] Client JS reduced by measurable amount (document in PR)
- [ ] No visual or functional regressions

---

### 5.2 Lazy-Load Heavy Dependencies

**Why:** Recharts (~400KB) and AI libraries (~500KB) are bundled even on pages that don't use them.

**Files to modify:**
- Components importing `recharts` (score displays, analytics)
- Components importing `@google/generative-ai` (if any client-side)

**Steps:**

1. Find all Recharts imports:
```bash
grep -r "from 'recharts'" --include="*.tsx" components/
```

2. Wrap chart components with `next/dynamic`:
```typescript
import dynamic from 'next/dynamic';

const ScoreChart = dynamic(() => import('./score-chart'), {
  loading: () => <div className="h-48 animate-pulse bg-muted rounded" />,
  ssr: false,
});
```

3. Verify AI library (`@google/generative-ai`) is only imported server-side (in API routes). If any client-side imports exist, move them behind dynamic imports.

4. Add `@next/bundle-analyzer` and run before/after comparison.

**Acceptance criteria:**
- [ ] Recharts only loaded on pages that display charts
- [ ] AI library has zero client-side imports
- [ ] Bundle analyzer shows reduction

---

## Phase 6: E2E Testing (P2-P3)

### 6.1 Set Up Playwright

**Why:** 46 unit tests exist but zero E2E tests. The manual test script is 19 sections / 90+ minutes. Automating the critical paths catches integration issues that unit tests miss.

**Steps:**

1. Install Playwright:
```bash
pnpm add -D @playwright/test
npx playwright install
```

2. Create `playwright.config.ts`:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  baseURL: 'http://localhost:3000',
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
});
```

3. Add scripts to `package.json`:
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

4. Create seed data script for test environment (`scripts/seed-test-data.ts`).

### 6.2 Write Critical Path E2E Tests

**Files to create:**
- `e2e/auth.spec.ts` - Registration, login, logout, protected routes
- `e2e/editor.spec.ts` - Create resume, fill sections, save
- `e2e/export.spec.ts` - Export PDF, verify download
- `e2e/dashboard.spec.ts` - List resumes, delete, duplicate
- `e2e/ai-features.spec.ts` - Generate bullets, check credit deduction

**Test scenarios (prioritized):**

1. **Auth flow:** Register -> Verify redirect to onboarding -> Logout -> Login -> Verify dashboard
2. **Resume creation:** Login -> New resume -> Fill personal info -> Add work experience -> Save -> Verify on dashboard
3. **Export:** Login -> Open resume -> Export PDF -> Verify file downloaded
4. **Plan limits:** Login as free user with 3 resumes -> Try to create 4th -> Verify limit dialog

**Acceptance criteria:**
- [ ] 4+ E2E test files covering critical user paths
- [ ] Tests run in CI (add to GitHub Actions workflow)
- [ ] Tests use test-specific Firebase project or mocked backend

---

## Phase 7: Documentation Cleanup (P3)

### 7.1 Update Test Count in CLAUDE.md

**Why:** CLAUDE.md claims "86 test files" but actual count is ~46. Misleading documentation erodes trust.

**File to modify:** `CLAUDE.md`

**Steps:**
1. Run `find . -name "*.test.ts" -o -name "*.test.tsx" | wc -l` to get actual count.
2. Update the reference in CLAUDE.md to match.

---

### 7.2 Remove Stale Documentation

**Why:** `docs/` contains implementation plans and checklists from Dec 2025 that are completed or obsolete (e.g., `AI_SETUP_COMPLETE.md`, `CACHE_SETUP_COMPLETE.md`, `CODE_REVIEW_FIXES.md`).

**Steps:**
1. Audit each file in `docs/`:
   - If it describes completed work, move to `docs/archive/` or delete
   - If it's still relevant, keep
2. Update `docs/README.md` table of contents.

---

## Checklist Summary

| # | Task | Priority | Effort | Status |
|---|------|----------|--------|--------|
| 1.1 | GitHub Actions CI workflow | P0 | 2-3h | [ ] |
| 2.1 | Test fixtures & factories | P1 | 2h | [ ] |
| 2.2 | Test error handler | P1 | 2h | [ ] |
| 2.3 | Test auth middleware | P1 | 2h | [ ] |
| 2.4 | Test credit middleware | P1 | 2h | [ ] |
| 2.5 | Test Firestore service | P1 | 4h | [ ] |
| 2.6 | Test top 5 API routes | P1 | 6-8h | [ ] |
| 3.1 | Extract editor state hook | P1 | 4-6h | [ ] |
| 3.2 | Route-level loading states | P1 | 1-2h | [ ] |
| 3.3 | Fix logging inconsistencies | P2 | 30min | [ ] |
| 3.4 | Batch Firestore deletes | P2 | 1-2h | [ ] |
| 4.1 | Shared template utilities | P2 | 1-2d | [ ] |
| 4.2 | Extract BulletItem component | P2 | 2-3h | [ ] |
| 5.1 | Server Component conversion | P3 | 4-6h | [ ] |
| 5.2 | Lazy-load heavy deps | P3 | 2-3h | [ ] |
| 6.1 | Playwright setup | P2 | 2h | [ ] |
| 6.2 | Critical path E2E tests | P2 | 2-3d | [ ] |
| 7.1 | Update test count in CLAUDE.md | P3 | 10min | [ ] |
| 7.2 | Clean stale docs | P3 | 1h | [ ] |

**Total estimated effort:** ~8-10 developer days

---

## Suggested Sprint Plan

**Sprint 1 (Week 1):** Foundation
- 1.1 CI/CD pipeline
- 2.1 Test fixtures
- 2.2 Error handler tests
- 2.3 Auth middleware tests
- 2.4 Credit middleware tests
- 3.3 Fix logging

**Sprint 2 (Week 2):** Service Coverage
- 2.5 Firestore service tests
- 2.6 API route tests (top 5)
- 3.2 Route-level loading states
- 3.4 Batch Firestore deletes

**Sprint 3 (Week 3):** Architecture
- 3.1 Extract editor state hook
- 4.2 Extract BulletItem
- 6.1 Playwright setup

**Sprint 4 (Week 4):** Polish
- 4.1 Shared template utilities
- 5.1 Server Component conversion
- 5.2 Lazy-load heavy deps
- 6.2 E2E tests
- 7.1 + 7.2 Doc cleanup
