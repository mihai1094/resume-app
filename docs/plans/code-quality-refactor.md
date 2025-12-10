# Code Quality Refactor Plan

This plan enumerates the concrete engineering work required to raise the overall code quality, maintainability, and reliability of the ResumeForge codebase. Tasks below are grouped by track so they can be turned into tickets with clear owners.

## Guiding Goals

- Untangle the resume editor so state, persistence, and UI responsibilities are isolated and testable.
- Harden the data layer (Firestore + local storage) so offline/online states and destructive operations behave predictably.
- Clean up the dashboard and AI-assist flows to remove duplication and fix current type/runtime issues.
- Improve platform foundations (auth, Firebase wiring, routing) so server/client boundaries are respected.
- Restore automated coverage to match the current feature set instead of historic defaults.
- Eliminate all `any` types and establish strict type safety throughout the codebase.

## Snapshot of Current Pain Points

| Issue | Location | Impact |
|-------|----------|--------|
| Monolithic editor | `components/resume/resume-editor.tsx` (766 lines) | Hard to maintain/test |
| Unused hooks | `hooks/use-resume-data-loader.ts`, `hooks/use-resume-editor-state.ts` | Duplication persists |
| Deprecated storage | `hooks/use-local-storage.ts` + `lib/services/storage.ts` | Conflicts with Firestore |
| Firebase SSR issues | `lib/firebase/config.ts:14-26` | Silent failures |
| Type conflicts | `use-optimize-flow.ts` vs `optimize-form.tsx` | TS2719 errors |
| Stale tests | `hooks/__tests__/use-resume.test.ts:9-17` | Regressions slip through |
| 33 `any` types | auth.ts, import.ts, firestore.ts, section-forms.tsx | Type safety holes |
| 67 console statements | Throughout codebase | No production logging |

---

## Track A – Type Safety & Code Quality

### A1. Eliminate `any` Types (33 occurrences)

**Priority: Critical**

#### A1.1 Fix Error Handler Typing
**Files:**
- `lib/services/auth.ts` (9 occurrences)
- `lib/services/firestore.ts:403, 433, 475`

**Current:**
```typescript
} catch (error: any) {
  console.error("Error:", error);
  return { success: false, error: this.getErrorMessage(error.code) };
}
```

**Target:**
```typescript
} catch (error: unknown) {
  const err = error instanceof Error ? error : new Error(String(error));
  const firebaseErr = err as Error & { code?: string };
  console.error("Error:", err);
  return { success: false, error: this.getErrorMessage(firebaseErr.code) };
}
```

- [ ] Create shared error typing utility in `lib/utils/error.ts`
- [ ] Update all catch blocks in `lib/services/auth.ts`
- [ ] Update all catch blocks in `lib/services/firestore.ts`
- [ ] Update catch blocks in `lib/services/import.ts`

#### A1.2 Fix Import Service Type Assertions
**File:** `lib/services/import.ts:451-453`

**Current:**
```typescript
workExperience: (partialData.workExperience || []).map((w: any) => ({
  ...w,
  id: w.id || generateId()
})) as WorkExperience[],
```

**Target:**
```typescript
workExperience: (partialData.workExperience || []).map((w: Partial<WorkExperience>) => ({
  ...createDefaultWorkExperience(),
  ...w,
  id: w.id || generateId()
})),
```

- [ ] Create default factory functions for each resume section type
- [ ] Replace `any` mappings with proper partial types
- [ ] Add runtime validation for imported data

#### A1.3 Fix Component Type Issues
**Files:**
- `components/resume/section-forms.tsx`
- `components/resume/resume-editor.tsx:364`

- [ ] Replace `(result as any)?.code` with discriminated unions
- [ ] Add proper return type annotations

### A2. Resolve Type Inconsistencies

**Priority: High**

#### A2.1 Consolidate ResumeItem Type
**Conflicting definitions:**
- `app/dashboard/hooks/use-optimize-flow.ts:9-20`
- `app/dashboard/components/optimize-dialog/optimize-form.tsx:26-40`

- [ ] Create single source of truth in `lib/types/dashboard.ts`
- [ ] Export and import from single location
- [ ] Update all consumers

#### A2.2 Unify SavedCoverLetter Type
**Conflicting definitions:**
- `hooks/use-saved-cover-letters.ts:5-13`
- `lib/types/cover-letter.ts:1-64`

- [ ] Remove duplicate definition in hook
- [ ] Import from `lib/types/cover-letter.ts`

### A3. Remove ts-ignore and eslint-disable (5 occurrences)

- [ ] Fix underlying issue in `lib/firebase/config.ts:3`
- [ ] Fix underlying issue in `lib/ai/telemetry.ts:1`
- [ ] Fix underlying issue in `components/resume/forms/education-form.tsx:1`
- [ ] Fix underlying issue in `components/resume/forms/work-experience-form.tsx:1`

---

## Track B – Resume Editor Architecture

### B1. Split ResumeEditor Component

**Priority: High**
**Current:** 766 lines handling fetching, auto-save, validation, layout, modals, sharing

**Target Structure:**
```
components/resume/
├── resume-editor.tsx (~200 lines) - Container/orchestrator
├── editor-layout.tsx - Layout and responsive handling
├── editor-sidebar.tsx - Section navigation
├── editor-preview.tsx - Preview panel
├── editor-modals.tsx - All modal components
└── hooks/
    ├── use-editor-persistence.ts - Auto-save, Firestore sync
    ├── use-editor-validation.ts - Form validation
    └── use-editor-navigation.ts - Section routing
```

- [ ] Extract persistence logic into `use-editor-persistence.ts`
- [ ] Extract validation into `use-editor-validation.ts`
- [ ] Extract section navigation into `use-editor-navigation.ts`
- [ ] Create `editor-layout.tsx` for responsive layout
- [ ] Create `editor-sidebar.tsx` for navigation
- [ ] Create `editor-modals.tsx` for all modals
- [ ] Reduce main file to ~200 lines

### B2. Integrate Unused Hooks

**Files:**
- `hooks/use-resume-data-loader.ts:14-116`
- `hooks/use-resume-editor-state.ts:7-49`

- [ ] Replace bespoke initialization in `resume-editor.tsx:139-360`
- [ ] Use dedicated hooks for Firestore vs localStorage conflict resolution
- [ ] Add tests for the hooks

### B3. Fix Section Error Routing

**File:** `components/resume/resume-editor.tsx:420-460`

- [ ] Expand `mapFieldToSection` mapping for all sections
- [ ] Add mappings for languages, courses, hobbies, custom sections
- [ ] Add unit tests for field-to-section mapping

### B4. Replace window.confirm Usages

- [ ] Create shared confirmation dialog component
- [ ] Replace `window.confirm` in `hooks/use-form-array.ts:86-123`
- [ ] Find and replace other `confirm` calls throughout codebase

### B5. Consolidate Import/Export Helpers

**Duplicated in:**
- `components/resume/editor-header.tsx:201-245`
- `app/dashboard/hooks/use-resume-actions.ts:33-96`

- [ ] Create `lib/utils/file-operations.ts`
- [ ] Move file dialog and blob download logic
- [ ] Update both consumers to use shared utility

---

## Track C – Data & Persistence Layer

### C1. Make Firebase Services SSR-Safe

**Priority: Critical**

**File:** `lib/firebase/config.ts:14-26`

- [ ] Update initialization to work on server and client
- [ ] Use lazy `globalThis` guards
- [ ] Make `lib/services/firestore.ts` throw typed errors instead of console.error
- [ ] Create proper error types for Firestore operations

### C2. Remove Deprecated Storage Service

**Priority: High**

**Files:**
- `lib/services/storage.ts:1-153` (deprecated)
- `hooks/use-local-storage.ts:17-90` (depends on deprecated service)

- [ ] Create lightweight browser Storage wrapper
- [ ] Update `use-local-storage.ts` to use new wrapper
- [ ] Document relationship between offline drafts and Firestore
- [ ] Remove or archive deprecated storage.ts

### C3. Add Real-time Subscriptions

**Files:**
- `hooks/use-saved-resumes.ts:20-125`
- `hooks/use-saved-cover-letters.ts:19-180`

- [ ] Convert one-time loads to Firestore listeners
- [ ] Add proper cleanup in useEffect
- [ ] Enable offline draft merging

### C4. Harden Destructive Operations

**File:** `hooks/use-user.ts:150-184`

**Current Issue:** Deletes Firestore data before confirming Firebase Auth allows deletion

- [ ] Reorder: validate credentials first, then delete data
- [ ] Surface errors to UI
- [ ] Add confirmation dialog before account deletion

---

## Track D – Dashboard & AI Workflows

### D1. Fix Optimize Dialog Issues

**Priority: High**

**Files:**
- `app/dashboard/hooks/use-optimize-flow.ts:9-20`
- `app/dashboard/components/optimize-dialog/optimize-form.tsx:26-40`

- [ ] Consolidate `ResumeItem` type (see A2.1)
- [ ] Add cleanup for analysis timeout (`useEffect` with `clearTimeout`)
- [ ] Surface analysis errors to dialog footer
- [ ] Fix memory leak from uncleaned timeouts

### D2. Cache Expensive Scoring

**File:** `app/dashboard/components/resume-card.tsx:76-180`

**Current:** Recomputes `calculateResumeScore` on every render

- [ ] Memoize score calculation with `useMemo`
- [ ] Or precompute scores when resumes are loaded
- [ ] Reuse cached score in `EditorHeader`

### D3. Consolidate User Helpers

**Duplicated in:**
- `components/shared/user-menu.tsx:24-52`
- `app/dashboard/hooks/use-resume-utils.ts:5-24`

- [ ] Create `lib/utils/user.ts`
- [ ] Move initials calculation and avatar logic
- [ ] Update both consumers

### D4. Fix PreviewDialog Scaling

**File:** `app/dashboard/components/preview-dialog.tsx:38-69`

**Current:** Uses `style={{ zoom: 0.6 }}` which is inconsistent across browsers

- [ ] Replace with CSS transform for consistent rendering
- [ ] Pass active template customization to dialog
- [ ] Ensure preview matches editor view

### D5. Clean Up Unused Imports

- [ ] Remove unused `Sparkles` import from `app/dashboard/components/quick-actions.tsx:4-32`
- [ ] Replace inline `router.push` with callbacks where available
- [ ] Run lint to find other unused imports

---

## Track E – Routing, Auth & Platform

### E1. Fix Next.js searchParams Typing

**Files:**
- `app/editor/new/page.tsx:8-32`
- `app/edit/page.tsx:9-24`

**Current:** Treats `searchParams` as promise, forcing unnecessary `await`

- [ ] Update signatures to use `ReadonlyURLSearchParams`
- [ ] Allow pages to remain static when possible

### E2. Refactor AuthGuard/AppHeader

**File:** `components/shared/app-header.tsx:15-52`

**Current:** Invokes `useUser` even when parents already have user data

- [ ] Accept `user` prop to avoid double auth subscription
- [ ] Prevent flashing loaders
- [ ] Update all parent components to pass user

### E3. Create Shared File Input Hook

**Current:** `components/resume/editor-header.tsx:201-245` manually creates file inputs

- [ ] Create `hooks/use-file-input.ts`
- [ ] Encapsulate file input DOM manipulation
- [ ] Reuse in dashboard and editor

---

## Track F – Logging & Observability

### F1. Implement Logging Service

**Priority: Medium**

**Current:** 67 files with raw console statements

- [ ] Create `lib/services/logger.ts`
- [ ] Support log levels (debug, info, warn, error)
- [ ] Environment-based filtering (verbose in dev, errors only in prod)
- [ ] Integration with error tracking (Sentry)

**Example interface:**
```typescript
interface Logger {
  debug(message: string, context?: object): void;
  info(message: string, context?: object): void;
  warn(message: string, context?: object): void;
  error(message: string, error?: Error, context?: object): void;
}
```

- [ ] Replace console.log statements in `lib/ai/cache.ts` (6 occurrences)
- [ ] Replace console statements in `lib/ai/telemetry.ts`
- [ ] Systematically replace remaining console statements

---

## Track G – Testing & Documentation

### G1. Fix Stale Tests

**Priority: Critical**

**File:** `hooks/__tests__/use-resume.test.ts:9-70`

- [ ] Update tests to not expect hard-coded "Jordan" sample data
- [ ] Align fixtures with current hook defaults
- [ ] Add coverage for undo/redo functionality

### G2. Add Missing Test Suites

**Current:** 26 test files for ~260 source files

**Priority tests to add:**
- [ ] `lib/services/__tests__/import.test.ts` - Import service comprehensive tests
- [ ] `lib/services/__tests__/export.test.ts` - Export service (mock PDF generation)
- [ ] `lib/services/__tests__/firestore.test.ts` - Firestore operations
- [ ] `lib/ai/__tests__/cache.test.ts` - AI caching
- [ ] `lib/ai/__tests__/mock-analyzer.test.ts` - Mock AI analyzer
- [ ] `hooks/__tests__/use-editor-persistence.test.ts` - After Track B refactor

### G3. Document Data-Sync Contract

- [ ] Add section to `docs/plans/stability-readiness.md` or create new doc
- [ ] Explain local drafts vs Firestore drafts vs saved resumes
- [ ] Document conflict resolution strategy
- [ ] Add diagrams for data flow

---

## Track H – Incomplete Features

### H1. DOCX Export

**File:** `lib/services/export.ts:350`
**Status:** Disabled with feature flag

- [ ] Implement using `docx` library
- [ ] Add tests
- [ ] Enable feature flag

### H2. Remaining AI Features

**From:** `docs/AI_FEATURES_QUICK_REFERENCE.md`

- [ ] Professional Summary Generator
- [ ] Real ATS Optimization
- [ ] Skill Recommendations
- [ ] Cover Letter Generator (partially done)
- [ ] Real-Time Writing Assistant
- [ ] Achievement Quantifier
- [ ] Interview Prep Generator (partially done)

---

## Implementation Schedule

### Phase 1: Foundation (Critical)
**Focus:** Type safety, stale tests, Firebase SSR

| Track | Task | Est. Effort |
|-------|------|-------------|
| A1 | Eliminate `any` types | 2-3 days |
| A2 | Resolve type inconsistencies | 4 hours |
| G1 | Fix stale tests | 1 day |
| C1 | Make Firebase SSR-safe | 1 day |

### Phase 2: Architecture (High Priority)
**Focus:** Editor refactor, data layer cleanup

| Track | Task | Est. Effort |
|-------|------|-------------|
| B1 | Split ResumeEditor | 3-4 days |
| B2 | Integrate unused hooks | 1 day |
| C2 | Remove deprecated storage | 1-2 days |
| D1 | Fix optimize dialog | 4 hours |

### Phase 3: Polish (Medium Priority)
**Focus:** Performance, UX, consolidation

| Track | Task | Est. Effort |
|-------|------|-------------|
| D2 | Cache scoring | 4 hours |
| D3 | Consolidate helpers | 4 hours |
| B5 | Consolidate import/export | 4 hours |
| E2 | Refactor AppHeader | 4 hours |
| F1 | Implement logging service | 1-2 days |

### Phase 4: Coverage & Features (Lower Priority)
**Focus:** Testing, documentation, new features

| Track | Task | Est. Effort |
|-------|------|-------------|
| G2 | Add missing tests | 1-2 weeks |
| G3 | Document data-sync | 4 hours |
| H1 | DOCX export | 2-3 days |
| H2 | AI features | Varies |

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| `any` type usage | 33 | 0 |
| Console statements | 67 files | 0 (use logger) |
| ts-ignore/eslint-disable | 5 | 0 |
| Test files | 26 | 50+ |
| resume-editor.tsx lines | 766 | <200 |
| Type errors | Multiple | 0 |

---

## Acceptance Criteria (All Tasks)

Each task is complete when:
- [ ] Code changes are implemented
- [ ] Relevant tests pass (new tests added if needed)
- [ ] TypeScript compiles with no errors (`npx tsc --noEmit`)
- [ ] Lint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated if behavior changes

---

## Notes

- Tasks can be worked in parallel across tracks where there are no dependencies
- Phase 1 should be completed before Phase 2 to avoid rework
- Each checkbox should become a ticket with clear owner
- PR reviews should verify acceptance criteria before merging
